"use client"

import { useRef } from "react"

interface TimeInput24hProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function TimeInput24h({ value, onChange, disabled = false, className = "" }: TimeInput24hProps) {
  const minutesRef = useRef<HTMLInputElement>(null)
  
  const [hours = "", minutes = ""] = (value || "").split(":")

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 2)
    
    const num = parseInt(val, 10)
    if (val.length === 2 && num > 23) val = "23"
    
    onChange(`${val}:${minutes}`)
    
    if (val.length === 2) {
      setTimeout(() => {
        minutesRef.current?.focus()
        minutesRef.current?.select()
      }, 0)
    }
  }

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 2)
    
    const num = parseInt(val, 10)
    if (val.length === 2 && num > 59) val = "59"
    
    onChange(`${hours}:${val}`)
  }

  const handleHoursBlur = () => {
    if (hours && hours.length === 1) {
      onChange(`${hours.padStart(2, "0")}:${minutes}`)
    }
  }

  const handleMinutesBlur = () => {
    if (minutes && minutes.length === 1) {
      onChange(`${hours}:${minutes.padStart(2, "0")}`)
    }
  }

  const handleHoursKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ":" || e.key === "ArrowRight") {
      e.preventDefault()
      minutesRef.current?.focus()
      minutesRef.current?.select()
    }
  }

  return (
    <div className={`flex items-center ${className}`}>
      <input
        type="text"
        inputMode="numeric"
        value={hours}
        onChange={handleHoursChange}
        onBlur={handleHoursBlur}
        onKeyDown={handleHoursKeyDown}
        placeholder="00"
        disabled={disabled}
        maxLength={2}
        className="w-6 bg-transparent text-white text-center text-xs outline-none placeholder-white/30"
      />
      <span className="text-white/60 text-xs font-medium">:</span>
      <input
        ref={minutesRef}
        type="text"
        inputMode="numeric"
        value={minutes}
        onChange={handleMinutesChange}
        onBlur={handleMinutesBlur}
        placeholder="00"
        disabled={disabled}
        maxLength={2}
        className="w-6 bg-transparent text-white text-center text-xs outline-none placeholder-white/30"
      />
    </div>
  )
}
