"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Smartphone,
  Download,
  Wifi,
  WifiOff,
  Database,
  RefreshCw,
  Settings,
  Monitor,
  Cloud,
  CloudOff,
  Zap,
  Shield,
  CheckCircle
} from "lucide-react"
import { NetworkStatus } from "./NetworkStatus"
import { OfflineQueue } from "./OfflineQueue"
import { PWAUpdateManager, usePWAUpdate } from "./PWAUpdateManager"
import { useNetworkStatus } from "./NetworkStatus"

interface PWADashboardProps {
  showCompact?: boolean
}

export function PWADashboard({ showCompact = false }: PWADashboardProps) {
  const [activeTab, setActiveTab] = useState("status")
  const { isOnline } = useNetworkStatus()
  const { updateAvailable, applyUpdate, checkForUpdates } = usePWAUpdate()

  const [storageUsage, setStorageUsage] = useState<{
    used: number
    available: number
    percentage: number
  } | null>(null)

  // Check storage usage
  const checkStorage = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate()
        const used = estimate.usage || 0
        const quota = estimate.quota || 1
        const available = quota - used
        const percentage = (used / quota) * 100

        setStorageUsage({
          used: Math.round(used / 1024 / 1024), // MB
          available: Math.round(available / 1024 / 1024), // MB
          percentage: Math.round(percentage)
        })
      } catch (error) {
        console.error('Storage estimation failed:', error)
      }
    }
  }

  const clearCache = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        )
      }

      // Clear IndexedDB
      const databases = await indexedDB.databases()
      await Promise.all(
        databases.map(db => {
          if (db.name) {
            return new Promise((resolve) => {
              const deleteRequest = indexedDB.deleteDatabase(db.name!)
              deleteRequest.onsuccess = () => resolve(void 0)
              deleteRequest.onerror = () => resolve(void 0)
            })
          }
        })
      )

      alert('Cache cleared successfully!')
      window.location.reload()
    } catch (error) {
      console.error('Failed to clear cache:', error)
      alert('Failed to clear cache')
    }
  }

  const getPWASupport = () => {
    const features = {
      serviceWorker: 'serviceWorker' in navigator,
      pushManager: 'PushManager' in window,
      notification: 'Notification' in window,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      periodicSync: 'serviceWorker' in navigator && 'periodicSync' in window.ServiceWorkerRegistration.prototype,
      indexedDB: 'indexedDB' in window,
      cacheAPI: 'caches' in window,
      manifest: 'manifest' in document.createElement('link'),
      installPrompt: 'onbeforeinstallprompt' in window,
    }

    return features
  }

  const pwaFeatures = getPWASupport()
  const supportedFeatures = Object.values(pwaFeatures).filter(Boolean).length
  const totalFeatures = Object.keys(pwaFeatures).length

  if (showCompact) {
    return (
      <div className="flex items-center space-x-4">
        <NetworkStatus />
        <OfflineQueue showCompact />
        {updateAvailable && (
          <Badge variant="secondary" className="animate-pulse">
            Update Available
          </Badge>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PWA Dashboard</h1>
          <p className="text-gray-600">Monitor your app's offline capabilities and performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <NetworkStatus />
          {updateAvailable && (
            <Badge variant="secondary" className="animate-pulse">
              Update Available
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Status
          </TabsTrigger>
          <TabsTrigger value="offline" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Offline
          </TabsTrigger>
          <TabsTrigger value="updates" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Updates
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Status Tab */}
        <TabsContent value="status" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Network Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Network Status</CardTitle>
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isOnline ? "Online" : "Offline"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isOnline ? "Connected and ready" : "Working offline"}
                </p>
              </CardContent>
            </Card>

            {/* PWA Support */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">PWA Support</CardTitle>
                <Smartphone className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {supportedFeatures}/{totalFeatures}
                </div>
                <Progress value={(supportedFeatures / totalFeatures) * 100} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  PWA features supported
                </p>
              </CardContent>
            </Card>

            {/* Storage Usage */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
                <Database className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                {storageUsage ? (
                  <>
                    <div className="text-2xl font-bold">
                      {storageUsage.percentage}%
                    </div>
                    <Progress value={storageUsage.percentage} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {storageUsage.used}MB used of {storageUsage.available + storageUsage.used}MB
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">—</div>
                    <Button variant="outline" size="sm" onClick={checkStorage} className="mt-2">
                      Check Usage
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Network Status */}
          <NetworkStatus showDetails />

          {/* PWA Feature Support */}
          <Card>
            <CardHeader>
              <CardTitle>PWA Feature Support</CardTitle>
              <CardDescription>
                Browser capabilities for progressive web app features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(pwaFeatures).map(([feature, supported]) => (
                  <div key={feature} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium capitalize">
                      {feature.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <Badge variant={supported ? "default" : "secondary"}>
                      {supported ? "✓" : "✗"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Offline Tab */}
        <TabsContent value="offline" className="space-y-6">
          <OfflineQueue />

          {/* Cache Status */}
          <Card>
            <CardHeader>
              <CardTitle>Cache Management</CardTitle>
              <CardDescription>
                Manage cached data and storage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Cache Storage</h4>
                  <p className="text-sm text-gray-600">
                    Static assets and API responses are cached for offline use
                  </p>
                  <Button variant="outline" size="sm" onClick={clearCache}>
                    Clear All Cache
                  </Button>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">IndexedDB Storage</h4>
                  <p className="text-sm text-gray-600">
                    Form data and offline records are stored locally
                  </p>
                  <Button variant="outline" size="sm" onClick={clearCache}>
                    Clear Local Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Updates Tab */}
        <TabsContent value="updates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>App Updates</CardTitle>
              <CardDescription>
                Keep your app up to date with the latest features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {updateAvailable ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <Zap className="w-5 h-5 text-green-600" />
                    <div>
                      <h4 className="font-medium text-green-900">Update Available</h4>
                      <p className="text-sm text-green-700">
                        A new version of Musql is ready to install.
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={applyUpdate}>
                      <Download className="w-4 h-4 mr-2" />
                      Install Update
                    </Button>
                    <Button variant="outline" onClick={checkForUpdates}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Check Again
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h4 className="font-medium mb-2">You're Up to Date</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Musql is running the latest version.
                  </p>
                  <Button variant="outline" onClick={checkForUpdates}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Check for Updates
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Update History */}
          <Card>
            <CardHeader>
              <CardTitle>Update History</CardTitle>
              <CardDescription>
                Recent updates and improvements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Badge className="bg-green-100 text-green-800 mt-1">Latest</Badge>
                  <div>
                    <h4 className="font-medium">Enhanced PWA Features</h4>
                    <p className="text-sm text-gray-600">
                      Improved offline capabilities, better sync, and enhanced user experience.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Installed: {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>PWA Settings</CardTitle>
              <CardDescription>
                Configure progressive web app behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Cache Strategy</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Network First</div>
                        <div className="text-sm text-gray-600">
                          Try network first, fallback to cache
                        </div>
                      </div>
                      <Badge>Active</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Offline Behavior</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Queue Sync</div>
                        <div className="text-sm text-gray-600">
                          Automatically sync when back online
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Background Sync</div>
                        <div className="text-sm text-gray-600">
                          Sync in background when possible
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Notifications</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Push Notifications</div>
                        <div className="text-sm text-gray-600">
                          Receive updates and reminders
                        </div>
                      </div>
                      <Badge className={Notification.permission === 'granted' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {Notification.permission === 'granted' ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={clearCache}>
                    Clear All Data
                  </Button>
                  <Button variant="outline" onClick={checkStorage}>
                    Refresh Stats
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Update Manager */}
      <PWAUpdateManager />
    </div>
  )
}