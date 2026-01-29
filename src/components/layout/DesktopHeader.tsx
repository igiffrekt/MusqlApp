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
  Calendar,
  Users,
  CreditCard,
  ChevronRight,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

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
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(false)
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
    { label: "Új edzés", icon: Calendar, action: () => router.push("/trainer/sessions"), color: "#D2F159" },
    { label: "Új tag", icon: Users, action: () => router.push("/tagfelvetel"), color: "#1ad598" },
    { label: "Fizetés rögzítése", icon: CreditCard, action: () => router.push("/trainer/payments"), color: "#f59e0b" },
  ]

  // Mock notifications
  const notifications = [
    { id: 1, title: "Új tag csatlakozott", desc: "Kiss Péter csatlakozott a csoporthoz", time: "5 perce" },
    { id: 2, title: "Fizetés beérkezett", desc: "10.000 Ft befizetés rögzítve", time: "1 órája" },
    { id: 3, title: "Edzés emlékeztető", desc: "Holnap 10:00-kor kezdődik az edzés", time: "2 órája" },
  ]

  return (
    <header className="fixed top-0 right-0 left-[280px] h-20 bg-[#252a32]/80 backdrop-blur-xl border-b border-white/5 z-30 flex items-center justify-between px-8 font-lufga">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2">
        <button
          onClick={() => router.push("/")}
          className="text-white/50 hover:text-white transition-colors text-sm"
        >
          Főoldal
        </button>
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.path} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-white/20" />
            {index === breadcrumbs.length - 1 ? (
              <span className="text-white font-medium text-sm">{crumb.label}</span>
            ) : (
              <button
                onClick={() => router.push(crumb.path)}
                className="text-white/50 hover:text-white transition-colors text-sm"
              >
                {crumb.label}
              </button>
            )}
          </div>
        ))}
      </nav>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <AnimatePresence>
            {searchOpen ? (
              <motion.div
                initial={{ width: 44, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 44, opacity: 0 }}
                className="relative"
              >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Keresés..."
                  className="w-full pl-11 pr-11 h-11 bg-[#333842] border border-white/10 text-white placeholder:text-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#D2F159]/50 focus:border-[#D2F159]/50 text-sm"
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="w-11 h-11 flex items-center justify-center text-white/50 hover:text-white hover:bg-[#333842] rounded-2xl transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Actions - Admin only */}
        {isAdmin && (
          <div className="relative">
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="h-11 px-5 bg-[#D2F159] text-[#171725] font-semibold rounded-2xl hover:bg-[#c5e44e] transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Új</span>
            </button>

            <AnimatePresence>
              {showQuickActions && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowQuickActions(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-[#333842] border border-white/10 rounded-2xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="p-2">
                      <p className="text-white/40 text-xs font-medium px-3 py-2">Gyors műveletek</p>
                      {quickActions.map((action) => (
                        <button
                          key={action.label}
                          onClick={() => {
                            action.action()
                            setShowQuickActions(false)
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
                        >
                          <div 
                            className="w-8 h-8 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${action.color}20` }}
                          >
                            <action.icon className="h-4 w-4" style={{ color: action.color }} />
                          </div>
                          <span className="text-white text-sm font-medium">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative w-11 h-11 flex items-center justify-center text-white/50 hover:text-white hover:bg-[#333842] rounded-2xl transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 bg-[#ea3a3d] text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
              3
            </span>
          </button>

          <AnimatePresence>
            {showNotifDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNotifDropdown(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-[#333842] border border-white/10 rounded-2xl shadow-xl overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <span className="text-white font-semibold">Értesítések</span>
                    <Badge className="bg-[#ea3a3d]/20 text-[#ea3a3d] border-0 hover:bg-[#ea3a3d]/30">
                      3 új
                    </Badge>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.map((notif) => (
                      <button
                        key={notif.id}
                        className="w-full flex flex-col items-start gap-1 p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                      >
                        <span className="font-medium text-sm text-white">{notif.title}</span>
                        <span className="text-xs text-white/50">{notif.desc}</span>
                        <span className="text-xs text-white/30">{notif.time}</span>
                      </button>
                    ))}
                  </div>
                  <div className="p-3 border-t border-white/5">
                    <button
                      onClick={() => {
                        router.push("/ertesitesek")
                        setShowNotifDropdown(false)
                      }}
                      className="w-full py-2 text-center text-[#D2F159] text-sm font-medium hover:bg-white/5 rounded-xl transition-colors"
                    >
                      Összes értesítés
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
