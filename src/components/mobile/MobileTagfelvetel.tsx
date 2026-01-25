"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ChevronLeft, Camera, User, Mail, Phone, Users, Plus, Check, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMembersStore } from "@/lib/stores/members-store"
import { MobileNavbar } from "./MobileNavbar"

interface Group {
  id: string
  name: string
  memberCount: number
  dailyFee: number
  monthlyFee: number
}

export function MobileTagfelvetel() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const addMember = useMembersStore((state) => state.addMember)

  // Form state
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [guardianName, setGuardianName] = useState("")
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [loadingGroups, setLoadingGroups] = useState(true)

  // UI state
  const [showNewGroupModal, setShowNewGroupModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [creatingGroup, setCreatingGroup] = useState(false)

  // Fetch groups from API on mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch("/api/groups")
        if (response.ok) {
          const data = await response.json()
          setGroups(data.groups || [])
        }
      } catch (error) {
        console.error("Failed to fetch groups:", error)
      } finally {
        setLoadingGroups(false)
      }
    }
    fetchGroups()
  }, [])

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

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return

    setCreatingGroup(true)
    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newGroupName.trim(),
          dailyFee: 2500,
          monthlyFee: 15000,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const newGroup: Group = {
          id: data.group.id,
          name: data.group.name,
          memberCount: 0,
          dailyFee: data.group.dailyFee,
          monthlyFee: data.group.monthlyFee,
        }
        setGroups([...groups, newGroup])
        setSelectedGroup(newGroup.id)
        setNewGroupName("")
        setShowNewGroupModal(false)
      }
    } catch (error) {
      console.error("Failed to create group:", error)
    } finally {
      setCreatingGroup(false)
    }
  }

  const handleSave = async () => {
    if (!firstName || !lastName) return

    setSaving(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Add member to store
    addMember({
      firstName,
      lastName,
      email: email || undefined,
      phone: phone || undefined,
      guardian: guardianName || undefined,
      profileImage: profileImage || undefined,
      groups: selectedGroup ? [selectedGroup] : [],
      status: "unsettled",
    })

    setSaving(false)
    setShowSuccess(true)

    setTimeout(() => {
      router.push("/taglista")
    }, 1500)
  }

  const isFormValid = firstName.trim() && lastName.trim()

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-[#171725] flex flex-col items-center justify-center font-lufga px-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1ad598] to-[#0fb37e] flex items-center justify-center mb-6 animate-scale-in">
          <Check className="w-12 h-12 text-white" strokeWidth={3} />
        </div>
        <h1 className="text-white text-2xl font-bold mb-2">Tag hozzáadva!</h1>
        <p className="text-white/60 text-sm">{firstName} {lastName} sikeresen regisztrálva.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black font-lufga">
    <div className="min-h-screen bg-[#171725] mx-[5px] my-[5px] pb-24 rounded-2xl">
      {/* Header */}
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#252a32] border border-white/5"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white text-xl font-semibold">Új tag felvétele</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Profile Image Upload */}
      <div className="flex flex-col items-center mb-8">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="relative group"
        >
          <div className={cn(
            "w-28 h-28 rounded-full flex items-center justify-center overflow-hidden transition-all",
            profileImage ? "bg-transparent" : "bg-gradient-to-br from-[#333842] to-[#252a32] border-2 border-dashed border-white/20"
          )}>
            {profileImage ? (
              <Image
                src={profileImage}
                alt="Profilkép"
                fill
                className="object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-white/40" />
            )}
          </div>
          <div className="absolute bottom-0 right-0 w-9 h-9 bg-[#D2F159] rounded-full flex items-center justify-center shadow-lg">
            <Camera className="w-4 h-4 text-[#171725]" />
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <p className="text-white/40 text-sm mt-3">Profilkép feltöltése</p>
      </div>

      {/* Form Fields */}
      <div className="px-6 space-y-4">
        {/* Name Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-white/60 text-xs mb-2 block">Vezetéknév *</label>
            <div className="bg-[#252a32] rounded-2xl border border-white/5 px-4 py-4">
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Kovács"
                className="w-full bg-transparent text-white placeholder-white/30 outline-none text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-white/60 text-xs mb-2 block">Keresztnév *</label>
            <div className="bg-[#252a32] rounded-2xl border border-white/5 px-4 py-4">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="János"
                className="w-full bg-transparent text-white placeholder-white/30 outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="text-white/60 text-xs mb-2 block">Email cím</label>
          <div className="bg-[#252a32] rounded-2xl border border-white/5 px-4 py-4 flex items-center gap-3">
            <Mail className="w-5 h-5 text-white/30" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kovacs.janos@email.com"
              className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-sm"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="text-white/60 text-xs mb-2 block">Telefonszám</label>
          <div className="bg-[#252a32] rounded-2xl border border-white/5 px-4 py-4 flex items-center gap-3">
            <Phone className="w-5 h-5 text-white/30" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+36 30 123 4567"
              className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-sm"
            />
          </div>
        </div>

        {/* Guardian */}
        <div>
          <label className="text-white/60 text-xs mb-2 block">Gondviselő neve (kiskorúak esetén)</label>
          <div className="bg-[#252a32] rounded-2xl border border-white/5 px-4 py-4 flex items-center gap-3">
            <Users className="w-5 h-5 text-white/30" />
            <input
              type="text"
              value={guardianName}
              onChange={(e) => setGuardianName(e.target.value)}
              placeholder="Kovács Péter"
              className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-sm"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10 my-6" />

        {/* Group Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-white text-base font-semibold">Csoport kiválasztása</label>
            <button
              onClick={() => setShowNewGroupModal(true)}
              className="flex items-center gap-1.5 text-[#D2F159] text-sm"
            >
              <Plus className="w-4 h-4" />
              Új csoport
            </button>
          </div>

          <div className="space-y-2">
            {loadingGroups ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-[#D2F159] animate-spin" />
              </div>
            ) : groups.length === 0 ? (
              <div className="bg-[#252a32] rounded-2xl border border-white/5 p-6 text-center">
                <Users className="w-10 h-10 text-white/30 mx-auto mb-3" />
                <p className="text-white/60 text-sm">Még nincsenek csoportok</p>
                <p className="text-white/40 text-xs mt-1">Hozz létre egyet az &quot;Új csoport&quot; gombbal</p>
              </div>
            ) : (
              groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(selectedGroup === group.id ? null : group.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl transition-all",
                    selectedGroup === group.id
                      ? "bg-[#D2F159]/10 border-2 border-[#D2F159]"
                      : "bg-[#252a32] border border-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      selectedGroup === group.id ? "bg-[#D2F159]" : "bg-[#333842]"
                    )}>
                      <Users className={cn(
                        "w-5 h-5",
                        selectedGroup === group.id ? "text-[#171725]" : "text-white/60"
                      )} />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium">{group.name}</p>
                      <p className="text-white/40 text-sm">{group.memberCount} tag</p>
                    </div>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    selectedGroup === group.id
                      ? "border-[#D2F159] bg-[#D2F159]"
                      : "border-white/20"
                  )}>
                    {selectedGroup === group.id && (
                      <Check className="w-3 h-3 text-[#171725]" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#171725] border-t border-[#333842] p-4 z-40">
        <button
          onClick={handleSave}
          disabled={!isFormValid || saving}
          className={cn(
            "w-full py-4 rounded-full font-semibold text-base transition-all duration-200",
            isFormValid && !saving
              ? "bg-[#D2F159] text-[#171725] active:scale-[0.98]"
              : "bg-[#333842] text-white/40 cursor-not-allowed"
          )}
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Mentés...
            </span>
          ) : (
            "Tag hozzáadása"
          )}
        </button>
      </div>

      {/* New Group Modal */}
      {showNewGroupModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
          <div className="w-full bg-[#252a32] rounded-t-[24px] p-6 animate-slide-in-bottom">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-lg font-semibold">Új csoport létrehozása</h2>
              <button
                onClick={() => setShowNewGroupModal(false)}
                disabled={creatingGroup}
                className="w-8 h-8 rounded-full bg-[#333842] flex items-center justify-center disabled:opacity-50"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            <div className="mb-6">
              <label className="text-white/60 text-xs mb-2 block">Csoport neve</label>
              <div className="bg-[#171725] rounded-2xl border border-white/5 px-4 py-4">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="pl. Kezdő csoport"
                  className="w-full bg-transparent text-white placeholder-white/30 outline-none text-sm"
                  autoFocus
                  disabled={creatingGroup}
                />
              </div>
            </div>

            <button
              onClick={handleAddGroup}
              disabled={!newGroupName.trim() || creatingGroup}
              className={cn(
                "w-full py-4 rounded-full font-semibold text-base transition-all flex items-center justify-center gap-2",
                newGroupName.trim() && !creatingGroup
                  ? "bg-[#D2F159] text-[#171725]"
                  : "bg-[#333842] text-white/40 cursor-not-allowed"
              )}
            >
              {creatingGroup ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Létrehozás...
                </>
              ) : (
                "Csoport létrehozása"
              )}
            </button>
          </div>
        </div>
      )}

      <MobileNavbar />
    </div>
    </div>
  )
}
