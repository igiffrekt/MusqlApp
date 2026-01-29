"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, Mail, Info, Users, Loader2 } from "lucide-react"

function TagSignInContent() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [emailSent, setEmailSent] = useState(false)
  const searchParams = useSearchParams()
  const errorParam = searchParams.get("error")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim()) {
      setError("Email megadása kötelező")
      return
    }

    setIsLoading(true)

    try {
      const result = await signIn("resend", {
        email: email.trim().toLowerCase(),
        redirect: false,
      })

      if (result?.error) {
        if (result.error === "not_approved") {
          setError("Nincs jóváhagyott fiókod. Kérlek, várj amíg az edző jóváhagyja a kérelmedet.")
        } else {
          setError("Hiba történt. Kérlek, próbáld újra.")
        }
      } else {
        setEmailSent(true)
      }
    } catch (error) {
      console.error("Sign in error:", error)
      setError("Hiba történt a bejelentkezés során")
    } finally {
      setIsLoading(false)
    }
  }

  // Email sent success state
  if (emailSent) {
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
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF6F61] to-[#FF6F61]/70 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#FF6F61]/20"
              >
                <Mail className="w-10 h-10 text-white" />
              </motion.div>
              
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                Nézd meg az emailjeid!
              </h2>
              <p className="text-white/60 mb-2">
                Bejelentkezési linket küldtünk erre a címre:
              </p>
              <p className="text-[#FF6F61] font-semibold text-lg mb-8">
                {email}
              </p>
              
              <button
                onClick={() => {
                  setEmailSent(false)
                  setEmail("")
                }}
                className="py-3 px-6 rounded-xl text-white/60 hover:text-white border border-white/10 hover:border-white/20 transition-all"
              >
                Más emailt használok
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
                <Users className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                Tag bejelentkezés
              </h1>
              <p className="text-white/60">
                Add meg az email címed
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-[#FF6F61]/10 border border-[#FF6F61]/20 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-[#FF6F61] mt-0.5 flex-shrink-0" />
                <p className="text-white/60 text-sm">
                  Bejelentkezési linket küldünk az email címedre. Csak jóváhagyott tagok tudnak bejelentkezni.
                </p>
              </div>
            </div>

            {errorParam === "not_approved" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-xl px-4 py-3 text-sm text-center mb-4"
              >
                Nincs jóváhagyott fiókod. Kérlek, várj amíg az edző jóváhagyja a kérelmedet.
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-white/60 text-sm block mb-2">Email cím</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="email"
                    required
                    placeholder="email@pelda.hu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#252a32] text-white rounded-xl pl-12 pr-4 py-4 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF6F61] transition-all"
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
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#FF6F61] to-[#ff8577] text-white rounded-xl py-4 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-[#FF6F61]/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Küldés...
                  </>
                ) : (
                  "Bejelentkezési link küldése"
                )}
              </button>

              <p className="text-center text-white/40 text-sm pt-2">
                Még nem vagy tag?{" "}
                <Link href="/auth/tag/join" className="text-[#FF6F61] hover:text-[#FF6F61]/80 transition-colors">
                  Csatlakozás
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function TagSignIn() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#171725] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#FF6F61] animate-spin" />
      </div>
    }>
      <TagSignInContent />
    </Suspense>
  )
}
