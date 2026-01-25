"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Bell, AlertCircle, UserPlus, Users, CreditCard } from "lucide-react"
import { useNotificationsStore, type NotificationType } from "@/lib/stores/notifications-store"
import { cn } from "@/lib/utils"
import { MobileNavbar } from "./MobileNavbar"

interface NotificationOption {
  id: NotificationType
  label: string
  description: string
  icon: React.ReactNode
  iconBg: string
}

const NOTIFICATION_OPTIONS: NotificationOption[] = [
  {
    id: "debt",
    label: "Tartozás értesítések",
    description: "Ha valaki státusza megváltozik tartozásra",
    icon: <AlertCircle className="w-5 h-5 text-[#ef4444]" />,
    iconBg: "bg-[#ef4444]/20",
  },
  {
    id: "new_member",
    label: "Új tag értesítések",
    description: "Ha új tag csatlakozik egy csoporthoz",
    icon: <UserPlus className="w-5 h-5 text-[#D2F159]" />,
    iconBg: "bg-[#D2F159]/20",
  },
  {
    id: "new_group",
    label: "Új csoport értesítések",
    description: "Ha új csoport jön létre",
    icon: <Users className="w-5 h-5 text-[#3b82f6]" />,
    iconBg: "bg-[#3b82f6]/20",
  },
  {
    id: "payment",
    label: "Befizetés értesítések",
    description: "Ha valaki befizetést teljesít",
    icon: <CreditCard className="w-5 h-5 text-[#22c55e]" />,
    iconBg: "bg-[#22c55e]/20",
  },
]

export function MobileNotificationSettings() {
  const router = useRouter()
  const settings = useNotificationsStore((state) => state.settings)
  const updateSettings = useNotificationsStore((state) => state.updateSettings)

  const enabledCount = Object.values(settings).filter(Boolean).length
  const allEnabled = enabledCount === NOTIFICATION_OPTIONS.length
  const noneEnabled = enabledCount === 0

  const handleToggle = (id: NotificationType) => {
    updateSettings({ [id]: !settings[id] })
  }

  const handleToggleAll = () => {
    if (allEnabled) {
      // Disable all
      updateSettings({
        debt: false,
        new_member: false,
        new_group: false,
        payment: false,
      })
    } else {
      // Enable all
      updateSettings({
        debt: true,
        new_member: true,
        new_group: true,
        payment: true,
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#171725] font-lufga">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#171725] px-6 pt-14 pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#252a32] border border-white/5"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white text-xl font-semibold">Értesítések beállítása</h1>
        </div>
      </header>

      <div className="px-6 pb-8 space-y-6">
        {/* Toggle All Card */}
        <section className="bg-[#252a32] rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#333842] flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#D2F159]" />
              </div>
              <div>
                <p className="text-white font-medium">Összes értesítés</p>
                <p className="text-white/40 text-sm">
                  {allEnabled
                    ? "Mind bekapcsolva"
                    : noneEnabled
                    ? "Mind kikapcsolva"
                    : `${enabledCount}/${NOTIFICATION_OPTIONS.length} bekapcsolva`}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleAll}
              className={cn(
                "w-14 h-8 rounded-full relative transition-colors",
                allEnabled ? "bg-[#D2F159]" : "bg-[#333842]"
              )}
            >
              <div
                className={cn(
                  "absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform",
                  allEnabled ? "right-1" : "left-1"
                )}
              />
            </button>
          </div>
        </section>

        {/* Individual Options */}
        <section className="bg-[#252a32] rounded-2xl border border-white/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <h2 className="text-white font-semibold">Értesítés típusok</h2>
            <p className="text-white/40 text-sm">Válaszd ki, miről szeretnél értesítést kapni</p>
          </div>

          <div className="divide-y divide-white/5">
            {NOTIFICATION_OPTIONS.map((option) => (
              <div
                key={option.id}
                className="flex items-center justify-between p-5"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      option.iconBg
                    )}
                  >
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{option.label}</p>
                    <p className="text-white/40 text-sm">{option.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(option.id)}
                  className={cn(
                    "w-14 h-8 rounded-full relative transition-colors flex-shrink-0",
                    settings[option.id] ? "bg-[#D2F159]" : "bg-[#333842]"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform",
                      settings[option.id] ? "right-1" : "left-1"
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Info */}
        <div className="bg-[#252a32] rounded-2xl p-4 border border-white/5">
          <p className="text-white/40 text-sm text-center">
            Az értesítések csak akkor jelennek meg, ha a megfelelő típus be van kapcsolva.
          </p>
        </div>
      </div>

      <MobileNavbar />
    </div>
  )
}
