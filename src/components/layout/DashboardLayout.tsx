"use client"

import { ReactNode, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MobileNavigation } from "@/components/mobile/MobileNavigation"
import { DesktopSidebar } from "@/components/layout/DesktopSidebar"
import { DesktopHeader } from "@/components/layout/DesktopHeader"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobile, setIsMobile] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#171725] font-lufga">
        <div className="pb-20 lg:pb-0">{children}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#171725] font-lufga">
      {/* Desktop Layout */}
      {!isMobile && (
        <>
          <DesktopSidebar />
          <DesktopHeader />
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-[280px] pt-20 min-h-screen"
          >
            <div className="p-8">
              {children}
            </div>
          </motion.main>
        </>
      )}

      {/* Mobile Layout */}
      {isMobile && (
        <>
          <main className="pb-24">
            {children}
          </main>
          <MobileNavigation />
        </>
      )}
    </div>
  )
}
