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

    // Get student with groups and payments
    const student = await prisma.student.findFirst({
      where: {
        id: paramsData.id,
        organizationId,
      },
      include: {
        groups: {
          include: {
            group: {
              select: {
                id: true,
                name: true,
                dailyFee: true,
                monthlyFee: true,
                currency: true,
              },
            },
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    })

    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 })
    }

    // Parse emergency contact for guardian
    let guardian: string | undefined
    if (student.emergencyContact) {
      try {
        const contact = JSON.parse(student.emergencyContact as string)
        guardian = contact.name
      } catch {
        // ignore
      }
    }

    // Calculate debts - pending and overdue payments
    const pendingPayments = student.payments.filter(
      p => p.status === "PENDING" || p.status === "OVERDUE"
    )

    // Group debts by type
    const debts = {
      total: 0,
      monthly: { count: 0, amount: 0, items: [] as typeof pendingPayments },
      daily: { count: 0, amount: 0, items: [] as typeof pendingPayments },
      other: { count: 0, amount: 0, items: [] as typeof pendingPayments },
    }

    pendingPayments.forEach(payment => {
      debts.total += payment.amount
      
      const isMonthly = payment.paymentType === "MEMBERSHIP" || 
                        payment.notes?.toLowerCase().includes("havi") ||
                        student.groups.some(g => g.group.monthlyFee === payment.amount)
      
      const isDaily = payment.notes?.toLowerCase().includes("napi") ||
                      (payment.paymentType === "TUITION" && 
                      student.groups.some(g => g.group.dailyFee === payment.amount))

      if (isMonthly) {
        debts.monthly.count++
        debts.monthly.amount += payment.amount
        debts.monthly.items.push(payment)
      } else if (isDaily) {
        debts.daily.count++
        debts.daily.amount += payment.amount
        debts.daily.items.push(payment)
      } else {
        debts.other.count++
        debts.other.amount += payment.amount
        debts.other.items.push(payment)
      }
    })

    // Find active passes (paid payments with validUntil in the future)
    const now = new Date()
    const activePasses = student.payments
      .filter(p => p.status === "PAID" && p.validUntil && new Date(p.validUntil) > now)
      .map(p => ({
        id: p.id,
        type: p.paymentType === "MEMBERSHIP" || p.notes?.toLowerCase().includes("havi") ? "monthly" : "daily",
        validUntil: p.validUntil,
        amount: p.amount,
        paidDate: p.paidDate,
        notes: p.notes,
      }))
      .sort((a, b) => new Date(b.validUntil!).getTime() - new Date(a.validUntil!).getTime())

    // Get the latest active monthly and daily pass
    const activeMonthlyPass = activePasses.find(p => p.type === "monthly")
    const activeDailyPass = activePasses.find(p => p.type === "daily")

    // Get recent paid payments for history
    const recentPaidPayments = student.payments
      .filter(p => p.status === "PAID")
      .slice(0, 10)

    // Transform groups
    const groups = student.groups.map(sg => ({
      id: sg.group.id,
      name: sg.group.name,
      dailyFee: sg.group.dailyFee,
      monthlyFee: sg.group.monthlyFee,
      currency: sg.group.currency,
      joinedAt: sg.joinedAt,
    }))

    return NextResponse.json({
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone,
        status: student.status,
        beltLevel: student.beltLevel,
        guardian,
        createdAt: student.createdAt,
      },
      groups,
      debts,
      activePasses: {
        monthly: activeMonthlyPass || null,
        daily: activeDailyPass || null,
        all: activePasses,
      },
      recentPayments: recentPaidPayments.map(p => ({
        id: p.id,
        amount: p.amount,
        paymentType: p.paymentType,
        paidDate: p.paidDate,
        paymentMethod: p.paymentMethod,
        notes: p.notes,
        validUntil: p.validUntil,
      })),
    })
  } catch (error) {
    console.error("Failed to fetch student details:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
