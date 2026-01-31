// Client-side license checking - calls API routes

import type { TierFeatures, TierLimitations, TierConfig, CurrentTierResponse, LimitCheckResponse } from "@/types"
import type { LicenseTier as PrismaLicenseTier } from "@prisma/client"

// Re-export Prisma's LicenseTier for consistency
export type LicenseTier = PrismaLicenseTier

// License tier enum values (for use in code that needs the actual values)
export const LicenseTierValues = {
  STARTER: "STARTER" as const,
  PRO: "PRO" as const,
  PROFESSIONAL: "PROFESSIONAL" as const,
  ENTERPRISE: "ENTERPRISE" as const,
}

// Feature flags and limitations by tier
export const TIER_FEATURES: Record<LicenseTier, TierConfig> = {
  STARTER: {
    name: "Starter",
    price: 29,
    maxStudents: 25,
    maxTrainers: 2,
    features: {
      studentManagement: true,
      sessionScheduling: true,
      basicAttendance: true,
      paymentTracking: false,
      stripePayments: false,
      smsNotifications: false,
      emailNotifications: true,
      pushNotifications: true,
      advancedReports: false,
      multiLocation: false,
      customBranding: false,
      apiAccess: false,
      prioritySupport: false,
      studentProgress: false,
      eventManagement: false,
      marketingTools: false,
    },
    limitations: {
      maxStudents: 25,
      maxTrainers: 2,
      maxSessionsPerMonth: 100,
      maxPaymentsPerMonth: 50,
    },
  },
  PRO: {
    name: "Pro",
    price: 49,
    maxStudents: 30,
    maxTrainers: 5,
    features: {
      studentManagement: true,
      sessionScheduling: true,
      basicAttendance: true,
      paymentTracking: true,
      stripePayments: false,
      smsNotifications: false,
      emailNotifications: true,
      pushNotifications: true,
      advancedReports: false,
      multiLocation: false,
      customBranding: false,
      apiAccess: false,
      prioritySupport: false,
      studentProgress: false,
      eventManagement: false,
      marketingTools: false,
    },
    limitations: {
      maxStudents: 30,
      maxTrainers: 5,
      maxSessionsPerMonth: 100,
      maxPaymentsPerMonth: 100,
    },
  },
  PROFESSIONAL: {
    name: "Professional",
    price: 79,
    maxStudents: 100,
    maxTrainers: -1,
    features: {
      studentManagement: true,
      sessionScheduling: true,
      basicAttendance: true,
      paymentTracking: true,
      stripePayments: true,
      smsNotifications: true,
      emailNotifications: true,
      pushNotifications: true,
      advancedReports: true,
      multiLocation: false,
      customBranding: false,
      apiAccess: false,
      prioritySupport: false,
      studentProgress: false,
      eventManagement: false,
      marketingTools: false,
    },
    limitations: {
      maxStudents: 100,
      maxTrainers: -1,
      maxSessionsPerMonth: 500,
      maxPaymentsPerMonth: 200,
    },
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: 199,
    maxStudents: -1,
    maxTrainers: -1,
    features: {
      studentManagement: true,
      sessionScheduling: true,
      basicAttendance: true,
      paymentTracking: true,
      stripePayments: true,
      smsNotifications: true,
      emailNotifications: true,
      pushNotifications: true,
      advancedReports: true,
      multiLocation: true,
      customBranding: true,
      apiAccess: true,
      prioritySupport: true,
      studentProgress: true,
      eventManagement: true,
      marketingTools: true,
    },
    limitations: {
      maxStudents: -1,
      maxTrainers: -1,
      maxSessionsPerMonth: -1,
      maxPaymentsPerMonth: -1,
    },
  },
}

// Feature gating functions - client-side API calls
export async function checkFeatureAccess(feature: keyof TierFeatures): Promise<boolean> {
  try {
    const response = await fetch(`/api/license?action=checkFeature&feature=${feature}`)
    if (!response.ok) return false

    const data = await response.json()
    return data.hasAccess || false
  } catch (error) {
    console.error("Error checking feature access:", error)
    return false
  }
}

export async function checkLimit(limitType: keyof TierLimitations): Promise<LimitCheckResponse> {
  try {
    const response = await fetch(`/api/license?action=checkLimit&limitType=${limitType}`)
    if (!response.ok) return { allowed: false, current: 0, limit: 0 }

    const data: LimitCheckResponse = await response.json()
    return data
  } catch (error) {
    console.error("Error checking limit:", error)
    return { allowed: false, current: 0, limit: 0 }
  }
}

export async function getCurrentTier(): Promise<CurrentTierResponse> {
  const defaultResponse: CurrentTierResponse = {
    tier: null,
    status: "INACTIVE",
    features: {} as TierFeatures,
    limitations: {} as TierLimitations
  }

  try {
    const response = await fetch('/api/license?action=currentTier')
    if (!response.ok) return defaultResponse

    const data: CurrentTierResponse = await response.json()
    return data
  } catch (error) {
    console.error("Error getting current tier:", error)
    return defaultResponse
  }
}

export async function canUpgradeTier(targetTier: LicenseTier): Promise<boolean> {
  try {
    const currentTierData = await getCurrentTier()
    if (!currentTierData.tier) return false

    const tierHierarchy: LicenseTier[] = ["STARTER", "PRO", "PROFESSIONAL", "ENTERPRISE"]
    const currentIndex = tierHierarchy.indexOf(currentTierData.tier)
    const targetIndex = tierHierarchy.indexOf(targetTier)

    return targetIndex > currentIndex
  } catch (error) {
    console.error("Error checking upgrade eligibility:", error)
    return false
  }
}

export function getUpgradeBenefits(currentTier: LicenseTier, targetTier: LicenseTier) {
  const currentFeatures = TIER_FEATURES[currentTier].features
  const targetFeatures = TIER_FEATURES[targetTier].features

  const newFeatures = Object.keys(targetFeatures).filter(
    key => !currentFeatures[key as keyof typeof currentFeatures] && targetFeatures[key as keyof typeof targetFeatures]
  )

  return {
    newFeatures,
    priceDifference: TIER_FEATURES[targetTier].price - TIER_FEATURES[currentTier].price,
    additionalStudents: targetTier === "PROFESSIONAL" ? 75 : -1,
    additionalTrainers: targetTier === "ENTERPRISE" ? -1 : (targetTier === "PROFESSIONAL" ? -1 : 0),
  }
}
