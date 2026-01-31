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
    const { organizationId } = authResult
    const { title, message, type = "INFO" } = await request.json()

    if (!title || !message) {
      return NextResponse.json(
        { message: "Title and message are required" },
        { status: 400 }
      )
    }

    // Find the student
    const student = await prisma.student.findFirst({
      where: {
        id: paramsData.id,
        organizationId,
      },
      select: {
        id: true,
        userId: true,
        firstName: true,
        lastName: true,
      },
    })

    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 })
    }

    if (!student.userId) {
      return NextResponse.json(
        { message: "A tagnak nincs felhasználói fiókja az értesítések fogadásához" },
        { status: 400 }
      )
    }

    // Create notification for the student's user account
    const notification = await prisma.notification.create({
      data: {
        userId: student.userId,
        title,
        message,
        type,
        read: false,
        shownAsPopup: false,
      },
    })

    return NextResponse.json({
      success: true,
      notification,
      message: `Értesítés elküldve: ${student.firstName} ${student.lastName}`,
    })
  } catch (error) {
    console.error("Failed to send notification:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
