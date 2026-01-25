"use client"

import { useState, useEffect } from "react"
import {
  Building2,
  Search,
  Filter,
  MoreHorizontal,
  Users,
  Crown,
  Calendar,
  Loader2,
  AlertCircle,
  ExternalLink,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Organization {
  id: string
  name: string
  slug: string
  licenseTier: "STARTER" | "PRO" | "ENTERPRISE"
  subscriptionStatus: "TRIAL" | "ACTIVE" | "CANCELLED" | "PAST_DUE"
  stripeCustomerId: string | null
  createdAt: string
  _count: {
    users: number
    students: number
  }
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [tierFilter, setTierFilter] = useState<string>("all")

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    try {
      const response = await fetch("/api/admin/organizations")
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setOrganizations(data.organizations)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }

  const filteredOrgs = organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.slug.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || org.subscriptionStatus === statusFilter
    const matchesTier = tierFilter === "all" || org.licenseTier === tierFilter
    return matchesSearch && matchesStatus && matchesTier
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: "bg-green-500/20 text-green-400 border-green-500/40",
      TRIAL: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
      CANCELLED: "bg-red-500/20 text-red-400 border-red-500/40",
      PAST_DUE: "bg-orange-500/20 text-orange-400 border-orange-500/40",
    }
    const icons = {
      ACTIVE: CheckCircle,
      TRIAL: Clock,
      CANCELLED: XCircle,
      PAST_DUE: AlertCircle,
    }
    const Icon = icons[status as keyof typeof icons] || AlertCircle
    return (
      <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs", styles[status as keyof typeof styles])}>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Organizations</h1>
          <p className="text-white/60 mt-1">{organizations.length} total organizations</p>
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
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#171725] border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#D2F159]"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="TRIAL">Trial</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="PAST_DUE">Past Due</option>
          </select>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-[#171725] border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#D2F159]"
          >
            <option value="all">All Tiers</option>
            <option value="STARTER">Starter</option>
            <option value="PRO">Pro</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>
        </div>
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
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Users</th>
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Members</th>
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Created</th>
                <th className="text-right px-6 py-4 text-white/60 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrgs.length > 0 ? (
                filteredOrgs.map((org) => (
                  <tr key={org.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#D2F159]/20 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-[#D2F159]" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{org.name}</p>
                          <p className="text-white/40 text-sm">/{org.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(org.subscriptionStatus)}</td>
                    <td className="px-6 py-4">{getTierBadge(org.licenseTier)}</td>
                    <td className="px-6 py-4">
                      <span className="text-white">{org._count.users}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white">{org._count.students}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white/60 text-sm">
                        {new Date(org.createdAt).toLocaleDateString("hu-HU")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-red-500/10 text-white/60 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-white/40">
                    No organizations found
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
