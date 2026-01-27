"use client"

import { useState, useEffect } from "react"
import {
  Building2,
  Search,
  MoreHorizontal,
  Users,
  Crown,
  Loader2,
  AlertCircle,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  X,
  Save,
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
  
  // Modal states
  const [viewOrg, setViewOrg] = useState<Organization | null>(null)
  const [editOrg, setEditOrg] = useState<Organization | null>(null)
  const [deleteOrg, setDeleteOrg] = useState<Organization | null>(null)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({ name: "", slug: "", licenseTier: "", subscriptionStatus: "" })

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    try {
      const response = await fetch("/api/admin/organizations")
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setOrganizations(data.organizations || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (org: Organization) => {
    setEditForm({
      name: org.name,
      slug: org.slug,
      licenseTier: org.licenseTier,
      subscriptionStatus: org.subscriptionStatus,
    })
    setEditOrg(org)
  }

  const handleSaveEdit = async () => {
    if (!editOrg) return
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/organizations/${editOrg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (!response.ok) throw new Error("Failed to save")
      await fetchOrganizations()
      setEditOrg(null)
    } catch (err) {
      alert("Failed to save changes")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteOrg) return
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/organizations/${deleteOrg.id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete")
      await fetchOrganizations()
      setDeleteOrg(null)
    } catch (err) {
      alert("Failed to delete organization")
    } finally {
      setSaving(false)
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
    const styles: Record<string, string> = {
      ACTIVE: "bg-green-500/20 text-green-400 border-green-500/40",
      TRIAL: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
      CANCELLED: "bg-red-500/20 text-red-400 border-red-500/40",
      PAST_DUE: "bg-orange-500/20 text-orange-400 border-orange-500/40",
    }
    const icons: Record<string, typeof CheckCircle> = {
      ACTIVE: CheckCircle,
      TRIAL: Clock,
      CANCELLED: XCircle,
      PAST_DUE: AlertCircle,
    }
    const Icon = icons[status] || AlertCircle
    return (
      <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs", styles[status])}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    )
  }

  const getTierBadge = (tier: string) => {
    const styles: Record<string, string> = {
      STARTER: "bg-gray-500/20 text-gray-400",
      PRO: "bg-blue-500/20 text-blue-400",
      ENTERPRISE: "bg-purple-500/20 text-purple-400",
    }
    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", styles[tier])}>
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
                    <td className="px-6 py-4"><span className="text-white">{org._count.users}</span></td>
                    <td className="px-6 py-4"><span className="text-white">{org._count.students}</span></td>
                    <td className="px-6 py-4">
                      <span className="text-white/60 text-sm">{new Date(org.createdAt).toLocaleDateString("hu-HU")}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setViewOrg(org)} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors" title="View details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEdit(org)} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteOrg(org)} className="p-2 rounded-lg hover:bg-red-500/10 text-white/60 hover:text-red-400 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-white/40">No organizations found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewOrg && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setViewOrg(null)}>
          <div className="bg-[#171725] rounded-2xl p-6 max-w-lg w-full border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Organization Details</h2>
              <button onClick={() => setViewOrg(null)} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5 text-white/60" /></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-[#D2F159]/20 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-[#D2F159]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{viewOrg.name}</h3>
                  <p className="text-white/60">/{viewOrg.slug}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div><p className="text-white/60 text-sm">Status</p>{getStatusBadge(viewOrg.subscriptionStatus)}</div>
                <div><p className="text-white/60 text-sm">Tier</p>{getTierBadge(viewOrg.licenseTier)}</div>
                <div><p className="text-white/60 text-sm">Users</p><p className="text-white font-medium">{viewOrg._count.users}</p></div>
                <div><p className="text-white/60 text-sm">Members</p><p className="text-white font-medium">{viewOrg._count.students}</p></div>
                <div><p className="text-white/60 text-sm">Created</p><p className="text-white">{new Date(viewOrg.createdAt).toLocaleDateString("hu-HU")}</p></div>
                <div><p className="text-white/60 text-sm">Stripe ID</p><p className="text-white text-xs font-mono">{viewOrg.stripeCustomerId || "N/A"}</p></div>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-white/60 text-sm">Organization ID</p>
                <p className="text-white/40 text-xs font-mono">{viewOrg.id}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editOrg && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setEditOrg(null)}>
          <div className="bg-[#171725] rounded-2xl p-6 max-w-lg w-full border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit Organization</h2>
              <button onClick={() => setEditOrg(null)} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5 text-white/60" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Name</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-[#0f0f14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#D2F159]" />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Slug</label>
                <input type="text" value={editForm.slug} onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })} className="w-full bg-[#0f0f14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#D2F159]" />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Subscription Status</label>
                <select value={editForm.subscriptionStatus} onChange={(e) => setEditForm({ ...editForm, subscriptionStatus: e.target.value })} className="w-full bg-[#0f0f14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#D2F159]">
                  <option value="TRIAL">Trial</option>
                  <option value="ACTIVE">Active</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="PAST_DUE">Past Due</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">License Tier</label>
                <select value={editForm.licenseTier} onChange={(e) => setEditForm({ ...editForm, licenseTier: e.target.value })} className="w-full bg-[#0f0f14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#D2F159]">
                  <option value="STARTER">Starter</option>
                  <option value="PRO">Pro</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setEditOrg(null)} className="flex-1 py-2.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">Cancel</button>
                <button onClick={handleSaveEdit} disabled={saving} className="flex-1 py-2.5 rounded-lg bg-[#D2F159] text-[#171725] font-semibold hover:bg-[#D2F159]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteOrg && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setDeleteOrg(null)}>
          <div className="bg-[#171725] rounded-2xl p-6 max-w-md w-full border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Delete Organization?</h2>
              <p className="text-white/60 mb-6">Are you sure you want to delete <strong className="text-white">{deleteOrg.name}</strong>? This will also delete all associated users, members, and data. This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteOrg(null)} className="flex-1 py-2.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">Cancel</button>
                <button onClick={handleDelete} disabled={saving} className="flex-1 py-2.5 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
