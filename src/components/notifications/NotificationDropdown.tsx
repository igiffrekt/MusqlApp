"use client"

import { useState, useEffect } from "react"
import { Bell, Check, X, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  id: string
  title: string
  message: string
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR"
  read: boolean
  actionUrl?: string
  createdAt: string
}

interface NotificationDropdownProps {
  onNotificationClick?: (notification: Notification) => void
}

export function NotificationDropdown({ onNotificationClick }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications?limit=10")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ read: true }),
      })

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      })

      setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
      // Recalculate unread count
      fetchNotifications()
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }

    onNotificationClick?.(notification)
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "SUCCESS": return "border-green-200 bg-green-50"
      case "WARNING": return "border-yellow-200 bg-yellow-50"
      case "ERROR": return "border-red-200 bg-red-50"
      default: return "border-blue-200 bg-blue-50"
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "SUCCESS": return "✅"
      case "WARNING": return "⚠️"
      case "ERROR": return "❌"
      default: return "ℹ️"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} unread</Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <ScrollArea className="h-80">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm text-muted-foreground">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    getNotificationColor(notification.type)
                  } ${!notification.read ? "ring-1 ring-blue-300" : ""}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                        <h4 className="text-sm font-medium truncate">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                        {notification.actionUrl && (
                          <ExternalLink className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsRead(notification.id)
                          }}
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => window.location.href = "/dashboard/notifications"}
              >
                View All Notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}