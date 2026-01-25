import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth-utils"

// POST /api/groups/[id]/students - Add a student to a group
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId } = authResult
    const { id: groupId } = await params
    const { studentId } = await request.json()

    if (!studentId) {
      return NextResponse.json(
        { message: "Student ID is required" },
        { status: 400 }
      )
    }

    // Verify the group belongs to the organization
    const group = await prisma.group.findFirst({
      where: { id: groupId, organizationId }
    })

    if (!group) {
      return NextResponse.json(
        { message: "Group not found" },
        { status: 404 }
      )
    }

    // Verify the student belongs to the organization
    const student = await prisma.student.findFirst({
      where: { id: studentId, organizationId }
    })

    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      )
    }

    // Check if already in group
    const existing = await prisma.studentGroup.findUnique({
      where: {
        studentId_groupId: { studentId, groupId }
      }
    })

    if (existing) {
      return NextResponse.json(
        { message: "Student already in group" },
        { status: 400 }
      )
    }

    // Add student to group
    await prisma.studentGroup.create({
      data: { studentId, groupId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to add student to group:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
