"use client"

import { useState, useEffect } from "react"
import { CreditCard, Search, Loader2, AlertCircle, Eye, X, Building2, User, Calendar, CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  type: string
  description: string | null
  createdAt: string
  student: { id: string; name: string } | null
  organization: { id: string; name: string } | null
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [viewPayment, setViewPayment] = useState<Payment | null>(null)
  const [refunding, setRefunding] = useState<string | null>(null)

  useEffect(() => { fetchPayments() }, [])

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/admin/payments")
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setPayments(data.payments || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }

  const handleRefund = async (paymentId: string) => {
    if (!confirm("Are you sure you want to refund this payment?")) return
    setRefunding(paymentId)
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/refund`, { method: "POST" })
      if (!response.ok) throw new Error("Failed to refund")
      await fetchPayments()
    } catch { alert("Failed to process refund") }
    finally { setRefunding(null) }
  }

  const filteredPayments = payments.filter((p) => {
    const matchesSearch = p.student?.name.toLowerCase().includes(search.toLowerCase()) ||
      p.organization?.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      COMPLETED: "bg-green-500/20 text-green-400 border-green-500/40",
      PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
      FAILED: "bg-red-500/20 text-red-400 border-red-500/40",
      REFUNDED: "bg-purple-500/20 text-purple-400 border-purple-500/40",
    }
    const icons: Record<string, typeof CheckCircle> = { COMPLETED: CheckCircle, PENDING: Clock, FAILED: XCircle, REFUNDED: RefreshCw }
    const Icon = icons[status] || Clock
    return <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs", styles[status])}><Icon className="w-3 h-3" />{status}</span>
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("hu-HU", { style: "currency", currency: currency || "HUF" }).format(amount)
  }

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-[#D2F159] animate-spin" /></div>
  if (error) return <div className="flex flex-col items-center justify-center min-h-[400px]"><AlertCircle className="w-12 h-12 text-red-400 mb-4" /><p className="text-white/60">{error}</p></div>

  const totalRevenue = payments.filter(p => p.status === "COMPLETED").reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Payments</h1>
          <p className="text-white/60 mt-1">{payments.length} total • {formatCurrency(totalRevenue, "HUF")} revenue</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input type="text" placeholder="Search payments..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#171725] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-[#D2F159]" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-[#171725] border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#D2F159]">
          <option value="all">All Status</option>
          <option value="COMPLETED">Completed</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      <div className="bg-[#171725] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Payment</th>
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Organization</th>
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Member</th>
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Amount</th>
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Status</th>
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Date</th>
                <th className="text-right px-6 py-4 text-white/60 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? filteredPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#D2F159]/20 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-[#D2F159]" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{payment.type}</p>
                        <p className="text-white/40 text-sm truncate max-w-[200px]">{payment.description || "No description"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="text-white/60">{payment.organization?.name || "N/A"}</span></td>
                  <td className="px-6 py-4"><span className="text-white/60">{payment.student?.name || "N/A"}</span></td>
                  <td className="px-6 py-4"><span className="text-[#D2F159] font-semibold">{formatCurrency(payment.amount, payment.currency)}</span></td>
                  <td className="px-6 py-4">{getStatusBadge(payment.status)}</td>
                  <td className="px-6 py-4"><span className="text-white/60 text-sm">{new Date(payment.createdAt).toLocaleDateString("hu-HU")}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setViewPayment(payment)} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                      {payment.status === "COMPLETED" && (
                        <button onClick={() => handleRefund(payment.id)} disabled={refunding === payment.id} className="p-2 rounded-lg hover:bg-purple-500/10 text-white/60 hover:text-purple-400 transition-colors disabled:opacity-50" title="Refund">
                          {refunding === payment.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-white/40">No payments found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewPayment && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setViewPayment(null)}>
          <div className="bg-[#171725] rounded-2xl p-6 max-w-lg w-full border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Payment Details</h2>
              <button onClick={() => setViewPayment(null)} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5 text-white/60" /></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#0f0f14] rounded-xl">
                <span className="text-white/60">Amount</span>
                <span className="text-2xl font-bold text-[#D2F159]">{formatCurrency(viewPayment.amount, viewPayment.currency)}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-white/60 text-sm">Status</p>{getStatusBadge(viewPayment.status)}</div>
                <div><p className="text-white/60 text-sm">Type</p><p className="text-white">{viewPayment.type}</p></div>
              </div>
              <div className="grid grid-cols-1 gap-3 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3"><Building2 className="w-4 h-4 text-white/40" /><span className="text-white">{viewPayment.organization?.name || "N/A"}</span></div>
                <div className="flex items-center gap-3"><User className="w-4 h-4 text-white/40" /><span className="text-white">{viewPayment.student?.name || "N/A"}</span></div>
                <div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-white/40" /><span className="text-white">{new Date(viewPayment.createdAt).toLocaleString("hu-HU")}</span></div>
              </div>
              {viewPayment.description && (
                <div className="pt-4 border-t border-white/10">
                  <p className="text-white/60 text-sm">Description</p>
                  <p className="text-white">{viewPayment.description}</p>
                </div>
              )}
              <div className="pt-4 border-t border-white/10">
                <p className="text-white/60 text-sm">Payment ID</p>
                <p className="text-white/40 text-xs font-mono">{viewPayment.id}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
