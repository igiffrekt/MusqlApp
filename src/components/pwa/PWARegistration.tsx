"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

export function PWARegistration() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      // Trigger background sync when coming back online
      if (registration && 'sync' in window.ServiceWorkerRegistration.prototype) {
        registration.sync?.register('background-sync-attendance').catch(console.error)
        registration.sync?.register('background-sync-payments').catch(console.error)
        registration.sync?.register('background-sync-forms').catch(console.error)
      }
    }

    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [registration])

  useEffect(() => {
    // Register service worker in both development and production
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service worker registered:', reg)
          setRegistration(reg)

          // Handle updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // New content is available, show update prompt
                    showUpdatePrompt()
                  } else {
                    // First install, no need to show prompt
                    console.log('[PWA] Service worker installed for first time')
                  }
                }
              })
            }
          })

          // Register periodic sync for cache updates (only works on HTTPS with active SW)
          if ('periodicSync' in reg && reg.active) {
            reg.periodicSync?.register('update-cache', {
              minInterval: 24 * 60 * 60 * 1000 // 24 hours
            }).catch(() => {
              // Periodic sync not supported or not allowed - this is expected in development
              console.log('[PWA] Periodic sync not available (requires HTTPS)')
            })
          }

          // Request notification permission
          if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                toast.success('Notifications enabled! You\'ll receive updates.')
              }
            })
          }
        })
        .catch((error) => {
          console.error('[PWA] Service worker registration failed:', error)
        })
    }
  }, [])

  const showUpdatePrompt = () => {
    const event = new CustomEvent('sw-update-available')
    window.dispatchEvent(event)

    toast("Update Available", {
      description: "A new version is ready. Refresh to update.",
      action: {
        label: "Refresh",
        onClick: () => window.location.reload(),
      },
      duration: 10000,
    })
  }

  // Listen for sync events
  useEffect(() => {
    const handleSyncStart = () => {
      toast.loading("Syncing offline data...", { id: "sync" })
    }

    const handleSyncSuccess = () => {
      toast.success("Offline data synced successfully!", { id: "sync" })
    }

    const handleSyncError = () => {
      toast.error("Sync failed. Will retry automatically.", { id: "sync" })
    }

    window.addEventListener('sync-start', handleSyncStart)
    window.addEventListener('sync-success', handleSyncSuccess)
    window.addEventListener('sync-error', handleSyncError)

    return () => {
      window.removeEventListener('sync-start', handleSyncStart)
      window.removeEventListener('sync-success', handleSyncSuccess)
      window.removeEventListener('sync-error', handleSyncError)
    }
  }, [])

  return null
}

export function useServiceWorker() {
  const updateServiceWorker = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update()
      })
    }
  }

  const unregisterServiceWorker = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister()
        })
      })
    }
  }

  return { updateServiceWorker, unregisterServiceWorker }
}