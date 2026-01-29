"use client"

import { useRef } from "react"

interface DateInputProps {
  value: string // "YYYY-MM-DD" format
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function DateInput({ value, onChange, disabled = false, className = "" }: DateInputProps) {
  const monthRef = useRef<HTMLInputElement>(null)
  const dayRef = useRef<HTMLInputElement>(null)
  
  const [year = "", month = "", day = ""] = (value || "").split("-")

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 4)
    onChange(`${val}-${month}-${day}`)
    
    if (val.length === 4) {
      setTimeout(() => {
        monthRef.current?.focus()
        monthRef.current?.select()
      }, 0)
    }
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 2)
    const num = parseInt(val, 10)
    if (val.length === 2 && num > 12) val = "12"
    if (val.length === 2 && num < 1) val = "01"
    
    onChange(`${year}-${val}-${day}`)
    
    if (val.length === 2) {
      setTimeout(() => {
        dayRef.current?.focus()
        dayRef.current?.select()
      }, 0)
    }
  }

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 2)
    const num = parseInt(val, 10)
    if (val.length === 2 && num > 31) val = "31"
    if (val.length === 2 && num < 1) val = "01"
    
    onChange(`${year}-${month}-${val}`)
  }

  const handleYearBlur = () => {
    if (year && year.length < 4) {
      const padded = year.padStart(4, "20")
      onChange(`${padded}-${month}-${day}`)
    }
  }

  const handleMonthBlur = () => {
    if (month && month.length === 1) {
      onChange(`${year}-${month.padStart(2, "0")}-${day}`)
    }
  }

  const handleDayBlur = () => {
    if (day && day.length === 1) {
      onChange(`${year}-${month}-${day.padStart(2, "0")}`)
    }
  }

  return (
    <div className={`flex items-center ${className}`}>
      <input
        type="text"
        inputMode="numeric"
        value={year}
        onChange={handleYearChange}
        onBlur={handleYearBlur}
        placeholder="éééé"
        disabled={disabled}
        maxLength={4}
        className="w-9 bg-transparent text-white text-center text-xs outline-none placeholder-white/30"
      />
      <span className="text-white/60 text-xs">.</span>
      <input
        ref={monthRef}
        type="text"
        inputMode="numeric"
        value={month}
        onChange={handleMonthChange}
        onBlur={handleMonthBlur}
        placeholder="hh"
        disabled={disabled}
        maxLength={2}
        className="w-6 bg-transparent text-white text-center text-xs outline-none placeholder-white/30"
      />
      <span className="text-white/60 text-xs">.</span>
      <input
        ref={dayRef}
        type="text"
        inputMode="numeric"
        value={day}
        onChange={handleDayChange}
        onBlur={handleDayBlur}
        placeholder="nn"
        disabled={disabled}
        maxLength={2}
        className="w-6 bg-transparent text-white text-center text-xs outline-none placeholder-white/30"
      />
    </div>
  )
}
