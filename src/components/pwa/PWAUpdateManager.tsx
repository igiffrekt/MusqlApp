"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, Download, X, CheckCircle, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface PWAUpdateManagerProps {
  showAsToast?: boolean
  autoUpdate?: boolean
}

export function PWAUpdateManager({ showAsToast = true, autoUpdate = false }: PWAUpdateManagerProps) {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [installing, setInstalling] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if we're running as a PWA
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    const checkForUpdates = async () => {
      try {
        const reg = await navigator.serviceWorker.ready
        setRegistration(reg)

        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (newWorker) {
            setUpdateAvailable(true)

            if (showAsToast) {
              toast("Update Available", {
                description: "A new version of Musql is available.",
                action: {
                  label: "Update",
                  onClick: () => applyUpdate(),
                },
                duration: 10000,
              })
            }

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                if (autoUpdate) {
                  applyUpdate()
                }
              }
            })
          }
        })

        // Manual update check
        if (reg.update) {
          reg.update()
        }
      } catch (error) {
        console.error('Service worker update check failed:', error)
      }
    }

    checkForUpdates()

    // Listen for custom update events
    const handleUpdateEvent = () => {
      setUpdateAvailable(true)
    }

    window.addEventListener('sw-update-available', handleUpdateEvent)

    return () => {
      window.removeEventListener('sw-update-available', handleUpdateEvent)
    }
  }, [showAsToast, autoUpdate])

  const applyUpdate = async () => {
    if (!registration?.waiting) return

    setInstalling(true)

    // Send message to service worker to skip waiting
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })

    // Listen for the controlling change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Reload the page to get the new version
      window.location.reload()
    })

    toast.success("Update installed! Reloading...")
  }

  const dismissUpdate = () => {
    setDismissed(true)
    setUpdateAvailable(false)
  }

  const checkForUpdates = async () => {
    if (registration) {
      try {
        await registration.update()
        toast.info("Checking for updates...")
      } catch (error) {
        toast.error("Failed to check for updates")
      }
    }
  }

  if (!updateAvailable || dismissed) {
    return null
  }

  if (showAsToast) {
    return null // Handled by toast above
  }

  // Show as card component
  return (
    <Card className="fixed bottom-4 right-4 z-50 max-w-sm shadow-lg border-2 border-blue-200 bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Update Available</CardTitle>
              <CardDescription>New features and improvements</CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={dismissUpdate}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          A new version of Musql is ready to install. Update now to get the latest features and improvements.
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            Version {registration?.active?.scriptURL?.split('/').pop()?.split('-')[1] || 'Unknown'}
          </Badge>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={checkForUpdates}
              disabled={installing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${installing ? 'animate-spin' : ''}`} />
              Check Again
            </Button>
            <Button
              size="sm"
              onClick={applyUpdate}
              disabled={installing}
            >
              {installing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Installing...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Update Now
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function PWAUpdateAlert() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    const handleUpdate = () => setUpdateAvailable(true)
    const handleInstalling = () => setInstalling(true)

    window.addEventListener('sw-update-available', handleUpdate)
    window.addEventListener('sw-installing', handleInstalling)

    return () => {
      window.removeEventListener('sw-update-available', handleUpdate)
      window.removeEventListener('sw-installing', handleInstalling)
    }
  }, [])

  const applyUpdate = () => {
    const event = new CustomEvent('apply-update')
    window.dispatchEvent(event)
  }

  if (!updateAvailable) return null

  return (
    <Alert className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>A new version of Musql is available.</span>
        <Button
          size="sm"
          onClick={applyUpdate}
          disabled={installing}
          className="ml-4"
        >
          {installing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Installing...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Update
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  )
}

export function usePWAUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    const init = async () => {
      try {
        const reg = await navigator.serviceWorker.ready
        setRegistration(reg)

        reg.addEventListener('updatefound', () => {
          setUpdateAvailable(true)
        })
      } catch (error) {
        console.error('PWA update initialization failed:', error)
      }
    }

    init()
  }, [])

  const applyUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
  }

  const checkForUpdates = async () => {
    if (registration) {
      await registration.update()
    }
  }

  return {
    updateAvailable,
    applyUpdate,
    checkForUpdates,
    registration
  }
}