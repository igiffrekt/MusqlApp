import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-utils"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId } = authResult
    const { studentId, amount, paymentType, paymentMethod, notes, timestamp } = await request.json()

    if (!studentId || !amount || !paymentType || !paymentMethod) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Verify the student belongs to the organization
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { organizationId: true }
    })

    if (!student || student.organizationId !== organizationId) {
      return NextResponse.json({ message: "Student not found or unauthorized" }, { status: 404 })
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        studentId,
        amount: parseFloat(amount),
        paymentType,
        paymentMethod,
        status: "PAID", // Offline payments are marked as paid
        paidDate: new Date(timestamp),
        notes: notes || null,
        dueDate: new Date(timestamp), // Set due date to payment date for offline payments
      },
    })

    return NextResponse.json({
      message: "Payment synced successfully",
      payment
    })
  } catch (error) {
    console.error("Failed to sync payment:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}