"use client"

import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"
import { hu } from "date-fns/locale"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface CalendarProps extends Omit<React.ComponentProps<typeof DayPicker>, 'mode'> {
  mode?: "single" | "multiple" | "range"
  onTodayClick?: () => void
  showTodayButton?: boolean
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  showTodayButton = true,
  onTodayClick,
  month,
  onMonthChange,
  selected,
  onSelect,
  mode = "single",
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames()
  const [currentMonth, setCurrentMonth] = React.useState(month || new Date())

  const handleMonthChange = (newMonth: Date) => {
    setCurrentMonth(newMonth)
    onMonthChange?.(newMonth)
  }

  const handleTodayClick = () => {
    const today = new Date()
    setCurrentMonth(today)
    onMonthChange?.(today)
    if (mode === "single" && onSelect) {
      (onSelect as (date: Date | undefined) => void)(today)
    }
    onTodayClick?.()
  }

  const goToPreviousMonth = () => {
    const prev = new Date(currentMonth)
    prev.setMonth(prev.getMonth() - 1)
    handleMonthChange(prev)
  }

  const goToNextMonth = () => {
    const next = new Date(currentMonth)
    next.setMonth(next.getMonth() + 1)
    handleMonthChange(next)
  }

  // Format month name with proper Hungarian capitalization
  const monthYear = format(currentMonth, "MMMM yyyy", { locale: hu })
  const capitalizedMonthYear = monthYear.charAt(0).toUpperCase() + monthYear.slice(1)

  return (
    <div
      className={cn(
        "bg-[#1e2329] rounded-2xl p-4 shadow-2xl border border-white/5",
        className
      )}
    >
      {/* Custom Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        {showTodayButton ? (
          <button
            type="button"
            onClick={handleTodayClick}
            className="text-white/50 hover:text-white text-sm font-medium transition-colors"
          >
            Today
          </button>
        ) : (
          <div />
        )}

        <h2 className="text-white font-bold text-base">
          {capitalizedMonthYear}
        </h2>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={goToNextMonth}
            className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* DayPicker with hidden native nav */}
      <DayPicker
        showOutsideDays={showOutsideDays}
        weekStartsOn={1}
        locale={hu}
        month={currentMonth}
        onMonthChange={handleMonthChange}
        selected={selected}
        onSelect={onSelect as never}
        mode={mode as never}
        hideNavigation
        classNames={{
          root: "w-full",
          months: "w-full",
          month: "w-full",
          month_caption: "hidden",
          nav: "hidden",
          table: "w-full border-collapse",
          weekdays: "flex mb-2",
          weekday: "text-white/70 flex-1 text-center text-sm font-medium capitalize w-10",
          week: "flex w-full",
          day: cn(
            "group/day relative flex-1 aspect-square p-0.5 text-center",
            defaultClassNames.day
          ),
          today: "today-marker",
          outside: "text-white/20",
          disabled: "text-white/20 opacity-50 cursor-not-allowed",
          hidden: "invisible",
          range_start: "rounded-l-full",
          range_middle: "rounded-none",
          range_end: "rounded-r-full",
          ...classNames,
        }}
        components={{
          DayButton: CalendarDayButton,
          ...props.components,
        }}
        {...props}
      />
    </div>
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  const isSelected = modifiers.selected
  const isToday = modifiers.today
  const isOutside = modifiers.outside

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected={isSelected}
      data-today={isToday}
      className={cn(
        "w-10 h-10 p-0 font-normal text-sm rounded-full transition-all duration-200",
        // Default state
        "text-white hover:bg-white/10",
        // Outside days (prev/next month)
        isOutside && "text-white/25 hover:text-white/40",
        // Today marker (not selected)
        isToday && !isSelected && "text-white font-medium",
        // Selected state
        isSelected && "bg-[#D2F159] text-[#171725] font-semibold hover:bg-[#D2F159] hover:text-[#171725]",
        // Range styling
        modifiers.range_middle && "bg-[#D2F159]/20 text-white rounded-none",
        modifiers.range_start && "bg-[#D2F159] text-[#171725] rounded-l-full rounded-r-none",
        modifiers.range_end && "bg-[#D2F159] text-[#171725] rounded-r-full rounded-l-none",
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
