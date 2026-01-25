import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth-utils"

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
    const { status, paidDate, paymentMethod, notes } = await request.json()

    // Find payment and verify it belongs to user's organization
    const payment = await prisma.payment.findFirst({
      where: {
        id: paramsData.id,
        student: {
          organizationId,
        },
      },
      include: {
        student: true,
      },
    })

    if (!payment) {
      return NextResponse.json({ message: "Payment not found" }, { status: 404 })
    }

    const updatedPayment = await prisma.payment.update({
      where: {
        id: paramsData.id,
      },
      data: {
        status,
        paidDate: paidDate ? new Date(paidDate) : status === "PAID" && !payment.paidDate ? new Date() : payment.paidDate,
        paymentMethod,
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

    return NextResponse.json({ payment: updatedPayment })
  } catch (error) {
    console.error("Failed to update payment:", error)
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

    // Find payment and verify it belongs to user's organization
    const payment = await prisma.payment.findFirst({
      where: {
        id: paramsData.id,
        student: {
          organizationId,
        },
      },
    })

    if (!payment) {
      return NextResponse.json({ message: "Payment not found" }, { status: 404 })
    }

    // Prevent deletion of paid payments
    if (payment.status === "PAID") {
      return NextResponse.json(
        { message: "Cannot delete paid payments" },
        { status: 400 }
      )
    }

    await prisma.payment.delete({
      where: {
        id: paramsData.id,
      },
    })

    return NextResponse.json({ message: "Payment deleted successfully" })
  } catch (error) {
    console.error("Failed to delete payment:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}