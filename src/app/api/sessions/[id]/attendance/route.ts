import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth-utils"
import { notifyAttendanceMarked } from "@/lib/notifications"

// Bulk save/update attendance for a session
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const paramsData = await params
    const { organizationId, user } = authResult
    const { attendance } = await request.json() as {
      attendance: Array<{ studentId: string; status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED" }>
    }

    if (!Array.isArray(attendance)) {
      return NextResponse.json({ message: "attendance must be an array" }, { status: 400 })
    }

    // Verify session belongs to organization
    const session = await prisma.session.findFirst({
      where: {
        id: paramsData.id,
        organizationId,
      },
    })

    if (!session) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 })
    }

    // Upsert all attendance records
    const results = await Promise.all(
      attendance.map(async (record) => {
        // Verify student belongs to organization
        const student = await prisma.student.findFirst({
          where: {
            id: record.studentId,
            organizationId,
          },
        })

        if (!student) {
          return { studentId: record.studentId, error: "Student not found" }
        }

        const upserted = await prisma.attendance.upsert({
          where: {
            sessionId_studentId: {
              sessionId: paramsData.id,
              studentId: record.studentId,
            },
          },
          update: {
            status: record.status,
            checkInTime: record.status === "PRESENT" ? new Date() : null,
          },
          create: {
            sessionId: paramsData.id,
            studentId: record.studentId,
            userId: user.id,
            status: record.status,
            checkInTime: record.status === "PRESENT" ? new Date() : null,
          },
          include: {
            student: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        })

        return upserted
      })
    )

    return NextResponse.json({ attendance: results })
  } catch (error) {
    console.error("Failed to bulk save attendance:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(
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

    // Verify session belongs to organization
    const session = await prisma.session.findFirst({
      where: {
        id: paramsData.id,
        organizationId,
      },
    })

    if (!session) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 })
    }

    const attendance = await prisma.attendance.findMany({
      where: {
        sessionId: paramsData.id,
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            beltLevel: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return NextResponse.json({ attendance })
  } catch (error) {
    console.error("Failed to fetch attendance:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

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
    const { organizationId, user } = authResult
    const { studentId, status } = await request.json()

    // Verify session belongs to organization
    const session = await prisma.session.findFirst({
      where: {
        id: paramsData.id,
        organizationId,
      },
    })

    if (!session) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 })
    }

    // Verify student belongs to organization
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        organizationId,
      },
    })

    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 })
    }

    // Check if attendance already exists
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        sessionId_studentId: {
          sessionId: paramsData.id,
          studentId,
        },
      },
    })

    if (existingAttendance) {
      return NextResponse.json(
        { message: "Attendance already marked for this student" },
        { status: 400 }
      )
    }

    const attendance = await prisma.attendance.create({
      data: {
        sessionId: paramsData.id,
        studentId,
        userId: user.id,
        status: status || "PRESENT",
        checkInTime: status === "PRESENT" ? new Date() : null,
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            beltLevel: true,
          },
        },
      },
    })

    // Trigger attendance notification (async, don't block response)
    notifyAttendanceMarked(paramsData.id, studentId, status || "PRESENT").catch((error) => {
      console.error("Failed to send attendance notification:", error)
    })

    return NextResponse.json({ attendance }, { status: 201 })
  } catch (error) {
    console.error("Failed to mark attendance:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}