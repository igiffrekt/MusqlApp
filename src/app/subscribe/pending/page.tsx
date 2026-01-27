"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Clock, CreditCard, Shield, Loader2 } from 'lucide-react'

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
          setOrgInfo({
            trialEndsAt: data.trialEndsAt,
            setupToken: data.setupToken,
            licenseTier: data.licenseTier,
          })
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

  const trialEndDate = orgInfo?.trialEndsAt 
    ? new Date(orgInfo.trialEndsAt)
    : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
  
  const formattedDate = trialEndDate.toLocaleDateString('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const daysLeft = Math.max(0, Math.ceil((trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))

  return (
    <div className="min-h-screen bg-black font-lufga">
      <div className="min-h-screen bg-[#171725] mx-[5px] my-[5px] rounded-2xl flex flex-col">
        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          {/* Icon */}
          <div className="w-24 h-24 rounded-full bg-[#D2F159]/20 flex items-center justify-center mb-6">
            <Clock className="w-12 h-12 text-[#D2F159]" />
          </div>

          <h1 className="text-white text-2xl font-bold text-center mb-3">
            A vezérlőpultod vár rád! 🎉
          </h1>

          <p className="text-white/60 text-center mb-8 max-w-sm">
            Már majdnem kész vagy! Csak még egy lépés van hátra: add meg a fizetési adataidat, 
            hogy elindíthasd a <span className="text-[#D2F159] font-semibold">15 napos ingyenes próbaidőt</span>.
          </p>

          {/* Trial info card */}
          <div className="w-full max-w-sm bg-[#252a32] rounded-2xl p-6 border border-white/10 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-[#D2F159]" />
              <span className="text-white font-medium">Garanciák</span>
            </div>

            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-[#D2F159]">✓</span>
                <span className="text-white/80">
                  <strong className="text-white">Nem terhelünk</strong> a próbaidő alatt
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#D2F159]">✓</span>
                <span className="text-white/80">
                  Első fizetés: <strong className="text-[#D2F159]">{formattedDate}</strong>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#D2F159]">✓</span>
                <span className="text-white/80">
                  <strong className="text-white">Bármikor lemondható</strong> – nincs kötöttség
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#D2F159]">✓</span>
                <span className="text-white/80">
                  Havi előfizetés, <strong className="text-white">lemondásig aktív</strong>
                </span>
              </li>
            </ul>
          </div>

          {/* Days left badge */}
          {daysLeft > 0 && (
            <div className="bg-[#D2F159]/10 border border-[#D2F159]/30 rounded-full px-4 py-2 mb-8">
              <span className="text-[#D2F159] text-sm font-medium">
                ⏰ Még {daysLeft} napod van a próbaidőből
              </span>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="px-6 pb-8">
          <button
            onClick={() => router.push('/subscribe')}
            className="w-full py-4 rounded-full bg-[#D2F159] text-[#171725] font-bold text-lg flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            Fizetési adatok megadása
          </button>

          <p className="text-center text-white/40 text-xs mt-4">
            Kérdésed van? Írj nekünk: <a href="mailto:hello@musql.app" className="text-[#D2F159]">hello@musql.app</a>
          </p>
        </div>
      </div>
    </div>
  )
}
