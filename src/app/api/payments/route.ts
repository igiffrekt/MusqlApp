import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth-utils"
import { PaymentStatus } from "@prisma/client"
import { validatePaymentData, isValidDate } from "@/lib/validation"

/**
 * GET /api/payments - Fetch payments for the organization
 * @query {string} status - Filter by payment status (PENDING, PAID, OVERDUE, etc.)
 * @query {string} startDate - Filter payments from this date (ISO format)
 * @query {string} endDate - Filter payments until this date (ISO format)
 * @returns {Payment[]} Array of payments with student and plan details
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
    const status = searchParams.get("status")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Validate date parameters
    if (startDate && !isValidDate(startDate)) {
      return NextResponse.json(
        { message: "Invalid startDate format" },
        { status: 400 }
      )
    }
    if (endDate && !isValidDate(endDate)) {
      return NextResponse.json(
        { message: "Invalid endDate format" },
        { status: 400 }
      )
    }

    // Validate status enum
    if (status && !Object.values(PaymentStatus).includes(status as PaymentStatus)) {
      return NextResponse.json(
        { message: "Invalid payment status" },
        { status: 400 }
      )
    }

    let whereClause: {
      student: { organizationId: string }
      status?: PaymentStatus
      dueDate?: { gte?: Date; lte?: Date }
    } = {
      student: {
        organizationId,
      },
    }

    if (status) {
      whereClause.status = status as PaymentStatus
    }

    if (startDate || endDate) {
      whereClause.dueDate = {}
      if (startDate) {
        whereClause.dueDate.gte = new Date(startDate)
      }
      if (endDate) {
        whereClause.dueDate.lte = new Date(endDate)
      }
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        paymentPlan: {
          select: {
            name: true,
            frequency: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    })

    return NextResponse.json({ payments })
  } catch (error) {
    console.error("Failed to fetch payments:", error)
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
      paymentPlanId,
      amount,
      paymentType,
      dueDate,
      paymentMethod,
      notes,
    } = await request.json()

    // Validate payment data
    const validation = validatePaymentData({ studentId, amount, dueDate })
    if (!validation.valid) {
      return NextResponse.json(
        { message: "Validation failed", errors: validation.errors },
        { status: 400 }
      )
    }

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

    // Verify payment plan belongs to student (if provided)
    if (paymentPlanId) {
      const paymentPlan = await prisma.paymentPlan.findFirst({
        where: {
          id: paymentPlanId,
          studentId,
        },
      })

      if (!paymentPlan) {
        return NextResponse.json({ message: "Payment plan not found" }, { status: 400 })
      }
    }

    // Determine initial status
    let status: PaymentStatus = PaymentStatus.PENDING
    let paidDate = null

    // If payment method is cash/card and no due date, mark as paid immediately
    if ((paymentMethod === "CASH" || paymentMethod === "CARD") && !dueDate) {
      status = PaymentStatus.PAID
      paidDate = new Date()
    }

    // If due date is in the past, mark as overdue
    if (dueDate && new Date(dueDate) < new Date()) {
      status = PaymentStatus.OVERDUE
    }

    const payment = await prisma.payment.create({
      data: {
        studentId,
        paymentPlanId,
        amount,
        paymentType: paymentType || "TUITION",
        status,
        dueDate: dueDate ? new Date(dueDate) : new Date(),
        paidDate,
        paymentMethod: paymentMethod || "CASH",
        notes,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        paymentPlan: {
          select: {
            name: true,
            frequency: true,
          },
        },
      },
    })

    return NextResponse.json({ payment }, { status: 201 })
  } catch (error) {
    console.error("Failed to create payment:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}