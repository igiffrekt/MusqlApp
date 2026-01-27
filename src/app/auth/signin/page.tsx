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
    <div className="h-[100dvh] flex flex-col bg-[#171725] overflow-hidden">
      {/* Hidden Super Admin Button */}
      <button
        onClick={handleSuperAdminLogin}
        disabled={isLoading}
        className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center opacity-20 hover:opacity-100 transition-opacity disabled:opacity-50"
        title="Super Admin"
      >
        <Shield className="w-6 h-6 text-white" />
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-5 py-6">
        <div className="w-full max-w-md mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-2">
              Üdvözlünk!
            </h1>
            <p className="text-white/70 text-lg">
              Válaszd ki, hogyan szeretnél belépni
            </p>
          </motion.div>

          {/* Cards - Side by side with equal height */}
          <div className="grid grid-cols-2 gap-4 items-stretch">
            {/* Edzo Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="h-full"
            >
              <Link href="/auth/edzo/signin" className="block h-full">
                <div className="h-full min-h-[180px] p-5 rounded-2xl border border-white/10 hover:border-[#D2F159]/50 transition-all cursor-pointer group flex flex-col items-center justify-center text-center bg-white/5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D2F159] to-[#9BC53D] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform flex-shrink-0">
                    <Dumbbell className="w-8 h-8 text-[#171725]" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    Edző
                  </h2>
                  <p className="text-white/60 text-base whitespace-nowrap">
                    Edzők, egyesületek
                  </p>
                </div>
              </Link>
            </motion.div>

            {/* Tag Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="h-full"
            >
              <Link href="/auth/tag/signin" className="block h-full">
                <div className="h-full min-h-[180px] p-5 rounded-2xl border border-white/10 hover:border-[#FF6F61]/50 transition-all cursor-pointer group flex flex-col items-center justify-center text-center bg-white/5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6F61] to-[#E85A4F] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform flex-shrink-0">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    Tag
                  </h2>
                  <p className="text-white/60 text-base whitespace-nowrap">
                    Sportolók, tagok
                  </p>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center"
          >
            <p className="text-white/50 text-base leading-relaxed">
              Még nincs fiókod?{" "}
              <Link href="/auth/edzo/signup" className="text-[#D2F159] hover:underline">
                Regisztrálj edzőként
              </Link>
              {" "}vagy{" "}
              <Link href="/auth/tag/join" className="text-[#FF6F61] hover:underline">
                csatlakozz tagként
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
