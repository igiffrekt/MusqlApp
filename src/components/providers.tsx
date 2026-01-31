"use client"

import { SessionProvider } from "next-auth/react"
import { NotificationPopup } from "@/components/mobile/NotificationPopup"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <NotificationPopup />
    </SessionProvider>
  )
}
