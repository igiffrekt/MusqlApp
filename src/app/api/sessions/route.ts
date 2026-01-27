import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth-utils"
import { isValidDate } from "@/lib/validation"
import { checkLicenseLimit, limitExceededResponse } from "@/lib/license-check"

/**
 * GET /api/sessions - Fetch training sessions for the organization
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId } = authResult
    const { searchParams } = new URL(request.url)
    const upcoming = searchParams.get("upcoming") === "true"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    if (startDate && !isValidDate(startDate)) {
      return NextResponse.json(
        { message: "Invalid startDate format" },
        { status: 400 }
      )
    }
    if (endDate && !isValidDate(endDate)) {
      return NextResponse.json(
        { message: "Invalid endDate format" },
        { status: 400 }
      )
    }

    let whereClause: {
      organizationId: string
      startTime?: { gte?: Date; lte?: Date }
    } = {
      organizationId,
    }

    if (upcoming) {
      whereClause.startTime = {
        gte: new Date(),
      }
    }

    if (startDate || endDate) {
      whereClause.startTime = whereClause.startTime || {}
      if (startDate) {
        whereClause.startTime.gte = new Date(startDate)
      }
      if (endDate) {
        whereClause.startTime.lte = new Date(endDate)
      }
    }

    const activeMembers = await prisma.student.count({
      where: {
        organizationId,
        status: "ACTIVE",
      },
    })

    const sessions = await prisma.session.findMany({
      where: whereClause,
      include: {
        trainer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        locationRef: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        _count: {
          select: {
            attendances: {
              where: {
                status: "PRESENT",
              },
            },
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    })

    const sessionsWithMembers = sessions.map(session => ({
      ...session,
      totalMembers: activeMembers,
    }))

    return NextResponse.json({ sessions: sessionsWithMembers, activeMembers })
  } catch (error) {
    console.error("Failed to fetch sessions:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId, user } = authResult

    // Check license limit BEFORE creating
    const limitCheck = await checkLicenseLimit(organizationId, 'sessions')
    if (!limitCheck.allowed) {
      return NextResponse.json(limitExceededResponse(limitCheck), { status: 403 })
    }

    const {
      title,
      description,
      startTime,
      endTime,
      capacity,
      location,
      locationId,
      sessionType,
      isRecurring,
      recurringRule,
    } = await request.json()

    const trainerId = user.id

    if (!title || !startTime || !endTime) {
      return NextResponse.json(
        { message: "Title, start time, and end time are required" },
        { status: 400 }
      )
    }

    const start = new Date(startTime)
    const end = new Date(endTime)

    if (start >= end) {
      return NextResponse.json(
        { message: "End time must be after start time" },
        { status: 400 }
      )
    }

    let locationName = location
    if (locationId) {
      const locationRecord = await prisma.location.findFirst({
        where: { id: locationId, organizationId },
      })
      if (!locationRecord) {
        return NextResponse.json(
          { message: "Helyszín nem található" },
          { status: 400 }
        )
      }
      locationName = locationRecord.name
    }

    const newSession = await prisma.session.create({
      data: {
        title,
        description,
        trainerId,
        organizationId,
        startTime: start,
        endTime: end,
        capacity: capacity || 10,
        locationId: locationId || null,
        location: locationName,
        sessionType: sessionType || "REGULAR",
        isRecurring: isRecurring || false,
        recurringRule: recurringRule ? JSON.stringify(recurringRule) : null,
        status: "SCHEDULED",
      },
      include: {
        trainer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        locationRef: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        _count: {
          select: {
            attendances: {
              where: {
                status: "PRESENT",
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ session: newSession }, { status: 201 })
  } catch (error) {
    console.error("Failed to create session:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
