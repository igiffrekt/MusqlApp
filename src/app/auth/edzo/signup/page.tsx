"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Loader2 } from "lucide-react"

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

    // Client-side validation
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
        headers: {
          "Content-Type": "application/json",
        },
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
      // Auto-login with the credentials used for registration
      const result = await signIn("credentials", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        redirect: false,
      })

      if (result?.ok) {
        // Successfully logged in, redirect to setup
        router.push("/setup")
      } else {
        // Fallback to signin page if auto-login fails
        setError("Automatikus bejelentkezés sikertelen. Kérlek, jelentkezz be manuálisan.")
        setIsRedirecting(false)
      }
    } catch (err) {
      console.error("Auto-login error:", err)
      setError("Hiba történt. Kérlek, jelentkezz be manuálisan.")
      setIsRedirecting(false)
    }
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
            <div className="w-20 h-20 rounded-full bg-[#D2F159]/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[#D2F159]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2
              className="text-2xl font-bold text-white mb-4"
              style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
            >
              Szervezet létrehozva!
            </h2>
            <p
              className="text-white/70 mb-6"
              style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
            >
              A szervezeted kódja:
            </p>
            <div className="bg-white/10 rounded-2xl p-4 mb-6">
              <code className="text-[#D2F159] text-xl font-mono">{orgSlug}</code>
            </div>
            <p
              className="text-white/50 text-sm mb-4"
              style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
            >
              Oszd meg ezt a kódot a tagjaiddal, hogy csatlakozhassanak a szervezetedhez.
            </p>
            <p
              className="text-white/70 text-sm mb-8"
              style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
            >
              A következő lépésben add meg az első helyszínt és edzést.
            </p>
            {error && (
              <p className="text-red-400 text-sm mb-4" style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
                {error}
              </p>
            )}
            <button
              onClick={handleContinueToSetup}
              disabled={isRedirecting}
              className="w-full py-4 px-8 rounded-full font-semibold text-gray-900 bg-[#D2F159] hover:bg-[#D2F159]/90 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
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
                  Szervezet regisztráció
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-white/70 text-sm"
                  style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                >
                  Hozd létre a szervezetedet és legyél admin
                </motion.p>
              </div>

              {/* Form */}
              <form className="space-y-4" onSubmit={handleSubmit}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Input
                    id="organizationName"
                    name="organizationName"
                    type="text"
                    required
                    placeholder="Szervezet neve"
                    value={formData.organizationName}
                    onChange={handleChange}
                    className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-[#D2F159] focus:ring-[#D2F159] rounded-full px-4 py-3"
                    style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="A te neved"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-[#D2F159] focus:ring-[#D2F159] rounded-full px-4 py-3"
                    style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="Email cím"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-[#D2F159] focus:ring-[#D2F159] rounded-full px-4 py-3"
                    style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="Jelszó"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-[#D2F159] focus:ring-[#D2F159] rounded-full px-4 py-3"
                    style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    placeholder="Jelszó megerősítése"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-[#D2F159] focus:ring-[#D2F159] rounded-full px-4 py-3"
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
                  transition={{ delay: 0.45 }}
                  style={{ marginTop: '40px' }}
                >
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full py-4 px-8 rounded-full font-semibold text-gray-900 overflow-hidden"
                    style={{
                      fontFamily: 'Lufga, Inter, sans-serif',
                      backgroundColor: isLoading ? '#9CA3AF' : '#D2F159',
                      cursor: isLoading ? 'not-allowed' : 'pointer'
                    }}
                    whileHover={!isLoading ? { scale: 1.02 } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                  >
                    {isLoading ? "Létrehozás..." : "Szervezet létrehozása"}
                  </motion.button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center"
                >
                  <Link
                    href="/auth/edzo/signin"
                    className="text-white/70 text-sm transition-colors"
                    style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                  >
                    Már van fiókod? <span className="text-[#D2F159] hover:text-[#D2F159]/80">Bejelentkezés</span>
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
