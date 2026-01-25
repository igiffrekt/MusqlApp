import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth-utils"
import { createInAppNotification, sendEmail } from "@/lib/notifications"

/**
 * GET /api/join-requests
 * List pending join requests for organization (admin only)
 */
export async function GET() {
  const authResult = await requireAdmin()
  if (!authResult.success) {
    return authResult.response
  }

  try {
    const joinRequests = await prisma.joinRequest.findMany({
      where: {
        organizationId: authResult.organizationId,
      },
      orderBy: { createdAt: "desc" },
      include: {
        organization: {
          select: { name: true },
        },
      },
    })

    return NextResponse.json(joinRequests)
  } catch (error) {
    console.error("Error fetching join requests:", error)
    return NextResponse.json(
      { message: "Szerver hiba" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/join-requests
 * Create a new join request (public endpoint)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slug, name, email, phone, message } = body

    // Validation
    if (!slug || !name || !email) {
      return NextResponse.json(
        { message: "Szervezet kod, nev es email megadasa kotelezo" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Ervenytelen email cim" },
        { status: 400 }
      )
    }

    // Find organization by slug
    const organization = await prisma.organization.findUnique({
      where: { slug: slug.toLowerCase() },
    })

    if (!organization) {
      return NextResponse.json(
        { message: "Szervezet nem talalhato" },
        { status: 404 }
      )
    }

    // Check if request already exists
    const existingRequest = await prisma.joinRequest.findUnique({
      where: {
        email_organizationId: {
          email: email.toLowerCase(),
          organizationId: organization.id,
        },
      },
    })

    if (existingRequest) {
      if (existingRequest.status === "PENDING") {
        return NextResponse.json(
          { message: "Mar kuldtel csatlakozasi kerelmet ehhez a szervezethez" },
          { status: 400 }
        )
      }
      if (existingRequest.status === "APPROVED") {
        return NextResponse.json(
          { message: "Mar tagja vagy ennek a szervezetnek" },
          { status: 400 }
        )
      }
      // If rejected, allow re-request by updating the existing one
      const updatedRequest = await prisma.joinRequest.update({
        where: { id: existingRequest.id },
        data: {
          name: name.trim(),
          phone: phone?.trim() || null,
          message: message?.trim() || null,
          status: "PENDING",
          processedBy: null,
          processedAt: null,
        },
      })

      // Notify admins
      await notifyAdminsOfJoinRequest(organization.id, name, organization.name)

      return NextResponse.json(
        { message: "Kerelmed sikeresen elkuldte", requestId: updatedRequest.id },
        { status: 201 }
      )
    }

    // Create new join request
    const joinRequest = await prisma.joinRequest.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name.trim(),
        phone: phone?.trim() || null,
        message: message?.trim() || null,
        organizationId: organization.id,
        status: "PENDING",
      },
    })

    // Notify admins
    await notifyAdminsOfJoinRequest(organization.id, name, organization.name)

    return NextResponse.json(
      { message: "Kerelmed sikeresen elkuldte", requestId: joinRequest.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating join request:", error)
    return NextResponse.json(
      { message: "Szerver hiba" },
      { status: 500 }
    )
  }
}

/**
 * Notify all admins of a new join request
 */
async function notifyAdminsOfJoinRequest(
  organizationId: string,
  requesterName: string,
  organizationName: string
) {
  try {
    const admins = await prisma.user.findMany({
      where: {
        organizationId,
        role: { in: ["ADMIN", "SUPER_ADMIN"] },
      },
    })

    for (const admin of admins) {
      // In-app notification (use INFO type, frontend detects join_request by actionUrl)
      await createInAppNotification(
        admin.id,
        "Új csatlakozási kérelem",
        `${requesterName} szeretne csatlakozni a szervezethez`,
        "INFO",
        "/admin/join-requests"
      )

      // Email notification
      if (admin.email) {
        await sendEmail({
          to: admin.email,
          subject: `Új csatlakozási kérelem - ${organizationName}`,
          html: `
            <h2>Új csatlakozási kérelem</h2>
            <p><strong>${requesterName}</strong> szeretne csatlakozni a <strong>${organizationName}</strong> szervezethez.</p>
            <p>Kérlek, tekintsd át a kérelmet az alkalmazásban:</p>
            <p><a href="${process.env.NEXTAUTH_URL}/admin/join-requests">Kérelmek megtekintése</a></p>
          `,
        })
      }
    }
  } catch (error) {
    console.error("Error notifying admins:", error)
    // Don't fail the request if notification fails
  }
}
