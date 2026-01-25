import { useState, useEffect } from "react"
import { checkFeatureAccess, checkLimit, getCurrentTier, LicenseTier } from "@/lib/license"
import type { TierFeatures, TierLimitations } from "@/types"

export function useFeatureAccess(feature: keyof TierFeatures) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkFeatureAccess(feature).then((access) => {
      setHasAccess(access)
      setLoading(false)
    })
  }, [feature])

  return { hasAccess, loading }
}

export function useLimitCheck(limitType: keyof TierLimitations) {
  const [limitData, setLimitData] = useState<{
    allowed: boolean
    current: number
    limit: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkLimit(limitType).then((data) => {
      setLimitData(data)
      setLoading(false)
    })
  }, [limitType])

  return { ...limitData, loading }
}

export function useCurrentTier() {
  const [tierData, setTierData] = useState<{
    tier: LicenseTier | null
    status: string
    features: TierFeatures
    limitations: TierLimitations
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentTier().then((data) => {
      setTierData(data)
      setLoading(false)
    })
  }, [])

  return { ...tierData, loading }
}

export function useUpgradeEligibility(targetTier: LicenseTier) {
  const [canUpgrade, setCanUpgrade] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    import("@/lib/license").then(({ canUpgradeTier }) => {
      canUpgradeTier(targetTier).then((eligible) => {
        setCanUpgrade(eligible)
        setLoading(false)
      })
    })
  }, [targetTier])

  return { canUpgrade, loading }
}