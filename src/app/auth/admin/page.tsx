"use client"

import { useState, useEffect } from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Shield, Loader2, Eye, EyeOff, LogOut } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // If already logged in as SUPER_ADMIN, show option to continue or logout
  const isAlreadySuperAdmin = session?.user?.role === "SUPER_ADMIN"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
        setLoading(false)
        return
      }

      // Check if user is SUPER_ADMIN by fetching session
      const sessionRes = await fetch("/api/auth/session")
      const newSession = await sessionRes.json()

      if (newSession?.user?.role !== "SUPER_ADMIN") {
        setError("Access denied. Super Admin privileges required.")
        // Sign out the non-admin user
        await signOut({ redirect: false })
        setLoading(false)
        return
      }

      router.push("/admin")
      router.refresh()
    } catch {
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  const handleContinue = () => {
    router.push("/admin")
  }

  const handleLogoutAndLogin = async () => {
    await signOut({ redirect: false })
    router.refresh()
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D2F159] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#D2F159] flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-[#171725]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Access</h1>
          <p className="text-white/60 mt-2">Sign in with your Super Admin account</p>
        </div>

        {/* If already logged in as super admin, show continue option */}
        {isAlreadySuperAdmin ? (
          <div className="bg-[#171725] rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="text-center">
              <p className="text-white mb-2">Logged in as</p>
              <p className="text-[#D2F159] font-semibold">{session.user?.email}</p>
            </div>
            
            <button
              onClick={handleContinue}
              className="w-full py-3 rounded-xl bg-[#D2F159] text-[#171725] font-semibold hover:bg-[#D2F159]/90 transition-colors"
            >
              Continue to Admin Dashboard
            </button>
            
            <button
              onClick={handleLogoutAndLogin}
              className="w-full py-3 rounded-xl bg-white/5 text-white/70 font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Login with different account
            </button>
          </div>
        ) : (
          /* Login Form */
          <form onSubmit={handleSubmit} className="bg-[#171725] rounded-2xl p-6 border border-white/10">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#0f0f14] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#D2F159]/50 transition-colors"
                  placeholder="admin@musql.app"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#0f0f14] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#D2F159]/50 transition-colors pr-12"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 rounded-xl bg-[#D2F159] text-[#171725] font-semibold hover:bg-[#D2F159]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        )}

        <p className="text-center text-white/40 text-sm mt-6">
          This area is restricted to platform administrators.
        </p>
      </div>
    </div>
  )
}
