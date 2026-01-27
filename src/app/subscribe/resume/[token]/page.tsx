"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function ResumeSubscriptionPage() {
  const params = useParams()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = params.token as string
    
    if (!token) {
      setError('Érvénytelen link')
      return
    }

    // Verify token and get org info
    fetch(`/api/subscribe/resume?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else if (data.redirectTo) {
          router.replace(data.redirectTo)
        }
      })
      .catch(() => {
        setError('Hiba történt a link ellenőrzése közben')
      })
  }, [params.token, router])

  if (error) {
    return (
      <div className="min-h-screen bg-[#171725] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h1 className="text-white text-xl font-bold mb-2">Hiba</h1>
          <p className="text-white/60 mb-6">{error}</p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="px-6 py-3 bg-[#D2F159] text-[#171725] font-semibold rounded-full"
          >
            Bejelentkezés
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#171725] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-[#D2F159] animate-spin mx-auto mb-4" />
        <p className="text-white/60">Folytatás...</p>
      </div>
    </div>
  )
}
