"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

// Network Information API types (not fully typed in TS lib)
interface NetworkInformation extends EventTarget {
  effectiveType?: string
  type?: string
  addEventListener(type: "change", listener: () => void): void
  removeEventListener(type: "change", listener: () => void): void
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation
}

interface NetworkStatusProps {
  showDetails?: boolean
  className?: string
}

export function NetworkStatus({ showDetails = false, className }: NetworkStatusProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [connectionType, setConnectionType] = useState<string>("unknown")
  const [lastOnline, setLastOnline] = useState<Date | null>(null)
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle")

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine)

    // Get connection information if available
    const nav = navigator as NavigatorWithConnection
    if (nav.connection) {
      const connection = nav.connection
      setConnectionType(connection.effectiveType || connection.type || "unknown")

      const handleConnectionChange = () => {
        setConnectionType(connection.effectiveType || connection.type || "unknown")
      }

      connection.addEventListener('change', handleConnectionChange)
    }

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      setLastOnline(new Date())
      triggerSync()
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Listen for sync events from service worker
    const handleSyncStart = () => setSyncStatus("syncing")
    const handleSyncSuccess = () => setSyncStatus("success")
    const handleSyncError = () => setSyncStatus("error")

    window.addEventListener('sync-start', handleSyncStart)
    window.addEventListener('sync-success', handleSyncSuccess)
    window.addEventListener('sync-error', handleSyncError)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('sync-start', handleSyncStart)
      window.removeEventListener('sync-success', handleSyncSuccess)
      window.removeEventListener('sync-error', handleSyncError)
    }
  }, [])

  const triggerSync = async () => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready
        await registration.sync?.register('background-sync-attendance')
        await registration.sync?.register('background-sync-payments')
      } catch (error) {
        console.error('Background sync registration failed:', error)
      }
    }
  }

  const getConnectionQuality = () => {
    if (!isOnline) return "offline"

    switch (connectionType) {
      case "4g":
      case "fast-4g":
        return "excellent"
      case "3g":
        return "good"
      case "2g":
      case "slow-2g":
        return "poor"
      default:
        return "unknown"
    }
  }

  const getConnectionIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4" />

    const quality = getConnectionQuality()
    switch (quality) {
      case "excellent":
        return <Wifi className="w-4 h-4 text-green-500" />
      case "good":
        return <Wifi className="w-4 h-4 text-yellow-500" />
      case "poor":
        return <Wifi className="w-4 h-4 text-red-500" />
      default:
        return <Wifi className="w-4 h-4 text-gray-500" />
    }
  }

  const getSyncIcon = () => {
    switch (syncStatus) {
      case "syncing":
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  if (!showDetails) {
    // Simple status indicator
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        {getConnectionIcon()}
        <span className="text-sm font-medium">
          {isOnline ? "Online" : "Offline"}
        </span>
        {getSyncIcon()}
      </div>
    )
  }

  // Detailed status card
  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getConnectionIcon()}
            <span className="font-medium">
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
          <Badge
            variant={isOnline ? "default" : "destructive"}
            className="text-xs"
          >
            {connectionType.toUpperCase()}
          </Badge>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          {lastOnline && (
            <div className="flex justify-between">
              <span>Last online:</span>
              <span>{lastOnline.toLocaleTimeString()}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Connection:</span>
            <span className={cn(
              "capitalize",
              getConnectionQuality() === "excellent" && "text-green-600",
              getConnectionQuality() === "good" && "text-yellow-600",
              getConnectionQuality() === "poor" && "text-red-600"
            )}>
              {getConnectionQuality()}
            </span>
          </div>

          {syncStatus !== "idle" && (
            <div className="flex justify-between items-center">
              <span>Sync status:</span>
              <div className="flex items-center space-x-1">
                {getSyncIcon()}
                <span className={cn(
                  "text-xs capitalize",
                  syncStatus === "syncing" && "text-blue-600",
                  syncStatus === "success" && "text-green-600",
                  syncStatus === "error" && "text-red-600"
                )}>
                  {syncStatus}
                </span>
              </div>
            </div>
          )}
        </div>

        {!isOnline && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-yellow-800">
              <AlertTriangle className="w-4 h-4" />
              <span>You're offline. Changes will sync when connection returns.</span>
            </div>
          </div>
        )}

        {isOnline && syncStatus === "idle" && (
          <button
            onClick={triggerSync}
            className="mt-3 w-full px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
          >
            Sync Now
          </button>
        )}
      </CardContent>
    </Card>
  )
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      if (wasOffline) {
        // Trigger sync when coming back online
        setWasOffline(false)
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [wasOffline])

  return { isOnline, wasOffline }
}