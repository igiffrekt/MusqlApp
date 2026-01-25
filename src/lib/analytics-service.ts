import { prisma } from "./db"
import { startOfMonth, endOfMonth, subMonths, format, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek } from "date-fns"

export interface AnalyticsData {
  revenue: {
    total: number
    monthly: Array<{ month: string; amount: number }>
    byPaymentType: Array<{ type: string; amount: number; count: number }>
    growth: number
  }
  attendance: {
    totalSessions: number
    totalAttendance: number
    averageAttendanceRate: number
    weekly: Array<{ week: string; attended: number; total: number; rate: number }>
    byStudent: Array<{ studentId: string; name: string; attended: number; total: number; rate: number }>
    byTrainer: Array<{ trainerId: string; name: string; sessions: number; attendance: number }>
  }
  students: {
    total: number
    active: number
    newThisMonth: number
    retentionRate: number
    byBeltLevel: Array<{ belt: string; count: number }>
    enrollmentTrend: Array<{ month: string; count: number }>
  }
  sessions: {
    total: number
    completed: number
    upcoming: number
    byType: Array<{ type: string; count: number }>
    byDayOfWeek: Array<{ day: string; count: number }>
    utilizationRate: number
  }
}

export async function getAnalyticsData(
  organizationId: string,
  dateRange: { start: Date; end: Date }
): Promise<AnalyticsData> {
  // Revenue Analytics
  const revenueData = await getRevenueAnalytics(organizationId, dateRange)

  // Attendance Analytics
  const attendanceData = await getAttendanceAnalytics(organizationId, dateRange)

  // Student Analytics
  const studentData = await getStudentAnalytics(organizationId, dateRange)

  // Session Analytics
  const sessionData = await getSessionAnalytics(organizationId, dateRange)

  return {
    revenue: revenueData,
    attendance: attendanceData,
    students: studentData,
    sessions: sessionData,
  }
}

async function getRevenueAnalytics(organizationId: string, dateRange: { start: Date; end: Date }) {
  // Total revenue in date range
  const totalRevenue = await prisma.payment.aggregate({
    where: {
      student: { organizationId },
      status: "PAID",
      paidDate: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },
    _sum: {
      amount: true,
    },
  })

  // Monthly revenue trend (last 12 months) - optimized single query
  const twelveMonthsAgo = startOfMonth(subMonths(new Date(), 11))
  const monthlyRevenueRaw = await prisma.$queryRaw<Array<{ month: string; amount: number }>>`
    SELECT
      TO_CHAR(DATE_TRUNC('month', "paidDate"), 'Mon YYYY') as month,
      COALESCE(SUM(amount), 0) as amount
    FROM "payments" p
    JOIN "students" s ON p."studentId" = s.id
    WHERE s."organizationId" = ${organizationId}
      AND p.status = 'PAID'
      AND p."paidDate" >= ${twelveMonthsAgo}
    GROUP BY DATE_TRUNC('month', "paidDate")
    ORDER BY DATE_TRUNC('month', "paidDate") ASC
  `

  // Fill in missing months with 0
  const monthlyRevenue = []
  for (let i = 11; i >= 0; i--) {
    const monthDate = startOfMonth(subMonths(new Date(), i))
    const monthKey = format(monthDate, "MMM yyyy")
    const found = monthlyRevenueRaw.find(r => r.month === monthKey)
    monthlyRevenue.push({
      month: monthKey,
      amount: found ? Number(found.amount) : 0,
    })
  }

  // Revenue by payment type
  const revenueByType = await prisma.payment.groupBy({
    by: ["paymentType"],
    where: {
      student: { organizationId },
      status: "PAID",
      paidDate: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },
    _sum: {
      amount: true,
    },
    _count: true,
  })

  // Growth calculation (compare current month vs previous month)
  const currentMonth = await prisma.payment.aggregate({
    where: {
      student: { organizationId },
      status: "PAID",
      paidDate: {
        gte: startOfMonth(new Date()),
        lte: endOfMonth(new Date()),
      },
    },
    _sum: { amount: true },
  })

  const previousMonth = await prisma.payment.aggregate({
    where: {
      student: { organizationId },
      status: "PAID",
      paidDate: {
        gte: startOfMonth(subMonths(new Date(), 1)),
        lte: endOfMonth(subMonths(new Date(), 1)),
      },
    },
    _sum: { amount: true },
  })

  const currentAmount = currentMonth._sum.amount || 0
  const previousAmount = previousMonth._sum.amount || 0
  const growth = previousAmount > 0 ? ((currentAmount - previousAmount) / previousAmount) * 100 : 0

  return {
    total: totalRevenue._sum.amount || 0,
    monthly: monthlyRevenue,
    byPaymentType: revenueByType.map(item => ({
      type: item.paymentType,
      amount: item._sum.amount || 0,
      count: item._count,
    })),
    growth,
  }
}

async function getAttendanceAnalytics(organizationId: string, dateRange: { start: Date; end: Date }) {
  // Total sessions and attendance
  const totalSessions = await prisma.session.count({
    where: {
      organizationId,
      startTime: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },
  })

  const totalAttendance = await prisma.attendance.count({
    where: {
      session: {
        organizationId,
        startTime: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      },
      status: "PRESENT",
    },
  })

  const averageAttendanceRate = totalSessions > 0 ? (totalAttendance / totalSessions) * 100 : 0

  // Weekly attendance trend (last 12 weeks) - optimized with single queries
  const twelveWeeksAgo = startOfWeek(subDays(new Date(), 11 * 7))

  // Get session counts by week
  const weeklySessionsRaw = await prisma.$queryRaw<Array<{ week_start: Date; count: bigint }>>`
    SELECT
      DATE_TRUNC('week', "startTime") as week_start,
      COUNT(*) as count
    FROM "sessions"
    WHERE "organizationId" = ${organizationId}
      AND "startTime" >= ${twelveWeeksAgo}
    GROUP BY DATE_TRUNC('week', "startTime")
    ORDER BY week_start ASC
  `

  // Get attendance counts by week
  const weeklyAttendanceRaw = await prisma.$queryRaw<Array<{ week_start: Date; count: bigint }>>`
    SELECT
      DATE_TRUNC('week', s."startTime") as week_start,
      COUNT(*) as count
    FROM "attendances" a
    JOIN "sessions" s ON a."sessionId" = s.id
    WHERE s."organizationId" = ${organizationId}
      AND s."startTime" >= ${twelveWeeksAgo}
      AND a.status = 'PRESENT'
    GROUP BY DATE_TRUNC('week', s."startTime")
    ORDER BY week_start ASC
  `

  // Build weekly attendance array with computed rates
  const weeklyAttendance = []
  for (let i = 11; i >= 0; i--) {
    const weekStart = startOfWeek(subDays(new Date(), i * 7))
    const weekKey = weekStart.toISOString().split('T')[0]

    const sessionsData = weeklySessionsRaw.find(r =>
      new Date(r.week_start).toISOString().split('T')[0] === weekKey
    )
    const attendanceData = weeklyAttendanceRaw.find(r =>
      new Date(r.week_start).toISOString().split('T')[0] === weekKey
    )

    const weekSessions = sessionsData ? Number(sessionsData.count) : 0
    const weekAttendance = attendanceData ? Number(attendanceData.count) : 0

    weeklyAttendance.push({
      week: format(weekStart, "MMM dd"),
      attended: weekAttendance,
      total: weekSessions,
      rate: weekSessions > 0 ? (weekAttendance / weekSessions) * 100 : 0,
    })
  }

  // Attendance by student (top 10)
  const attendanceByStudent = await prisma.student.findMany({
    where: { organizationId },
    include: {
      attendances: {
        where: {
          session: {
            startTime: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          },
        },
        include: {
          session: true,
        },
      },
    },
    take: 10,
  })

  const studentAttendanceStats = attendanceByStudent.map(student => {
    const totalSessions = student.attendances.length
    const attendedSessions = student.attendances.filter(a => a.status === "PRESENT").length
    const rate = totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0

    return {
      studentId: student.id,
      name: `${student.firstName} ${student.lastName}`,
      attended: attendedSessions,
      total: totalSessions,
      rate,
    }
  }).sort((a, b) => b.rate - a.rate)

  // Attendance by trainer
  const attendanceByTrainer = await prisma.user.findMany({
    where: {
      organizationId,
      role: { in: ["TRAINER", "ADMIN"] },
    },
    include: {
      sessions: {
        where: {
          startTime: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
        },
        include: {
          _count: {
            select: { attendances: true },
          },
        },
      },
    },
  })

  const trainerStats = attendanceByTrainer.map(trainer => ({
    trainerId: trainer.id,
    name: trainer.name || "Unknown",
    sessions: trainer.sessions.length,
    attendance: trainer.sessions.reduce((sum, session) => sum + (session._count.attendances || 0), 0),
  }))

  return {
    totalSessions,
    totalAttendance,
    averageAttendanceRate,
    weekly: weeklyAttendance,
    byStudent: studentAttendanceStats,
    byTrainer: trainerStats,
  }
}

async function getStudentAnalytics(organizationId: string, dateRange: { start: Date; end: Date }) {
  // Total students
  const totalStudents = await prisma.student.count({
    where: { organizationId },
  })

  // Active students
  const activeStudents = await prisma.student.count({
    where: {
      organizationId,
      status: "ACTIVE",
    },
  })

  // New students this month
  const monthStart = startOfMonth(new Date())
  const newThisMonth = await prisma.student.count({
    where: {
      organizationId,
      createdAt: {
        gte: monthStart,
      },
    },
  })

  // Retention rate (simplified - students active for more than 30 days)
  const thirtyDaysAgo = subDays(new Date(), 30)
  const retainedStudents = await prisma.student.count({
    where: {
      organizationId,
      status: "ACTIVE",
      createdAt: {
        lte: thirtyDaysAgo,
      },
    },
  })

  const retentionRate = activeStudents > 0 ? (retainedStudents / activeStudents) * 100 : 0

  // Students by belt level
  const beltLevelStats = await prisma.student.groupBy({
    by: ["beltLevel"],
    where: {
      organizationId,
      beltLevel: { not: null },
    },
    _count: true,
  })

  // Enrollment trend (last 12 months) - optimized single query
  const enrollmentStartDate = startOfMonth(subMonths(new Date(), 11))
  const enrollmentRaw = await prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
    SELECT
      TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon YYYY') as month,
      COUNT(*) as count
    FROM "students"
    WHERE "organizationId" = ${organizationId}
      AND "createdAt" >= ${enrollmentStartDate}
    GROUP BY DATE_TRUNC('month', "createdAt")
    ORDER BY DATE_TRUNC('month', "createdAt") ASC
  `

  // Fill in missing months with 0
  const enrollmentTrend = []
  for (let i = 11; i >= 0; i--) {
    const monthDate = startOfMonth(subMonths(new Date(), i))
    const monthKey = format(monthDate, "MMM yyyy")
    const found = enrollmentRaw.find(r => r.month === monthKey)
    enrollmentTrend.push({
      month: monthKey,
      count: found ? Number(found.count) : 0,
    })
  }

  return {
    total: totalStudents,
    active: activeStudents,
    newThisMonth,
    retentionRate,
    byBeltLevel: beltLevelStats.map(item => ({
      belt: item.beltLevel || "Unranked",
      count: item._count,
    })),
    enrollmentTrend,
  }
}

async function getSessionAnalytics(organizationId: string, dateRange: { start: Date; end: Date }) {
  // Session counts
  const totalSessions = await prisma.session.count({
    where: {
      organizationId,
      startTime: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },
  })

  const completedSessions = await prisma.session.count({
    where: {
      organizationId,
      status: "COMPLETED",
      startTime: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },
  })

  const upcomingSessions = await prisma.session.count({
    where: {
      organizationId,
      startTime: {
        gt: new Date(),
      },
    },
  })

  // Sessions by type
  const sessionsByType = await prisma.session.groupBy({
    by: ["sessionType"],
    where: {
      organizationId,
      startTime: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },
    _count: true,
  })

  // Sessions by day of week
  const sessionsByDay = await prisma.$queryRaw<Array<{ day: number; count: bigint }>>`
    SELECT
      EXTRACT(DOW FROM "startTime") as day,
      COUNT(*) as count
    FROM "sessions"
    WHERE "organizationId" = ${organizationId}
      AND "startTime" >= ${dateRange.start}
      AND "startTime" <= ${dateRange.end}
    GROUP BY EXTRACT(DOW FROM "startTime")
    ORDER BY day
  `

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const sessionsByDayOfWeek = sessionsByDay.map(item => ({
    day: dayNames[Number(item.day)],
    count: Number(item.count),
  }))

  // Utilization rate (attendance vs capacity)
  const utilizationData = await prisma.session.findMany({
    where: {
      organizationId,
      startTime: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },
    include: {
      _count: {
        select: { attendances: true },
      },
    },
  })

  const totalCapacity = utilizationData.reduce((sum, session) => sum + session.capacity, 0)
  const totalAttended = utilizationData.reduce((sum, session) => sum + (session._count.attendances || 0), 0)
  const utilizationRate = totalCapacity > 0 ? (totalAttended / totalCapacity) * 100 : 0

  return {
    total: totalSessions,
    completed: completedSessions,
    upcoming: upcomingSessions,
    byType: sessionsByType.map(item => ({
      type: item.sessionType,
      count: item._count,
    })),
    byDayOfWeek: sessionsByDayOfWeek,
    utilizationRate,
  }
}

// Export functions for custom reports
export { getRevenueAnalytics, getAttendanceAnalytics, getStudentAnalytics, getSessionAnalytics }