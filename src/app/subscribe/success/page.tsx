"use client"

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Loader2, ArrowRight, Copy, Check } from 'lucide-react'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [verifying, setVerifying] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orgCode, setOrgCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Fetch organization code
  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings?.slug) {
          setOrgCode(data.settings.slug)
        }
      })
      .catch(err => console.error('Failed to fetch org code:', err))
  }, [])

  const copyCode = async () => {
    if (orgCode) {
      await navigator.clipboard.writeText(orgCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    
    if (!sessionId) {
      // No session ID, just show success (user might have refreshed)
      setVerifying(false)
      // Trigger confetti
      import('canvas-confetti').then(({ default: confetti }) => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D2F159', '#ffffff', '#171725'],
        })
      })
      return
    }

    // Verify the session and update org
    fetch('/api/stripe/verify-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          // Trigger confetti on success
          import('canvas-confetti').then(({ default: confetti }) => {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#D2F159', '#ffffff', '#171725'],
            })
          })
        }
        setVerifying(false)
      })
      .catch(() => {
        setVerifying(false)
      })
  }, [searchParams])

  if (verifying) {
    return (
      <div className="min-h-screen bg-[#171725] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#D2F159] animate-spin mx-auto mb-4" />
          <p className="text-white/60">Előfizetés ellenőrzése...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#171725] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h1 className="text-white text-xl font-bold mb-2">Hiba történt</h1>
          <p className="text-white/60 mb-6">{error}</p>
          <button
            onClick={() => router.push('/subscribe')}
            className="px-6 py-3 bg-[#D2F159] text-[#171725] font-semibold rounded-full"
          >
            Próbáld újra
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black font-lufga">
      <div className="min-h-screen bg-[#171725] mx-[5px] my-[5px] rounded-2xl flex flex-col items-center justify-center px-6">
        {/* Success icon */}
        <div className="w-24 h-24 rounded-full bg-[#D2F159] flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-[#171725]" />
        </div>

        <h1 className="text-white text-2xl font-bold text-center mb-3">
          Sikeres aktiválás! 🎉
        </h1>

        <p className="text-white/60 text-center mb-2 max-w-sm">
          A próbaidőd elindult. 15 napig minden funkció korlátlanul elérhető.
        </p>

        <p className="text-[#D2F159] text-sm text-center mb-8">
          Üdvözlünk a Musql-ban!
        </p>

        {/* Organization Code */}
        {orgCode && (
          <div className="w-full max-w-sm bg-[#252a32] rounded-2xl p-5 border border-[#D2F159]/30 mb-6">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Szervezeti kód</p>
            <p className="text-white/60 text-sm mb-3">
              Ezzel a kóddal csatlakozhatnak hozzád a tanulók
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#171725] rounded-xl px-4 py-3 font-mono text-[#D2F159] text-xl font-bold tracking-wider">
                {orgCode}
              </div>
              <button
                onClick={copyCode}
                className="w-12 h-12 rounded-xl bg-[#D2F159] flex items-center justify-center"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-[#171725]" />
                ) : (
                  <Copy className="w-5 h-5 text-[#171725]" />
                )}
              </button>
            </div>
            {copied && (
              <p className="text-[#D2F159] text-xs mt-2 text-center">Másolva!</p>
            )}
          </div>
        )}

        {/* Features unlocked */}
        <div className="w-full max-w-sm bg-[#252a32] rounded-2xl p-5 border border-white/10 mb-8">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Mostantól elérhető</p>
          <ul className="space-y-2">
            {['Tagok kezelése', 'Órák szervezése', 'Jelenléti ívek', 'Fizetések követése'].map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-white">
                <span className="text-[#D2F159]">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push('/')}
          className="w-full max-w-sm py-4 rounded-full bg-[#D2F159] text-[#171725] font-bold text-lg flex items-center justify-center gap-2"
        >
          Irány a vezérlőpult
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default function SubscribeSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#171725] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#D2F159] animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
