import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth-utils"

/**
 * POST /api/checkin/manual
 * Manual check-in by admin/trainer
 */
export async function POST(request: Request) {
  try {
    // Require admin or trainer auth
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId, user } = authResult

    // Only admins and trainers can do manual check-ins
    if (user.role !== "ADMIN" && user.role !== "TRAINER" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Nincs jogosultságod manuális beléptetéshez" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { studentId, note } = body

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID szükséges" },
        { status: 400 }
      )
    }

    // Verify student belongs to same organization
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        photo: true,
        status: true,
        organizationId: true
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: "Tag nem található" },
        { status: 404 }
      )
    }

    if (student.organizationId !== organizationId) {
      return NextResponse.json(
        { error: "Tag nem tartozik ehhez a szervezethez" },
        { status: 403 }
      )
    }

    // Check if student is active
    if (student.status !== "ACTIVE") {
      return NextResponse.json({
        success: false,
        error: "A tag nem aktív",
        student: {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName
        }
      })
    }

    // Create manual check-in record
    const checkIn = await prisma.checkIn.create({
      data: {
        studentId: student.id,
        organizationId,
        method: "MANUAL",
        status: "SUCCESS",
        note: note || null
      }
    })

    return NextResponse.json({
      success: true,
      checkInId: checkIn.id,
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        photo: student.photo
      }
    })

  } catch (error) {
    console.error("Manual check-in error:", error)
    return NextResponse.json(
      { error: "Szerver hiba" },
      { status: 500 }
    )
  }
}
