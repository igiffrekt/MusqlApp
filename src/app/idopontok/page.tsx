"use client"

import { useState, useEffect } from "react"
import { MobileIdopontok } from "@/components/mobile/MobileIdopontok"

export default function IdopontokPage() {
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
    return <MobileIdopontok />
  }

  // Desktop fallback - show mobile for now
  return <MobileIdopontok />
}
