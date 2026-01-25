"use client"

import { useState, useEffect } from "react"
import {
  Users,
  Search,
  Building2,
  Mail,
  Phone,
  Loader2,
  AlertCircle,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Member {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "GRADUATED"
  beltLevel: string | null
  createdAt: string
  organization: {
    id: string
    name: string
  }
  _count: {
    attendances: number
    payments: number
  }
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const response = await fetch("/api/admin/members")
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setMembers(data.members)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }

  const filteredMembers = members.filter((member) => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase()
    const matchesSearch =
      fullName.includes(search.toLowerCase()) ||
      (member.email?.toLowerCase() || "").includes(search.toLowerCase()) ||
      member.organization.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || member.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const config = {
      ACTIVE: { color: "bg-green-500/20 text-green-400 border-green-500/40", icon: CheckCircle },
      INACTIVE: { color: "bg-gray-500/20 text-gray-400 border-gray-500/40", icon: XCircle },
      SUSPENDED: { color: "bg-red-500/20 text-red-400 border-red-500/40", icon: XCircle },
      GRADUATED: { color: "bg-blue-500/20 text-blue-400 border-blue-500/40", icon: CheckCircle },
    }
    const { color, icon: Icon } = config[status as keyof typeof config] || config.INACTIVE
    return (
      <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs", color)}>
        <Icon className="w-3 h-3" />
        {status}
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
        <h1 className="text-2xl font-bold text-white">Members</h1>
        <p className="text-white/60 mt-1">{members.length} total members across all organizations</p>
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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#171725] border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#D2F159]"
        >
          <option value="all">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="GRADUATED">Graduated</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#171725] rounded-xl p-4 border border-white/5">
          <p className="text-white/60 text-sm">Active</p>
          <p className="text-2xl font-bold text-green-400">
            {members.filter(m => m.status === "ACTIVE").length}
          </p>
        </div>
        <div className="bg-[#171725] rounded-xl p-4 border border-white/5">
          <p className="text-white/60 text-sm">Inactive</p>
          <p className="text-2xl font-bold text-gray-400">
            {members.filter(m => m.status === "INACTIVE").length}
          </p>
        </div>
        <div className="bg-[#171725] rounded-xl p-4 border border-white/5">
          <p className="text-white/60 text-sm">Suspended</p>
          <p className="text-2xl font-bold text-red-400">
            {members.filter(m => m.status === "SUSPENDED").length}
          </p>
        </div>
        <div className="bg-[#171725] rounded-xl p-4 border border-white/5">
          <p className="text-white/60 text-sm">Graduated</p>
          <p className="text-2xl font-bold text-blue-400">
            {members.filter(m => m.status === "GRADUATED").length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#171725] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Member</th>
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Organization</th>
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Status</th>
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Belt</th>
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Sessions</th>
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Payments</th>
                <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#D2F159]/20 flex items-center justify-center">
                          <span className="text-[#D2F159] font-semibold">
                            {member.firstName[0]}{member.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{member.firstName} {member.lastName}</p>
                          <div className="flex items-center gap-3 text-white/40 text-sm">
                            {member.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {member.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-white/60">
                        <Building2 className="w-4 h-4" />
                        {member.organization.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(member.status)}</td>
                    <td className="px-6 py-4">
                      <span className="text-white/60">{member.beltLevel || "-"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white">{member._count.attendances}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white">{member._count.payments}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white/60 text-sm">
                        {new Date(member.createdAt).toLocaleDateString("hu-HU")}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-white/40">
                    No members found
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
