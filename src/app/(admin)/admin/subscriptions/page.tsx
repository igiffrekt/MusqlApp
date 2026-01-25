"use client"

import { useState, useEffect } from "react"
import {
  Crown,
  Search,
  Building2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Subscription {
  id: string
  name: string
  slug: string
  licenseTier: "STARTER" | "PRO" | "ENTERPRISE"
  subscriptionStatus: "TRIAL" | "ACTIVE" | "CANCELLED" | "PAST_DUE"
  stripeCustomerId: string | null
  createdAt: string
  updatedAt: string
  _count: {
    users: number
    students: number
  }
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch("/api/admin/subscriptions")
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setSubscriptions(data.subscriptions)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }

  const updateSubscription = async (orgId: string, updates: { subscriptionStatus?: string; licenseTier?: string }) => {
    setUpdating(orgId)
    try {
      const response = await fetch("/api/admin/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orgId, ...updates }),
      })
      if (!response.ok) throw new Error("Failed to update")
      await fetchSubscriptions()
    } catch (err) {
      alert("Failed to update subscription")
    } finally {
      setUpdating(null)
    }
  }

  const filteredSubs = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.name.toLowerCase().includes(search.toLowerCase()) ||
      sub.slug.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || sub.subscriptionStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const config = {
      ACTIVE: { color: "bg-green-500/20 text-green-400 border-green-500/40", icon: CheckCircle },
      TRIAL: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40", icon: Clock },
      CANCELLED: { color: "bg-red-500/20 text-red-400 border-red-500/40", icon: XCircle },
      PAST_DUE: { color: "bg-orange-500/20 text-orange-400 border-orange-500/40", icon: AlertCircle },
    }
    const { color, icon: Icon } = config[status as keyof typeof config] || config.TRIAL
    return (
      <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs", color)}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    )
  }

  const getTierBadge = (tier: string) => {
    const styles = {
      STARTER: "bg-gray-500/20 text-gray-400",
      PRO: "bg-blue-500/20 text-blue-400",
      ENTERPRISE: "bg-purple-500/20 text-purple-400",
    }
    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", styles[tier as keyof typeof styles])}>
        {tier}
      </span>
    )
  }

  // Stats
  const stats = {
    active: subscriptions.filter(s => s.subscriptionStatus === "ACTIVE").length,
    trial: subscriptions.filter(s => s.subscriptionStatus === "TRIAL").length,
    cancelled: subscriptions.filter(s => s.subscriptionStatus === "CANCELLED").length,
    pastDue: subscriptions.filter(s => s.subscriptionStatus === "PAST_DUE").length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#D2F159] animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-white/60">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
        <p className="text-white/60 mt-1">Manage organization subscriptions and tiers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#171725] rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-white/60 text-sm">Active</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{stats.active}</p>
        </div>
        <div className="bg-[#171725] rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-white/60 text-sm">Trial</span>
          </div>
          <p className="text-2xl font-bold text-yellow-400">{stats.trial}</p>
        </div>
        <div className="bg-[#171725] rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-orange-400" />
            <span className="text-white/60 text-sm">Past Due</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">{stats.pastDue}</p>
        </div>
        <div className="bg-[#171725] rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-400" />
            <span className="text-white/60 text-sm">Cancelled</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{stats.cancelled}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search organizations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#171725] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-[#D2F159]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#171725] border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#D2F159]"
        >
          <option value="all">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="TRIAL">Trial</option>
          <option value="PAST_DUE">Past Due</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#171725] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Organization</th>
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Status</th>
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Tier</th>
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Usage</th>
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Stripe</th>
                <th className="text-right px-6 py-4 text-white/60 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubs.length > 0 ? (
                filteredSubs.map((sub) => (
                  <tr key={sub.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#D2F159]/20 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-[#D2F159]" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{sub.name}</p>
                          <p className="text-white/40 text-sm">/{sub.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={sub.subscriptionStatus}
                        onChange={(e) => updateSubscription(sub.id, { subscriptionStatus: e.target.value })}
                        disabled={updating === sub.id}
                        className="bg-transparent border border-white/10 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-[#D2F159] disabled:opacity-50"
                      >
                        <option value="TRIAL">Trial</option>
                        <option value="ACTIVE">Active</option>
                        <option value="PAST_DUE">Past Due</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={sub.licenseTier}
                        onChange={(e) => updateSubscription(sub.id, { licenseTier: e.target.value })}
                        disabled={updating === sub.id}
                        className="bg-transparent border border-white/10 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-[#D2F159] disabled:opacity-50"
                      >
                        <option value="STARTER">Starter</option>
                        <option value="PRO">Pro</option>
                        <option value="ENTERPRISE">Enterprise</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white/60 text-sm">
                        <span className="text-white">{sub._count.users}</span> users,{" "}
                        <span className="text-white">{sub._count.students}</span> members
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {sub.stripeCustomerId ? (
                        <a
                          href={`https://dashboard.stripe.com/customers/${sub.stripeCustomerId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#D2F159] hover:underline text-sm flex items-center gap-1"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-white/40 text-sm">Not linked</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        {updating === sub.id && (
                          <RefreshCw className="w-4 h-4 text-[#D2F159] animate-spin" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                    No subscriptions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
