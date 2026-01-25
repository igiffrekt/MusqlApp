"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { X, MapPin, Users, Phone, Mail, Plus, Loader2, Trash2 } from "lucide-react"
import { MobileNavbar } from "./MobileNavbar"

interface Location {
  id: string
  name: string
  address: string | null
  city: string | null
  phone: string | null
  email: string | null
  capacity: number | null
  createdAt: string
}

interface EditForm {
  name: string
  address: string
  city: string
  capacity: string
  phone: string
  email: string
}

export function MobileHelyszinek() {
  const router = useRouter()
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editForm, setEditForm] = useState<EditForm>({
    name: "",
    address: "",
    city: "",
    capacity: "",
    phone: "",
    email: "",
  })

  // Fetch locations from API
  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/locations")
      if (response.ok) {
        const data = await response.json()
        setLocations(data.locations || [])
      }
    } catch (error) {
      console.error("Failed to fetch locations:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLocations = locations.filter(location => {
    const matchesSearch = searchQuery === "" ||
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (location.city?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (location.address?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const openLocationDetails = (location: Location) => {
    setSelectedLocation(location)
    setIsEditing(false)
    setIsCreating(false)
  }

  const closeLocationDetails = () => {
    setSelectedLocation(null)
    setIsEditing(false)
    setIsCreating(false)
  }

  const openEditMode = () => {
    if (!selectedLocation) return
    setEditForm({
      name: selectedLocation.name,
      address: selectedLocation.address || "",
      city: selectedLocation.city || "",
      capacity: selectedLocation.capacity?.toString() || "",
      phone: selectedLocation.phone || "",
      email: selectedLocation.email || "",
    })
    setIsEditing(true)
  }

  const openCreateMode = () => {
    setEditForm({
      name: "",
      address: "",
      city: "",
      capacity: "",
      phone: "",
      email: "",
    })
    setIsCreating(true)
    setSelectedLocation(null)
    setIsEditing(false)
  }

  const closeEditMode = () => {
    setIsEditing(false)
    setIsCreating(false)
  }

  const saveLocation = async () => {
    if (!editForm.name.trim()) return

    setSaving(true)
    try {
      if (isCreating) {
        // Create new location
        const response = await fetch("/api/locations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editForm.name.trim(),
            address: editForm.address.trim() || null,
            city: editForm.city.trim() || null,
            capacity: editForm.capacity ? parseInt(editForm.capacity) : null,
            phone: editForm.phone.trim() || null,
            email: editForm.email.trim() || null,
          }),
        })

        if (response.ok) {
          await fetchLocations()
          closeEditMode()
        } else {
          const error = await response.json()
          alert(`Hiba: ${error.message || "Ismeretlen hiba"}`)
        }
      } else if (selectedLocation) {
        // Update existing location
        const response = await fetch(`/api/locations/${selectedLocation.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editForm.name.trim(),
            address: editForm.address.trim() || null,
            city: editForm.city.trim() || null,
            capacity: editForm.capacity ? parseInt(editForm.capacity) : null,
            phone: editForm.phone.trim() || null,
            email: editForm.email.trim() || null,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          setLocations(prev => prev.map(loc =>
            loc.id === selectedLocation.id ? data.location : loc
          ))
          setSelectedLocation(data.location)
          setIsEditing(false)
        } else {
          const error = await response.json()
          alert(`Hiba: ${error.message || "Ismeretlen hiba"}`)
        }
      }
    } catch (error) {
      console.error("Failed to save location:", error)
      alert("Hiba történt a mentés közben")
    } finally {
      setSaving(false)
    }
  }

  const deleteLocation = async () => {
    if (!selectedLocation) return
    if (!confirm(`Biztosan törölni szeretnéd a "${selectedLocation.name}" helyszínt?`)) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/locations/${selectedLocation.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setLocations(prev => prev.filter(loc => loc.id !== selectedLocation.id))
        closeLocationDetails()
      } else {
        const error = await response.json()
        alert(`Hiba: ${error.message || "Ismeretlen hiba"}`)
      }
    } catch (error) {
      console.error("Failed to delete location:", error)
      alert("Hiba történt a törlés közben")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#171725] flex items-center justify-center font-lufga">
        <Loader2 className="w-8 h-8 text-[#D2F159] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black font-lufga">
    <div className="min-h-screen bg-[#171725] mx-[5px] my-[5px] pb-24 rounded-2xl">
      {/* Header */}
      <div className="px-6 pt-6">
        <div className="flex flex-col gap-4">
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 flex items-center justify-center"
            >
              <Image src="/icons/arrow-back-icon.svg" alt="Vissza" width={32} height={32} />
            </button>
            <h1 className="text-white text-xl font-semibold">Helyszínek</h1>
            <button className="w-8 h-8 flex items-center justify-center">
              <Image src="/icons/more-icon.svg" alt="Több" width={32} height={32} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="bg-white/12 border border-[#171725] rounded-lg h-14 flex items-center px-5 gap-4">
            <Image src="/icons/search-icon.svg" alt="" width={24} height={24} />
            <input
              type="text"
              placeholder="Helyszín keresése..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white placeholder-white/60 text-sm flex-1 outline-none font-light"
            />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 py-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#D2F159]" />
              <span className="text-white/60 text-sm">{locations.length} helyszín</span>
            </div>
          </div>
        </div>
      </div>

      {/* Locations Grid */}
      <div className="px-6 mt-4 space-y-4">
        {filteredLocations.length > 0 ? (
          filteredLocations.map((location) => (
            <button
              key={location.id}
              onClick={() => openLocationDetails(location)}
              className="w-full bg-[#252a32] rounded-[20px] p-4 text-left hover:bg-[#2a2f38] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-white text-lg font-semibold mb-1">{location.name}</h3>
                  {(location.address || location.city) && (
                    <div className="flex items-center gap-1.5 text-white/60 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {[location.address, location.city].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}
                </div>
                {location.capacity && (
                  <div className="flex items-center gap-1.5 bg-[#D2F159]/10 rounded-full px-3 py-1">
                    <Users className="w-3.5 h-3.5 text-[#D2F159]" />
                    <span className="text-[#D2F159] text-xs font-medium">{location.capacity} fő</span>
                  </div>
                )}
              </div>

              {/* Contact preview */}
              {(location.phone || location.email) && (
                <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-3">
                  {location.phone && (
                    <div className="flex items-center gap-1.5 text-white/40 text-sm">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{location.phone}</span>
                    </div>
                  )}
                  {location.email && (
                    <div className="flex items-center gap-1.5 text-white/40 text-sm">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{location.email}</span>
                    </div>
                  )}
                </div>
              )}
            </button>
          ))
        ) : (
          <div className="text-center py-12 text-white/40">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>{searchQuery ? "Nincs találat" : "Még nincsenek helyszínek"}</p>
            {!searchQuery && (
              <button
                onClick={openCreateMode}
                className="mt-4 text-[#D2F159] text-sm font-medium"
              >
                + Új helyszín hozzáadása
              </button>
            )}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={openCreateMode}
        className="fixed bottom-24 right-6 w-14 h-14 bg-[#D2F159] rounded-full flex items-center justify-center shadow-lg z-30 active:scale-95 transition-transform"
      >
        <Plus className="w-6 h-6 text-[#171725]" />
      </button>

      {/* Location Details Modal */}
      {selectedLocation && !isEditing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center">
          <div className="bg-[#252a32] rounded-t-[32px] w-full max-h-[85vh] overflow-hidden animate-slide-in-bottom">
            {/* Modal Header */}
            <div className="relative p-6 pb-4 border-b border-white/10">
              {/* Close Button */}
              <button
                onClick={closeLocationDetails}
                className="absolute top-4 right-4 w-10 h-10 bg-[#333842] rounded-full flex items-center justify-center hover:bg-[#3d434d] transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <h2 className="text-white text-2xl font-semibold pr-12">{selectedLocation.name}</h2>
              {(selectedLocation.address || selectedLocation.city) && (
                <div className="flex items-center gap-1.5 text-white/60 text-sm mt-2">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {[selectedLocation.address, selectedLocation.city].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
              {/* Capacity */}
              {selectedLocation.capacity && (
                <div className="mb-6">
                  <div className="bg-[#333842] rounded-xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#D2F159]/20 flex items-center justify-center">
                      <Users className="w-6 h-6 text-[#D2F159]" />
                    </div>
                    <div>
                      <p className="text-white/40 text-xs">Max. létszám</p>
                      <p className="text-white text-xl font-semibold">{selectedLocation.capacity} fő</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Info */}
              {(selectedLocation.phone || selectedLocation.email) && (
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-3">Elérhetőség</h3>
                  <div className="space-y-2">
                    {selectedLocation.phone && (
                      <a
                        href={`tel:${selectedLocation.phone.replace(/\s/g, "")}`}
                        className="flex items-center gap-3 bg-[#333842] rounded-xl p-3 hover:bg-[#3d434d] transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-[#D2F159]/20 flex items-center justify-center">
                          <Phone className="w-5 h-5 text-[#D2F159]" />
                        </div>
                        <span className="text-white">{selectedLocation.phone}</span>
                      </a>
                    )}
                    {selectedLocation.email && (
                      <a
                        href={`mailto:${selectedLocation.email}`}
                        className="flex items-center gap-3 bg-[#333842] rounded-xl p-3 hover:bg-[#3d434d] transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-[#D2F159]/20 flex items-center justify-center">
                          <Mail className="w-5 h-5 text-[#D2F159]" />
                        </div>
                        <span className="text-white">{selectedLocation.email}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={deleteLocation}
                  disabled={deleting}
                  className="w-14 h-12 rounded-full border border-[#ea3a3d]/40 flex items-center justify-center hover:bg-[#ea3a3d]/10 transition-colors disabled:opacity-50"
                >
                  {deleting ? (
                    <Loader2 className="w-5 h-5 text-[#ea3a3d] animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5 text-[#ea3a3d]" />
                  )}
                </button>
                <button
                  onClick={closeLocationDetails}
                  className="flex-1 py-3 rounded-full border border-white/20 text-white text-sm font-medium"
                >
                  Bezárás
                </button>
                <button
                  onClick={openEditMode}
                  className="flex-1 py-3 rounded-full bg-[#D2F159] text-[#171725] text-sm font-medium"
                >
                  Szerkesztés
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Location Modal */}
      {(isEditing || isCreating) && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#252a32] rounded-[24px] w-full max-w-md max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-white text-xl font-semibold">
                {isCreating ? "Új helyszín" : "Helyszín szerkesztése"}
              </h2>
              <button
                onClick={closeEditMode}
                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-4">
              {/* Name */}
              <div>
                <label className="text-white/60 text-xs mb-1 block">Helyszín neve *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="pl. Suzuki Aréna"
                  className="w-full bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159] placeholder:text-white/30"
                />
              </div>

              {/* Address */}
              <div>
                <label className="text-white/60 text-xs mb-1 block">Cím</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="pl. Bajcsy-Zsilinszky út 12."
                  className="w-full bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159] placeholder:text-white/30"
                />
              </div>

              {/* City */}
              <div>
                <label className="text-white/60 text-xs mb-1 block">Város</label>
                <input
                  type="text"
                  value={editForm.city}
                  onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="pl. Budapest"
                  className="w-full bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159] placeholder:text-white/30"
                />
              </div>

              {/* Capacity */}
              <div>
                <label className="text-white/60 text-xs mb-1 block">Max. létszám</label>
                <input
                  type="number"
                  value={editForm.capacity}
                  onChange={(e) => setEditForm(prev => ({ ...prev, capacity: e.target.value }))}
                  placeholder="pl. 30"
                  className="w-full bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159] placeholder:text-white/30"
                />
              </div>

              {/* Divider */}
              <div className="border-t border-white/10 pt-4">
                <h3 className="text-white font-semibold mb-4">Elérhetőség</h3>
              </div>

              {/* Phone */}
              <div>
                <label className="text-white/60 text-xs mb-1 block">Telefonszám</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+36 30 123 4567"
                  className="w-full bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159] placeholder:text-white/30"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-white/60 text-xs mb-1 block">Email cím</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="info@example.com"
                  className="w-full bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159] placeholder:text-white/30"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 p-6 border-t border-white/10">
              <button
                onClick={closeEditMode}
                className="flex-1 py-3 rounded-full border border-white/20 text-white text-sm font-medium"
                disabled={saving}
              >
                Mégse
              </button>
              <button
                onClick={saveLocation}
                disabled={saving || !editForm.name.trim()}
                className="flex-1 py-3 rounded-full bg-[#D2F159] text-[#171725] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mentés...
                  </>
                ) : (
                  isCreating ? "Létrehozás" : "Mentés"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <MobileNavbar />
    </div>
    </div>
  )
}
