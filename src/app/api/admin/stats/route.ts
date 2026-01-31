import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is SUPER_ADMIN
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get current date info for "this month" calculations
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Fetch all stats in parallel
    const [
      totalOrgs,
      activeOrgs,
      trialOrgs,
      orgsThisMonth,
      totalCoaches,
      coachesThisMonth,
      totalMembers,
      membersThisMonth,
      totalRevenue,
      revenueThisMonth,
      pendingPayments,
      activeSubscriptions,
      trialSubscriptions,
      cancelledOrgs,
      recentOrgs,
      recentPayments,
    ] = await Promise.all([
      // Organizations
      prisma.organization.count(),
      prisma.organization.count({
        where: { subscriptionStatus: "ACTIVE" },
      }),
      prisma.organization.count({
        where: { subscriptionStatus: "TRIAL" },
      }),
      prisma.organization.count({
        where: { createdAt: { gte: startOfMonth } },
      }),

      // Coaches (ADMIN and TRAINER roles)
      prisma.user.count({
        where: { role: { in: ["ADMIN", "TRAINER"] } },
      }),
      prisma.user.count({
        where: {
          role: { in: ["ADMIN", "TRAINER"] },
          createdAt: { gte: startOfMonth },
        },
      }),

      // Members (Students)
      prisma.student.count(),
      prisma.student.count({
        where: { createdAt: { gte: startOfMonth } },
      }),

      // Payments
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
      prisma.payment.count({
        where: { status: "PENDING" },
      }),

      // Subscriptions
      prisma.organization.count({
        where: { subscriptionStatus: "ACTIVE" },
      }),
      prisma.organization.count({
        where: { subscriptionStatus: "TRIAL" },
      }),
      prisma.organization.count({
        where: { subscriptionStatus: "CANCELLED" },
      }),

      // Recent activity - new organizations
      prisma.organization.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      }),

      // Recent activity - payments
      prisma.payment.findMany({
        take: 5,
        where: { status: "PAID" },
        orderBy: { paidDate: "desc" },
        select: {
          id: true,
          amount: true,
          paidDate: true,
          student: {
            select: {
              firstName: true,
              lastName: true,
              organization: {
                select: { name: true },
              },
            },
          },
        },
      }),
    ])

    // Build recent activity
    const recentActivity = [
      ...recentOrgs.map((org) => ({
        id: `org-${org.id}`,
        type: "org_created" as const,
        description: `New organization: ${org.name}`,
        timestamp: org.createdAt.toISOString(),
      })),
      ...recentPayments.map((payment) => ({
        id: `payment-${payment.id}`,
        type: "payment" as const,
        description: `Payment from ${payment.student.firstName} ${payment.student.lastName} (${payment.student.organization?.name || "Unknown"})`,
        timestamp: payment.paidDate?.toISOString() || new Date().toISOString(),
        amount: payment.amount,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

    return NextResponse.json({
      organizations: {
        total: totalOrgs,
        active: activeOrgs,
        trial: trialOrgs,
        thisMonth: orgsThisMonth,
      },
      coaches: {
        total: totalCoaches,
        thisMonth: coachesThisMonth,
      },
      members: {
        total: totalMembers,
        thisMonth: membersThisMonth,
      },
      payments: {
        totalRevenue: totalRevenue._sum.amount || 0,
        thisMonth: revenueThisMonth._sum.amount || 0,
        pendingCount: pendingPayments,
        currency: "HUF",
      },
      subscriptions: {
        active: activeSubscriptions,
        trialing: trialSubscriptions,
        cancelled: cancelledOrgs,
      },
      recentActivity,
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}
