"use client"

import { ChevronLeft, Check, X, User, Crown, Building2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'

const TIER_NAMES = { STARTER: 'Alap', PROFESSIONAL: 'Prémium', ENTERPRISE: 'Üzleti' }
const TIER_ICONS = { STARTER: User, PROFESSIONAL: Crown, ENTERPRISE: Building2 }
const MONTHLY_PRICES = { STARTER: '9 900 Ft', PROFESSIONAL: '29 990 Ft', ENTERPRISE: '74 990 Ft' }

type FeatureValue = boolean | string | number
interface Feature { name: string; category: string; starter: FeatureValue; professional: FeatureValue; enterprise: FeatureValue }

const FEATURES: Feature[] = [
  { name: 'Tagok száma', category: 'Kapacitás', starter: 'Max 5', professional: 'Max 75', enterprise: 'Korlátlan' },
  { name: 'Edzők száma', category: 'Kapacitás', starter: 'Max 2', professional: 'Max 10', enterprise: 'Korlátlan' },
  { name: 'Órák száma / hónap', category: 'Kapacitás', starter: 'Max 50', professional: 'Max 200', enterprise: 'Korlátlan' },
  { name: 'Helyszínek száma', category: 'Kapacitás', starter: '1', professional: '3', enterprise: 'Korlátlan' },
  { name: 'Órarend kezelés', category: 'Alapfunkciók', starter: true, professional: true, enterprise: true },
  { name: 'Jelenléti ív', category: 'Alapfunkciók', starter: true, professional: true, enterprise: true },
  { name: 'Tag nyilvántartás', category: 'Alapfunkciók', starter: true, professional: true, enterprise: true },
  { name: 'Fizetés követés', category: 'Alapfunkciók', starter: true, professional: true, enterprise: true },
  { name: 'Email támogatás', category: 'Alapfunkciók', starter: true, professional: true, enterprise: true },
  { name: 'Online fizetés (Stripe)', category: 'Prémium funkciók', starter: false, professional: true, enterprise: true },
  { name: 'Push értesítések', category: 'Prémium funkciók', starter: false, professional: true, enterprise: true },
  { name: 'Appon belüli üzenetküldés', category: 'Prémium funkciók', starter: false, professional: true, enterprise: true },
  { name: 'Riportok és statisztikák', category: 'Prémium funkciók', starter: false, professional: true, enterprise: true },
  { name: 'Csoportok kezelése', category: 'Prémium funkciók', starter: false, professional: true, enterprise: true },
  { name: 'Automatikus emlékeztetők', category: 'Prémium funkciók', starter: false, professional: true, enterprise: true },
  { name: 'Exportálás (CSV, PDF)', category: 'Prémium funkciók', starter: false, professional: true, enterprise: true },
  { name: 'Kiemelt ügyfélszolgálat', category: 'Üzleti funkciók', starter: false, professional: false, enterprise: true },
  { name: 'Prioritás support', category: 'Üzleti funkciók', starter: false, professional: false, enterprise: true },
  { name: 'Egyéni jogosultságok', category: 'Üzleti funkciók', starter: false, professional: false, enterprise: true },
  { name: 'API hozzáférés', category: 'Üzleti funkciók', starter: false, professional: false, enterprise: true },
]

const categories = [...new Set(FEATURES.map(f => f.category))]

function FeatureCell({ value }: { value: FeatureValue }) {
  if (typeof value === 'boolean') {
    return value ? <Check className="w-5 h-5 text-[#D2F159] mx-auto" /> : <X className="w-5 h-5 text-white/20 mx-auto" />
  }
  return <span className="text-white text-xs lg:text-sm text-center">{value}</span>
}

export default function FeaturesPage() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#171725" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute -top-40 -right-40 w-80 h-80 lg:w-[500px] lg:h-[500px] rounded-full opacity-30" style={{ background: "radial-gradient(circle, #D2F159 0%, transparent 70%)" }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity }} />
      </div>

      {/* Header */}
      <div className="sticky top-0 bg-[#171725]/95 backdrop-blur-sm z-10 px-4 lg:px-8 py-4 border-b border-white/5">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-[#252a32] flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white text-xl font-bold">Csomagok összehasonlítása</h1>
        </div>
      </div>

      <div className="flex-1 px-4 lg:px-8 py-6 overflow-x-auto">
        <div className="max-w-4xl mx-auto">
          {/* Tier headers */}
          <div className="grid grid-cols-4 gap-2 mb-6 sticky top-0 bg-[#171725] py-2">
            <div />
            {(['STARTER', 'PROFESSIONAL', 'ENTERPRISE'] as const).map((tier) => {
              const Icon = TIER_ICONS[tier]
              return (
                <motion.div key={tier} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`text-center p-3 rounded-xl ${tier === 'PROFESSIONAL' ? 'bg-[#D2F159]/10 border border-[#D2F159]/30' : 'bg-[#252a32]'}`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 ${tier === 'PROFESSIONAL' ? 'bg-[#D2F159] text-[#171725]' : 'bg-[#171725] text-[#D2F159]'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-white font-semibold text-sm">{TIER_NAMES[tier]}</p>
                  <p className="text-[#D2F159] text-xs font-medium">{MONTHLY_PRICES[tier]}/hó</p>
                </motion.div>
              )
            })}
          </div>

          {/* Features by category */}
          {categories.map((category, catIdx) => (
            <motion.div key={category} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: catIdx * 0.1 }} className="mb-6">
              <h2 className="text-white/40 text-xs uppercase tracking-wider mb-3 px-2">{category}</h2>
              <div className="bg-[#1E1E2D]/80 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden">
                {FEATURES.filter(f => f.category === category).map((feature, idx) => (
                  <div key={feature.name} className={`grid grid-cols-4 gap-2 py-3 px-3 ${idx > 0 ? 'border-t border-white/5' : ''}`}>
                    <span className="text-white/70 text-sm">{feature.name}</span>
                    <div className="flex justify-center"><FeatureCell value={feature.starter} /></div>
                    <div className="flex justify-center"><FeatureCell value={feature.professional} /></div>
                    <div className="flex justify-center"><FeatureCell value={feature.enterprise} /></div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8">
            <button onClick={() => router.push('/subscribe')} className="w-full bg-gradient-to-r from-[#D2F159] to-[#c4e350] text-[#171725] rounded-xl py-4 font-bold transition-all hover:shadow-lg hover:shadow-[#D2F159]/20">
              Csomag kiválasztása
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
