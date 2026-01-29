"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, Building2, CheckCircle, User, Mail, Phone, MessageSquare, Loader2, UserPlus } from "lucide-react"

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

    if (!formData.name.trim()) {
      setError("Név megadása kötelező")
      return
    }
    if (!formData.email.trim()) {
      setError("Email megadása kötelező")
      return
    }
    if (!organization) {
      setError("Szervezet nem található")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/join-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim() || null,
          message: formData.message.trim() || null,
          organizationId: organization.id,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
      } else {
        setError(data.message || "Hiba történt a csatlakozási kérelem küldése során")
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

  // Success state
  if (success) {
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

        {/* Logo */}
        <motion.div 
          className="absolute top-6 left-6 z-20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Image src="/img/musql_logo.png" alt="Musql" width={150} height={40} className="h-8 lg:h-10 w-auto" />
        </motion.div>

        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <div className="bg-[#1E1E2D]/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D2F159] to-[#D2F159]/70 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#D2F159]/20"
              >
                <CheckCircle className="w-10 h-10 text-[#171725]" />
              </motion.div>
              
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                Kérelem elküldve!
              </h2>
              <p className="text-white/60 mb-6">
                A csatlakozási kérelmed sikeresen elküldve a következő szervezethez:
              </p>
              
              <div className="bg-[#252a32] rounded-xl p-4 mb-6">
                <p className="text-[#FF6F61] font-semibold text-lg">{organization?.name}</p>
              </div>
              
              <p className="text-white/40 text-sm mb-8">
                Amint az edző jóváhagyja a kérelmedet, emailben értesítünk és be tudsz jelentkezni.
              </p>

              <Link
                href="/auth/signin"
                className="inline-block py-3 px-6 rounded-xl text-white/60 hover:text-white border border-white/10 hover:border-white/20 transition-all"
              >
                Vissza a főoldalra
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // No organization found
  if (!orgSlug) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#171725" }}>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-white/60 mb-4">Hiányzó szervezet kód.</p>
            <Link href="/auth/tag/join" className="text-[#FF6F61] hover:text-[#FF6F61]/80 transition-colors">
              Szervezet keresése
            </Link>
          </div>
        </div>
      </div>
    )
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
          href="/auth/tag/join"
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
                Csatlakozási kérelem
              </h1>
              <p className="text-white/60">
                Add meg az adataidat
              </p>
            </div>

            {/* Organization card */}
            {organization && (
              <div className="bg-[#FF6F61]/10 border border-[#FF6F61]/20 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FF6F61]/20 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-[#FF6F61]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold truncate">
                      {organization.name}
                    </h3>
                    <p className="text-white/40 text-sm">
                      Csatlakozás ehhez a szervezethez
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-white/60 text-sm block mb-2">Teljes neved *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="Teljes neved"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-[#252a32] text-white rounded-xl pl-12 pr-4 py-4 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF6F61] transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="text-white/60 text-sm block mb-2">Email cím *</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="email@pelda.hu"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#252a32] text-white rounded-xl pl-12 pr-4 py-4 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF6F61] transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="text-white/60 text-sm block mb-2">Telefonszám</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    name="phone"
                    type="tel"
                    placeholder="+36 30 123 4567"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-[#252a32] text-white rounded-xl pl-12 pr-4 py-4 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF6F61] transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="text-white/60 text-sm block mb-2">Üzenet (opcionális)</label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-white/40" />
                  <textarea
                    name="message"
                    placeholder="Pl. Érdeklődöm a kezdő csoport iránt..."
                    value={formData.message}
                    onChange={handleChange}
                    rows={3}
                    className="w-full bg-[#252a32] text-white rounded-xl pl-12 pr-4 py-4 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF6F61] transition-all resize-none"
                    disabled={isLoading}
                  />
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

              <button
                type="submit"
                disabled={isLoading || !organization}
                className="w-full bg-gradient-to-r from-[#FF6F61] to-[#ff8577] text-white rounded-xl py-4 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-[#FF6F61]/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Küldés...
                  </>
                ) : (
                  "Csatlakozási kérelem küldése"
                )}
              </button>

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

export default function TagSignUp() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#171725] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#FF6F61] animate-spin" />
      </div>
    }>
      <TagSignUpContent />
    </Suspense>
  )
}
