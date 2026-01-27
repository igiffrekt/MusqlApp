"use client"

import { useState, useEffect } from "react"
import { UserCog, Search, Loader2, AlertCircle, Trash2, Edit, Eye, X, Save, Building2, Mail, Phone } from "lucide-react"
import { cn } from "@/lib/utils"

interface Coach {
  id: string
  name: string | null
  email: string
  phone: string | null
  role: string
  createdAt: string
  organization: { id: string; name: string } | null
}

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [viewCoach, setViewCoach] = useState<Coach | null>(null)
  const [editCoach, setEditCoach] = useState<Coach | null>(null)
  const [deleteCoach, setDeleteCoach] = useState<Coach | null>(null)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", role: "" })

  useEffect(() => { fetchCoaches() }, [])

  const fetchCoaches = async () => {
    try {
      const response = await fetch("/api/admin/coaches")
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setCoaches(data.coaches || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (coach: Coach) => {
    setEditForm({ name: coach.name || "", email: coach.email, phone: coach.phone || "", role: coach.role })
    setEditCoach(coach)
  }

  const handleSaveEdit = async () => {
    if (!editCoach) return
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/coaches/${editCoach.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (!response.ok) throw new Error("Failed to save")
      await fetchCoaches()
      setEditCoach(null)
    } catch { alert("Failed to save changes") }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteCoach) return
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/coaches/${deleteCoach.id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete")
      await fetchCoaches()
      setDeleteCoach(null)
    } catch { alert("Failed to delete coach") }
    finally { setSaving(false) }
  }

  const filteredCoaches = coaches.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.organization?.name.toLowerCase().includes(search.toLowerCase())
  )

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      ADMIN: "bg-purple-500/20 text-purple-400",
      TRAINER: "bg-blue-500/20 text-blue-400",
    }
    return <span className={cn("px-2 py-1 rounded-full text-xs font-medium", styles[role] || "bg-gray-500/20 text-gray-400")}>{role}</span>
  }

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-[#D2F159] animate-spin" /></div>
  if (error) return <div className="flex flex-col items-center justify-center min-h-[400px]"><AlertCircle className="w-12 h-12 text-red-400 mb-4" /><p className="text-white/60">{error}</p></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Coaches</h1>
          <p className="text-white/60 mt-1">{coaches.length} total coaches</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input type="text" placeholder="Search coaches..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#171725] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-[#D2F159]" />
      </div>

      <div className="bg-[#171725] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Coach</th>
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Organization</th>
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Role</th>
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Joined</th>
                <th className="text-right px-6 py-4 text-white/60 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoaches.length > 0 ? filteredCoaches.map((coach) => (
                <tr key={coach.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <span className="text-blue-400 font-medium">{coach.name?.[0]?.toUpperCase() || coach.email[0].toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{coach.name || "No name"}</p>
                        <p className="text-white/40 text-sm">{coach.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="text-white/60">{coach.organization?.name || "N/A"}</span></td>
                  <td className="px-6 py-4">{getRoleBadge(coach.role)}</td>
                  <td className="px-6 py-4"><span className="text-white/60 text-sm">{new Date(coach.createdAt).toLocaleDateString("hu-HU")}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setViewCoach(coach)} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => handleEdit(coach)} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteCoach(coach)} className="p-2 rounded-lg hover:bg-red-500/10 text-white/60 hover:text-red-400 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-white/40">No coaches found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewCoach && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setViewCoach(null)}>
          <div className="bg-[#171725] rounded-2xl p-6 max-w-lg w-full border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Coach Details</h2>
              <button onClick={() => setViewCoach(null)} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5 text-white/60" /></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-400 text-2xl font-medium">{viewCoach.name?.[0]?.toUpperCase() || viewCoach.email[0].toUpperCase()}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{viewCoach.name || "No name"}</h3>
                  {getRoleBadge(viewCoach.role)}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-white/40" /><span className="text-white">{viewCoach.email}</span></div>
                <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-white/40" /><span className="text-white">{viewCoach.phone || "N/A"}</span></div>
                <div className="flex items-center gap-3"><Building2 className="w-4 h-4 text-white/40" /><span className="text-white">{viewCoach.organization?.name || "N/A"}</span></div>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-white/60 text-sm">User ID</p>
                <p className="text-white/40 text-xs font-mono">{viewCoach.id}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editCoach && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setEditCoach(null)}>
          <div className="bg-[#171725] rounded-2xl p-6 max-w-lg w-full border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit Coach</h2>
              <button onClick={() => setEditCoach(null)} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5 text-white/60" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm text-white/60 mb-2">Name</label><input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-[#0f0f14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#D2F159]" /></div>
              <div><label className="block text-sm text-white/60 mb-2">Email</label><input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full bg-[#0f0f14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#D2F159]" /></div>
              <div><label className="block text-sm text-white/60 mb-2">Phone</label><input type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="w-full bg-[#0f0f14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#D2F159]" /></div>
              <div><label className="block text-sm text-white/60 mb-2">Role</label>
                <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="w-full bg-[#0f0f14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#D2F159]">
                  <option value="ADMIN">Admin</option>
                  <option value="TRAINER">Trainer</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setEditCoach(null)} className="flex-1 py-2.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">Cancel</button>
                <button onClick={handleSaveEdit} disabled={saving} className="flex-1 py-2.5 rounded-lg bg-[#D2F159] text-[#171725] font-semibold hover:bg-[#D2F159]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteCoach && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setDeleteCoach(null)}>
          <div className="bg-[#171725] rounded-2xl p-6 max-w-md w-full border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-8 h-8 text-red-400" /></div>
              <h2 className="text-xl font-bold text-white mb-2">Delete Coach?</h2>
              <p className="text-white/60 mb-6">Are you sure you want to delete <strong className="text-white">{deleteCoach.name || deleteCoach.email}</strong>?</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteCoach(null)} className="flex-1 py-2.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">Cancel</button>
                <button onClick={handleDelete} disabled={saving} className="flex-1 py-2.5 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
