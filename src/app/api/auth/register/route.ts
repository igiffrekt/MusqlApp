import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { validateRegistrationData } from "@/lib/validation"
import { generateSlug } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, organizationName } = body

    // Validate input with comprehensive checks
    const validation = validateRegistrationData({ name, email, password, organizationName })
    if (!validation.valid) {
      return NextResponse.json(
        { message: "Validation failed", errors: validation.errors },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Generate unique slug for organization
    const baseSlug = generateSlug(organizationName)
    let slug = baseSlug
    let counter = 1
    while (await prisma.organization.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
        slug,
        licenseTier: "STARTER",
        subscriptionStatus: "TRIAL",
      }
    })

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
        organizationId: organization.id,
      }
    })

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          organization: organization.name,
          organizationSlug: organization.slug
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}