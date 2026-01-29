"use client"

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { CheckCircle, Loader2, ArrowRight, Sparkles } from 'lucide-react'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [verifying, setVerifying] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    
    if (!sessionId) {
      setVerifying(false)
      import('canvas-confetti').then(({ default: confetti }) => {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#D2F159', '#ffffff', '#171725'] })
      })
      return
    }

    fetch('/api/stripe/verify-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          import('canvas-confetti').then(({ default: confetti }) => {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#D2F159', '#ffffff', '#171725'] })
          })
        }
        setVerifying(false)
      })
      .catch(() => setVerifying(false))
  }, [searchParams])

  if (verifying) {
    return (
      <div className="min-h-screen bg-[#171725] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#D2F159] animate-spin mx-auto mb-4" />
          <p className="text-white/60">Előfizetés ellenőrzése...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#171725] flex items-center justify-center px-6">
        <div className="bg-[#1E1E2D]/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h1 className="text-white text-xl font-bold mb-2">Hiba történt</h1>
          <p className="text-white/60 mb-6">{error}</p>
          <button onClick={() => router.push('/subscribe')} className="px-6 py-3 bg-[#D2F159] text-[#171725] font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-[#D2F159]/20">
            Próbáld újra
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#171725" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute -top-40 -right-40 w-80 h-80 lg:w-[500px] lg:h-[500px] rounded-full opacity-30" style={{ background: "radial-gradient(circle, #D2F159 0%, transparent 70%)" }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity }} />
        <motion.div className="absolute -bottom-40 -left-40 w-80 h-80 lg:w-[500px] lg:h-[500px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #FF6F61 0%, transparent 70%)" }} animate={{ scale: [1.2, 1, 1.2] }} transition={{ duration: 8, repeat: Infinity }} />
      </div>

      <motion.div className="absolute top-6 left-6 z-20" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Image src="/img/musql_logo.png" alt="Musql" width={120} height={32} className="h-8 w-auto" />
      </motion.div>

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <div className="bg-[#1E1E2D]/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D2F159] to-[#D2F159]/70 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#D2F159]/20">
              <CheckCircle className="w-10 h-10 text-[#171725]" />
            </motion.div>

            <h1 className="text-white text-2xl lg:text-3xl font-bold mb-3">Sikeres aktiválás! 🎉</h1>
            <p className="text-white/60 mb-2">A próbaidőd elindult. 15 napig minden funkció korlátlanul elérhető.</p>
            <p className="text-[#D2F159] text-sm mb-8">Üdvözlünk a Musql-ban!</p>

            <div className="bg-[#252a32] rounded-xl p-5 mb-8 text-left">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#D2F159]" />
                <p className="text-white/40 text-xs uppercase tracking-wider">Mostantól elérhető</p>
              </div>
              <ul className="space-y-2">
                {['Tagok kezelése', 'Órák szervezése', 'Jelenléti ívek', 'Fizetések követése'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-white text-sm">
                    <span className="text-[#D2F159]">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button onClick={() => router.push('/')} className="w-full bg-gradient-to-r from-[#D2F159] to-[#c4e350] text-[#171725] rounded-xl py-4 font-bold flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-[#D2F159]/20">
              Irány a vezérlőpult
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function SubscribeSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#171725] flex items-center justify-center"><Loader2 className="w-12 h-12 text-[#D2F159] animate-spin" /></div>}>
      <SuccessContent />
    </Suspense>
  )
}
