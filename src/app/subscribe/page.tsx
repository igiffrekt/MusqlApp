"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Loader2, Check, Zap, Building2, Rocket, Star } from 'lucide-react'

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
  
  if (timezone.includes('Budapest') || locale.startsWith('hu')) return 'HUF'
  if (timezone.includes('America') || locale === 'en-US') return 'USD'
  return 'EUR'
}

// Apple Pay Icon
const ApplePayIcon = () => (
  <svg viewBox="0 0 50 20" className="h-6 w-auto" fill="currentColor">
    <path d="M9.6 4.1c-.6.7-1.5 1.2-2.4 1.1-.1-.9.3-1.9.9-2.5.6-.7 1.5-1.1 2.3-1.2.1 1-.3 1.9-.8 2.6zm.8 1.3c-1.3-.1-2.5.8-3.1.8-.6 0-1.6-.7-2.7-.7-1.4 0-2.7.8-3.4 2-.6 1.1-.5 3.2.5 5 .7 1.2 1.5 2.5 2.7 2.5 1.1 0 1.4-.7 2.8-.7 1.5 0 1.7.7 2.9.7 1.1 0 1.9-1.2 2.6-2.4.5-.9.7-1.3 1.1-2.3-2.8-1.1-3.3-5.2-.4-6.9z"/>
    <path d="M21.2 1.3h3.6c2.5 0 4.2 1.7 4.2 4.3 0 2.6-1.7 4.3-4.3 4.3h-2.3v4.4h-1.2V1.3zm1.2 7.5h1.9c1.7 0 2.7-1.2 2.7-3.1 0-2-1-3.2-2.7-3.2h-1.9v6.3zm8.1 3.6c0-1.7 1.3-2.7 3.6-2.9l2.6-.1v-.7c0-1.1-.7-1.7-1.9-1.7-1.1 0-1.8.5-2 1.3h-1.1c.1-1.4 1.3-2.4 3.2-2.4 1.9 0 3 1 3 2.7v5.7h-1.1v-1.4h0c-.4.9-1.3 1.5-2.5 1.5-1.6 0-2.8-1-2.8-2.5zm6.2-.8v-.8l-2.4.2c-1.5.1-2.3.6-2.3 1.5 0 .9.8 1.5 1.9 1.5 1.5 0 2.8-1 2.8-2.4zm3.3 5.6v-1c.1 0 .4.1.6.1.9 0 1.4-.4 1.7-1.4l.2-.5-3-8.3h1.3l2.4 7.2h0l2.4-7.2h1.2l-3.1 8.7c-.7 2-1.5 2.6-3.2 2.6-.2 0-.4 0-.5-.2z"/>
  </svg>
)

// Google Pay Icon
const GooglePayIcon = () => (
  <svg viewBox="0 0 41 17" className="h-5 w-auto">
    <path fill="#5F6368" d="M19.5 8.4v4.9h-1.6V1.3h4.1c1 0 1.9.3 2.6 1 .7.7 1.1 1.5 1.1 2.5s-.4 1.9-1.1 2.5c-.7.7-1.6 1-2.6 1h-2.5zm0-5.6v4.1h2.6c.6 0 1.1-.2 1.5-.6.4-.4.6-.9.6-1.5 0-.5-.2-1-.6-1.4-.4-.4-.9-.6-1.5-.6h-2.6z"/>
    <path fill="#5F6368" d="M30 5.3c1.2 0 2.1.3 2.8 1 .7.7 1 1.6 1 2.8v4.2h-1.5v-.9h-.1c-.6 1-1.5 1.1-2.3 1.1-.7 0-1.4-.2-1.9-.6-.5-.4-.8-1-.8-1.8 0-.8.3-1.4.9-1.8.6-.5 1.4-.7 2.4-.7.9 0 1.6.2 2.1.5v-.4c0-.5-.2-.9-.6-1.2-.4-.3-.8-.5-1.4-.5-.8 0-1.4.3-1.8 1l-1.4-.9c.6-1 1.6-1.5 2.9-1.5zm-1.7 5.5c0 .4.2.7.5.9.3.2.7.4 1.1.4.6 0 1.2-.2 1.6-.7.5-.4.7-.9.7-1.5-.4-.3-1-.5-1.8-.5s-1.3.2-1.6.4c-.3.3-.5.6-.5 1z"/>
    <path fill="#5F6368" d="M41 5.5l-5 11.5h-1.6l1.8-4-3.3-7.5h1.7l2.3 5.6h0l2.3-5.6H41z"/>
    <path fill="#4285F4" d="M13.3 7.2c0-.5 0-.9-.1-1.4H6.8v2.6h3.7c-.2.9-.7 1.7-1.4 2.2v1.8h2.3c1.3-1.2 2.1-3.1 2.1-5.2z"/>
    <path fill="#34A853" d="M6.8 14.2c1.9 0 3.5-.6 4.6-1.7l-2.3-1.8c-.6.4-1.4.7-2.4.7-1.8 0-3.4-1.2-3.9-2.9H.5v1.8c1.2 2.4 3.6 3.9 6.3 3.9z"/>
    <path fill="#FBBC05" d="M2.9 8.5c-.1-.4-.2-.8-.2-1.3s.1-.9.2-1.3V4.1H.5C.2 4.8 0 5.6 0 6.4c0 .8.2 1.6.5 2.4l2.4-1.8z"/>
    <path fill="#EA4335" d="M6.8 2.6c1 0 1.9.4 2.7 1.1l2-2C10.2.6 8.7 0 6.8 0 4.1 0 1.7 1.5.5 3.9l2.4 1.8c.5-1.6 2.1-2.9 3.9-3.1z"/>
  </svg>
)

export default function SubscribePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [selectedTier, setSelectedTier] = useState<LicenseTier>('PROFESSIONAL') // Default to Professional
  const [currency, setCurrency] = useState<Currency>('EUR')
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('annual') // Default to annual!
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
  const annualMonthly = Math.round(annualPrice / 12)
  const savings = monthlyPrice * 12 - annualPrice

  return (
    <div className="min-h-screen bg-black font-lufga">
      <div className="min-h-screen bg-[#171725] mx-[5px] my-[5px] rounded-2xl pb-8 overflow-y-auto">
        {/* Header */}
        <div className="px-6 pt-8 pb-2 text-center">
          <h1 className="text-white text-2xl font-bold mb-2">Válassz csomagot</h1>
          <p className="text-white/60 text-sm">
            15 napos ingyenes próbaidő • Bármikor lemondható
          </p>
        </div>

        {/* Billing Toggle - Heavily favoring annual */}
        <div className="px-6 py-4">
          <div className="bg-[#252a32] rounded-2xl p-1 flex relative">
            {/* Annual badge */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-[#D2F159] text-[#171725] text-[10px] font-bold px-2 py-0.5 rounded-full">
                2 HÓNAP INGYEN 🎁
              </span>
            </div>
            
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
              <span className="flex items-center justify-center gap-1">
                Éves
                {billingPeriod === 'annual' && <Star className="w-3 h-3 fill-current" />}
              </span>
            </button>
          </div>
          
          {/* Savings callout for annual */}
          {billingPeriod === 'annual' && (
            <div className="mt-3 text-center">
              <p className="text-[#D2F159] text-sm font-medium">
                💰 Spórolj {formatPrice(savings, currency)}-t évente!
              </p>
            </div>
          )}
          
          {/* Subtle nudge for monthly */}
          {billingPeriod === 'monthly' && (
            <div className="mt-3 text-center">
              <p className="text-white/40 text-xs">
                Éves előfizetéssel <span className="text-[#D2F159]">{formatPrice(savings, currency)}</span>-t spórolsz
              </p>
            </div>
          )}
        </div>

        {/* Currency selector - smaller, less prominent */}
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
                    <Star className="w-3 h-3 fill-current" /> LEGNÉPSZERŰBB
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
              <>
                {billingPeriod === 'annual' ? '🎁 ' : ''}Próbaidő indítása
              </>
            )}
          </button>
          
          {/* Trust line */}
          <p className="text-center text-white/40 text-xs mt-3">
            Első fizetés: <span className="text-[#D2F159] font-medium">{formattedTrialEnd}</span>
          </p>
        </div>

        {/* Payment methods with proper icons */}
        <div className="px-6 pt-6">
          <p className="text-white/30 text-xs text-center mb-3">Elfogadott fizetési módok</p>
          <div className="flex justify-center items-center gap-4">
            <div className="bg-white/5 rounded-lg px-3 py-2 flex items-center justify-center">
              <svg className="h-6" viewBox="0 0 36 24" fill="none">
                <rect width="36" height="24" rx="4" fill="#1A1F71"/>
                <path d="M15.5 15.5H13L14.8 8.5H17.3L15.5 15.5Z" fill="white"/>
                <path d="M23.3 8.7C22.8 8.5 22 8.3 21 8.3C18.5 8.3 16.8 9.5 16.8 11.2C16.8 12.5 18 13.2 18.9 13.6C19.8 14 20.1 14.3 20.1 14.7C20.1 15.3 19.4 15.6 18.7 15.6C17.7 15.6 17.2 15.5 16.4 15.1L16.1 14.9L15.8 16.8C16.4 17.1 17.4 17.3 18.5 17.3C21.2 17.3 22.8 16.1 22.8 14.3C22.8 13.3 22.2 12.5 20.8 11.9C20 11.5 19.5 11.3 19.5 10.8C19.5 10.4 19.9 10 20.8 10C21.6 10 22.2 10.1 22.6 10.3L22.8 10.4L23.3 8.7Z" fill="white"/>
                <path d="M26.5 8.5H24.6C24 8.5 23.5 8.7 23.3 9.3L19.5 15.5H22.2L22.7 14H26L26.3 15.5H28.7L26.5 8.5ZM23.4 12.3C23.6 11.8 24.4 9.8 24.4 9.8C24.4 9.8 24.6 9.3 24.7 9L24.9 9.7C24.9 9.7 25.4 11.8 25.5 12.3H23.4Z" fill="white"/>
                <path d="M11.8 8.5L9.3 13.3L9 11.7C8.5 10.2 7.1 8.5 5.5 7.7L7.8 15.5H10.5L14.5 8.5H11.8Z" fill="white"/>
                <path d="M7.5 8.5H3.5L3.5 8.7C6.7 9.5 8.8 11.4 9 11.7L8.3 9.3C8.2 8.7 7.7 8.5 7.5 8.5Z" fill="#F9A533"/>
              </svg>
            </div>
            <div className="bg-white/5 rounded-lg px-3 py-2 flex items-center justify-center">
              <svg className="h-6" viewBox="0 0 36 24" fill="none">
                <rect width="36" height="24" rx="4" fill="#000"/>
                <circle cx="14" cy="12" r="7" fill="#EB001B"/>
                <circle cx="22" cy="12" r="7" fill="#F79E1B"/>
                <path d="M18 6.5C19.8 7.9 21 10.1 21 12.5C21 14.9 19.8 17.1 18 18.5C16.2 17.1 15 14.9 15 12.5C15 10.1 16.2 7.9 18 6.5Z" fill="#FF5F00"/>
              </svg>
            </div>
            <div className="bg-white rounded-lg px-3 py-2 flex items-center justify-center">
              <ApplePayIcon />
            </div>
            <div className="bg-white rounded-lg px-3 py-2 flex items-center justify-center">
              <GooglePayIcon />
            </div>
          </div>
        </div>

        {/* Security badges */}
        <div className="px-6 pt-6 pb-4">
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
