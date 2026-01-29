"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
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
  Activity,
  Sparkles,
  BarChart3,
  Zap,
  X,
  Loader2,
} from "lucide-react"
import { format, isToday, isTomorrow, startOfMonth, endOfMonth } from "date-fns"
import { hu } from "date-fns/locale"

// Animation variants for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
} as const

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    },
  },
} as const

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

interface StatsCard {
  label: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: React.ElementType
  color: string
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
  const [stats, setStats] = useState<StatsCard[]>([])
  const [showFirstSessionModal, setShowFirstSessionModal] = useState(false)
  const [firstSessionForm, setFirstSessionForm] = useState({ title: "", startDate: "", startTime: "18:00", endTime: "19:30" })

  const userRole = session?.user?.role || "STUDENT"
  const isAdmin = userRole === "ADMIN" || userRole === "TRAINER"
  const isStudent = userRole === "STUDENT"
  const userName = session?.user?.name?.split(" ")[0] || "Felhasználó"

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Check if new org needs setup (no locations or sessions yet)
  useEffect(() => {
    const checkSetupNeeded = async () => {
      if (status !== "authenticated") return

      const role = session?.user?.role
      const userIsAdmin = role === "ADMIN" || role === "TRAINER"

      if (!userIsAdmin) return

      try {
        // First check locations
        const locResponse = await fetch("/api/locations")
        if (locResponse.ok) {
          const locData = await locResponse.json()
          if (!locData.locations || locData.locations.length === 0) {
            router.replace("/setup")
            return
          }
        }

        // Then check sessions - if no sessions exist, redirect to create first one
        const sessResponse = await fetch("/api/sessions")
        if (sessResponse.ok) {
          const sessData = await sessResponse.json()
          if (!sessData.sessions || sessData.sessions.length === 0) {
            setShowFirstSessionModal(true)
            return
          }
        }
      } catch (err) {
        console.error("Failed to check setup:", err)
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

  const createFirstSession = async () => {
    if (!firstSessionForm.title || !firstSessionForm.startDate) return
    try {
      const startDateTime = new Date(firstSessionForm.startDate + "T" + firstSessionForm.startTime)
      const endDateTime = new Date(firstSessionForm.startDate + "T" + firstSessionForm.endTime)
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: firstSessionForm.title,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          sessionType: "REGULAR",
        }),
      })
      if (res.ok) {
        setShowFirstSessionModal(false)
        loadDashboardData()
      }
    } catch (e) { console.error(e) }
  }

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
            trainer: s.trainer?.name || "Edző",
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

        // Generate mock stats for now
        setStats([
          { label: "Aktív tagok", value: 127, change: "+12%", changeType: "positive", icon: Users, color: "#FF6F61" },
          { label: "Havi bevétel", value: "1.2M Ft", change: "+8%", changeType: "positive", icon: TrendingUp, color: "#D2F159" },
          { label: "Edzések (hónap)", value: 48, change: "+5", changeType: "positive", icon: Calendar, color: "#A8E6CF" },
          { label: "Jelenlét", value: "94%", change: "+2%", changeType: "positive", icon: CheckCircle, color: "#FFD93D" },
        ])

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
            trainer: s.trainer?.name || "Edző",
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
        title: "Edzés ütemezése",
        stage: "Tervezés",
        status: "completed",
        assignedTo: "Edző",
        date: new Date().toISOString()
      },
      {
        id: "2",
        title: "Tagok értesítése",
        stage: "Tervezés",
        status: "completed",
        assignedTo: "Rendszer",
        date: new Date().toISOString()
      },
      {
        id: "3",
        title: "Edzés indul",
        stage: "Jelenlét",
        status: "active",
        assignedTo: "Edző",
        date: new Date().toISOString()
      },
      {
        id: "4",
        title: "Jelenlét rögzítése",
        stage: "Jelenlét",
        status: "pending",
        assignedTo: "Edző"
      },
      {
        id: "5",
        title: "Fizetés rögzítése",
        stage: "Pénzügy",
        status: "pending",
        assignedTo: "Edző"
      },
      {
        id: "6",
        title: "Statisztika frissítése",
        stage: "Pénzügy",
        status: "pending",
        assignedTo: "Rendszer"
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
        return <Zap className="w-4 h-4" />
      case "pending":
        return <Clock className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) return "Ma"
    if (isTomorrow(date)) return "Holnap"
    return format(date, "MMM d.", { locale: hu })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#FF6F61]/20 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-[#FF6F61] border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-white/60 mt-4">Betöltés...</p>
        </motion.div>
      </div>
    )
  }

  // Show mobile homepage on small screens
  if (isMobile) {
    if (isStudent) {
      return <MobileStudentHomepage />
    }
    return <MobileHomepage />
  }

  // Desktop dashboard
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">
              Szia, {userName}! 👋
            </h1>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Sparkles className="w-6 h-6 text-[#D2F159]" />
            </motion.div>
          </div>
          <p className="text-white/60">
            {format(new Date(), "yyyy. MMMM d., EEEE", { locale: hu })}
          </p>
        </div>
        {isAdmin && (
          <Button
            className="bg-gradient-to-r from-[#FF6F61] to-[#D2F159] text-gray-900 hover:opacity-90 rounded-xl px-6 py-2.5 font-semibold shadow-lg shadow-[#FF6F61]/20"
            onClick={() => router.push("/trainer/sessions")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Új edzés
          </Button>
        )}
      </motion.div>

      {/* Stats Cards - Admin/Trainer only */}
      {isAdmin && stats.length > 0 && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="relative overflow-hidden"
            >
              <Card className="rounded-2xl border-0 bg-[#1E1E2D] hover:bg-[#252536] transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white/50 text-sm font-medium mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      {stat.change && (
                        <div className={`flex items-center gap-1 mt-1 text-sm ${
                          stat.changeType === "positive" ? "text-[#A8E6CF]" :
                          stat.changeType === "negative" ? "text-[#FF6F61]" :
                          "text-white/40"
                        }`}>
                          <TrendingUp className="w-3 h-3" />
                          <span>{stat.change}</span>
                        </div>
                      )}
                    </div>
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${stat.color}20` }}
                    >
                      <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                    </div>
                  </div>
                  {/* Decorative gradient */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1 opacity-50"
                    style={{ background: `linear-gradient(to right, ${stat.color}, transparent)` }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Workflow Visualization - Admin/Trainer View */}
      {isAdmin && (
        <motion.div variants={itemVariants}>
          <Card className="rounded-2xl border-0 bg-[#1E1E2D] overflow-hidden">
            <CardHeader className="border-b border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#FF6F61]" />
                    Edzés Workflow
                  </CardTitle>
                  <CardDescription className="text-white/50">
                    Tervezés → Jelenlét → Pénzügy
                  </CardDescription>
                </div>
                <Badge className="bg-[#FF6F61]/20 text-[#FF6F61] border-0">
                  Aktív folyamat
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Workflow Stages */}
                {["Tervezés", "Jelenlét", "Pénzügy"].map((stage, stageIndex) => (
                  <div key={stage} className="space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        stageIndex === 0 ? "bg-[#A8E6CF]/20 text-[#A8E6CF]" :
                        stageIndex === 1 ? "bg-[#FF6F61]/20 text-[#FF6F61]" :
                        "bg-[#D2F159]/20 text-[#D2F159]"
                      }`}>
                        {stageIndex + 1}
                      </div>
                      <h3 className="font-semibold text-white">{stage}</h3>
                    </div>
                    <AnimatePresence>
                      {workflowSteps
                        .filter(step => step.stage === stage)
                        .map((step, index) => (
                          <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            className={`p-4 rounded-xl border transition-all cursor-pointer ${
                              step.status === "completed"
                                ? "bg-[#A8E6CF]/10 border-[#A8E6CF]/30"
                                : step.status === "active"
                                ? "bg-[#FF6F61]/10 border-[#FF6F61]/30 shadow-lg shadow-[#FF6F61]/10"
                                : "bg-white/5 border-white/10"
                            }`}
                            onClick={() => {
                              if (step.title.includes("Edzés")) router.push("/trainer/sessions")
                              if (step.title.includes("Jelenlét")) router.push("/trainer/attendance")
                              if (step.title.includes("Fizetés")) router.push("/trainer/payments")
                            }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(step.status)}
                                <span className="font-medium text-sm text-white">{step.title}</span>
                              </div>
                              <Badge className={`${getStatusColor(step.status)} border-0 text-xs`}>
                                {step.status === "completed" ? "Kész" : step.status === "active" ? "Aktív" : "Várakozik"}
                              </Badge>
                            </div>
                            {step.assignedTo && (
                              <div className="flex items-center gap-2 mt-2">
                                <User className="w-3 h-3 text-white/40" />
                                <span className="text-xs text-white/50">{step.assignedTo}</span>
                              </div>
                            )}
                          </motion.div>
                        ))}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Student View - Simplified */}
      {isStudent && (
        <motion.div variants={itemVariants}>
          <Card className="rounded-2xl border-0 bg-[#1E1E2D]">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#D2F159]" />
                Edzés naptáram
              </CardTitle>
              <CardDescription className="text-white/50">
                Közelgő edzéseid és fizetési státuszod
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#A8E6CF]" />
                    Közelgő edzések
                  </h3>
                  {upcomingSessions.length > 0 ? (
                    upcomingSessions.map((s) => (
                      <motion.div
                        key={s.id}
                        whileHover={{ scale: 1.02 }}
                        className="p-4 rounded-xl bg-[#A8E6CF]/10 border border-[#A8E6CF]/30 cursor-pointer"
                        onClick={() => router.push(`/trainer/sessions`)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white">{s.title}</p>
                            <p className="text-sm text-white/60">{formatDate(s.date)} · {s.time}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#A8E6CF]" />
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-white/40 text-sm">Nincs közelgő edzés</p>
                  )}
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#FF6F61]" />
                    Fizetési státusz
                  </h3>
                  {duePayments.length > 0 ? (
                    duePayments.map((payment) => (
                      <motion.div
                        key={payment.id}
                        whileHover={{ scale: 1.02 }}
                        className="p-4 rounded-xl bg-[#FF6F61]/10 border border-[#FF6F61]/30 cursor-pointer"
                        onClick={() => router.push("/trainer/payments")}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white">{payment.amount.toLocaleString()} Ft</p>
                            <p className="text-sm text-white/60">Esedékes: {formatDate(payment.dueDate)}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#FF6F61]" />
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl bg-[#A8E6CF]/10 border border-[#A8E6CF]/30">
                      <p className="text-[#A8E6CF] font-medium flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Minden rendezve!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Bottom Sections - Two Columns */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Sessions */}
          <motion.div variants={itemVariants}>
            <Card className="rounded-2xl border-0 bg-[#1E1E2D] h-full">
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/5">
                <div>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#A8E6CF]" />
                    Közelgő edzések
                  </CardTitle>
                  <CardDescription className="text-white/50">
                    A hét edzései
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
                  onClick={() => router.push("/trainer/sessions")}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {upcomingSessions.length > 0 ? (
                    upcomingSessions.map((s, index) => (
                      <motion.div
                        key={s.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.01, x: 4 }}
                        className="p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:border-[#A8E6CF]/30 transition-all"
                        onClick={() => router.push(`/trainer/sessions`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-white">{s.title}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-white/50 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(s.date)}
                              </span>
                              <span className="text-xs text-white/50 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {s.time}
                              </span>
                              <span className="text-xs text-white/50 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {s.studentCount}
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#A8E6CF] ml-2" />
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 mx-auto mb-2 text-white/20" />
                      <p className="text-sm text-white/40">Nincs közelgő edzés</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Due Payments */}
          <motion.div variants={itemVariants}>
            <Card className="rounded-2xl border-0 bg-[#1E1E2D] h-full">
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/5">
                <div>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-[#FF6F61]" />
                    Esedékes fizetések
                  </CardTitle>
                  <CardDescription className="text-white/50">
                    Figyelmet igénylő fizetések
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
                  onClick={() => router.push("/trainer/payments")}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {duePayments.length > 0 ? (
                    duePayments.map((payment, index) => (
                      <motion.div
                        key={payment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.01, x: 4 }}
                        className="p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:border-[#FF6F61]/30 transition-all"
                        onClick={() => router.push("/trainer/payments")}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-white">{payment.studentName}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs font-medium text-[#FF6F61]">
                                {payment.amount.toLocaleString()} Ft
                              </span>
                              <span className="text-xs text-white/50 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(payment.dueDate)}
                              </span>
                            </div>
                          </div>
                          <Badge
                            className={`ml-2 border-0 ${
                              payment.status === "overdue"
                                ? "bg-red-500/20 text-red-400"
                                : payment.status === "due_soon"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-gray-500/20 text-gray-400"
                            }`}
                          >
                            {payment.status === "overdue" ? "Lejárt" : payment.status === "due_soon" ? "Hamarosan" : "Esedékes"}
                          </Badge>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 mx-auto mb-2 text-[#A8E6CF]/40" />
                      <p className="text-sm text-white/40">Minden rendben!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Recent Activities - Full Width */}
      {isAdmin && recentActivities.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="rounded-2xl border-0 bg-[#1E1E2D]">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#D2F159]" />
                Legutóbbi aktivitások
              </CardTitle>
              <CardDescription className="text-white/50">
                Mi történt mostanában
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {recentActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        activity.type === "attendance" ? "bg-[#A8E6CF]/20" :
                        activity.type === "payment" ? "bg-[#FF6F61]/20" :
                        activity.type === "session" ? "bg-[#D2F159]/20" :
                        "bg-white/10"
                      }`}>
                        {activity.type === "attendance" && <CheckCircle className="w-4 h-4 text-[#A8E6CF]" />}
                        {activity.type === "payment" && <CreditCard className="w-4 h-4 text-[#FF6F61]" />}
                        {activity.type === "session" && <Calendar className="w-4 h-4 text-[#D2F159]" />}
                        {activity.type === "student" && <Users className="w-4 h-4 text-white/60" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-white truncate">{activity.title}</p>
                        <p className="text-xs text-white/40 mt-0.5 truncate">{activity.description}</p>
                        <p className="text-xs text-white/30 mt-1">
                          {format(new Date(activity.timestamp), "MMM d., HH:mm", { locale: hu })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* First Session Modal */}
      {showFirstSessionModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E1E2D]/95 backdrop-blur-xl rounded-2xl border border-white/10 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Hozd létre az első edzésed!</h2>
              <button onClick={() => setShowFirstSessionModal(false)} className="p-2 text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-white/60 text-sm block mb-2">Edzés neve *</label>
                <input
                  type="text"
                  value={firstSessionForm.title}
                  onChange={(e) => setFirstSessionForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="pl. Kezdő csoport edzés"
                  className="w-full bg-[#252a32] text-white rounded-xl px-4 py-3 placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#D2F159]"
                />
              </div>
              
              <div>
                <label className="text-white/60 text-sm block mb-2">Dátum *</label>
                <input
                  type="date"
                  value={firstSessionForm.startDate}
                  onChange={(e) => setFirstSessionForm(p => ({ ...p, startDate: e.target.value }))}
                  className="w-full bg-[#252a32] text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D2F159] [color-scheme:dark]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-sm block mb-2">Kezdés</label>
                  <input
                    type="time"
                    value={firstSessionForm.startTime}
                    onChange={(e) => setFirstSessionForm(p => ({ ...p, startTime: e.target.value }))}
                    className="w-full bg-[#252a32] text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D2F159] [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm block mb-2">Befejezés</label>
                  <input
                    type="time"
                    value={firstSessionForm.endTime}
                    onChange={(e) => setFirstSessionForm(p => ({ ...p, endTime: e.target.value }))}
                    className="w-full bg-[#252a32] text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D2F159] [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowFirstSessionModal(false)}
                className="flex-1 py-3 rounded-xl border border-white/20 text-white font-medium"
              >
                Később
              </button>
              <button
                onClick={createFirstSession}
                disabled={!firstSessionForm.title || !firstSessionForm.startDate}
                className="flex-1 py-3 rounded-xl bg-[#D2F159] text-[#171725] font-semibold disabled:opacity-50"
              >
                Létrehozás
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
