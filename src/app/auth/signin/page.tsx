"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Users, Dumbbell, ArrowRight, Sparkles } from "lucide-react"

export default function AuthLanding() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#171725" }}>
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 lg:w-[500px] lg:h-[500px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, #D2F159 0%, transparent 70%)" }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 lg:w-[500px] lg:h-[500px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, #FF6F61 0%, transparent 70%)" }}
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Logo */}
      <motion.div 
        className="absolute top-6 left-6 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center">
          <Image
            src="/img/musql_logo.png"
            alt="Musql"
            width={150}
            height={40}
            className="h-8 lg:h-10 w-auto"
          />
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 overflow-hidden">
        <div className="w-full max-w-[360px] lg:max-w-[900px] xl:max-w-[1000px] mx-auto relative">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="text-center mb-8 lg:mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
            >
              <Sparkles className="w-4 h-4 text-[#D2F159]" />
              <span className="text-white/70 text-sm" style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
                Sportegyesületek kedvenc platformja
              </span>
            </motion.div>
            <h1
              className="text-3xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 lg:mb-4"
              style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
            >
              Üdvözlünk!
            </h1>
            <p
              className="text-white/70 text-base lg:text-xl max-w-md mx-auto"
              style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
            >
              Válaszd ki, hogyan szeretnél belépni
            </p>
          </motion.div>

          {/* Cards - Stack on mobile, side-by-side on desktop */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-center justify-center">
            {/* Edzo Card */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 30 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="w-full max-w-[250px] lg:max-w-none lg:w-[380px] xl:w-[420px]"
            >
              <Link href="/auth/edzo/signin" className="block">
                <div
                  className="h-[250px] lg:h-[320px] p-6 lg:p-8 rounded-2xl lg:rounded-3xl border border-white/10 hover:border-[#D2F159]/50 transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center text-center relative overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  {/* Hover gradient effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
                       style={{ background: "radial-gradient(circle at center, rgba(210,241,89,0.1) 0%, transparent 70%)" }} />
                  
                  <motion.div 
                    className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl lg:rounded-2xl bg-gradient-to-br from-[#D2F159] to-[#9BC53D] flex items-center justify-center mb-4 lg:mb-6 relative z-10"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Dumbbell className="w-8 h-8 lg:w-10 lg:h-10 text-gray-900" />
                  </motion.div>
                  <h2
                    className="text-xl lg:text-2xl font-bold text-white mb-2 relative z-10"
                    style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                  >
                    Edző / Szervezet
                  </h2>
                  <p
                    className="text-white/60 text-sm lg:text-base relative z-10 mb-4 lg:mb-6"
                    style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                  >
                    Edzők, egyesületek bejelentkezése
                  </p>
                  <div className="flex items-center gap-2 text-[#D2F159] opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 relative z-10">
                    <span className="text-sm font-medium">Belépés</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Divider - Desktop only */}
            <motion.div 
              className="hidden lg:flex flex-col items-center gap-4"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
              <span className="text-white/40 text-sm font-medium">vagy</span>
              <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            </motion.div>

            {/* Tag Card */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 30 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="w-full max-w-[250px] lg:max-w-none lg:w-[380px] xl:w-[420px]"
            >
              <Link href="/auth/tag/signin" className="block">
                <div
                  className="h-[250px] lg:h-[320px] p-6 lg:p-8 rounded-2xl lg:rounded-3xl border border-white/10 hover:border-[#FF6F61]/50 transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center text-center relative overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  {/* Hover gradient effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
                       style={{ background: "radial-gradient(circle at center, rgba(255,111,97,0.1) 0%, transparent 70%)" }} />
                  
                  <motion.div 
                    className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl lg:rounded-2xl bg-gradient-to-br from-[#FF6F61] to-[#E85A4F] flex items-center justify-center mb-4 lg:mb-6 relative z-10"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Users className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                  </motion.div>
                  <h2
                    className="text-xl lg:text-2xl font-bold text-white mb-2 relative z-10"
                    style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                  >
                    Tag
                  </h2>
                  <p
                    className="text-white/60 text-sm lg:text-base relative z-10 mb-4 lg:mb-6"
                    style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                  >
                    Egyesületi tagok, sportolók bejelentkezése
                  </p>
                  <div className="flex items-center gap-2 text-[#FF6F61] opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 relative z-10">
                    <span className="text-sm font-medium">Belépés</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Footer links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 lg:mt-12 text-center"
          >
            <p
              className="text-white/50 text-sm lg:text-base"
              style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
            >
              Még nincs fiókod?{" "}
              <Link href="/auth/edzo/signup" className="text-[#D2F159] hover:text-[#D2F159]/80 transition-colors font-medium">
                Regisztrálj edzőként
              </Link>
              , vagy{" "}
              <Link href="/auth/tag/join" className="text-[#FF6F61] hover:text-[#FF6F61]/80 transition-colors font-medium">
                Csatlakozz tagként
              </Link>
            </p>
          </motion.div>

          {/* Feature highlights - Desktop only */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="hidden lg:flex justify-center gap-8 mt-12"
          >
            {[
              { label: "Egyszerű tagkezelés", icon: "👥" },
              { label: "Automatikus értesítések", icon: "🔔" },
              { label: "Online fizetés", icon: "💳" },
            ].map((feature, i) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-center gap-2 text-white/40 text-sm"
              >
                <span>{feature.icon}</span>
                <span>{feature.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
