"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Check, X, Crown, Users, Calendar, CreditCard, Zap, Shield, Star, ArrowUp } from "lucide-react"
import { TIER_FEATURES, LicenseTier, checkLimit, getCurrentTier, canUpgradeTier, getUpgradeBenefits } from "@/lib/license"
import { format } from "date-fns"
import type { TierFeatures, TierLimitations } from "@/types"

interface TierInfo {
  tier: LicenseTier | null
  status: string
  features: TierFeatures
  limitations: TierLimitations
}

interface UsageStats {
  students: { current: number; limit: number; allowed: boolean }
  trainers: { current: number; limit: number; allowed: boolean }
  sessions: { current: number; limit: number; allowed: boolean }
  payments: { current: number; limit: number; allowed: boolean }
}

export default function SubscriptionPage() {
  const [tierInfo, setTierInfo] = useState<TierInfo | null>(null)
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
  const [selectedTier, setSelectedTier] = useState<LicenseTier | null>(null)
  const [upgrading, setUpgrading] = useState(false)

  useEffect(() => {
    loadSubscriptionData()
  }, [])

  const loadSubscriptionData = async () => {
    try {
      const [tierData, studentsLimit, trainersLimit, sessionsLimit, paymentsLimit] = await Promise.all([
        getCurrentTier(),
        checkLimit("maxStudents"),
        checkLimit("maxTrainers"),
        checkLimit("maxSessionsPerMonth"),
        checkLimit("maxPaymentsPerMonth"),
      ])

      setTierInfo(tierData)
      setUsageStats({
        students: studentsLimit,
        trainers: trainersLimit,
        sessions: sessionsLimit,
        payments: paymentsLimit,
      })
    } catch (error) {
      console.error("Failed to load subscription data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (targetTier: LicenseTier) => {
    if (!tierInfo?.tier) return

    setUpgrading(true)
    try {
      const response = await fetch("/api/subscriptions/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetTier,
          currentTier: tierInfo.tier,
        }),
      })

      if (response.ok) {
        alert("Upgrade initiated! You will be redirected to Stripe for payment.")
        // In a real app, redirect to Stripe checkout URL
        loadSubscriptionData()
        setUpgradeDialogOpen(false)
      } else {
        const error = await response.json()
        alert(error.message || "Failed to initiate upgrade")
      }
    } catch (error) {
      console.error("Failed to upgrade:", error)
      alert("Failed to initiate upgrade")
    } finally {
      setUpgrading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-800"
      case "TRIAL": return "bg-blue-100 text-blue-800"
      case "CANCELLED": return "bg-red-100 text-red-800"
      case "PAST_DUE": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTierIcon = (tier: LicenseTier) => {
    switch (tier) {
      case "STARTER": return <Star className="w-5 h-5 text-yellow-500" />
      case "PROFESSIONAL": return <Shield className="w-5 h-5 text-blue-500" />
      case "ENTERPRISE": return <Crown className="w-5 h-5 text-purple-500" />
      default: return <Star className="w-5 h-5 text-gray-500" />
    }
  }

  const renderUsageBar = (label: string, current: number, limit: number, icon: React.ReactNode) => {
    const percentage = limit === -1 ? 0 : Math.min((current / limit) * 100, 100)
    const isNearLimit = limit !== -1 && current / limit > 0.8

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            {icon}
            <span>{label}</span>
          </div>
          <span className={`font-medium ${isNearLimit ? "text-orange-600" : "text-gray-600"}`}>
            {limit === -1 ? `${current} (Unlimited)` : `${current}/${limit}`}
          </span>
        </div>
        {limit !== -1 && (
          <Progress
            value={percentage}
            className={`h-2 ${isNearLimit ? "[&>div]:bg-orange-500" : ""}`}
          />
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading subscription details...</p>
      </div>
    )
  }

  if (!tierInfo) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Unable to load subscription information</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600">Manage your license tier and billing</p>
        </div>
        {tierInfo.status === "TRIAL" && (
          <Badge className="bg-blue-100 text-blue-800">
            Trial Period
          </Badge>
        )}
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {tierInfo.tier && getTierIcon(tierInfo.tier)}
              <div>
                <CardTitle className="text-xl">
                  {tierInfo.tier ? TIER_FEATURES[tierInfo.tier].name : "No Plan"}
                </CardTitle>
                <CardDescription>
                  {tierInfo.tier ? `$${TIER_FEATURES[tierInfo.tier].price}/month` : "Contact support"}
                </CardDescription>
              </div>
            </div>
            <Badge className={getStatusColor(tierInfo.status)}>
              {tierInfo.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {usageStats && (
              <>
                {renderUsageBar("Students", usageStats.students.current, usageStats.students.limit, <Users className="w-4 h-4" />)}
                {renderUsageBar("Trainers", usageStats.trainers.current, usageStats.trainers.limit, <Shield className="w-4 h-4" />)}
                {renderUsageBar("Sessions/Month", usageStats.sessions.current, usageStats.sessions.limit, <Calendar className="w-4 h-4" />)}
                {renderUsageBar("Payments/Month", usageStats.payments.current, usageStats.payments.limit, <CreditCard className="w-4 h-4" />)}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(TIER_FEATURES).map(([tierKey, tierConfig]) => {
          const tier = tierKey as LicenseTier
          const isCurrentPlan = tierInfo.tier === tier
          const canUpgrade = tierInfo.tier && tierInfo.tier !== tier

          return (
            <Card key={tier} className={`relative ${isCurrentPlan ? "ring-2 ring-blue-500" : ""}`}>
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white">Current Plan</Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  {getTierIcon(tier)}
                </div>
                <CardTitle className="text-xl">{tierConfig.name}</CardTitle>
                <div className="text-3xl font-bold">
                  ${tierConfig.price}
                  <span className="text-sm font-normal text-gray-600">/month</span>
                </div>
                <p className="text-sm text-gray-600">
                  Up to {tierConfig.maxStudents === -1 ? "unlimited" : tierConfig.maxStudents} students
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Features:</h4>
                  <div className="space-y-1">
                    {Object.entries(tierConfig.features).map(([feature, enabled]) => (
                      <div key={feature} className="flex items-center text-sm">
                        {enabled ? (
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                        ) : (
                          <X className="w-4 h-4 text-gray-400 mr-2" />
                        )}
                        <span className={enabled ? "text-gray-900" : "text-gray-500"}>
                          {feature.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {!isCurrentPlan && canUpgrade && (
                  <Dialog open={upgradeDialogOpen && selectedTier === tier} onOpenChange={(open) => {
                    setUpgradeDialogOpen(open)
                    if (open) setSelectedTier(tier)
                  }}>
                    <DialogTrigger asChild>
                      <Button className="w-full" variant={tier === "ENTERPRISE" ? "default" : "outline"}>
                        <ArrowUp className="w-4 h-4 mr-2" />
                        Upgrade
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      style={{
                        background: 'rgba(255, 255, 255, 0.85)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <DialogHeader>
                        <DialogTitle>Upgrade to {tierConfig.name}</DialogTitle>
                        <DialogDescription>
                          Upgrade your subscription to unlock more features and higher limits.
                        </DialogDescription>
                      </DialogHeader>

                      {tierInfo.tier && (
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">What's included in {tierConfig.name}:</h4>
                            <ul className="space-y-1 text-sm">
                              {getUpgradeBenefits(tierInfo.tier, tier).newFeatures.map((feature: string) => (
                                <li key={feature} className="flex items-center">
                                  <Check className="w-3 h-3 text-green-500 mr-2" />
                                  {feature.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                            <span className="font-medium">Monthly price:</span>
                            <span className="text-xl font-bold">${tierConfig.price}</span>
                          </div>
                        </div>
                      )}

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => handleUpgrade(tier)} disabled={upgrading}>
                          {upgrading ? "Processing..." : `Upgrade to ${tierConfig.name}`}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View your past payments and invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-4" />
            <p>No billing history yet</p>
            <p className="text-sm">Billing history will appear here once you start your subscription</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}