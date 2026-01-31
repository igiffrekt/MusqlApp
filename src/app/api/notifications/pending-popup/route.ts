import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth-utils"

export async function GET() {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const userId = authResult.user.id

    // Find the first notification that hasn't been shown as popup
    const notification = await prisma.notification.findFirst({
      where: {
        userId,
        shownAsPopup: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ notification })
  } catch (error) {
    console.error("Failed to fetch pending notification:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
