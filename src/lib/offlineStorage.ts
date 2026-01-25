// Offline data storage utilities for PWA functionality

const DB_NAME = 'musql-offline'
const DB_VERSION = 1

interface OfflineAttendanceRecord {
  id: string
  sessionId: string
  studentId: string
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
  timestamp: number
  synced: boolean
}

interface OfflinePaymentRecord {
  id: string
  studentId: string
  amount: number
  paymentType: string
  paymentMethod: string
  notes?: string
  timestamp: number
  synced: boolean
}

interface OfflineFormRecord {
  id: string
  data: Record<string, unknown>
  endpoint: string
  timestamp: number
  synced: boolean
}

interface CacheEntry {
  key: string
  data: unknown
  timestamp: number
  ttl: number
}

class OfflineStorage {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create attendance store
        if (!db.objectStoreNames.contains('attendance')) {
          const attendanceStore = db.createObjectStore('attendance', { keyPath: 'id' })
          attendanceStore.createIndex('synced', 'synced', { unique: false })
          attendanceStore.createIndex('sessionId', 'sessionId', { unique: false })
        }

        // Create payments store
        if (!db.objectStoreNames.contains('payments')) {
          const paymentStore = db.createObjectStore('payments', { keyPath: 'id' })
          paymentStore.createIndex('synced', 'synced', { unique: false })
          paymentStore.createIndex('studentId', 'studentId', { unique: false })
        }

        // Create cache store for API responses
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' })
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false })
        }

        // Create forms store for offline form submissions
        if (!db.objectStoreNames.contains('forms')) {
          const formsStore = db.createObjectStore('forms', { keyPath: 'id' })
          formsStore.createIndex('synced', 'synced', { unique: false })
          formsStore.createIndex('endpoint', 'endpoint', { unique: false })
        }
      }
    })
  }

  // Attendance methods
  async saveAttendanceRecord(record: OfflineAttendanceRecord): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['attendance'], 'readwrite')
      const store = transaction.objectStore('attendance')
      const request = store.put(record)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getUnsyncedAttendance(): Promise<OfflineAttendanceRecord[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['attendance'], 'readonly')
      const store = transaction.objectStore('attendance')
      const index = store.index('synced')
      const request = index.getAll(IDBKeyRange.only(false))

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async markAttendanceSynced(ids: string[]): Promise<void> {
    if (!this.db) await this.init()

    const promises = ids.map(id => {
      return new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction(['attendance'], 'readwrite')
        const store = transaction.objectStore('attendance')
        const getRequest = store.get(id)

        getRequest.onerror = () => reject(getRequest.error)
        getRequest.onsuccess = () => {
          const record = getRequest.result
          if (record) {
            record.synced = true
            const putRequest = store.put(record)
            putRequest.onerror = () => reject(putRequest.error)
            putRequest.onsuccess = () => resolve()
          } else {
            resolve()
          }
        }
      })
    })

    await Promise.all(promises)
  }

  // Payment methods
  async savePaymentRecord(record: OfflinePaymentRecord): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['payments'], 'readwrite')
      const store = transaction.objectStore('payments')
      const request = store.put(record)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  // Form methods
  async saveFormSubmission(data: Record<string, unknown>, endpoint: string): Promise<void> {
    if (!this.db) await this.init()

    const record: OfflineFormRecord = {
      id: `form-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      data,
      endpoint,
      timestamp: Date.now(),
      synced: false
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['forms'], 'readwrite')
      const store = transaction.objectStore('forms')
      const request = store.put(record)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getUnsyncedForms(): Promise<OfflineFormRecord[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['forms'], 'readonly')
      const store = transaction.objectStore('forms')
      const index = store.index('synced')
      const request = index.getAll(IDBKeyRange.only(false))

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async markFormsSynced(ids: string[]): Promise<void> {
    if (!this.db) await this.init()

    const promises = ids.map(id => {
      return new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction(['forms'], 'readwrite')
        const store = transaction.objectStore('forms')
        const getRequest = store.get(id)

        getRequest.onsuccess = () => {
          const record = getRequest.result
          if (record) {
            record.synced = true
            store.put(record)
          }
          resolve()
        }
        getRequest.onerror = () => reject(getRequest.error)
      })
    })

    await Promise.all(promises)
  }

  async getUnsyncedPayments(): Promise<OfflinePaymentRecord[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['payments'], 'readonly')
      const store = transaction.objectStore('payments')
      const index = store.index('synced')
      const request = index.getAll(IDBKeyRange.only(false))

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async markPaymentsSynced(ids: string[]): Promise<void> {
    if (!this.db) await this.init()

    const promises = ids.map(id => {
      return new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction(['payments'], 'readwrite')
        const store = transaction.objectStore('payments')
        const getRequest = store.get(id)

        getRequest.onerror = () => reject(getRequest.error)
        getRequest.onsuccess = () => {
          const record = getRequest.result
          if (record) {
            record.synced = true
            const putRequest = store.put(record)
            putRequest.onerror = () => reject(putRequest.error)
            putRequest.onsuccess = () => resolve()
          } else {
            resolve()
          }
        }
      })
    })

    await Promise.all(promises)
  }

  // Cache methods for API responses
  async cacheApiResponse(key: string, data: unknown, ttl: number = 3600000): Promise<void> {
    if (!this.db) await this.init()

    const cacheEntry: CacheEntry = {
      key,
      data,
      timestamp: Date.now(),
      ttl
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')
      const request = store.put(cacheEntry)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getCachedApiResponse<T = unknown>(key: string): Promise<T | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly')
      const store = transaction.objectStore('cache')
      const request = store.get(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const entry = request.result as CacheEntry | undefined
        if (entry && (Date.now() - entry.timestamp) < entry.ttl) {
          resolve(entry.data as T)
        } else {
          // Remove expired entry
          if (entry) {
            const deleteTransaction = this.db!.transaction(['cache'], 'readwrite')
            const deleteStore = deleteTransaction.objectStore('cache')
            deleteStore.delete(key)
          }
          resolve(null)
        }
      }
    })
  }

  // Clear all data
  async clearAll(): Promise<void> {
    if (!this.db) await this.init()

    const promises = ['attendance', 'payments', 'cache'].map(storeName => {
      return new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite')
        const store = transaction.objectStore(storeName)
        const request = store.clear()

        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
      })
    })

    await Promise.all(promises)
  }
}

// Singleton instance
export const offlineStorage = new OfflineStorage()

// Utility functions for offline data handling
export const saveAttendanceOffline = async (
  sessionId: string,
  studentId: string,
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
): Promise<void> => {
  const record: OfflineAttendanceRecord = {
    id: `${sessionId}-${studentId}-${Date.now()}`,
    sessionId,
    studentId,
    status,
    timestamp: Date.now(),
    synced: false
  }

  await offlineStorage.saveAttendanceRecord(record)
}

export const savePaymentOffline = async (
  studentId: string,
  amount: number,
  paymentType: string,
  paymentMethod: string,
  notes?: string
): Promise<void> => {
  const record: OfflinePaymentRecord = {
    id: `payment-${Date.now()}`,
    studentId,
    amount,
    paymentType,
    paymentMethod,
    notes,
    timestamp: Date.now(),
    synced: false
  }

  await offlineStorage.savePaymentRecord(record)
}

export const syncOfflineData = async (): Promise<void> => {
  try {
    // Sync attendance
    const unsyncedAttendance = await offlineStorage.getUnsyncedAttendance()
    if (unsyncedAttendance.length > 0) {
      for (const record of unsyncedAttendance) {
        try {
          await fetch('/api/attendance/offline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record)
          })
        } catch (error) {
          console.error('Failed to sync attendance:', error)
          continue
        }
      }

      await offlineStorage.markAttendanceSynced(unsyncedAttendance.map(r => r.id))
    }

    // Sync payments
    const unsyncedPayments = await offlineStorage.getUnsyncedPayments()
    if (unsyncedPayments.length > 0) {
      for (const record of unsyncedPayments) {
        try {
          await fetch('/api/payments/offline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record)
          })
        } catch (error) {
          console.error('Failed to sync payment:', error)
          continue
        }
      }

      await offlineStorage.markPaymentsSynced(unsyncedPayments.map(r => r.id))
    }
  } catch (error) {
    console.error('Failed to sync offline data:', error)
  }
}

// Network status monitoring
export const isOnline = (): boolean => {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

export const onNetworkChange = (callback: (online: boolean) => void): (() => void) => {
  if (typeof window === 'undefined') return () => {}

  const handleOnline = () => callback(true)
  const handleOffline = () => callback(false)

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}