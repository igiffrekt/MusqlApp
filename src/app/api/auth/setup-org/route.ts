import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { generateSlug } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user already has an organization
    const existingUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, organizationId: true },
    })

    if (!existingUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    if (existingUser.organizationId) {
      return NextResponse.json(
        { message: "User already has an organization" },
        { status: 400 }
      )
    }

    const { organizationName } = await request.json()

    if (!organizationName || typeof organizationName !== "string" || !organizationName.trim()) {
      return NextResponse.json(
        { message: "Szervezet neve kötelező" },
        { status: 400 }
      )
    }

    // Generate unique slug
    const baseSlug = generateSlug(organizationName)
    let slug = baseSlug
    let counter = 1
    while (await prisma.organization.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Create organization and update user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: organizationName.trim(),
          slug,
          licenseTier: "STARTER",
          subscriptionStatus: "TRIAL",
        },
      })

      await tx.user.update({
        where: { id: existingUser.id },
        data: {
          organizationId: organization.id,
          role: "ADMIN",
        },
      })

      return organization
    })

    return NextResponse.json({
      message: "Organization created",
      organization: {
        id: result.id,
        name: result.name,
        slug: result.slug,
      },
    })
  } catch (error) {
    console.error("Setup org error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
