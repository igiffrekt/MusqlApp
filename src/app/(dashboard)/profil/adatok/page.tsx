"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Loader2, Save } from "lucide-react"

export default function PersonalInfoPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    emergencyContact: ""
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Pre-fill with session data
        if (session?.user) {
          setForm(prev => ({
            ...prev,
            name: session.user.name || "",
            email: session.user.email || ""
          }))
        }
        
        // Fetch additional student data
        const res = await fetch("/api/students/me")
        if (res.ok) {
          const data = await res.json()
          if (data.student) {
            setForm(prev => ({
              ...prev,
              phone: data.student.phone || "",
              address: data.student.address || "",
              emergencyContact: data.student.emergencyContact || ""
            }))
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/students/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: form.phone,
          address: form.address,
          emergencyContact: form.emergencyContact
        })
      })
      
      if (res.ok) {
        router.back()
      }
    } catch (error) {
      console.error("Failed to save:", error)
    } finally {
      setSaving(false)
    }
  }

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
            <h1 className="text-white text-xl font-semibold">Személyes adatok</h1>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 space-y-4">
          <div>
            <label className="text-white/60 text-sm mb-2 block">Név</label>
            <input
              type="text"
              value={form.name}
              disabled
              className="w-full bg-[#252a32] border border-white/10 rounded-xl p-4 text-white/50"
            />
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block">Email</label>
            <input
              type="email"
              value={form.email}
              disabled
              className="w-full bg-[#252a32] border border-white/10 rounded-xl p-4 text-white/50"
            />
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block">Telefonszám</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+36 30 123 4567"
              className="w-full bg-[#252a32] border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 focus:border-[#D2F159] outline-none"
            />
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block">Lakcím</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="1234 Budapest, Példa utca 1."
              className="w-full bg-[#252a32] border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 focus:border-[#D2F159] outline-none"
            />
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block">Vészhelyzeti kapcsolat</label>
            <input
              type="text"
              value={form.emergencyContact}
              onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
              placeholder="Név, telefonszám"
              className="w-full bg-[#252a32] border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 focus:border-[#D2F159] outline-none"
            />
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
