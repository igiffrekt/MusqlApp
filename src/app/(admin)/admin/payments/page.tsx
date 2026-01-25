"use client"

import { useState, useEffect } from "react"
import {
  CreditCard,
  Search,
  Building2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  TrendingUp,
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Payment {
  id: string
  amount: number
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED" | "REFUNDED"
  paymentType: "TUITION" | "REGISTRATION" | "EQUIPMENT" | "EVENT" | "OTHER"
  paymentMethod: "CASH" | "CARD" | "BANK_TRANSFER" | "STRIPE" | "OTHER"
  dueDate: string
  paidDate: string | null
  notes: string | null
  createdAt: string
  student: {
    id: string
    firstName: string
    lastName: string
    organization: {
      id: string
      name: string
    }
  }
}

interface PaymentStats {
  totalRevenue: number
  thisMonth: number
  pendingAmount: number
  pendingCount: number
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/admin/payments")
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setPayments(data.payments)
      setStats(data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }

  const filteredPayments = payments.filter((payment) => {
    const studentName = `${payment.student.firstName} ${payment.student.lastName}`.toLowerCase()
    const matchesSearch =
      studentName.includes(search.toLowerCase()) ||
      payment.student.organization.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const config = {
      PAID: { color: "bg-green-500/20 text-green-400 border-green-500/40", icon: CheckCircle },
      PENDING: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40", icon: Clock },
      OVERDUE: { color: "bg-red-500/20 text-red-400 border-red-500/40", icon: AlertCircle },
      CANCELLED: { color: "bg-gray-500/20 text-gray-400 border-gray-500/40", icon: XCircle },
      REFUNDED: { color: "bg-blue-500/20 text-blue-400 border-blue-500/40", icon: CreditCard },
    }
    const { color, icon: Icon } = config[status as keyof typeof config] || config.PENDING
    return (
      <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs", color)}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    )
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("hu-HU").format(amount) + " HUF"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#D2F159] animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-white/60">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Payments</h1>
        <p className="text-white/60 mt-1">{payments.length} total payments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#171725] rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-white/60 text-sm">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatAmount(stats?.totalRevenue || 0)}</p>
        </div>
        <div className="bg-[#171725] rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-white/60 text-sm">This Month</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatAmount(stats?.thisMonth || 0)}</p>
        </div>
        <div className="bg-[#171725] rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <span className="text-white/60 text-sm">Pending</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatAmount(stats?.pendingAmount || 0)}</p>
          <p className="text-white/40 text-sm">{stats?.pendingCount || 0} payments</p>
        </div>
        <div className="bg-[#171725] rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#D2F159]/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#D2F159]" />
            </div>
            <span className="text-white/60 text-sm">Avg Payment</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatAmount(payments.length > 0 ? Math.round((stats?.totalRevenue || 0) / payments.filter(p => p.status === "PAID").length) : 0)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search by student or organization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#171725] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-[#D2F159]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#171725] border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#D2F159]"
        >
          <option value="all">All Status</option>
          <option value="PAID">Paid</option>
          <option value="PENDING">Pending</option>
          <option value="OVERDUE">Overdue</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#171725] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Student</th>
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Organization</th>
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Amount</th>
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Type</th>
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Status</th>
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Method</th>
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">
                        {payment.student.firstName} {payment.student.lastName}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-white/60">
                        <Building2 className="w-4 h-4" />
                        {payment.student.organization.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "font-semibold",
                        payment.status === "PAID" ? "text-green-400" : "text-white"
                      )}>
                        {formatAmount(payment.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white/60 text-sm">{payment.paymentType}</span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(payment.status)}</td>
                    <td className="px-6 py-4">
                      <span className="text-white/60 text-sm">{payment.paymentMethod}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white/60 text-sm">
                        {new Date(payment.dueDate).toLocaleDateString("hu-HU")}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-white/40">
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
