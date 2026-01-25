import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-utils"
import { prisma } from "@/lib/db"

// Mark notification as read/unread
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const paramsData = await params
    const userId = authResult.user.id
    const { read } = await request.json()

    const notification = await prisma.notification.updateMany({
      where: {
        id: paramsData.id,
        userId, // Ensure user can only modify their own notifications
      },
      data: {
        read: read !== undefined ? read : true,
      },
    })

    if (notification.count === 0) {
      return NextResponse.json({ message: "Notification not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Notification updated" })
  } catch (error) {
    console.error("Failed to update notification:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

// Delete notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const paramsData = await params
    const userId = authResult.user.id

    const notification = await prisma.notification.deleteMany({
      where: {
        id: paramsData.id,
        userId, // Ensure user can only delete their own notifications
      },
    })

    if (notification.count === 0) {
      return NextResponse.json({ message: "Notification not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Notification deleted" })
  } catch (error) {
    console.error("Failed to delete notification:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}