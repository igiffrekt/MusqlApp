"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#171725] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#ea3a3d]/20 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-[#ea3a3d]" />
        </div>

        {/* Title */}
        <h1 className="text-white text-2xl font-bold mb-2">
          Hoppá! Valami hiba történt
        </h1>

        {/* Description */}
        <p className="text-white/60 mb-8">
          Sajnáljuk, váratlan hiba lépett fel. Kérjük, próbáld újra vagy térj vissza a főoldalra.
        </p>

        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="bg-[#252a32] rounded-xl p-4 mb-6 text-left">
            <p className="text-[#ea3a3d] text-sm font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-white/40 text-xs mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 flex items-center justify-center gap-2 bg-[#D2F159] hover:bg-[#c5e44d] text-[#171725] rounded-xl py-3 font-medium transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Újrapróbálás
          </button>
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 bg-[#333842] hover:bg-[#3d424d] text-white rounded-xl py-3 font-medium transition-colors"
          >
            <Home className="w-5 h-5" />
            Főoldal
          </Link>
        </div>
      </div>
    </div>
  )
}
