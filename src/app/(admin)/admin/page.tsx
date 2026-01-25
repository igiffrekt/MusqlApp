"use client"

import { useState, useEffect } from "react"
import {
  Building2,
  Users,
  UserCog,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Loader2,
  AlertCircle,
  Crown,
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface DashboardStats {
  organizations: {
    total: number
    active: number
    trial: number
    thisMonth: number
  }
  coaches: {
    total: number
    thisMonth: number
  }
  members: {
    total: number
    thisMonth: number
  }
  payments: {
    totalRevenue: number
    thisMonth: number
    pendingCount: number
    currency: string
  }
  subscriptions: {
    active: number
    trialing: number
    cancelled: number
  }
  recentActivity: Array<{
    id: string
    type: "org_created" | "payment" | "subscription" | "member_added"
    description: string
    timestamp: string
    amount?: number
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats")
        if (!response.ok) {
          throw new Error("Failed to fetch stats")
        }
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#D2F159] animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Failed to load dashboard</h2>
        <p className="text-white/60">{error}</p>
      </div>
    )
  }

  const statCards = [
    {
      title: "Organizations",
      value: stats?.organizations.total || 0,
      change: stats?.organizations.thisMonth || 0,
      changeLabel: "this month",
      icon: Building2,
      href: "/admin/organizations",
      color: "bg-blue-500/20 text-blue-400",
    },
    {
      title: "Coaches",
      value: stats?.coaches.total || 0,
      change: stats?.coaches.thisMonth || 0,
      changeLabel: "this month",
      icon: UserCog,
      href: "/admin/coaches",
      color: "bg-purple-500/20 text-purple-400",
    },
    {
      title: "Members",
      value: stats?.members.total || 0,
      change: stats?.members.thisMonth || 0,
      changeLabel: "this month",
      icon: Users,
      href: "/admin/members",
      color: "bg-green-500/20 text-green-400",
    },
    {
      title: "Revenue",
      value: `${((stats?.payments.totalRevenue || 0) / 1000).toFixed(0)}K`,
      change: stats?.payments.thisMonth || 0,
      changeLabel: "this month",
      icon: DollarSign,
      href: "/admin/payments",
      color: "bg-[#D2F159]/20 text-[#D2F159]",
      isCurrency: true,
    },
  ]

  const subscriptionStats = [
    {
      label: "Active",
      value: stats?.subscriptions.active || 0,
      color: "bg-green-500",
    },
    {
      label: "Trialing",
      value: stats?.subscriptions.trialing || 0,
      color: "bg-yellow-500",
    },
    {
      label: "Cancelled",
      value: stats?.subscriptions.cancelled || 0,
      color: "bg-red-500",
    },
  ]

  const totalSubs =
    (stats?.subscriptions.active || 0) +
    (stats?.subscriptions.trialing || 0) +
    (stats?.subscriptions.cancelled || 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-white/60 mt-1">Overview of your platform metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className="bg-[#171725] rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-colors group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-xs">
                {stat.change > 0 ? (
                  <>
                    <TrendingUp className="w-3 h-3 text-green-400" />
                    <span className="text-green-400">+{stat.change}</span>
                  </>
                ) : (
                  <span className="text-white/40">0</span>
                )}
                <span className="text-white/40">{stat.changeLabel}</span>
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">
                {stat.isCurrency && stats?.payments.currency === "HUF" ? "" : ""}
                {stat.value}
                {stat.isCurrency && <span className="text-lg ml-1 text-white/60">HUF</span>}
              </p>
              <p className="text-white/60 text-sm mt-1 group-hover:text-white/80 transition-colors">
                {stat.title} →
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Breakdown */}
        <div className="bg-[#171725] rounded-2xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Subscriptions</h2>
            <Link href="/admin/subscriptions" className="text-sm text-[#D2F159] hover:underline">
              View all →
            </Link>
          </div>

          <div className="space-y-4">
            {subscriptionStats.map((sub) => {
              const percentage = totalSubs > 0 ? (sub.value / totalSubs) * 100 : 0
              return (
                <div key={sub.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70 text-sm">{sub.label}</span>
                    <span className="text-white font-medium">{sub.value}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", sub.color)}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Total Subscriptions</span>
              <span className="text-2xl font-bold text-white">{totalSubs}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-[#171725] rounded-2xl p-6 border border-white/5">
          <h2 className="text-lg font-semibold text-white mb-6">Quick Stats</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0f0f14] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-white/60 text-sm">Active Orgs</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats?.organizations.active || 0}</p>
            </div>

            <div className="bg-[#0f0f14] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-white/60 text-sm">Trial Orgs</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats?.organizations.trial || 0}</p>
            </div>

            <div className="bg-[#0f0f14] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-green-400" />
                <span className="text-white/60 text-sm">Pending Payments</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats?.payments.pendingCount || 0}</p>
            </div>

            <div className="bg-[#0f0f14] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span className="text-white/60 text-sm">This Month</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {((stats?.payments.thisMonth || 0) / 1000).toFixed(0)}K
                <span className="text-sm ml-1 text-white/60">HUF</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[#171725] rounded-2xl p-6 border border-white/5">
        <h2 className="text-lg font-semibold text-white mb-6">Recent Activity</h2>

        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="space-y-4">
            {stats.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    activity.type === "org_created" && "bg-blue-500/20 text-blue-400",
                    activity.type === "payment" && "bg-green-500/20 text-green-400",
                    activity.type === "subscription" && "bg-purple-500/20 text-purple-400",
                    activity.type === "member_added" && "bg-yellow-500/20 text-yellow-400"
                  )}
                >
                  {activity.type === "org_created" && <Building2 className="w-5 h-5" />}
                  {activity.type === "payment" && <CreditCard className="w-5 h-5" />}
                  {activity.type === "subscription" && <Crown className="w-5 h-5" />}
                  {activity.type === "member_added" && <Users className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm">{activity.description}</p>
                  <p className="text-white/40 text-xs">
                    {new Date(activity.timestamp).toLocaleDateString("hu-HU", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {activity.amount && (
                  <span className="text-[#D2F159] font-medium">
                    +{activity.amount.toLocaleString()} HUF
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-white/40">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
          </div>
        )}
      </div>
    </div>
  )
}
