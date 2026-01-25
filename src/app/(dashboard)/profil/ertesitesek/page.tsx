"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Loader2, Save, Bell, Calendar, CreditCard, Mail } from "lucide-react"

export default function NotificationSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    sessionReminders: true,
    paymentReminders: true,
    emailNotifications: true,
    pushNotifications: true
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/user/preferences")
        if (res.ok) {
          const data = await res.json()
          if (data.preferences?.notifications) {
            setSettings(prev => ({ ...prev, ...data.preferences.notifications }))
          }
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifications: settings })
      })
      router.back()
    } catch (error) {
      console.error("Failed to save:", error)
    } finally {
      setSaving(false)
    }
  }

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`w-12 h-7 rounded-full transition-colors relative ${
        enabled ? "bg-[#D2F159]" : "bg-white/20"
      }`}
    >
      <div
        className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${
          enabled ? "left-6" : "left-1"
        }`}
      />
    </button>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-black font-lufga">
        <div className="min-h-screen bg-[#171725] flex items-center justify-center mx-[5px] my-[5px] rounded-2xl">
          <Loader2 className="w-8 h-8 text-[#D2F159] animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black font-lufga">
      <div className="min-h-screen bg-[#171725] mx-[5px] my-[5px] rounded-2xl pb-8">
        {/* Header */}
        <div className="px-6 pt-6 pb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-[#252a32] flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-white text-xl font-semibold">Értesítés beállítások</h1>
          </div>
        </div>

        {/* Settings */}
        <div className="px-6 space-y-4">
          <div className="bg-[#252a32] rounded-2xl border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#D2F159]" />
                <div>
                  <p className="text-white font-medium">Edzés emlékeztetők</p>
                  <p className="text-white/40 text-sm">Értesítés a közelgő edzésekről</p>
                </div>
              </div>
              <Toggle
                enabled={settings.sessionReminders}
                onChange={(v) => setSettings({ ...settings, sessionReminders: v })}
              />
            </div>
            <div className="h-px bg-white/10" />
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-[#D2F159]" />
                <div>
                  <p className="text-white font-medium">Fizetési emlékeztetők</p>
                  <p className="text-white/40 text-sm">Értesítés esedékes befizetésekről</p>
                </div>
              </div>
              <Toggle
                enabled={settings.paymentReminders}
                onChange={(v) => setSettings({ ...settings, paymentReminders: v })}
              />
            </div>
            <div className="h-px bg-white/10" />
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#D2F159]" />
                <div>
                  <p className="text-white font-medium">Email értesítések</p>
                  <p className="text-white/40 text-sm">Fontos értesítések emailben</p>
                </div>
              </div>
              <Toggle
                enabled={settings.emailNotifications}
                onChange={(v) => setSettings({ ...settings, emailNotifications: v })}
              />
            </div>
            <div className="h-px bg-white/10" />
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[#D2F159]" />
                <div>
                  <p className="text-white font-medium">Push értesítések</p>
                  <p className="text-white/40 text-sm">Azonnali értesítések az alkalmazásban</p>
                </div>
              </div>
              <Toggle
                enabled={settings.pushNotifications}
                onChange={(v) => setSettings({ ...settings, pushNotifications: v })}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="px-6 mt-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 rounded-full bg-[#D2F159] text-[#171725] font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Mentés
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
