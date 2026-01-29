"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Loader2, Check, User, Crown, Building2, ChevronRight, ArrowLeft, Shield } from 'lucide-react'
import { useMediaQuery } from '@/hooks/use-media-query'
import confetti from 'canvas-confetti'
import NumberFlow from '@number-flow/react'

type LicenseTier = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
type Currency = 'USD' | 'EUR' | 'HUF'

const MONTHLY_PRICES: Record<LicenseTier, Record<Currency, number>> = {
  STARTER: { USD: 25, EUR: 23, HUF: 9900 },
  PROFESSIONAL: { USD: 75, EUR: 69, HUF: 29990 },
  ENTERPRISE: { USD: 189, EUR: 175, HUF: 74990 },
}

const getAnnualPrice = (tier: LicenseTier, currency: Currency) => 
  MONTHLY_PRICES[tier][currency] * 10

const FEATURES: Record<LicenseTier, string[]> = {
  STARTER: ['Max 5 tag', 'Max 2 edző', 'Max 50 óra/hó', '1 helyszín', 'Órarend kezelés', 'Jelenléti ív', 'Email értesítések'],
  PROFESSIONAL: ['Max 75 tag', 'Max 10 edző', 'Max 200 óra/hó', '3 helyszín', 'Online kártyás fizetés', 'Push értesítések', 'Riportok és statisztikák', 'Csoportok kezelése'],
  ENTERPRISE: ['Korlátlan tag', 'Korlátlan edző', 'Korlátlan óra', 'Korlátlan helyszín', 'Prioritásos támogatás', 'API hozzáférés', 'Egyedi integráció'],
}

const TIER_NAMES: Record<LicenseTier, string> = { STARTER: 'Alap', PROFESSIONAL: 'Prémium', ENTERPRISE: 'Üzleti' }
const TIER_DESC: Record<LicenseTier, string> = { STARTER: 'Egyéni edzőknek', PROFESSIONAL: 'Stúdióknak, kluboknak', ENTERPRISE: 'Nagyobb szervezeteknek' }

function detectCurrency(): Currency {
  if (typeof window === 'undefined') return 'EUR'
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const locale = navigator.language || 'en'
  if (timezone.includes('Budapest') || locale.startsWith('hu')) return 'HUF'
  if (timezone.includes('America') || locale === 'en-US') return 'USD'
  return 'EUR'
}

function formatCurrency(amount: number, currency: Currency) {
  if (currency === 'HUF') return `${amount.toLocaleString('hu-HU')} Ft`
  if (currency === 'EUR') return `€${amount}`
  return `$${amount}`
}

export default function SubscribePage() {
  const router = useRouter()
  const { status } = useSession()
  const [isMonthly, setIsMonthly] = useState(true)
  const [currency, setCurrency] = useState<Currency>('EUR')
  const [loadingTier, setLoadingTier] = useState<LicenseTier | null>(null)
  const [error, setError] = useState<string | null>(null)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  useEffect(() => { setCurrency(detectCurrency()) }, [])
  useEffect(() => { if (status === 'unauthenticated') router.replace('/auth/signin') }, [status, router])

  const handleToggle = (toAnnual: boolean) => {
    setIsMonthly(!toAnnual)
    if (toAnnual) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x: 0.5, y: 0.3 },
        colors: ["#D2F159", "#1f2937", "#6b7280", "#e5e7eb"],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
      })
    }
  }

  const handleSubscribe = async (tier: LicenseTier) => {
    setLoadingTier(tier)
    setError(null)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseTier: tier, currency, billingPeriod: isMonthly ? 'monthly' : 'annual' }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Hiba történt')
      if (data.checkoutUrl) window.location.href = data.checkoutUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt')
      setLoadingTier(null)
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#D2F159] animate-spin" /></div>
  }

  const trialEndDate = new Date()
  trialEndDate.setDate(trialEndDate.getDate() + 15)
  const formattedTrialEnd = trialEndDate.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })

  const plans: { tier: LicenseTier; isPopular: boolean }[] = [
    { tier: 'STARTER', isPopular: false },
    { tier: 'PROFESSIONAL', isPopular: true },
    { tier: 'ENTERPRISE', isPopular: false },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[#D2F159]/15 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white/60 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Vissza</span>
          </button>
          <Link href="/">
            <Image src="/img/musql_logo.png" alt="Musql" width={100} height={28} className="h-7 w-auto" />
          </Link>
          <div className="w-16" />
        </div>
      </nav>

      <div className="py-12 px-6">
        {/* Header */}
        <div className="text-center space-y-4 mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">Válaszd ki a csomagodat</h1>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            15 napig teljesen ingyen próbálhatod, kötöttségek nélkül.<br />
            <span className="text-sm">Első fizetés: <span className="font-semibold text-[#6B8E23]">{formattedTrialEnd}</span></span>
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-1 p-1.5 bg-gray-100 rounded-full">
            <button
              onClick={() => { if (!isMonthly) handleToggle(false) }}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${isMonthly ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Havi
            </button>
            <button
              onClick={() => { if (isMonthly) handleToggle(true) }}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${!isMonthly ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Éves
              <span className="text-xs bg-[#D2F159] text-gray-900 px-2 py-0.5 rounded-full font-bold">-17%</span>
            </button>
          </div>
        </div>

        {/* Currency selector */}
        <div className="flex justify-center gap-1 mb-8">
          {(['HUF', 'EUR', 'USD'] as Currency[]).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${currency === c ? 'bg-gray-200 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {plans.map(({ tier, isPopular }, index) => {
            const Icon = tier === 'STARTER' ? User : tier === 'PROFESSIONAL' ? Crown : Building2
            const monthlyPrice = MONTHLY_PRICES[tier][currency]
            const annualTotal = getAnnualPrice(tier, currency)
            const effectiveMonthly = isMonthly ? monthlyPrice : Math.round(annualTotal / 12)
            const yearlySaving = monthlyPrice * 12 - annualTotal

            return (
              <motion.div
                key={tier}
                initial={{ y: 50, opacity: 0 }}
                whileInView={isDesktop ? {
                  y: isPopular ? -20 : 0,
                  opacity: 1,
                  x: index === 2 ? -30 : index === 0 ? 30 : 0,
                  scale: index === 0 || index === 2 ? 0.94 : 1.0,
                } : { y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.6, type: "spring", stiffness: 100, damping: 30, delay: 0.2, opacity: { duration: 0.5 } }}
                className={`rounded-2xl p-8 text-center flex flex-col relative ${
                  isPopular ? 'bg-gray-900 text-white border-2 border-[#D2F159]' : 'bg-white border border-gray-200'
                } ${!isPopular && 'mt-5 md:mt-0'} ${index === 0 || index === 2 ? 'z-0' : 'z-10'}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-[#D2F159] text-gray-900 text-xs font-bold rounded-full flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Legnépszerűbb
                    </span>
                  </div>
                )}

                <p className={`text-base font-semibold ${isPopular ? 'text-gray-300' : 'text-gray-600'}`}>{TIER_NAMES[tier]}</p>
                
                <div className="mt-6 flex items-center justify-center gap-x-2">
                  <span className={`text-5xl font-bold tracking-tight ${isPopular ? 'text-white' : 'text-gray-900'}`}>
                    <NumberFlow
                      value={effectiveMonthly}
                      format={{ style: "decimal", minimumFractionDigits: 0, maximumFractionDigits: 0 }}
                      transformTiming={{ duration: 500, easing: "ease-out" }}
                      willChange
                    />
                    <span className="text-2xl"> {currency === 'HUF' ? 'Ft' : currency === 'EUR' ? '€' : '$'}</span>
                  </span>
                  <span className={`text-sm font-semibold leading-6 ${isPopular ? 'text-gray-400' : 'text-gray-600'}`}>/hó</span>
                </div>

                <p className={`text-sm leading-5 mt-2 ${isPopular ? 'text-gray-400' : 'text-gray-600'}`}>
                  {isMonthly ? 'havonta fizetve' : (
                    <>
                      <span className="font-semibold">{formatCurrency(annualTotal, currency)}/év</span>
                      <span className="text-xs ml-1">(előre)</span>
                      <br />
                      <span className="text-[#6B8E23]">Megtakarítás: {formatCurrency(yearlySaving, currency)}/év</span>
                    </>
                  )}
                </p>

                <ul className="mt-6 gap-2 flex flex-col text-left flex-1">
                  {FEATURES[tier].map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className={`h-4 w-4 mt-1 flex-shrink-0 ${isPopular ? 'text-[#D2F159]' : 'text-green-600'}`} />
                      <span className={isPopular ? 'text-gray-200' : 'text-gray-700'}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-6">
                  <button
                    onClick={() => handleSubscribe(tier)}
                    disabled={loadingTier !== null}
                    className={`block w-full py-3 rounded-xl text-center font-semibold transition-all disabled:opacity-50 ${
                      isPopular ? 'bg-[#D2F159] text-gray-900 hover:bg-[#e5ff7a]' : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {loadingTier === tier ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Próbaidő indítása'}
                  </button>
                  <p className={`mt-4 text-xs leading-5 ${isPopular ? 'text-gray-400' : 'text-gray-600'}`}>
                    {TIER_DESC[tier]}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm text-center">
            {error}
          </motion.div>
        )}

        {/* Features link */}
        <Link href="/subscribe/features" className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm mt-8">
          <span>Részletes funkcióösszehasonlítás</span>
          <ChevronRight className="w-4 h-4" />
        </Link>

        {/* Security */}
        <div className="flex justify-center items-center gap-2 text-gray-400 text-xs mt-6">
          <Shield className="w-4 h-4" />
          <span>256-bit SSL titkosítás</span>
          <span className="text-gray-300">•</span>
          <span>Stripe fizetés</span>
        </div>

        {/* Contact */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Kérdésed van? <a href="mailto:info@musql.app" className="hover:text-gray-900 underline">info@musql.app</a>
        </p>
      </div>
    </div>
  )
}
