import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth-utils"

export async function GET() {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId } = authResult

    const plans = await prisma.paymentPlan.findMany({
      where: {
        student: {
          organizationId,
        },
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            dueDate: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ plans })
  } catch (error) {
    console.error("Failed to fetch payment plans:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId } = authResult
    const {
      studentId,
      name,
      amount,
      frequency,
      startDate,
      endDate,
    } = await request.json()

    // Verify student belongs to organization
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        organizationId,
      },
    })

    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 400 })
    }

    const plan = await prisma.paymentPlan.create({
      data: {
        studentId,
        name,
        amount,
        frequency: frequency || "MONTHLY",
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isActive: true,
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // Optionally create the first payment for this plan
    if (frequency !== "CUSTOM") {
      await prisma.payment.create({
        data: {
          studentId,
          paymentPlanId: plan.id,
          amount,
          paymentType: "TUITION",
          status: "PENDING",
          dueDate: new Date(startDate),
          paymentMethod: "CASH",
        },
      })
    }

    return NextResponse.json({ plan }, { status: 201 })
  } catch (error) {
    console.error("Failed to create payment plan:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}