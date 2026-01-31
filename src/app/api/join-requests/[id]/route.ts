import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth-utils"
import { sendEmail } from "@/lib/notifications"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/join-requests/[id]
 * Get a specific join request (admin only)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const authResult = await requireAdmin()
  if (!authResult.success) {
    return authResult.response
  }

  const { id } = await params

  try {
    const joinRequest = await prisma.joinRequest.findUnique({
      where: { id },
      include: {
        organization: {
          select: { name: true, slug: true },
        },
      },
    })

    if (!joinRequest) {
      return NextResponse.json(
        { message: "Kerelem nem talalhato" },
        { status: 404 }
      )
    }

    // Check organization access
    if (joinRequest.organizationId !== authResult.organizationId) {
      return NextResponse.json(
        { message: "Nincs jogosultsagod" },
        { status: 403 }
      )
    }

    return NextResponse.json(joinRequest)
  } catch (error) {
    console.error("Error fetching join request:", error)
    return NextResponse.json(
      { message: "Szerver hiba" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/join-requests/[id]
 * Approve or reject a join request (admin only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const authResult = await requireAdmin()
  if (!authResult.success) {
    return authResult.response
  }

  const { id } = await params

  try {
    const body = await request.json()
    const { action } = body // "approve" or "reject"

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { message: "Ervenytelen muvelet" },
        { status: 400 }
      )
    }

    const joinRequest = await prisma.joinRequest.findUnique({
      where: { id },
      include: {
        organization: true,
      },
    })

    if (!joinRequest) {
      return NextResponse.json(
        { message: "Kerelem nem talalhato" },
        { status: 404 }
      )
    }

    // Check organization access
    if (joinRequest.organizationId !== authResult.organizationId) {
      return NextResponse.json(
        { message: "Nincs jogosultsagod" },
        { status: 403 }
      )
    }

    if (joinRequest.status !== "PENDING") {
      return NextResponse.json(
        { message: "Ez a kerelem mar feldolgozasra kerult" },
        { status: 400 }
      )
    }

    if (action === "approve") {
      // Create User with STUDENT role (passwordless - will use magic link)
      const nameParts = joinRequest.name.trim().split(" ")
      const firstName = nameParts[0] || joinRequest.name
      const lastName = nameParts.slice(1).join(" ") || ""

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: joinRequest.email },
      })

      let newUser
      if (existingUser) {
        // User exists, just link them to this organization if not already
        if (existingUser.organizationId !== joinRequest.organizationId) {
          return NextResponse.json(
            { message: "Ez a felhasznalo mar masik szervezethez tartozik" },
            { status: 400 }
          )
        }
        newUser = existingUser
      } else {
        // Create new user
        newUser = await prisma.user.create({
          data: {
            email: joinRequest.email,
            name: joinRequest.name,
            role: "STUDENT",
            organizationId: joinRequest.organizationId,
            // No password - will use magic link
          },
        })
      }

      // Create Student record linked to User
      const existingStudent = await prisma.student.findFirst({
        where: {
          email: joinRequest.email,
          organizationId: joinRequest.organizationId,
        },
      })

      if (!existingStudent) {
        await prisma.student.create({
          data: {
            firstName,
            lastName,
            email: joinRequest.email,
            phone: joinRequest.phone,
            organizationId: joinRequest.organizationId,
            userId: newUser.id,
            status: "ACTIVE",
          },
        })
      } else if (!existingStudent.userId) {
        // Link existing student to user
        await prisma.student.update({
          where: { id: existingStudent.id },
          data: { userId: newUser.id },
        })
      }

      // Update join request status
      await prisma.joinRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          processedBy: authResult.user.id,
          processedAt: new Date(),
        },
      })

      // Send welcome email
      await sendEmail({
        to: joinRequest.email,
        subject: `Csatlakozasod jovahagyva - ${joinRequest.organization?.name || "A szervezet"}`,
        html: `
          <h2>Udvozlunk a ${joinRequest.organization?.name || "A szervezet"} szervezetben!</h2>
          <p>Kedves ${firstName},</p>
          <p>Csatlakozasi kerelmedet jovahagytuk. Most mar bejelentkezhetsz az alkalmazasba.</p>
          <p>Bejelentkezeshez latogass el ide:</p>
          <p><a href="${process.env.NEXTAUTH_URL}/auth/tag/signin">Bejelentkezes</a></p>
          <p>Add meg az email cimedet (${joinRequest.email}) es kuldunk egy bejelentkezo linket.</p>
          <p>Udv,<br>${joinRequest.organization?.name || "A szervezet"}</p>
        `,
      })

      return NextResponse.json({
        message: "Kerelem jovahagyva",
        userId: newUser.id,
      })
    } else {
      // Reject
      await prisma.joinRequest.update({
        where: { id },
        data: {
          status: "REJECTED",
          processedBy: authResult.user.id,
          processedAt: new Date(),
        },
      })

      // Send rejection email
      await sendEmail({
        to: joinRequest.email,
        subject: `Csatlakozasi kerelem - ${joinRequest.organization?.name || "A szervezet"}`,
        html: `
          <h2>Csatlakozasi kerelem</h2>
          <p>Kedves ${joinRequest.name},</p>
          <p>Sajnos a ${joinRequest.organization?.name || "A szervezet"} szervezethez benyujtott csatlakozasi kerelmedet elutasitottuk.</p>
          <p>Ha kerdesed van, kerlek vedd fel a kapcsolatot a szervezettel.</p>
        `,
      })

      return NextResponse.json({ message: "Kerelem elutasitva" })
    }
  } catch (error) {
    console.error("Error processing join request:", error)
    return NextResponse.json(
      { message: "Szerver hiba" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/join-requests/[id]
 * Delete a join request (admin only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const authResult = await requireAdmin()
  if (!authResult.success) {
    return authResult.response
  }

  const { id } = await params

  try {
    const joinRequest = await prisma.joinRequest.findUnique({
      where: { id },
    })

    if (!joinRequest) {
      return NextResponse.json(
        { message: "Kerelem nem talalhato" },
        { status: 404 }
      )
    }

    // Check organization access
    if (joinRequest.organizationId !== authResult.organizationId) {
      return NextResponse.json(
        { message: "Nincs jogosultsagod" },
        { status: 403 }
      )
    }

    await prisma.joinRequest.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Kerelem torolve" })
  } catch (error) {
    console.error("Error deleting join request:", error)
    return NextResponse.json(
      { message: "Szerver hiba" },
      { status: 500 }
    )
  }
}
