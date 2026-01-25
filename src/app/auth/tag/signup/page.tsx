"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Building2, CheckCircle, Loader2 } from "lucide-react"

interface Organization {
  id: string
  name: string
  slug: string
}

function TagSignUpContent() {
  const searchParams = useSearchParams()
  const orgSlug = searchParams.get("org")

  const [organization, setOrganization] = useState<Organization | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Fetch organization on mount
  useEffect(() => {
    if (orgSlug) {
      fetchOrganization(orgSlug)
    }
  }, [orgSlug])

  const fetchOrganization = async (slug: string) => {
    try {
      const response = await fetch(`/api/organizations/lookup?slug=${encodeURIComponent(slug)}`)
      if (response.ok) {
        const data = await response.json()
        setOrganization(data)
      }
    } catch (error) {
      console.error("Failed to fetch organization:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!organization) {
      setError("Kérlek előbb válaszd ki a szervezetet")
      return
    }

    if (!formData.name.trim()) {
      setError("Név megadása kötelező")
      return
    }

    if (!formData.email.trim()) {
      setError("Email megadása kötelező")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/join-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: organization.slug,
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim() || null,
          message: formData.message.trim() || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
      } else {
        setError(data.message || "Hiba történt a kérelem küldése során")
      }
    } catch (error) {
      console.error("Join request error:", error)
      setError("Hálózati hiba. Kérlek, próbáld újra.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#171725" }}>
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md text-center"
          >
            <div className="w-20 h-20 rounded-full bg-[#FF6F61]/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[#FF6F61]" />
            </div>
            <h2
              className="text-2xl font-bold text-white mb-4"
              style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
            >
              Kérelmed elküldve!
            </h2>
            <p
              className="text-white/70 mb-8"
              style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
            >
              A szervezet adminisztrátora hamarosan jóváhagyja a kérelmedet.
              Értesíteni fogunk email-ben.
            </p>
            <Link
              href="/auth/signin"
              className="inline-block py-3 px-6 rounded-full text-white/70 hover:text-white border border-white/20 hover:border-white/40 transition-colors"
              style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
            >
              Vissza a főoldalra
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  if (!orgSlug) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#171725" }}>
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md text-center"
          >
            <h2
              className="text-2xl font-bold text-white mb-4"
              style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
            >
              Előbb válaszd ki a szervezetet
            </h2>
            <p
              className="text-white/70 mb-8"
              style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
            >
              A csatlakozáshoz előbb add meg a szervezet kódját.
            </p>
            <Link
              href="/auth/tag/join"
              className="inline-block py-4 px-8 rounded-full font-semibold text-white bg-[#FF6F61] hover:bg-[#FF6F61]/90 transition-colors"
              style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
            >
              Szervezet keresése
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#171725" }}>
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/auth/tag/join"
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
                  Csatlakozási kérelem
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-white/70 text-sm"
                  style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                >
                  Töltsd ki az adataidat
                </motion.p>
              </div>

              {/* Organization Info */}
              {organization && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl bg-[#FF6F61]/10 border border-[#FF6F61]/20 p-4"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FF6F61]/20 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-[#FF6F61]" />
                    </div>
                    <div>
                      <p
                        className="text-white/60 text-xs"
                        style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                      >
                        Csatlakozas ide:
                      </p>
                      <h3
                        className="text-white font-semibold"
                        style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                      >
                        {organization.name}
                      </h3>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Form */}
              <form className="space-y-4" onSubmit={handleSubmit}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Teljes neved *"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-[#FF6F61] focus:ring-[#FF6F61] rounded-full px-4 py-3"
                    style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="Email címed *"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-[#FF6F61] focus:ring-[#FF6F61] rounded-full px-4 py-3"
                    style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Telefonszám (opcionális)"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-[#FF6F61] focus:ring-[#FF6F61] rounded-full px-4 py-3"
                    style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Üzenet az edzőnek (opcionális)"
                    value={formData.message}
                    onChange={handleChange}
                    rows={3}
                    className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-[#FF6F61] focus:ring-[#FF6F61] rounded-2xl px-4 py-3 resize-none"
                    style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                  />
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-full bg-red-500/20 border border-red-500/30 p-3"
                  >
                    <p className="text-red-400 text-sm text-center" style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
                      {error}
                    </p>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  style={{ marginTop: '30px' }}
                >
                  <motion.button
                    type="submit"
                    disabled={isLoading || !organization}
                    className="relative w-full py-4 px-8 rounded-full font-semibold text-white overflow-hidden disabled:opacity-50"
                    style={{
                      fontFamily: 'Lufga, Inter, sans-serif',
                      backgroundColor: '#FF6F61',
                      cursor: isLoading ? 'not-allowed' : 'pointer'
                    }}
                    whileHover={!isLoading ? { scale: 1.02 } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                  >
                    {isLoading ? "Küldés..." : "Kérelem küldése"}
                  </motion.button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  className="text-center"
                >
                  <Link
                    href="/auth/tag/signin"
                    className="text-white/70 text-sm transition-colors"
                    style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                  >
                    Már regisztrált tag vagy? <span className="text-[#FF6F61] hover:text-[#FF6F61]/80">Bejelentkezés</span>
                  </Link>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function TagSignUp() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#171725" }}>
        <Loader2 className="w-8 h-8 text-[#D2F159] animate-spin" />
      </div>
    }>
      <TagSignUpContent />
    </Suspense>
  )
}
