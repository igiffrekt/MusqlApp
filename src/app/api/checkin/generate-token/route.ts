import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-utils"
import jwt from "jsonwebtoken"

const CHECKIN_SECRET = process.env.CHECKIN_JWT_SECRET || process.env.NEXTAUTH_SECRET || "checkin-secret"
const TOKEN_EXPIRY = 60 // 60 seconds

export interface CheckInTokenPayload {
  studentId: string
  organizationId: string
  type: "checkin"
  iat: number
  exp: number
}

/**
 * POST /api/checkin/generate-token
 * Generates a time-limited JWT token for QR code check-in
 * 
 * For students: uses their linked studentId
 * For admins: can generate token for any student (pass studentId in body)
 */
export async function POST(request: Request) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId, user } = authResult
    let studentId: string | null = null

    // If user is a student, get their studentId
    if (user.role === "STUDENT") {
      // Need to find the student record linked to this user
      const { prisma } = await import("@/lib/db")
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
        select: { id: true, status: true }
      })

      if (!student) {
        return NextResponse.json(
          { error: "Nincs hozzárendelt tag profil" },
          { status: 404 }
        )
      }

      if (student.status !== "ACTIVE") {
        return NextResponse.json(
          { error: "A tagság nem aktív" },
          { status: 403 }
        )
      }

      studentId = student.id
    } else {
      // Admin/Trainer can generate for specific student
      const body = await request.json().catch(() => ({}))
      studentId = body.studentId

      if (!studentId) {
        return NextResponse.json(
          { error: "studentId szükséges" },
          { status: 400 }
        )
      }

      // Verify student belongs to organization
      const { prisma } = await import("@/lib/db")
      const student = await prisma.student.findFirst({
        where: { 
          id: studentId,
          organizationId 
        },
        select: { id: true, status: true }
      })

      if (!student) {
        return NextResponse.json(
          { error: "Tag nem található" },
          { status: 404 }
        )
      }
    }

    // Generate JWT token
    const now = Math.floor(Date.now() / 1000)
    const payload: CheckInTokenPayload = {
      studentId,
      organizationId,
      type: "checkin",
      iat: now,
      exp: now + TOKEN_EXPIRY
    }

    const token = jwt.sign(payload, CHECKIN_SECRET, {
      algorithm: "HS256"
    })

    return NextResponse.json({
      token,
      expiresAt: new Date((now + TOKEN_EXPIRY) * 1000).toISOString(),
      expiresIn: TOKEN_EXPIRY
    })

  } catch (error) {
    console.error("Generate token error:", error)
    return NextResponse.json(
      { error: "Nem sikerült létrehozni a tokent" },
      { status: 500 }
    )
  }
}
