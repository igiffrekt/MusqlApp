"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  MapPin, 
  Phone, 
  Calendar as CalendarIcon, 
  Clock, 
  Repeat, 
  Loader2, 
  ChevronLeft,
  ChevronRight,
  Check,
  Building2,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete"
import { format } from "date-fns"
import { hu } from "date-fns/locale"
import { useNotificationsStore } from "@/lib/stores/notifications-store"
import { useMembersStore } from "@/lib/stores/members-store"

type Step = "location" | "session"

// TimePicker component for modal time selection
// TimePicker component - simple input on desktop, modal on mobile
function TimePicker({ value, onChange, disabled = false }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempHours, setTempHours] = useState(0)
  const [tempMinutes, setTempMinutes] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [hours, minutes] = (value || "00:00").split(":").map(Number)
  const hoursRef = useRef<HTMLDivElement>(null)
  const minutesRef = useRef<HTMLDivElement>(null)

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const openPicker = () => {
    if (disabled) return
    setTempHours(hours || 0)
    setTempMinutes(minutes || 0)
    setIsOpen(true)
  }

  const confirmTime = () => {
    onChange(`${tempHours.toString().padStart(2, "0")}:${tempMinutes.toString().padStart(2, "0")}`)
    setIsOpen(false)
  }

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        hoursRef.current?.children[tempHours]?.scrollIntoView({ block: "center", behavior: "instant" })
        minutesRef.current?.children[Math.floor(tempMinutes / 5)]?.scrollIntoView({ block: "center", behavior: "instant" })
      }, 50)
    }
  }, [isOpen, tempHours, tempMinutes])

  // Desktop: simple text input
  if (!isMobile) {
    return (
      <div className="relative w-full">
        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
        <input
          type="time"
          value={value || "00:00"}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full bg-[#252a32] text-white rounded-xl pl-12 pr-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-[#D2F159] transition-all disabled:opacity-50 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60"
        />
      </div>
    )
  }

  // Mobile: popup picker
  return (
    <>
      <button
        type="button"
        onClick={openPicker}
        disabled={disabled}
        className="w-full bg-[#252a32] text-white rounded-xl px-4 py-4 text-base text-left flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-[#D2F159] transition-all disabled:opacity-50"
      >
        <Clock className="w-5 h-5 text-white/40" />
        <span className={value ? "text-white" : "text-white/40"}>{value || "00:00"}</span>
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-6" onClick={() => setIsOpen(false)}>
          <div 
            className="bg-[#252a32]/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 w-full max-w-xs shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white text-center text-lg font-semibold mb-8">Válassz időpontot</h3>
            
            <div className="flex justify-center gap-6 mb-8">
              <div className="flex flex-col items-center">
                <span className="text-white/40 text-xs mb-2">Óra</span>
                <div 
                  ref={hoursRef}
                  className="h-40 w-16 overflow-y-auto scrollbar-thin bg-[#1a1f26] rounded-xl"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setTempHours(i)}
                      className={cn(
                        "block w-full py-2.5 text-center text-lg font-medium transition-colors",
                        tempHours === i 
                          ? "bg-[#D2F159] text-[#171725]" 
                          : "text-white hover:bg-white/10"
                      )}
                    >
                      {i.toString().padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center text-white text-3xl font-bold pt-6">:</div>
              
              <div className="flex flex-col items-center">
                <span className="text-white/40 text-xs mb-2">Perc</span>
                <div 
                  ref={minutesRef}
                  className="h-40 w-16 overflow-y-auto scrollbar-thin bg-[#1a1f26] rounded-xl"
                >
                  {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTempMinutes(m)}
                      className={cn(
                        "block w-full py-2.5 text-center text-lg font-medium transition-colors",
                        tempMinutes === m 
                          ? "bg-[#D2F159] text-[#171725]" 
                          : "text-white hover:bg-white/10"
                      )}
                    >
                      {m.toString().padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <button
              type="button"
              onClick={confirmTime}
              className="w-full bg-[#D2F159] text-[#171725] rounded-xl py-3 font-semibold"
            >
              Rendben
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default function SetupPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [step, setStep] = useState<Step>("location")
  const [checking, setChecking] = useState(true)

  // Location state
  const [locationName, setLocationName] = useState("")
  const [locationAddress, setLocationAddress] = useState("")
  const [locationPhone, setLocationPhone] = useState("")
  const [locationId, setLocationId] = useState<string | null>(null)

  // Session state
  const [sessionTitle, setSessionTitle] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [isRecurring, setIsRecurring] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get store reset functions
  const resetNotifications = useNotificationsStore((state) => state.reset)
  const resetMembers = useMembersStore((state) => state.reset)

  // Reset stores on mount
  useEffect(() => {
    resetNotifications()
    resetMembers()
  }, [resetNotifications, resetMembers])

  // Set default date to tomorrow
  useEffect(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    setSelectedDate(tomorrow)
  }, [])

  // Check if user already has locations
  useEffect(() => {
    const checkExistingLocations = async () => {
      try {
        const response = await fetch("/api/locations")
        if (response.ok) {
          const data = await response.json()
          if (data.locations && data.locations.length > 0) {
            router.replace("/")
            return
          }
        }
      } catch (err) {
        console.error("Failed to check locations:", err)
      }
      setChecking(false)
    }

    if (status === "authenticated") {
      checkExistingLocations()
    } else if (status === "unauthenticated") {
      router.replace("/auth/signin")
    }
  }, [status, router])

  const handleLocationSubmit = async () => {
    if (!locationName.trim()) {
      setError("A helyszín neve kötelező")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: locationName.trim(),
          address: locationAddress.trim() || null,
          phone: locationPhone.trim() || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Nem sikerült létrehozni a helyszínt")
      }

      const data = await response.json()
      setLocationId(data.location.id)
      setStep("session")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hiba történt")
    } finally {
      setLoading(false)
    }
  }

  const handleSessionSubmit = async () => {
    if (!sessionTitle.trim()) {
      setError("Az edzés neve kötelező")
      return
    }
    if (!selectedDate) {
      setError("A dátum kötelező")
      return
    }
    if (!startTime || !endTime) {
      setError("Az időpontok megadása kötelező")
      return
    }
    if (startTime >= endTime) {
      setError("A befejezési idő a kezdés után kell legyen")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd")
      const startDateTime = new Date(`${dateStr}T${startTime}:00`)
      const endDateTime = new Date(`${dateStr}T${endTime}:00`)

      // Create a group with the same name
      await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sessionTitle.trim(),
          dailyFee: 2500,
          monthlyFee: 15000,
        }),
      })

      // Create the session
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: sessionTitle.trim(),
          locationId,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          isRecurring,
          recurringRule: isRecurring ? { frequency: "weekly", interval: 1 } : null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Nem sikerült létrehozni az edzést")
      }

      router.push("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hiba történt")
      setLoading(false)
    }
  }

  const formattedDate = selectedDate
    ? format(selectedDate, "yyyy. MMMM d., EEEE", { locale: hu })
    : "Válassz dátumot"

  const disabledDays = { before: new Date() }

  // Loading states
  if (status === "loading" || checking) {
    return (
      <div className="min-h-screen bg-[#171725] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D2F159] animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#171725] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D2F159] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#171725" }}>
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 lg:w-[500px] lg:h-[500px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, #D2F159 0%, transparent 70%)" }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 lg:w-[500px] lg:h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #FF6F61 0%, transparent 70%)" }}
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Logo */}
      <motion.div 
        className="absolute top-6 left-6 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center">
          <Image
            src="/img/musql_logo.png"
            alt="Musql"
            width={150}
            height={40}
            className="h-8 lg:h-10 w-auto"
          />
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 pt-20 lg:pt-8">
        <div className="w-full max-w-[420px] lg:max-w-[1000px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            {/* Left: Progress & Summary (Desktop) */}
            <motion.div 
              className="hidden lg:flex flex-col w-80 flex-shrink-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Steps */}
              <div className="space-y-4 mb-8">
                <div className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl transition-all",
                  step === "location" ? "bg-white/10" : "bg-transparent"
                )}>
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    step === "location" 
                      ? "bg-[#D2F159] text-[#171725]" 
                      : locationId 
                        ? "bg-[#D2F159] text-[#171725]"
                        : "bg-white/10 text-white/40"
                  )}>
                    {locationId ? <Check className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className={cn(
                      "font-semibold",
                      step === "location" ? "text-white" : locationId ? "text-white/60" : "text-white/40"
                    )}>
                      Helyszín
                    </p>
                    <p className="text-white/40 text-sm">Add meg az edzés helyét</p>
                  </div>
                </div>

                <div className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl transition-all",
                  step === "session" ? "bg-white/10" : "bg-transparent"
                )}>
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    step === "session" 
                      ? "bg-[#D2F159] text-[#171725]" 
                      : "bg-white/10 text-white/40"
                  )}>
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={cn(
                      "font-semibold",
                      step === "session" ? "text-white" : "text-white/40"
                    )}>
                      Első edzés
                    </p>
                    <p className="text-white/40 text-sm">Állítsd be az időpontot</p>
                  </div>
                </div>
              </div>

              {/* Summary Card */}
              <AnimatePresence mode="wait">
                {locationId && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-[#D2F159]" />
                      <span className="text-white/60 text-sm font-medium">Összegzés</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-[#D2F159] mt-0.5" />
                        <div>
                          <p className="text-white font-medium">{locationName}</p>
                          {locationAddress && (
                            <p className="text-white/40 text-sm">{locationAddress}</p>
                          )}
                        </div>
                      </div>
                      {sessionTitle && (
                        <div className="flex items-start gap-3">
                          <CalendarIcon className="w-4 h-4 text-[#D2F159] mt-0.5" />
                          <div>
                            <p className="text-white font-medium">{sessionTitle}</p>
                            {selectedDate && startTime && endTime && (
                              <p className="text-white/40 text-sm">
                                {format(selectedDate, "MMM d.", { locale: hu })} • {startTime} - {endTime}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Right: Form */}
            <motion.div 
              className="flex-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-[#1E1E2D]/80 backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-white/10">
                <AnimatePresence mode="wait">
                  {step === "location" ? (
                    <motion.div
                      key="location"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Header */}
                      <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#D2F159] to-[#D2F159]/70 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#D2F159]/20">
                          <MapPin className="w-8 h-8 text-[#171725]" />
                        </div>
                        <h1 className="text-white text-2xl lg:text-3xl font-bold mb-2">
                          Hozd létre az első helyszínt
                        </h1>
                        <p className="text-white/60">
                          Add meg az edzéseid helyszínét
                        </p>
                      </div>

                      {/* Form */}
                      <div className="space-y-4">
                        <div>
                          <label className="text-white/60 text-sm block mb-2">
                            Helyszín neve *
                          </label>
                          <input
                            type="text"
                            value={locationName}
                            onChange={(e) => setLocationName(e.target.value)}
                            placeholder="pl. Suzuki Aréna"
                            className="w-full bg-[#252a32] text-white rounded-xl px-4 py-4 text-base placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#D2F159] transition-all"
                            disabled={loading}
                          />
                        </div>

                        <div>
                          <label className="text-white/60 text-sm block mb-2">
                            Cím
                          </label>
                          <AddressAutocomplete
                            value={locationAddress}
                            onChange={setLocationAddress}
                            placeholder="pl. Budapest, Példa utca 1."
                            disabled={loading}
                          />
                        </div>

                        <div>
                          <label className="text-white/60 text-sm block mb-2">
                            Telefonszám
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            <input
                              type="tel"
                              value={locationPhone}
                              onChange={(e) => setLocationPhone(e.target.value)}
                              placeholder="pl. +36 30 123 4567"
                              className="w-full bg-[#252a32] text-white rounded-xl pl-12 pr-4 py-4 text-base placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#D2F159] transition-all"
                              disabled={loading}
                            />
                          </div>
                        </div>

                        {error && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/20 border border-red-500/50 text-red-400 rounded-xl px-4 py-3 text-sm"
                          >
                            {error}
                          </motion.div>
                        )}

                        {/* Progress - Mobile */}
                        <div className="flex items-center justify-center gap-2 lg:hidden pt-4">
                          <div className="w-3 h-3 rounded-full bg-[#D2F159]" />
                          <div className="w-3 h-3 rounded-full bg-white/20" />
                        </div>

                        <button
                          onClick={handleLocationSubmit}
                          disabled={loading || !locationName.trim()}
                          className="w-full bg-gradient-to-r from-[#D2F159] to-[#c4e350] text-[#171725] rounded-xl py-4 font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-[#D2F159]/20 mt-2"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Mentés...
                            </>
                          ) : (
                            <>
                              Tovább
                              <ChevronRight className="w-5 h-5" />
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="session"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Back button */}
                      <button
                        onClick={() => setStep("location")}
                        className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors"
                        disabled={loading}
                      >
                        <ChevronLeft className="w-5 h-5" />
                        <span>Vissza</span>
                      </button>

                      {/* Header */}
                      <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#D2F159] to-[#D2F159]/70 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#D2F159]/20">
                          <CalendarIcon className="w-8 h-8 text-[#171725]" />
                        </div>
                        <h1 className="text-white text-2xl lg:text-3xl font-bold mb-2">
                          Hozd létre az első edzést
                        </h1>
                        <p className="text-white/60">
                          Állítsd be az első alkalom időpontját
                        </p>
                      </div>

                      {/* Selected location badge */}
                      <div className="bg-[#252a32] rounded-xl px-4 py-3 flex items-center gap-3 mb-6">
                        <MapPin className="w-5 h-5 text-[#D2F159]" />
                        <div>
                          <span className="text-white/40 text-xs">Helyszín</span>
                          <p className="text-white text-sm font-medium">{locationName}</p>
                        </div>
                      </div>

                      {/* Form */}
                      <div className="space-y-4">
                        <div>
                          <label className="text-white/60 text-sm block mb-2">
                            Edzés neve *
                          </label>
                          <input
                            type="text"
                            value={sessionTitle}
                            onChange={(e) => setSessionTitle(e.target.value)}
                            placeholder="pl. Kezdő csoport edzés"
                            className="w-full bg-[#252a32] text-white rounded-xl px-4 py-4 text-base placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#D2F159] transition-all"
                            disabled={loading}
                          />
                        </div>

                        <div>
                          <label className="text-white/60 text-sm block mb-2">
                            Dátum *
                          </label>
                          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                disabled={loading}
                                className="w-full bg-[#252a32] text-white rounded-xl px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-[#D2F159] flex items-center gap-3 text-left transition-all"
                              >
                                <CalendarIcon className="w-5 h-5 text-white/40" />
                                <span className={selectedDate ? "text-white" : "text-white/40"}>
                                  {formattedDate}
                                </span>
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0 bg-transparent border-0 shadow-none"
                              align="start"
                              side="bottom"
                              sideOffset={8}
                            >
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => {
                                  setSelectedDate(date)
                                  setDatePickerOpen(false)
                                }}
                                disabled={disabledDays}
                                showTodayButton={true}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-white/60 text-sm block mb-2">
                              Kezdés *
                            </label>
                            <TimePicker
                              value={startTime}
                              onChange={setStartTime}
                              disabled={loading}
                            />
                          </div>
                          <div>
                            <label className="text-white/60 text-sm block mb-2">
                              Befejezés *
                            </label>
                            <TimePicker
                              value={endTime}
                              onChange={setEndTime}
                              disabled={loading}
                            />
                          </div>
                        </div>

                        <div className="bg-[#252a32] rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Repeat className={cn(
                                "w-5 h-5 transition-colors",
                                isRecurring ? "text-[#D2F159]" : "text-white/40"
                              )} />
                              <div>
                                <p className="text-white text-sm font-medium">Ismétlődés</p>
                                <p className="text-white/40 text-xs">
                                  {isRecurring ? "Hetente ismétlődő" : "Egyszeri alkalom"}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsRecurring(!isRecurring)}
                              disabled={loading}
                              className={cn(
                                "w-14 h-8 rounded-full transition-colors relative",
                                isRecurring ? "bg-[#D2F159]" : "bg-[#333842]"
                              )}
                            >
                              <div
                                className={cn(
                                  "absolute top-1 w-6 h-6 bg-white rounded-full transition-transform shadow",
                                  isRecurring ? "translate-x-7" : "translate-x-1"
                                )}
                              />
                            </button>
                          </div>
                        </div>

                        {error && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/20 border border-red-500/50 text-red-400 rounded-xl px-4 py-3 text-sm"
                          >
                            {error}
                          </motion.div>
                        )}

                        {/* Progress - Mobile */}
                        <div className="flex items-center justify-center gap-2 lg:hidden pt-4">
                          <div className="w-3 h-3 rounded-full bg-white/20" />
                          <div className="w-3 h-3 rounded-full bg-[#D2F159]" />
                        </div>

                        <button
                          onClick={handleSessionSubmit}
                          disabled={loading || !sessionTitle.trim() || !selectedDate || !startTime || !endTime}
                          className="w-full bg-gradient-to-r from-[#D2F159] to-[#c4e350] text-[#171725] rounded-xl py-4 font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-[#D2F159]/20 mt-2"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Mentés...
                            </>
                          ) : (
                            <>
                              Befejezés
                              <Check className="w-5 h-5" />
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
