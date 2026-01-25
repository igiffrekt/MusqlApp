import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth-utils"

/**
 * GET /api/students/[id]/groups - Get groups for a student
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { id: studentId } = await params
    const { organizationId } = authResult

    // Verify student belongs to organization
    const student = await prisma.student.findFirst({
      where: { id: studentId, organizationId },
    })

    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 })
    }

    const studentGroups = await prisma.studentGroup.findMany({
      where: { studentId },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            dailyFee: true,
            monthlyFee: true,
          },
        },
      },
    })

    const groups = studentGroups.map((sg) => sg.group)

    return NextResponse.json({ groups })
  } catch (error) {
    console.error("Failed to fetch student groups:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/students/[id]/groups - Add student to a group
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { id: studentId } = await params
    const { organizationId } = authResult
    const { groupId } = await request.json()

    if (!groupId) {
      return NextResponse.json({ message: "groupId is required" }, { status: 400 })
    }

    // Verify student belongs to organization
    const student = await prisma.student.findFirst({
      where: { id: studentId, organizationId },
    })

    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 })
    }

    // Verify group belongs to organization
    const group = await prisma.group.findFirst({
      where: { id: groupId, organizationId },
    })

    if (!group) {
      return NextResponse.json({ message: "Group not found" }, { status: 404 })
    }

    // Check if student is already in group
    const existing = await prisma.studentGroup.findUnique({
      where: {
        studentId_groupId: { studentId, groupId },
      },
    })

    if (existing) {
      return NextResponse.json({ message: "Student already in group" }, { status: 200 })
    }

    // Add student to group
    const studentGroup = await prisma.studentGroup.create({
      data: {
        studentId,
        groupId,
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({ studentGroup }, { status: 201 })
  } catch (error) {
    console.error("Failed to add student to group:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/students/[id]/groups - Remove student from a group
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { id: studentId } = await params
    const { organizationId } = authResult
    const { groupId } = await request.json()

    if (!groupId) {
      return NextResponse.json({ message: "groupId is required" }, { status: 400 })
    }

    // Verify student belongs to organization
    const student = await prisma.student.findFirst({
      where: { id: studentId, organizationId },
    })

    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 })
    }

    // Delete the student-group relationship
    await prisma.studentGroup.deleteMany({
      where: { studentId, groupId },
    })

    return NextResponse.json({ message: "Student removed from group" })
  } catch (error) {
    console.error("Failed to remove student from group:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
