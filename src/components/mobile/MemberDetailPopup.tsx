"use client"

import { useState, useEffect } from "react"
import { X, Phone, Bell, Loader2, Check, AlertCircle, CreditCard, Calendar, Users, Clock, Ticket, Send } from "lucide-react"
import { cn } from "@/lib/utils"

interface GroupInfo {
  id: string
  name: string
  dailyFee: number
  monthlyFee: number
  currency: string
  joinedAt: string
}

interface DebtItem {
  id: string
  amount: number
  dueDate: string
  status: string
  notes?: string
}

interface DebtInfo {
  total: number
  monthly: { count: number; amount: number; items: DebtItem[] }
  daily: { count: number; amount: number; items: DebtItem[] }
  other: { count: number; amount: number; items: DebtItem[] }
}

interface ActivePass {
  id: string
  type: "monthly" | "daily"
  validUntil: string
  amount: number
  paidDate: string
  notes?: string
}

interface ActivePasses {
  monthly: ActivePass | null
  daily: ActivePass | null
  all: ActivePass[]
}

interface PaymentHistory {
  id: string
  amount: number
  paymentType: string
  paidDate: string
  paymentMethod: string
  notes?: string
  validUntil?: string
}

interface StudentDetails {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  status: string
  beltLevel?: string
  guardian?: string
  createdAt: string
}

interface MemberDetailPopupProps {
  memberId: string
  isOpen: boolean
  onClose: () => void
  onPaymentRecorded?: () => void
}

export function MemberDetailPopup({ memberId, isOpen, onClose, onPaymentRecorded }: MemberDetailPopupProps) {
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState<StudentDetails | null>(null)
  const [groups, setGroups] = useState<GroupInfo[]>([])
  const [debts, setDebts] = useState<DebtInfo | null>(null)
  const [activePasses, setActivePasses] = useState<ActivePasses | null>(null)
  const [recentPayments, setRecentPayments] = useState<PaymentHistory[]>([])
  
  // Payment recording state
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentType, setPaymentType] = useState<"daily" | "monthly">("daily")
  const [selectedGroupId, setSelectedGroupId] = useState<string>("")
  const [customAmount, setCustomAmount] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD">("CASH")
  const [savingPayment, setSavingPayment] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  // Notification state
  const [showNotificationForm, setShowNotificationForm] = useState(false)
  const [notificationTitle, setNotificationTitle] = useState("")
  const [notificationMessage, setNotificationMessage] = useState("")
  const [sendingNotification, setSendingNotification] = useState(false)
  const [notificationSuccess, setNotificationSuccess] = useState(false)
  const [notificationError, setNotificationError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && memberId) {
      fetchMemberDetails()
    }
  }, [isOpen, memberId])

  const fetchMemberDetails = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/students/${memberId}/details`)
      if (response.ok) {
        const data = await response.json()
        setStudent(data.student)
        setGroups(data.groups)
        setDebts(data.debts)
        setActivePasses(data.activePasses)
        setRecentPayments(data.recentPayments)
        if (data.groups.length > 0) {
          setSelectedGroupId(data.groups[0].id)
        }
      }
    } catch (error) {
      console.error("Failed to fetch member details:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSelectedGroup = () => groups.find(g => g.id === selectedGroupId)

  const getPaymentAmount = () => {
    if (customAmount) return parseFloat(customAmount)
    const group = getSelectedGroup()
    if (!group) return 0
    return paymentType === "daily" ? group.dailyFee : group.monthlyFee
  }

  const recordPayment = async () => {
    if (!student) return
    
    const amount = getPaymentAmount()
    if (amount <= 0) return

    setSavingPayment(true)
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          amount,
          paymentType: paymentType === "monthly" ? "MEMBERSHIP" : "TUITION",
          paymentMethod,
          notes: paymentType === "daily" ? "Napi jegy" : "Havi bérlet",
        }),
      })

      if (response.ok) {
        setPaymentSuccess(true)
        setShowPaymentForm(false)
        setCustomAmount("")
        await fetchMemberDetails()
        onPaymentRecorded?.()
        setTimeout(() => setPaymentSuccess(false), 2000)
      } else {
        alert("Hiba történt a fizetés rögzítésekor")
      }
    } catch (error) {
      console.error("Failed to record payment:", error)
      alert("Hiba történt a fizetés rögzítésekor")
    } finally {
      setSavingPayment(false)
    }
  }

  const sendNotification = async () => {
    if (!student || !notificationTitle || !notificationMessage) return

    setSendingNotification(true)
    setNotificationError(null)
    try {
      const response = await fetch(`/api/students/${student.id}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: notificationTitle,
          message: notificationMessage,
          type: "INFO",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setNotificationSuccess(true)
        setShowNotificationForm(false)
        setNotificationTitle("")
        setNotificationMessage("")
        setTimeout(() => setNotificationSuccess(false), 2000)
      } else {
        setNotificationError(data.message || "Hiba történt az értesítés küldésekor")
      }
    } catch (error) {
      console.error("Failed to send notification:", error)
      setNotificationError("Hiba történt az értesítés küldésekor")
    } finally {
      setSendingNotification(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("hu-HU", {
      style: "currency",
      currency: "HUF",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatRelativeDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return "Lejárt"
    if (diffDays === 0) return "Ma lejár"
    if (diffDays === 1) return "Holnap lejár"
    if (diffDays <= 7) return `${diffDays} nap múlva lejár`
    return formatDate(dateStr)
  }

  const getPassStatusColor = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 0) return "text-[#ea3a3d]"
    if (diffDays <= 3) return "text-[#f59e0b]"
    return "text-[#1ad598]"
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center">
      <div className="bg-[#252a32] rounded-t-[24px] sm:rounded-[24px] w-full max-w-md max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#D2F159] animate-spin" />
          </div>
        ) : student ? (
          <>
            {/* Header */}
            <div className="sticky top-0 bg-[#252a32] p-6 pb-4 border-b border-white/10 z-10">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-white text-xl font-semibold">
                    {student.firstName} {student.lastName}
                  </h2>
                  {student.guardian && (
                    <p className="text-white/40 text-sm mt-1">Gondviselő: {student.guardian}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3 mt-4">
                {student.phone && (
                  <a
                    href={`tel:${student.phone.replace(/\s/g, "")}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#333842] hover:bg-[#3d424d] rounded-xl py-3 transition-colors"
                  >
                    <Phone className="w-5 h-5 text-[#D2F159]" />
                    <span className="text-white text-sm">Hívás</span>
                  </a>
                )}
                <button
                  onClick={() => setShowNotificationForm(true)}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#333842] hover:bg-[#3d424d] rounded-xl py-3 transition-colors"
                >
                  <Bell className="w-5 h-5 text-[#D2F159]" />
                  <span className="text-white text-sm">Értesítés</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Payment Success Banner */}
              {paymentSuccess && (
                <div className="bg-[#1ad598]/20 border border-[#1ad598]/40 rounded-xl p-4 flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#1ad598]" />
                  <span className="text-[#1ad598] text-sm font-medium">Fizetés sikeresen rögzítve!</span>
                </div>
              )}

              {/* Notification Success Banner */}
              {notificationSuccess && (
                <div className="bg-[#1ad598]/20 border border-[#1ad598]/40 rounded-xl p-4 flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#1ad598]" />
                  <span className="text-[#1ad598] text-sm font-medium">Értesítés elküldve!</span>
                </div>
              )}

              {/* Notification Form */}
              {showNotificationForm && (
                <div className="bg-[#333842] rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-medium">Értesítés küldése</h4>
                    <button
                      onClick={() => {
                        setShowNotificationForm(false)
                        setNotificationError(null)
                      }}
                      className="text-white/40 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {notificationError && (
                    <div className="bg-[#ea3a3d]/20 border border-[#ea3a3d]/40 rounded-lg p-3 text-[#ea3a3d] text-sm">
                      {notificationError}
                    </div>
                  )}

                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Cím</label>
                    <input
                      type="text"
                      value={notificationTitle}
                      onChange={(e) => setNotificationTitle(e.target.value)}
                      placeholder="pl. Emlékeztető"
                      className="w-full bg-[#252a32] border border-white/12 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#D2F159] placeholder:text-white/30"
                    />
                  </div>

                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Üzenet</label>
                    <textarea
                      value={notificationMessage}
                      onChange={(e) => setNotificationMessage(e.target.value)}
                      placeholder="Írd be az üzenetet..."
                      rows={3}
                      className="w-full bg-[#252a32] border border-white/12 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#D2F159] placeholder:text-white/30 resize-none"
                    />
                  </div>

                  <button
                    onClick={sendNotification}
                    disabled={sendingNotification || !notificationTitle || !notificationMessage}
                    className="w-full bg-[#D2F159] hover:bg-[#c5e44d] text-[#171725] rounded-xl py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                  >
                    {sendingNotification ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Küldés...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Értesítés küldése
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Active Passes Section */}
              {activePasses && (activePasses.monthly || activePasses.daily) && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Ticket className="w-4 h-4 text-[#D2F159]" />
                    <h3 className="text-[#D2F159] text-sm font-medium">Aktív bérletek</h3>
                  </div>
                  <div className="space-y-2">
                    {activePasses.monthly && (
                      <div className="bg-[#1ad598]/10 border border-[#1ad598]/40 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">Havi bérlet</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className={cn("w-4 h-4", getPassStatusColor(activePasses.monthly.validUntil))} />
                              <span className={cn("text-sm", getPassStatusColor(activePasses.monthly.validUntil))}>
                                {formatRelativeDate(activePasses.monthly.validUntil)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[#1ad598] font-medium">{formatCurrency(activePasses.monthly.amount)}</p>
                            <p className="text-white/40 text-xs">{formatDate(activePasses.monthly.validUntil)}-ig</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {activePasses.daily && (
                      <div className="bg-[#D2F159]/10 border border-[#D2F159]/40 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">Napi jegy</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className={cn("w-4 h-4", getPassStatusColor(activePasses.daily.validUntil))} />
                              <span className={cn("text-sm", getPassStatusColor(activePasses.daily.validUntil))}>
                                {formatRelativeDate(activePasses.daily.validUntil)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[#D2F159] font-medium">{formatCurrency(activePasses.daily.amount)}</p>
                            <p className="text-white/40 text-xs">Ma érvényes</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* No Active Pass */}
              {activePasses && !activePasses.monthly && !activePasses.daily && debts?.total === 0 && (
                <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/40 rounded-xl p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-[#f59e0b]" />
                  <span className="text-[#f59e0b] font-medium">Nincs aktív bérlet</span>
                </div>
              )}

              {/* Groups Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-white/40" />
                  <h3 className="text-white/60 text-sm font-medium">Csoportok</h3>
                </div>
                {groups.length > 0 ? (
                  <div className="space-y-2">
                    {groups.map(group => (
                      <div key={group.id} className="bg-[#333842] rounded-xl p-3">
                        <p className="text-white font-medium">{group.name}</p>
                        <div className="flex gap-4 mt-1 text-xs text-white/40">
                          <span>Napi: {formatCurrency(group.dailyFee)}</span>
                          <span>Havi: {formatCurrency(group.monthlyFee)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40 text-sm">Nincs csoportban</p>
                )}
              </div>

              {/* Debt Section */}
              {debts && debts.total > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 text-[#ea3a3d]" />
                    <h3 className="text-[#ea3a3d] text-sm font-medium">Tartozás</h3>
                  </div>
                  <div className="bg-[#ea3a3d]/10 border border-[#ea3a3d]/40 rounded-xl p-4">
                    <p className="text-[#ea3a3d] text-2xl font-bold">{formatCurrency(debts.total)}</p>
                    <div className="mt-3 space-y-2 text-sm">
                      {debts.monthly.count > 0 && (
                        <div className="flex justify-between text-white/60">
                          <span>Havi díj ({debts.monthly.count}x)</span>
                          <span className="text-[#ea3a3d]">{formatCurrency(debts.monthly.amount)}</span>
                        </div>
                      )}
                      {debts.daily.count > 0 && (
                        <div className="flex justify-between text-white/60">
                          <span>Napi jegy ({debts.daily.count}x)</span>
                          <span className="text-[#ea3a3d]">{formatCurrency(debts.daily.amount)}</span>
                        </div>
                      )}
                      {debts.other.count > 0 && (
                        <div className="flex justify-between text-white/60">
                          <span>Egyéb ({debts.other.count}x)</span>
                          <span className="text-[#ea3a3d]">{formatCurrency(debts.other.amount)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* No Debt Badge */}
              {debts && debts.total === 0 && activePasses && (activePasses.monthly || activePasses.daily) && (
                <div className="bg-[#1ad598]/10 border border-[#1ad598]/40 rounded-xl p-4 flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#1ad598]" />
                  <span className="text-[#1ad598] font-medium">Nincs tartozás</span>
                </div>
              )}

              {/* Record Payment Section */}
              {!showPaymentForm ? (
                <button
                  onClick={() => setShowPaymentForm(true)}
                  className="w-full flex items-center justify-center gap-2 bg-[#D2F159] hover:bg-[#c5e44d] text-[#171725] rounded-xl py-4 font-medium transition-colors"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Jegy / Bérlet értékesítése</span>
                </button>
              ) : (
                <div className="bg-[#333842] rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-medium">Fizetés rögzítése</h4>
                    <button
                      onClick={() => setShowPaymentForm(false)}
                      className="text-white/40 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Payment Type Toggle */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPaymentType("daily")}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                        paymentType === "daily"
                          ? "bg-[#D2F159] text-[#171725]"
                          : "bg-[#252a32] text-white/60 hover:text-white"
                      )}
                    >
                      Napi jegy
                    </button>
                    <button
                      onClick={() => setPaymentType("monthly")}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                        paymentType === "monthly"
                          ? "bg-[#D2F159] text-[#171725]"
                          : "bg-[#252a32] text-white/60 hover:text-white"
                      )}
                    >
                      Havi bérlet
                    </button>
                  </div>

                  {/* Validity Info */}
                  <div className="bg-[#252a32] rounded-lg p-3 text-sm">
                    <div className="flex items-center gap-2 text-white/60">
                      <Clock className="w-4 h-4" />
                      <span>
                        {paymentType === "daily" 
                          ? "Érvényes: ma éjfélig" 
                          : "Érvényes: 30 napig a mai naptól"}
                      </span>
                    </div>
                  </div>

                  {/* Group Selector (if multiple) */}
                  {groups.length > 1 && (
                    <div>
                      <label className="text-white/60 text-xs mb-1 block">Csoport</label>
                      <select
                        value={selectedGroupId}
                        onChange={(e) => setSelectedGroupId(e.target.value)}
                        className="w-full bg-[#252a32] border border-white/12 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#D2F159]"
                      >
                        {groups.map(g => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Amount */}
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Összeg</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={customAmount || getPaymentAmount()}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="w-full bg-[#252a32] border border-white/12 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#D2F159]"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">Ft</span>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPaymentMethod("CASH")}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                        paymentMethod === "CASH"
                          ? "bg-[#D2F159]/20 text-[#D2F159] border border-[#D2F159]/40"
                          : "bg-[#252a32] text-white/60 border border-white/12"
                      )}
                    >
                      Készpénz
                    </button>
                    <button
                      onClick={() => setPaymentMethod("CARD")}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                        paymentMethod === "CARD"
                          ? "bg-[#D2F159]/20 text-[#D2F159] border border-[#D2F159]/40"
                          : "bg-[#252a32] text-white/60 border border-white/12"
                      )}
                    >
                      Kártya
                    </button>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={recordPayment}
                    disabled={savingPayment || getPaymentAmount() <= 0}
                    className="w-full bg-[#D2F159] hover:bg-[#c5e44d] text-[#171725] rounded-xl py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                  >
                    {savingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Mentés...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Fizetés rögzítése ({formatCurrency(getPaymentAmount())})
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Recent Payments */}
              {recentPayments.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-white/40" />
                    <h3 className="text-white/60 text-sm font-medium">Legutóbbi fizetések</h3>
                  </div>
                  <div className="space-y-2">
                    {recentPayments.slice(0, 5).map(payment => (
                      <div key={payment.id} className="bg-[#333842] rounded-xl p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm">{payment.notes || payment.paymentType}</p>
                            <p className="text-white/40 text-xs">{formatDate(payment.paidDate)}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[#1ad598] font-medium">{formatCurrency(payment.amount)}</span>
                            {payment.validUntil && (
                              <p className="text-white/40 text-xs">{formatDate(payment.validUntil)}-ig</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="p-6 text-center text-white/40">
            Nem található a tag
          </div>
        )}
      </div>
    </div>
  )
}
