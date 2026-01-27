"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"

export default function SetupOrgPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [orgName, setOrgName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.replace("/auth/signin")
    return null
  }

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#171725] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D2F159] animate-spin" />
      </div>
    )
  }

  // If user already has an org, redirect to setup (locations)
  if (session?.user?.organizationId) {
    router.replace("/setup")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgName.trim()) {
      setError("Szervezet neve kötelező")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/setup-org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationName: orgName.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Hiba történt")
      }

      // Update the session to include the new organizationId
      await update()
      
      // Redirect to location setup
      router.push("/setup")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hiba történt")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#171725] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#D2F159] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🏢</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Hozd létre a szervezeted
          </h1>
          <p className="text-white/60">
            Add meg a szervezeted nevét a folytatáshoz
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-white/60 text-sm block mb-2">
              Szervezet neve *
            </label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="pl. Fitness Studio Budapest"
              className="w-full bg-[#252a32] text-white rounded-xl px-4 py-4 text-base placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#D2F159]"
              disabled={loading}
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !orgName.trim()}
            className="w-full bg-[#D2F159] text-[#171725] rounded-full py-4 font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Létrehozás...
              </>
            ) : (
              "Folytatás"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
