// Push notification utilities for client-side

export async function registerPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications not supported')
    return null
  }

  try {
    // Register service worker
    const registration = await navigator.serviceWorker.register('/sw.js')
    console.log('Service worker registered:', registration)

    // Request notification permission
    const permission = await Notification.requestPermission()

    if (permission !== 'granted') {
      console.warn('Notification permission denied')
      return null
    }

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
    })

    // Send subscription to server
    await fetch('/api/push-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: arrayBufferToBase64(subscription.getKey('auth')!),
        userAgent: navigator.userAgent,
      }),
    })

    console.log('Push notification subscription registered')
    return subscription
  } catch (error) {
    console.error('Failed to register push notifications:', error)
    return null
  }
}

export async function unregisterPushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      await subscription.unsubscribe()
      console.log('Push notification subscription unregistered')
    }
  } catch (error) {
    console.error('Failed to unregister push notifications:', error)
  }
}

// Utility functions
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}