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
  Copy,
  Loader2,
  X,
  Save,
  ExternalLink,
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
  settings: TerminalSettings | null
  createdAt: string
}

interface TerminalSettings {
  openingHours?: Record<string, { open: string; close: string; enabled: boolean }>
  soundEnabled?: boolean
}

interface Location {
  id: string
  name: string
}

const DAYS = [
  { key: "monday", label: "Hétfő" },
  { key: "tuesday", label: "Kedd" },
  { key: "wednesday", label: "Szerda" },
  { key: "thursday", label: "Csütörtök" },
  { key: "friday", label: "Péntek" },
  { key: "saturday", label: "Szombat" },
  { key: "sunday", label: "Vasárnap" },
]

const DEFAULT_HOURS = { open: "06:00", close: "22:00", enabled: true }

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
  
  // Settings state
  const [editingSettings, setEditingSettings] = useState<TerminalSettings | null>(null)
  const [editingName, setEditingName] = useState("")
  const [editingActive, setEditingActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

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

  // Open settings modal
  const openSettingsModal = (terminal: Terminal) => {
    setShowSettingsModal(terminal)
    setEditingName(terminal.name)
    setEditingActive(terminal.isActive)
    
    // Initialize opening hours
    const existingHours = terminal.settings?.openingHours || {}
    const hours: Record<string, { open: string; close: string; enabled: boolean }> = {}
    DAYS.forEach(day => {
      hours[day.key] = existingHours[day.key] || { ...DEFAULT_HOURS }
    })
    
    setEditingSettings({
      openingHours: hours,
      soundEnabled: terminal.settings?.soundEnabled !== false
    })
  }

  // Save settings
  const handleSaveSettings = async () => {
    if (!showSettingsModal) return
    
    setSaving(true)
    try {
      const response = await fetch(`/api/checkin/terminals/${showSettingsModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingName,
          isActive: editingActive,
          settings: editingSettings
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setTerminals(terminals.map(t => 
          t.id === showSettingsModal.id 
            ? { ...t, ...data.terminal, totalCheckIns: t.totalCheckIns, todayCheckIns: t.todayCheckIns }
            : t
        ))
        toast.success("Beállítások mentve!")
        setShowSettingsModal(null)
      } else {
        const error = await response.json()
        toast.error(error.error || "Hiba történt")
      }
    } catch (error) {
      toast.error("Nem sikerült menteni")
    } finally {
      setSaving(false)
    }
  }

  // Delete terminal
  const handleDeleteTerminal = async () => {
    if (!showSettingsModal) return
    if (!confirm("Biztosan törölni szeretnéd ezt a terminált?")) return
    
    setDeleting(true)
    try {
      const response = await fetch(`/api/checkin/terminals/${showSettingsModal.id}`, {
        method: "DELETE"
      })
      
      if (response.ok) {
        setTerminals(terminals.filter(t => t.id !== showSettingsModal.id))
        toast.success("Terminál törölve")
        setShowSettingsModal(null)
      } else {
        const error = await response.json()
        toast.error(error.error || "Hiba történt")
      }
    } catch (error) {
      toast.error("Nem sikerült törölni")
    } finally {
      setDeleting(false)
    }
  }

  // Update opening hours for a day
  const updateDayHours = (day: string, field: string, value: string | boolean) => {
    if (!editingSettings?.openingHours) return
    
    setEditingSettings({
      ...editingSettings,
      openingHours: {
        ...editingSettings.openingHours,
        [day]: {
          ...editingSettings.openingHours[day],
          [field]: value
        }
      }
    })
  }

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
        setTerminals([{ ...data.terminal, totalCheckIns: 0, todayCheckIns: 0 }, ...terminals])
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

  // Copy kiosk URL
  const copyKioskUrl = (deviceId: string) => {
    const url = `${window.location.origin}/terminal/${deviceId}`
    navigator.clipboard.writeText(url)
    toast.success("Kiosk URL másolva!")
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
                  onClick={() => openSettingsModal(terminal)}
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
        {showSettingsModal && editingSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center"
            onClick={() => setShowSettingsModal(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full sm:max-w-lg bg-[#1E1E2D] rounded-t-3xl sm:rounded-2xl max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h2 className="text-white text-xl font-semibold">Beállítások</h2>
                <button
                  onClick={() => setShowSettingsModal(null)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Name */}
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Név</label>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full bg-[#252a32] rounded-xl border border-white/5 px-4 py-3 text-white focus:outline-none focus:border-[#D2F159]"
                  />
                </div>

                {/* Active toggle */}
                <div className="flex items-center justify-between bg-[#252a32] rounded-xl p-4">
                  <span className="text-white">Aktív</span>
                  <button
                    onClick={() => setEditingActive(!editingActive)}
                    className={`w-12 h-7 rounded-full p-1 transition-colors ${
                      editingActive ? "bg-[#D2F159]" : "bg-white/20"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      editingActive ? "translate-x-5" : ""
                    }`} />
                  </button>
                </div>

                {/* Kiosk URL */}
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Kiosk URL</label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-[#252a32] rounded-xl px-4 py-3 text-white/60 text-sm font-mono truncate">
                      /terminal/{showSettingsModal.deviceId}
                    </div>
                    <button
                      onClick={() => copyKioskUrl(showSettingsModal.deviceId)}
                      className="px-4 bg-[#252a32] rounded-xl"
                    >
                      <Copy className="w-4 h-4 text-white/60" />
                    </button>
                    <a
                      href={`/terminal/${showSettingsModal.deviceId}`}
                      target="_blank"
                      className="px-4 bg-[#252a32] rounded-xl flex items-center"
                    >
                      <ExternalLink className="w-4 h-4 text-white/60" />
                    </a>
                  </div>
                </div>

                {/* Opening Hours */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-[#D2F159]" />
                    <h3 className="text-white font-medium">Nyitvatartás</h3>
                  </div>
                  <p className="text-white/40 text-sm mb-4">
                    Ha be van állítva, a terminál csak nyitvatartási időben fogad belépést.
                  </p>
                  
                  <div className="space-y-3">
                    {DAYS.map((day) => {
                      const hours = editingSettings.openingHours?.[day.key] || DEFAULT_HOURS
                      return (
                        <div key={day.key} className="bg-[#252a32] rounded-xl p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">{day.label}</span>
                            <button
                              onClick={() => updateDayHours(day.key, "enabled", !hours.enabled)}
                              className={`w-10 h-6 rounded-full p-1 transition-colors ${
                                hours.enabled ? "bg-[#D2F159]" : "bg-white/20"
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                                hours.enabled ? "translate-x-4" : ""
                              }`} />
                            </button>
                          </div>
                          
                          {hours.enabled && (
                            <div className="flex items-center gap-2">
                              <input
                                type="time"
                                value={hours.open}
                                onChange={(e) => updateDayHours(day.key, "open", e.target.value)}
                                className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:ring-1 focus:ring-[#D2F159]"
                              />
                              <span className="text-white/40">-</span>
                              <input
                                type="time"
                                value={hours.close}
                                onChange={(e) => updateDayHours(day.key, "close", e.target.value)}
                                className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:ring-1 focus:ring-[#D2F159]"
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/5 space-y-3">
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="w-full py-4 bg-[#D2F159] text-[#171725] rounded-full font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Mentés
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleDeleteTerminal}
                  disabled={deleting}
                  className="w-full py-4 bg-red-500/20 text-red-400 rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Terminál törlése
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
