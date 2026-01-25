import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  TUITION: "Havi tandíj",
  PRIVATE_LESSON: "Magánóra",
  SEMINAR: "Szeminárium",
  EQUIPMENT: "Felszerelés",
  MEMBERSHIP: "Havi tagdíj",
  OTHER: "Egyéb",
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: paymentId } = await params
    const { status, paymentMethod } = await request.json()

    // Find the user and their student record with groups
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        student: {
          include: {
            groups: {
              include: {
                group: {
                  select: { name: true }
                }
              }
            }
          }
        }
      },
    })

    if (!user?.student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Find the payment and verify it belongs to this student
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        studentId: user.student.id,
      },
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Don't allow marking already paid payments
    if (payment.status === "PAID") {
      return NextResponse.json({ error: "Payment already processed" }, { status: 400 })
    }

    // Update the payment
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: status || "PAID",
        paidDate: new Date(),
        paymentMethod: paymentMethod || "CARD",
      },
    })

    // Notify trainers/admins about the payment
    const trainers = await prisma.user.findMany({
      where: {
        organizationId: user.student.organizationId,
        role: { in: ["ADMIN", "TRAINER"] },
      },
      select: { id: true },
    })

    const studentName = `${user.student.firstName} ${user.student.lastName}`
    const amount = new Intl.NumberFormat("hu-HU").format(payment.amount)
    const paymentTypeLabel = PAYMENT_TYPE_LABELS[payment.paymentType] || payment.paymentType
    const groupNames = user.student.groups?.map(g => g.group.name).join(", ") || "Nincs csoport"

    await prisma.notification.createMany({
      data: trainers.map((trainer) => ({
        userId: trainer.id,
        title: "Új befizetés érkezett",
        message: `${studentName} (${groupNames}) befizetett ${amount} Ft-ot. Jogcím: ${paymentTypeLabel}`,
        type: "SUCCESS",
      })),
    })

    return NextResponse.json({ payment: updatedPayment })
  } catch (error) {
    console.error("Payment update error:", error)
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 })
  }
}
