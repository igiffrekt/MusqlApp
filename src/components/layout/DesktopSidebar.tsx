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
  FileText,
  Shield,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
  const isTrainer = userRole === "TRAINER"
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
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-screen bg-[#1E1E2D] border-r border-white/5 flex flex-col z-40"
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
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
                    width={40}
                    height={40}
                    className="flex-shrink-0 rounded-xl"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Image
                    src="/img/musql_logo.png"
                    alt="Musql"
                    width={150}
                    height={40}
                    className="h-8 w-auto"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl h-8 w-8"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <div className="space-y-1">
            {filteredMainNav.map((item) => {
              const active = isActive(item.href)
              const Icon = item.icon

              const navLink = (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                    active
                      ? "bg-gradient-to-r from-[#FF6F61]/20 to-[#D2F159]/10 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-[#FF6F61] to-[#D2F159] rounded-full"
                    />
                  )}
                  <Icon className={cn("h-5 w-5 flex-shrink-0", active && "text-[#FF6F61]")} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="font-medium whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {item.badge && !collapsed && (
                    <span className="ml-auto bg-[#FF6F61] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{navLink}</TooltipTrigger>
                    <TooltipContent side="right" className="bg-[#2D2D3D] text-white border-white/10">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return navLink
            })}
          </div>

          {/* Admin Section */}
          {isAdmin && (
            <>
              <div className="my-4 px-3">
                <div className="h-px bg-white/10" />
              </div>
              {!collapsed && (
                <p className="px-3 mb-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
                  Admin
                </p>
              )}
              <div className="space-y-1">
                {adminNavItems.map((item) => {
                  const active = isActive(item.href)
                  const Icon = item.icon

                  const navLink = (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                        active
                          ? "bg-gradient-to-r from-[#FF6F61]/20 to-[#D2F159]/10 text-white"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <Icon className={cn("h-5 w-5 flex-shrink-0", active && "text-[#FF6F61]")} />
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="font-medium whitespace-nowrap"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  )

                  if (collapsed) {
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>{navLink}</TooltipTrigger>
                        <TooltipContent side="right" className="bg-[#2D2D3D] text-white border-white/10">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    )
                  }

                  return navLink
                })}
              </div>
            </>
          )}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-white/5 p-3 space-y-1">
          {bottomNavItems.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon

            const navLink = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  active
                    ? "bg-gradient-to-r from-[#FF6F61]/20 to-[#D2F159]/10 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className={cn("h-5 w-5 flex-shrink-0", active && "text-[#FF6F61]")} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{navLink}</TooltipTrigger>
                  <TooltipContent side="right" className="bg-[#2D2D3D] text-white border-white/10">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return navLink
          })}
        </div>

        {/* User Profile Section */}
        <div className="border-t border-white/5 p-3">
          <div
            className={cn(
              "flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer",
              collapsed && "justify-center"
            )}
            onClick={() => router.push("/fiok")}
          >
            <Avatar className="h-10 w-10 border-2 border-[#FF6F61]/30">
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback className="bg-gradient-to-br from-[#FF6F61] to-[#D2F159] text-white font-medium">
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
                  <p className="text-xs text-white/50 truncate">{userEmail}</p>
                </motion.div>
              )}
            </AnimatePresence>
            {!collapsed && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/60 hover:text-white hover:bg-white/10 rounded-lg h-8 w-8 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSignOut()
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-[#2D2D3D] text-white border-white/10">
                  Kijelentkezés
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  )
}
