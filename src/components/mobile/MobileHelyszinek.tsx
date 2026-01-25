"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { X, MapPin, Clock, Users, Calendar, Phone, Mail, Globe, Plus, Trash2 } from "lucide-react"
import { MobileNavbar } from "./MobileNavbar"

interface Location {
  id: string
  name: string
  address: string
  city: string
  thumbnail: string
  capacity: number
  activeGroups: number
  contact?: {
    phone?: string
    email?: string
    website?: string
  }
  schedule?: {
    day: string
    time: string
    group: string
  }[]
  amenities?: string[]
}

interface EditForm {
  name: string
  address: string
  city: string
  capacity: string
  phone: string
  email: string
  website: string
  amenities: string[]
  newAmenity: string
}

const mockLocations: Location[] = [
  {
    id: "suzuki-arena",
    name: "Suzuki Aréna",
    address: "Bajcsy-Zsilinszky út 12.",
    city: "Esztergom",
    thumbnail: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop",
    capacity: 50,
    activeGroups: 3,
    contact: {
      phone: "+36 33 123 456",
      email: "info@suzukiarena.hu",
      website: "www.suzukiarena.hu",
    },
    schedule: [
      { day: "Hétfő", time: "17:00 - 18:30", group: "Iskolás csoport" },
      { day: "Szerda", time: "17:00 - 18:30", group: "Iskolás csoport" },
      { day: "Szerda", time: "19:00 - 20:30", group: "Felnőtt hobbi csoport" },
      { day: "Péntek", time: "18:00 - 19:30", group: "Felnőtt hobbi csoport" },
    ],
    amenities: ["Öltöző", "Zuhanyzó", "Parkoló", "Légkondicionálás", "Tükrös fal"],
  },
  {
    id: "sport-centrum",
    name: "Sport Centrum",
    address: "Kossuth Lajos utca 45.",
    city: "Dorog",
    thumbnail: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=300&fit=crop",
    capacity: 30,
    activeGroups: 1,
    contact: {
      phone: "+36 33 456 789",
      email: "sportcentrum@dorog.hu",
    },
    schedule: [
      { day: "Kedd", time: "18:00 - 19:30", group: "Kezdő csoport" },
      { day: "Csütörtök", time: "18:00 - 19:30", group: "Kezdő csoport" },
    ],
    amenities: ["Öltöző", "Zuhanyzó", "Parkoló"],
  },
  {
    id: "iskola-tornaterem",
    name: "Dobó István Gimnázium",
    address: "Petőfi Sándor u. 20.",
    city: "Esztergom",
    thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    capacity: 40,
    activeGroups: 2,
    contact: {
      phone: "+36 33 789 012",
      email: "titkarsag@dobogimnazium.hu",
      website: "www.dobogimnazium.hu",
    },
    schedule: [
      { day: "Hétfő", time: "15:00 - 16:30", group: "Iskolás csoport" },
      { day: "Csütörtök", time: "15:00 - 16:30", group: "Versenyzők" },
    ],
    amenities: ["Öltöző", "Tükrös fal"],
  },
  {
    id: "fitness-park",
    name: "FitPark Wellness",
    address: "Árpád út 88.",
    city: "Tatabánya",
    thumbnail: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=300&fit=crop",
    capacity: 25,
    activeGroups: 1,
    contact: {
      phone: "+36 34 567 890",
      email: "hello@fitparkwellness.hu",
      website: "www.fitparkwellness.hu",
    },
    schedule: [
      { day: "Szombat", time: "10:00 - 12:00", group: "Hétvégi intenzív" },
    ],
    amenities: ["Öltöző", "Zuhanyzó", "Parkoló", "Légkondicionálás", "Szauna", "Büfé"],
  },
]

export function MobileHelyszinek() {
  const router = useRouter()
  const [locations, setLocations] = useState<Location[]>(mockLocations)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<EditForm>({
    name: "",
    address: "",
    city: "",
    capacity: "",
    phone: "",
    email: "",
    website: "",
    amenities: [],
    newAmenity: "",
  })

  const filteredLocations = locations.filter(location => {
    const matchesSearch = searchQuery === "" ||
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const openLocationDetails = (location: Location) => {
    setSelectedLocation(location)
    setIsEditing(false)
  }

  const closeLocationDetails = () => {
    setSelectedLocation(null)
    setIsEditing(false)
  }

  const openEditMode = () => {
    if (!selectedLocation) return
    setEditForm({
      name: selectedLocation.name,
      address: selectedLocation.address,
      city: selectedLocation.city,
      capacity: selectedLocation.capacity.toString(),
      phone: selectedLocation.contact?.phone || "",
      email: selectedLocation.contact?.email || "",
      website: selectedLocation.contact?.website || "",
      amenities: selectedLocation.amenities || [],
      newAmenity: "",
    })
    setIsEditing(true)
  }

  const closeEditMode = () => {
    setIsEditing(false)
  }

  const addAmenity = () => {
    if (editForm.newAmenity.trim()) {
      setEditForm(prev => ({
        ...prev,
        amenities: [...prev.amenities, prev.newAmenity.trim()],
        newAmenity: "",
      }))
    }
  }

  const removeAmenity = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }))
  }

  const saveLocation = () => {
    if (!selectedLocation) return

    const updatedLocation: Location = {
      ...selectedLocation,
      name: editForm.name,
      address: editForm.address,
      city: editForm.city,
      capacity: parseInt(editForm.capacity) || selectedLocation.capacity,
      contact: {
        phone: editForm.phone || undefined,
        email: editForm.email || undefined,
        website: editForm.website || undefined,
      },
      amenities: editForm.amenities,
    }

    setLocations(prev => prev.map(loc =>
      loc.id === selectedLocation.id ? updatedLocation : loc
    ))
    setSelectedLocation(updatedLocation)
    setIsEditing(false)
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
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#D2F159]" />
              <span className="text-white/60 text-sm">{locations.reduce((acc, loc) => acc + loc.activeGroups, 0)} aktív csoport</span>
            </div>
          </div>
        </div>
      </div>

      {/* Locations Grid */}
      <div className="px-6 mt-4 space-y-4">
        {filteredLocations.length > 0 ? (
          filteredLocations.map((location) => (
            <div
              key={location.id}
              className="bg-[#252a32] rounded-[24px] overflow-hidden"
            >
              {/* Thumbnail */}
              <div className="relative h-36 w-full">
                <img
                  src={location.thumbnail}
                  alt={location.name}
                  className="w-full h-full object-cover"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#252a32] to-transparent" />

                {/* Edit Button */}
                <button
                  onClick={() => openLocationDetails(location)}
                  className="absolute top-3 right-3 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/60 transition-colors"
                >
                  <Image src="/icons/edit-icon.svg" alt="Szerkesztés" width={18} height={18} />
                </button>

                {/* Active groups badge */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-[#D2F159] rounded-full px-3 py-1">
                  <Users className="w-3.5 h-3.5 text-[#171725]" />
                  <span className="text-[#171725] text-xs font-medium">{location.activeGroups} csoport</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-white text-lg font-semibold mb-1">{location.name}</h3>
                <div className="flex items-center gap-1.5 text-white/60 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{location.address}, {location.city}</span>
                </div>

                {/* Schedule preview */}
                {location.schedule && location.schedule.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-1.5 text-white/40 text-xs mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Következő edzések</span>
                    </div>
                    <div className="space-y-1">
                      {location.schedule.slice(0, 2).map((slot, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-white/80">{slot.day}</span>
                          <span className="text-[#D2F159]">{slot.time}</span>
                        </div>
                      ))}
                      {location.schedule.length > 2 && (
                        <button
                          onClick={() => openLocationDetails(location)}
                          className="text-white/40 text-xs hover:text-white/60 transition-colors"
                        >
                          +{location.schedule.length - 2} további időpont
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-white/40">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>Nincs találat</p>
          </div>
        )}
      </div>

      {/* Location Details Modal */}
      {selectedLocation && !isEditing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center">
          <div className="bg-[#252a32] rounded-t-[32px] w-full max-h-[85vh] overflow-hidden animate-slide-in-bottom">
            {/* Modal Header with Image */}
            <div className="relative h-48 w-full">
              <img
                src={selectedLocation.thumbnail}
                alt={selectedLocation.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#252a32] via-transparent to-transparent" />

              {/* Close Button */}
              <button
                onClick={closeLocationDetails}
                className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/60 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Title overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-white text-2xl font-semibold">{selectedLocation.name}</h2>
                <div className="flex items-center gap-1.5 text-white/80 text-sm mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedLocation.address}, {selectedLocation.city}</span>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-12rem)]">
              {/* Stats Row */}
              <div className="flex gap-3 mb-6">
                <div className="flex-1 bg-[#333842] rounded-xl p-3 text-center">
                  <Users className="w-5 h-5 text-[#D2F159] mx-auto mb-1" />
                  <p className="text-white text-lg font-semibold">{selectedLocation.activeGroups}</p>
                  <p className="text-white/40 text-xs">Aktív csoport</p>
                </div>
                <div className="flex-1 bg-[#333842] rounded-xl p-3 text-center">
                  <Users className="w-5 h-5 text-[#D2F159] mx-auto mb-1" />
                  <p className="text-white text-lg font-semibold">{selectedLocation.capacity}</p>
                  <p className="text-white/40 text-xs">Max. létszám</p>
                </div>
              </div>

              {/* Contact Info */}
              {selectedLocation.contact && (
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-3">Elérhetőség</h3>
                  <div className="space-y-2">
                    {selectedLocation.contact.phone && (
                      <a
                        href={`tel:${selectedLocation.contact.phone.replace(/\s/g, "")}`}
                        className="flex items-center gap-3 bg-[#333842] rounded-xl p-3 hover:bg-[#3d434d] transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-[#D2F159]/20 flex items-center justify-center">
                          <Phone className="w-5 h-5 text-[#D2F159]" />
                        </div>
                        <span className="text-white">{selectedLocation.contact.phone}</span>
                      </a>
                    )}
                    {selectedLocation.contact.email && (
                      <a
                        href={`mailto:${selectedLocation.contact.email}`}
                        className="flex items-center gap-3 bg-[#333842] rounded-xl p-3 hover:bg-[#3d434d] transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-[#D2F159]/20 flex items-center justify-center">
                          <Mail className="w-5 h-5 text-[#D2F159]" />
                        </div>
                        <span className="text-white">{selectedLocation.contact.email}</span>
                      </a>
                    )}
                    {selectedLocation.contact.website && (
                      <a
                        href={`https://${selectedLocation.contact.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-[#333842] rounded-xl p-3 hover:bg-[#3d434d] transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-[#D2F159]/20 flex items-center justify-center">
                          <Globe className="w-5 h-5 text-[#D2F159]" />
                        </div>
                        <span className="text-white">{selectedLocation.contact.website}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Schedule - Read Only with Note */}
              {selectedLocation.schedule && selectedLocation.schedule.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold">Edzésrend</h3>
                    <span className="text-white/40 text-xs">Edzések panelen szerkeszthető</span>
                  </div>
                  <div className="bg-[#333842] rounded-xl overflow-hidden">
                    {selectedLocation.schedule.map((slot, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 ${
                          index !== selectedLocation.schedule!.length - 1 ? "border-b border-white/10" : ""
                        }`}
                      >
                        <div>
                          <p className="text-white font-medium">{slot.day}</p>
                          <p className="text-white/40 text-sm">{slot.group}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#D2F159]" />
                          <span className="text-[#D2F159] text-sm">{slot.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities */}
              {selectedLocation.amenities && selectedLocation.amenities.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-3">Felszereltség</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedLocation.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="bg-[#333842] text-white/80 text-sm px-3 py-1.5 rounded-full"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
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

      {/* Edit Location Modal */}
      {selectedLocation && isEditing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#252a32] rounded-[24px] w-full max-w-md max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-white text-xl font-semibold">Helyszín szerkesztése</h2>
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
                <label className="text-white/60 text-xs mb-1 block">Helyszín neve</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159]"
                />
              </div>

              {/* Address */}
              <div>
                <label className="text-white/60 text-xs mb-1 block">Cím</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159]"
                />
              </div>

              {/* City */}
              <div>
                <label className="text-white/60 text-xs mb-1 block">Város</label>
                <input
                  type="text"
                  value={editForm.city}
                  onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159]"
                />
              </div>

              {/* Capacity */}
              <div>
                <label className="text-white/60 text-xs mb-1 block">Max. létszám</label>
                <input
                  type="number"
                  value={editForm.capacity}
                  onChange={(e) => setEditForm(prev => ({ ...prev, capacity: e.target.value }))}
                  className="w-full bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159]"
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

              {/* Website */}
              <div>
                <label className="text-white/60 text-xs mb-1 block">Weboldal</label>
                <input
                  type="text"
                  value={editForm.website}
                  onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="www.example.com"
                  className="w-full bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159] placeholder:text-white/30"
                />
              </div>

              {/* Divider */}
              <div className="border-t border-white/10 pt-4">
                <h3 className="text-white font-semibold mb-4">Felszereltség</h3>
              </div>

              {/* Amenities List */}
              <div className="flex flex-wrap gap-2 mb-3">
                {editForm.amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1.5 bg-[#333842] text-white/80 text-sm px-3 py-1.5 rounded-full"
                  >
                    <span>{amenity}</span>
                    <button
                      onClick={() => removeAmenity(index)}
                      className="text-white/40 hover:text-[#ea3a3d] transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Amenity */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editForm.newAmenity}
                  onChange={(e) => setEditForm(prev => ({ ...prev, newAmenity: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      e.stopPropagation()
                      addAmenity()
                    }
                  }}
                  autoComplete="off"
                  placeholder="Új felszereltség hozzáadása..."
                  className="flex-1 bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159] placeholder:text-white/30"
                />
                <button
                  type="button"
                  onClick={addAmenity}
                  className="w-12 h-12 bg-[#D2F159] rounded-lg flex items-center justify-center"
                >
                  <Plus className="w-5 h-5 text-[#171725]" />
                </button>
              </div>

              {/* Info Note */}
              <div className="bg-[#333842]/50 rounded-lg p-3 mt-4">
                <p className="text-white/40 text-xs">
                  Az edzésrend az Edzések panelen szerkeszthető, ahol az edzéseket helyszínekhez és csoportokhoz rendelheted.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 p-6 border-t border-white/10">
              <button
                onClick={closeEditMode}
                className="flex-1 py-3 rounded-full border border-white/20 text-white text-sm font-medium"
              >
                Mégse
              </button>
              <button
                onClick={saveLocation}
                className="flex-1 py-3 rounded-full bg-[#D2F159] text-[#171725] text-sm font-medium"
              >
                Mentés
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
