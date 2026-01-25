"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Calendar as CalendarIcon, Clock, MapPin, Repeat, Loader2, ChevronLeft } from "lucide-react"
import { TimeInput24h } from "@/components/ui/TimeInput24h"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { hu } from "date-fns/locale"

interface MobileOnboardingSessionProps {
  locationId: string
  locationName: string
  onBack: () => void
  onComplete?: () => void
}

export function MobileOnboardingSession({ locationId, locationName, onBack, onComplete }: MobileOnboardingSessionProps) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [isRecurring, setIsRecurring] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  // Set default date to tomorrow on mount
  useEffect(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    setSelectedDate(tomorrow)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError("Az edzés neve kötelező")
      return
    }
    if (!selectedDate) {
      setError("A dátum kötelező")
      return
    }
    if (!startTime) {
      setError("A kezdési idő kötelező")
      return
    }
    if (!endTime) {
      setError("A befejezési idő kötelező")
      return
    }

    // Validate time logic
    if (startTime >= endTime) {
      setError("A befejezési idő a kezdés után kell legyen")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create start and end DateTime
      const dateStr = format(selectedDate, "yyyy-MM-dd")
      const startDateTime = new Date(`${dateStr}T${startTime}:00`)
      const endDateTime = new Date(`${dateStr}T${endTime}:00`)

      // First, create a group with the same name as the session
      // This gives users a group to add members to
      const groupResponse = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: title.trim(),
          dailyFee: 2500,
          monthlyFee: 15000,
        }),
      })

      if (!groupResponse.ok) {
        console.error("Failed to create group, continuing with session creation")
      }

      // Then create the session
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
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

      // If onComplete callback provided, use it (for multi-step setup)
      if (onComplete) {
        onComplete()
        return
      }

      // Clear setup progress and mark as complete
      try {
        sessionStorage.setItem("musql_setup_progress", JSON.stringify({ completedAt: Date.now() }))
      } catch (e) {
        console.error("Failed to mark setup complete:", e)
      }

      // Success - redirect to dashboard
      router.push("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hiba történt")
      setLoading(false)
    }
  }

  // Format selected date for display
  const formattedDate = selectedDate
    ? format(selectedDate, "yyyy. MMMM d., EEEE", { locale: hu })
    : "Válassz dátumot"

  // Disable past dates
  const disabledDays = { before: new Date() }

  return (
    <div className="min-h-screen bg-[#171725] font-lufga">
      <div className="px-6 pt-14 pb-6">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/60 mb-4"
          disabled={loading}
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Vissza</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#D2F159] rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="w-8 h-8 text-[#171725]" />
          </div>
          <h1 className="text-white text-2xl font-bold mb-2">
            Hozd létre az első edzést
          </h1>
          <p className="text-white/60 text-sm">
            Állítsd be az első alkalom időpontját
          </p>
        </div>

        {/* Selected location */}
        <div className="bg-[#252a32] rounded-xl px-4 py-3 flex items-center gap-3 mb-6">
          <MapPin className="w-5 h-5 text-[#D2F159]" />
          <div>
            <span className="text-white/40 text-xs">Helyszín</span>
            <p className="text-white text-sm font-medium">{locationName}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title field */}
          <div>
            <label className="text-white/60 text-sm block mb-2">
              Edzés neve *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="pl. Kezdő csoport edzés"
              className="w-full bg-[#252a32] text-white rounded-xl px-4 py-4 text-base placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#D2F159]"
              disabled={loading}
            />
          </div>

          {/* Date field with Calendar Popover */}
          <div>
            <label className="text-white/60 text-sm block mb-2">
              Dátum *
            </label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  disabled={loading}
                  className="w-full bg-[#252a32] text-white rounded-xl px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-[#D2F159] flex items-center gap-3 text-left"
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

          {/* Time fields with 24h format */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/60 text-sm block mb-2">
                Kezdés *
              </label>
              <div className="flex items-center bg-[#252a32] rounded-xl px-4 py-4">
                <Clock className="w-5 h-5 text-white/40 mr-3" />
                <TimeInput24h
                  value={startTime}
                  onChange={setStartTime}
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <label className="text-white/60 text-sm block mb-2">
                Befejezés *
              </label>
              <div className="flex items-center bg-[#252a32] rounded-xl px-4 py-4">
                <Clock className="w-5 h-5 text-white/40 mr-3" />
                <TimeInput24h
                  value={endTime}
                  onChange={setEndTime}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Recurring toggle */}
          <div className="bg-[#252a32] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Repeat className={cn(
                  "w-5 h-5",
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

          {/* Error message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-3 h-3 rounded-full bg-white/20" />
            <div className="w-3 h-3 rounded-full bg-[#D2F159]" />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !title.trim() || !selectedDate || !startTime || !endTime}
            className="w-full bg-[#D2F159] text-[#171725] rounded-full py-4 font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Mentés...
              </>
            ) : (
              <>
                Befejezés
                <Image src="/icons/arrow-right-icon.svg" alt="" width={20} height={20} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
