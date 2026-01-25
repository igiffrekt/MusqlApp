"use client"

import { useState, useEffect } from "react"
import {
  Check,
  X,
  Users,
  Building2,
  Calendar,
  CreditCard,
  Bell,
  Settings,
  Headphones,
  Crown,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  TIERS,
  FEATURE_DISPLAY,
  formatLimit,
  formatPrice,
  type TierName,
} from "@/lib/tier-features"

const categoryIcons = {
  limits: Users,
  core: Calendar,
  payments: CreditCard,
  communication: Bell,
  advanced: Settings,
  enterprise: Crown,
  support: Headphones,
}

const categoryNames = {
  limits: "Limitek",
  core: "Alapfunkciók",
  payments: "Fizetések",
  communication: "Kommunikáció",
  advanced: "Haladó funkciók",
  enterprise: "Elite+",
  support: "Támogatás",
}

interface OrgStats {
  starter: number
  pro: number
  enterprise: number
}

export default function TiersPage() {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    limits: true,
    core: true,
    payments: true,
    communication: false,
    advanced: false,
    enterprise: false,
    support: false,
  })
  const [orgStats, setOrgStats] = useState<OrgStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/organizations")
        if (response.ok) {
          const data = await response.json()
          const orgs = data.organizations || []
          setOrgStats({
            starter: orgs.filter((o: { licenseTier: string }) => o.licenseTier === "STARTER").length,
            pro: orgs.filter((o: { licenseTier: string }) => o.licenseTier === "PRO").length,
            enterprise: orgs.filter((o: { licenseTier: string }) => o.licenseTier === "ENTERPRISE").length,
          })
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const getFeatureValue = (tierName: TierName, featureKey: string) => {
    const tier = TIERS[tierName]
    
    // Check if it's a limit
    if (featureKey in tier.limits) {
      const value = tier.limits[featureKey as keyof typeof tier.limits]
      return formatLimit(value)
    }
    
    // It's a feature
    return tier.features[featureKey as keyof typeof tier.features]
  }

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="w-5 h-5 text-green-400" />
      ) : (
        <X className="w-5 h-5 text-white/20" />
      )
    }
    return <span className="text-white font-medium">{value}</span>
  }

  // Group features by category
  const featuresByCategory = FEATURE_DISPLAY.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = []
    }
    acc[feature.category].push(feature)
    return acc
  }, {} as Record<string, typeof FEATURE_DISPLAY>)

  const tierOrder: TierName[] = ["STARTER", "PRO", "ENTERPRISE"]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Előfizetési csomagok</h1>
        <p className="text-white/60 mt-1">Csomagok és funkciók kezelése</p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tierOrder.map((tierName) => {
          const tier = TIERS[tierName]
          const Icon = tierName === "STARTER" ? Users : tierName === "PRO" ? Building2 : Crown
          const iconBg = tierName === "STARTER" ? "bg-gray-500/20" : tierName === "PRO" ? "bg-blue-500/20" : "bg-purple-500/20"
          const iconColor = tierName === "STARTER" ? "text-gray-400" : tierName === "PRO" ? "text-blue-400" : "text-purple-400"
          const count = orgStats ? orgStats[tierName.toLowerCase() as keyof OrgStats] : 0

          return (
            <div
              key={tierName}
              className={cn(
                "bg-[#171725] rounded-2xl p-6 relative",
                tier.popular ? "border-2 border-[#D2F159]" : "border border-white/5"
              )}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#D2F159] text-[#171725] text-xs font-bold px-3 py-1 rounded-full">
                    LEGNÉPSZERŰBB
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", iconBg)}>
                  <Icon className={cn("w-6 h-6", iconColor)} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{tier.displayName}</h3>
                  <p className="text-white/40 text-sm">{tier.description}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className={cn(
                    "text-3xl font-bold",
                    tier.popular ? "text-[#D2F159]" : "text-white"
                  )}>
                    {formatPrice(tier.monthlyPrice)}
                  </span>
                  <span className="text-white/40">/hó</span>
                </div>
                <p className="text-white/40 text-sm mt-1">
                  vagy {formatPrice(tier.yearlyPrice)}/év (2 hónap ajándék)
                </p>
              </div>

              {/* Quick limits */}
              <div className="space-y-2 mb-4 pb-4 border-b border-white/10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Tagok</span>
                  <span className="text-white font-medium">{formatLimit(tier.limits.maxMembers)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Edzők</span>
                  <span className="text-white font-medium">{formatLimit(tier.limits.maxCoaches)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Helyszínek</span>
                  <span className="text-white font-medium">{formatLimit(tier.limits.maxLocations)}</span>
                </div>
              </div>

              {/* Current subscribers */}
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-sm">Aktív előfizetők</span>
                {loading ? (
                  <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
                ) : (
                  <span className={cn(
                    "text-lg font-bold",
                    tier.popular ? "text-[#D2F159]" : "text-white"
                  )}>
                    {count}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Feature Comparison Table */}
      <div className="bg-[#171725] rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Funkciók összehasonlítása</h2>
          <p className="text-white/40 text-sm mt-1">Részletes funkció lista csomagonként</p>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-4 gap-4 px-6 py-4 bg-[#0f0f14] border-b border-white/10">
          <div className="text-white/60 font-medium text-sm">Funkció</div>
          {tierOrder.map((tierName) => (
            <div key={tierName} className="text-center">
              <span className={cn(
                "font-semibold text-sm",
                tierName === "PRO" ? "text-[#D2F159]" : "text-white"
              )}>
                {TIERS[tierName].displayName}
              </span>
            </div>
          ))}
        </div>

        {/* Feature Categories */}
        {Object.entries(featuresByCategory).map(([category, features]) => {
          const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons]
          const isExpanded = expandedCategories[category]

          return (
            <div key={category}>
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full grid grid-cols-4 gap-4 px-6 py-3 bg-[#1a1a2e] hover:bg-[#1f1f35] transition-colors border-b border-white/5"
              >
                <div className="flex items-center gap-3">
                  <CategoryIcon className="w-4 h-4 text-[#D2F159]" />
                  <span className="text-white font-medium text-sm">
                    {categoryNames[category as keyof typeof categoryNames]}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-white/40" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-white/40" />
                  )}
                </div>
                <div className="col-span-3" />
              </button>

              {/* Feature Rows */}
              {isExpanded && features.map((feature) => (
                <div
                  key={feature.key}
                  className="grid grid-cols-4 gap-4 px-6 py-3 border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-white/70 text-sm pl-7">{feature.name}</span>
                  </div>
                  {tierOrder.map((tierName) => (
                    <div key={tierName} className="flex items-center justify-center">
                      {renderFeatureValue(getFeatureValue(tierName, feature.key))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Revenue Estimate */}
      <div className="bg-[#171725] rounded-2xl border border-white/5 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Becsült havi bevétel</h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-[#D2F159] animate-spin" />
          </div>
        ) : orgStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#0f0f14] rounded-xl p-4">
              <p className="text-white/40 text-sm mb-1">Starter</p>
              <p className="text-white text-xl font-bold">
                {formatPrice(orgStats.starter * TIERS.STARTER.monthlyPrice)}
              </p>
              <p className="text-white/40 text-xs">{orgStats.starter} × {formatPrice(TIERS.STARTER.monthlyPrice)}</p>
            </div>
            <div className="bg-[#0f0f14] rounded-xl p-4">
              <p className="text-white/40 text-sm mb-1">Pro</p>
              <p className="text-[#D2F159] text-xl font-bold">
                {formatPrice(orgStats.pro * TIERS.PRO.monthlyPrice)}
              </p>
              <p className="text-white/40 text-xs">{orgStats.pro} × {formatPrice(TIERS.PRO.monthlyPrice)}</p>
            </div>
            <div className="bg-[#0f0f14] rounded-xl p-4">
              <p className="text-white/40 text-sm mb-1">Enterprise</p>
              <p className="text-white text-xl font-bold">
                {formatPrice(orgStats.enterprise * TIERS.ENTERPRISE.monthlyPrice)}
              </p>
              <p className="text-white/40 text-xs">{orgStats.enterprise} × {formatPrice(TIERS.ENTERPRISE.monthlyPrice)}</p>
            </div>
            <div className="bg-[#D2F159]/10 border border-[#D2F159]/30 rounded-xl p-4">
              <p className="text-[#D2F159]/70 text-sm mb-1">Összesen</p>
              <p className="text-[#D2F159] text-xl font-bold">
                {formatPrice(
                  orgStats.starter * TIERS.STARTER.monthlyPrice +
                  orgStats.pro * TIERS.PRO.monthlyPrice +
                  orgStats.enterprise * TIERS.ENTERPRISE.monthlyPrice
                )}
              </p>
              <p className="text-[#D2F159]/50 text-xs">havi becsült bevétel</p>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="bg-[#171725] rounded-2xl border border-white/5 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Megjegyzések</h2>
        <ul className="space-y-2 text-white/60 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-[#D2F159]">•</span>
            Az éves előfizetés 2 hónap ajándékot jelent (10 hónap árát fizetik)
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#D2F159]">•</span>
            A limitek túllépése esetén a rendszer figyelmezteti a felhasználót az upgrade lehetőségére
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#D2F159]">•</span>
            Enterprise csomaghoz egyedi árazás is kérhető nagyobb szervezetek számára
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#D2F159]">•</span>
            Minden csomag tartalmaz 14 napos ingyenes próbaidőszakot
          </li>
        </ul>
      </div>
    </div>
  )
}
