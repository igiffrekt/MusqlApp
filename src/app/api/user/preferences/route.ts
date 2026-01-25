import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-utils"
import { prisma } from "@/lib/db"

// Update user preferences
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const userId = authResult.user.id
    const { notificationPreferences } = await request.json()

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        notificationPreferences: notificationPreferences || {},
      },
      select: {
        id: true,
        notificationPreferences: true,
      },
    })

    return NextResponse.json({
      message: "Preferences updated successfully",
      preferences: updatedUser.notificationPreferences,
    })
  } catch (error) {
    console.error("Failed to update user preferences:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

// Get user preferences
export async function GET() {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const userId = authResult.user.id

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        notificationPreferences: true,
      },
    })

    return NextResponse.json({
      preferences: user?.notificationPreferences || {},
    })
  } catch (error) {
    console.error("Failed to get user preferences:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}