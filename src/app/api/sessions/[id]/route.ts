import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth-utils"

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

    const sessionData = await prisma.session.findFirst({
      where: {
        id: paramsData.id,
        organizationId,
      },
      include: {
        trainer: {
          select: {
            name: true,
          },
        },
        locationRef: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
          },
        },
        attendances: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            attendances: true,
          },
        },
      },
    })

    if (!sessionData) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 })
    }

    return NextResponse.json({ session: sessionData })
  } catch (error) {
    console.error("Failed to fetch session:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

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
    const { organizationId } = authResult

    const {
      title,
      description,
      startTime,
      endTime,
      capacity,
      location,
      sessionType,
      status,
      isRecurring,
      recurringRule,
    } = await request.json()

    // Validate time logic if times are provided
    let start: Date | undefined
    let end: Date | undefined

    if (startTime && endTime) {
      start = new Date(startTime)
      end = new Date(endTime)

      if (start >= end) {
        return NextResponse.json(
          { message: "End time must be after start time" },
          { status: 400 }
        )
      }
    }

    const updatedSession = await prisma.session.update({
      where: {
        id: paramsData.id,
        organizationId,
      },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(startTime && { startTime: start }),
        ...(endTime && { endTime: end }),
        ...(capacity && { capacity }),
        ...(location !== undefined && { location }),
        ...(sessionType && { sessionType }),
        ...(status && { status }),
        ...(isRecurring !== undefined && { isRecurring }),
        ...(recurringRule !== undefined && { recurringRule: recurringRule ? JSON.stringify(recurringRule) : null }),
      },
      include: {
        trainer: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            attendances: true,
          },
        },
      },
    })

    return NextResponse.json({ session: updatedSession })
  } catch (error) {
    console.error("Failed to update session:", error)
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
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const paramsData = await params
    const { organizationId } = authResult

    // Check if session has attendances
    const sessionToDelete = await prisma.session.findFirst({
      where: {
        id: paramsData.id,
        organizationId,
      },
      include: {
        _count: {
          select: {
            attendances: true,
          },
        },
      },
    })

    if (!sessionToDelete) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 })
    }

    // Prevent deletion if session has attendances
    if (sessionToDelete._count.attendances > 0) {
      return NextResponse.json(
        { message: "Cannot delete session with existing attendances" },
        { status: 400 }
      )
    }

    await prisma.session.delete({
      where: {
        id: paramsData.id,
        organizationId,
      },
    })

    return NextResponse.json({ message: "Session deleted successfully" })
  } catch (error) {
    console.error("Failed to delete session:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}