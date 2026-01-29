"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Mail } from "lucide-react"

export default function VerifyRequest() {
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

      {/* Main Content */}
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
              <Mail className="w-10 h-10 text-[#171725]" />
            </motion.div>
            
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-4">
              Nézd meg az emailjeid!
            </h1>
            <p className="text-white/60 mb-8">
              Bejelentkezési linket küldtünk az email címedre. Kattints a linkre a bejelentkezéshez.
            </p>
            
            <Link
              href="/auth/signin"
              className="inline-block w-full bg-gradient-to-r from-[#D2F159] to-[#c4e350] text-[#171725] rounded-xl py-4 font-semibold transition-all hover:shadow-lg hover:shadow-[#D2F159]/20"
            >
              Vissza a bejelentkezéshez
            </Link>
            
            <p className="text-white/40 text-sm mt-6">
              Nem kaptad meg az emailt? Nézd meg a spam mappát, vagy{" "}
              <Link href="/auth/tag/signin" className="text-[#D2F159] hover:text-[#D2F159]/80 transition-colors">
                próbáld újra
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
