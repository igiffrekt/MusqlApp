"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Users, Clock, CalendarDays, Save } from "lucide-react"
import { cn } from "@/lib/utils"

interface GroupData {
  id: string
  name: string
  description: string
  memberCount: number
  dailyFee: number
  monthlyFee: number
  currency: string
}

interface Props {
  groupId: string
}

// Mock data - in production would come from API
const mockGroups: Record<string, GroupData> = {
  "iskolas-csoport": {
    id: "iskolas-csoport",
    name: "Iskolás csoport",
    description: "6-14 éves korosztály",
    memberCount: 15,
    dailyFee: 2000,
    monthlyFee: 12000,
    currency: "HUF",
  },
  "felnott-hobbi-csoport": {
    id: "felnott-hobbi-csoport",
    name: "Felnőtt hobbi csoport",
    description: "18+ hobbi szintű edzések",
    memberCount: 11,
    dailyFee: 2500,
    monthlyFee: 15000,
    currency: "HUF",
  },
  "kezdo-csoport": {
    id: "kezdo-csoport",
    name: "Kezdő csoport",
    description: "Minden korosztály, kezdő szint",
    memberCount: 6,
    dailyFee: 2000,
    monthlyFee: 10000,
    currency: "HUF",
  },
  "versenyzok": {
    id: "versenyzok",
    name: "Versenyzők",
    description: "Versenyfelkészítő edzések",
    memberCount: 5,
    dailyFee: 3000,
    monthlyFee: 20000,
    currency: "HUF",
  },
  "hetvegi-intenziv": {
    id: "hetvegi-intenziv",
    name: "Hétvégi intenzív",
    description: "Szombati intenzív edzések",
    memberCount: 8,
    dailyFee: 3500,
    monthlyFee: 18000,
    currency: "HUF",
  },
}

export function MobileGroupDetail({ groupId }: Props) {
  const router = useRouter()
  const initialGroup = mockGroups[groupId] || mockGroups["felnott-hobbi-csoport"]

  const [group, setGroup] = useState<GroupData>(initialGroup)
  const [dailyFee, setDailyFee] = useState(initialGroup.dailyFee.toString())
  const [monthlyFee, setMonthlyFee] = useState(initialGroup.monthlyFee.toString())
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("hu-HU", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleSave = async () => {
    setSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In production, this would call the API to update group pricing
    // await fetch(`/api/groups/${groupId}`, {
    //   method: "PATCH",
    //   body: JSON.stringify({ dailyFee: parseInt(dailyFee), monthlyFee: parseInt(monthlyFee) })
    // })

    setGroup({
      ...group,
      dailyFee: parseInt(dailyFee) || 0,
      monthlyFee: parseInt(monthlyFee) || 0,
    })

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const hasChanges =
    parseInt(dailyFee) !== group.dailyFee ||
    parseInt(monthlyFee) !== group.monthlyFee

  return (
    <div className="min-h-screen bg-[#171725] pb-24 font-lufga">
      {/* Header */}
      <div className="px-6 pt-12">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#252a32] border border-white/5"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white text-xl font-semibold">Csoport beállítások</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Group Info Card */}
      <div className="px-6 mb-6">
        <div className="bg-[#252a32] rounded-[24px] p-5 border border-white/5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-[#D2F159] flex items-center justify-center">
              <Users className="w-7 h-7 text-[#171725]" />
            </div>
            <div>
              <h2 className="text-white text-xl font-semibold">{group.name}</h2>
              <p className="text-white/40 text-sm">{group.description}</p>
            </div>
          </div>

          <div className="h-px bg-white/10 my-4" />

          <div className="flex items-center justify-between">
            <span className="text-white/40 text-sm">Tagok száma</span>
            <span className="text-white font-medium">{group.memberCount} fő</span>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="px-6 mb-6">
        <h2 className="text-white text-lg font-semibold mb-4">Árazás</h2>

        {/* Daily Fee */}
        <div className="bg-[#252a32] rounded-[20px] p-5 border border-white/5 mb-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#333842] flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#D2F159]" />
            </div>
            <div>
              <p className="text-white font-medium">Napidíj</p>
              <p className="text-white/40 text-xs">Egyszeri alkalomra</p>
            </div>
          </div>

          <div className="relative">
            <input
              type="number"
              value={dailyFee}
              onChange={(e) => setDailyFee(e.target.value)}
              className="w-full bg-[#333842] border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-medium focus:outline-none focus:border-[#D2F159] transition-colors"
              placeholder="0"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">
              {group.currency}
            </span>
          </div>
        </div>

        {/* Monthly Fee */}
        <div className="bg-[#252a32] rounded-[20px] p-5 border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#333842] flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-[#D2F159]" />
            </div>
            <div>
              <p className="text-white font-medium">Havi bérlet</p>
              <p className="text-white/40 text-xs">30 napos korlátlan belépés</p>
            </div>
          </div>

          <div className="relative">
            <input
              type="number"
              value={monthlyFee}
              onChange={(e) => setMonthlyFee(e.target.value)}
              className="w-full bg-[#333842] border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-medium focus:outline-none focus:border-[#D2F159] transition-colors"
              placeholder="0"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">
              {group.currency}
            </span>
          </div>
        </div>
      </div>

      {/* Current Pricing Summary */}
      <div className="px-6 mb-6">
        <div className="bg-[#1e2229] rounded-[16px] p-4 border border-white/5">
          <p className="text-white/40 text-xs mb-3">Jelenlegi árak</p>
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/60 text-sm">Napidíj</span>
            <span className="text-white font-medium">{formatCurrency(group.dailyFee, group.currency)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm">Havi bérlet</span>
            <span className="text-white font-medium">{formatCurrency(group.monthlyFee, group.currency)}</span>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#171725] border-t border-[#333842] p-4 z-40">
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className={cn(
            "w-full py-4 rounded-full font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2",
            hasChanges && !saving
              ? "bg-[#D2F159] text-[#171725] active:scale-[0.98]"
              : "bg-[#333842] text-white/40 cursor-not-allowed"
          )}
        >
          {saving ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Mentés...
            </>
          ) : saved ? (
            <>
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Mentve!
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Mentés
            </>
          )}
        </button>
      </div>
    </div>
  )
}
