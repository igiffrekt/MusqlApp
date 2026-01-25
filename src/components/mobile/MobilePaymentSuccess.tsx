"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Check, Download, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { jsPDF } from "jspdf"

interface PaymentReceipt {
  transactionId: string
  amount: number
  currency: string
  date: string
  paymentMethod: string
  description: string
}

// Mock receipt data - in production would come from API
const mockReceipt: PaymentReceipt = {
  transactionId: "TXN-2026-0113-001",
  amount: 15000,
  currency: "HUF",
  date: new Date().toISOString(),
  paymentMethod: "SimplePay",
  description: "Havi tagdíj - 2026. január",
}

export function MobilePaymentSuccess() {
  const [showCheck, setShowCheck] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [receipt] = useState<PaymentReceipt>(mockReceipt)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    // Animate the success check mark
    const checkTimer = setTimeout(() => setShowCheck(true), 300)
    const contentTimer = setTimeout(() => setShowContent(true), 800)

    return () => {
      clearTimeout(checkTimer)
      clearTimeout(contentTimer)
    }
  }, [])

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("hu-HU", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleDownloadReceipt = async () => {
    setDownloading(true)

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const pageWidth = doc.internal.pageSize.getWidth()

      // Header
      doc.setFillColor(23, 23, 37) // #171725
      doc.rect(0, 0, pageWidth, 45, "F")

      doc.setTextColor(210, 241, 89) // #D2F159
      doc.setFontSize(24)
      doc.setFont("helvetica", "bold")
      doc.text("MUSQL", pageWidth / 2, 20, { align: "center" })

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text("Fizetési bizonylat", pageWidth / 2, 32, { align: "center" })

      // Receipt content
      doc.setTextColor(60, 60, 60)
      doc.setFontSize(10)

      let y = 60

      // Transaction ID
      doc.setFont("helvetica", "bold")
      doc.text("Tranzakció azonosító:", 20, y)
      doc.setFont("helvetica", "normal")
      doc.text(receipt.transactionId, pageWidth - 20, y, { align: "right" })
      y += 12

      // Date
      doc.setFont("helvetica", "bold")
      doc.text("Dátum:", 20, y)
      doc.setFont("helvetica", "normal")
      doc.text(formatDate(receipt.date), pageWidth - 20, y, { align: "right" })
      y += 12

      // Payment method
      doc.setFont("helvetica", "bold")
      doc.text("Fizetési mód:", 20, y)
      doc.setFont("helvetica", "normal")
      doc.text(receipt.paymentMethod, pageWidth - 20, y, { align: "right" })
      y += 12

      // Description
      doc.setFont("helvetica", "bold")
      doc.text("Leírás:", 20, y)
      doc.setFont("helvetica", "normal")
      doc.text(receipt.description, pageWidth - 20, y, { align: "right" })
      y += 20

      // Divider line
      doc.setDrawColor(200, 200, 200)
      doc.line(20, y, pageWidth - 20, y)
      y += 15

      // Amount (highlighted)
      doc.setFillColor(245, 245, 245)
      doc.roundedRect(20, y - 8, pageWidth - 40, 25, 3, 3, "F")

      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.setTextColor(60, 60, 60)
      doc.text("Fizetett összeg:", 30, y + 5)

      doc.setFontSize(16)
      doc.setTextColor(26, 213, 152) // #1ad598
      doc.text(formatCurrency(receipt.amount, receipt.currency), pageWidth - 30, y + 5, { align: "right" })

      y += 35

      // Success checkmark section
      doc.setTextColor(26, 213, 152)
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("✓ Sikeres fizetés", pageWidth / 2, y, { align: "center" })

      y += 25

      // Footer
      doc.setTextColor(150, 150, 150)
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.text("Ez a bizonylat elektronikusan lett generálva és érvényes aláírás nélkül.", pageWidth / 2, y, { align: "center" })
      doc.text("Köszönjük, hogy a Musql szolgáltatását választotta!", pageWidth / 2, y + 5, { align: "center" })

      // Save the PDF
      const filename = `bizonylat-${receipt.transactionId}.pdf`
      doc.save(filename)
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#171725] pb-32 font-lufga">
      {/* Success Animation Container */}
      <div className="flex flex-col items-center justify-center pt-20 px-6">
        {/* Animated Check Circle */}
        <div
          className={cn(
            "relative w-28 h-28 mb-6 transition-all duration-500",
            showCheck ? "scale-100 opacity-100" : "scale-50 opacity-0"
          )}
        >
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#1ad598] to-[#0fb37e] animate-pulse" />

          {/* Inner circle */}
          <div className="absolute inset-1 rounded-full bg-[#171725] flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1ad598] to-[#0fb37e] flex items-center justify-center">
              <Check
                className={cn(
                  "w-10 h-10 text-white transition-all duration-300 delay-200",
                  showCheck ? "scale-100 opacity-100" : "scale-0 opacity-0"
                )}
                strokeWidth={3}
              />
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div
          className={cn(
            "text-center mb-8 transition-all duration-500 delay-300",
            showContent ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}
        >
          <h1 className="text-white text-2xl font-bold mb-2">Sikeres fizetés!</h1>
          <p className="text-white/60 text-sm">
            A fizetésed sikeresen feldolgozásra került.
          </p>
        </div>

        {/* Receipt Card */}
        <div
          className={cn(
            "w-full bg-[#252a32] rounded-[24px] p-5 transition-all duration-500 delay-500",
            showContent ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}
        >
          <div className="flex items-center gap-3 mb-5 pb-5 border-b border-white/10">
            <div className="w-12 h-12 rounded-full bg-[#333842] flex items-center justify-center">
              <Image
                src="/icons/nav-paper-icon.svg"
                alt="Bizonylat"
                width={24}
                height={24}
                style={{ filter: "brightness(0) saturate(100%) invert(89%) sepia(47%) saturate(497%) hue-rotate(22deg) brightness(103%) contrast(92%)" }}
              />
            </div>
            <div>
              <p className="text-white font-semibold">Fizetési bizonylat</p>
              <p className="text-white/40 text-sm">{receipt.transactionId}</p>
            </div>
          </div>

          {/* Receipt Details */}
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-white/40 text-sm">Összeg</span>
              <span className="text-[#D2F159] font-semibold">
                {formatCurrency(receipt.amount, receipt.currency)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-white/40 text-sm">Dátum</span>
              <span className="text-white text-sm">{formatDate(receipt.date)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-white/40 text-sm">Fizetési mód</span>
              <span className="text-white text-sm">{receipt.paymentMethod}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-white/40 text-sm">Leírás</span>
              <span className="text-white text-sm text-right">{receipt.description}</span>
            </div>
          </div>

          {/* Download Receipt Button */}
          <button
            onClick={handleDownloadReceipt}
            disabled={downloading}
            className="w-full mt-6 py-3 rounded-full border border-white/20 text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            {downloading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Generálás...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Bizonylat letöltése
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#171725] border-t border-[#333842] p-4 z-40">
        <Link
          href="/"
          className="w-full py-4 rounded-full bg-[#D2F159] text-[#171725] text-base font-semibold flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" />
          Vissza a főoldalra
        </Link>
      </div>
    </div>
  )
}
