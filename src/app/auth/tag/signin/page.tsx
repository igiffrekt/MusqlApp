"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn, useSession } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Mail, Info, Loader2 } from "lucide-react"

function TagSignInContent() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [emailSent, setEmailSent] = useState(false)
  const searchParams = useSearchParams()
  const errorParam = searchParams.get("error")
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.replace("/")
    }
  }, [session, status, router])

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

  if (emailSent) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#171725" }}>
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md text-center"
          >
            <div className="w-20 h-20 rounded-full bg-[#FF6F61]/20 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-[#FF6F61]" />
            </div>
            <h2
              className="text-2xl font-bold text-white mb-4"
              style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
            >
              Nézd meg az emailjeid!
            </h2>
            <p
              className="text-white/70 mb-2"
              style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
            >
              Bejelentkezési linket küldtünk erre a címre:
            </p>
            <p
              className="text-[#FF6F61] font-semibold mb-8"
              style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
            >
              {email}
            </p>
            <button
              onClick={() => {
                setEmailSent(false)
                setEmail("")
              }}
              className="py-3 px-6 rounded-full text-white/70 hover:text-white border border-white/20 hover:border-white/40 transition-colors"
              style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
            >
              Más emailt használok
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
                  Tag bejelentkezés
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-white/70 text-sm"
                  style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                >
                  Add meg az email címed
                </motion.p>
              </div>

              {/* Info Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl bg-[#FF6F61]/10 border border-[#FF6F61]/20 p-4"
              >
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-[#FF6F61] mt-0.5 flex-shrink-0" />
                  <p
                    className="text-white/70 text-sm"
                    style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                  >
                    Bejelentkezési linket küldünk az email címedre. Csak jóváhagyott tagok tudnak bejelentkezni.
                  </p>
                </div>
              </motion.div>

              {errorParam === "not_approved" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl bg-yellow-500/20 border border-yellow-500/30 p-4"
                >
                  <p className="text-yellow-400 text-sm text-center" style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
                    Nincs jóváhagyott fiókod. Kérlek, várj amíg az edző jóváhagyja a kérelmedet.
                  </p>
                </motion.div>
              )}

              {/* Form */}
              <form className="space-y-4" onSubmit={handleSubmit}>
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
                    placeholder="Email cím"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-[#FF6F61] focus:ring-[#FF6F61] rounded-full px-4 py-3"
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
                  transition={{ delay: 0.3 }}
                  style={{ marginTop: '40px' }}
                >
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full py-4 px-8 rounded-full font-semibold text-white overflow-hidden"
                    style={{
                      fontFamily: 'Lufga, Inter, sans-serif',
                      backgroundColor: isLoading ? '#9CA3AF' : '#FF6F61',
                      cursor: isLoading ? 'not-allowed' : 'pointer'
                    }}
                    whileHover={!isLoading ? { scale: 1.02 } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                  >
                    {isLoading ? "Küldés..." : "Bejelentkezési link küldése"}
                  </motion.button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="text-center"
                >
                  <Link
                    href="/auth/tag/join"
                    className="text-white/70 text-sm transition-colors"
                    style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                  >
                    Még nem vagy tag? <span className="text-[#FF6F61] hover:text-[#FF6F61]/80">Csatlakozás</span>
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

export default function TagSignIn() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#171725" }}>
        <Loader2 className="w-8 h-8 text-[#D2F159] animate-spin" />
      </div>
    }>
      <TagSignInContent />
    </Suspense>
  )
}
