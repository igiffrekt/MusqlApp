"use client"

import dynamic from "next/dynamic"

// Dynamically import PWA components to avoid SSR issues
const PWADashboard = dynamic(() => import("@/components/pwa/PWADashboard").then(m => m.PWADashboard), { ssr: false })
const PWAInstallPrompt = dynamic(() => import("@/components/pwa/PWAInstallPrompt").then(m => m.PWAInstallPrompt), { ssr: false })
const PWARegistration = dynamic(() => import("@/components/pwa/PWARegistration").then(m => m.PWARegistration), { ssr: false })

export default function PWAPage() {
  return (
    <div className="space-y-6">
      {/* PWA Components */}
      <PWARegistration />
      <PWAInstallPrompt />

      {/* Main PWA Dashboard */}
      <PWADashboard />
    </div>
  )
}