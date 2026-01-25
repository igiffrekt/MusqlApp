"use client"

import { ReactNode } from "react"
import { MobileNavigation } from "@/components/mobile/MobileNavigation"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#171725]">
      {children}
      <MobileNavigation />
    </div>
  )
}
