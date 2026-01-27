"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Loader2, Check, User, Crown, Building2, ChevronRight, Gift } from 'lucide-react'
import Link from 'next/link'

type LicenseTier = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
type Currency = 'USD' | 'EUR' | 'HUF'
type BillingPeriod = 'monthly' | 'annual'

// Monthly prices
const MONTHLY_PRICES: Record<LicenseTier, Record<Currency, number>> = {
  STARTER: { USD: 29, EUR: 27, HUF: 10900 },
  PROFESSIONAL: { USD: 79, EUR: 73, HUF: 29900 },
  ENTERPRISE: { USD: 199, EUR: 185, HUF: 74900 },
}

// Annual = 10 months (2 months free)
const getAnnualPrice = (tier: LicenseTier, currency: Currency) => 
  MONTHLY_PRICES[tier][currency] * 10

const formatPrice = (amount: number, currency: Currency) => {
  if (currency === 'HUF') {
    return `${amount.toLocaleString('hu-HU')} Ft`
  }
  if (currency === 'EUR') return `€${amount}`
  return `$${amount}`
}

const FEATURES: Record<LicenseTier, string[]> = {
  STARTER: ['Max 25 tag', 'Max 50 óra/hó', 'Max 2 edző', 'Email támogatás'],
  PROFESSIONAL: ['Max 100 tag', 'Max 200 óra/hó', 'Max 10 edző', 'Prioritás támogatás', 'Egyéni márka'],
  ENTERPRISE: ['Korlátlan tag', 'Korlátlan óra', 'Korlátlan edző', 'Dedikált támogatás', 'API hozzáférés'],
}

const TIER_ICONS: Record<LicenseTier, typeof User> = {
  STARTER: User,
  PROFESSIONAL: Crown,
  ENTERPRISE: Building2,
}

// Hungarian tier names
const TIER_NAMES: Record<LicenseTier, string> = {
  STARTER: 'Alap',
  PROFESSIONAL: 'Prémium',
  ENTERPRISE: 'Üzleti',
}

// Detect currency from browser/locale
function detectCurrency(): Currency {
  if (typeof window === 'undefined') return 'EUR'
  
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const locale = navigator.language || 'en'
  
  if (timezone.includes('Budapest') || locale.startsWith('hu')) return 'HUF'
  if (timezone.includes('America') || locale === 'en-US') return 'USD'
  return 'EUR'
}

export default function SubscribePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [selectedTier, setSelectedTier] = useState<LicenseTier>('PROFESSIONAL')
  const [currency, setCurrency] = useState<Currency>('EUR')
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('annual')
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
        body: JSON.stringify({ 
          licenseTier: selectedTier, 
          currency,
          billingPeriod,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Hiba történt')
      }

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

  const monthlyPrice = MONTHLY_PRICES[selectedTier][currency]
  const annualPrice = getAnnualPrice(selectedTier, currency)
  const savings = monthlyPrice * 12 - annualPrice

  return (
    <div className="min-h-screen bg-black font-lufga">
      <div className="min-h-screen bg-[#171725] mx-[5px] my-[5px] rounded-2xl pb-8 overflow-y-auto">
        {/* Header */}
        <div className="px-6 pt-8 pb-2 text-center">
          <h1 className="text-white text-2xl font-bold mb-4">Válassz csomagot</h1>
          
          {/* Trial highlight - more prominent */}
          <div className="bg-gradient-to-r from-[#D2F159]/20 via-[#D2F159]/10 to-[#D2F159]/20 border border-[#D2F159]/40 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Gift className="w-5 h-5 text-[#D2F159]" />
              <span className="text-[#D2F159] font-bold text-lg">15 NAP INGYEN</span>
              <Gift className="w-5 h-5 text-[#D2F159]" />
            </div>
            <p className="text-white/70 text-sm">
              Próbáld ki kötelezettség nélkül • Bármikor lemondható
            </p>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="px-6 py-4">
          <div className="bg-[#252a32] rounded-2xl p-1.5 flex relative">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-[#171725] text-white'
                  : 'text-white/40'
              }`}
            >
              Havi
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all relative ${
                billingPeriod === 'annual'
                  ? 'bg-[#D2F159] text-[#171725]'
                  : 'text-white/40'
              }`}
            >
              Éves
            </button>
          </div>
          
          {/* 2 months free - more prominent, separate */}
          <div className={`mt-3 transition-all ${billingPeriod === 'annual' ? 'opacity-100' : 'opacity-50'}`}>
            <div className="bg-[#D2F159] text-[#171725] rounded-xl py-2.5 px-4 flex items-center justify-center gap-2">
              <span className="text-xl">🎁</span>
              <span className="font-bold">2 HÓNAP INGYEN</span>
              <span className="text-sm font-medium">– Spórolj {formatPrice(savings, currency)}-t!</span>
            </div>
          </div>
          
          {/* Subtle nudge for monthly */}
          {billingPeriod === 'monthly' && (
            <p className="text-center text-white/40 text-xs mt-2">
              ↑ Válts évesre és spórolj <span className="text-[#D2F159]">{formatPrice(savings, currency)}</span>-t
            </p>
          )}
        </div>

        {/* Currency selector */}
        <div className="px-6 mb-4">
          <div className="flex justify-center gap-1">
            {(['HUF', 'EUR', 'USD'] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  currency === c
                    ? 'bg-white/10 text-white'
                    : 'text-white/30'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Tiers */}
        <div className="px-4 space-y-3">
          {(['STARTER', 'PROFESSIONAL', 'ENTERPRISE'] as LicenseTier[]).map((tier) => {
            const Icon = TIER_ICONS[tier]
            const isSelected = selectedTier === tier
            const isPopular = tier === 'PROFESSIONAL'
            const price = billingPeriod === 'annual' 
              ? Math.round(getAnnualPrice(tier, currency) / 12)
              : MONTHLY_PRICES[tier][currency]
            const totalAnnual = getAnnualPrice(tier, currency)

            return (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all relative ${
                  isSelected
                    ? 'border-[#D2F159] bg-[#D2F159]/10'
                    : 'border-white/10 bg-[#252a32]'
                } ${isPopular && !isSelected ? 'border-[#D2F159]/30' : ''}`}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-4 px-3 py-1 bg-[#D2F159] text-[#171725] text-xs font-bold rounded-full flex items-center gap-1">
                    <Crown className="w-3 h-3 fill-current" /> LEGNÉPSZERŰBB
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
                          {formatPrice(price, currency)}
                        </span>
                        <span className="text-white/40 text-sm">/hó</span>
                        {billingPeriod === 'annual' && (
                          <div className="text-white/30 text-xs line-through">
                            {formatPrice(MONTHLY_PRICES[tier][currency], currency)}/hó
                          </div>
                        )}
                      </div>
                    </div>
                    {billingPeriod === 'annual' && (
                      <p className="text-white/50 text-xs mt-1">
                        {formatPrice(totalAnnual, currency)} / év
                      </p>
                    )}
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

        {/* Features comparison link */}
        <div className="px-6 pt-4">
          <Link 
            href="/subscribe/features"
            className="flex items-center justify-center gap-2 text-white/50 hover:text-[#D2F159] transition-colors text-sm"
          >
            <span>Részletes funkcióösszehasonlítás</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
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
            className="w-full py-4 rounded-full bg-[#D2F159] text-[#171725] font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-transform"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>Próbaidő indítása</>
            )}
          </button>
          
          {/* Trust line */}
          <p className="text-center text-white/40 text-xs mt-3">
            Első fizetés: <span className="text-[#D2F159] font-medium">{formattedTrialEnd}</span>
          </p>
        </div>

        {/* Payment methods - using image files from public folder */}
        <div className="px-6 pt-6">
          <p className="text-white/30 text-xs text-center mb-3">Elfogadott fizetési módok</p>
          <div className="flex justify-center items-center gap-3">
            <img src="/img/payments/visa.svg" alt="Visa" className="h-8" />
            <img src="/img/payments/mastercard.svg" alt="Mastercard" className="h-8" />
            <img src="/img/payments/applepay.svg" alt="Apple Pay" className="h-8" />
            <img src="/img/payments/googlepay.svg" alt="Google Pay" className="h-8" />
          </div>
        </div>

        {/* Security badges */}
        <div className="px-6 pt-4 pb-4">
          <div className="flex justify-center items-center gap-2 text-white/30 text-xs">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
            </svg>
            <span>256-bit SSL titkosítás</span>
            <span className="text-white/20">•</span>
            <span>Stripe fizetés</span>
          </div>
        </div>
      </div>
    </div>
  )
}
