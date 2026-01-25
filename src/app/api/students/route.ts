import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth-utils"
import { notifyNewStudent } from "@/lib/notifications"
import { validateStudentData } from "@/lib/validation"
import type { Prisma } from "@prisma/client"

/**
 * GET /api/students - Fetch all students for the organization
 * @query {boolean} active - Filter by active status only
 * @returns {Student[]} Array of students
 * @auth Required
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId } = authResult
    const { searchParams } = new URL(request.url)
    const active = searchParams.get("active") === "true"

    const whereClause: Prisma.StudentWhereInput = {
      organizationId,
      ...(active && { status: "ACTIVE" }),
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
        beltLevel: true,
        createdAt: true,
        emergencyContact: true,
        groups: {
          select: {
            groupId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Transform to include groups as array of IDs and extract guardian from emergencyContact
    const transformedStudents = students.map((student) => {
      let guardian: string | undefined
      if (student.emergencyContact) {
        try {
          const contact = JSON.parse(student.emergencyContact as string)
          guardian = contact.name
        } catch {
          // ignore parse errors
        }
      }
      return {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone,
        status: student.status,
        beltLevel: student.beltLevel,
        createdAt: student.createdAt,
        guardian,
        groups: student.groups.map((g) => g.groupId),
      }
    })

    return NextResponse.json({ students: transformedStudents })
  } catch (error) {
    console.error("Failed to fetch students:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/students - Create a new student
 * @body {string} firstName - Student's first name (required)
 * @body {string} lastName - Student's last name (required)
 * @body {string} email - Student's email (optional)
 * @body {string} phone - Student's phone number (optional)
 * @body {string} beltLevel - Current belt level (optional)
 * @body {object} emergencyContact - Emergency contact info (optional)
 * @body {string} medicalInfo - Medical information (optional)
 * @returns {Student} Created student object
 * @auth Required
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId } = authResult

    const {
      firstName,
      lastName,
      email,
      phone,
      beltLevel,
      emergencyContact,
      medicalInfo,
      guardian, // Simple guardian name field
    } = await request.json()

    // Validate student data
    const validation = validateStudentData({ firstName, lastName, email, phone })
    if (!validation.valid) {
      return NextResponse.json(
        { message: "Validation failed", errors: validation.errors },
        { status: 400 }
      )
    }

    // Build emergency contact - either use provided object or create from guardian name
    let emergencyContactData = null
    if (emergencyContact) {
      emergencyContactData = JSON.stringify(emergencyContact)
    } else if (guardian) {
      emergencyContactData = JSON.stringify({ name: guardian, phone: "", relationship: "Gondviselő" })
    }

    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        beltLevel,
        emergencyContact: emergencyContactData,
        medicalInfo,
        organizationId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
        beltLevel: true,
        createdAt: true,
      },
    })

    // Trigger new student notification (async, don't block response)
    notifyNewStudent(student.id).catch((error) => {
      console.error("Failed to send new student notification:", error)
    })

    return NextResponse.json({ student }, { status: 201 })
  } catch (error) {
    console.error("Failed to create student:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}