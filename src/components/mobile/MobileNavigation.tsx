"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
  Home,
  Calendar,
  Users,
  Wallet,
} from "lucide-react"
import { useSession } from "next-auth/react"

const navigation = [
  { name: "Főoldal", href: "/", icon: Home },
  { name: "Időpontok", href: "/idopontok", icon: Calendar },
  { name: "Tagok", href: "/taglista", icon: Users },
  { name: "Pénzügy", href: "/penzugy", icon: Wallet },
]

interface MobileNavigationProps {
  className?: string
}

// Pages that have their own custom bottom navigation/action bar
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

export function MobileNavigation({ className }: MobileNavigationProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isMobile, setIsMobile] = useState(false)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Hide on pages that have their own custom navigation
  const shouldHide = PAGES_WITH_CUSTOM_NAV.some(path => pathname.startsWith(path)) ||
    DETAIL_PAGE_PATTERNS.some(pattern => pattern.test(pathname))

  // Hide for student users - they have their own navigation
  const isStudent = session?.user?.role === "STUDENT"

  if (!isMobile || shouldHide || isStudent) {
    return null
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  // Only animate on first mount
  const shouldAnimate = !hasAnimated.current
  if (shouldAnimate) {
    hasAnimated.current = true
  }

  return (
    <>
      <nav className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
        "safe-area-inset-bottom",
        className
      )}>
        <motion.div
          initial={shouldAnimate ? { y: 100, opacity: 0 } : false}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
          className="relative"
        >
          {/* Glass container */}
          <div className="flex items-center gap-1 px-3 py-2.5 rounded-full bg-[#252a32]/90 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40">
            {navigation.map((item) => {
              const active = isActive(item.href)
              const Icon = item.icon
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative"
                >
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
                        {item.name}
                      </motion.span>
                    )}
                  </motion.div>
                </Link>
              )
            })}
          </div>
          
          {/* Subtle glow effect */}
          <div className="absolute inset-0 -z-10 rounded-full bg-[#D2F159]/20 blur-2xl opacity-30" />
        </motion.div>
      </nav>

      <style jsx global>{`
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .safe-area-inset-bottom {
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
      `}</style>
    </>
  )
}
