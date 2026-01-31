import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-utils"
import { prisma } from "@/lib/db"
import { randomBytes } from "crypto"

/**
 * GET /api/checkin/terminals
 * Returns all terminals for the organization
 */
export async function GET() {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId, user } = authResult

    // Only admins can manage terminals
    if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json(
        { error: "Nincs jogosultság" },
        { status: 403 }
      )
    }

    const terminals = await prisma.terminal.findMany({
      where: { organizationId },
      include: {
        location: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            checkIns: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Get today's check-in counts
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayCounts = await prisma.checkIn.groupBy({
      by: ["terminalId"],
      where: {
        organizationId,
        createdAt: { gte: today },
        terminalId: { not: null }
      },
      _count: true
    })

    const todayCountMap = todayCounts.reduce((acc, c) => {
      if (c.terminalId) acc[c.terminalId] = c._count
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      terminals: terminals.map(t => ({
        id: t.id,
        name: t.name,
        deviceId: t.deviceId,
        isActive: t.isActive,
        lastSeen: t.lastSeen,
        settings: t.settings,
        location: t.location,
        totalCheckIns: t._count.checkIns,
        todayCheckIns: todayCountMap[t.id] || 0,
        createdAt: t.createdAt
      }))
    })

  } catch (error) {
    console.error("Get terminals error:", error)
    return NextResponse.json(
      { error: "Nem sikerült lekérni a terminálokat" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/checkin/terminals
 * Creates a new terminal
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId, user } = authResult

    // Only admins can create terminals
    if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json(
        { error: "Nincs jogosultság" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, locationId, settings } = body

    if (!name) {
      return NextResponse.json(
        { error: "A név megadása kötelező" },
        { status: 400 }
      )
    }

    // Generate unique device ID
    const deviceId = `TRM-${randomBytes(8).toString("hex").toUpperCase()}`

    // Verify location belongs to organization if provided
    if (locationId) {
      const location = await prisma.location.findFirst({
        where: { id: locationId, organizationId }
      })
      if (!location) {
        return NextResponse.json(
          { error: "Helyszín nem található" },
          { status: 404 }
        )
      }
    }

    const terminal = await prisma.terminal.create({
      data: {
        name,
        organizationId,
        locationId: locationId || null,
        deviceId,
        settings: settings || null,
        isActive: true
      },
      include: {
        location: {
          select: { id: true, name: true }
        }
      }
    })

    return NextResponse.json({
      terminal: {
        id: terminal.id,
        name: terminal.name,
        deviceId: terminal.deviceId,
        isActive: terminal.isActive,
        location: terminal.location,
        settings: terminal.settings,
        createdAt: terminal.createdAt
      }
    }, { status: 201 })

  } catch (error) {
    console.error("Create terminal error:", error)
    return NextResponse.json(
      { error: "Nem sikerült létrehozni a terminált" },
      { status: 500 }
    )
  }
}
