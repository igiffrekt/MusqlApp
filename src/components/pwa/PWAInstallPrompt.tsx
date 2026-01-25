"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, X, Smartphone, Zap, Bell, Wifi } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true)
        return
      }

      // Check for iOS
      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      setIsIOS(iOS)

      // iOS detection (they don't support beforeinstallprompt)
      if (iOS && !window.matchMedia('(display-mode: standalone)').matches) {
        // Show iOS install instructions
        setShowPrompt(true)
      }
    }

    checkInstalled()

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()

    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const [recentlyDismissed, setRecentlyDismissed] = useState(false)

  useEffect(() => {
    // Check if dismissed recently (client-side only)
    const dismissedTime = localStorage.getItem('pwa-prompt-dismissed')
    const isRecentlyDismissed = dismissedTime ? (Date.now() - parseInt(dismissedTime)) < 24 * 60 * 60 * 1000 : false
    setRecentlyDismissed(isRecentlyDismissed)
  }, [])

  const handleDismiss = () => {
    setShowPrompt(false)
    // Remember dismissal for 24 hours
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString())
  }

  if (isInstalled || recentlyDismissed || !showPrompt) {
    return null
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 max-w-sm shadow-lg border-2 border-blue-200 bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Install Musql</CardTitle>
              <CardDescription>Get the full app experience</CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4 text-green-500" />
            <span>App-like experience</span>
          </div>
          <div className="flex items-center space-x-2">
            <Wifi className="w-4 h-4 text-blue-500" />
            <span>Offline access</span>
          </div>
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-purple-500" />
            <span>Push notifications</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span>Fast loading</span>
          </div>
        </div>

        {isIOS ? (
          <div className="space-y-2">
            <Badge variant="secondary" className="text-xs">
              iOS Installation
            </Badge>
            <p className="text-sm text-gray-600">
              Tap the share button <span className="font-semibold"></span> and select "Add to Home Screen"
            </p>
          </div>
        ) : (
          <Button onClick={handleInstallClick} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Install App
          </Button>
        )}
      </CardContent>
    </Card>
  )
}