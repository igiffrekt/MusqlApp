"use client"

import { ReactNode } from "react"
import { useFeatureAccess, useLimitCheck } from "@/hooks/useFeatureAccess"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, Crown } from "lucide-react"
import { TIER_FEATURES, LicenseTier } from "@/lib/license"

interface FeatureGateProps {
  feature: keyof typeof TIER_FEATURES.STARTER.features
  children: ReactNode
  fallback?: ReactNode
  showUpgrade?: boolean
  requiredTier?: LicenseTier
}

export function FeatureGate({
  feature,
  children,
  fallback,
  showUpgrade = true,
  requiredTier
}: FeatureGateProps) {
  const { hasAccess, loading } = useFeatureAccess(feature)

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    )
  }

  if (hasAccess) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (!showUpgrade) {
    return null
  }

  // Show upgrade prompt
  const tierName = requiredTier ? TIER_FEATURES[requiredTier].name :
                  feature === "stripePayments" ? "Professional" :
                  feature === "multiLocation" ? "Enterprise" :
                  "Professional"

  return (
    <Card className="border-2 border-dashed border-gray-300">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <Lock className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Feature Not Available
        </h3>
        <p className="text-gray-600 mb-6 max-w-md">
          This feature requires a {tierName} subscription.
          Upgrade your plan to unlock this functionality.
        </p>
        <Button asChild>
          <a href="/admin/subscription">
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Plan
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}

interface LimitGateProps {
  limit: keyof typeof TIER_FEATURES.STARTER.limitations
  current: number
  children: ReactNode
  fallback?: ReactNode
}

export function LimitGate({ limit, current, children, fallback }: LimitGateProps) {
  const { allowed, loading } = useLimitCheck(limit)

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    )
  }

  if (allowed) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <Card className="border-2 border-dashed border-orange-300">
      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Limit Reached
        </h3>
        <p className="text-gray-600 mb-4">
          You've reached your {limit.replace(/([A-Z])/g, " $1").toLowerCase()} limit.
        </p>
        <Button variant="outline" asChild>
          <a href="/admin/subscription">
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Plan
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
