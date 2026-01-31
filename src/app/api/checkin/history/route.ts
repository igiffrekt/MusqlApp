import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-utils"
import { prisma } from "@/lib/db"

/**
 * GET /api/checkin/history
 * Returns check-in history for the organization
 * 
 * Query params:
 * - from: Start date (ISO string)
 * - to: End date (ISO string)
 * - studentId: Filter by student (optional)
 * - terminalId: Filter by terminal (optional)
 * - status: Filter by status (optional)
 * - limit: Max records to return (default 100)
 * - offset: Pagination offset (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId, user } = authResult

    // Only admins and trainers can view history
    if (!["ADMIN", "TRAINER", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json(
        { error: "Nincs jogosultság" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const studentId = searchParams.get("studentId")
    const terminalId = searchParams.get("terminalId")
    const status = searchParams.get("status")
    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 500)
    const offset = parseInt(searchParams.get("offset") || "0")

    // Build where clause
    const where: any = {
      organizationId
    }

    if (from || to) {
      where.createdAt = {}
      if (from) where.createdAt.gte = new Date(from)
      if (to) where.createdAt.lte = new Date(to)
    }

    if (studentId) {
      where.studentId = studentId
    }

    if (terminalId) {
      where.terminalId = terminalId
    }

    if (status) {
      where.status = status
    }

    // Get check-ins with related data
    const [checkIns, total] = await Promise.all([
      prisma.checkIn.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              photo: true
            }
          },
          terminal: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset
      }),
      prisma.checkIn.count({ where })
    ])

    // Get stats for the period
    const stats = await prisma.checkIn.groupBy({
      by: ["status"],
      where,
      _count: true
    })

    const statsMap = stats.reduce((acc, s) => {
      acc[s.status] = s._count
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      checkIns: checkIns.map(c => ({
        id: c.id,
        createdAt: c.createdAt,
        method: c.method,
        status: c.status,
        note: c.note,
        student: c.student ? {
          id: c.student.id,
          name: `${c.student.firstName} ${c.student.lastName}`,
          photo: c.student.photo
        } : null,
        terminal: c.terminal ? {
          id: c.terminal.id,
          name: c.terminal.name
        } : null
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      stats: {
        total,
        successful: statsMap["SUCCESS"] || 0,
        denied: total - (statsMap["SUCCESS"] || 0)
      }
    })

  } catch (error) {
    console.error("Check-in history error:", error)
    return NextResponse.json(
      { error: "Nem sikerült lekérni a belépési naplót" },
      { status: 500 }
    )
  }
}
