"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Shield, Loader2 } from "lucide-react"

function EdzoSignInContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get("message")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.ok) {
        router.push("/")
      } else {
        setError("Hibás email vagy jelszó")
      }
    } catch (error) {
      console.error("Sign in error:", error)
      setError("Hiba történt a bejelentkezés során")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignIn = async (provider: string) => {
    setIsLoading(true)
    await signIn(provider, { callbackUrl: "/" })
    setIsLoading(false)
  }

  const handleSuperAdminLogin = () => {
    setEmail("stickerey@gmail.com")
    setPassword("Gaestq7%+")
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

      {/* Hidden super admin button */}
      <button
        type="button"
        onClick={handleSuperAdminLogin}
        className="absolute top-6 right-6 z-20 w-8 h-8 flex items-center justify-center opacity-20 hover:opacity-100 transition-opacity"
        title="Super Admin"
      >
        <Shield className="w-5 h-5 text-white" />
      </button>

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
                  Edző bejelentkezés
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-white/70 text-sm"
                  style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                >
                  Add meg az adataid
                </motion.p>
              </div>

              {message && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-full bg-[#D2F159]/20 border border-[#D2F159]/30 p-3"
                >
                  <p className="text-[#D2F159] text-sm text-center" style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
                    {message}
                  </p>
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
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="Email cím"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="Jelszó"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                  transition={{ delay: 0.3 }}
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
                    {isLoading ? "Bejelentkezés..." : "Bejelentkezés"}
                  </motion.button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="mt-6"
                >
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-[#171725] text-white/50" style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
                        Vagy folytasd
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <motion.button
                      type="button"
                      onClick={() => handleSocialSignIn("google")}
                      disabled={isLoading}
                      className="w-full inline-flex justify-center py-3 px-4 border border-white/20 rounded-full bg-white/10 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-50 transition-colors"
                      style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Google
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => handleSocialSignIn("facebook")}
                      disabled={isLoading}
                      className="w-full inline-flex justify-center py-3 px-4 border border-white/20 rounded-full bg-white/10 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-50 transition-colors"
                      style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Facebook
                    </motion.button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-center"
                >
                  <Link
                    href="/auth/edzo/signup"
                    className="text-white/70 text-sm transition-colors"
                    style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                  >
                    Nincs még szervezeted? <span className="text-[#D2F159] hover:text-[#D2F159]/80">Regisztráció</span>
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

export default function EdzoSignIn() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#171725" }}>
        <Loader2 className="w-8 h-8 text-[#D2F159] animate-spin" />
      </div>
    }>
      <EdzoSignInContent />
    </Suspense>
  )
}
