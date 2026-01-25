"use client"

import { PWADashboard } from "@/components/pwa/PWADashboard"
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt"
import { PWARegistration } from "@/components/pwa/PWARegistration"

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