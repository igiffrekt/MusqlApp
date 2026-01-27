"use client"

import { useState, useEffect } from "react"
import { Crown, Search, Loader2, AlertCircle, Eye, X, Building2, Calendar, CheckCircle, Clock, XCircle, Ban, Edit, Save } from "lucide-react"
import { cn } from "@/lib/utils"

interface Subscription {
  id: string
  status: string
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  stripeSubscriptionId: string | null
  organization: { id: string; name: string; licenseTier: string } | null
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [viewSub, setViewSub] = useState<Subscription | null>(null)
  const [editSub, setEditSub] = useState<Subscription | null>(null)
  const [editForm, setEditForm] = useState({ status: "", cancelAtPeriodEnd: false })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchSubscriptions() }, [])

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch("/api/admin/subscriptions")
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setSubscriptions(data.subscriptions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (sub: Subscription) => {
    setEditForm({ status: sub.status, cancelAtPeriodEnd: sub.cancelAtPeriodEnd })
    setEditSub(sub)
  }

  const handleSaveEdit = async () => {
    if (!editSub) return
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/subscriptions/${editSub.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (!response.ok) throw new Error("Failed to save")
      await fetchSubscriptions()
      setEditSub(null)
    } catch { alert("Failed to save changes") }
    finally { setSaving(false) }
  }

  const filteredSubs = subscriptions.filter((s) => {
    const matchesSearch = s.organization?.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || s.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-green-500/20 text-green-400 border-green-500/40",
      trialing: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
      canceled: "bg-red-500/20 text-red-400 border-red-500/40",
      past_due: "bg-orange-500/20 text-orange-400 border-orange-500/40",
      ACTIVE: "bg-green-500/20 text-green-400 border-green-500/40",
      TRIAL: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
      CANCELLED: "bg-red-500/20 text-red-400 border-red-500/40",
    }
    const icons: Record<string, typeof CheckCircle> = { active: CheckCircle, trialing: Clock, canceled: XCircle, past_due: AlertCircle, ACTIVE: CheckCircle, TRIAL: Clock, CANCELLED: XCircle }
    const Icon = icons[status] || Clock
    return <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs", styles[status])}><Icon className="w-3 h-3" />{status}</span>
  }

  const getTierBadge = (tier: string) => {
    const styles: Record<string, string> = { STARTER: "bg-gray-500/20 text-gray-400", PRO: "bg-blue-500/20 text-blue-400", ENTERPRISE: "bg-purple-500/20 text-purple-400" }
    return <span className={cn("px-2 py-1 rounded-full text-xs font-medium", styles[tier])}>{tier}</span>
  }

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-[#D2F159] animate-spin" /></div>
  if (error) return <div className="flex flex-col items-center justify-center min-h-[400px]"><AlertCircle className="w-12 h-12 text-red-400 mb-4" /><p className="text-white/60">{error}</p></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
          <p className="text-white/60 mt-1">{subscriptions.length} total subscriptions</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input type="text" placeholder="Search by organization..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#171725] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-[#D2F159]" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-[#171725] border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#D2F159]">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="trialing">Trialing</option>
          <option value="canceled">Canceled</option>
          <option value="past_due">Past Due</option>
        </select>
      </div>

      <div className="bg-[#171725] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Organization</th>
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Tier</th>
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Status</th>
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Period End</th>
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Canceling</th>
                <th className="text-right px-6 py-4 text-white/60 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubs.length > 0 ? filteredSubs.map((sub) => (
                <tr key={sub.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Crown className="w-5 h-5 text-purple-400" />
                      </div>
                      <span className="text-white font-medium">{sub.organization?.name || "N/A"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{sub.organization?.licenseTier && getTierBadge(sub.organization.licenseTier)}</td>
                  <td className="px-6 py-4">{getStatusBadge(sub.status)}</td>
                  <td className="px-6 py-4"><span className="text-white/60 text-sm">{sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString("hu-HU") : "N/A"}</span></td>
                  <td className="px-6 py-4">
                    {sub.cancelAtPeriodEnd ? <span className="text-red-400 text-sm flex items-center gap-1"><Ban className="w-3 h-3" />Yes</span> : <span className="text-white/40 text-sm">No</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setViewSub(sub)} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => handleEdit(sub)} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-white/40">No subscriptions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewSub && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setViewSub(null)}>
          <div className="bg-[#171725] rounded-2xl p-6 max-w-lg w-full border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Subscription Details</h2>
              <button onClick={() => setViewSub(null)} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5 text-white/60" /></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Crown className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{viewSub.organization?.name || "N/A"}</h3>
                  <div className="flex items-center gap-2 mt-1">{getStatusBadge(viewSub.status)}{viewSub.organization?.licenseTier && getTierBadge(viewSub.organization.licenseTier)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div><p className="text-white/60 text-sm">Period Start</p><p className="text-white">{viewSub.currentPeriodStart ? new Date(viewSub.currentPeriodStart).toLocaleDateString("hu-HU") : "N/A"}</p></div>
                <div><p className="text-white/60 text-sm">Period End</p><p className="text-white">{viewSub.currentPeriodEnd ? new Date(viewSub.currentPeriodEnd).toLocaleDateString("hu-HU") : "N/A"}</p></div>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-white/60 text-sm">Cancel at Period End</p>
                <p className="text-white">{viewSub.cancelAtPeriodEnd ? "Yes" : "No"}</p>
              </div>
              {viewSub.stripeSubscriptionId && (
                <div className="pt-4 border-t border-white/10">
                  <p className="text-white/60 text-sm">Stripe Subscription ID</p>
                  <p className="text-white/40 text-xs font-mono">{viewSub.stripeSubscriptionId}</p>
                </div>
              )}
              <div className="pt-4 border-t border-white/10">
                <p className="text-white/60 text-sm">Subscription ID</p>
                <p className="text-white/40 text-xs font-mono">{viewSub.id}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editSub && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setEditSub(null)}>
          <div className="bg-[#171725] rounded-2xl p-6 max-w-lg w-full border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit Subscription</h2>
              <button onClick={() => setEditSub(null)} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5 text-white/60" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm text-white/60 mb-2">Status</label>
                <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="w-full bg-[#0f0f14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#D2F159]">
                  <option value="active">Active</option>
                  <option value="trialing">Trialing</option>
                  <option value="canceled">Canceled</option>
                  <option value="past_due">Past Due</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="cancelAtPeriodEnd" checked={editForm.cancelAtPeriodEnd} onChange={(e) => setEditForm({ ...editForm, cancelAtPeriodEnd: e.target.checked })} className="w-5 h-5 rounded border-white/10 bg-[#0f0f14]" />
                <label htmlFor="cancelAtPeriodEnd" className="text-white">Cancel at period end</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setEditSub(null)} className="flex-1 py-2.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">Cancel</button>
                <button onClick={handleSaveEdit} disabled={saving} className="flex-1 py-2.5 rounded-lg bg-[#D2F159] text-[#171725] font-semibold hover:bg-[#D2F159]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
