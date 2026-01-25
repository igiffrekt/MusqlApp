"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Loader2, CreditCard, Check, Clock, AlertCircle } from "lucide-react"

interface Payment {
  id: string
  amount: number
  status: "PAID" | "PENDING" | "OVERDUE"
  dueDate: string
  paidDate: string | null
  paymentType: string
}

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  TUITION: "Havi tandíj",
  PRIVATE_LESSON: "Magánóra",
  SEMINAR: "Szeminárium",
  EQUIPMENT: "Felszerelés",
  MEMBERSHIP: "Havi tagdíj",
  OTHER: "Egyéb",
}

const getPaymentTypeLabel = (type: string) => PAYMENT_TYPE_LABELS[type] || type

export default function PaymentHistoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<Payment[]>([])

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch("/api/payments/my")
        if (res.ok) {
          const data = await res.json()
          setPayments(data.payments || [])
        }
      } catch (error) {
        console.error("Failed to fetch payments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("hu-HU").format(amount) + " Ft"
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <Check className="w-5 h-5 text-[#1ad598]" />
      case "PENDING":
        return <Clock className="w-5 h-5 text-[#f59e0b]" />
      case "OVERDUE":
        return <AlertCircle className="w-5 h-5 text-[#ef4444]" />
      default:
        return <CreditCard className="w-5 h-5 text-white/60" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "PAID":
        return "Rendezve"
      case "PENDING":
        return "Függőben"
      case "OVERDUE":
        return "Lejárt"
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "text-[#1ad598] bg-[#1ad598]/10"
      case "PENDING":
        return "text-[#f59e0b] bg-[#f59e0b]/10"
      case "OVERDUE":
        return "text-[#ef4444] bg-[#ef4444]/10"
      default:
        return "text-white/60 bg-white/10"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black font-lufga">
        <div className="min-h-screen bg-[#171725] flex items-center justify-center mx-[5px] my-[5px] rounded-2xl">
          <Loader2 className="w-8 h-8 text-[#D2F159] animate-spin" />
        </div>
      </div>
    )
  }

  const paidPayments = payments.filter(p => p.status === "PAID")
  const pendingPayments = payments.filter(p => p.status === "PENDING" || p.status === "OVERDUE")

  return (
    <div className="min-h-screen bg-black font-lufga">
      <div className="min-h-screen bg-[#171725] mx-[5px] my-[5px] rounded-2xl pb-8">
        {/* Header */}
        <div className="px-6 pt-6 pb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-[#252a32] flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-white text-xl font-semibold">Fizetési előzmények</h1>
          </div>
        </div>

        {/* Pending Payments */}
        {pendingPayments.length > 0 && (
          <div className="px-6 mb-6">
            <h2 className="text-white/60 text-sm mb-3">Függőben lévő befizetések</h2>
            <div className="space-y-3">
              {pendingPayments.map((payment) => (
                <div
                  key={payment.id}
                  className={`p-4 rounded-2xl border ${
                    payment.status === "OVERDUE" 
                      ? "bg-[#ef4444]/10 border-[#ef4444]/30" 
                      : "bg-[#f59e0b]/10 border-[#f59e0b]/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(payment.status)}
                      <span className="text-white font-semibold">
                        {getPaymentTypeLabel(payment.paymentType)}
                      </span>
                    </div>
                    <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor(payment.status)}`}>
                      {getStatusText(payment.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Határidő: {formatDate(payment.dueDate)}</span>
                    <span className="text-white font-bold">{formatCurrency(payment.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paid Payments */}
        <div className="px-6">
          <h2 className="text-white/60 text-sm mb-3">Korábbi befizetések</h2>
          {paidPayments.length === 0 ? (
            <div className="bg-[#252a32] p-8 rounded-2xl text-center border border-white/5">
              <CreditCard className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/40">Még nincs korábbi befizetés</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paidPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="p-4 rounded-2xl bg-[#252a32] border border-white/5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(payment.status)}
                      <span className="text-white font-semibold">
                        {getPaymentTypeLabel(payment.paymentType)}
                      </span>
                    </div>
                    <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor(payment.status)}`}>
                      {getStatusText(payment.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">
                      {payment.paidDate ? formatDate(payment.paidDate) : "-"}
                    </span>
                    <span className="text-white font-bold">{formatCurrency(payment.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
