"use client"

import { useEffect, useState } from "react"
import { X, Bell, CreditCard, UserPlus, Users, AlertCircle, Info, Check, Loader2 } from "lucide-react"
import { useNotificationsStore, type Notification, type NotificationType } from "@/lib/stores/notifications-store"
import { useMembersStore } from "@/lib/stores/members-store"
import { cn } from "@/lib/utils"

interface MobileNotificationsProps {
  isOpen: boolean
  onClose: () => void
}

interface JoinRequest {
  id: string
  name: string
  email: string
  phone: string | null
  message: string | null
  status: string
  createdAt: string
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "debt":
      return <AlertCircle className="w-5 h-5 text-[#ef4444]" />
    case "new_member":
      return <UserPlus className="w-5 h-5 text-[#D2F159]" />
    case "new_group":
      return <Users className="w-5 h-5 text-[#3b82f6]" />
    case "payment":
      return <CreditCard className="w-5 h-5 text-[#22c55e]" />
    case "join_request":
      return <UserPlus className="w-5 h-5 text-[#FF6F61]" />
    case "info":
      return <Info className="w-5 h-5 text-[#60a5fa]" />
    default:
      return <Bell className="w-5 h-5 text-white" />
  }
}

const getNotificationBgColor = (type: NotificationType) => {
  switch (type) {
    case "debt":
      return "bg-[#ef4444]/20"
    case "new_member":
      return "bg-[#D2F159]/20"
    case "new_group":
      return "bg-[#3b82f6]/20"
    case "payment":
      return "bg-[#22c55e]/20"
    case "join_request":
      return "bg-[#FF6F61]/20"
    case "info":
      return "bg-[#60a5fa]/20"
    default:
      return "bg-[#333842]"
  }
}

const formatTimeAgo = (date: Date) => {
  const now = new Date()
  const timestamp = new Date(date)
  const diff = now.getTime() - timestamp.getTime()

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return "Most"
  if (minutes < 60) return `${minutes} perce`
  if (hours < 24) return `${hours} órája`
  if (days === 1) return "Tegnap"
  return `${days} napja`
}

export function MobileNotifications({ isOpen, onClose }: MobileNotificationsProps) {
  const notifications = useNotificationsStore((state) => state.notifications)
  const markAsRead = useNotificationsStore((state) => state.markAsRead)
  const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead)
  const clearNotification = useNotificationsStore((state) => state.clearNotification)
  const fetchNotifications = useNotificationsStore((state) => state.fetchNotifications)
  const initialized = useNotificationsStore((state) => state.initialized)
  const fetchMembers = useMembersStore((state) => state.fetchMembers)

  // Join request popup state
  const [showJoinRequestPopup, setShowJoinRequestPopup] = useState(false)
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [actionResult, setActionResult] = useState<{ type: "success" | "error"; message: string } | null>(null)

  useEffect(() => {
    if (!initialized) {
      fetchNotifications()
    }
  }, [initialized, fetchNotifications])

  // Refetch when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen, fetchNotifications])

  const unreadCount = notifications.filter((n) => !n.read).length

  const fetchPendingJoinRequests = async () => {
    setLoadingRequests(true)
    setActionResult(null)
    try {
      const response = await fetch("/api/join-requests")
      if (response.ok) {
        const data = await response.json()
        // Filter only pending requests
        const pending = data.filter((r: JoinRequest) => r.status === "PENDING")
        setPendingRequests(pending)
      }
    } catch (error) {
      console.error("Error fetching join requests:", error)
    } finally {
      setLoadingRequests(false)
    }
  }

  const handleJoinRequestAction = async (requestId: string, action: "approve" | "reject") => {
    setProcessingId(requestId)
    setActionResult(null)
    try {
      const response = await fetch(`/api/join-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        setActionResult({
          type: "success",
          message: action === "approve" ? "Kérelem elfogadva!" : "Kérelem elutasítva.",
        })
        // Remove from list
        setPendingRequests((prev) => prev.filter((r) => r.id !== requestId))
        // Refetch notifications
        fetchNotifications()
        // Refresh members list if approved
        if (action === "approve") {
          fetchMembers()
        }
      } else {
        const data = await response.json()
        setActionResult({
          type: "error",
          message: data.message || "Hiba történt",
        })
      }
    } catch (error) {
      console.error("Error processing join request:", error)
      setActionResult({
        type: "error",
        message: "Hálózati hiba",
      })
    } finally {
      setProcessingId(null)
    }
  }

  if (!isOpen) return null

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }

    // If it's a join_request notification, show the popup
    if (notification.type === "join_request") {
      setShowJoinRequestPopup(true)
      await fetchPendingJoinRequests()
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Panel */}
      <div className="absolute top-0 right-0 left-0 bg-[#171725] rounded-b-[32px] max-h-[80vh] overflow-hidden animate-slide-in-bottom">
        {/* Header */}
        <div className="sticky top-0 bg-[#171725] px-6 pt-14 pb-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-white text-xl font-semibold" style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
                Értesítések
              </h2>
              {unreadCount > 0 && (
                <span className="bg-[#D2F159] text-[#171725] text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[#D2F159] text-sm font-medium px-3 py-1"
                  style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                >
                  Összes olvasott
                </button>
              )}
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#252a32] border border-white/5"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-[calc(80vh-100px)]">
          {notifications.length > 0 ? (
            <div className="p-4 space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "relative p-4 rounded-2xl border transition-colors cursor-pointer",
                    notification.read
                      ? "bg-[#252a32] border-white/5"
                      : "bg-[#252a32] border-[#D2F159]/30"
                  )}
                >
                  {/* Unread indicator */}
                  {!notification.read && (
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#D2F159]" />
                  )}

                  <div className="flex gap-3">
                    {/* Icon */}
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                        getNotificationBgColor(notification.type)
                      )}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-white font-medium text-sm" style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
                          {notification.title}
                        </p>
                        <span className="text-white/40 text-xs flex-shrink-0" style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-white/60 text-sm mt-1" style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
                        {notification.message}
                      </p>
                      {notification.type === "join_request" && (
                        <p className="text-[#FF6F61] text-xs mt-2" style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
                          Koppints a kezeléshez →
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      clearNotification(notification.id)
                    }}
                    className="absolute bottom-4 right-4 text-white/40 hover:text-white/60 text-xs"
                    style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                  >
                    Törlés
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-16 h-16 rounded-full bg-[#252a32] flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-white/40" />
              </div>
              <p className="text-white/60 text-center" style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
                Nincsenek értesítések
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Join Request Popup */}
      {showJoinRequestPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowJoinRequestPopup(false)} />
          <div
            className="relative w-full max-w-sm bg-[#252a32] rounded-3xl overflow-hidden"
            style={{ border: "1px solid rgba(255, 255, 255, 0.1)" }}
          >
            {/* Popup Header */}
            <div className="p-6 border-b border-white/5">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-lg font-semibold" style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
                  Csatlakozási kérelmek
                </h3>
                <button
                  onClick={() => setShowJoinRequestPopup(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Popup Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {actionResult && (
                <div
                  className={cn(
                    "mb-4 p-3 rounded-xl text-sm text-center",
                    actionResult.type === "success"
                      ? "bg-[#D2F159]/20 text-[#D2F159]"
                      : "bg-[#ef4444]/20 text-[#ef4444]"
                  )}
                  style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                >
                  {actionResult.message}
                </div>
              )}

              {loadingRequests ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-[#FF6F61] animate-spin" />
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Check className="w-12 h-12 text-[#D2F159] mx-auto mb-3" />
                  <p className="text-white/60" style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
                    Nincs függőben lévő kérelem
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-4 rounded-2xl bg-[#171725] border border-white/5"
                    >
                      <div className="mb-3">
                        <p className="text-white font-semibold" style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
                          {request.name}
                        </p>
                        <p className="text-white/50 text-sm" style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
                          {request.email}
                        </p>
                        {request.phone && (
                          <p className="text-white/50 text-sm" style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
                            {request.phone}
                          </p>
                        )}
                        {request.message && (
                          <p className="text-white/40 text-sm mt-2 italic" style={{ fontFamily: 'Lufga, Inter, sans-serif' }}>
                            &ldquo;{request.message}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleJoinRequestAction(request.id, "reject")}
                          disabled={processingId === request.id}
                          className="flex-1 py-3 px-4 rounded-full border border-[#ef4444]/50 text-[#ef4444] text-sm font-medium disabled:opacity-50 transition-colors hover:bg-[#ef4444]/10"
                          style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                        >
                          {processingId === request.id ? (
                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                          ) : (
                            "Elutasítás"
                          )}
                        </button>
                        <button
                          onClick={() => handleJoinRequestAction(request.id, "approve")}
                          disabled={processingId === request.id}
                          className="flex-1 py-3 px-4 rounded-full bg-[#D2F159] text-[#171725] text-sm font-semibold disabled:opacity-50 transition-colors hover:bg-[#D2F159]/90"
                          style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                        >
                          {processingId === request.id ? (
                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                          ) : (
                            "Elfogadás"
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
