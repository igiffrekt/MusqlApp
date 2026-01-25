"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Home,
  Users,
  Calendar,
  CheckSquare,
  CreditCard,
  BarChart3,
  Menu,
  Bell,
  Settings,
  Crown,
  LogOut,
  Smartphone,
  User
} from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Sportsmen", href: "/trainer/students", icon: Users },
  { name: "Sessions", href: "/trainer/sessions", icon: Calendar },
  { name: "Attendance", href: "/trainer/attendance", icon: CheckSquare },
  { name: "Payments", href: "/trainer/payments", icon: CreditCard },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Profile", href: "/settings/notifications", icon: User },
]

const adminNavigation = [
  { name: "Subscription", href: "/admin/subscription", icon: Crown },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

interface MobileNavigationProps {
  className?: string
}

// Pages that have their own custom bottom navigation/action bar
const PAGES_WITH_CUSTOM_NAV = [
  "/fizetes",
  "/idopontok",
  "/taglista",
  "/helyszinek",
  "/csoportok",
  "/tagfelvetel",
  "/penzugy",
  "/profil",
  "/fiok",
  "/segitseg",
]

export function MobileNavigation({ className }: MobileNavigationProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()

  // Check if we're on mobile
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Hide on pages that have their own custom navigation
  const shouldHide = PAGES_WITH_CUSTOM_NAV.some(path => pathname.startsWith(path))

  // Hide for student users - they have their own navigation
  const isStudent = session?.user?.role === "STUDENT"

  if (!isMobile || shouldHide || isStudent) {
    return null
  }

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-2 py-1",
        "safe-area-inset-bottom",
        className
      )}>
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navigation.slice(0, 5).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-[60px]",
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium truncate">{item.name}</span>
              </Link>
            )
          })}

          {/* Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex flex-col items-center justify-center p-2 rounded-lg min-w-[60px] h-auto"
              >
                <Menu className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">More</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-lg max-h-[80vh]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Menu</h3>
                  <NotificationDropdown />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                          isActive
                            ? "bg-blue-50 text-blue-600 border border-blue-200"
                            : "hover:bg-gray-50"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    )
                  })}

                  {adminNavigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                          isActive
                            ? "bg-blue-50 text-blue-600 border border-blue-200"
                            : "hover:bg-gray-50"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    )
                  })}
                </div>

                <div className="border-t pt-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Add padding to body to account for fixed navigation */}
      <style jsx global>{`
        body {
          padding-bottom: 80px;
        }

        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          body {
            padding-bottom: calc(80px + env(safe-area-inset-bottom));
          }
        }
      `}</style>
    </>
  )
}