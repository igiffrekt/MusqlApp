import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth-utils"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin()
    if (!authResult.success) {
      return authResult.response
    }

    const paramsData = await params
    const { organizationId } = authResult
    const { name, email, role } = await request.json()

    const user = await prisma.user.update({
      where: {
        id: paramsData.id,
        organizationId, // Ensure user belongs to the same organization
      },
      data: {
        name,
        email,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Failed to update user:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin()
    if (!authResult.success) {
      return authResult.response
    }

    const paramsData = await params
    const { organizationId, user } = authResult

    // Prevent deleting the current user
    if (paramsData.id === user.id) {
      return NextResponse.json(
        { message: "Cannot delete your own account" },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: {
        id: paramsData.id,
        organizationId, // Ensure user belongs to the same organization
      },
    })

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Failed to delete user:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}