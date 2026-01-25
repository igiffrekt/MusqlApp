import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth-utils"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const paramsData = await params
    const { organizationId } = authResult

    const student = await prisma.student.findFirst({
      where: {
        id: paramsData.id,
        organizationId,
      },
      include: {
        attendances: {
          include: {
            session: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        payments: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
      },
    })

    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 })
    }

    return NextResponse.json({ student })
  } catch (error) {
    console.error("Failed to fetch student:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const paramsData = await params
    const { organizationId } = authResult

    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      address,
      beltLevel,
      status,
      emergencyContact,
      medicalInfo
    } = await request.json()

    const student = await prisma.student.update({
      where: {
        id: paramsData.id,
        organizationId,
      },
      data: {
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        address,
        beltLevel,
        status,
        emergencyContact: emergencyContact ? JSON.stringify(emergencyContact) : null,
        medicalInfo,
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

    return NextResponse.json({ student })
  } catch (error) {
    console.error("Failed to update student:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const paramsData = await params
    const { organizationId } = authResult

    await prisma.student.delete({
      where: {
        id: paramsData.id,
        organizationId,
      },
    })

    return NextResponse.json({ message: "Student deleted successfully" })
  } catch (error) {
    console.error("Failed to delete student:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}