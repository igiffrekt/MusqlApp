import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth-utils"
import { isValidEmail } from "@/lib/validation"

export async function GET() {
  try {
    const authResult = await requireAdmin()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId } = authResult

    const users = await prisma.user.findMany({
      where: {
        organizationId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId } = authResult
    const { name, email, role } = await request.json()

    // Validate email
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { message: "Valid email is required" },
        { status: 400 }
      )
    }

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      )
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: role || "STUDENT",
        organizationId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error("Failed to create user:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}