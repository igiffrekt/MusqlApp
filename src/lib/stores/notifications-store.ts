import { create } from "zustand"
import { persist } from "zustand/middleware"

export type NotificationType = "debt" | "new_member" | "new_group" | "payment" | "join_request" | "info"

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  data?: {
    memberId?: string
    memberName?: string
    groupId?: string
    groupName?: string
    amount?: number
  }
}

export interface NotificationSettings {
  debt: boolean // Status changes to tartozás
  new_member: boolean // New member added
  new_group: boolean // New group created
  payment: boolean // Payment made
  join_request: boolean // New join request
  info: boolean // General info
}

interface NotificationsState {
  notifications: Notification[]
  settings: NotificationSettings
  initialized: boolean
  loading: boolean
  error: string | null
  currentUserId: string | null // Track which user's notifications we have

  // Actions
  fetchNotifications: (userId?: string) => Promise<void>
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  clearNotification: (id: string) => Promise<void>
  clearAllNotifications: () => void
  updateSettings: (settings: Partial<NotificationSettings>) => void
  getUnreadCount: () => number
  reset: () => void // Reset store for user switch
}

const generateId = () => `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: [],
      settings: {
        debt: true,
        new_member: true,
        new_group: true,
        payment: true,
        join_request: true,
        info: true,
      },
      initialized: false,
      loading: false,
      error: null,
      currentUserId: null,

      fetchNotifications: async (userId?: string) => {
        const state = get()

        // If userId provided and different from current, reset first
        if (userId && state.currentUserId && userId !== state.currentUserId) {
          set({ notifications: [], initialized: false, currentUserId: null })
        }

        set({ loading: true, error: null })
        try {
          const response = await fetch("/api/notifications")
          if (!response.ok) {
            if (response.status === 401) {
              // Not authenticated, clear notifications
              set({ notifications: [], initialized: true, loading: false, currentUserId: null })
              return
            }
            throw new Error("Failed to fetch notifications")
          }
          const data = await response.json()

          // Transform API response to match store format
          const notifications: Notification[] = data.notifications.map((n: {
            id: string
            type: string
            title: string
            message: string
            createdAt: string
            read: boolean
            actionUrl?: string
          }) => {
            // Detect join_request notifications by actionUrl
            let frontendType: NotificationType = n.type.toLowerCase() as NotificationType
            if (n.actionUrl?.includes("join-requests")) {
              frontendType = "join_request"
            }

            return {
              id: n.id,
              type: frontendType,
              title: n.title,
              message: n.message,
              timestamp: new Date(n.createdAt),
              read: n.read,
              actionUrl: n.actionUrl,
            }
          })

          set({ notifications, initialized: true, loading: false, currentUserId: userId || null })
        } catch (error) {
          console.error("Failed to fetch notifications:", error)
          set({ error: "Nem sikerült betölteni az értesítéseket", loading: false })
        }
      },

      reset: () => {
        set({ notifications: [], initialized: false, currentUserId: null, loading: false, error: null })
      },

      addNotification: (notification) => {
        const settings = get().settings

        // Check if this notification type is enabled
        if (!settings[notification.type]) return

        const newNotification: Notification = {
          ...notification,
          id: generateId(),
          timestamp: new Date(),
          read: false,
        }

        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep last 50
        }))
      },

      markAsRead: async (id) => {
        // Optimistic update
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }))

        // Sync with server
        try {
          await fetch(`/api/notifications/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ read: true }),
          })
        } catch (error) {
          console.error("Failed to mark notification as read:", error)
        }
      },

      markAllAsRead: async () => {
        const { notifications } = get()
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id)

        // Optimistic update
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }))

        // Sync with server
        try {
          await Promise.all(
            unreadIds.map(id =>
              fetch(`/api/notifications/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ read: true }),
              })
            )
          )
        } catch (error) {
          console.error("Failed to mark all notifications as read:", error)
        }
      },

      clearNotification: async (id) => {
        // Optimistic update
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))

        // Sync with server
        try {
          await fetch(`/api/notifications/${id}`, {
            method: "DELETE",
          })
        } catch (error) {
          console.error("Failed to delete notification:", error)
        }
      },

      clearAllNotifications: () => {
        set({ notifications: [] })
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }))
      },

      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.read).length
      },
    }),
    {
      name: "musql-notifications-storage",
      partialize: (state) => ({
        settings: state.settings,
      }),
    }
  )
)
