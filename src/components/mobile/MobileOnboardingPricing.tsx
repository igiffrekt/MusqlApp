"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Loader2, Wallet, Check } from "lucide-react"

interface MobileOnboardingPricingProps {
  onBack: () => void
}

export function MobileOnboardingPricing({ onBack }: MobileOnboardingPricingProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [prices, setPrices] = useState({
    monthlyPassPrice: "",
    monthlyPassStudentPrice: "",
    dailyPrice: "",
    dailyStudentPrice: "",
    privateSessionPrice: "",
  })

  const handleChange = (field: keyof typeof prices, value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, "")
    setPrices({ ...prices, [field]: numericValue })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthlyPassPrice: prices.monthlyPassPrice ? parseInt(prices.monthlyPassPrice) : null,
          monthlyPassStudentPrice: prices.monthlyPassStudentPrice ? parseInt(prices.monthlyPassStudentPrice) : null,
          dailyPrice: prices.dailyPrice ? parseInt(prices.dailyPrice) : null,
          dailyStudentPrice: prices.dailyStudentPrice ? parseInt(prices.dailyStudentPrice) : null,
          privateSessionPrice: prices.privateSessionPrice ? parseInt(prices.privateSessionPrice) : null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Nem sikerült menteni az árakat")
      }

      // Clear setup progress and mark as complete
      try {
        sessionStorage.setItem("musql_setup_progress", JSON.stringify({ completedAt: Date.now() }))
      } catch (e) {
        console.error("Failed to mark setup complete:", e)
      }

      // Success - redirect to dashboard
      router.push("/subscribe")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hiba történt")
      setLoading(false)
    }
  }

  const handleSkip = () => {
    // Clear setup progress and mark as complete
    try {
      sessionStorage.setItem("musql_setup_progress", JSON.stringify({ completedAt: Date.now() }))
    } catch (e) {
      console.error("Failed to mark setup complete:", e)
    }
    router.push("/subscribe")
  }

  const formatCurrency = (value: string) => {
    if (!value) return ""
    return new Intl.NumberFormat("hu-HU").format(parseInt(value)) + " Ft"
  }

  return (
    <div className="min-h-screen bg-black font-lufga">
      <div className="min-h-screen bg-[#171725] mx-[5px] my-[5px] rounded-2xl pb-8">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-[#252a32] flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-white text-xl font-semibold">Árazás beállítása</h1>
              <p className="text-white/40 text-sm">3/3 lépés</p>
            </div>
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-[#D2F159]/20 flex items-center justify-center">
              <Wallet className="w-10 h-10 text-[#D2F159]" />
            </div>
          </div>

          <p className="text-white/60 text-center mb-6">
            Add meg a különböző díjakat. Később bármikor módosíthatod a beállításokban.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 space-y-4">
          {/* Monthly Pass */}
          <div className="bg-[#252a32] rounded-2xl p-4 border border-white/10">
            <h3 className="text-white font-medium mb-3">Havi bérlet</h3>
            <div className="space-y-3">
              <div>
                <label className="text-white/40 text-xs mb-1 block">Normál ár</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={prices.monthlyPassPrice}
                    onChange={(e) => handleChange("monthlyPassPrice", e.target.value)}
                    placeholder="15000"
                    className="w-full bg-[#171725] border border-white/10 rounded-xl p-3 text-white placeholder:text-white/30 focus:border-[#D2F159] outline-none pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">Ft</span>
                </div>
              </div>
              <div>
                <label className="text-white/40 text-xs mb-1 block">Diák ár</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={prices.monthlyPassStudentPrice}
                    onChange={(e) => handleChange("monthlyPassStudentPrice", e.target.value)}
                    placeholder="12000"
                    className="w-full bg-[#171725] border border-white/10 rounded-xl p-3 text-white placeholder:text-white/30 focus:border-[#D2F159] outline-none pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">Ft</span>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Pass */}
          <div className="bg-[#252a32] rounded-2xl p-4 border border-white/10">
            <h3 className="text-white font-medium mb-3">Napijegy</h3>
            <div className="space-y-3">
              <div>
                <label className="text-white/40 text-xs mb-1 block">Normál ár</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={prices.dailyPrice}
                    onChange={(e) => handleChange("dailyPrice", e.target.value)}
                    placeholder="3000"
                    className="w-full bg-[#171725] border border-white/10 rounded-xl p-3 text-white placeholder:text-white/30 focus:border-[#D2F159] outline-none pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">Ft</span>
                </div>
              </div>
              <div>
                <label className="text-white/40 text-xs mb-1 block">Diák ár</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={prices.dailyStudentPrice}
                    onChange={(e) => handleChange("dailyStudentPrice", e.target.value)}
                    placeholder="2500"
                    className="w-full bg-[#171725] border border-white/10 rounded-xl p-3 text-white placeholder:text-white/30 focus:border-[#D2F159] outline-none pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">Ft</span>
                </div>
              </div>
            </div>
          </div>

          {/* Private Session */}
          <div className="bg-[#252a32] rounded-2xl p-4 border border-white/10">
            <h3 className="text-white font-medium mb-1">Egyéni óra</h3>
            <p className="text-white/40 text-xs mb-3">Opcionális</p>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={prices.privateSessionPrice}
                onChange={(e) => handleChange("privateSessionPrice", e.target.value)}
                placeholder="10000"
                className="w-full bg-[#171725] border border-white/10 rounded-xl p-3 text-white placeholder:text-white/30 focus:border-[#D2F159] outline-none pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">Ft</span>
            </div>
          </div>

          {error && (
            <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl p-3">
              <p className="text-[#ef4444] text-sm text-center">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-4 space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-[#D2F159] text-[#171725] font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Befejezés
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="w-full py-4 rounded-full border border-white/20 text-white/60 font-medium"
            >
              Kihagyom, később beállítom
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
