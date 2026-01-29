"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Home, Users, CalendarDays, Wallet, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", icon: Home, label: "Főoldal" },
  { href: "/idopontok", icon: CalendarDays, label: "Időpontok" },
  { href: "/taglista", icon: Users, label: "Tagok" },
  { href: "/penzugy", icon: Wallet, label: "Pénzügy" },
  { href: "/profil", icon: User, label: "Profil" },
]

export function MobileNavbar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  // Hide for student users - they have their own navigation
  const isStudent = session?.user?.role === "STUDENT"
  if (isStudent) {
    return null
  }

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
        className="relative"
      >
        {/* Glass container */}
        <div className="flex items-center gap-1 px-3 py-2.5 rounded-full bg-[#252a32]/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40">
          {navItems.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            
            return (
              <Link key={item.href} href={item.href} className="relative">
                <motion.div
                  className={cn(
                    "flex flex-col items-center justify-center px-4 py-2 rounded-full transition-all duration-200",
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
        
        {/* Subtle glow effect */}
        <div className="absolute inset-0 -z-10 rounded-full bg-[#D2F159]/20 blur-2xl opacity-30" />
      </motion.div>
    </nav>
  )
}
