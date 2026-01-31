"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Wallet,
  Activity,
  Clock,
  Target,
  Loader2,
  ChevronDown,
  Download,
} from "lucide-react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns"
import { hu } from "date-fns/locale"

interface AnalyticsData {
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

const COLORS = ["#D2F159", "#1ad598", "#f59e0b", "#ea3a3d", "#8b5cf6", "#06b6d4"]

const paymentTypeLabels: Record<string, string> = {
  MONTHLY: "Havi tagdíj",
  DAILY: "Napi jegy",
  SINGLE: "Egyszeri",
  MEMBERSHIP: "Bérlet",
  OTHER: "Egyéb",
}

const dayLabels: Record<string, string> = {
  Monday: "Hétfő",
  Tuesday: "Kedd",
  Wednesday: "Szerda",
  Thursday: "Csütörtök",
  Friday: "Péntek",
  Saturday: "Szombat",
  Sunday: "Vasárnap",
}

type DateRangeOption = "thisMonth" | "lastMonth" | "last3Months" | "last6Months" | "thisYear"

const dateRangeOptions: { value: DateRangeOption; label: string }[] = [
  { value: "thisMonth", label: "Ez a hónap" },
  { value: "lastMonth", label: "Előző hónap" },
  { value: "last3Months", label: "Utolsó 3 hónap" },
  { value: "last6Months", label: "Utolsó 6 hónap" },
  { value: "thisYear", label: "Idei év" },
]

function getDateRange(option: DateRangeOption): { start: Date; end: Date } {
  const now = new Date()
  switch (option) {
    case "thisMonth":
      return { start: startOfMonth(now), end: now }
    case "lastMonth":
      return { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) }
    case "last3Months":
      return { start: startOfMonth(subMonths(now, 2)), end: now }
    case "last6Months":
      return { start: startOfMonth(subMonths(now, 5)), end: now }
    case "thisYear":
      return { start: new Date(now.getFullYear(), 0, 1), end: now }
  }
}

// Stat Card Component
const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  color = "#D2F159",
  suffix = "",
  prefix = "",
}: {
  title: string
  value: string | number
  change?: number
  icon: any
  color?: string
  suffix?: string
  prefix?: string
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl bg-[#252a32] border border-white/5 p-5"
  >
    <div className="flex items-start justify-between mb-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      {change !== undefined && (
        <div
          className={`flex items-center gap-1 text-sm font-medium ${
            change >= 0 ? "text-green-400" : "text-red-400"
          }`}
        >
          {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(change).toFixed(1)}%
        </div>
      )}
    </div>
    <div className="text-2xl font-bold text-white mb-1">
      {prefix}
      {typeof value === "number" ? value.toLocaleString("hu-HU") : value}
      {suffix}
    </div>
    <div className="text-white/50 text-sm">{title}</div>
  </motion.div>
)

// Chart Card Component
const ChartCard = ({
  title,
  children,
  className = "",
}: {
  title: string
  children: React.ReactNode
  className?: string
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`rounded-2xl bg-[#252a32] border border-white/5 p-5 ${className}`}
  >
    <h3 className="text-white font-semibold mb-4">{title}</h3>
    {children}
  </motion.div>
)

// Custom Tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1d24] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-white/60 text-xs mb-1">{label}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} className="text-white text-sm font-medium">
            {typeof item.value === "number"
              ? item.value.toLocaleString("hu-HU")
              : item.value}
            {item.unit || ""}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function ReportsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRangeOption>("last3Months")
  const [showDatePicker, setShowDatePicker] = useState(false)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const range = getDateRange(dateRange)
        const params = new URLSearchParams({
          startDate: range.start.toISOString().split("T")[0],
          endDate: range.end.toISOString().split("T")[0],
        })

        const response = await fetch(`/api/analytics?${params}`)
        if (!response.ok) {
          throw new Error("Failed to fetch analytics")
        }

        const analyticsData = await response.json()
        setData(analyticsData)
        setError(null)
      } catch (err) {
        console.error("Analytics error:", err)
        setError("Nem sikerült betölteni az adatokat")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [dateRange])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#D2F159] animate-spin mx-auto mb-4" />
          <p className="text-white/50">Adatok betöltése...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-3xl bg-[#252a32] border border-white/5 p-12 text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <BarChart3 className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Hiba történt</h2>
        <p className="text-white/50">{error || "Ismeretlen hiba"}</p>
      </div>
    )
  }

  return (
    <div className="font-lufga pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#D2F159]/20 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-[#D2F159]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Riportok</h1>
            <p className="text-white/50 text-sm">Statisztikák és elemzések</p>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#252a32] border border-white/10 text-white hover:border-white/20 transition-colors"
          >
            <Calendar className="w-4 h-4 text-white/50" />
            <span>{dateRangeOptions.find((o) => o.value === dateRange)?.label}</span>
            <ChevronDown className="w-4 h-4 text-white/50" />
          </button>

          {showDatePicker && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#1a1d24] border border-white/10 shadow-xl z-10 overflow-hidden">
              {dateRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setDateRange(option.value)
                    setShowDatePicker(false)
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-white/5 transition-colors ${
                    dateRange === option.value
                      ? "bg-[#D2F159]/10 text-[#D2F159]"
                      : "text-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Összes bevétel"
          value={data.revenue.total}
          change={data.revenue.growth}
          icon={Wallet}
          color="#D2F159"
          suffix=" Ft"
        />
        <StatCard
          title="Aktív tagok"
          value={data.students.active}
          icon={Users}
          color="#1ad598"
        />
        <StatCard
          title="Jelenlét arány"
          value={data.attendance.averageAttendanceRate.toFixed(1)}
          icon={Activity}
          color="#f59e0b"
          suffix="%"
        />
        <StatCard
          title="Kihasználtság"
          value={data.sessions.utilizationRate.toFixed(1)}
          icon={Target}
          color="#8b5cf6"
          suffix="%"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Összes óra"
          value={data.sessions.total}
          icon={Calendar}
          color="#06b6d4"
        />
        <StatCard
          title="Befejezett óra"
          value={data.sessions.completed}
          icon={Clock}
          color="#1ad598"
        />
        <StatCard
          title="Új tagok (hó)"
          value={data.students.newThisMonth}
          icon={Users}
          color="#f59e0b"
        />
        <StatCard
          title="Megtartás"
          value={data.students.retentionRate.toFixed(1)}
          icon={TrendingUp}
          color="#D2F159"
          suffix="%"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <ChartCard title="Bevétel alakulása (12 hónap)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenue.monthly}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D2F159" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#D2F159" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#D2F159"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Enrollment Trend */}
        <ChartCard title="Új tagok (12 hónap)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.students.enrollmentTrend}>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#1ad598" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue by Type */}
        <ChartCard title="Bevétel típus szerint">
          <div className="h-64 flex items-center justify-center">
            {data.revenue.byPaymentType.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.revenue.byPaymentType}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="amount"
                  >
                    {data.revenue.byPaymentType.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload
                        return (
                          <div className="bg-[#1a1d24] border border-white/10 rounded-lg px-3 py-2">
                            <p className="text-white font-medium">
                              {paymentTypeLabels[item.type] || item.type}
                            </p>
                            <p className="text-white/60 text-sm">
                              {item.amount.toLocaleString("hu-HU")} Ft ({item.count} db)
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-white/40">Nincs adat</p>
            )}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4">
            {data.revenue.byPaymentType.map((item, index) => (
              <div key={item.type} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-white/60 text-xs">
                  {paymentTypeLabels[item.type] || item.type}
                </span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Sessions by Day */}
        <ChartCard title="Órák napok szerint">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.sessions.byDayOfWeek} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
                  tickFormatter={(v) => dayLabels[v] || v}
                  width={70}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Weekly Attendance */}
        <ChartCard title="Heti jelenlét trend">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.attendance.weekly}>
                <XAxis
                  dataKey="week"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload
                      return (
                        <div className="bg-[#1a1d24] border border-white/10 rounded-lg px-3 py-2">
                          <p className="text-white/60 text-xs">{item.week}</p>
                          <p className="text-white font-medium">{item.rate.toFixed(1)}%</p>
                          <p className="text-white/40 text-xs">
                            {item.attended}/{item.total} résztvevő
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: "#8b5cf6", strokeWidth: 0, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Top Students Table */}
      <ChartCard title="Top 10 tag jelenlét szerint" className="mb-6">
        {data.attendance.byStudent.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-white/40 text-xs uppercase">
                  <th className="text-left pb-3 font-medium">Név</th>
                  <th className="text-right pb-3 font-medium">Jelen</th>
                  <th className="text-right pb-3 font-medium">Összes</th>
                  <th className="text-right pb-3 font-medium">Arány</th>
                </tr>
              </thead>
              <tbody>
                {data.attendance.byStudent.slice(0, 10).map((student, index) => (
                  <tr
                    key={student.studentId}
                    className="border-t border-white/5 text-sm"
                  >
                    <td className="py-3 text-white">{student.name}</td>
                    <td className="py-3 text-right text-white/60">{student.attended}</td>
                    <td className="py-3 text-right text-white/60">{student.total}</td>
                    <td className="py-3 text-right">
                      <span
                        className={`font-medium ${
                          student.rate >= 80
                            ? "text-green-400"
                            : student.rate >= 50
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        {student.rate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-white/40 text-center py-8">Nincs elegendő adat</p>
        )}
      </ChartCard>

      {/* Trainers Stats */}
      {data.attendance.byTrainer.length > 0 && (
        <ChartCard title="Edzők statisztikái">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.attendance.byTrainer.map((trainer) => (
              <div
                key={trainer.trainerId}
                className="p-4 rounded-xl bg-white/5 border border-white/5"
              >
                <div className="font-medium text-white mb-2">{trainer.name}</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Órák</span>
                  <span className="text-white">{trainer.sessions}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-white/50">Résztvevők</span>
                  <span className="text-white">{trainer.attendance}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-white/50">Átlag/óra</span>
                  <span className="text-[#D2F159] font-medium">
                    {trainer.sessions > 0
                      ? (trainer.attendance / trainer.sessions).toFixed(1)
                      : 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      )}
    </div>
  )
}
