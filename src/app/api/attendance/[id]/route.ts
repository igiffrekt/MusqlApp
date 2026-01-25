import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionAuth = await auth()
    const paramsData = await params
    const { id } = paramsData

    if (!sessionAuth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const organizationId = sessionAuth.user?.organizationId
    const { status, checkInTime, notes } = await request.json()

    // Find attendance and verify it belongs to user's organization
    const attendance = await prisma.attendance.findFirst({
      where: {
        id: paramsData.id,
        session: {
          organizationId,
        },
      },
      include: {
        session: true,
      },
    })

    if (!attendance) {
      return NextResponse.json({ message: "Attendance record not found" }, { status: 404 })
    }

    const updatedAttendance = await prisma.attendance.update({
      where: {
        id: paramsData.id,
      },
      data: {
        status,
        checkInTime: status === "PRESENT" && !attendance.checkInTime ? new Date() : checkInTime ? new Date(checkInTime) : attendance.checkInTime,
        notes,
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

    return NextResponse.json({ attendance: updatedAttendance })
  } catch (error) {
    console.error("Failed to update attendance:", error)
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
    const sessionAuth = await auth()
    const paramsData = await params
    const { id } = paramsData

    if (!sessionAuth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const organizationId = sessionAuth.user?.organizationId

    // Find attendance and verify it belongs to user's organization
    const attendance = await prisma.attendance.findFirst({
      where: {
        id: paramsData.id,
        session: {
          organizationId,
        },
      },
    })

    if (!attendance) {
      return NextResponse.json({ message: "Attendance record not found" }, { status: 404 })
    }

    await prisma.attendance.delete({
      where: {
        id: paramsData.id,
      },
    })

    return NextResponse.json({ message: "Attendance record deleted successfully" })
  } catch (error) {
    console.error("Failed to delete attendance:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}