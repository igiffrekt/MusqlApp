"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Building2 } from "lucide-react"

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
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/auth/signin"
          className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>Vissza</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div className="w-full max-w-md relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: "#171725",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}
          >
            <div className="p-8 space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <motion.h2
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl font-bold text-white"
                  style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                >
                  Csatlakozás
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-white/70 text-sm"
                  style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                >
                  Add meg a szervezet kódját
                </motion.p>
              </div>

              {/* Form */}
              <form className="space-y-4" onSubmit={handleLookup}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative"
                >
                  <Input
                    id="slug"
                    name="slug"
                    type="text"
                    required
                    placeholder="pl. suzuki-arena-dojo"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-[#FF6F61] focus:ring-[#FF6F61] rounded-full px-4 py-3 pr-12"
                    style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !slug.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#FF6F61] text-[#171725] hover:bg-[#FF6F61]/80 disabled:opacity-50 transition-colors"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl bg-red-500/20 border border-red-500/30 p-4"
                  >
                    <p className="text-red-400 text-sm text-center" style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
                      {error}
                    </p>
                  </motion.div>
                )}

                {organization && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl bg-[#FF6F61]/20 border border-[#FF6F61]/30 p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-[#FF6F61]/30 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-[#FF6F61]" />
                      </div>
                      <div>
                        <h3
                          className="text-white font-semibold"
                          style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                        >
                          {organization.name}
                        </h3>
                        <p
                          className="text-white/60 text-sm"
                          style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                        >
                          Kód: {organization.slug}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {organization && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <motion.button
                      type="button"
                      onClick={handleContinue}
                      className="relative w-full py-4 px-8 rounded-full font-semibold text-white overflow-hidden"
                      style={{
                        fontFamily: 'Lufga, Inter, sans-serif',
                        backgroundColor: '#FF6F61',
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Tovább a csatlakozáshoz
                    </motion.button>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center pt-4"
                >
                  <p
                    className="text-white/50 text-sm"
                    style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                  >
                    Már regisztrált tag vagy?{" "}
                    <Link href="/auth/tag/signin" className="text-[#FF6F61] hover:text-[#FF6F61]/80">
                      Bejelentkezés
                    </Link>
                  </p>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
