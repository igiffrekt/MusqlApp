"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Database,
  Upload
} from "lucide-react"
import { useNetworkStatus } from "./NetworkStatus"
import { toast } from "sonner"

interface OfflineQueueProps {
  showCompact?: boolean
}

interface StoredAttendanceRecord {
  id: string
  sessionId: string
  studentId: string
  status: string
  timestamp: number
  synced: boolean
}

interface StoredPaymentRecord {
  id: string
  studentId: string
  amount: number
  paymentType: string
  paymentMethod: string
  notes?: string
  timestamp: number
  synced: boolean
}

interface StoredFormRecord {
  id: string
  data: Record<string, unknown>
  endpoint: string
  timestamp: number
  synced: boolean
}

interface QueueItem {
  id: string
  type: 'attendance' | 'payment' | 'form'
  data: StoredAttendanceRecord | StoredPaymentRecord | Record<string, unknown>
  timestamp: number
  endpoint: string
  status: 'pending' | 'syncing' | 'synced' | 'failed'
  retries: number
}

export function OfflineQueue({ showCompact = false }: OfflineQueueProps) {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [syncing, setSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const { isOnline, wasOffline } = useNetworkStatus()

  useEffect(() => {
    loadQueueFromStorage()

    // Listen for sync events
    const handleSyncStart = () => setSyncing(true)
    const handleSyncComplete = () => {
      setSyncing(false)
      setSyncProgress(0)
      loadQueueFromStorage()
    }

    window.addEventListener('sync-start', handleSyncStart)
    window.addEventListener('sync-success', handleSyncComplete)
    window.addEventListener('sync-error', handleSyncComplete)

    // Auto-sync when coming back online
    if (isOnline && wasOffline) {
      handleSync()
    }

    return () => {
      window.removeEventListener('sync-start', handleSyncStart)
      window.removeEventListener('sync-success', handleSyncComplete)
      window.removeEventListener('sync-error', handleSyncComplete)
    }
  }, [isOnline, wasOffline])

  const loadQueueFromStorage = async () => {
    try {
      const attendanceData = await getStoredAttendanceData()
      const paymentData = await getStoredPaymentData()
      const formData = await getStoredFormData()

      const queueItems: QueueItem[] = [
        ...attendanceData.map(item => ({
          id: item.id,
          type: 'attendance' as const,
          data: item,
          timestamp: item.timestamp,
          endpoint: '/api/attendance/offline',
          status: (item.synced ? 'synced' : 'pending') as QueueItem['status'],
          retries: 0
        })),
        ...paymentData.map(item => ({
          id: item.id,
          type: 'payment' as const,
          data: item,
          timestamp: item.timestamp,
          endpoint: '/api/payments/offline',
          status: (item.synced ? 'synced' : 'pending') as QueueItem['status'],
          retries: 0
        })),
        ...formData.map(item => ({
          id: item.id,
          type: 'form' as const,
          data: item.data,
          timestamp: item.timestamp,
          endpoint: item.endpoint,
          status: (item.synced ? 'synced' : 'pending') as QueueItem['status'],
          retries: 0
        }))
      ]

      // Sort by timestamp, newest first
      queueItems.sort((a, b) => b.timestamp - a.timestamp)
      setQueue(queueItems)
    } catch (error) {
      console.error('Failed to load offline queue:', error)
    }
  }

  const handleSync = async () => {
    if (!isOnline || syncing) return

    setSyncing(true)
    setSyncProgress(0)

    try {
      const pendingItems = queue.filter(item => item.status === 'pending')

      for (let i = 0; i < pendingItems.length; i++) {
        const item = pendingItems[i]

        try {
          setQueue(prev => prev.map(q =>
            q.id === item.id ? { ...q, status: 'syncing' } : q
          ))

          const response = await fetch(item.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.data)
          })

          if (response.ok) {
            setQueue(prev => prev.map(q =>
              q.id === item.id ? { ...q, status: 'synced' } : q
            ))
            toast.success(`${item.type} synced successfully`)
          } else {
            throw new Error(`Sync failed: ${response.status}`)
          }
        } catch (error) {
          console.error(`Failed to sync ${item.type}:`, error)
          setQueue(prev => prev.map(q =>
            q.id === item.id ? { ...q, status: 'failed', retries: q.retries + 1 } : q
          ))
        }

        setSyncProgress(((i + 1) / pendingItems.length) * 100)
      }

      // Clean up synced items from storage
      await clearSyncedData()

      toast.success("Sync completed!")
    } catch (error) {
      console.error('Sync failed:', error)
      toast.error("Sync failed. Please try again.")
    } finally {
      setSyncing(false)
      setSyncProgress(0)
    }
  }

  const clearSyncedData = async () => {
    try {
      // Clear synced items from IndexedDB
      const syncedIds = queue
        .filter(item => item.status === 'synced')
        .map(item => item.id)

      await Promise.all([
        clearSyncedAttendanceData(),
        clearSyncedPaymentData(),
        clearSyncedFormData()
      ])

      // Remove from queue
      setQueue(prev => prev.filter(item => !syncedIds.includes(item.id)))
    } catch (error) {
      console.error('Failed to clear synced data:', error)
    }
  }

  const getStatusIcon = (status: QueueItem['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'syncing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
      case 'synced':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: QueueItem['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'syncing':
        return 'bg-blue-100 text-blue-800'
      case 'synced':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const pendingCount = queue.filter(item => item.status === 'pending').length
  const failedCount = queue.filter(item => item.status === 'failed').length

  if (showCompact) {
    return (
      <div className="flex items-center space-x-2">
        {!isOnline && (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}
        {pendingCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {pendingCount} pending
          </Badge>
        )}
        {syncing && (
          <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
        )}
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <CardTitle className="text-lg">Offline Queue</CardTitle>
            {pendingCount > 0 && (
              <Badge variant="secondary">
                {pendingCount} pending
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
          </div>
        </div>
        <CardDescription>
          Data waiting to sync when online
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!isOnline && (
          <Alert>
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              You're currently offline. Changes will sync automatically when connection returns.
            </AlertDescription>
          </Alert>
        )}

        {syncing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Syncing data...</span>
              <span>{Math.round(syncProgress)}%</span>
            </div>
            <Progress value={syncProgress} />
          </div>
        )}

        {queue.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <p>All data is synced!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {queue.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(item.status)}
                  <div>
                    <div className="font-medium capitalize">{item.type}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(item.status)}>
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {pendingCount > 0 && isOnline && (
          <Button
            onClick={handleSync}
            disabled={syncing}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            {syncing ? 'Syncing...' : `Sync ${pendingCount} items`}
          </Button>
        )}

        {failedCount > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {failedCount} items failed to sync. They will retry automatically or you can try again.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

// Helper functions for IndexedDB operations
async function getStoredAttendanceData(): Promise<StoredAttendanceRecord[]> {
  return new Promise((resolve) => {
    const request = indexedDB.open('musql-offline', 1)
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      const transaction = db.transaction(['attendance'], 'readonly')
      const store = transaction.objectStore('attendance')
      const getRequest = store.getAll()

      getRequest.onsuccess = () => resolve(getRequest.result || [])
      getRequest.onerror = () => resolve([])
    }
    request.onerror = () => resolve([])
  })
}

async function getStoredPaymentData(): Promise<StoredPaymentRecord[]> {
  return new Promise((resolve) => {
    const request = indexedDB.open('musql-offline', 1)
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      const transaction = db.transaction(['payments'], 'readonly')
      const store = transaction.objectStore('payments')
      const getRequest = store.getAll()

      getRequest.onsuccess = () => resolve(getRequest.result || [])
      getRequest.onerror = () => resolve([])
    }
    request.onerror = () => resolve([])
  })
}

async function getStoredFormData(): Promise<StoredFormRecord[]> {
  return new Promise((resolve) => {
    const request = indexedDB.open('musql-offline', 1)
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      const transaction = db.transaction(['forms'], 'readonly')
      const store = transaction.objectStore('forms')
      const getRequest = store.getAll()

      getRequest.onsuccess = () => resolve(getRequest.result || [])
      getRequest.onerror = () => resolve([])
    }
    request.onerror = () => resolve([])
  })
}

async function clearSyncedAttendanceData() {
  return new Promise((resolve) => {
    const request = indexedDB.open('musql-offline', 1)
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      const transaction = db.transaction(['attendance'], 'readwrite')
      const store = transaction.objectStore('attendance')
      const index = store.index('synced')
      const cursorRequest = index.openCursor(IDBKeyRange.only(true))

      cursorRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve(void 0)
        }
      }
      cursorRequest.onerror = () => resolve(void 0)
    }
    request.onerror = () => resolve(void 0)
  })
}

async function clearSyncedPaymentData() {
  return new Promise((resolve) => {
    const request = indexedDB.open('musql-offline', 1)
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      const transaction = db.transaction(['payments'], 'readwrite')
      const store = transaction.objectStore('payments')
      const index = store.index('synced')
      const cursorRequest = index.openCursor(IDBKeyRange.only(true))

      cursorRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve(void 0)
        }
      }
      cursorRequest.onerror = () => resolve(void 0)
    }
    request.onerror = () => resolve(void 0)
  })
}

async function clearSyncedFormData() {
  return new Promise((resolve) => {
    const request = indexedDB.open('musql-offline', 1)
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      const transaction = db.transaction(['forms'], 'readwrite')
      const store = transaction.objectStore('forms')
      const index = store.index('synced')
      const cursorRequest = index.openCursor(IDBKeyRange.only(true))

      cursorRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve(void 0)
        }
      }
      cursorRequest.onerror = () => resolve(void 0)
    }
    request.onerror = () => resolve(void 0)
  })
}