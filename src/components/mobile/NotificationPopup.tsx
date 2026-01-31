"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { useSession } from "next-auth/react"

interface PendingNotification {
  id: string
  title: string
  message: string
  type: string
  createdAt: string
}

export function NotificationPopup() {
  const { data: session, status } = useSession()
  const [notification, setNotification] = useState<PendingNotification | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show for STUDENT role
    if (status === "authenticated" && session?.user?.id && session?.user?.role === "STUDENT") {
      checkForPendingNotifications()
    }
  }, [status, session?.user?.id, session?.user?.role])

  const checkForPendingNotifications = async () => {
    try {
      const response = await fetch("/api/notifications/pending-popup")
      if (response.ok) {
        const data = await response.json()
        if (data.notification) {
          setNotification(data.notification)
          setIsVisible(true)
        }
      }
    } catch (error) {
      console.error("Failed to check for pending notifications:", error)
    }
  }

  const dismissNotification = async () => {
    if (!notification) return

    try {
      await fetch(`/api/notifications/${notification.id}/mark-popup-shown`, {
        method: "POST",
      })
    } catch (error) {
      console.error("Failed to mark notification as shown:", error)
    }

    setIsVisible(false)
    setNotification(null)
  }

  if (!isVisible || !notification) return null

  return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-6">
      <div className="bg-[#252a32] rounded-[24px] w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-[#D2F159] p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#171725] rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5 text-[#D2F159]" />
          </div>
          <div className="flex-1">
            <p className="text-[#171725] text-sm font-medium">Új értesítés</p>
            <p className="text-[#171725]/60 text-xs">
              {new Date(notification.createdAt).toLocaleDateString("hu-HU", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-white text-lg font-semibold mb-2">{notification.title}</h3>
          <p className="text-white/70 text-sm whitespace-pre-wrap">{notification.message}</p>
        </div>

        {/* Action */}
        <div className="px-6 pb-6">
          <button
            onClick={dismissNotification}
            className="w-full bg-[#D2F159] hover:bg-[#c5e44d] text-[#171725] rounded-xl py-3 font-medium transition-colors"
          >
            Rendben
          </button>
        </div>
      </div>
    </div>
  )
}
