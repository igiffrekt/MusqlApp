"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Users, Dumbbell, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useState } from "react"

export default function AuthLanding() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSuperAdminLogin = async () => {
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        email: "stickerey@gmail.com",
        password: "Gaestq7%+",
        redirect: false,
      })
      if (result?.ok) {
        router.push("/admin")
      }
    } catch (error) {
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#171725" }}>
      {/* Hidden Super Admin Button */}
      <button
        onClick={handleSuperAdminLogin}
        disabled={isLoading}
        className="absolute top-6 right-6 z-20 w-8 h-8 flex items-center justify-center opacity-20 hover:opacity-100 transition-opacity disabled:opacity-50"
        title="Super Admin"
      >
        <Shield className="w-5 h-5 text-white" />
      </button>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div className="w-full max-w-[360px] mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="text-center mb-8"
          >
            <h1
              className="text-3xl font-bold text-white mb-2"
              style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
            >
              Üdvözlünk!
            </h1>
            <p
              className="text-white/70"
              style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
            >
              Válaszd ki, hogyan szeretnél belépni
            </p>
          </motion.div>

          <div className="flex flex-col gap-4 items-center">
            {/* Edzo Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 30 }}
            >
              <Link href="/auth/edzo/signin">
                <div
                  className="w-[250px] h-[250px] p-6 rounded-2xl border border-white/10 hover:border-[#D2F159]/50 transition-all cursor-pointer group flex flex-col items-center justify-center text-center"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#D2F159] to-[#9BC53D] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Dumbbell className="w-8 h-8 text-[#171725]" />
                  </div>
                  <h2
                    className="text-xl font-bold text-white mb-2"
                    style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                  >
                    Edző / Szervezet
                  </h2>
                  <p
                    className="text-white/60 text-sm"
                    style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                  >
                    Edzők, egyesületek bejelentkezése
                  </p>
                </div>
              </Link>
            </motion.div>

            {/* Tag Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 30 }}
            >
              <Link href="/auth/tag/signin">
                <div
                  className="w-[250px] h-[250px] p-6 rounded-2xl border border-white/10 hover:border-[#FF6F61]/50 transition-all cursor-pointer group flex flex-col items-center justify-center text-center"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#FF6F61] to-[#E85A4F] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h2
                    className="text-xl font-bold text-white mb-2"
                    style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                  >
                    Tag
                  </h2>
                  <p
                    className="text-white/60 text-sm"
                    style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                  >
                    Egyesületi tagok, sportolók bejelentkezése
                  </p>
                </div>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center"
          >
            <p
              className="text-white/50 text-sm"
              style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
            >
              Még nincs fiókod?{" "}
              <Link href="/auth/edzo/signup" className="text-[#D2F159] hover:text-[#D2F159]/80">
                Regisztrálj edzőként/szervezetként
              </Link>
              , vagy{" "}
              <Link href="/auth/tag/join" className="text-[#FF6F61] hover:text-[#FF6F61]/80">
                Csatlakozz tagként
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
