"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Home,
  Calendar,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MapPin,
  UserPlus,
  Wallet,
  User,
  Shield,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: number
  roles?: string[]
}

const mainNavItems: NavItem[] = [
  { label: "Főoldal", href: "/", icon: Home },
  { label: "Időpontok", href: "/idopontok", icon: Calendar },
  { label: "Helyszínek", href: "/helyszinek", icon: MapPin },
  { label: "Taglista", href: "/taglista", icon: Users, roles: ["ADMIN", "TRAINER"] },
  { label: "Tagfelvétel", href: "/tagfelvetel", icon: UserPlus, roles: ["ADMIN", "TRAINER"] },
  { label: "Pénzügy", href: "/penzugy", icon: Wallet, roles: ["ADMIN", "TRAINER"] },
  { label: "Jelentések", href: "/reports", icon: BarChart3, roles: ["ADMIN", "TRAINER"] },
]

const bottomNavItems: NavItem[] = [
  { label: "Értesítések", href: "/ertesitesek", icon: Bell },
  { label: "Profil", href: "/profil", icon: User },
  { label: "Segítség", href: "/segitseg", icon: HelpCircle },
]

const adminNavItems: NavItem[] = [
  { label: "Felhasználók", href: "/admin/users", icon: Shield },
  { label: "Beállítások", href: "/admin/settings", icon: Settings },
]

export function DesktopSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  const userRole = session?.user?.role || "STUDENT"
  const isAdmin = userRole === "ADMIN"
  const userName = session?.user?.name || "Felhasználó"
  const userEmail = session?.user?.email || ""

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const filteredMainNav = mainNavItems.filter((item) => {
    if (!item.roles) return true
    return item.roles.includes(userRole)
  })

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" })
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-screen bg-[#252a32] border-r border-white/5 flex flex-col z-40 font-lufga"
    >
      {/* Logo Section */}
      <div className="h-20 flex items-center justify-between px-5 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <AnimatePresence mode="wait">
            {collapsed ? (
              <motion.div
                key="icon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Image
                  src="/img/musql_ikon.png"
                  alt="Musql"
                  width={44}
                  height={44}
                  className="flex-shrink-0 rounded-xl"
                />
              </motion.div>
            ) : (
              <motion.div
                key="full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center"
              >
                <Image
                  src="/img/musql_logo.png"
                  alt="Musql"
                  width={140}
                  height={40}
                  className="h-9 w-auto"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
        <button
          className="text-white/40 hover:text-white hover:bg-white/5 rounded-xl h-9 w-9 flex items-center justify-center transition-colors"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-6 px-3 overflow-y-auto">
        <div className="space-y-1.5">
          {filteredMainNav.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group relative",
                  active
                    ? "bg-[#D2F159] text-[#171725]"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className={cn("h-5 w-5 flex-shrink-0", active ? "text-[#171725]" : "")} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={cn("font-medium whitespace-nowrap overflow-hidden", active ? "text-[#171725]" : "")}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {item.badge && !collapsed && (
                  <span className="ml-auto bg-[#ea3a3d] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <>
            <div className="my-6 px-4">
              <div className="h-px bg-white/10" />
            </div>
            {!collapsed && (
              <p className="px-4 mb-3 text-xs font-semibold text-white/30 uppercase tracking-wider">
                Admin
              </p>
            )}
            <div className="space-y-1.5">
              {adminNavItems.map((item) => {
                const active = isActive(item.href)
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200",
                      active
                        ? "bg-[#D2F159] text-[#171725]"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 flex-shrink-0", active ? "text-[#171725]" : "")} />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={cn("font-medium whitespace-nowrap", active ? "text-[#171725]" : "")}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-white/5 p-3 space-y-1.5">
        {bottomNavItems.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200",
                active
                  ? "bg-[#D2F159] text-[#171725]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0", active ? "text-[#171725]" : "")} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn("font-medium whitespace-nowrap", active ? "text-[#171725]" : "")}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}
      </div>

      {/* User Profile Section */}
      <div className="border-t border-white/5 p-4">
        <div
          className={cn(
            "flex items-center gap-3 p-3 rounded-2xl bg-[#333842] hover:bg-[#3d4451] transition-all cursor-pointer",
            collapsed && "justify-center p-2"
          )}
          onClick={() => router.push("/fiok")}
        >
          <Avatar className="h-11 w-11 border-2 border-[#D2F159]/30">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback className="bg-[#D2F159] text-[#171725] font-semibold">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-white truncate">{userName}</p>
                <p className="text-xs text-white/40 truncate">{userEmail}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && (
            <button
              className="text-white/40 hover:text-white hover:bg-white/10 rounded-xl h-9 w-9 flex items-center justify-center flex-shrink-0 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                handleSignOut()
              }}
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  )
}
