"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SignUpRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/auth/edzo/signup")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#171725" }}>
      <p className="text-white/70">Atiranyitas...</p>
    </div>
  )
}
