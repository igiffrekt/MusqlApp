"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  RefreshCw,
  Loader2,
  ChevronDown,
  Plus,
  X,
  UserPlus,
} from "lucide-react"
import { format } from "date-fns"
import { hu } from "date-fns/locale"

interface CheckIn {
  id: string
  createdAt: string
  method: string
  status: string
  note: string | null
  student: {
    id: string
    name: string
    photo: string | null
  } | null
  terminal: {
    id: string
    name: string
  } | null
}

interface Student {
  id: string
  firstName: string
  lastName: string
  status: string
  photo?: string | null
}

interface Stats {
  total: number
  successful: number
  denied: number
}

const STATUS_LABELS: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  SUCCESS: { label: "Sikeres", color: "text-green-400", icon: CheckCircle2 },
  DENIED_EXPIRED: { label: "Lejárt", color: "text-red-400", icon: XCircle },
  DENIED_INACTIVE: { label: "Inaktív", color: "text-orange-400", icon: XCircle },
  DENIED_NO_ACCESS: { label: "Nincs hozzáférés", color: "text-red-400", icon: XCircle },
  DENIED_OUTSIDE_HOURS: { label: "Nyitvatartáson kívül", color: "text-yellow-400", icon: Clock },
}

const METHOD_LABELS: Record<string, string> = {
  QR_CODE: "QR kód",
  MANUAL: "Manuális",
  PIN_CODE: "PIN kód",
  NFC: "NFC",
}

export default function BelepesekPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [showFilters, setShowFilters] = useState(false)
  const [dateFilter, setDateFilter] = useState("today")

  // Manual check-in state
  const [showManualModal, setShowManualModal] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [studentSearch, setStudentSearch] = useState("")
  const [checkingIn, setCheckingIn] = useState<string | null>(null)
  const [manualSuccess, setManualSuccess] = useState<Student | null>(null)

  // Get date range based on filter
  const getDateRange = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (dateFilter) {
      case "today":
        return { from: today.toISOString(), to: now.toISOString() }
      case "yesterday":
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        return { from: yesterday.toISOString(), to: today.toISOString() }
      case "week":
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)
        return { from: weekAgo.toISOString(), to: now.toISOString() }
      case "month":
        const monthAgo = new Date(today)
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        return { from: monthAgo.toISOString(), to: now.toISOString() }
      default:
        return { from: today.toISOString(), to: now.toISOString() }
    }
  }

  // Fetch check-ins
  const fetchCheckIns = async (append = false) => {
    try {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
        setOffset(0)
      }

      const { from, to } = getDateRange()
      const params = new URLSearchParams({
        from,
        to,
        limit: "50",
        offset: append ? String(offset) : "0",
      })

      if (statusFilter) {
        params.append("status", statusFilter)
      }

      const response = await fetch(`/api/checkin/history?${params}`)
      if (response.ok) {
        const data = await response.json()
        
        if (append) {
          setCheckIns([...checkIns, ...data.checkIns])
        } else {
          setCheckIns(data.checkIns)
          setStats(data.stats)
        }
        
        setHasMore(data.pagination.hasMore)
        setOffset(data.pagination.offset + data.pagination.limit)
      }
    } catch (error) {
      console.error("Failed to fetch check-ins:", error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Fetch students for manual check-in
  const fetchStudents = async () => {
    setLoadingStudents(true)
    try {
      const response = await fetch("/api/students?active=true")
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
      }
    } catch (error) {
      console.error("Failed to fetch students:", error)
    } finally {
      setLoadingStudents(false)
    }
  }

  // Manual check-in
  const handleManualCheckIn = async (student: Student) => {
    setCheckingIn(student.id)
    try {
      const response = await fetch("/api/checkin/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setManualSuccess(student)
        // Refresh check-ins after 2 seconds
        setTimeout(() => {
          setManualSuccess(null)
          setShowManualModal(false)
          fetchCheckIns()
        }, 2000)
      } else {
        alert(data.error || "Hiba történt a beléptetés során")
      }
    } catch (error) {
      console.error("Manual check-in error:", error)
      alert("Hiba történt a beléptetés során")
    } finally {
      setCheckingIn(null)
    }
  }

  // Open modal and fetch students
  const openManualModal = () => {
    setShowManualModal(true)
    setStudentSearch("")
    setManualSuccess(null)
    fetchStudents()
  }

  useEffect(() => {
    fetchCheckIns()
  }, [dateFilter, statusFilter])

  // Filter check-ins by search query
  const filteredCheckIns = checkIns.filter((ci) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      ci.student?.name.toLowerCase().includes(query) ||
      ci.terminal?.name.toLowerCase().includes(query)
    )
  })

  // Filter students by search
  const filteredStudents = students.filter((s) => {
    if (!studentSearch) return true
    const query = studentSearch.toLowerCase()
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase()
    return fullName.includes(query)
  })

  // Group by date
  const groupedCheckIns = filteredCheckIns.reduce((groups, checkIn) => {
    const date = format(new Date(checkIn.createdAt), "yyyy-MM-dd")
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(checkIn)
    return groups
  }, {} as Record<string, CheckIn[]>)

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Ma"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Tegnap"
    } else {
      return format(date, "MMMM d., EEEE", { locale: hu })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#171725] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#D2F159] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#171725] font-lufga pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#171725] px-6 pt-14 pb-4 border-b border-white/5">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#252a32] border border-white/5"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white text-xl font-semibold">Belépések</h1>
            <p className="text-white/50 text-sm">Belépési napló</p>
          </div>
          <button
            onClick={() => fetchCheckIns()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#252a32] border border-white/5"
          >
            <RefreshCw className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-[#252a32] rounded-xl p-3 text-center">
              <p className="text-white font-semibold">{stats.total}</p>
              <p className="text-white/40 text-xs">Összesen</p>
            </div>
            <div className="bg-[#252a32] rounded-xl p-3 text-center">
              <p className="text-green-400 font-semibold">{stats.successful}</p>
              <p className="text-white/40 text-xs">Sikeres</p>
            </div>
            <div className="bg-[#252a32] rounded-xl p-3 text-center">
              <p className="text-red-400 font-semibold">{stats.denied}</p>
              <p className="text-white/40 text-xs">Elutasított</p>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Keresés..."
              className="w-full bg-[#252a32] rounded-xl border border-white/5 pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#D2F159]"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 rounded-xl border flex items-center gap-2 ${
              showFilters || statusFilter || dateFilter !== "today"
                ? "bg-[#D2F159] border-[#D2F159] text-[#171725]"
                : "bg-[#252a32] border-white/5 text-white/60"
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Filter options */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 space-y-3"
          >
            {/* Date filter */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[
                { value: "today", label: "Ma" },
                { value: "yesterday", label: "Tegnap" },
                { value: "week", label: "Hét" },
                { value: "month", label: "Hónap" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDateFilter(option.value)}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                    dateFilter === option.value
                      ? "bg-[#D2F159] text-[#171725]"
                      : "bg-[#252a32] text-white/60"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Status filter */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setStatusFilter("")}
                className={`px-4 py-2 rounded-full text-sm ${
                  !statusFilter ? "bg-[#D2F159] text-[#171725]" : "bg-[#252a32] text-white/60"
                }`}
              >
                Mind
              </button>
              <button
                onClick={() => setStatusFilter("SUCCESS")}
                className={`px-4 py-2 rounded-full text-sm ${
                  statusFilter === "SUCCESS" ? "bg-green-500 text-white" : "bg-[#252a32] text-white/60"
                }`}
              >
                Sikeres
              </button>
              <button
                onClick={() => setStatusFilter("DENIED_EXPIRED")}
                className={`px-4 py-2 rounded-full text-sm ${
                  statusFilter === "DENIED_EXPIRED" ? "bg-red-500 text-white" : "bg-[#252a32] text-white/60"
                }`}
              >
                Elutasított
              </button>
            </div>
          </motion.div>
        )}
      </header>

      {/* Content */}
      <div className="px-6 py-4">
        {filteredCheckIns.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#252a32] flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-white/40" />
            </div>
            <h3 className="text-white font-medium mb-2">Nincs belépés</h3>
            <p className="text-white/50 text-sm">
              {searchQuery ? "Nincs találat a keresésre" : "Ebben az időszakban nem volt belépés"}
            </p>
          </div>
        ) : (
          Object.entries(groupedCheckIns).map(([date, dayCheckIns]) => (
            <div key={date} className="mb-6">
              <h3 className="text-white/50 text-sm font-medium mb-3">
                {formatDateHeader(date)}
              </h3>
              <div className="space-y-2">
                {dayCheckIns.map((checkIn) => {
                  const statusInfo = STATUS_LABELS[checkIn.status] || {
                    label: checkIn.status,
                    color: "text-white/60",
                    icon: Clock,
                  }
                  const StatusIcon = statusInfo.icon

                  return (
                    <motion.div
                      key={checkIn.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#252a32] rounded-xl p-4"
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar or icon */}
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                          {checkIn.student?.photo ? (
                            <img
                              src={checkIn.student.photo}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-white/40" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">
                            {checkIn.student?.name || "Ismeretlen"}
                          </p>
                          <div className="flex items-center gap-2 text-white/40 text-sm">
                            <span>{format(new Date(checkIn.createdAt), "HH:mm")}</span>
                            {checkIn.terminal && (
                              <>
                                <span>•</span>
                                <span className="truncate">{checkIn.terminal.name}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Status */}
                        <div className={`flex items-center gap-1 ${statusInfo.color}`}>
                          <StatusIcon className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Method badge */}
                      <div className="mt-2 flex items-center gap-2">
                        <span className="px-2 py-1 bg-white/5 rounded-md text-xs text-white/50">
                          {METHOD_LABELS[checkIn.method] || checkIn.method}
                        </span>
                        {checkIn.status !== "SUCCESS" && (
                          <span className="px-2 py-1 bg-red-500/10 rounded-md text-xs text-red-400">
                            {statusInfo.label}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))
        )}

        {/* Load more */}
        {hasMore && (
          <button
            onClick={() => fetchCheckIns(true)}
            disabled={loadingMore}
            className="w-full py-4 bg-[#252a32] rounded-xl text-white/60 flex items-center justify-center gap-2"
          >
            {loadingMore ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ChevronDown className="w-5 h-5" />
                Több betöltése
              </>
            )}
          </button>
        )}
      </div>

      {/* FAB - Manual Check-in */}
      <button
        onClick={openManualModal}
        className="fixed bottom-24 right-6 w-14 h-14 bg-[#D2F159] rounded-full flex items-center justify-center shadow-lg shadow-[#D2F159]/30 z-50"
      >
        <UserPlus className="w-6 h-6 text-[#171725]" />
      </button>

      {/* Manual Check-in Modal */}
      <AnimatePresence>
        {showManualModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center"
            onClick={() => setShowManualModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1e1e2e] w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[80vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-white text-xl font-semibold">Manuális beléptetés</h2>
                <button
                  onClick={() => setShowManualModal(false)}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              {/* Success State */}
              {manualSuccess ? (
                <div className="p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-white text-xl font-semibold mb-2">
                    {manualSuccess.firstName} belépett!
                  </h3>
                  <p className="text-white/50">Sikeres manuális beléptetés</p>
                </div>
              ) : (
                <>
                  {/* Search */}
                  <div className="p-4 border-b border-white/5">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="text"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder="Keresés név alapján..."
                        className="w-full bg-[#252a32] rounded-xl border border-white/5 pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#D2F159]"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Student List */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {loadingStudents ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 text-[#D2F159] animate-spin" />
                      </div>
                    ) : filteredStudents.length === 0 ? (
                      <div className="text-center py-8">
                        <User className="w-12 h-12 text-white/20 mx-auto mb-2" />
                        <p className="text-white/40">
                          {studentSearch ? "Nincs találat" : "Nincsenek aktív tagok"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredStudents.map((student) => (
                          <button
                            key={student.id}
                            onClick={() => handleManualCheckIn(student)}
                            disabled={checkingIn === student.id}
                            className="w-full bg-[#252a32] rounded-xl p-4 flex items-center gap-3 hover:bg-[#2a2f3a] transition-colors disabled:opacity-50"
                          >
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                              {student.photo ? (
                                <img
                                  src={student.photo}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-6 h-6 text-white/40" />
                              )}
                            </div>
                            <div className="flex-1 text-left">
                              <p className="text-white font-medium">
                                {student.firstName} {student.lastName}
                              </p>
                              <p className="text-white/40 text-sm">
                                {student.status === "ACTIVE" ? "Aktív tag" : student.status}
                              </p>
                            </div>
                            {checkingIn === student.id ? (
                              <Loader2 className="w-6 h-6 text-[#D2F159] animate-spin" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-[#D2F159]/20 flex items-center justify-center">
                                <Plus className="w-5 h-5 text-[#D2F159]" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
