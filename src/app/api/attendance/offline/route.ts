import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-utils"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId, user } = authResult
    const { sessionId, studentId, status, timestamp } = await request.json()

    if (!sessionId || !studentId || !status) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Verify the session belongs to the organization
    const sessionData = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { organizationId: true }
    })

    if (!sessionData || sessionData.organizationId !== organizationId) {
      return NextResponse.json({ message: "Session not found or unauthorized" }, { status: 404 })
    }

    // Check if attendance already exists
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        sessionId_studentId: {
          sessionId,
          studentId,
        },
      },
    })

    if (existingAttendance) {
      // Update existing attendance
      await prisma.attendance.update({
        where: {
          sessionId_studentId: {
            sessionId,
            studentId,
          },
        },
        data: {
          status,
          checkInTime: new Date(timestamp),
          userId: user.id,
        },
      })
    } else {
      // Create new attendance record
      await prisma.attendance.create({
        data: {
          sessionId,
          studentId,
          userId: user.id,
          status,
          checkInTime: new Date(timestamp),
        },
      })
    }

    return NextResponse.json({ message: "Attendance synced successfully" })
  } catch (error) {
    console.error("Failed to sync attendance:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}