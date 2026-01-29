"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Search,
  Bell,
  Plus,
  Command,
  Calendar,
  Users,
  CreditCard,
  ChevronRight,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Breadcrumb mapping
const breadcrumbMap: Record<string, string> = {
  "": "Főoldal",
  "idopontok": "Időpontok",
  "helyszinek": "Helyszínek",
  "taglista": "Taglista",
  "tagfelvetel": "Tagfelvétel",
  "penzugy": "Pénzügy",
  "reports": "Jelentések",
  "ertesitesek": "Értesítések",
  "profil": "Profil",
  "fiok": "Fiók",
  "segitseg": "Segítség",
  "admin": "Admin",
  "users": "Felhasználók",
  "settings": "Beállítások",
  "trainer": "Edző",
  "sessions": "Edzések",
  "attendance": "Jelenlét",
  "payments": "Fizetések",
  "students": "Tanulók",
}

export function DesktopHeader() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  const userRole = session?.user?.role || "STUDENT"
  const isAdmin = userRole === "ADMIN" || userRole === "TRAINER"

  // Generate breadcrumbs from pathname
  const pathSegments = pathname.split("/").filter(Boolean)
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = "/" + pathSegments.slice(0, index + 1).join("/")
    const label = breadcrumbMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
    return { label, path }
  })

  // Quick actions for admin/trainer
  const quickActions = [
    { label: "Új edzés", icon: Calendar, action: () => router.push("/trainer/sessions"), color: "text-[#D2F159]" },
    { label: "Új tag", icon: Users, action: () => router.push("/tagfelvetel"), color: "text-[#FF6F61]" },
    { label: "Fizetés rögzítése", icon: CreditCard, action: () => router.push("/trainer/payments"), color: "text-[#A8E6CF]" },
  ]

  return (
    <>
      <header className="fixed top-0 right-0 left-[280px] h-16 bg-[#1E1E2D]/80 backdrop-blur-xl border-b border-white/5 z-30 flex items-center justify-between px-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2">
          <button
            onClick={() => router.push("/")}
            className="text-white/60 hover:text-white transition-colors"
          >
            Főoldal
          </button>
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.path} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-white/30" />
              {index === breadcrumbs.length - 1 ? (
                <span className="text-white font-medium">{crumb.label}</span>
              ) : (
                <button
                  onClick={() => router.push(crumb.path)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  {crumb.label}
                </button>
              )}
            </div>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <AnimatePresence>
              {searchOpen ? (
                <motion.div
                  initial={{ width: 40, opacity: 0 }}
                  animate={{ width: 300, opacity: 1 }}
                  exit={{ width: 40, opacity: 0 }}
                  className="relative"
                >
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Keresés..."
                    className="pl-10 pr-10 h-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl focus:ring-[#FF6F61]/50"
                    onBlur={() => {
                      if (!searchQuery) setSearchOpen(false)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setSearchQuery("")
                        setSearchOpen(false)
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      setSearchQuery("")
                      setSearchOpen(false)
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(true)}
                  className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}
            </AnimatePresence>
          </div>

          {/* Keyboard shortcut hint */}
          <div className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 text-white/40 text-xs">
            <Command className="h-3 w-3" />
            <span>K</span>
          </div>

          {/* Quick Actions - Admin only */}
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="bg-gradient-to-r from-[#FF6F61] to-[#D2F159] text-gray-900 hover:opacity-90 rounded-xl px-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Új
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-[#2D2D3D] border-white/10 text-white"
              >
                <DropdownMenuLabel className="text-white/60">Gyors műveletek</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                {quickActions.map((action) => (
                  <DropdownMenuItem
                    key={action.label}
                    onClick={action.action}
                    className="focus:bg-white/10 focus:text-white cursor-pointer"
                  >
                    <action.icon className={cn("h-4 w-4 mr-3", action.color)} />
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF6F61] text-white text-xs font-bold rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 bg-[#2D2D3D] border-white/10 text-white"
            >
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Értesítések</span>
                <Badge className="bg-[#FF6F61]/20 text-[#FF6F61] hover:bg-[#FF6F61]/30">3 új</Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <div className="max-h-64 overflow-y-auto">
                {[
                  { title: "Új tag csatlakozott", desc: "Kiss Péter csatlakozott a csoporthoz", time: "5 perce" },
                  { title: "Fizetés beérkezett", desc: "10.000 Ft befizetés rögzítve", time: "1 órája" },
                  { title: "Edzés emlékeztető", desc: "Holnap 10:00-kor kezdődik az edzés", time: "2 órája" },
                ].map((notif, i) => (
                  <DropdownMenuItem key={i} className="flex flex-col items-start gap-1 p-3 focus:bg-white/10 cursor-pointer">
                    <span className="font-medium">{notif.title}</span>
                    <span className="text-sm text-white/60">{notif.desc}</span>
                    <span className="text-xs text-white/40">{notif.time}</span>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={() => router.push("/ertesitesek")}
                className="justify-center text-[#FF6F61] focus:bg-white/10 focus:text-[#FF6F61] cursor-pointer"
              >
                Összes értesítés megtekintése
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Command Palette (Cmd+K) - TODO: Implement full command palette */}
    </>
  )
}
