import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth-utils"

export async function POST(
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

    // Update the notification to mark it as shown
    await prisma.notification.update({
      where: {
        id: paramsData.id,
        userId, // Ensure user owns this notification
      },
      data: {
        shownAsPopup: true,
        read: true, // Also mark as read
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to mark notification as shown:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
