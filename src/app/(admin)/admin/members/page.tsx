"use client"

import { useState, useEffect } from "react"
import { Users, Search, Loader2, AlertCircle, Trash2, Edit, Eye, X, Save, Building2, Mail, Phone, CheckCircle, XCircle, Clock, Ban } from "lucide-react"
import { cn } from "@/lib/utils"

interface Member {
  id: string
  name: string
  email: string | null
  phone: string | null
  status: string
  createdAt: string
  organization: { id: string; name: string } | null
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [viewMember, setViewMember] = useState<Member | null>(null)
  const [editMember, setEditMember] = useState<Member | null>(null)
  const [deleteMember, setDeleteMember] = useState<Member | null>(null)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", status: "" })

  useEffect(() => { fetchMembers() }, [])

  const fetchMembers = async () => {
    try {
      const response = await fetch("/api/admin/members")
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setMembers(data.members || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (member: Member) => {
    setEditForm({ name: member.name, email: member.email || "", phone: member.phone || "", status: member.status })
    setEditMember(member)
  }

  const handleSaveEdit = async () => {
    if (!editMember) return
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/members/${editMember.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (!response.ok) throw new Error("Failed to save")
      await fetchMembers()
      setEditMember(null)
    } catch { alert("Failed to save changes") }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteMember) return
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/members/${deleteMember.id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete")
      await fetchMembers()
      setDeleteMember(null)
    } catch { alert("Failed to delete member") }
    finally { setSaving(false) }
  }

  const filteredMembers = members.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.organization?.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || m.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: "bg-green-500/20 text-green-400 border-green-500/40",
      INACTIVE: "bg-gray-500/20 text-gray-400 border-gray-500/40",
      SUSPENDED: "bg-red-500/20 text-red-400 border-red-500/40",
      GRADUATED: "bg-blue-500/20 text-blue-400 border-blue-500/40",
    }
    const icons: Record<string, typeof CheckCircle> = { ACTIVE: CheckCircle, INACTIVE: Clock, SUSPENDED: Ban, GRADUATED: CheckCircle }
    const Icon = icons[status] || Clock
    return <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs", styles[status])}><Icon className="w-3 h-3" />{status}</span>
  }

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-[#D2F159] animate-spin" /></div>
  if (error) return <div className="flex flex-col items-center justify-center min-h-[400px]"><AlertCircle className="w-12 h-12 text-red-400 mb-4" /><p className="text-white/60">{error}</p></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Members</h1>
          <p className="text-white/60 mt-1">{members.length} total members</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input type="text" placeholder="Search members..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#171725] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-[#D2F159]" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-[#171725] border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#D2F159]">
          <option value="all">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="GRADUATED">Graduated</option>
        </select>
      </div>

      <div className="bg-[#171725] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Member</th>
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Organization</th>
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Status</th>
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Joined</th>
                <th className="text-right px-6 py-4 text-white/60 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length > 0 ? filteredMembers.map((member) => (
                <tr key={member.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <span className="text-green-400 font-medium">{member.name[0].toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{member.name}</p>
                        <p className="text-white/40 text-sm">{member.email || member.phone || "N/A"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="text-white/60">{member.organization?.name || "N/A"}</span></td>
                  <td className="px-6 py-4">{getStatusBadge(member.status)}</td>
                  <td className="px-6 py-4"><span className="text-white/60 text-sm">{new Date(member.createdAt).toLocaleDateString("hu-HU")}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setViewMember(member)} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => handleEdit(member)} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteMember(member)} className="p-2 rounded-lg hover:bg-red-500/10 text-white/60 hover:text-red-400 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-white/40">No members found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewMember && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setViewMember(null)}>
          <div className="bg-[#171725] rounded-2xl p-6 max-w-lg w-full border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Member Details</h2>
              <button onClick={() => setViewMember(null)} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5 text-white/60" /></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-green-400 text-2xl font-medium">{viewMember.name[0].toUpperCase()}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{viewMember.name}</h3>
                  {getStatusBadge(viewMember.status)}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-white/40" /><span className="text-white">{viewMember.email || "N/A"}</span></div>
                <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-white/40" /><span className="text-white">{viewMember.phone || "N/A"}</span></div>
                <div className="flex items-center gap-3"><Building2 className="w-4 h-4 text-white/40" /><span className="text-white">{viewMember.organization?.name || "N/A"}</span></div>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-white/60 text-sm">Member ID</p>
                <p className="text-white/40 text-xs font-mono">{viewMember.id}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editMember && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setEditMember(null)}>
          <div className="bg-[#171725] rounded-2xl p-6 max-w-lg w-full border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit Member</h2>
              <button onClick={() => setEditMember(null)} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5 text-white/60" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm text-white/60 mb-2">Name</label><input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-[#0f0f14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#D2F159]" /></div>
              <div><label className="block text-sm text-white/60 mb-2">Email</label><input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full bg-[#0f0f14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#D2F159]" /></div>
              <div><label className="block text-sm text-white/60 mb-2">Phone</label><input type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="w-full bg-[#0f0f14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#D2F159]" /></div>
              <div><label className="block text-sm text-white/60 mb-2">Status</label>
                <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="w-full bg-[#0f0f14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#D2F159]">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="GRADUATED">Graduated</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setEditMember(null)} className="flex-1 py-2.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">Cancel</button>
                <button onClick={handleSaveEdit} disabled={saving} className="flex-1 py-2.5 rounded-lg bg-[#D2F159] text-[#171725] font-semibold hover:bg-[#D2F159]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteMember && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setDeleteMember(null)}>
          <div className="bg-[#171725] rounded-2xl p-6 max-w-md w-full border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-8 h-8 text-red-400" /></div>
              <h2 className="text-xl font-bold text-white mb-2">Delete Member?</h2>
              <p className="text-white/60 mb-6">Are you sure you want to delete <strong className="text-white">{deleteMember.name}</strong>?</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteMember(null)} className="flex-1 py-2.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">Cancel</button>
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
