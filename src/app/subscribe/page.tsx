"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Loader2, Check, Zap, Building2, Rocket } from 'lucide-react'

type LicenseTier = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
type Currency = 'USD' | 'EUR' | 'HUF'

const DISPLAY_PRICES: Record<LicenseTier, Record<Currency, string>> = {
  STARTER: { USD: '$29', EUR: '€27', HUF: '10 900 Ft' },
  PROFESSIONAL: { USD: '$79', EUR: '€73', HUF: '29 900 Ft' },
  ENTERPRISE: { USD: '$199', EUR: '€185', HUF: '74 900 Ft' },
}

const FEATURES: Record<LicenseTier, string[]> = {
  STARTER: ['Max 25 tag', 'Max 50 óra/hó', 'Max 2 edző', 'Email támogatás'],
  PROFESSIONAL: ['Max 100 tag', 'Max 200 óra/hó', 'Max 10 edző', 'Prioritás támogatás', 'Egyéni márka'],
  ENTERPRISE: ['Korlátlan tag', 'Korlátlan óra', 'Korlátlan edző', 'Dedikált támogatás', 'API hozzáférés'],
}

const TIER_ICONS: Record<LicenseTier, typeof Zap> = {
  STARTER: Zap,
  PROFESSIONAL: Building2,
  ENTERPRISE: Rocket,
}

const TIER_NAMES: Record<LicenseTier, string> = {
  STARTER: 'Starter',
  PROFESSIONAL: 'Professional',
  ENTERPRISE: 'Enterprise',
}

// Detect currency from browser/locale
function detectCurrency(): Currency {
  if (typeof window === 'undefined') return 'EUR'
  
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const locale = navigator.language || 'en'
  
  // Hungary
  if (timezone.includes('Budapest') || locale.startsWith('hu')) {
    return 'HUF'
  }
  // USA
  if (timezone.includes('America') || locale === 'en-US') {
    return 'USD'
  }
  // Default to EUR
  return 'EUR'
}

export default function SubscribePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [selectedTier, setSelectedTier] = useState<LicenseTier>('STARTER')
  const [currency, setCurrency] = useState<Currency>('EUR')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setCurrency(detectCurrency())
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/signin')
    }
  }, [status, router])

  const handleSubscribe = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseTier: selectedTier, currency }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Hiba történt')
      }

      // Redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt')
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#171725] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D2F159] animate-spin" />
      </div>
    )
  }

  const trialEndDate = new Date()
  trialEndDate.setDate(trialEndDate.getDate() + 15)
  const formattedTrialEnd = trialEndDate.toLocaleDateString('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-black font-lufga">
      <div className="min-h-screen bg-[#171725] mx-[5px] my-[5px] rounded-2xl pb-8">
        {/* Header */}
        <div className="px-6 pt-8 pb-4 text-center">
          <h1 className="text-white text-2xl font-bold mb-2">Válassz csomagot</h1>
          <p className="text-white/60 text-sm">
            15 napos ingyenes próbaidő • Bármikor lemondható
          </p>
          <p className="text-[#D2F159] text-xs mt-2 font-medium">
            Első díjfizetés: {formattedTrialEnd}
          </p>
        </div>

        {/* Currency selector */}
        <div className="px-6 mb-6">
          <div className="flex justify-center gap-2">
            {(['HUF', 'EUR', 'USD'] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  currency === c
                    ? 'bg-[#D2F159] text-[#171725]'
                    : 'bg-[#252a32] text-white/60'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Tiers */}
        <div className="px-4 space-y-4">
          {(['STARTER', 'PROFESSIONAL', 'ENTERPRISE'] as LicenseTier[]).map((tier) => {
            const Icon = TIER_ICONS[tier]
            const isSelected = selectedTier === tier
            const isPopular = tier === 'PROFESSIONAL'

            return (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all relative ${
                  isSelected
                    ? 'border-[#D2F159] bg-[#D2F159]/10'
                    : 'border-white/10 bg-[#252a32]'
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-4 px-3 py-1 bg-[#D2F159] text-[#171725] text-xs font-bold rounded-full">
                    NÉPSZERŰ
                  </span>
                )}
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-[#D2F159]' : 'bg-[#171725]'
                  }`}>
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-[#171725]' : 'text-[#D2F159]'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-white font-semibold">{TIER_NAMES[tier]}</h3>
                      <div className="text-right">
                        <span className="text-[#D2F159] text-xl font-bold">
                          {DISPLAY_PRICES[tier][currency]}
                        </span>
                        <span className="text-white/40 text-sm">/hó</span>
                      </div>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {FEATURES[tier].slice(0, 3).map((feature, i) => (
                        <li key={i} className="text-white/60 text-sm flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#D2F159]" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* CTA */}
        <div className="px-6 pt-6">
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full py-4 rounded-full bg-[#D2F159] text-[#171725] font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>Próbaidő indítása</>
            )}
          </button>
          <p className="text-center text-white/40 text-xs mt-3">
            A fizetési adataid biztonságban vannak. Stripe-ot használunk.
          </p>
        </div>

        {/* Trust badges */}
        <div className="px-6 pt-6 flex justify-center gap-6">
          <div className="text-center">
            <div className="text-white/60 text-2xl">🔒</div>
            <p className="text-white/40 text-xs">Biztonságos</p>
          </div>
          <div className="text-center">
            <div className="text-white/60 text-2xl">💳</div>
            <p className="text-white/40 text-xs">Stripe</p>
          </div>
          <div className="text-center">
            <div className="text-white/60 text-2xl">🍎</div>
            <p className="text-white/40 text-xs">Apple Pay</p>
          </div>
          <div className="text-center">
            <div className="text-white/60 text-2xl">📱</div>
            <p className="text-white/40 text-xs">Google Pay</p>
          </div>
        </div>
      </div>
    </div>
  )
}
