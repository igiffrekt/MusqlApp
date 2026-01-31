"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Check, X, ChevronDown, ChevronUp, User, Loader2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { MemberDetailPopup } from "./MemberDetailPopup"
import { useMembersStore, type Member } from "@/lib/stores/members-store"

interface ApiGroup {
  id: string
  name: string
  memberCount: number
  dailyFee: number
  monthlyFee: number
}

interface GroupDisplay {
  id: string
  name: string
  location: string
  memberCount: number
  members: Member[]
  isExpanded: boolean
}

export function MobileTaglista() {
  const { data: session } = useSession()
  const router = useRouter()

  // Get members from store
  const members = useMembersStore((state) => state.members)
  const updateMember = useMembersStore((state) => state.updateMember)
  const fetchMembers = useMembersStore((state) => state.fetchMembers)
  const initialized = useMembersStore((state) => state.initialized)
  const storeLoading = useMembersStore((state) => state.loading)

  const [apiGroups, setApiGroups] = useState<ApiGroup[]>([])
  const [loadingGroups, setLoadingGroups] = useState(true)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterDebt, setFilterDebt] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null) // null = all groups
  const [showGroupFilter, setShowGroupFilter] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", email: "", phone: "", guardian: "" })
  const [emailingMember, setEmailingMember] = useState<Member | null>(null)
  const [emailForm, setEmailForm] = useState({ subject: "", message: "" })
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState<{ to: string; name: string; subject: string } | null>(null)
  const [assigningMember, setAssigningMember] = useState<Member | null>(null)
  const [assigningGroups, setAssigningGroups] = useState<string[]>([])
  const [savingGroups, setSavingGroups] = useState(false)
  
  // Member Detail Popup
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  
  // Add Member Modal
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [addMemberForm, setAddMemberForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    guardian: "",
  })
  const [addingMember, setAddingMember] = useState(false)

  // Fetch groups from API
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch("/api/groups")
        if (response.ok) {
          const data = await response.json()
          setApiGroups(data.groups || [])
        }
      } catch (error) {
        console.error("Failed to fetch groups:", error)
      } finally {
        setLoadingGroups(false)
      }
    }
    fetchGroups()
  }, [])

  useEffect(() => {
    // Fetch members from API
    if (!initialized) {
      fetchMembers().finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [initialized, fetchMembers])

  // Build groups from API groups and members
  const regularGroups: GroupDisplay[] = apiGroups.map(groupDef => {
    const groupMembers = members.filter(m => m.groups.includes(groupDef.id))
    return {
      id: groupDef.id,
      name: groupDef.name,
      location: "", // Location not available from groups API
      memberCount: groupMembers.length || groupDef.memberCount,
      members: groupMembers,
      isExpanded: expandedGroups[groupDef.id] || false,
    }
  })

  // Add virtual "Ungrouped" group for members without any groups - always first
  const ungroupedMembers = members.filter(m => m.groups.length === 0)
  const groups: GroupDisplay[] = ungroupedMembers.length > 0
    ? [
        {
          id: "__ungrouped__",
          name: "Nincs csoportban",
          location: "",
          memberCount: ungroupedMembers.length,
          members: ungroupedMembers,
          isExpanded: expandedGroups["__ungrouped__"] || false,
        },
        ...regularGroups
      ]
    : regularGroups

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }))
  }

  const openEditModal = (member: Member) => {
    setEditingMember(member)
    setEditForm({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email || "",
      phone: member.phone || "",
      guardian: member.guardian || "",
    })
  }

  const closeEditModal = () => {
    setEditingMember(null)
    setEditForm({ firstName: "", lastName: "", email: "", phone: "", guardian: "" })
  }

  const saveEditedMember = () => {
    if (!editingMember) return

    updateMember(editingMember.id, {
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      email: editForm.email || undefined,
      phone: editForm.phone || undefined,
      guardian: editForm.guardian || undefined,
    })
    closeEditModal()
  }

  const openEmailModal = (member: Member, isDebtReminder: boolean = false) => {
    setEmailingMember(member)
    if (isDebtReminder) {
      setEmailForm({
        subject: "Fizetési emlékeztető",
        message: `Kedves ${member.firstName}!\n\nSzeretném emlékeztetni, hogy a tagdíj befizetése még nem érkezett meg.\n\nKérem, mielőbb rendezze a tartozását.\n\nKöszönettel,\n${session?.user?.name || "Edző"}`
      })
    } else {
      setEmailForm({ subject: "", message: "" })
    }
  }

  const closeEmailModal = () => {
    setEmailingMember(null)
    setEmailForm({ subject: "", message: "" })
  }

  const sendEmailToMember = async () => {
    if (!emailingMember || !emailingMember.email) return

    setSendingEmail(true)
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: emailingMember.email,
          subject: emailForm.subject,
          message: emailForm.message,
          memberName: `${emailingMember.firstName} ${emailingMember.lastName}`,
        }),
      })

      if (response.ok) {
        // Show success popup with details
        setEmailSuccess({
          to: emailingMember.email,
          name: `${emailingMember.firstName} ${emailingMember.lastName}`,
          subject: emailForm.subject,
        })
        closeEmailModal()
      } else {
        const error = await response.json()
        alert(`Hiba történt: ${error.error || "Ismeretlen hiba"}`)
      }
    } catch (error) {
      console.error("Failed to send email:", error)
      alert("Hiba történt az email küldése közben")
    } finally {
      setSendingEmail(false)
    }
  }

  const openGroupAssignment = (member: Member) => {
    setAssigningMember(member)
    setAssigningGroups([...member.groups])
  }

  const closeGroupAssignment = () => {
    setAssigningMember(null)
    setAssigningGroups([])
  }

  const toggleGroupSelection = (groupId: string) => {
    setAssigningGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  const saveGroupAssignment = async () => {
    if (!assigningMember) return
    
    setSavingGroups(true)
    try {
      // Get groups to add and remove
      const currentGroups = assigningMember.groups
      const groupsToAdd = assigningGroups.filter(g => !currentGroups.includes(g))
      const groupsToRemove = currentGroups.filter(g => !assigningGroups.includes(g))

      // Add to new groups
      for (const groupId of groupsToAdd) {
        await fetch(`/api/groups/${groupId}/students`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId: assigningMember.id })
        })
      }

      // Remove from old groups
      for (const groupId of groupsToRemove) {
        await fetch(`/api/groups/${groupId}/students/${assigningMember.id}`, {
          method: "DELETE"
        })
      }

      // Refresh members
      await fetchMembers()
      closeGroupAssignment()
    } catch (error) {
      console.error("Failed to update group assignment:", error)
      alert("Hiba történt a csoport hozzárendelés során")
    } finally {
      setSavingGroups(false)
    }
  }

  const handleAddMember = async () => {
    if (!addMemberForm.firstName || !addMemberForm.lastName) return
    
    setAddingMember(true)
    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: addMemberForm.firstName,
          lastName: addMemberForm.lastName,
          email: addMemberForm.email || undefined,
          phone: addMemberForm.phone || undefined,
          guardian: addMemberForm.guardian || undefined,
        }),
      })

      if (response.ok) {
        setIsAddMemberOpen(false)
        setAddMemberForm({ firstName: "", lastName: "", email: "", phone: "", guardian: "" })
        await fetchMembers()
      } else {
        const error = await response.json()
        alert(`Hiba történt: ${error.error || "Ismeretlen hiba"}`)
      }
    } catch (error) {
      console.error("Failed to add member:", error)
      alert("Hiba történt a tag hozzáadása során")
    } finally {
      setAddingMember(false)
    }
  }

  const getStatusBadge = (status: Member["status"], member?: Member, isUngrouped?: boolean) => {
    // Show "Add to group" button for ungrouped members
    if (isUngrouped && member) {
      return (
        <button
          onClick={() => openGroupAssignment(member)}
          className="flex items-center gap-1 bg-[#D2F159]/10 border border-[#D2F159]/40 rounded-full px-2 py-1 hover:bg-[#D2F159]/20 transition-colors"
        >
          <Plus className="w-4 h-4 text-[#D2F159]" />
          <span className="text-[#D2F159] text-[11px] font-normal">Csoporthoz adás</span>
        </button>
      )
    }
    
    if (status === "active") {
      return (
        <div className="flex items-center gap-1 bg-[#1ad598]/10 border border-[#1ad598]/40 rounded-full px-2 py-1">
          <Check className="w-4 h-4 text-[#1ad598]" />
          <span className="text-[#1ad598] text-[11px] font-normal">Rendezve</span>
        </div>
      )
    } else if (status === "debt") {
      return (
        <button
          onClick={() => member && openEmailModal(member, true)}
          className="flex items-center gap-1 bg-[#ea3a3d]/10 border border-[#ea3a3d]/40 rounded-full px-2 py-1 hover:bg-[#ea3a3d]/20 transition-colors"
        >
          <X className="w-4 h-4 text-[#ea3a3d]" />
          <span className="text-[#ea3a3d] text-[11px] font-normal">Tartozás</span>
        </button>
      )
    } else if (status === "unsettled") {
      return (
        <div className="flex items-center gap-1 bg-[#f59e0b]/10 border border-[#f59e0b]/40 rounded-full px-2 py-1">
          <span className="w-4 h-4 flex items-center justify-center text-[#f59e0b] text-xs">●</span>
          <span className="text-[#f59e0b] text-[11px] font-normal">Rendezetlen</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-1 bg-[#f59e0b]/10 border border-[#f59e0b]/40 rounded-full px-2 py-1">
        <span className="w-4 h-4 flex items-center justify-center text-[#f59e0b] text-xs">●</span>
        <span className="text-[#f59e0b] text-[11px] font-normal">Rendezetlen</span>
      </div>
    )
  }

  // Get all members with debt status for flat list view
  const allDebtMembers = members.filter(member => {
    const matchesSearch = searchQuery === "" ||
      member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchQuery.toLowerCase())
    return member.status === "debt" && matchesSearch
  })

  // Filter groups based on selected group and search
  const filteredGroups = groups
    .filter(group => selectedGroupId === null || group.id === selectedGroupId)
    .map(group => ({
      ...group,
      members: group.members.filter(member => {
        const matchesSearch = searchQuery === "" ||
          member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.lastName.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesSearch
      })
    }))
    .filter(group => group.members.length > 0 || searchQuery === "")

  const selectedGroupName = selectedGroupId
    ? groups.find(g => g.id === selectedGroupId)?.name || "Csoport"
    : "Összes csoport"

  if (loading || loadingGroups) {
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
            <h1 className="text-white text-xl font-semibold">Tagok listája</h1>
            <button className="w-8 h-8 flex items-center justify-center">
              <Image src="/icons/more-icon.svg" alt="Több" width={32} height={32} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="bg-white/12 border border-[#171725] rounded-lg h-14 flex items-center px-5 gap-4">
            <Image src="/icons/search-icon.svg" alt="" width={24} height={24} />
            <input
              type="text"
              placeholder="Keresés..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white placeholder-white/60 text-sm flex-1 outline-none font-light"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between py-2">
            <div className="relative">
              <button
                onClick={() => setShowGroupFilter(!showGroupFilter)}
                className={cn(
                  "flex items-center gap-1.5 bg-[#20242c]/60 border rounded-full px-3 py-2 transition-all",
                  selectedGroupId ? "border-[#D2F159]/60" : "border-white/12"
                )}
              >
                <Image src="/icons/filter-icon.svg" alt="" width={20} height={20} />
                <span className={cn("text-[13px]", selectedGroupId ? "text-[#D2F159]" : "text-white")}>
                  {selectedGroupId ? groups.find(g => g.id === selectedGroupId)?.name : "Edzés/Csoport"}
                </span>
                <ChevronDown className={cn("w-4 h-4 transition-transform", showGroupFilter && "rotate-180", selectedGroupId ? "text-[#D2F159]" : "text-white/60")} />
              </button>

              {/* Group Filter Dropdown */}
              {showGroupFilter && (
                <div className="absolute top-full left-0 mt-2 bg-[#333842] rounded-xl border border-white/12 overflow-hidden z-20 min-w-[200px] shadow-lg">
                  <button
                    onClick={() => {
                      setSelectedGroupId(null)
                      setShowGroupFilter(false)
                    }}
                    className={cn(
                      "w-full px-4 py-3 text-left text-sm hover:bg-white/5 transition-colors flex items-center justify-between",
                      selectedGroupId === null ? "text-[#D2F159]" : "text-white"
                    )}
                  >
                    <span>Összes csoport</span>
                    {selectedGroupId === null && <Check className="w-4 h-4" />}
                  </button>
                  {groups.map(group => (
                    <button
                      key={group.id}
                      onClick={() => {
                        setSelectedGroupId(group.id)
                        setShowGroupFilter(false)
                      }}
                      className={cn(
                        "w-full px-4 py-3 text-left text-sm hover:bg-white/5 transition-colors flex items-center justify-between",
                        selectedGroupId === group.id ? "text-[#D2F159]" : "text-white"
                      )}
                    >
                      <div>
                        <span>{group.name}</span>
                        <span className="text-white/40 text-xs ml-2">({group.memberCount})</span>
                      </div>
                      {selectedGroupId === group.id && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setFilterDebt(!filterDebt)}
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-1 transition-all",
                filterDebt
                  ? "bg-[#ea3a3d]/30 border-2 border-[#ea3a3d]"
                  : "bg-[#ea3a3d]/10 border border-[#ea3a3d]/40"
              )}
            >
              <X className="w-4 h-4 text-[#ea3a3d]" />
              <span className="text-[#ea3a3d] text-[11px]">Tartozás</span>
              {filterDebt && <span className="text-[#ea3a3d] text-[11px] ml-1">({allDebtMembers.length})</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Click outside to close group filter */}
      {showGroupFilter && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowGroupFilter(false)}
        />
      )}

      {/* Groups or Debt List */}
      <div className="px-6 mt-4 space-y-4">
        {filterDebt ? (
          /* Flat list of all members with debt */
          <div className="flex flex-col gap-4">
            <div className="bg-[#ea3a3d]/10 border border-[#ea3a3d]/40 rounded-[24px] p-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-[#ea3a3d] text-xl tracking-tight">Rendezetlen</h3>
                  <p className="text-white/40 text-sm tracking-tight">{allDebtMembers.length} tag tartozással</p>
                </div>
                <button
                  onClick={() => setFilterDebt(false)}
                  className="flex items-center gap-1 hover:bg-[#ea3a3d]/20 rounded-full p-1 transition-colors"
                >
                  <X className="w-6 h-6 text-[#ea3a3d]" />
                </button>
              </div>
            </div>

            {allDebtMembers.length > 0 ? (
              <div className="flex flex-col">
                {allDebtMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between py-3 px-1"
                  >
                    {/* Name */}
                    <div className="w-16">
                      <p className="text-white font-semibold text-xs">{member.firstName}</p>
                      <p className="text-[#D2F159] text-xs">{member.lastName}</p>
                    </div>

                    {/* Status Badge */}
                    {getStatusBadge(member.status, member)}

                    {/* Action Icons */}
                    <div className="flex items-center gap-3">
                      <a
                        href={member.phone ? `tel:${member.phone.replace(/\s/g, "")}` : "#"}
                        className="opacity-60 hover:opacity-100 transition-opacity"
                      >
                        <Image src="/icons/phone-icon.svg" alt="Hívás" width={15} height={15} />
                      </a>
                      <button
                        onClick={() => openEmailModal(member)}
                        className="opacity-60 hover:opacity-100 transition-opacity"
                      >
                        <Image src="/icons/email-icon.svg" alt="Email" width={20} height={20} />
                      </button>
                      <button
                        onClick={() => openEditModal(member)}
                        className="opacity-60 hover:opacity-100 transition-opacity"
                      >
                        <Image src="/icons/edit-icon.svg" alt="Szerkesztés" width={16} height={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/40">
                Nincs tartozó tag
              </div>
            )}
          </div>
        ) : (
          /* Normal grouped view */
          filteredGroups.map((group) => (
            <div key={group.id} className="flex flex-col gap-4">
              {/* Group Header Card */}
              <button
                onClick={() => toggleGroup(group.id)}
                className="bg-[#333842] rounded-full px-4 py-3 w-full"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-white text-sm font-medium">{group.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-white/60" />
                    <span className="text-white/40 text-xs">{group.memberCount} tag</span>
                    {group.isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-white/40 ml-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white/40 ml-1" />
                    )}
                  </div>
                </div>
              </button>

              {/* Member List */}
              {group.isExpanded && (
                <div className="flex flex-col">
                  {group.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between py-3 px-1"
                    >
                      {/* Name - Clickable */}
                      <button
                        onClick={() => setSelectedMemberId(member.id)}
                        className="w-16 text-left"
                      >
                        <p className="text-white font-semibold text-xs">{member.firstName}</p>
                        <p className="text-[#D2F159] text-xs">{member.lastName}</p>
                      </button>

                      {/* Status Badge or Add to Group button */}
                      {getStatusBadge(member.status, member, group.id === "__ungrouped__")}

                      {/* Action Icons */}
                      <div className="flex items-center gap-3">
                        <a
                          href={member.phone ? `tel:${member.phone.replace(/\s/g, "")}` : "#"}
                          className="opacity-60 hover:opacity-100 transition-opacity"
                        >
                          <Image src="/icons/phone-icon.svg" alt="Hívás" width={15} height={15} />
                        </a>
                        <button
                          onClick={() => openEmailModal(member)}
                          className="opacity-60 hover:opacity-100 transition-opacity"
                        >
                          <Image src="/icons/email-icon.svg" alt="Email" width={20} height={20} />
                        </button>
                        <button
                          onClick={() => openEditModal(member)}
                          className="opacity-60 hover:opacity-100 transition-opacity"
                        >
                          <Image src="/icons/edit-icon.svg" alt="Szerkesztés" width={16} height={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
          <div className="bg-[#252a32] rounded-[24px] w-full max-w-md p-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-semibold">Tag szerkesztése</h2>
              <button
                onClick={closeEditModal}
                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* First Name */}
              <div>
                <label className="text-white/60 text-xs mb-1 block">Vezetéknév</label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159]"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="text-white/60 text-xs mb-1 block">Keresztnév</label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159]"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-white/60 text-xs mb-1 block">Email cím</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159]"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-white/60 text-xs mb-1 block">Telefonszám</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159]"
                />
              </div>

              {/* Guardian */}
              <div>
                <label className="text-white/60 text-xs mb-1 block">Törvényes képviselő</label>
                <input
                  type="text"
                  value={editForm.guardian}
                  onChange={(e) => setEditForm(prev => ({ ...prev, guardian: e.target.value }))}
                  placeholder="18 év alatti tag esetén"
                  className="w-full bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159] placeholder:text-white/30"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeEditModal}
                className="flex-1 py-3 rounded-full border border-white/20 text-white text-sm font-medium"
              >
                Mégse
              </button>
              <button
                onClick={saveEditedMember}
                className="flex-1 py-3 rounded-full bg-[#D2F159] text-[#171725] text-sm font-medium"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Member Modal */}
      {emailingMember && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
          <div className="bg-[#252a32] rounded-[24px] w-full max-w-md p-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-semibold">Üzenet küldése</h2>
              <button
                onClick={closeEmailModal}
                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Recipient Info */}
            <div className="bg-[#333842] rounded-lg p-3 mb-4">
              <p className="text-white/60 text-xs">Címzett</p>
              <p className="text-white text-sm">{emailingMember.firstName} {emailingMember.lastName}</p>
              <p className="text-[#D2F159] text-xs">{emailingMember.email}</p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Subject */}
              <div>
                <label className="text-white/60 text-xs mb-1 block">Tárgy</label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Email tárgya..."
                  className="w-full bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159] placeholder:text-white/30"
                />
              </div>

              {/* Message */}
              <div>
                <label className="text-white/60 text-xs mb-1 block">Üzenet</label>
                <textarea
                  value={emailForm.message}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Írja be üzenetét..."
                  rows={6}
                  className="w-full bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159] placeholder:text-white/30 resize-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeEmailModal}
                className="flex-1 py-3 rounded-full border border-white/20 text-white text-sm font-medium"
                disabled={sendingEmail}
              >
                Mégse
              </button>
              <button
                onClick={sendEmailToMember}
                disabled={sendingEmail || !emailForm.subject || !emailForm.message}
                className="flex-1 py-3 rounded-full bg-[#D2F159] text-[#171725] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingEmail ? "Küldés..." : "Küldés"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Success Modal */}
      {emailSuccess && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
          <div className="bg-[#252a32] rounded-[24px] w-full max-w-md p-6">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-[#D2F159]/20 flex items-center justify-center">
                <Check className="w-10 h-10 text-[#D2F159]" />
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-6">
              <h2 className="text-white text-xl font-semibold mb-2">Email sikeresen elküldve!</h2>
              <p className="text-white/60 text-sm">Az üzenet megérkezett a címzetthez.</p>
            </div>

            {/* Email Details */}
            <div className="bg-[#333842] rounded-xl p-4 mb-6 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D2F159]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-[#D2F159]" />
                </div>
                <div>
                  <p className="text-white/40 text-xs">Címzett</p>
                  <p className="text-white text-sm font-medium">{emailSuccess.name}</p>
                  <p className="text-[#D2F159] text-xs">{emailSuccess.to}</p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#D2F159]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Image src="/icons/email-icon.svg" alt="" width={16} height={16} />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Tárgy</p>
                    <p className="text-white text-sm">{emailSuccess.subject}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#D2F159]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-[#D2F159]" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Állapot</p>
                    <p className="text-[#1ad598] text-sm font-medium">Kézbesítve</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setEmailSuccess(null)}
              className="w-full py-3 rounded-full bg-[#D2F159] text-[#171725] text-sm font-medium"
            >
              Rendben
            </button>
          </div>
        </div>
      )}

      {/* Group Assignment Modal */}
      {assigningMember && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
          <div className="bg-[#252a32] rounded-[24px] w-full max-w-md p-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white text-xl font-semibold">Csoporthoz adás</h2>
                <p className="text-white/60 text-sm mt-1">
                  {assigningMember.firstName} {assigningMember.lastName}
                </p>
              </div>
              <button
                onClick={closeGroupAssignment}
                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Group List */}
            <div className="space-y-2 max-h-64 overflow-y-auto mb-6">
              {apiGroups.length > 0 ? (
                apiGroups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => toggleGroupSelection(group.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-xl border transition-colors",
                      assigningGroups.includes(group.id)
                        ? "bg-[#D2F159]/10 border-[#D2F159]/40"
                        : "bg-[#333842] border-white/12 hover:border-white/24"
                    )}
                  >
                    <span className={cn(
                      "text-sm font-medium",
                      assigningGroups.includes(group.id) ? "text-[#D2F159]" : "text-white"
                    )}>
                      {group.name}
                    </span>
                    {assigningGroups.includes(group.id) && (
                      <Check className="w-5 h-5 text-[#D2F159]" />
                    )}
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-white/40">
                  Nincs elérhető csoport
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={closeGroupAssignment}
                className="flex-1 py-3 rounded-full border border-white/20 text-white text-sm font-medium"
                disabled={savingGroups}
              >
                Mégse
              </button>
              <button
                onClick={saveGroupAssignment}
                disabled={savingGroups || assigningGroups.length === 0}
                className="flex-1 py-3 rounded-full bg-[#D2F159] text-[#171725] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {savingGroups ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mentés...
                  </>
                ) : (
                  "Mentés"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member FAB */}
      <button
        onClick={() => setIsAddMemberOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-[#D2F159] rounded-full flex items-center justify-center shadow-lg hover:bg-[#c5e44d] active:scale-95 transition-all z-40"
        aria-label="Új tag hozzáadása"
      >
        <Plus className="w-7 h-7 text-[#171725]" />
      </button>

      {/* Member Detail Popup */}
      <MemberDetailPopup
        memberId={selectedMemberId || ""}
        isOpen={!!selectedMemberId}
        onClose={() => setSelectedMemberId(null)}
        onPaymentRecorded={() => fetchMembers()}
      />

      {/* Add Member Modal */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
          <div className="bg-[#252a32] rounded-[24px] w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-semibold">Új tag hozzáadása</h2>
              <button
                onClick={() => {
                  setIsAddMemberOpen(false)
                  setAddMemberForm({ firstName: "", lastName: "", email: "", phone: "", guardian: "" })
                }}
                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* First Name */}
              <div>
                <label className="text-white/60 text-xs mb-1 block">Vezetéknév *</label>
                <input
                  type="text"
                  value={addMemberForm.firstName}
                  onChange={(e) => setAddMemberForm(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Kovács"
                  className="w-full bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159] placeholder:text-white/30"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="text-white/60 text-xs mb-1 block">Keresztnév *</label>
                <input
                  type="text"
                  value={addMemberForm.lastName}
                  onChange={(e) => setAddMemberForm(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="János"
                  className="w-full bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159] placeholder:text-white/30"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-white/60 text-xs mb-1 block">Email cím</label>
                <input
                  type="email"
                  value={addMemberForm.email}
                  onChange={(e) => setAddMemberForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="pelda@email.com"
                  className="w-full bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159] placeholder:text-white/30"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-white/60 text-xs mb-1 block">Telefonszám</label>
                <input
                  type="tel"
                  value={addMemberForm.phone}
                  onChange={(e) => setAddMemberForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+36 30 123 4567"
                  className="w-full bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159] placeholder:text-white/30"
                />
              </div>

              {/* Guardian */}
              <div>
                <label className="text-white/60 text-xs mb-1 block">Törvényes képviselő</label>
                <input
                  type="text"
                  value={addMemberForm.guardian}
                  onChange={(e) => setAddMemberForm(prev => ({ ...prev, guardian: e.target.value }))}
                  placeholder="18 év alatti tag esetén"
                  className="w-full bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159] placeholder:text-white/30"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setIsAddMemberOpen(false)
                  setAddMemberForm({ firstName: "", lastName: "", email: "", phone: "", guardian: "" })
                }}
                className="flex-1 py-3 rounded-full border border-white/20 text-white text-sm font-medium"
                disabled={addingMember}
              >
                Mégse
              </button>
              <button
                onClick={handleAddMember}
                disabled={addingMember || !addMemberForm.firstName || !addMemberForm.lastName}
                className="flex-1 py-3 rounded-full bg-[#D2F159] text-[#171725] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {addingMember ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mentés...
                  </>
                ) : (
                  "Hozzáadás"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
    </div>
  )
}
