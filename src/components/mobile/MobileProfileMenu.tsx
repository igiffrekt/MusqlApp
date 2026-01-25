"use client"

import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { User, Settings, HelpCircle, Info, X, ChevronRight, Bell, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileProfileMenuProps {
  isOpen: boolean
  onClose: () => void
  onShowInfo: () => void
  userName: string
  userEmail: string
}

const menuItems = [
  {
    id: "profil",
    label: "Profil",
    description: "Személyes adatok szerkesztése",
    icon: User,
    href: "/profil",
  },
  {
    id: "fiok",
    label: "Fiók",
    description: "Fiók és előfizetés kezelése",
    icon: Settings,
    href: "/fiok",
  },
  {
    id: "ertesitesek",
    label: "Értesítések",
    description: "Értesítési beállítások kezelése",
    icon: Bell,
    href: "/ertesitesek",
  },
  {
    id: "segitseg",
    label: "Segítség",
    description: "Támogatás és kapcsolat",
    icon: HelpCircle,
    href: "/segitseg",
  },
  {
    id: "informacio",
    label: "Információ",
    description: "Az alkalmazásról",
    icon: Info,
    href: null, // Opens modal instead
  },
  {
    id: "kijelentkezes",
    label: "Kijelentkezés",
    description: "Kilépés a fiókból",
    icon: LogOut,
    href: null, // Handles signOut
  },
]

export function MobileProfileMenu({
  isOpen,
  onClose,
  onShowInfo,
  userName,
  userEmail,
}: MobileProfileMenuProps) {
  const router = useRouter()

  if (!isOpen) return null

  const handleItemClick = async (item: typeof menuItems[0]) => {
    if (item.href) {
      router.push(item.href)
      onClose()
    } else if (item.id === "informacio") {
      onShowInfo()
      onClose()
    } else if (item.id === "kijelentkezes") {
      onClose()
      await signOut({ redirect: true, callbackUrl: `${window.location.origin}/auth/signin` })
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div className="absolute top-0 left-0 right-0 max-h-[90vh] overflow-y-auto bg-[#171725] rounded-b-[32px] animate-slide-in-bottom">
        {/* Header */}
        <div className="px-6 pt-10 pb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-xl font-semibold">Menü</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#252a32] border border-white/5"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* User Info */}
          <div className="bg-[#252a32] rounded-2xl p-4 border border-white/5 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#D2F159] flex items-center justify-center">
                <span className="text-[#171725] text-lg font-bold">
                  {userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-lg">{userName}</p>
                <p className="text-white/60 text-sm">{userEmail}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-2">
            {menuItems.map((item) => {
              const isLogout = item.id === "kijelentkezes"
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl border transition-colors",
                    isLogout
                      ? "bg-[#ea3a3d]/10 border-[#ea3a3d]/20 hover:bg-[#ea3a3d]/20"
                      : "bg-[#252a32] border-white/5 hover:bg-[#333842]"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      isLogout ? "bg-[#ea3a3d]/20" : "bg-[#333842]"
                    )}>
                      <item.icon className={cn(
                        "w-6 h-6",
                        isLogout ? "text-[#ea3a3d]" : "text-[#D2F159]"
                      )} />
                    </div>
                    <div className="text-left">
                      <p className={cn(
                        "font-medium",
                        isLogout ? "text-[#ea3a3d]" : "text-white"
                      )}>{item.label}</p>
                      <p className="text-white/40 text-sm">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className={cn(
                    "w-5 h-5",
                    isLogout ? "text-[#ea3a3d]/40" : "text-white/40"
                  )} />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

interface AppInfoModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AppInfoModal({ isOpen, onClose }: AppInfoModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#252a32] rounded-[24px] w-full max-w-sm p-6 animate-slide-in-bottom">
        {/* App Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-[#D2F159] flex items-center justify-center">
            <span className="text-[#171725] text-3xl font-black">M</span>
          </div>
        </div>

        {/* App Info */}
        <div className="text-center mb-6">
          <h2 className="text-white text-2xl font-bold mb-1">Musql</h2>
          <p className="text-white/60 text-sm">Edzésmenedzsment rendszer</p>
        </div>

        {/* Details */}
        <div className="bg-[#171725] rounded-xl p-4 mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm">Verzió</span>
            <span className="text-white text-sm font-medium">1.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm">Build</span>
            <span className="text-white text-sm font-medium">2026.01.13</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm">Platform</span>
            <span className="text-white text-sm font-medium">PWA</span>
          </div>
        </div>

        {/* Developer */}
        <div className="text-center mb-6">
          <p className="text-white/40 text-xs">Fejlesztette</p>
          <p className="text-white/60 text-sm">Stickerey Development</p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-4 rounded-full bg-[#D2F159] text-[#171725] font-semibold text-base"
        >
          Bezárás
        </button>
      </div>
    </div>
  )
}
