"use client"

import { ChevronLeft, Check, X, User, Crown, Building2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

const TIER_NAMES = {
  STARTER: 'Alap',
  PROFESSIONAL: 'Prémium', 
  ENTERPRISE: 'Üzleti',
}

const TIER_ICONS = {
  STARTER: User,
  PROFESSIONAL: Crown,
  ENTERPRISE: Building2,
}

const MONTHLY_PRICES = {
  STARTER: '9 900 Ft',
  PROFESSIONAL: '29 990 Ft',
  ENTERPRISE: '74 990 Ft',
}

type FeatureValue = boolean | string | number

interface Feature {
  name: string
  category: string
  starter: FeatureValue
  professional: FeatureValue
  enterprise: FeatureValue
}

const FEATURES: Feature[] = [
  // Kapacitás
  { name: 'Tagok száma', category: 'Kapacitás', starter: 'Max 5', professional: 'Max 75', enterprise: 'Korlátlan' },
  { name: 'Edzők száma', category: 'Kapacitás', starter: 'Max 2', professional: 'Max 10', enterprise: 'Korlátlan' },
  { name: 'Órák száma / hónap', category: 'Kapacitás', starter: 'Max 50', professional: 'Max 200', enterprise: 'Korlátlan' },
  { name: 'Helyszínek száma', category: 'Kapacitás', starter: '1', professional: '3', enterprise: 'Korlátlan' },
  
  // Alapfunkciók
  { name: 'Órarend kezelés', category: 'Alapfunkciók', starter: true, professional: true, enterprise: true },
  { name: 'Jelenléti ív', category: 'Alapfunkciók', starter: true, professional: true, enterprise: true },
  { name: 'Tag nyilvántartás', category: 'Alapfunkciók', starter: true, professional: true, enterprise: true },
  { name: 'Fizetés követés', category: 'Alapfunkciók', starter: true, professional: true, enterprise: true },
  { name: 'Email támogatás', category: 'Alapfunkciók', starter: true, professional: true, enterprise: true },
  
  // Prémium funkciók
  { name: 'Online fizetés (Stripe)', category: 'Prémium funkciók', starter: false, professional: true, enterprise: true },
  { name: 'Push értesítések', category: 'Prémium funkciók', starter: false, professional: true, enterprise: true },
  { name: 'Appon belüli üzenetküldés', category: 'Prémium funkciók', starter: false, professional: true, enterprise: true },
  { name: 'Riportok és statisztikák', category: 'Prémium funkciók', starter: false, professional: true, enterprise: true },
  { name: 'Csoportok kezelése', category: 'Prémium funkciók', starter: false, professional: true, enterprise: true },
  { name: 'Automatikus emlékeztetők', category: 'Prémium funkciók', starter: false, professional: true, enterprise: true },
  { name: 'Exportálás (CSV, PDF)', category: 'Prémium funkciók', starter: false, professional: true, enterprise: true },
  
  // Üzleti funkciók
  { name: 'Kiemelt ügyfélszolgálat', category: 'Üzleti funkciók', starter: false, professional: false, enterprise: true },
  { name: 'Prioritás support', category: 'Üzleti funkciók', starter: false, professional: false, enterprise: true },
  { name: 'Egyéni jogosultságok', category: 'Üzleti funkciók', starter: false, professional: false, enterprise: true },
  { name: 'API hozzáférés', category: 'Üzleti funkciók', starter: false, professional: false, enterprise: true },
  { name: 'Saját domain', category: 'Üzleti funkciók', starter: false, professional: false, enterprise: true },
  { name: 'Fehér címkés megoldás', category: 'Üzleti funkciók', starter: false, professional: false, enterprise: true },
]

const categories = [...new Set(FEATURES.map(f => f.category))]

function FeatureCell({ value }: { value: FeatureValue }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="w-5 h-5 text-[#D2F159] mx-auto" />
    ) : (
      <X className="w-5 h-5 text-white/20 mx-auto" />
    )
  }
  return <span className="text-white text-sm">{value}</span>
}

export default function FeaturesPage() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-black font-lufga">
      <div className="min-h-screen bg-[#171725] mx-[5px] my-[5px] rounded-2xl pb-8">
        {/* Header */}
        <div className="sticky top-0 bg-[#171725] z-10 px-4 pt-4 pb-2 rounded-t-2xl">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-[#252a32] flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-white text-xl font-bold">Csomagok összehasonlítása</h1>
          </div>
          
          {/* Tier headers */}
          <div className="grid grid-cols-4 gap-2">
            <div></div>
            {(['STARTER', 'PROFESSIONAL', 'ENTERPRISE'] as const).map((tier) => {
              const Icon = TIER_ICONS[tier]
              const isPopular = tier === 'PROFESSIONAL'
              return (
                <div 
                  key={tier}
                  className={`text-center p-3 rounded-xl ${
                    isPopular ? 'bg-[#D2F159]/20 border border-[#D2F159]/40' : 'bg-[#252a32]'
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-1 ${isPopular ? 'text-[#D2F159]' : 'text-white/60'}`} />
                  <p className={`font-bold text-sm ${isPopular ? 'text-[#D2F159]' : 'text-white'}`}>
                    {TIER_NAMES[tier]}
                  </p>
                  <p className="text-white/40 text-xs mt-1">{MONTHLY_PRICES[tier]}/hó</p>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Feature list */}
        <div className="px-4 pt-4">
          {categories.map((category) => (
            <div key={category} className="mb-6">
              <h3 className="text-white/50 text-xs uppercase tracking-wider mb-3 px-2">
                {category}
              </h3>
              <div className="bg-[#252a32] rounded-xl overflow-hidden">
                {FEATURES.filter(f => f.category === category).map((feature, idx) => (
                  <div 
                    key={feature.name}
                    className={`grid grid-cols-4 gap-2 p-3 items-center ${
                      idx !== 0 ? 'border-t border-white/5' : ''
                    }`}
                  >
                    <p className="text-white/80 text-sm">{feature.name}</p>
                    <div className="text-center"><FeatureCell value={feature.starter} /></div>
                    <div className="text-center"><FeatureCell value={feature.professional} /></div>
                    <div className="text-center"><FeatureCell value={feature.enterprise} /></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* CTA */}
        <div className="px-6 pt-4">
          <button
            onClick={() => router.push('/subscribe')}
            className="w-full py-4 rounded-full bg-[#D2F159] text-[#171725] font-bold text-lg"
          >
            Csomag kiválasztása
          </button>
          <p className="text-center text-white/40 text-xs mt-3">
            15 napos ingyenes próbaidő minden csomagnál
          </p>
        </div>
      </div>
    </div>
  )
}
