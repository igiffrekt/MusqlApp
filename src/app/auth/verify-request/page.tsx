"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Mail } from "lucide-react"

export default function VerifyRequest() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#171725" }}>
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="w-24 h-24 rounded-full bg-[#FF6F61]/20 flex items-center justify-center mx-auto mb-8">
            <Mail className="w-12 h-12 text-[#FF6F61]" />
          </div>
          <h1
            className="text-3xl font-bold text-white mb-4"
            style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
          >
            Nézd meg az emailjeid!
          </h1>
          <p
            className="text-white/70 mb-8"
            style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
          >
            Bejelentkezési linket küldtünk az email címedre. Kattints a linkre a bejelentkezéshez.
          </p>
          <div className="space-y-4">
            <Link
              href="/auth/signin"
              className="inline-block w-full py-4 px-8 rounded-full font-semibold text-gray-900 bg-[#FF6F61] hover:bg-[#FF6F61]/90 transition-colors"
              style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
            >
              Vissza a bejelentkezéshez
            </Link>
          </div>
          <p
            className="text-white/50 text-sm mt-8"
            style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
          >
            Nem kaptad meg az emailt? Nézd meg a spam mappát, vagy{" "}
            <Link href="/auth/tag/signin" className="text-[#FF6F61] hover:text-[#FF6F61]/80">
              próbáld újra
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
