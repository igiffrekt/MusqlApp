"use client"

import { useState, useEffect, useCallback } from "react"
import QRCode from "react-qr-code"
import { motion, AnimatePresence } from "framer-motion"
import { 
  QrCode, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Wallet,
  Loader2
} from "lucide-react"

interface CheckInQRCodeProps {
  className?: string
  size?: number
  showWalletButton?: boolean
}

export function CheckInQRCode({ 
  className = "", 
  size = 200,
  showWalletButton = true 
}: CheckInQRCodeProps) {
  const [token, setToken] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastCheckIn, setLastCheckIn] = useState<Date | null>(null)

  // Fetch new token
  const fetchToken = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch("/api/checkin/generate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Nem sikerült létrehozni a kódot")
      }

      const data = await response.json()
      setToken(data.token)
      setExpiresAt(new Date(data.expiresAt))
      setTimeLeft(data.expiresIn)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hiba történt")
      setToken(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchToken()
  }, [fetchToken])

  // Countdown timer
  useEffect(() => {
    if (!expiresAt) return

    const interval = setInterval(() => {
      const now = new Date()
      const diff = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000))
      setTimeLeft(diff)

      // Auto-refresh when expired or about to expire
      if (diff <= 5) {
        fetchToken()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [expiresAt, fetchToken])

  // Format time left
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Progress percentage for the circle
  const progress = token ? (timeLeft / 60) * 100 : 0

  // Add to wallet (placeholder - would need native implementation)
  const handleAddToWallet = () => {
    // This would trigger native wallet integration
    // For now, show a message
    alert("Apple Wallet / Google Pay integráció hamarosan!")
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* QR Code Container */}
      <div className="relative">
        {/* Circular progress indicator */}
        <svg 
          className="absolute -inset-3 w-[calc(100%+24px)] h-[calc(100%+24px)]"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="2"
          />
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="#D2F159"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${progress * 3.02} 302`}
            transform="rotate(-90 50 50)"
            className="transition-all duration-1000"
          />
        </svg>

        {/* QR Code or Loading/Error state */}
        <div 
          className="relative bg-white rounded-2xl p-4 shadow-xl"
          style={{ width: size + 32, height: size + 32 }}
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center"
              >
                <XCircle className="w-10 h-10 text-red-500 mb-2" />
                <p className="text-red-600 text-sm">{error}</p>
                <button
                  onClick={fetchToken}
                  className="mt-3 flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Újra
                </button>
              </motion.div>
            ) : token ? (
              <motion.div
                key="qr"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <QRCode
                  value={token}
                  size={size}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Timer */}
      {token && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-2"
        >
          <Clock className="w-4 h-4 text-white/50" />
          <span className={`font-mono text-lg ${
            timeLeft <= 10 ? "text-red-400" : "text-white"
          }`}>
            {formatTime(timeLeft)}
          </span>
        </motion.div>
      )}

      {/* Manual refresh button */}
      <button
        onClick={fetchToken}
        disabled={loading}
        className="mt-3 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm text-white/70 hover:text-white transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        Új kód generálása
      </button>

      {/* Add to Wallet button */}
      {showWalletButton && (
        <button
          onClick={handleAddToWallet}
          className="mt-3 flex items-center gap-2 px-4 py-2.5 bg-[#D2F159] hover:bg-[#e5ff7a] rounded-full text-sm text-gray-900 font-medium transition-colors"
        >
          <Wallet className="w-4 h-4" />
          Hozzáadás Wallet-hez
        </button>
      )}

      {/* Last check-in */}
      {lastCheckIn && (
        <div className="mt-4 flex items-center gap-2 text-sm text-white/50">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          Utolsó belépés: {lastCheckIn.toLocaleTimeString("hu-HU")}
        </div>
      )}

      {/* Instructions */}
      <p className="mt-4 text-center text-sm text-white/40 max-w-xs">
        Mutasd meg ezt a kódot a beléptető terminálon a belépéshez
      </p>
    </div>
  )
}

export default CheckInQRCode
