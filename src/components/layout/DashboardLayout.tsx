"use client"

import { ReactNode, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MobileNavigation } from "@/components/mobile/MobileNavigation"
import { DesktopSidebar } from "@/components/layout/DesktopSidebar"
import { DesktopHeader } from "@/components/layout/DesktopHeader"
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext"

interface DashboardLayoutProps {
  children: ReactNode
}

function DesktopContent({ children }: { children: ReactNode }) {
  const { sidebarWidth } = useSidebar()
  
  return (
    <>
      <DesktopSidebar />
      <DesktopHeader />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, marginLeft: sidebarWidth }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="pt-20 min-h-screen"
      >
        <div className="p-8 max-w-7xl">
          {children}
        </div>
      </motion.main>
    </>
  )
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
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#171725] font-lufga">
      {/* Desktop Layout */}
      {!isMobile && (
        <SidebarProvider>
          <DesktopContent>{children}</DesktopContent>
        </SidebarProvider>
      )}

      {/* Mobile Layout */}
      {isMobile && (
        <>
          <main>
            {children}
          </main>
          <MobileNavigation />
        </>
      )}
    </div>
  )
}
