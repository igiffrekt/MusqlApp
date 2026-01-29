"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Clock, CreditCard, Shield, Loader2, Check } from 'lucide-react'

interface OrgInfo {
  trialEndsAt: string | null
  setupToken: string | null
  licenseTier: string
}

export default function SubscribePendingPage() {
  const router = useRouter()
  const { status } = useSession()
  const [orgInfo, setOrgInfo] = useState<OrgInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetch('/api/subscriptions')
        .then(res => res.json())
        .then(data => {
          setOrgInfo({ trialEndsAt: data.trialEndsAt, setupToken: data.setupToken, licenseTier: data.licenseTier })
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [status, router])

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-[#171725] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D2F159] animate-spin" />
      </div>
    )
  }

  const trialEndDate = orgInfo?.trialEndsAt ? new Date(orgInfo.trialEndsAt) : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
  const formattedDate = trialEndDate.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })
  const daysLeft = Math.max(0, Math.ceil((trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#171725" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute -top-40 -right-40 w-80 h-80 lg:w-[500px] lg:h-[500px] rounded-full opacity-30" style={{ background: "radial-gradient(circle, #D2F159 0%, transparent 70%)" }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity }} />
        <motion.div className="absolute -bottom-40 -left-40 w-80 h-80 lg:w-[500px] lg:h-[500px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #FF6F61 0%, transparent 70%)" }} animate={{ scale: [1.2, 1, 1.2] }} transition={{ duration: 8, repeat: Infinity }} />
      </div>

      <motion.div className="absolute top-6 left-6 z-20" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Image src="/img/musql_logo.png" alt="Musql" width={120} height={32} className="h-8 w-auto" />
      </motion.div>

      <div className="flex-1 flex items-center justify-center p-4 pt-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="bg-[#1E1E2D]/80 backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-white/10">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#D2F159] to-[#D2F159]/70 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#D2F159]/20">
                <Clock className="w-8 h-8 text-[#171725]" />
              </div>
              <h1 className="text-white text-2xl font-bold mb-2">A vezérlőpultod vár rád! 🎉</h1>
              <p className="text-white/60 text-sm">
                Már majdnem kész vagy! Add meg a fizetési adataidat a <span className="text-[#D2F159] font-semibold">15 napos ingyenes próbaidő</span> elindításához.
              </p>
            </div>

            {daysLeft > 0 && (
              <div className="bg-[#D2F159]/10 border border-[#D2F159]/30 rounded-xl px-4 py-3 mb-6 text-center">
                <span className="text-[#D2F159] text-sm font-medium">⏰ Még {daysLeft} napod van a próbaidőből</span>
              </div>
            )}

            <div className="bg-[#252a32] rounded-xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-[#D2F159]" />
                <span className="text-white font-medium">Garanciák</span>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#D2F159] mt-0.5 flex-shrink-0" />
                  <span className="text-white/70"><span className="text-white font-medium">Nem terhelünk</span> a próbaidő alatt</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#D2F159] mt-0.5 flex-shrink-0" />
                  <span className="text-white/70">Első fizetés: <span className="text-[#D2F159] font-medium">{formattedDate}</span></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#D2F159] mt-0.5 flex-shrink-0" />
                  <span className="text-white/70"><span className="text-white font-medium">Bármikor lemondható</span> – nincs kötöttség</span>
                </li>
              </ul>
            </div>

            <button onClick={() => router.push('/subscribe')} className="w-full bg-gradient-to-r from-[#D2F159] to-[#c4e350] text-[#171725] rounded-xl py-4 font-bold flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-[#D2F159]/20">
              <CreditCard className="w-5 h-5" />
              Fizetési adatok megadása
            </button>

            <p className="text-center text-white/40 text-xs mt-4">
              Kérdésed van? <a href="mailto:hello@musql.app" className="text-[#D2F159] hover:text-[#D2F159]/80">hello@musql.app</a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
