import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth-utils"

// DELETE /api/groups/[id]/students/[studentId] - Remove a student from a group
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; studentId: string }> }
) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId } = authResult
    const { id: groupId, studentId } = await params

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

    // Remove student from group
    await prisma.studentGroup.delete({
      where: {
        studentId_groupId: { studentId, groupId }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to remove student from group:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
