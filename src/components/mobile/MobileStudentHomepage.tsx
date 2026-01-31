"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Bell, Calendar, CreditCard, Clock, MapPin, User, LogOut, ChevronRight, 
  Loader2, Settings, Info, History, Phone, Mail, ShoppingBag, X, Check,
  AlertCircle, Send, QrCode
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUserProfile } from "@/contexts/UserProfileContext"
import { MobileNotifications } from "./MobileNotifications"
import { useNotificationsStore } from "@/lib/stores/notifications-store"

interface Coach {
  id: string
  name: string
  email?: string
  phone?: string
}

const SESSION_TYPE_LABELS: Record<string, string> = {
  REGULAR: "Edzés",
  PRIVATE: "Magánóra",
  GROUP: "Csoportos",
  SEMINAR: "Szeminárium",
  GRADING: "Vizsgaedzés",
}

const getSessionTypeLabel = (type: string) => SESSION_TYPE_LABELS[type] || type

interface UpcomingSession {
  id: string
  title: string
  location: string
  locationAddress?: string
  date: Date
  startTime: string
  endTime?: string
  group: string
  coach: Coach | null
}

interface PaymentStatus {
  hasDue: boolean
  duePayment?: {
    id: string
    amount: number
    dueDate: Date
  }
  currentMonthPaid: boolean
}

export function MobileStudentHomepage() {
  const { data: session } = useSession()
  const { image: profileImage } = useUserProfile()
  const router = useRouter()
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([])
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showSessionDetail, setShowSessionDetail] = useState<UpcomingSession | null>(null)
  const [showEquipmentModal, setShowEquipmentModal] = useState(false)
  const [equipmentRequest, setEquipmentRequest] = useState("")
  const [sendingEquipment, setSendingEquipment] = useState(false)
  const [showEmailCoachModal, setShowEmailCoachModal] = useState(false)
  const [emailForm, setEmailForm] = useState({ subject: "", message: "" })
  const [sendingEmailCoach, setSendingEmailCoach] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState<{ to: string; name: string; subject: string } | null>(null)
  const [loading, setLoading] = useState(true)

  // Notifications from store
  const notifications = useNotificationsStore((state) => state.notifications)
  const notificationsInitialized = useNotificationsStore((state) => state.initialized)
  const fetchNotifications = useNotificationsStore((state) => state.fetchNotifications)
  const unreadCount = notifications.filter((n) => !n.read).length

  const userName = session?.user?.name || "Tag"
  const organizationName = session?.user?.organization?.name || "Egyesület"
  const userInitials = userName.split(" ").map(n => n[0]).join("").toUpperCase()

  useEffect(() => {
    if (!notificationsInitialized) {
      fetchNotifications()
    }
  }, [notificationsInitialized, fetchNotifications])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch upcoming sessions with trainer info
        const now = new Date()
        const endDate = new Date(now)
        endDate.setDate(endDate.getDate() + 14)
        
        const sessionsRes = await fetch(
          `/api/sessions?startDate=${now.toISOString()}&endDate=${endDate.toISOString()}`
        )
        if (sessionsRes.ok) {
          const data = await sessionsRes.json()
          const sessions = (data.sessions || [])
            .filter((s: { status: string }) => s.status !== "CANCELLED")
            .slice(0, 5)
            .map((s: { 
              id: string
              title: string
              startTime: string
              endTime?: string
              location?: string
              sessionType?: string
              trainer?: { id: string; name: string; email?: string; phone?: string }
              locationData?: { name: string; address?: string }
            }) => ({
              id: s.id,
              title: s.title,
              location: s.locationData?.name || s.location || "Nincs megadva",
              locationAddress: s.locationData?.address,
              date: new Date(s.startTime),
              startTime: new Date(s.startTime).toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" }),
              endTime: s.endTime ? new Date(s.endTime).toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" }) : undefined,
              group: getSessionTypeLabel(s.sessionType || "REGULAR") || "Edzés",
              coach: s.trainer ? {
                id: s.trainer.id,
                name: s.trainer.name,
                email: s.trainer.email,
                phone: s.trainer.phone
              } : null
            }))
          setUpcomingSessions(sessions)
        }

        // Fetch payment status
        const paymentsRes = await fetch("/api/payments/my")
        if (paymentsRes.ok) {
          const data = await paymentsRes.json()
          const payments = data.payments || []
          const pendingPayments = payments.filter(
            (p: { status: string }) => p.status === "PENDING" || p.status === "OVERDUE"
          )
          
          // Check if current month is paid
          const now = new Date()
          const currentMonthPaid = payments.some((p: { status: string; paidDate: string }) => {
            if (p.status !== "PAID" || !p.paidDate) return false
            const paidDate = new Date(p.paidDate)
            return paidDate.getMonth() === now.getMonth() && paidDate.getFullYear() === now.getFullYear()
          })

          if (pendingPayments.length > 0) {
            const payment = pendingPayments[0]
            setPaymentStatus({
              hasDue: true,
              duePayment: {
                id: payment.id,
                amount: payment.amount,
                dueDate: new Date(payment.dueDate)
              },
              currentMonthPaid: false
            })
          } else {
            setPaymentStatus({
              hasDue: false,
              currentMonthPaid
            })
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatDate = (date: Date) => {
    const days = ["Vas", "Hét", "Kedd", "Sze", "Csüt", "Pén", "Szo"]
    const months = ["jan.", "feb.", "márc.", "ápr.", "máj.", "jún.", "júl.", "aug.", "szept.", "okt.", "nov.", "dec."]
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) return "Ma"
    if (date.toDateString() === tomorrow.toDateString()) return "Holnap"
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}.`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("hu-HU").format(amount) + " Ft"
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/signin" })
  }

  const handleSendEquipmentRequest = async () => {
    if (!equipmentRequest.trim()) return
    
    setSendingEquipment(true)
    try {
      // Get coach email from first session or org settings
      const coachEmail = upcomingSessions[0]?.coach?.email
      
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: coachEmail,
          subject: "Felszerelés igény",
          message: equipmentRequest,
          memberName: userName
        })
      })
      
      if (res.ok) {
        setShowEquipmentModal(false)
        setEquipmentRequest("")
      }
    } catch (error) {
      console.error("Failed to send equipment request:", error)
    } finally {
      setSendingEquipment(false)
    }
  }

  const handleSendEmailToCoach = async () => {
    if (!emailForm.subject.trim() || !emailForm.message.trim() || !showSessionDetail?.coach?.email) return
    
    setSendingEmailCoach(true)
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: showSessionDetail.coach.email,
          subject: emailForm.subject,
          message: emailForm.message,
          memberName: userName
        })
      })
      
      if (res.ok) {
        setEmailSuccess({
          to: showSessionDetail.coach.email,
          name: showSessionDetail.coach.name,
          subject: emailForm.subject
        })
        setShowEmailCoachModal(false)
        setEmailForm({ subject: "", message: "" })
      }
    } catch (error) {
      console.error("Failed to send email to coach:", error)
    } finally {
      setSendingEmailCoach(false)
    }
  }

  const closeEmailModal = () => {
    setShowEmailCoachModal(false)
    setEmailForm({ subject: "", message: "" })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black font-lufga">
        <div className="min-h-screen bg-[#171725] flex items-center justify-center mx-[5px] mb-[5px] rounded-b-2xl">
          <Loader2 className="w-8 h-8 text-[#D2F159] animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black font-lufga">
      <div className="min-h-screen bg-[#171725] mx-[5px] mb-[5px] rounded-b-2xl pb-8">
        {/* Header */}
        <div className="px-6 pt-6 pb-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3"
            >
              <Avatar className="w-12 h-12 border-2 border-[#D2F159]">
                <AvatarImage src={profileImage || ""} />
                <AvatarFallback className="bg-[#D2F159]/20 text-[#D2F159]">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-white/60 text-sm">Szia,</p>
                <h1 className="text-white font-semibold text-lg">{userName}!</h1>
              </div>
            </button>
            <div className="flex items-center gap-2">
              <Link
                href="/belepes"
                className="w-12 h-12 rounded-full bg-[#D2F159] flex items-center justify-center shadow-lg shadow-[#D2F159]/20"
              >
                <QrCode className="w-6 h-6 text-[#171725]" />
              </Link>
              <button
                onClick={() => setShowNotifications(true)}
                className="relative w-12 h-12 rounded-full bg-[#252a32] flex items-center justify-center"
              >
                <Bell className="w-6 h-6 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-[#ef4444] rounded-full text-xs text-white flex items-center justify-center px-1">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
          <p className="text-white/40 text-sm mt-1 ml-15">{organizationName}</p>
        </div>

        {/* Profile Menu Dropdown */}
        {showProfileMenu && (
          <div className="px-6 mb-4">
            <div className="bg-[#252a32] rounded-2xl border border-white/10 overflow-hidden">
              <Link
                href="/profil/adatok"
                className="w-full flex items-center justify-between p-4 hover:bg-white/5"
                onClick={() => setShowProfileMenu(false)}
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-[#D2F159]" />
                  <span className="text-white">Személyes adatok</span>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40" />
              </Link>
              <div className="h-px bg-white/10" />
              <Link
                href="/profil/ertesitesek"
                className="w-full flex items-center justify-between p-4 hover:bg-white/5"
                onClick={() => setShowProfileMenu(false)}
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-[#D2F159]" />
                  <span className="text-white">Értesítés beállítások</span>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40" />
              </Link>
              <div className="h-px bg-white/10" />
              <Link
                href="/profil/fizetes-tortenet"
                className="w-full flex items-center justify-between p-4 hover:bg-white/5"
                onClick={() => setShowProfileMenu(false)}
              >
                <div className="flex items-center gap-3">
                  <History className="w-5 h-5 text-[#D2F159]" />
                  <span className="text-white">Fizetési előzmények</span>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40" />
              </Link>
              <div className="h-px bg-white/10" />
              <button
                onClick={() => {
                  setShowProfileMenu(false)
                  // Show app info modal
                }}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-[#D2F159]" />
                  <span className="text-white">Az alkalmazásról</span>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40" />
              </button>
              <div className="h-px bg-white/10" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-4 hover:bg-white/5 text-[#ef4444]"
              >
                <LogOut className="w-5 h-5" />
                <span>Kijelentkezés</span>
              </button>
            </div>
          </div>
        )}

        {/* Upcoming Sessions */}
        <div className="px-6 mb-6">
          <h2 className="text-white text-xl font-semibold mb-4">Következő edzéseim</h2>

          {upcomingSessions.length === 0 ? (
            <div className="bg-[#252a32] p-8 rounded-2xl text-center border border-white/5">
              <Calendar className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/40">Nincs közelgő edzés</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setShowSessionDetail(s)}
                  className="w-full text-left bg-[#252a32] p-4 rounded-2xl border border-white/5 hover:border-[#D2F159]/30 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-semibold">{s.title}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-[#D2F159]/20 text-[#D2F159]">
                      {s.group}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-white/60 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(s.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{s.startTime}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-white/40 text-sm mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{s.location}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Payments Section */}
        <div className="px-6 mb-6">
          <h2 className="text-white text-xl font-semibold mb-4">Befizetések</h2>
          
          <Link
            href="/penzugy"
            className={`block p-4 rounded-2xl border ${
              paymentStatus?.hasDue 
                ? "bg-[#f59e0b]/10 border-[#f59e0b]/30" 
                : "bg-[#1ad598]/10 border-[#1ad598]/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  paymentStatus?.hasDue ? "bg-[#f59e0b]/20" : "bg-[#1ad598]/20"
                }`}>
                  {paymentStatus?.hasDue ? (
                    <AlertCircle className="w-6 h-6 text-[#f59e0b]" />
                  ) : (
                    <Check className="w-6 h-6 text-[#1ad598]" />
                  )}
                </div>
                <div>
                  <p className="text-white font-semibold">
                    {paymentStatus?.hasDue ? "Befizetésre vár" : "Rendezve"}
                  </p>
                  {paymentStatus?.hasDue && paymentStatus.duePayment && (
                    <p className="text-[#f59e0b] text-sm">
                      {formatCurrency(paymentStatus.duePayment.amount)} - {formatDate(paymentStatus.duePayment.dueDate)}
                    </p>
                  )}
                  {!paymentStatus?.hasDue && (
                    <p className="text-[#1ad598] text-sm">Minden befizetés rendezve</p>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40" />
            </div>
          </Link>
        </div>

        {/* Equipment Request Button */}
        <div className="px-6">
          <button
            onClick={() => setShowEquipmentModal(true)}
            className="w-full p-4 rounded-2xl bg-[#252a32] border border-white/10 flex items-center justify-between hover:border-[#D2F159]/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#D2F159]/20 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-[#D2F159]" />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">Felszerelésigény leadása</p>
                <p className="text-white/40 text-sm">Rendelj edzőfelszerelést</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40" />
          </button>
        </div>

        {/* Session Detail Modal */}
        {showSessionDetail && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
            <div className="w-full bg-[#252a32] rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-xl font-bold">{showSessionDetail.title}</h2>
                <button
                  onClick={() => setShowSessionDetail(null)}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Date & Time */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                  <Calendar className="w-5 h-5 text-[#D2F159]" />
                  <div>
                    <p className="text-white font-medium">{formatDate(showSessionDetail.date)}</p>
                    <p className="text-white/60 text-sm">
                      {showSessionDetail.startTime}
                      {showSessionDetail.endTime && ` - ${showSessionDetail.endTime}`}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                  <MapPin className="w-5 h-5 text-[#D2F159]" />
                  <div>
                    <p className="text-white font-medium">{showSessionDetail.location}</p>
                    {showSessionDetail.locationAddress && (
                      <p className="text-white/60 text-sm">{showSessionDetail.locationAddress}</p>
                    )}
                  </div>
                </div>

                {/* Coach */}
                {showSessionDetail.coach && (
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-white/60 text-sm mb-3">Edző</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#D2F159]/20 flex items-center justify-center">
                          <User className="w-6 h-6 text-[#D2F159]" />
                        </div>
                        <p className="text-white font-medium">{showSessionDetail.coach.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {showSessionDetail.coach.phone && (
                          <a
                            href={`tel:${showSessionDetail.coach.phone}`}
                            className="w-10 h-10 rounded-full bg-[#1ad598]/20 flex items-center justify-center"
                          >
                            <Phone className="w-5 h-5 text-[#1ad598]" />
                          </a>
                        )}
                        {showSessionDetail.coach.email && (
                          <button
                            onClick={() => setShowEmailCoachModal(true)}
                            className="w-10 h-10 rounded-full bg-[#D2F159]/20 flex items-center justify-center"
                          >
                            <Mail className="w-5 h-5 text-[#D2F159]" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowSessionDetail(null)}
                className="w-full mt-6 py-4 rounded-full bg-[#D2F159] text-[#171725] font-semibold"
              >
                Bezárás
              </button>
            </div>
          </div>
        )}

        {/* Equipment Request Modal */}
        {showEquipmentModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-[#252a32] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-xl font-bold">Felszerelésigény</h2>
                <button
                  onClick={() => setShowEquipmentModal(false)}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="mb-4">
                <label className="text-white/60 text-sm mb-2 block">Igény leírása</label>
                <textarea
                  value={equipmentRequest}
                  onChange={(e) => setEquipmentRequest(e.target.value)}
                  placeholder="Írd le, milyen felszerelésre van szükséged..."
                  rows={5}
                  className="w-full bg-[#171725] border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 resize-none focus:border-[#D2F159] outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowEquipmentModal(false)}
                  className="flex-1 py-4 rounded-full border border-white/20 text-white font-semibold"
                >
                  Mégse
                </button>
                <button
                  onClick={handleSendEquipmentRequest}
                  disabled={sendingEquipment || !equipmentRequest.trim()}
                  className="flex-1 py-4 rounded-full bg-[#D2F159] text-[#171725] font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {sendingEquipment ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Küldés
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Email Coach Modal */}
        {showEmailCoachModal && showSessionDetail?.coach && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
            <div className="bg-[#252a32] rounded-[24px] w-full max-w-md p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-xl font-semibold">Üzenet küldése</h2>
                <button
                  onClick={closeEmailModal}
                  className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Recipient Info */}
              <div className="bg-[#333842] rounded-lg p-3 mb-4">
                <p className="text-white/60 text-xs">Címzett</p>
                <p className="text-white text-sm">{showSessionDetail.coach.name}</p>
                <p className="text-[#D2F159] text-xs">{showSessionDetail.coach.email}</p>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Subject */}
                <div>
                  <label className="text-white/60 text-xs mb-1 block">Tárgy</label>
                  <input
                    type="text"
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Email tárgya..."
                    className="w-full bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159] placeholder:text-white/30"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="text-white/60 text-xs mb-1 block">Üzenet</label>
                  <textarea
                    value={emailForm.message}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Írja be üzenetét..."
                    rows={6}
                    className="w-full bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159] placeholder:text-white/30 resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeEmailModal}
                  className="flex-1 py-3 rounded-full border border-white/20 text-white text-sm font-medium"
                  disabled={sendingEmailCoach}
                >
                  Mégse
                </button>
                <button
                  onClick={handleSendEmailToCoach}
                  disabled={sendingEmailCoach || !emailForm.subject || !emailForm.message}
                  className="flex-1 py-3 rounded-full bg-[#D2F159] text-[#171725] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingEmailCoach ? "Küldés..." : "Küldés"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Email Success Modal */}
        {emailSuccess && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
            <div className="bg-[#252a32] rounded-[24px] w-full max-w-md p-6">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-[#D2F159]/20 flex items-center justify-center">
                  <Check className="w-10 h-10 text-[#D2F159]" />
                </div>
              </div>

              {/* Success Message */}
              <div className="text-center mb-6">
                <h2 className="text-white text-xl font-semibold mb-2">Email sikeresen elküldve!</h2>
                <p className="text-white/60 text-sm">Az üzenet megérkezett a címzetthez.</p>
              </div>

              {/* Email Details */}
              <div className="bg-[#333842] rounded-xl p-4 mb-6 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#D2F159]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-[#D2F159]" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Címzett</p>
                    <p className="text-white text-sm font-medium">{emailSuccess.name}</p>
                    <p className="text-[#D2F159] text-xs">{emailSuccess.to}</p>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#D2F159]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Mail className="w-4 h-4 text-[#D2F159]" />
                    </div>
                    <div>
                      <p className="text-white/40 text-xs">Tárgy</p>
                      <p className="text-white text-sm">{emailSuccess.subject}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setEmailSuccess(null)}
                className="w-full py-3 rounded-full bg-[#D2F159] text-[#171725] text-sm font-medium"
              >
                Bezárás
              </button>
            </div>
          </div>
        )}

        {/* Notifications Panel */}
        <MobileNotifications
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      </div>
    </div>
  )
}
