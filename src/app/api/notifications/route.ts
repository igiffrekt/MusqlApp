import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-utils"
import { prisma } from "@/lib/db"
import { createInAppNotification } from "@/lib/notifications"

// Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { user } = authResult
    const userId = user.id
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get("unread") === "true"
    const limit = parseInt(searchParams.get("limit") || "50")

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { read: false }),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    })

    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    })

    return NextResponse.json({
      notifications,
      unreadCount,
    })
  } catch (error) {
    console.error("Failed to fetch notifications:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

// Create a notification
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { user } = authResult
    const { type, title, message, userId, actionUrl } = await request.json()

    // Allow admins to create notifications for any user in their organization
    const targetUserId = user.role === "ADMIN" || user.role === "SUPER_ADMIN" ? userId : user.id

    if (!targetUserId) {
      return NextResponse.json({ message: "Invalid user" }, { status: 400 })
    }

    const notification = await createInAppNotification(
      targetUserId,
      title,
      message,
      type || "info",
      actionUrl
    )

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    console.error("Failed to create notification:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}