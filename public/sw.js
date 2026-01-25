// Progressive Web App Service Worker
const CACHE_NAME = 'musql-v1.0.0'
const STATIC_CACHE = 'musql-static-v1.0.0'
const DYNAMIC_CACHE = 'musql-dynamic-v1.0.0'

// Resources to cache immediately (only essential, existing files)
const STATIC_ASSETS = [
  '/',
  '/manifest.json'
]

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...')
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(async cache => {
        console.log('[SW] Caching static assets...')
        // Cache each asset individually, ignoring failures for missing files
        for (const asset of STATIC_ASSETS) {
          try {
            await cache.add(asset)
          } catch (e) {
            console.warn(`[SW] Failed to cache ${asset}:`, e.message)
          }
        }
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...')
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip external requests
  if (!url.origin.includes(self.location.origin)) return

  // Skip API requests (they need fresh data)
  if (url.pathname.startsWith('/api/')) return

  // Skip Next.js internal routes
  if (url.pathname.startsWith('/_next/')) return

  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse
        }

        return fetch(request)
          .then(response => {
            // Cache successful responses
            if (response.status === 200 && response.type === 'basic') {
              const responseClone = response.clone()
              caches.open(DYNAMIC_CACHE)
                .then(cache => cache.put(request, responseClone))
            }
            return response
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/offline.html')
            }
          })
      })
  )
})

// Push notification event
self.addEventListener('push', event => {
  console.log('[SW] Push message received:', event)

  if (!event.data) return

  const data = event.data.json()

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/icon-192x192.png',
    data: data.data,
    actions: [
      {
        action: 'view',
        title: 'View',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
    requireInteraction: true,
    silent: false,
    tag: data.tag || 'musql-notification',
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Notification click event
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification click received:', event)

  event.notification.close()

  if (event.action === 'dismiss') {
    return
  }

  // Default action or 'view' action
  const urlToOpen = event.notification.data?.url || '/dashboard'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Check if there is already a window/tab open with the target URL
      for (let client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }

      // If not, open a new window/tab with the target URL
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('[SW] Background sync triggered:', event.tag)

  if (event.tag === 'background-sync-attendance') {
    event.waitUntil(syncAttendanceData())
  }

  if (event.tag === 'background-sync-payments') {
    event.waitUntil(syncPaymentData())
  }

  if (event.tag === 'background-sync-forms') {
    event.waitUntil(syncFormData())
  }
})

// Sync attendance data when back online
async function syncAttendanceData() {
  try {
    const attendanceData = await getStoredAttendanceData()

    for (const record of attendanceData) {
      await fetch('/api/attendance/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      })
    }

    // Clear stored data after successful sync
    await clearStoredAttendanceData()
  } catch (error) {
    console.error('[SW] Failed to sync attendance data:', error)
  }
}

// Sync payment data when back online
async function syncPaymentData() {
  try {
    const paymentData = await getStoredPaymentData()

    for (const record of paymentData) {
      try {
        const response = await fetch('/api/payments/offline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record)
        })

        if (response.ok) {
          // Mark as synced
          await markPaymentSynced(record.id)
        }
      } catch (error) {
        console.error('[SW] Failed to sync payment:', record.id, error)
      }
    }

    // Clear successfully synced data
    await clearSyncedPaymentData()
  } catch (error) {
    console.error('[SW] Failed to sync payment data:', error)
  }
}

// Sync form data when back online
async function syncFormData() {
  try {
    // Sync any pending form submissions
    const formData = await getStoredFormData()

    for (const record of formData) {
      try {
        const response = await fetch(record.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record.data)
        })

        if (response.ok) {
          await markFormSynced(record.id)
        }
      } catch (error) {
        console.error('[SW] Failed to sync form:', record.id, error)
      }
    }

    await clearSyncedFormData()
  } catch (error) {
    console.error('[SW] Failed to sync form data:', error)
  }
}

// IndexedDB helper functions for offline data storage
async function getStoredAttendanceData() {
  return new Promise((resolve) => {
    const request = indexedDB.open('musql-offline', 1)
    request.onsuccess = (event) => {
      const db = event.target.result
      const transaction = db.transaction(['attendance'], 'readonly')
      const store = transaction.objectStore('attendance')
      const index = store.index('synced')
      const getRequest = index.getAll(IDBKeyRange.only(false))

      getRequest.onsuccess = () => resolve(getRequest.result || [])
      getRequest.onerror = () => resolve([])
    }
    request.onerror = () => resolve([])
  })
}

async function clearStoredAttendanceData() {
  return new Promise((resolve) => {
    const request = indexedDB.open('musql-offline', 1)
    request.onsuccess = (event) => {
      const db = event.target.result
      const transaction = db.transaction(['attendance'], 'readwrite')
      const store = transaction.objectStore('attendance')
      const clearRequest = store.clear()

      clearRequest.onsuccess = () => resolve()
      clearRequest.onerror = () => resolve()
    }
    request.onerror = () => resolve()
  })
}

async function getStoredPaymentData() {
  return new Promise((resolve) => {
    const request = indexedDB.open('musql-offline', 1)
    request.onsuccess = (event) => {
      const db = event.target.result
      const transaction = db.transaction(['payments'], 'readonly')
      const store = transaction.objectStore('payments')
      const index = store.index('synced')
      const getRequest = index.getAll(IDBKeyRange.only(false))

      getRequest.onsuccess = () => resolve(getRequest.result || [])
      getRequest.onerror = () => resolve([])
    }
    request.onerror = () => resolve([])
  })
}

async function clearStoredPaymentData() {
  return new Promise((resolve) => {
    const request = indexedDB.open('musql-offline', 1)
    request.onsuccess = (event) => {
      const db = event.target.result
      const transaction = db.transaction(['payments'], 'readwrite')
      const store = transaction.objectStore('payments')
      const clearRequest = store.clear()

      clearRequest.onsuccess = () => resolve()
      clearRequest.onerror = () => resolve()
    }
    request.onerror = () => resolve()
  })
}

async function clearSyncedPaymentData() {
  return new Promise((resolve) => {
    const request = indexedDB.open('musql-offline', 1)
    request.onsuccess = (event) => {
      const db = event.target.result
      const transaction = db.transaction(['payments'], 'readwrite')
      const store = transaction.objectStore('payments')
      const index = store.index('synced')
      const getRequest = index.openCursor(IDBKeyRange.only(true))

      getRequest.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve()
        }
      }
      getRequest.onerror = () => resolve()
    }
    request.onerror = () => resolve()
  })
}

async function markPaymentSynced(id) {
  return new Promise((resolve) => {
    const request = indexedDB.open('musql-offline', 1)
    request.onsuccess = (event) => {
      const db = event.target.result
      const transaction = db.transaction(['payments'], 'readwrite')
      const store = transaction.objectStore('payments')
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const record = getRequest.result
        if (record) {
          record.synced = true
          store.put(record)
        }
        resolve()
      }
      getRequest.onerror = () => resolve()
    }
    request.onerror = () => resolve()
  })
}

async function getStoredFormData() {
  return new Promise((resolve) => {
    const request = indexedDB.open('musql-offline', 1)
    request.onsuccess = (event) => {
      const db = event.target.result
      const transaction = db.transaction(['forms'], 'readonly')
      const store = transaction.objectStore('forms')
      const index = store.index('synced')
      const getRequest = index.getAll(IDBKeyRange.only(false))

      getRequest.onsuccess = () => resolve(getRequest.result || [])
      getRequest.onerror = () => resolve([])
    }
    request.onerror = () => resolve([])
  })
}

async function clearSyncedFormData() {
  return new Promise((resolve) => {
    const request = indexedDB.open('musql-offline', 1)
    request.onsuccess = (event) => {
      const db = event.target.result
      const transaction = db.transaction(['forms'], 'readwrite')
      const store = transaction.objectStore('forms')
      const index = store.index('synced')
      const getRequest = index.openCursor(IDBKeyRange.only(true))

      getRequest.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve()
        }
      }
      getRequest.onerror = () => resolve()
    }
    request.onerror = () => resolve()
  })
}

async function markFormSynced(id) {
  return new Promise((resolve) => {
    const request = indexedDB.open('musql-offline', 1)
    request.onsuccess = (event) => {
      const db = event.target.result
      const transaction = db.transaction(['forms'], 'readwrite')
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
      getRequest.onerror = () => resolve()
    }
    request.onerror = () => resolve()
  })
}

// Periodic background sync for data refresh
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-cache') {
    event.waitUntil(updateCache())
  }
})

async function updateCache() {
  console.log('[SW] Updating cache...')

  try {
    const cache = await caches.open(DYNAMIC_CACHE)
    const keys = await cache.keys()

    // Refresh critical data
    await cache.add('/api/user/preferences')
    await cache.add('/api/notifications?limit=5')

  } catch (error) {
    console.error('[SW] Cache update failed:', error)
  }
}