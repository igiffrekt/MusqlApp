"use client"

import { useSession } from "next-auth/react"
import { TIERS, type TierName, type TierFeatures, type TierLimits } from "@/lib/tier-features"

export function useTier() {
  const { data: session } = useSession()
  
  const tierName = (session?.user?.organization?.licenseTier || "STARTER") as TierName
  const tier = TIERS[tierName] || TIERS.STARTER
  
  const hasFeature = (featureKey: keyof TierFeatures): boolean => {
    return tier.features[featureKey] ?? false
  }
  
  const getLimit = (limitKey: keyof TierLimits): number => {
    return tier.limits[limitKey] ?? 0
  }
  
  const isWithinLimit = (limitKey: keyof TierLimits, currentValue: number): boolean => {
    const limit = tier.limits[limitKey]
    if (limit === -1) return true // unlimited
    return currentValue < limit
  }
  
  const isUnlimited = (limitKey: keyof TierLimits): boolean => {
    return tier.limits[limitKey] === -1
  }
  
  return {
    tierName,
    tier,
    hasFeature,
    getLimit,
    isWithinLimit,
    isUnlimited,
    isStarter: tierName === "STARTER",
    isPro: tierName === "PRO",
    isEnterprise: tierName === "ENTERPRISE",
  }
}

// Server-side version for API routes
export function getTierFromLicenseTier(licenseTier: string) {
  const tierName = (licenseTier || "STARTER") as TierName
  const tier = TIERS[tierName] || TIERS.STARTER
  
  return {
    tierName,
    tier,
    hasFeature: (featureKey: keyof TierFeatures): boolean => {
      return tier.features[featureKey] ?? false
    },
    getLimit: (limitKey: keyof TierLimits): number => {
      return tier.limits[limitKey] ?? 0
    },
    isWithinLimit: (limitKey: keyof TierLimits, currentValue: number): boolean => {
      const limit = tier.limits[limitKey]
      if (limit === -1) return true
      return currentValue < limit
    },
  }
}
