"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, CalendarDays, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", icon: Home, label: "Főoldal" },
  { href: "/taglista", icon: Users, label: "Tagok" },
  { href: "/idopontok", icon: CalendarDays, label: "Időpontok" },
  { href: "/penzugy", icon: Wallet, label: "Pénzügy" },
]

export function MobileNavbar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[56px] bg-[#171725] border-t border-[#828282] px-11 py-3 z-50">
      <div className="flex items-center justify-between">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="flex flex-col items-center">
            <item.icon
              className={cn(
                "w-6 h-6",
                isActive(item.href) ? "text-[#D0EF58]" : "text-[#D8DDE8]/25"
              )}
            />
          </Link>
        ))}
      </div>
    </nav>
  )
}
