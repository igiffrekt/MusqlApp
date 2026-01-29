"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, Search, Building2, Loader2, UserPlus } from "lucide-react"

interface Organization {
  id: string
  name: string
  slug: string
}

export default function TagJoin() {
  const [slug, setSlug] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [organization, setOrganization] = useState<Organization | null>(null)
  const router = useRouter()

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!slug.trim()) return

    setError("")
    setIsLoading(true)
    setOrganization(null)

    try {
      const response = await fetch(`/api/organizations/lookup?slug=${encodeURIComponent(slug.trim().toLowerCase())}`)
      const data = await response.json()

      if (response.ok) {
        setOrganization(data)
      } else {
        setError(data.message || "Szervezet nem található")
      }
    } catch (error) {
      console.error("Lookup error:", error)
      setError("Hálózati hiba. Kérlek, próbáld újra.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinue = () => {
    if (organization) {
      router.push(`/auth/tag/signup?org=${organization.slug}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#171725" }}>
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 lg:w-[500px] lg:h-[500px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, #FF6F61 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 lg:w-[500px] lg:h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #D2F159 0%, transparent 70%)" }}
          animate={{ scale: [1.2, 1, 1.2], x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Back Button */}
      <motion.div 
        className="absolute top-6 left-6 z-20"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Link
          href="/auth/signin"
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Vissza</span>
        </Link>
      </motion.div>

      {/* Logo */}
      <motion.div 
        className="absolute top-6 right-6 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Image src="/img/musql_logo.png" alt="Musql" width={150} height={40} className="h-8 lg:h-10 w-auto" />
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 pt-20 lg:pt-4">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-[#1E1E2D]/80 backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-white/10">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FF6F61] to-[#FF6F61]/70 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#FF6F61]/20">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                Csatlakozás
              </h1>
              <p className="text-white/60">
                Add meg a szervezet kódját
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLookup} className="space-y-4">
              <div>
                <label className="text-white/60 text-sm block mb-2">Szervezet kódja</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    required
                    placeholder="pl. suzuki-arena-dojo"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-[#252a32] text-white rounded-xl pl-12 pr-14 py-4 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF6F61] transition-all"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !slug.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-lg bg-[#FF6F61] text-white hover:bg-[#FF6F61]/80 disabled:opacity-50 transition-all"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/20 border border-red-500/50 text-red-400 rounded-xl px-4 py-3 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              {organization && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#FF6F61]/10 border border-[#FF6F61]/20 rounded-xl p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#FF6F61]/20 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-[#FF6F61]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-white font-semibold truncate">
                        {organization.name}
                      </h3>
                      <p className="text-white/40 text-sm">
                        Kód: {organization.slug}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {organization && (
                <motion.button
                  type="button"
                  onClick={handleContinue}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full bg-gradient-to-r from-[#FF6F61] to-[#ff8577] text-white rounded-xl py-4 font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-[#FF6F61]/20"
                >
                  Tovább a csatlakozáshoz
                </motion.button>
              )}

              <p className="text-center text-white/40 text-sm pt-2">
                Már regisztrált tag vagy?{" "}
                <Link href="/auth/tag/signin" className="text-[#FF6F61] hover:text-[#FF6F61]/80 transition-colors">
                  Bejelentkezés
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
