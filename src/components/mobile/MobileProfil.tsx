"use client"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Camera, User } from "lucide-react"
import { toast } from "sonner"
import { MobileNavbar } from "./MobileNavbar"

export function MobileProfil() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profileImage, setProfileImage] = useState<string | null>(
    session?.user?.image || null
  )
  const [firstName, setFirstName] = useState(
    session?.user?.name?.split(" ")[0] || ""
  )
  const [lastName, setLastName] = useState(
    session?.user?.name?.split(" ").slice(1).join(" ") || ""
  )
  const [email, setEmail] = useState(session?.user?.email || "")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          address,
          profileImage,
        }),
      })

      if (response.ok) {
        await update({
          ...session,
          user: {
            ...session?.user,
            name: `${firstName} ${lastName}`.trim(),
            email,
            image: profileImage,
          },
        })
        toast.success("Profil sikeresen mentve!")
        router.push("/")
      } else {
        toast.error("Hiba történt a mentés során")
      }
    } catch (error) {
      console.error("Failed to save profile:", error)
      toast.error("Hiba történt a mentés során")
    } finally {
      setIsSaving(false)
    }
  }

  const userInitials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "?"

  return (
    <div className="min-h-screen bg-[#171725] font-lufga">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#171725] px-6 pt-14 pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#252a32] border border-white/5"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white text-xl font-semibold">Profil</h1>
        </div>
      </header>

      <div className="px-6 pb-32">
        {/* Profile Image Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-[#333842] flex items-center justify-center overflow-hidden border-4 border-[#D2F159]">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Profilkép"
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-white text-3xl font-bold">
                  {userInitials}
                </span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-[#D2F159] flex items-center justify-center shadow-lg"
            >
              <Camera className="w-5 h-5 text-[#171725]" />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <p className="text-white/40 text-sm mt-3">
            Koppints a kamera ikonra a kép módosításához
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* First Name */}
          <div>
            <label className="text-white/60 text-sm mb-2 block">Vezetéknév</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Add meg a vezetékneved"
              className="w-full bg-[#252a32] rounded-2xl border border-white/5 px-4 py-4 text-white placeholder-white/40 focus:outline-none focus:border-[#D2F159]"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="text-white/60 text-sm mb-2 block">Keresztnév</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Add meg a keresztneved"
              className="w-full bg-[#252a32] rounded-2xl border border-white/5 px-4 py-4 text-white placeholder-white/40 focus:outline-none focus:border-[#D2F159]"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-white/60 text-sm mb-2 block">Email cím</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="pelda@email.hu"
              className="w-full bg-[#252a32] rounded-2xl border border-white/5 px-4 py-4 text-white placeholder-white/40 focus:outline-none focus:border-[#D2F159]"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-white/60 text-sm mb-2 block">Telefonszám</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+36 XX XXX XXXX"
              className="w-full bg-[#252a32] rounded-2xl border border-white/5 px-4 py-4 text-white placeholder-white/40 focus:outline-none focus:border-[#D2F159]"
            />
          </div>

          {/* Address */}
          <div>
            <label className="text-white/60 text-sm mb-2 block">Lakcím</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Város, utca, házszám"
              className="w-full bg-[#252a32] rounded-2xl border border-white/5 px-4 py-4 text-white placeholder-white/40 focus:outline-none focus:border-[#D2F159]"
            />
          </div>
        </div>
      </div>

      {/* Fixed Bottom Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-[#171725] border-t border-white/5">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-4 rounded-full bg-[#D2F159] text-[#171725] font-semibold text-base disabled:opacity-50"
        >
          {isSaving ? "Mentés..." : "Mentés"}
        </button>
      </div>

      <MobileNavbar />
    </div>
  )
}
