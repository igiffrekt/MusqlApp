"use client"

import { useState } from "react"
import Image from "next/image"
import { MapPin, Phone, Loader2 } from "lucide-react"
import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete"

interface MobileOnboardingLocationProps {
  onNext: (locationId: string, locationName: string) => void
}

export function MobileOnboardingLocation({ onNext }: MobileOnboardingLocationProps) {
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError("A helyszín neve kötelező")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          address: address.trim() || null,
          phone: phone.trim() || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Nem sikerült létrehozni a helyszínt")
      }

      const data = await response.json()
      onNext(data.location.id, data.location.name)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hiba történt")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#171725] font-lufga">
      <div className="px-6 pt-14 pb-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#D2F159] rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-[#171725]" />
          </div>
          <h1 className="text-white text-2xl font-bold mb-2">
            Hozd létre az első helyszínt
          </h1>
          <p className="text-white/60 text-sm">
            Add meg az edzéseid helyszínét
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name field */}
          <div>
            <label className="text-white/60 text-sm block mb-2">
              Helyszín neve *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="pl. Suzuki Aréna"
              className="w-full bg-[#252a32] text-white rounded-xl px-4 py-4 text-base placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#D2F159]"
              disabled={loading}
            />
          </div>

          {/* Address field with Google Places autocomplete */}
          <div>
            <label className="text-white/60 text-sm block mb-2">
              Cím
            </label>
            <AddressAutocomplete
              value={address}
              onChange={setAddress}
              placeholder="pl. Budapest, Példa utca 1."
              disabled={loading}
            />
          </div>

          {/* Phone field */}
          <div>
            <label className="text-white/60 text-sm block mb-2">
              Telefonszám
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="pl. +36 30 123 4567"
                className="w-full bg-[#252a32] text-white rounded-xl pl-12 pr-4 py-4 text-base placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#D2F159]"
                disabled={loading}
              />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-3 h-3 rounded-full bg-[#D2F159]" />
            <div className="w-3 h-3 rounded-full bg-white/20" />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full bg-[#D2F159] text-[#171725] rounded-full py-4 font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Mentés...
              </>
            ) : (
              <>
                Tovább
                <Image src="/icons/arrow-right-icon.svg" alt="" width={20} height={20} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
