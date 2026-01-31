import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-utils"
import { prisma } from "@/lib/db"

/**
 * GET /api/checkin/terminals/[id]
 * Get a single terminal
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId, user } = authResult

    if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Nincs jogosultság" }, { status: 403 })
    }

    const terminal = await prisma.terminal.findFirst({
      where: { id, organizationId },
      include: {
        location: { select: { id: true, name: true } }
      }
    })

    if (!terminal) {
      return NextResponse.json({ error: "Terminál nem található" }, { status: 404 })
    }

    return NextResponse.json({ terminal })

  } catch (error) {
    console.error("Get terminal error:", error)
    return NextResponse.json({ error: "Szerver hiba" }, { status: 500 })
  }
}

/**
 * PATCH /api/checkin/terminals/[id]
 * Update terminal settings
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId, user } = authResult

    if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Nincs jogosultság" }, { status: 403 })
    }

    // Verify terminal belongs to organization
    const existing = await prisma.terminal.findFirst({
      where: { id, organizationId }
    })

    if (!existing) {
      return NextResponse.json({ error: "Terminál nem található" }, { status: 404 })
    }

    const body = await request.json()
    const { name, locationId, isActive, settings } = body

    // Build update data
    const updateData: any = {}
    
    if (name !== undefined) updateData.name = name
    if (isActive !== undefined) updateData.isActive = isActive
    if (locationId !== undefined) {
      // Verify location if provided
      if (locationId) {
        const location = await prisma.location.findFirst({
          where: { id: locationId, organizationId }
        })
        if (!location) {
          return NextResponse.json({ error: "Helyszín nem található" }, { status: 404 })
        }
      }
      updateData.locationId = locationId || null
    }
    if (settings !== undefined) {
      // Merge settings instead of replacing
      updateData.settings = {
        ...(existing.settings as object || {}),
        ...settings
      }
    }

    const terminal = await prisma.terminal.update({
      where: { id },
      data: updateData,
      include: {
        location: { select: { id: true, name: true } }
      }
    })

    return NextResponse.json({
      terminal: {
        id: terminal.id,
        name: terminal.name,
        deviceId: terminal.deviceId,
        isActive: terminal.isActive,
        location: terminal.location,
        settings: terminal.settings
      }
    })

  } catch (error) {
    console.error("Update terminal error:", error)
    return NextResponse.json({ error: "Szerver hiba" }, { status: 500 })
  }
}

/**
 * DELETE /api/checkin/terminals/[id]
 * Delete a terminal
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId, user } = authResult

    if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Nincs jogosultság" }, { status: 403 })
    }

    // Verify terminal belongs to organization
    const existing = await prisma.terminal.findFirst({
      where: { id, organizationId }
    })

    if (!existing) {
      return NextResponse.json({ error: "Terminál nem található" }, { status: 404 })
    }

    await prisma.terminal.delete({ where: { id } })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Delete terminal error:", error)
    return NextResponse.json({ error: "Szerver hiba" }, { status: 500 })
  }
}
