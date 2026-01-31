import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/**
 * GET /api/checkin/terminal?deviceId=xxx
 * Get terminal info by device ID (for kiosk mode)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get("deviceId")

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID szükséges" },
        { status: 400 }
      )
    }

    const terminal = await prisma.terminal.findUnique({
      where: { deviceId },
      select: {
        id: true,
        name: true,
        deviceId: true,
        isActive: true,
        settings: true,
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!terminal) {
      return NextResponse.json(
        { error: "Terminál nem található" },
        { status: 404 }
      )
    }

    if (!terminal.isActive) {
      return NextResponse.json(
        { error: "Terminál inaktív" },
        { status: 403 }
      )
    }

    // Update last seen
    await prisma.terminal.update({
      where: { deviceId },
      data: { lastSeen: new Date() }
    })

    return NextResponse.json({
      id: terminal.id,
      name: terminal.name,
      deviceId: terminal.deviceId,
      settings: terminal.settings,
      organization: terminal.organization
    })

  } catch (error) {
    console.error("Get terminal error:", error)
    return NextResponse.json(
      { error: "Szerver hiba" },
      { status: 500 }
    )
  }
}
