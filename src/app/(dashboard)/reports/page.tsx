"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  Target,
  Download,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
} from "lucide-react"
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns"
import { useSession } from "next-auth/react"
import { AnalyticsData } from "@/lib/analytics-service"
import { DateRange } from "react-day-picker"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function ReportsPage() {
  const { data: session } = useSession()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 3),
    to: new Date(),
  })

  useEffect(() => {
    if (session?.user && dateRange?.from && dateRange?.to) {
      loadAnalytics()
    }
  }, [session, dateRange])

  const loadAnalytics = async () => {
    if (!dateRange?.from || !dateRange?.to) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
      })

      const response = await fetch(`/api/analytics?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      }
    } catch (error) {
      console.error("Failed to load analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)
  }

  const setQuickDateRange = (range: string) => {
    const now = new Date()
    switch (range) {
      case "7d":
        setDateRange({ from: subDays(now, 7), to: now })
        break
      case "30d":
        setDateRange({ from: subDays(now, 30), to: now })
        break
      case "90d":
        setDateRange({ from: subDays(now, 90), to: now })
        break
      case "1y":
        setDateRange({ from: subMonths(now, 12), to: now })
        break
      case "thisMonth":
        setDateRange({ from: startOfMonth(now), to: endOfMonth(now) })
        break
      case "thisYear":
        setDateRange({ from: startOfYear(now), to: endOfYear(now) })
        break
    }
  }

  const exportReport = () => {
    if (!analyticsData) return

    const csvContent = [
      ["Metric", "Value"],
      ["Total Revenue", `$${analyticsData.revenue.total.toFixed(2)}`],
      ["Total Students", analyticsData.students.total],
      ["Active Students", analyticsData.students.active],
      ["Total Sessions", analyticsData.sessions.total],
      ["Average Attendance Rate", `${analyticsData.attendance.averageAttendanceRate.toFixed(1)}%`],
      ["Session Utilization", `${analyticsData.sessions.utilizationRate.toFixed(1)}%`],
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analytics-report-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Unable to load analytics data</p>
      </div>
    )
  }

  const { revenue, attendance, students, sessions } = analyticsData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600">Comprehensive insights into your training business</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadAnalytics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Report Period</CardTitle>
          <CardDescription>Select the date range for your analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex space-x-2">
              {[
                { label: "7 Days", value: "7d" },
                { label: "30 Days", value: "30d" },
                { label: "90 Days", value: "90d" },
                { label: "1 Year", value: "1y" },
                { label: "This Month", value: "thisMonth" },
                { label: "This Year", value: "thisYear" },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickDateRange(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <div className="ml-auto">
              <DatePickerWithRange
                date={dateRange}
                onDateChange={handleDateRangeChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenue.total.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {revenue.growth >= 0 ? (
                <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1 text-red-500" />
              )}
              <span className={revenue.growth >= 0 ? "text-green-500" : "text-red-500"}>
                {Math.abs(revenue.growth).toFixed(1)}%
              </span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.active}</div>
            <p className="text-xs text-muted-foreground">
              of {students.total} total students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendance.averageAttendanceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {attendance.totalAttendance} of {attendance.totalSessions} sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session Utilization</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.utilizationRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {sessions.completed} completed sessions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Analytics */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChartIcon className="w-5 h-5 mr-2" />
                  Revenue Trend
                </CardTitle>
                <CardDescription>Monthly revenue over the last 12 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenue.monthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                    <Area type="monotone" dataKey="amount" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Attendance by Student */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Top Student Attendance
                </CardTitle>
                <CardDescription>Students with highest attendance rates</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={attendance.byStudent.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, "Attendance Rate"]} />
                    <Bar dataKey="rate" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sessions by Type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChartIcon className="w-5 h-5 mr-2" />
                  Session Types
                </CardTitle>
                <CardDescription>Distribution of session types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sessions.byType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {sessions.byType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Students by Belt Level */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Belt Level Distribution
                </CardTitle>
                <CardDescription>Student progression by belt ranks</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={students.byBeltLevel}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="belt" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Payment Type</CardTitle>
                <CardDescription>Breakdown of revenue sources</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenue.byPaymentType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {revenue.byPaymentType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Trend</CardTitle>
                <CardDescription>Detailed monthly revenue chart</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenue.monthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                    <Legend />
                    <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Table */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Details</CardTitle>
              <CardDescription>Payment type breakdown with counts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenue.byPaymentType.map((item) => (
                  <div key={item.type} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{item.type}</h3>
                      <p className="text-sm text-gray-600">{item.count} payments</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">${item.amount.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">
                        ${(item.amount / item.count).toFixed(2)} avg
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Attendance Trend</CardTitle>
                <CardDescription>Attendance rates over the last 12 weeks</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={attendance.weekly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, "Attendance Rate"]} />
                    <Legend />
                    <Line type="monotone" dataKey="rate" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sessions by Day</CardTitle>
                <CardDescription>Session distribution by day of week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sessions.byDayOfWeek}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Student Attendance Rankings</CardTitle>
              <CardDescription>Top performers by attendance rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {attendance.byStudent.map((student, index) => (
                  <div key={student.studentId} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <Badge variant={index < 3 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                      <span className="font-medium">{student.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{student.rate.toFixed(1)}%</div>
                      <div className="text-sm text-gray-600">
                        {student.attended}/{student.total} sessions
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Enrollment Trend</CardTitle>
                <CardDescription>New student registrations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={students.enrollmentTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Student Metrics</CardTitle>
                <CardDescription>Key student statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-4 border rounded">
                  <div>
                    <p className="font-medium">Total Students</p>
                    <p className="text-sm text-gray-600">All registered students</p>
                  </div>
                  <div className="text-2xl font-bold">{students.total}</div>
                </div>
                <div className="flex justify-between items-center p-4 border rounded">
                  <div>
                    <p className="font-medium">Active Students</p>
                    <p className="text-sm text-gray-600">Currently enrolled</p>
                  </div>
                  <div className="text-2xl font-bold">{students.active}</div>
                </div>
                <div className="flex justify-between items-center p-4 border rounded">
                  <div>
                    <p className="font-medium">New This Month</p>
                    <p className="text-sm text-gray-600">Recent registrations</p>
                  </div>
                  <div className="text-2xl font-bold">{students.newThisMonth}</div>
                </div>
                <div className="flex justify-between items-center p-4 border rounded">
                  <div>
                    <p className="font-medium">Retention Rate</p>
                    <p className="text-sm text-gray-600">Student retention</p>
                  </div>
                  <div className="text-2xl font-bold">{students.retentionRate.toFixed(1)}%</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Belt Level Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Belt Level Progress</CardTitle>
              <CardDescription>Student progression through belt ranks</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={students.byBeltLevel}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="belt" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}