"use client"

import { ReactNode, useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface MobilePageWrapperProps {
  children: ReactNode
  className?: string
  padding?: string
}

export function MobilePageWrapper({ children, className, padding = "pb-24" }: MobilePageWrapperProps) {
  const [isMobile, setIsMobile] = useState(true)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Desktop: simple container without the black border effect
  if (!isMobile) {
    return (
      <div className={cn("min-h-screen bg-[#171725] font-lufga", padding, className)}>
        {children}
      </div>
    )
  }

  // Mobile: black border with rounded inner container
  return (
    <div className="min-h-screen bg-black font-lufga">
      <div className={cn(
        "min-h-screen bg-[#171725] mx-[5px] my-[5px] rounded-2xl",
        padding,
        className
      )}>
        {children}
      </div>
    </div>
  )
}
