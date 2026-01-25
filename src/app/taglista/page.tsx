"use client"

import { useState, useEffect } from "react"
import { MobileTaglista } from "@/components/mobile/MobileTaglista"

export default function TaglistaPage() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // For now, always show mobile view (desktop version can be added later)
  if (isMobile) {
    return <MobileTaglista />
  }

  // Desktop fallback - show mobile for now
  return <MobileTaglista />
}
