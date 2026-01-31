"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2, Building2, User, Mail, Lock, Check, Sparkles } from "lucide-react"

export default function EdzoSignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [orgSlug, setOrgSlug] = useState("")
  const [isRedirecting, setIsRedirecting] = useState(false)
  const router = useRouter()

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
    if (!formData.password) {
      setError("Jelszó megadása kötelező")
      return
    }
    if (formData.password.length < 6) {
      setError("A jelszónak legalább 6 karakter hosszúnak kell lennie")
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError("A jelszavak nem egyeznek")
      return
    }
    if (!formData.organizationName.trim()) {
      setError("Szervezet név megadása kötelező")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          organizationName: formData.organizationName.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setOrgSlug(data.user.organizationSlug)
      } else {
        setError(data.message || "Hiba történt a regisztráció során")
      }
    } catch (error) {
      console.error("Registration error:", error)
      setError("Hálózati hiba. Kérlek, próbáld újra.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleContinueToSetup = async () => {
    setIsRedirecting(true)
    try {
      const result = await signIn("credentials", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        redirect: false,
      })

      if (result?.ok) {
        router.push("/auth/start-trial")
      } else {
        setError("Automatikus bejelentkezés sikertelen. Kérlek, jelentkezz be manuálisan.")
        setIsRedirecting(false)
      }
    } catch (err) {
      console.error("Auto-login error:", err)
      setError("Hiba történt. Kérlek, jelentkezz be manuálisan.")
      setIsRedirecting(false)
    }
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#171725" }}>
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 lg:w-[500px] lg:h-[500px] rounded-full opacity-30"
            style={{ background: "radial-gradient(circle, #D2F159 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 lg:w-[500px] lg:h-[500px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #FF6F61 0%, transparent 70%)" }}
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
                <Check className="w-10 h-10 text-[#171725]" />
              </motion.div>
              
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                Szervezet létrehozva!
              </h2>
              <p className="text-white/60 mb-6">
                A szervezeted kódja:
              </p>
              
              <div className="bg-[#252a32] rounded-xl p-4 mb-6">
                <code className="text-[#D2F159] text-2xl font-mono">{orgSlug}</code>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3 text-left">
                  <Sparkles className="w-5 h-5 text-[#D2F159] mt-0.5 flex-shrink-0" />
                  <p className="text-white/60 text-sm">
                    Oszd meg ezt a kódot a tagjaiddal, hogy csatlakozhassanak a szervezetedhez.
                  </p>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/20 border border-red-500/50 text-red-400 rounded-xl px-4 py-3 text-sm mb-4"
                >
                  {error}
                </motion.div>
              )}

              <button
                onClick={handleContinueToSetup}
                disabled={isRedirecting}
                className="w-full bg-gradient-to-r from-[#D2F159] to-[#c4e350] text-[#171725] rounded-xl py-4 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-[#D2F159]/20"
              >
                {isRedirecting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Bejelentkezés...
                  </>
                ) : (
                  "Tovább a beállításhoz"
                )}
              </button>
            </div>
          </motion.div>
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
          style={{ background: "radial-gradient(circle, #D2F159 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 lg:w-[500px] lg:h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #FF6F61 0%, transparent 70%)" }}
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
        <div className="w-full max-w-[420px] lg:max-w-[900px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
            
            {/* Left: Info panel (Desktop) */}
            <motion.div 
              className="hidden lg:block w-80 flex-shrink-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-3">
                    Indítsd el a szervezeted
                  </h1>
                  <p className="text-white/60">
                    Hozd létre a saját edzéstermed vagy klubod, és kezd el kezelni a tagokat, edzéseket és fizetéseket.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#D2F159]/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-[#D2F159]" />
                    </div>
                    <div>
                      <p className="text-white font-medium">15 napos ingyenes próbaidő</p>
                      <p className="text-white/40 text-sm">Minden funkcióhoz hozzáférsz</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#D2F159]/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-[#D2F159]" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Korlátlan tagok és edzések</p>
                      <p className="text-white/40 text-sm">Minden funkcióhoz hozzáférsz</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#D2F159]/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-[#D2F159]" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Online fizetés és számlázás</p>
                      <p className="text-white/40 text-sm">Stripe integráció beépítve</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Form */}
            <motion.div 
              className="flex-1 w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-[#1E1E2D]/80 backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-white/10">
                {/* Header */}
                <div className="text-center mb-6 lg:hidden">
                  <h1 className="text-2xl font-bold text-white mb-2">
                    Szervezet regisztráció
                  </h1>
                  <p className="text-white/60 text-sm">
                    Hozd létre a szervezetedet
                  </p>
                </div>

                <div className="hidden lg:block text-center mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#D2F159] to-[#D2F159]/70 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#D2F159]/20">
                    <Building2 className="w-7 h-7 text-[#171725]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Szervezet létrehozása
                  </h2>
                  <p className="text-white/60 text-sm">
                    Töltsd ki az adatokat a regisztrációhoz
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-white/60 text-sm block mb-2">Szervezet neve *</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        name="organizationName"
                        type="text"
                        required
                        placeholder="pl. Budapest BJJ Klub"
                        value={formData.organizationName}
                        onChange={handleChange}
                        className="w-full bg-[#252a32] text-white rounded-xl pl-12 pr-4 py-4 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#D2F159] transition-all"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-white/60 text-sm block mb-2">A te neved *</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        name="name"
                        type="text"
                        required
                        placeholder="Teljes neved"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-[#252a32] text-white rounded-xl pl-12 pr-4 py-4 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#D2F159] transition-all"
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
                        className="w-full bg-[#252a32] text-white rounded-xl pl-12 pr-4 py-4 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#D2F159] transition-all"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/60 text-sm block mb-2">Jelszó *</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                          name="password"
                          type="password"
                          required
                          placeholder="Min. 6 karakter"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full bg-[#252a32] text-white rounded-xl pl-12 pr-4 py-4 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#D2F159] transition-all"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-white/60 text-sm block mb-2">Jelszó megerősítése *</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                          name="confirmPassword"
                          type="password"
                          required
                          placeholder="Jelszó újra"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full bg-[#252a32] text-white rounded-xl pl-12 pr-4 py-4 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#D2F159] transition-all"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-500/20 border border-red-500/50 text-red-400 rounded-xl px-4 py-3 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[#D2F159] to-[#c4e350] text-[#171725] rounded-xl py-4 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-[#D2F159]/20 mt-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Létrehozás...
                      </>
                    ) : (
                      "Szervezet létrehozása"
                    )}
                  </button>

                  <p className="text-center text-white/40 text-sm">
                    Már van fiókod?{" "}
                    <Link href="/auth/edzo/signin" className="text-[#D2F159] hover:text-[#D2F159]/80 transition-colors">
                      Bejelentkezés
                    </Link>
                  </p>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
