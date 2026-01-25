"use client"

import { useState, useEffect } from "react"
import {
  UserCog,
  Search,
  Building2,
  Mail,
  Shield,
  Loader2,
  AlertCircle,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Coach {
  id: string
  name: string | null
  email: string
  role: "ADMIN" | "TRAINER"
  createdAt: string
  organization: {
    id: string
    name: string
  }
}

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")

  useEffect(() => {
    fetchCoaches()
  }, [])

  const fetchCoaches = async () => {
    try {
      const response = await fetch("/api/admin/coaches")
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setCoaches(data.coaches)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }

  const filteredCoaches = coaches.filter((coach) => {
    const matchesSearch =
      (coach.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      coach.email.toLowerCase().includes(search.toLowerCase()) ||
      coach.organization.name.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === "all" || coach.role === roleFilter
    return matchesSearch && matchesRole
  })

  const getRoleBadge = (role: string) => {
    const styles = {
      ADMIN: "bg-purple-500/20 text-purple-400 border-purple-500/40",
      TRAINER: "bg-blue-500/20 text-blue-400 border-blue-500/40",
    }
    return (
      <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs", styles[role as keyof typeof styles])}>
        <Shield className="w-3 h-3" />
        {role}
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
      <div>
        <h1 className="text-2xl font-bold text-white">Coaches</h1>
        <p className="text-white/60 mt-1">{coaches.length} total coaches & trainers</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search by name, email, or organization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#171725] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-[#D2F159]"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-[#171725] border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#D2F159]"
        >
          <option value="all">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="TRAINER">Trainer</option>
        </select>
      </div>

      {/* Table */}
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
              {filteredCoaches.length > 0 ? (
                filteredCoaches.map((coach) => (
                  <tr key={coach.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <span className="text-purple-400 font-semibold">
                            {coach.name?.[0]?.toUpperCase() || coach.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{coach.name || "No name"}</p>
                          <p className="text-white/40 text-sm flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {coach.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-white/60">
                        <Building2 className="w-4 h-4" />
                        {coach.organization.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getRoleBadge(coach.role)}</td>
                    <td className="px-6 py-4">
                      <span className="text-white/60 text-sm">
                        {new Date(coach.createdAt).toLocaleDateString("hu-HU")}
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
                  <td colSpan={5} className="px-6 py-12 text-center text-white/40">
                    No coaches found
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
