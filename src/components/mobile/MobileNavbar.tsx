"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Home, Users, CalendarDays, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", icon: Home, label: "Főoldal" },
  { href: "/idopontok", icon: CalendarDays, label: "Időpontok" },
  { href: "/taglista", icon: Users, label: "Tagok" },
  { href: "/penzugy", icon: Wallet, label: "Pénzügy" },
]

// Pages that have their own custom bottom navigation/action bar - don't show nav
const PAGES_WITH_CUSTOM_NAV = [
  "/fizetes",
  "/helyszinek",
  "/csoportok",
  "/tagfelvetel",
  "/fiok",
  "/segitseg",
  "/trainer",
  "/admin",
  "/reports",
  "/ertesitesek",
  "/settings",
  "/profil",
]

// Detail pages (with dynamic IDs) that should hide nav
const DETAIL_PAGE_PATTERNS = [
  /^\/idopontok\/[^/]+$/,  // /idopontok/[id]
  /^\/csoportok\/[^/]+$/,  // /csoportok/[id]
]

export function MobileNavbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Hide on desktop
  if (!isMobile) {
    return null
  }

  // Hide for student users - they have their own navigation
  const isStudent = session?.user?.role === "STUDENT"
  if (isStudent) {
    return null
  }

  // Hide on pages that have their own custom navigation
  const shouldHide = PAGES_WITH_CUSTOM_NAV.some(path => pathname.startsWith(path)) ||
    DETAIL_PAGE_PATTERNS.some(pattern => pattern.test(pathname))
  
  if (shouldHide) {
    return null
  }

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 lg:hidden">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
        className="relative"
      >
        <div className="flex items-center gap-1 px-3 py-2.5 rounded-full bg-[#252a32]/90 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40">
          {navItems.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            
            return (
              <Link key={item.href} href={item.href} className="relative">
                <motion.div
                  className={cn(
                    "flex flex-col items-center justify-center px-5 py-2 rounded-full transition-all duration-200",
                    active 
                      ? "bg-[#D2F159]" 
                      : "hover:bg-white/5"
                  )}
                  whileTap={{ scale: 0.92 }}
                  transition={{ duration: 0.1 }}
                >
                  <Icon 
                    className={cn(
                      "w-5 h-5 transition-colors",
                      active ? "text-[#171725]" : "text-white/60"
                    )} 
                  />
                  {active && (
                    <motion.span 
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[10px] font-semibold text-[#171725] mt-0.5"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </motion.div>
              </Link>
            )
          })}
        </div>
        
        <div className="absolute inset-0 -z-10 rounded-full bg-[#D2F159]/20 blur-2xl opacity-30" />
      </motion.div>
    </nav>
  )
}
