"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCog,
  CreditCard,
  Crown,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "next-auth/react"

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/organizations", icon: Building2, label: "Organizations" },
  { href: "/admin/coaches", icon: UserCog, label: "Coaches" },
  { href: "/admin/members", icon: Users, label: "Members" },
  { href: "/admin/payments", icon: CreditCard, label: "Payments" },
  { href: "/admin/subscriptions", icon: Crown, label: "Subscriptions" },
  { href: "/admin/tiers", icon: Settings, label: "Tiers" },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/admin")
      return
    }

    // Check if user is SUPER_ADMIN
    if (session.user?.role !== "SUPER_ADMIN") {
      router.push("/auth/admin")
      return
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D2F159] animate-spin" />
      </div>
    )
  }

  if (!session || session.user?.role !== "SUPER_ADMIN") {
    return (
      <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-white/60">You don't have permission to access this area.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f14] flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#171725] border-r border-white/10 transform transition-transform duration-200 ease-in-out lg:transform-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#D2F159] flex items-center justify-center">
                <Crown className="w-5 h-5 text-[#171725]" />
              </div>
              <span className="text-white font-bold text-lg">Musql Admin</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/admin" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    isActive
                      ? "bg-[#D2F159] text-[#171725]"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-9 h-9 rounded-full bg-[#D2F159]/20 flex items-center justify-center">
                <span className="text-[#D2F159] font-semibold text-sm">
                  {session.user?.name?.[0]?.toUpperCase() || "A"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {session.user?.name || "Admin"}
                </p>
                <p className="text-white/50 text-xs truncate">
                  {session.user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/onboarding" })}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 bg-[#171725] border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-white/60 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Breadcrumb */}
          <div className="hidden lg:flex items-center gap-2 text-sm">
            <span className="text-white/40">Admin</span>
            {pathname !== "/admin" && (
              <>
                <ChevronRight className="w-4 h-4 text-white/40" />
                <span className="text-white capitalize">
                  {pathname.split("/").pop()?.replace(/-/g, " ")}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Back to App →
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
