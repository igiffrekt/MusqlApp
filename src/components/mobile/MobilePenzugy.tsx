"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Clock,
  ChevronRight,
  AlertCircle,
  Loader2,
  CreditCard,
  CheckCircle,
  Wallet,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts"

type TimePeriod = "daily" | "monthly" | "annual"

interface UserPayment {
  id: string
  amount: number
  status: "PENDING" | "PAID" | "OVERDUE"
  dueDate: string
  paidDate: string | null
  paymentType: string
}

interface OrgPayment {
  id: string
  amount: number
  status: string
  dueDate: string
  paidDate: string | null
  student: {
    firstName: string
    lastName: string
  }
}

interface OrgStats {
  totalRevenue: number
  thisMonth: number
  pendingAmount: number
  pendingCount: number
  activeMembers: number
  totalSessions: number
}

interface GroupData {
  id: string
  name: string
  memberCount: number
  monthlyFee: number
}

const GROUP_COLORS = ["#D2F159", "#1ad598", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"]

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  TUITION: "Havi tandíj",
  PRIVATE_LESSON: "Magánóra",
  SEMINAR: "Szeminárium",
  EQUIPMENT: "Felszerelés",
  MEMBERSHIP: "Havi tagdíj",
  OTHER: "Egyéb",
}

const getPaymentTypeLabel = (type: string) => PAYMENT_TYPE_LABELS[type] || type

export function MobilePenzugy() {
  const { data: session } = useSession()
  const router = useRouter()
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("monthly")
  const [loading, setLoading] = useState(true)
  
  // Student state
  const [userPayments, setUserPayments] = useState<UserPayment[]>([])
  
  // Admin state
  const [orgStats, setOrgStats] = useState<OrgStats | null>(null)
  const [orgPayments, setOrgPayments] = useState<OrgPayment[]>([])
  const [groups, setGroups] = useState<GroupData[]>([])

  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "TRAINER" || session?.user?.role === "SUPER_ADMIN"

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        if (isAdmin) {
          // Fetch organization-specific data
          const [statsRes, paymentsRes, groupsRes, membersRes] = await Promise.all([
            fetch("/api/payments?status=PAID"),
            fetch("/api/payments?status=PENDING"),
            fetch("/api/groups"),
            fetch("/api/students"),
          ])

          // Calculate stats from payments
          const paidData = statsRes.ok ? await statsRes.json() : { payments: [] }
          const pendingData = paymentsRes.ok ? await paymentsRes.json() : { payments: [] }
          const groupsData = groupsRes.ok ? await groupsRes.json() : { groups: [] }
          const membersData = membersRes.ok ? await membersRes.json() : { students: [] }

          const paidPayments = paidData.payments || []
          const pendingPayments = pendingData.payments || []

          // Calculate this month's revenue
          const now = new Date()
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          const thisMonthRevenue = paidPayments
            .filter((p: OrgPayment) => p.paidDate && new Date(p.paidDate) >= startOfMonth)
            .reduce((sum: number, p: OrgPayment) => sum + p.amount, 0)

          setOrgStats({
            totalRevenue: paidPayments.reduce((sum: number, p: OrgPayment) => sum + p.amount, 0),
            thisMonth: thisMonthRevenue,
            pendingAmount: pendingPayments.reduce((sum: number, p: OrgPayment) => sum + p.amount, 0),
            pendingCount: pendingPayments.length,
            activeMembers: (membersData.students || []).filter((s: { status: string }) => s.status === "ACTIVE").length,
            totalSessions: 0, // Would need sessions API
          })

          // Map pending payments with overdue calculation
          const today = new Date()
          setOrgPayments(pendingPayments.map((p: OrgPayment & { student: { firstName: string; lastName: string } }) => {
            const dueDate = new Date(p.dueDate)
            const daysOverdue = Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)))
            return { ...p, daysOverdue }
          }))

          setGroups(groupsData.groups || [])
        } else {
          // Fetch user's own payments
          const response = await fetch("/api/payments/my")
          if (response.ok) {
            const data = await response.json()
            setUserPayments(data.payments || [])
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchData()
    }
  }, [session, isAdmin])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("hu-HU").format(amount)
  }

  // Student view
  if (!isAdmin) {
    const paidPayments = userPayments.filter(p => p.status === "PAID")
    const pendingPayments = userPayments.filter(p => p.status === "PENDING" || p.status === "OVERDUE")
    const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0)
    const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0)

    return (
      <div className="min-h-screen bg-black font-lufga">
      <div className="min-h-screen bg-[#171725] mx-[5px] my-[5px] pb-24 rounded-2xl">
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#252a32] border border-white/5"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-white text-xl font-semibold">Fizetéseim</h1>
            <div className="w-10" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#D2F159] animate-spin" />
          </div>
        ) : (
          <>
            <div className="px-6 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#252a32] rounded-2xl p-4 border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center mb-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-white/40 text-xs mb-1">Befizetett</p>
                  <p className="text-white text-xl font-bold">
                    {formatCurrency(totalPaid)} <span className="text-sm font-normal text-white/60">Ft</span>
                  </p>
                </div>
                <div className="bg-[#252a32] rounded-2xl p-4 border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center mb-3">
                    <Clock className="w-5 h-5 text-orange-400" />
                  </div>
                  <p className="text-white/40 text-xs mb-1">Függőben</p>
                  <p className="text-white text-xl font-bold">
                    {formatCurrency(totalPending)} <span className="text-sm font-normal text-white/60">Ft</span>
                  </p>
                </div>
              </div>
            </div>

            {pendingPayments.length > 0 && (
              <div className="px-6 mb-6">
                <h2 className="text-white text-lg font-semibold mb-4">Fizetendő</h2>
                <div className="space-y-3">
                  {pendingPayments.map((payment) => (
                    <div key={payment.id} className="bg-[#252a32] rounded-2xl p-4 border border-orange-500/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-orange-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{getPaymentTypeLabel(payment.paymentType)}</p>
                            <p className="text-white/40 text-sm">
                              Határidő: {new Date(payment.dueDate).toLocaleDateString("hu-HU")}
                            </p>
                          </div>
                        </div>
                        <p className="text-white font-bold text-lg">{formatCurrency(payment.amount)} Ft</p>
                      </div>
                      <Link
                        href={`/fizetes/${payment.id}`}
                        className="mt-4 w-full py-3 rounded-full bg-[#D2F159] text-[#171725] font-semibold text-center block"
                      >
                        Fizetés
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="px-6 mb-6">
              <h2 className="text-white text-lg font-semibold mb-4">Korábbi befizetések</h2>
              {paidPayments.length > 0 ? (
                <div className="space-y-3">
                  {paidPayments.map((payment) => (
                    <div key={payment.id} className="bg-[#252a32] rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{getPaymentTypeLabel(payment.paymentType)}</p>
                          <p className="text-white/40 text-sm">
                            {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString("hu-HU") : "-"}
                          </p>
                        </div>
                      </div>
                      <p className="text-green-400 font-semibold">{formatCurrency(payment.amount)} Ft</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#252a32] rounded-2xl p-8 border border-white/5 text-center">
                  <CreditCard className="w-10 h-10 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40">Még nincs korábbi befizetés</p>
                </div>
              )}
            </div>
          </>
        )}

      </div>
      </div>
    )
  }

  // Admin view - organization finances
  const groupRevenues = groups.map((group, index) => ({
    id: group.id,
    name: group.name,
    revenue: group.memberCount * group.monthlyFee,
    members: group.memberCount,
    color: GROUP_COLORS[index % GROUP_COLORS.length],
  }))

  const totalGroupRevenue = groupRevenues.reduce((sum, g) => sum + g.revenue, 0)

  return (
    <div className="min-h-screen bg-black font-lufga">
    <div className="min-h-screen bg-[#171725] mx-[5px] my-[5px] pb-24 rounded-2xl">
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#252a32] border border-white/5"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white text-xl font-semibold">Pénzügyek</h1>
          <div className="w-10" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#D2F159] animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="px-6 mb-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#252a32] rounded-2xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D2F159]/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#D2F159]" />
                  </div>
                </div>
                <p className="text-white/40 text-xs mb-1">Havi bevétel</p>
                <p className="text-white text-xl font-bold">
                  {formatCurrency(orgStats?.thisMonth || 0)} <span className="text-sm font-normal text-white/60">Ft</span>
                </p>
              </div>
              <div className="bg-[#252a32] rounded-2xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1ad598]/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#1ad598]" />
                  </div>
                </div>
                <p className="text-white/40 text-xs mb-1">Aktív tagok</p>
                <p className="text-white text-xl font-bold">
                  {orgStats?.activeMembers || 0} <span className="text-sm font-normal text-white/60">fő</span>
                </p>
              </div>
              <div className="bg-[#252a32] rounded-2xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/20 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-[#f59e0b]" />
                  </div>
                </div>
                <p className="text-white/40 text-xs mb-1">Összes bevétel</p>
                <p className="text-white text-xl font-bold">
                  {formatCurrency(orgStats?.totalRevenue || 0)} <span className="text-sm font-normal text-white/60">Ft</span>
                </p>
              </div>
              <div className="bg-[#252a32] rounded-2xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ef4444]/20 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-[#ef4444]" />
                  </div>
                </div>
                <p className="text-white/40 text-xs mb-1">Tartozások</p>
                <p className="text-white text-xl font-bold">
                  {formatCurrency(orgStats?.pendingAmount || 0)} <span className="text-sm font-normal text-white/60">Ft</span>
                </p>
              </div>
            </div>
          </div>

          {/* Group Revenue Breakdown */}
          {groups.length > 0 && (
            <div className="px-6 mb-6">
              <div className="bg-[#252a32] rounded-[24px] p-5 border border-white/5">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-white text-lg font-semibold">Csoportok bevétele</h2>
                  <span className="text-white/40 text-sm">Havi</span>
                </div>

                <div className="flex items-center gap-6 mb-5">
                  <div className="w-24 h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={groupRevenues.map(g => ({ name: g.name, value: g.revenue, color: g.color }))}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          innerRadius={28}
                          outerRadius={42}
                          paddingAngle={3}
                        >
                          {groupRevenues.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    {groupRevenues.map((group) => (
                      <div key={group.id} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }} />
                        <span className="text-white/60 text-xs truncate">{group.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {groupRevenues.map((group) => (
                    <div key={group.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-8 rounded-full" style={{ backgroundColor: group.color }} />
                        <div>
                          <p className="text-white font-medium text-sm">{group.name}</p>
                          <p className="text-white/40 text-xs">{group.members} tag</p>
                        </div>
                      </div>
                      <p className="text-white font-semibold">{formatCurrency(group.revenue)} Ft</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">Összesen</span>
                    <span className="text-[#D2F159] text-xl font-bold">{formatCurrency(totalGroupRevenue)} Ft</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Due Payments Section */}
          {orgPayments.length > 0 && (
            <div className="px-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-lg font-semibold">Lejárt fizetések</h2>
                <span className="text-white/40 text-sm">{orgPayments.length} db</span>
              </div>

              <div className="space-y-3">
                {orgPayments.slice(0, 5).map((payment: OrgPayment & { daysOverdue?: number }) => (
                  <div
                    key={payment.id}
                    className="bg-[#252a32] rounded-2xl p-4 border border-white/5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#ef4444]/20 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-[#ef4444]" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{payment.student.firstName} {payment.student.lastName}</p>
                        <p className="text-white/40 text-sm">Határidő: {new Date(payment.dueDate).toLocaleDateString("hu-HU")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{formatCurrency(payment.amount)} Ft</p>
                      {payment.daysOverdue && payment.daysOverdue > 0 && (
                        <p className="text-[#ef4444] text-xs">{payment.daysOverdue} napja lejárt</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 bg-[#ef4444]/10 rounded-2xl p-4 border border-[#ef4444]/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-[#ef4444]" />
                    <span className="text-white/80 text-sm">Összes tartozás</span>
                  </div>
                  <span className="text-[#ef4444] text-lg font-bold">
                    {formatCurrency(orgStats?.pendingAmount || 0)} Ft
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {groups.length === 0 && orgPayments.length === 0 && (
            <div className="px-6">
              <div className="bg-[#252a32] rounded-2xl p-8 border border-white/5 text-center">
                <Wallet className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/60 mb-1">Még nincsenek pénzügyi adatok</p>
                <p className="text-white/40 text-sm">Hozz létre csoportokat és tagokat a kezdéshez</p>
              </div>
            </div>
          )}
        </>
      )}

    </div>
    </div>
  )
}
