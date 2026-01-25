import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [payments, totalRevenue, thisMonth, pendingStats] = await Promise.all([
      prisma.payment.findMany({
        orderBy: { createdAt: "desc" },
        take: 100, // Limit for performance
        select: {
          id: true,
          amount: true,
          status: true,
          paymentType: true,
          paymentMethod: true,
          dueDate: true,
          paidDate: true,
          notes: true,
          createdAt: true,
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              organization: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.payment.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          status: "PAID",
          paidDate: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { status: "PENDING" },
        _sum: { amount: true },
        _count: true,
      }),
    ])

    return NextResponse.json({
      payments,
      stats: {
        totalRevenue: totalRevenue._sum.amount || 0,
        thisMonth: thisMonth._sum.amount || 0,
        pendingAmount: pendingStats._sum.amount || 0,
        pendingCount: pendingStats._count || 0,
      },
    })
  } catch (error) {
    console.error("Admin payments error:", error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}
