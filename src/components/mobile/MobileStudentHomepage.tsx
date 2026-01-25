"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Bell, Calendar, CreditCard, CheckCircle, Clock, MapPin } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MobileNavbar } from "./MobileNavbar"
import { MobileNotifications } from "./MobileNotifications"
import { useNotificationsStore } from "@/lib/stores/notifications-store"

interface UpcomingSession {
  id: string
  title: string
  location: string
  date: Date
  startTime: string
  group: string
}

interface PaymentInfo {
  nextDue: Date | null
  amount: number
  status: "paid" | "due" | "overdue"
}

interface AttendanceStats {
  total: number
  present: number
  rate: number
}

export function MobileStudentHomepage() {
  const { data: session } = useSession()
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([])
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [loading, setLoading] = useState(true)

  // Notifications from store
  const notifications = useNotificationsStore((state) => state.notifications)
  const notificationsInitialized = useNotificationsStore((state) => state.initialized)
  const fetchNotifications = useNotificationsStore((state) => state.fetchNotifications)
  const unreadCount = notifications.filter((n) => !n.read).length

  const userName = session?.user?.name || "Tag"
  const organizationName = session?.user?.organization?.name || "Egyesulet"
  const userInitials = userName.split(" ").map(n => n[0]).join("").toUpperCase()

  // Fetch notifications from API
  useEffect(() => {
    if (!notificationsInitialized) {
      fetchNotifications()
    }
  }, [notificationsInitialized, fetchNotifications])

  // Load mock data for student dashboard
  useEffect(() => {
    // Mock upcoming sessions for student
    const mockSessions: UpcomingSession[] = [
      {
        id: "1",
        title: "Hobbi edzes",
        location: "Suzuki Arena",
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        startTime: "18:00",
        group: "Felnott hobbi csoport",
      },
      {
        id: "2",
        title: "Technika ora",
        location: "Suzuki Arena",
        date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        startTime: "18:00",
        group: "Felnott hobbi csoport",
      },
      {
        id: "3",
        title: "Szombati intenziv",
        location: "Sport Centrum",
        date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        startTime: "10:00",
        group: "Hetvegi intenziv",
      },
    ]
    setUpcomingSessions(mockSessions)

    // Mock payment info
    setPaymentInfo({
      nextDue: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      amount: 15000,
      status: "due",
    })

    // Mock attendance stats
    setAttendanceStats({
      total: 24,
      present: 20,
      rate: 83,
    })

    setLoading(false)
  }, [])

  const formatDate = (date: Date) => {
    const days = ["Vas", "Het", "Kedd", "Sze", "Csut", "Pen", "Szom"]
    const months = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Szep", "Okt", "Nov", "Dec"]
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}.`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("hu-HU", {
      style: "currency",
      currency: "HUF",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#171725" }}>
        <div className="animate-pulse text-white/50">Betoltes...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "#171725" }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12 border-2 border-[#FF6F61]">
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback className="bg-[#FF6F61]/20 text-[#FF6F61]">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white/60 text-sm" style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
                Szia,
              </p>
              <h1 className="text-white font-semibold text-lg" style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
                {userName}!
              </h1>
            </div>
          </div>
          <button
            onClick={() => setShowNotifications(true)}
            className="relative p-2 rounded-full bg-white/10"
          >
            <Bell className="w-6 h-6 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF6F61] rounded-full text-xs text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
        <p className="text-white/40 text-sm mt-1 ml-15" style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
          {organizationName}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="px-4 grid grid-cols-2 gap-3 mb-6">
        {/* Attendance Card */}
        <div
          className="p-4 rounded-2xl"
          style={{ background: "rgba(210, 241, 89, 0.1)", border: "1px solid rgba(210, 241, 89, 0.2)" }}
        >
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-[#D2F159]" />
            <span className="text-white/60 text-sm" style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
              Jelenlet
            </span>
          </div>
          <p className="text-white text-2xl font-bold" style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
            {attendanceStats?.rate}%
          </p>
          <p className="text-white/40 text-xs" style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
            {attendanceStats?.present}/{attendanceStats?.total} alkalombol
          </p>
        </div>

        {/* Payment Card */}
        <div
          className="p-4 rounded-2xl"
          style={{
            background: paymentInfo?.status === "overdue" ? "rgba(255, 111, 97, 0.1)" : "rgba(255, 255, 255, 0.05)",
            border: paymentInfo?.status === "overdue" ? "1px solid rgba(255, 111, 97, 0.2)" : "1px solid rgba(255, 255, 255, 0.1)"
          }}
        >
          <div className="flex items-center space-x-2 mb-2">
            <CreditCard className={`w-5 h-5 ${paymentInfo?.status === "overdue" ? "text-[#FF6F61]" : "text-white/60"}`} />
            <span className="text-white/60 text-sm" style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
              Fizetes
            </span>
          </div>
          <p className="text-white text-lg font-bold" style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
            {paymentInfo && formatCurrency(paymentInfo.amount)}
          </p>
          <p className={`text-xs ${paymentInfo?.status === "overdue" ? "text-[#FF6F61]" : "text-white/40"}`} style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
            {paymentInfo?.status === "paid" ? "Rendezve" :
             paymentInfo?.status === "overdue" ? "Hatralekos" :
             paymentInfo?.nextDue ? `Hatarido: ${formatDate(paymentInfo.nextDue)}` : ""}
          </p>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="px-4">
        <h2 className="text-white text-lg font-semibold mb-4" style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
          Kovetkezo edzeseim
        </h2>

        {upcomingSessions.length === 0 ? (
          <div
            className="p-6 rounded-2xl text-center"
            style={{ background: "rgba(255, 255, 255, 0.05)" }}
          >
            <Calendar className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40" style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
              Nincs kozelgo edzes
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <div
                key={session.id}
                className="p-4 rounded-2xl"
                style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)" }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-semibold" style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
                    {session.title}
                  </h3>
                  <span
                    className="text-xs px-2 py-1 rounded-full bg-[#FF6F61]/20 text-[#FF6F61]"
                    style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                  >
                    {session.group}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-white/60 text-sm">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>{formatDate(session.date)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>{session.startTime}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-white/40 text-sm mt-1">
                  <MapPin className="w-4 h-4" />
                  <span style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>{session.location}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="px-4 mt-6">
        <h2 className="text-white text-lg font-semibold mb-4" style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
          Gyors elerhetosegek
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            className="p-4 rounded-2xl text-left"
            style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)" }}
          >
            <Calendar className="w-6 h-6 text-[#D2F159] mb-2" />
            <span className="text-white text-sm" style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
              Osszes edzes
            </span>
          </button>
          <button
            className="p-4 rounded-2xl text-left"
            style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)" }}
          >
            <CreditCard className="w-6 h-6 text-[#FF6F61] mb-2" />
            <span className="text-white text-sm" style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
              Fizeteseim
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <MobileNavbar />

      {/* Notifications Panel */}
      <MobileNotifications
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  )
}
