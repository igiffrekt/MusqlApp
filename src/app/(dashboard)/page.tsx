"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MobileHomepage } from "@/components/mobile/MobileHomepage"
import { MobileStudentHomepage } from "@/components/mobile/MobileStudentHomepage"
import {
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Users,
  ArrowRight,
  Plus,
  AlertCircle,
  TrendingUp,
  User,
  FileText,
  Activity
} from "lucide-react"
import { format, isToday, isTomorrow, startOfMonth, endOfMonth } from "date-fns"

interface WorkflowStep {
  id: string
  title: string
  stage: string
  status: "completed" | "active" | "pending"
  assignedTo?: string
  date?: string
}

interface UpcomingSession {
  id: string
  title: string
  date: string
  time: string
  trainer: string
  studentCount: number
  type: string
}

interface DuePayment {
  id: string
  studentName: string
  amount: number
  dueDate: string
  status: "overdue" | "due_soon" | "due"
}

interface RecentActivity {
  id: string
  type: "attendance" | "payment" | "session" | "student"
  title: string
  description: string
  timestamp: string
  user?: string
}

// API response types
interface SessionApiResponse {
  id: string
  title?: string
  type: string
  startTime: string
  trainer?: { name?: string }
  _count?: { attendances?: number }
}

interface PaymentApiResponse {
  id: string
  amount: number
  dueDate: string
  student: { firstName: string; lastName: string }
}

interface NotificationApiResponse {
  id: string
  title?: string
  message?: string
  createdAt: string
  userId?: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([])
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([])
  const [duePayments, setDuePayments] = useState<DuePayment[]>([])
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  const userRole = session?.user?.role || "STUDENT"
  const isAdmin = userRole === "ADMIN" || userRole === "TRAINER"
  const isStudent = userRole === "STUDENT"

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/onboarding")
    }
  }, [status, router])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Check if new org needs setup (no locations yet)
  useEffect(() => {
    const checkSetupNeeded = async () => {
      // Wait for session to be fully loaded
      if (status !== "authenticated") return

      // Check if user is admin/trainer (use session data directly to avoid timing issues)
      const role = session?.user?.role
      const userIsAdmin = role === "ADMIN" || role === "TRAINER"

      if (!userIsAdmin) return

      try {
        const response = await fetch("/api/locations")
        if (response.ok) {
          const data = await response.json()
          if (!data.locations || data.locations.length === 0) {
            // New org with no locations - redirect to setup
            router.replace("/setup")
            return
          }
        }
      } catch (err) {
        console.error("Failed to check locations:", err)
      }
    }
    checkSetupNeeded()
  }, [session, status, router])

  useEffect(() => {
    if (session?.user) {
      loadDashboardData()
    } else if (session === null) {
      setLoading(false)
    }
  }, [session])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const monthStart = startOfMonth(new Date())
      const monthEnd = endOfMonth(new Date())

      if (isAdmin) {
        const [sessionsRes, paymentsRes, activitiesRes] = await Promise.all([
          fetch(`/api/sessions?upcoming=true&startDate=${monthStart.toISOString()}&endDate=${monthEnd.toISOString()}`),
          fetch(`/api/payments?status=PENDING&startDate=${monthStart.toISOString()}&endDate=${monthEnd.toISOString()}`),
          fetch("/api/notifications?limit=10")
        ])

        if (sessionsRes.ok) {
          const sessionsData = await sessionsRes.json()
          const sessions = (sessionsData.sessions as SessionApiResponse[] | undefined)?.map((s) => ({
            id: s.id,
            title: s.title || `${s.type} Session`,
            date: s.startTime,
            time: new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            trainer: s.trainer?.name || "Trainer",
            studentCount: s._count?.attendances || 0,
            type: s.type
          })) || []
          setUpcomingSessions(sessions.slice(0, 5))
        }

        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json()
          const due = (paymentsData.payments as PaymentApiResponse[] | undefined)?.map((p) => {
            const dueDate = new Date(p.dueDate)
            const today = new Date()
            const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            return {
              id: p.id,
              studentName: `${p.student.firstName} ${p.student.lastName}`,
              amount: p.amount,
              dueDate: p.dueDate,
              status: (daysUntilDue < 0 ? "overdue" : daysUntilDue <= 7 ? "due_soon" : "due") as DuePayment["status"]
            }
          }).filter((p) => p.status !== "due") || []
          setDuePayments(due.slice(0, 5))
        }

        if (activitiesRes.ok) {
          const activitiesData = await activitiesRes.json()
          const activities = (activitiesData.notifications as NotificationApiResponse[] | undefined)?.map((n) => {
            let type: "attendance" | "payment" | "session" | "student" = "student"
            if (n.message?.toLowerCase().includes("attendance")) type = "attendance"
            else if (n.message?.toLowerCase().includes("payment")) type = "payment"
            else if (n.message?.toLowerCase().includes("session")) type = "session"

            return {
              id: n.id,
              type,
              title: n.title || n.message || "",
              description: n.message || "",
              timestamp: n.createdAt,
              user: n.userId
            }
          }) || []
          setRecentActivities(activities.slice(0, 5))
        }

        generateWorkflowSteps()
      } else {
        const [sessionsRes, paymentsRes] = await Promise.all([
          fetch(`/api/sessions?upcoming=true&startDate=${monthStart.toISOString()}&endDate=${monthEnd.toISOString()}`),
          fetch(`/api/payments?status=PENDING&startDate=${monthStart.toISOString()}&endDate=${monthEnd.toISOString()}`)
        ])

        if (sessionsRes.ok) {
          const sessionsData = await sessionsRes.json()
          const sessions = (sessionsData.sessions as SessionApiResponse[] | undefined)?.map((s) => ({
            id: s.id,
            title: s.title || `${s.type} Session`,
            date: s.startTime,
            time: new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            trainer: s.trainer?.name || "Trainer",
            studentCount: s._count?.attendances || 0,
            type: s.type
          })) || []
          setUpcomingSessions(sessions.slice(0, 5))
        }

        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json()
          const payments = (paymentsData.payments as PaymentApiResponse[] | undefined)?.map((p) => {
            const dueDate = new Date(p.dueDate)
            const today = new Date()
            const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            return {
              id: p.id,
              studentName: `${p.student.firstName} ${p.student.lastName}`,
              amount: p.amount,
              dueDate: p.dueDate,
              status: (daysUntilDue < 0 ? "overdue" : daysUntilDue <= 7 ? "due_soon" : "due") as DuePayment["status"]
            }
          }) || []
          setDuePayments(payments.slice(0, 3))
        }
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateWorkflowSteps = () => {
    const steps: WorkflowStep[] = [
      {
        id: "1",
        title: "Schedule Training Session",
        stage: "Session Planning",
        status: "completed",
        assignedTo: "Trainer",
        date: new Date().toISOString()
      },
      {
        id: "2",
        title: "Notify Students",
        stage: "Session Planning",
        status: "completed",
        assignedTo: "System",
        date: new Date().toISOString()
      },
      {
        id: "3",
        title: "Session Starts",
        stage: "Attendance",
        status: "active",
        assignedTo: "Trainer",
        date: new Date().toISOString()
      },
      {
        id: "4",
        title: "Mark Attendance",
        stage: "Attendance",
        status: "pending",
        assignedTo: "Trainer"
      },
      {
        id: "5",
        title: "Record Payment",
        stage: "Payment",
        status: "pending",
        assignedTo: "Trainer"
      },
      {
        id: "6",
        title: "Update Student Progress",
        stage: "Payment",
        status: "pending",
        assignedTo: "System"
      }
    ]
    setWorkflowSteps(steps)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-[#A8E6CF] text-gray-800"
      case "active":
        return "bg-[#FF6F61] text-white"
      case "pending":
        return "bg-gray-100 text-gray-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "active":
        return <Clock className="w-4 h-4" />
      case "pending":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) return "Today"
    if (isTomorrow(date)) return "Tomorrow"
    return format(date, "MMM d, yyyy")
  }

  // Wait for auth to be determined
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-400"></div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6F61] mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Show mobile homepage on small screens
  if (isMobile) {
    // Student users see simplified student dashboard
    if (isStudent) {
      return <MobileStudentHomepage />
    }
    // Trainers and admins see full mobile dashboard
    return <MobileHomepage />
  }

  // Desktop dashboard
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Training Management Workflow</h1>
          <p className="text-gray-600 mt-1">Session Planning → Attendance → Payment</p>
        </div>
        {isAdmin && (
          <Button
            className="bg-[#FF6F61] hover:bg-[#FF6F61]/90 text-white rounded-2xl px-6 py-2"
            onClick={() => router.push("/trainer/sessions")}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Session
          </Button>
        )}
      </div>

      {/* Workflow Visualization - Admin/Trainer View */}
      {isAdmin && (
        <Card
          className="rounded-3xl border-2"
          style={{
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderColor: "rgba(255, 111, 97, 0.2)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          }}
        >
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Training Session Workflow</CardTitle>
            <CardDescription>Track your session lifecycle from planning to payment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Session Planning Stage */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-[#FF6F61]"></div>
                  <h3 className="font-semibold text-lg">Session Planning</h3>
                </div>
                {workflowSteps
                  .filter(step => step.stage === "Session Planning")
                  .map((step) => (
                    <div
                      key={step.id}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer hover:scale-105 ${
                        step.status === "completed"
                          ? "bg-[#A8E6CF]/30 border-[#A8E6CF]"
                          : step.status === "active"
                          ? "bg-[#FF6F61]/20 border-[#FF6F61]"
                          : "bg-gray-50 border-gray-200"
                      }`}
                      onClick={() => {
                        if (step.title.includes("Schedule")) router.push("/trainer/sessions")
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(step.status)}
                          <span className="font-medium text-sm">{step.title}</span>
                        </div>
                        <Badge className={getStatusColor(step.status)}>
                          {step.status}
                        </Badge>
                      </div>
                      {step.assignedTo && (
                        <div className="flex items-center space-x-2 mt-2">
                          <User className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-600">{step.assignedTo}</span>
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              {/* Attendance Stage */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-[#FF6F61]"></div>
                  <h3 className="font-semibold text-lg">Attendance</h3>
                </div>
                {workflowSteps
                  .filter(step => step.stage === "Attendance")
                  .map((step) => (
                    <div
                      key={step.id}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer hover:scale-105 ${
                        step.status === "completed"
                          ? "bg-[#A8E6CF]/30 border-[#A8E6CF]"
                          : step.status === "active"
                          ? "bg-[#FF6F61]/20 border-[#FF6F61]"
                          : "bg-gray-50 border-gray-200"
                      }`}
                      onClick={() => {
                        if (step.title.includes("Attendance")) router.push("/trainer/attendance")
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(step.status)}
                          <span className="font-medium text-sm">{step.title}</span>
                        </div>
                        <Badge className={getStatusColor(step.status)}>
                          {step.status}
                        </Badge>
                      </div>
                      {step.assignedTo && (
                        <div className="flex items-center space-x-2 mt-2">
                          <User className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-600">{step.assignedTo}</span>
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              {/* Payment Stage */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-[#FF6F61]"></div>
                  <h3 className="font-semibold text-lg">Payment</h3>
                </div>
                {workflowSteps
                  .filter(step => step.stage === "Payment")
                  .map((step) => (
                    <div
                      key={step.id}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer hover:scale-105 ${
                        step.status === "completed"
                          ? "bg-[#A8E6CF]/30 border-[#A8E6CF]"
                          : step.status === "active"
                          ? "bg-[#FF6F61]/20 border-[#FF6F61]"
                          : "bg-gray-50 border-gray-200"
                      }`}
                      onClick={() => {
                        if (step.title.includes("Payment")) router.push("/trainer/payments")
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(step.status)}
                          <span className="font-medium text-sm">{step.title}</span>
                        </div>
                        <Badge className={getStatusColor(step.status)}>
                          {step.status}
                        </Badge>
                      </div>
                      {step.assignedTo && (
                        <div className="flex items-center space-x-2 mt-2">
                          <User className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-600">{step.assignedTo}</span>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student View - Simplified */}
      {isStudent && (
        <Card
          className="rounded-3xl border-2"
          style={{
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderColor: "rgba(255, 111, 97, 0.2)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          }}
        >
          <CardHeader>
            <CardTitle className="text-2xl font-bold">My Training Journey</CardTitle>
            <CardDescription>Your upcoming sessions and payment status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-[#FF6F61]" />
                  <span>Upcoming Sessions</span>
                </h3>
                {upcomingSessions.length > 0 ? (
                  upcomingSessions.map((s) => (
                    <div
                      key={s.id}
                      className="p-4 rounded-2xl bg-[#A8E6CF]/20 border-2 border-[#A8E6CF] cursor-pointer hover:scale-105 transition-all"
                      onClick={() => router.push(`/trainer/sessions`)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{s.title}</p>
                          <p className="text-sm text-gray-600">{formatDate(s.date)} at {s.time}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#FF6F61]" />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No upcoming sessions</p>
                )}
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-[#FF6F61]" />
                  <span>Payment Status</span>
                </h3>
                {duePayments.length > 0 ? (
                  duePayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="p-4 rounded-2xl bg-[#FF6F61]/10 border-2 border-[#FF6F61] cursor-pointer hover:scale-105 transition-all"
                      onClick={() => router.push("/trainer/payments")}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">${payment.amount.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">Due: {formatDate(payment.dueDate)}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#FF6F61]" />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No pending payments</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bottom Sections - Two Columns */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Sessions */}
          <Card
            className="rounded-3xl border-2"
            style={{
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderColor: "rgba(168, 230, 207, 0.3)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-[#A8E6CF]" />
                  <span>Upcoming Sessions</span>
                </CardTitle>
                <CardDescription>Next training sessions scheduled</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full"
                onClick={() => router.push("/trainer/sessions")}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingSessions.length > 0 ? (
                  upcomingSessions.map((s) => (
                    <div
                      key={s.id}
                      className="p-4 rounded-2xl bg-white/50 border border-[#A8E6CF]/30 cursor-pointer hover:bg-white/70 transition-all"
                      onClick={() => router.push(`/trainer/sessions`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{s.title}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-600 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(s.date)}
                            </span>
                            <span className="text-xs text-gray-600 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {s.time}
                            </span>
                            <span className="text-xs text-gray-600 flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {s.studentCount} students
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#FF6F61] ml-2" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No upcoming sessions</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Due Payments */}
          <Card
            className="rounded-3xl border-2"
            style={{
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderColor: "rgba(255, 111, 97, 0.3)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-[#FF6F61]" />
                  <span>Due Payments</span>
                </CardTitle>
                <CardDescription>Payments requiring attention</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full"
                onClick={() => router.push("/trainer/payments")}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {duePayments.length > 0 ? (
                  duePayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="p-4 rounded-2xl bg-white/50 border border-[#FF6F61]/30 cursor-pointer hover:bg-white/70 transition-all"
                      onClick={() => router.push("/trainer/payments")}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{payment.studentName}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs font-medium text-[#FF6F61]">
                              ${payment.amount.toFixed(2)}
                            </span>
                            <span className="text-xs text-gray-600 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              Due: {formatDate(payment.dueDate)}
                            </span>
                          </div>
                        </div>
                        <Badge
                          className={`ml-2 ${
                            payment.status === "overdue"
                              ? "bg-red-100 text-red-800"
                              : payment.status === "due_soon"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {payment.status === "overdue" ? "Overdue" : payment.status === "due_soon" ? "Due Soon" : "Due"}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No due payments</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activities - Full Width */}
      {isAdmin && (
        <Card
          className="rounded-3xl border-2"
          style={{
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderColor: "rgba(168, 230, 207, 0.3)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          }}
        >
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center space-x-2">
              <Activity className="w-5 h-5 text-[#A8E6CF]" />
              <span>Recent Activities</span>
            </CardTitle>
            <CardDescription>Latest updates and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-4 rounded-2xl bg-white/50 border border-gray-200/50 hover:bg-white/70 transition-all"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-xl ${
                        activity.type === "attendance" ? "bg-[#A8E6CF]/20" :
                        activity.type === "payment" ? "bg-[#FF6F61]/20" :
                        activity.type === "session" ? "bg-blue-100" :
                        "bg-gray-100"
                      }`}>
                        {activity.type === "attendance" && <CheckCircle className="w-4 h-4 text-[#A8E6CF]" />}
                        {activity.type === "payment" && <CreditCard className="w-4 h-4 text-[#FF6F61]" />}
                        {activity.type === "session" && <Calendar className="w-4 h-4 text-blue-600" />}
                        {activity.type === "student" && <Users className="w-4 h-4 text-gray-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{activity.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{format(new Date(activity.timestamp), "MMM d, h:mm a")}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent activities</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
