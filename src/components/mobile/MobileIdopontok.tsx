"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock, MapPin, Users, ChevronRight, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { MobileNavbar } from "./MobileNavbar"

interface Session {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  location?: string
  capacity: number
  sessionType: string
  status: string
  trainer?: { name: string }
  _count?: { attendances: number }
}

interface DisplaySession {
  id: string
  title: string
  date: Date
  startTime: string
  endTime: string
  location: string
  group: string
  attendeeCount: number
  maxAttendees: number
  status: "scheduled" | "in-progress" | "completed" | "cancelled"
}

type FilterType = "upcoming" | "past"

// Helper to format date in Hungarian
const formatDate = (date: Date): string => {
  const days = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"]
  const months = ["jan.", "feb.", "márc.", "ápr.", "máj.", "jún.", "júl.", "aug.", "szept.", "okt.", "nov.", "dec."]

  const dayName = days[date.getDay()]
  const day = date.getDate()
  const month = months[date.getMonth()]

  return `${dayName}, ${month} ${day}.`
}

// Helper to check if date is today
const isToday = (date: Date): boolean => {
  const today = new Date()
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

// Helper to check if date is tomorrow
const isTomorrow = (date: Date): boolean => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
}

// Helper to format time from ISO string
const formatTime = (isoString: string): string => {
  const date = new Date(isoString)
  return date.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" })
}

export function MobileIdopontok() {
  const router = useRouter()
  const [filter, setFilter] = useState<FilterType>("upcoming")
  const [sessions, setSessions] = useState<DisplaySession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Add group modal state
  const [showAddGroup, setShowAddGroup] = useState(false)
  const [savingGroup, setSavingGroup] = useState(false)
  const [groupForm, setGroupForm] = useState({
    name: "",
    description: "",
    dailyFee: "",
    monthlyFee: "",
  })

  // Fetch sessions from API
  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true)
      setError(null)

      try {
        // Calculate date range
        const now = new Date()
        const startDate = new Date(now)
        startDate.setDate(startDate.getDate() - 30) // Past 30 days
        const endDate = new Date(now)
        endDate.setDate(endDate.getDate() + 30) // Next 30 days

        const response = await fetch(
          `/api/sessions?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        )

        if (!response.ok) {
          if (response.status === 401) {
            setSessions([])
            return
          }
          throw new Error("Failed to fetch sessions")
        }

        const data = await response.json()

        // Transform API response to display format
        const displaySessions: DisplaySession[] = (data.sessions || []).map((s: Session) => {
          const startDate = new Date(s.startTime)
          const now = new Date()
          let status: DisplaySession["status"] = "scheduled"
          if (s.status === "CANCELLED") {
            status = "cancelled"
          } else if (s.status === "COMPLETED" || startDate < now) {
            status = "completed"
          } else if (s.status === "IN_PROGRESS") {
            status = "in-progress"
          }

          // Map sessionType to Hungarian or use group name
          const getGroupLabel = (sessionType: string) => {
            const typeMap: Record<string, string> = {
              "REGULAR": "Rendszeres edzés",
              "PRIVATE": "Magánedzés",
              "GROUP": "Csoportos edzés",
              "WORKSHOP": "Workshop",
              "COMPETITION": "Verseny",
            }
            return typeMap[sessionType] || "Edzés"
          }

          return {
            id: s.id,
            title: s.title,
            date: startDate,
            startTime: formatTime(s.startTime),
            endTime: formatTime(s.endTime),
            location: s.location || "Nincs megadva",
            group: getGroupLabel(s.sessionType),
            attendeeCount: s._count?.attendances || 0,
            maxAttendees: s.capacity || 10,
            status,
          }
        })

        setSessions(displaySessions)
      } catch (err) {
        console.error("Error fetching sessions:", err)
        setError("Nem sikerült betölteni az edzéseket")
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [])

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    const filtered = sessions.filter(session => {
      const sessionDate = new Date(session.date)
      sessionDate.setHours(0, 0, 0, 0)

      if (filter === "upcoming") {
        return sessionDate >= now
      } else {
        // Past: last 30 days
        const monthAgo = new Date(now)
        monthAgo.setDate(monthAgo.getDate() - 30)
        return sessionDate < now && sessionDate >= monthAgo
      }
    })

    // Sort by date ascending for upcoming, descending for past
    return filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return filter === "upcoming" ? dateA - dateB : dateB - dateA
    })
  }, [sessions, filter, now])

  // Group sessions by date
  const groupedSessions = useMemo(() => {
    const groups: { date: Date; sessions: DisplaySession[] }[] = []

    filteredSessions.forEach(session => {
      const sessionDate = new Date(session.date)
      sessionDate.setHours(0, 0, 0, 0)

      const existingGroup = groups.find(g => {
        const groupDate = new Date(g.date)
        groupDate.setHours(0, 0, 0, 0)
        return groupDate.getTime() === sessionDate.getTime()
      })

      if (existingGroup) {
        existingGroup.sessions.push(session)
      } else {
        groups.push({ date: sessionDate, sessions: [session] })
      }
    })

    // Sort sessions within each group by time
    groups.forEach(group => {
      group.sessions.sort((a, b) => a.startTime.localeCompare(b.startTime))
    })

    return groups
  }, [filteredSessions])

  const getDateLabel = (date: Date): string => {
    if (isToday(date)) return "Ma"
    if (isTomorrow(date)) return "Holnap"
    return formatDate(date)
  }

  const getStatusColor = (status: DisplaySession["status"]) => {
    switch (status) {
      case "scheduled": return "bg-[#D2F159]"
      case "in-progress": return "bg-blue-500"
      case "completed": return "bg-[#1ad598]"
      case "cancelled": return "bg-[#ea3a3d]"
      default: return "bg-gray-500"
    }
  }

  const closeAddGroupModal = () => {
    setShowAddGroup(false)
    setGroupForm({ name: "", description: "", dailyFee: "", monthlyFee: "" })
  }

  const saveGroup = async () => {
    if (!groupForm.name.trim()) return

    setSavingGroup(true)
    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: groupForm.name.trim(),
          description: groupForm.description.trim() || undefined,
          dailyFee: groupForm.dailyFee ? parseFloat(groupForm.dailyFee) : undefined,
          monthlyFee: groupForm.monthlyFee ? parseFloat(groupForm.monthlyFee) : undefined,
        }),
      })

      if (response.ok) {
        closeAddGroupModal()
        // Optionally refresh the page or show success message
      } else {
        const error = await response.json()
        alert(`Hiba történt: ${error.message || "Ismeretlen hiba"}`)
      }
    } catch (error) {
      console.error("Failed to create group:", error)
      alert("Hiba történt a csoport létrehozása közben")
    } finally {
      setSavingGroup(false)
    }
  }

  return (
    <div className="min-h-screen bg-black font-lufga">
    <div className="min-h-screen bg-[#171725] mx-[5px] my-[5px] pb-24 rounded-2xl">
      {/* Header */}
      <div className="px-6 pt-6">
        <div className="flex flex-col gap-4">
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 flex items-center justify-center"
            >
              <Image src="/icons/arrow-back-icon.svg" alt="Vissza" width={32} height={32} />
            </button>
            <h1 className="text-white text-xl font-semibold">Időpontok</h1>
            <div className="w-8 h-8" />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("upcoming")}
              className={cn(
                "flex-1 py-3 rounded-full text-sm font-medium transition-all",
                filter === "upcoming"
                  ? "bg-[#D2F159] text-[#171725]"
                  : "bg-[#333842] text-white/60 hover:text-white"
              )}
            >
              Következő
            </button>
            <button
              onClick={() => setFilter("past")}
              className={cn(
                "flex-1 py-3 rounded-full text-sm font-medium transition-all",
                filter === "past"
                  ? "bg-[#D2F159] text-[#171725]"
                  : "bg-[#333842] text-white/60 hover:text-white"
              )}
            >
              Múltbéli
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 py-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#D2F159]" />
              <span className="text-white/60 text-sm">
                {filteredSessions.length} {filter === "upcoming" ? "közelgő" : "elmúlt"} edzés
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="px-6 mt-4 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-[#D2F159] animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-white/60">{error}</p>
          </div>
        ) : groupedSessions.length > 0 ? (
          groupedSessions.map((group, groupIndex) => (
            <div key={groupIndex}>
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium",
                  isToday(group.date)
                    ? "bg-[#D2F159] text-[#171725]"
                    : "bg-[#333842] text-white"
                )}>
                  {getDateLabel(group.date)}
                </div>
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-white/40 text-xs">
                  {group.sessions.length} edzés
                </span>
              </div>

              {/* Sessions for this date */}
              <div className="space-y-3">
                {group.sessions.map((session) => (
                  <Link
                    key={session.id}
                    href={`/idopontok/${session.id}`}
                    className="block bg-[#252a32] rounded-[20px] p-4 hover:bg-[#2a2f38] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{session.title}</h3>
                        <div className="flex items-center gap-1.5 text-white/40 text-sm">
                          <Users className="w-3.5 h-3.5" />
                          <span>{session.group}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", getStatusColor(session.status))} />
                        <ChevronRight className="w-5 h-5 text-white/40" />
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Time */}
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#D2F159]" />
                        <span className="text-[#D2F159] text-sm font-medium">
                          {session.startTime} - {session.endTime}
                        </span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <MapPin className="w-4 h-4 text-white/40 flex-shrink-0" />
                        <span className="text-white/60 text-sm truncate">{session.location}</span>
                      </div>
                    </div>

                    {/* Attendance */}
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-white/40 text-xs">Résztvevők</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-[#333842] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#D2F159] rounded-full"
                              style={{ width: `${(session.attendeeCount / session.maxAttendees) * 100}%` }}
                            />
                          </div>
                          <span className="text-white text-sm font-medium">
                            {session.attendeeCount}/{session.maxAttendees}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <Calendar className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">
              {filter === "upcoming" ? "Nincs közelgő edzés" : "Nincs elmúlt edzés"}
            </p>
          </div>
        )}
      </div>

      {/* Floating Add Group Button */}
      <button
        onClick={() => setShowAddGroup(true)}
        className="fixed bottom-24 right-6 bg-[#D2F159] rounded-full flex items-center justify-center shadow-lg z-30 active:scale-95 transition-transform"
        style={{ width: 'calc(var(--spacing) * 14)', height: 'calc(var(--spacing) * 14)' }}
      >
        <Image src="/icons/calendar-plus-icon.svg" alt="Új csoport" width={32} height={32} />
      </button>

      {/* Add Group Modal */}
      {showAddGroup && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
          <div className="bg-[#252a32] rounded-[24px] w-full max-w-md p-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-semibold">Új csoport</h2>
              <button
                onClick={closeAddGroupModal}
                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-white/60 text-xs mb-1 block">Csoport neve *</label>
                <input
                  type="text"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="pl. Kezdő Iskolás Csoport"
                  className="w-full bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159] placeholder:text-white/30"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-white/60 text-xs mb-1 block">Leírás</label>
                <textarea
                  value={groupForm.description}
                  onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Csoport leírása..."
                  rows={3}
                  className="w-full bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159] placeholder:text-white/30 resize-none"
                />
              </div>

              {/* Fees Row */}
              <div className="flex gap-4">
                {/* Daily Fee */}
                <div className="flex-1">
                  <label className="text-white/60 text-xs mb-1 block">Alkalmi díj (Ft)</label>
                  <input
                    type="number"
                    value={groupForm.dailyFee}
                    onChange={(e) => setGroupForm(prev => ({ ...prev, dailyFee: e.target.value }))}
                    placeholder="0"
                    className="w-full bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159] placeholder:text-white/30"
                  />
                </div>

                {/* Monthly Fee */}
                <div className="flex-1">
                  <label className="text-white/60 text-xs mb-1 block">Havi díj (Ft)</label>
                  <input
                    type="number"
                    value={groupForm.monthlyFee}
                    onChange={(e) => setGroupForm(prev => ({ ...prev, monthlyFee: e.target.value }))}
                    placeholder="0"
                    className="w-full bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159] placeholder:text-white/30"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeAddGroupModal}
                className="flex-1 py-3 rounded-full border border-white/20 text-white text-sm font-medium"
                disabled={savingGroup}
              >
                Mégse
              </button>
              <button
                onClick={saveGroup}
                disabled={savingGroup || !groupForm.name.trim()}
                className="flex-1 py-3 rounded-full bg-[#D2F159] text-[#171725] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingGroup ? "Mentés..." : "Létrehozás"}
              </button>
            </div>
          </div>
        </div>
      )}

      <MobileNavbar />
    </div>
    </div>
  )
}
