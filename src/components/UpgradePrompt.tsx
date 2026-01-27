"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Sparkles, ArrowRight } from 'lucide-react'

interface UpgradePromptProps {
  isOpen: boolean
  onClose: () => void
  currentTier: string
  suggestedTier?: string
  suggestedTierName?: string
  limitType: string
  current: number
  limit: number
  message?: string
}

const LIMIT_TYPE_LABELS: Record<string, string> = {
  students: 'tagok',
  sessions: 'órák',
  trainers: 'edzők',
  locations: 'helyszínek',
}

const TIER_BENEFITS: Record<string, string[]> = {
  PROFESSIONAL: [
    'Max 75 tag (jelenleg 5)',
    'Max 200 óra/hó',
    'Max 10 edző',
    'Online fizetés',
    'Push értesítések',
    'Riportok',
  ],
  ENTERPRISE: [
    'Korlátlan tag',
    'Korlátlan óraszám',
    'Korlátlan edző',
    'Korlátlan helyszín',
    'Kiemelt ügyfélszolgálat',
    'API hozzáférés',
  ],
}

export function UpgradePrompt({
  isOpen,
  onClose,
  currentTier,
  suggestedTier,
  suggestedTierName,
  limitType,
  current,
  limit,
  message,
}: UpgradePromptProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const typeLabel = LIMIT_TYPE_LABELS[limitType] || limitType
  const benefits = suggestedTier ? TIER_BENEFITS[suggestedTier] || [] : []

  const handleUpgrade = () => {
    setLoading(true)
    router.push('/subscribe')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#171725] rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-white/10">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-[#D2F159]/20 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-[#D2F159]" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-white text-xl font-bold text-center mb-2">
          Elérted a limitet! 🚀
        </h2>

        {/* Message */}
        <p className="text-white/60 text-sm text-center mb-4">
          {message || `A(z) ${currentTier} csomagban maximum ${limit} ${typeLabel} lehet. Jelenleg ${current} van.`}
        </p>

        {/* Current status */}
        <div className="bg-[#252a32] rounded-xl p-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-white/50 text-sm">Jelenlegi</span>
            <span className="text-white font-medium">{current} / {limit}</span>
          </div>
          <div className="mt-2 h-2 bg-[#171725] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#D2F159] rounded-full transition-all"
              style={{ width: `${Math.min(100, (current / limit) * 100)}%` }}
            />
          </div>
        </div>

        {/* Suggested tier benefits */}
        {suggestedTierName && benefits.length > 0 && (
          <div className="mb-4">
            <p className="text-[#D2F159] text-sm font-medium mb-2">
              {suggestedTierName} csomaggal:
            </p>
            <ul className="space-y-1">
              {benefits.slice(0, 4).map((benefit, i) => (
                <li key={i} className="text-white/70 text-sm flex items-center gap-2">
                  <span className="text-[#D2F159]">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full py-3 rounded-full bg-[#D2F159] text-[#171725] font-bold flex items-center justify-center gap-2 hover:bg-[#D2F159]/90 transition-colors disabled:opacity-50"
        >
          {loading ? (
            'Betöltés...'
          ) : (
            <>
              Csomag váltás
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Secondary action */}
        <button
          onClick={onClose}
          className="w-full py-2 mt-2 text-white/40 text-sm hover:text-white/60 transition-colors"
        >
          Később
        </button>
      </div>
    </div>
  )
}

// Hook for easy use
import { create } from 'zustand'

interface UpgradePromptState {
  isOpen: boolean
  props: Omit<UpgradePromptProps, 'isOpen' | 'onClose'>
  show: (props: Omit<UpgradePromptProps, 'isOpen' | 'onClose'>) => void
  hide: () => void
}

export const useUpgradePrompt = create<UpgradePromptState>((set) => ({
  isOpen: false,
  props: {
    currentTier: '',
    limitType: '',
    current: 0,
    limit: 0,
  },
  show: (props) => set({ isOpen: true, props }),
  hide: () => set({ isOpen: false }),
}))

// Global component to be placed in layout
export function UpgradePromptGlobal() {
  const { isOpen, props, hide } = useUpgradePrompt()
  return <UpgradePrompt isOpen={isOpen} onClose={hide} {...props} />
}
