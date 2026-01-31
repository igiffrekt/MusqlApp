import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import jwt from "jsonwebtoken"
import type { CheckInStatus, CheckInMethod } from "@prisma/client"

const CHECKIN_SECRET = process.env.CHECKIN_JWT_SECRET || process.env.NEXTAUTH_SECRET || "checkin-secret"

// Token payload type
interface CheckInTokenPayload {
  studentId: string
  organizationId: string
  type: "checkin"
  iat: number
  exp: number
}

interface ValidateRequest {
  token: string
  terminalId?: string
  method?: CheckInMethod
}

interface ValidateResponse {
  valid: boolean
  status: CheckInStatus
  student?: {
    id: string
    firstName: string
    lastName: string
    photo: string | null
    beltLevel: string | null
  }
  checkInId?: string
  reason?: string
}

/**
 * POST /api/checkin/validate
 * Validates a check-in token and creates a check-in record
 * 
 * Can be called by:
 * - Kiosk terminal (with terminalId)
 * - Manual check-in (by admin/trainer)
 */
export async function POST(request: Request) {
  try {
    const body: ValidateRequest = await request.json()
    const { token, terminalId, method = "QR_CODE" } = body

    if (!token) {
      return NextResponse.json(
        { valid: false, status: "DENIED_NO_ACCESS", reason: "Token hiányzik" },
        { status: 400 }
      )
    }

    // Verify JWT token
    let payload: CheckInTokenPayload
    try {
      payload = jwt.verify(token, CHECKIN_SECRET) as CheckInTokenPayload
    } catch (err) {
      const reason = err instanceof jwt.TokenExpiredError 
        ? "Token lejárt" 
        : "Érvénytelen token"
      
      return NextResponse.json({
        valid: false,
        status: "DENIED_EXPIRED" as CheckInStatus,
        reason
      })
    }

    // Verify token type
    if (payload.type !== "checkin") {
      return NextResponse.json({
        valid: false,
        status: "DENIED_NO_ACCESS" as CheckInStatus,
        reason: "Érvénytelen token típus"
      })
    }

    // Get student with membership info
    const student = await prisma.student.findUnique({
      where: { id: payload.studentId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        photo: true,
        beltLevel: true,
        status: true,
        organizationId: true
      }
    })

    if (!student) {
      return NextResponse.json({
        valid: false,
        status: "DENIED_NO_ACCESS" as CheckInStatus,
        reason: "Tag nem található"
      })
    }

    // Check if student belongs to the organization in the token
    if (student.organizationId !== payload.organizationId) {
      return NextResponse.json({
        valid: false,
        status: "DENIED_NO_ACCESS" as CheckInStatus,
        reason: "Tag nem tartozik ehhez a szervezethez"
      })
    }

    // Check student status
    if (student.status !== "ACTIVE") {
      return NextResponse.json({
        valid: false,
        status: "DENIED_INACTIVE" as CheckInStatus,
        reason: "A tagság nem aktív",
        student: {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          photo: student.photo,
          beltLevel: student.beltLevel
        }
      })
    }

    // Check for active payment plan (separate query)
    const activePlan = await prisma.paymentPlan.findFirst({
      where: {
        studentId: student.id,
        endDate: { gte: new Date() }
      },
      orderBy: { endDate: "desc" },
      select: { endDate: true }
    })

    // If there are payment plans but none are active, check-in is still allowed
    // We only deny if they have a plan that explicitly expired
    // (This is a business decision - some gyms may want stricter rules)

    // If terminal is provided, check opening hours
    if (terminalId) {
      const terminal = await prisma.terminal.findUnique({
        where: { id: terminalId },
        select: { 
          settings: true, 
          isActive: true,
          organizationId: true 
        }
      })

      if (!terminal || !terminal.isActive) {
        return NextResponse.json({
          valid: false,
          status: "DENIED_NO_ACCESS" as CheckInStatus,
          reason: "Terminál nem aktív"
        })
      }

      // Verify terminal belongs to same organization
      if (terminal.organizationId !== payload.organizationId) {
        return NextResponse.json({
          valid: false,
          status: "DENIED_NO_ACCESS" as CheckInStatus,
          reason: "Terminál más szervezethez tartozik"
        })
      }

      // Check opening hours if configured
      const settings = terminal.settings as { openingHours?: Record<string, { open: string, close: string }> } | null
      if (settings?.openingHours) {
        const now = new Date()
        const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
        const today = dayNames[now.getDay()]
        const hours = settings.openingHours[today]
        
        if (hours) {
          const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
          if (currentTime < hours.open || currentTime > hours.close) {
            return NextResponse.json({
              valid: false,
              status: "DENIED_OUTSIDE_HOURS" as CheckInStatus,
              reason: `Nyitvatartáson kívül (${hours.open} - ${hours.close})`,
              student: {
                id: student.id,
                firstName: student.firstName,
                lastName: student.lastName,
                photo: student.photo,
                beltLevel: student.beltLevel
              }
            })
          }
        }
      }

      // Update terminal last seen
      await prisma.terminal.update({
        where: { id: terminalId },
        data: { lastSeen: new Date() }
      })
    }

    // Create check-in record
    const checkIn = await prisma.checkIn.create({
      data: {
        studentId: student.id,
        organizationId: payload.organizationId,
        terminalId: terminalId || null,
        method,
        status: "SUCCESS"
      }
    })

    // Return success response
    const response: ValidateResponse = {
      valid: true,
      status: "SUCCESS",
      checkInId: checkIn.id,
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        photo: student.photo,
        beltLevel: student.beltLevel
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error("Validate token error:", error)
    return NextResponse.json(
      { valid: false, status: "DENIED_NO_ACCESS", reason: "Szerver hiba" },
      { status: 500 }
    )
  }
}
