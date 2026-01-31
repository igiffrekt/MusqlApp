"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Monitor,
  Plus,
  Settings,
  Trash2,
  MapPin,
  Clock,
  Activity,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Copy,
  Loader2,
  X,
} from "lucide-react"
import { toast } from "sonner"

interface Terminal {
  id: string
  name: string
  deviceId: string
  isActive: boolean
  lastSeen: string | null
  location: { id: string; name: string } | null
  totalCheckIns: number
  todayCheckIns: number
  settings: any
  createdAt: string
}

interface Location {
  id: string
  name: string
}

export default function TerminalsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [terminals, setTerminals] = useState<Terminal[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState<Terminal | null>(null)
  const [newTerminal, setNewTerminal] = useState({ name: "", locationId: "" })
  const [creating, setCreating] = useState(false)

  // Fetch terminals
  const fetchTerminals = async () => {
    try {
      const response = await fetch("/api/checkin/terminals")
      if (response.ok) {
        const data = await response.json()
        setTerminals(data.terminals)
      }
    } catch (error) {
      console.error("Failed to fetch terminals:", error)
      toast.error("Nem sikerült betölteni a terminálokat")
    } finally {
      setLoading(false)
    }
  }

  // Fetch locations
  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/locations")
      if (response.ok) {
        const data = await response.json()
        setLocations(data.locations || [])
      }
    } catch (error) {
      console.error("Failed to fetch locations:", error)
    }
  }

  useEffect(() => {
    fetchTerminals()
    fetchLocations()
  }, [])

  // Create terminal
  const handleCreateTerminal = async () => {
    if (!newTerminal.name.trim()) {
      toast.error("Add meg a terminál nevét")
      return
    }

    setCreating(true)
    try {
      const response = await fetch("/api/checkin/terminals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTerminal.name,
          locationId: newTerminal.locationId || null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setTerminals([data.terminal, ...terminals])
        setShowAddModal(false)
        setNewTerminal({ name: "", locationId: "" })
        toast.success("Terminál létrehozva!")
      } else {
        const error = await response.json()
        toast.error(error.error || "Hiba történt")
      }
    } catch (error) {
      toast.error("Nem sikerült létrehozni a terminált")
    } finally {
      setCreating(false)
    }
  }

  // Copy device ID
  const copyDeviceId = (deviceId: string) => {
    navigator.clipboard.writeText(deviceId)
    toast.success("Eszközazonosító másolva!")
  }

  // Format relative time
  const formatLastSeen = (dateStr: string | null) => {
    if (!dateStr) return "Soha"
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Most"
    if (diffMins < 60) return `${diffMins} perce`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} órája`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} napja`
  }

  // Check if online (seen in last 5 minutes)
  const isOnline = (lastSeen: string | null) => {
    if (!lastSeen) return false
    const date = new Date(lastSeen)
    const now = new Date()
    return now.getTime() - date.getTime() < 5 * 60 * 1000
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#252a32] border border-white/5"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-white text-xl font-semibold">Terminálok</h1>
              <p className="text-white/50 text-sm">{terminals.length} eszköz</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#D2F159]"
          >
            <Plus className="w-5 h-5 text-[#171725]" />
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="px-6 py-6 space-y-4">
        {terminals.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#252a32] flex items-center justify-center mx-auto mb-4">
              <Monitor className="w-8 h-8 text-white/40" />
            </div>
            <h3 className="text-white font-medium mb-2">Még nincs terminál</h3>
            <p className="text-white/50 text-sm mb-4">
              Hozz létre egy terminált a beléptetéshez
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-[#D2F159] text-[#171725] rounded-full font-medium"
            >
              Új terminál
            </button>
          </div>
        ) : (
          terminals.map((terminal) => (
            <motion.div
              key={terminal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#252a32] rounded-2xl border border-white/5 p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    terminal.isActive ? "bg-[#D2F159]/20" : "bg-white/5"
                  }`}>
                    <Monitor className={`w-6 h-6 ${
                      terminal.isActive ? "text-[#D2F159]" : "text-white/40"
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-medium">{terminal.name}</h3>
                      <span className={`w-2 h-2 rounded-full ${
                        isOnline(terminal.lastSeen) ? "bg-green-400" : "bg-white/20"
                      }`} />
                    </div>
                    {terminal.location && (
                      <p className="text-white/50 text-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {terminal.location.name}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowSettingsModal(terminal)}
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"
                >
                  <Settings className="w-4 h-4 text-white/60" />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-white font-semibold">{terminal.todayCheckIns}</p>
                  <p className="text-white/40 text-xs">Ma</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-white font-semibold">{terminal.totalCheckIns}</p>
                  <p className="text-white/40 text-xs">Összesen</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-white font-semibold text-sm">
                    {formatLastSeen(terminal.lastSeen)}
                  </p>
                  <p className="text-white/40 text-xs">Aktivitás</p>
                </div>
              </div>

              {/* Device ID */}
              <button
                onClick={() => copyDeviceId(terminal.deviceId)}
                className="w-full flex items-center justify-between px-3 py-2 bg-white/5 rounded-xl text-sm"
              >
                <span className="text-white/40 font-mono">{terminal.deviceId}</span>
                <Copy className="w-4 h-4 text-white/40" />
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Terminal Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-end"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full bg-[#1E1E2D] rounded-t-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-xl font-semibold">Új terminál</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Név</label>
                  <input
                    type="text"
                    value={newTerminal.name}
                    onChange={(e) => setNewTerminal({ ...newTerminal, name: e.target.value })}
                    placeholder="pl. Főbejárat"
                    className="w-full bg-[#252a32] rounded-xl border border-white/5 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#D2F159]"
                  />
                </div>

                <div>
                  <label className="text-white/60 text-sm mb-2 block">Helyszín (opcionális)</label>
                  <select
                    value={newTerminal.locationId}
                    onChange={(e) => setNewTerminal({ ...newTerminal, locationId: e.target.value })}
                    className="w-full bg-[#252a32] rounded-xl border border-white/5 px-4 py-3 text-white focus:outline-none focus:border-[#D2F159]"
                  >
                    <option value="">Nincs megadva</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleCreateTerminal}
                  disabled={creating}
                  className="w-full py-4 bg-[#D2F159] text-[#171725] rounded-full font-semibold disabled:opacity-50"
                >
                  {creating ? "Létrehozás..." : "Terminál létrehozása"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-end"
            onClick={() => setShowSettingsModal(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full bg-[#1E1E2D] rounded-t-3xl p-6 max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-xl font-semibold">{showSettingsModal.name}</h2>
                <button
                  onClick={() => setShowSettingsModal(null)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Device ID */}
                <div className="bg-[#252a32] rounded-xl p-4">
                  <p className="text-white/40 text-sm mb-1">Eszközazonosító</p>
                  <p className="text-white font-mono">{showSettingsModal.deviceId}</p>
                </div>

                {/* Kiosk URL */}
                <div className="bg-[#252a32] rounded-xl p-4">
                  <p className="text-white/40 text-sm mb-1">Kiosk URL</p>
                  <p className="text-white font-mono text-sm break-all">
                    {typeof window !== "undefined" 
                      ? `${window.location.origin}/kiosk/${showSettingsModal.deviceId}`
                      : `/kiosk/${showSettingsModal.deviceId}`
                    }
                  </p>
                </div>

                {/* Status toggle */}
                <div className="flex items-center justify-between bg-[#252a32] rounded-xl p-4">
                  <span className="text-white">Aktív</span>
                  <div className={`w-12 h-7 rounded-full p-1 transition-colors ${
                    showSettingsModal.isActive ? "bg-[#D2F159]" : "bg-white/20"
                  }`}>
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      showSettingsModal.isActive ? "translate-x-5" : ""
                    }`} />
                  </div>
                </div>

                {/* Delete button */}
                <button className="w-full py-4 bg-red-500/20 text-red-400 rounded-xl font-medium flex items-center justify-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Terminál törlése
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
