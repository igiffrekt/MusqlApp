"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Check, X, Bell, Loader2, Shield, Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { MobileProfileMenu, AppInfoModal } from "./MobileProfileMenu"
import { MemberDetailPopup } from "./MemberDetailPopup"
import { MobileNotifications } from "./MobileNotifications"
import { useMembersStore, type Member } from "@/lib/stores/members-store"
import { useNotificationsStore } from "@/lib/stores/notifications-store"

interface UpcomingEvent {
  id: string
  title: string
  location: string
  dateStr: string // ISO string for serialization
  startTime: string
  group: string
  groupId: string
  attendeeCount: number
  maxAttendees: number
}

interface ApiGroup {
  id: string
  name: string
  memberCount: number
  dailyFee: number
  monthlyFee: number
}

interface QuickAction {
  id: string
  label: string
  iconSrc: string
  href: string
}

export function MobileHomepage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([])
  const [activeEventIndex, setActiveEventIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [setupChecked, setSetupChecked] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showAppInfo, setShowAppInfo] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  // Member edit/email modal state
  const [editingMember, setEditingMember] = useState<typeof members[0] | null>(null)
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", email: "", phone: "", guardian: "" })
  const [emailingMember, setEmailingMember] = useState<typeof members[0] | null>(null)
  const [emailForm, setEmailForm] = useState({ subject: "", message: "" })
  const [sendingEmail, setSendingEmail] = useState(false)

  // Group assignment state
  const [apiGroups, setApiGroups] = useState<ApiGroup[]>([])
  const [assigningMember, setAssigningMember] = useState<Member | null>(null)
  const [assigningGroups, setAssigningGroups] = useState<string[]>([])
  const [savingGroups, setSavingGroups] = useState(false)
  
  // Member Detail Popup
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)

  // Check if new org needs setup (no locations yet)
  useEffect(() => {
    const checkSetupNeeded = async () => {
      if (status !== "authenticated" || setupChecked) return

      const role = session?.user?.role
      const userIsAdmin = role === "ADMIN" || role === "TRAINER"

      if (!userIsAdmin) {
        setSetupChecked(true)
        return
      }

      try {
        const response = await fetch("/api/locations")
        if (response.ok) {
          const data = await response.json()
          if (!data.locations || data.locations.length === 0) {
            // New org with no locations - redirect to setup
            router.replace("/setup")
            return
          }
        }
      } catch (err) {
        console.error("Failed to check locations:", err)
      }
      setSetupChecked(true)
    }
    checkSetupNeeded()
  }, [session, status, router, setupChecked])

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
      }
    }
    fetchGroups()
  }, [])

  // Notifications from store
  const notifications = useNotificationsStore((state) => state.notifications)
  const notificationsInitialized = useNotificationsStore((state) => state.initialized)
  const currentNotifUserId = useNotificationsStore((state) => state.currentUserId)
  const fetchNotifications = useNotificationsStore((state) => state.fetchNotifications)
  const resetNotifications = useNotificationsStore((state) => state.reset)
  const unreadCount = notifications.filter((n) => !n.read).length

  // Members from store
  const members = useMembersStore((state) => state.members)
  const initialized = useMembersStore((state) => state.initialized)
  const fetchMembers = useMembersStore((state) => state.fetchMembers)
  const updateMember = useMembersStore((state) => state.updateMember)

  // Get 5 most recent members (sorted by createdAt descending)
  const recentMembers = [...members]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  // Swipe handling state
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  const userName = session?.user?.name || "Felhasználó"
  const organizationName = session?.user?.organization?.name || "Egyesület"
  const userInitials = userName.split(" ").map(n => n[0]).join("").toUpperCase()

  // Fetch members from API
  useEffect(() => {
    if (!initialized) {
      fetchMembers()
    }
  }, [initialized, fetchMembers])

  // Fetch notifications from API on mount or when user changes
  useEffect(() => {
    const userId = session?.user?.id
    // Fetch if not initialized OR if user has changed
    if (!notificationsInitialized || (userId && currentNotifUserId !== userId)) {
      if (userId && currentNotifUserId && currentNotifUserId !== userId) {
        // User changed, reset first
        resetNotifications()
      }
      fetchNotifications(userId)
    }
  }, [session?.user?.id, notificationsInitialized, currentNotifUserId, fetchNotifications, resetNotifications])

  // Fetch upcoming sessions from API
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const now = new Date()
        const endDate = new Date(now)
        endDate.setDate(endDate.getDate() + 14) // Next 14 days

        const response = await fetch(
          `/api/sessions?startDate=${now.toISOString()}&endDate=${endDate.toISOString()}`
        )

        if (!response.ok) {
          if (response.status === 401) {
            setUpcomingEvents([])
            return
          }
          throw new Error("Failed to fetch sessions")
        }

        const data = await response.json()

        // Transform API response to display format and take first 3 upcoming
        const events: UpcomingEvent[] = (data.sessions || [])
          .filter((s: { status: string }) => s.status !== "CANCELLED" && s.status !== "COMPLETED")
          .map((s: {
            id: string
            title: string
            startTime: string
            location?: string
            sessionType?: string
            capacity?: number
            totalMembers?: number
            _count?: { attendances: number }
          }) => {
            const startDate = new Date(s.startTime)
            return {
              id: s.id,
              title: s.title,
              location: s.location || "Nincs megadva",
              dateStr: startDate.toISOString(),
              startTime: startDate.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" }),
              group: s.sessionType || "Edzés",
              groupId: s.sessionType?.toLowerCase().replace(/\s+/g, "-") || "default",
              attendeeCount: s._count?.attendances || 0,
              maxAttendees: s.totalMembers || s.capacity || 1,
            }
          })
          .sort((a: UpcomingEvent, b: UpcomingEvent) => {
            return new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime()
          })
          .slice(0, 3)

        setUpcomingEvents(events)
      } catch (err) {
        console.error("Error fetching sessions:", err)
        setUpcomingEvents([])
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [])

  // Format date in Hungarian
  const formatEventDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    const days = ["Vas", "Hét", "Kedd", "Sze", "Csüt", "Pén", "Szo"]
    const months = ["jan.", "feb.", "márc.", "ápr.", "máj.", "jún.", "júl.", "aug.", "szept.", "okt.", "nov.", "dec."]
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "Ma"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Holnap"
    }
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}.`
  }

  // Minimum swipe distance to trigger navigation (in pixels)
  const minSwipeDistance = 50

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
    setIsDragging(true)
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return
    const currentTouch = e.targetTouches[0].clientX
    setTouchEnd(currentTouch)
    const diff = touchStart - currentTouch
    setDragOffset(-diff)
  }, [touchStart])

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false)
      setDragOffset(0)
      return
    }

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && activeEventIndex < upcomingEvents.length - 1) {
      setActiveEventIndex(prev => prev + 1)
    } else if (isRightSwipe && activeEventIndex > 0) {
      setActiveEventIndex(prev => prev - 1)
    }

    setIsDragging(false)
    setDragOffset(0)
    setTouchStart(null)
    setTouchEnd(null)
  }, [touchStart, touchEnd, activeEventIndex, upcomingEvents.length])

  const quickActions: QuickAction[] = [
    { id: "1", label: "Tagfelvétel", iconSrc: "/icons/user-add-icon.svg", href: "/tagfelvetel" },
    { id: "2", label: "Taglista", iconSrc: "/icons/user-list-icon.svg", href: "/taglista" },
    { id: "3", label: "Időpontok", iconSrc: "/icons/calendar-plus-icon.svg", href: "/idopontok" },
    { id: "4", label: "Pénzügy", iconSrc: "/icons/wallet-icon.svg", href: "/penzugy" },
  ]

  const getStatusBadge = (status: string, member?: typeof members[0]) => {
    // Show "Add to group" button for members without groups
    if (member && member.groups.length === 0) {
      return (
        <button
          onClick={() => openGroupAssignment(member)}
          className="flex items-center gap-1 bg-[#D2F159]/10 border border-[#D2F159]/40 rounded-full px-2 py-1 hover:bg-[#D2F159]/20 transition-colors"
        >
          <Plus className="w-4 h-4 text-[#D2F159]" />
          <span className="text-[#D2F159] text-[11px] font-normal">Csoporthoz adom</span>
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
        <div className="flex items-center gap-1 bg-[#ea3a3d]/10 border border-[#ea3a3d]/40 rounded-full px-2 py-1">
          <X className="w-4 h-4 text-[#ea3a3d]" />
          <span className="text-[#ea3a3d] text-[11px] font-normal">Tartozás</span>
        </div>
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

  // Member modal handlers
  const openEditModal = (member: typeof members[0]) => {
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

  const openEmailModal = (member: typeof members[0]) => {
    setEmailingMember(member)
    setEmailForm({ subject: "", message: "" })
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

  // Group assignment handlers
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

  // Show loading while checking setup or loading data
  if (loading || !setupChecked) {
    return (
      <div className="min-h-screen bg-[#171725] flex items-center justify-center font-lufga">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D2F159]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black font-lufga">
    <div 
      className="min-h-screen relative pb-24 rounded-2xl overflow-hidden mx-[5px] my-[5px]"
      style={{
        background: `linear-gradient(to bottom, #D2F159 0px, #D2F159 260px, #171725 260px, #171725 100%)`
      }}
    >
      {/* Content */}
      <div className="px-6 pt-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <button
            onClick={() => setShowProfileMenu(true)}
            className="focus:outline-none focus:ring-2 focus:ring-[#D2F159] focus:ring-offset-2 focus:ring-offset-[#171725] rounded-full"
          >
            <Avatar className="w-10 h-10 border-2 border-[#171725]">
              <AvatarImage src={session?.user?.image || ""} alt={userName} />
              <AvatarFallback className="bg-[#333842] text-white text-sm">{userInitials}</AvatarFallback>
            </Avatar>
          </button>

          <div className="flex flex-col items-center">
            <span className="text-[#171725] text-xs font-normal tracking-wide">Üdv, {userName}!</span>
            <div className="flex items-center gap-1">
              <Image src="/icons/pin.svg" alt="" width={14} height={14} className="text-[#171725]" />
              <span className="text-[#171725] text-sm font-medium tracking-wide">{organizationName}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Admin link - only for SUPER_ADMIN */}
            {session?.user?.role === "SUPER_ADMIN" && (
              <Link
                href="/admin"
                className="w-7 h-7 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"
              >
                <Shield className="w-4 h-4 text-[#171725]" />
              </Link>
            )}
            <button
              className="w-8 h-8 flex items-center justify-center relative"
              onClick={() => setShowNotifications(true)}
            >
              <Bell className="w-6 h-6 text-[#171725]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#ef4444] text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Upcoming Events Section */}
        <section>
          <h2 className="text-[#171725] text-xl font-semibold mb-4">
            Következő Eseményeim
          </h2>

          {/* Swipeable Event Cards Carousel */}
          {upcomingEvents.length > 0 && (
            <div
              ref={carouselRef}
              className="relative overflow-hidden touch-pan-y"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div
                className={cn(
                  "flex",
                  !isDragging && "transition-transform duration-300 ease-out"
                )}
                style={{
                  transform: `translateX(calc(-${activeEventIndex * 100}% + ${isDragging ? dragOffset : 0}px))`
                }}
              >
                {upcomingEvents.map((event, idx) => (
                  <div
                    key={event.id}
                    className="w-full flex-shrink-0"
                  >
                    <div className="bg-[#252a32] rounded-[24px] overflow-hidden">
                      {/* Card Header */}
                      <div className="bg-[#333842] p-4 rounded-[24px] flex items-center">
                        <div className="flex items-center gap-3.5">
                          <div className="w-[60px] h-[60px] rounded-full bg-[#D2F159] overflow-hidden flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-[#171725]" />
                          </div>
                          <div>
                            <h3 className="text-white text-xl tracking-tight">
                              {event.title}
                            </h3>
                            <p className="text-white/40 text-sm tracking-tight">
                              {event.location}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer - with 20px border radius */}
                      <div className="p-4 rounded-[20px]">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-white/40 text-xs tracking-tight">{formatEventDate(event.dateStr)}</p>
                            <p className="text-white text-lg font-medium tracking-tight">
                              {event.startTime}
                            </p>
                          </div>
                          <Link
                            href={`/idopontok/${event.id}`}
                            className="bg-[#D2F159] rounded-full px-4 py-3 flex items-center gap-2.5 w-[190px] justify-center"
                          >
                            <span className="text-[#171725] text-base font-medium tracking-tight">Részletek</span>
                            <Image src="/icons/arrow-right-icon.svg" alt="" width={24} height={24} />
                          </Link>
                        </div>

                        {/* Attendance indicator */}
                        <div className="pt-3 border-t border-white/10">
                          <div className="flex items-center justify-between">
                            <span className="text-white/40 text-xs">Résztvevők</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-1.5 bg-[#333842] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#D2F159] rounded-full"
                                  style={{ width: `${(event.attendeeCount / event.maxAttendees) * 100}%` }}
                                />
                              </div>
                              <span className="text-white text-sm font-medium">
                                {event.attendeeCount}/{event.maxAttendees}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pagination dots */}
          {upcomingEvents.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              {upcomingEvents.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveEventIndex(idx)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    idx === activeEventIndex ? "w-6 bg-[#D2F159]" : "w-2 bg-white/30"
                  )}
                />
              ))}
            </div>
          )}
        </section>

        {/* Quick Access Section */}
        <section className="mb-6 mt-8">
          <h2 className="text-white text-xl font-semibold mb-4">
            Gyorselérés
          </h2>

          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.id}
                href={action.href}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-16 h-16 bg-[#333842] border border-[#9eb7f2]/15 rounded-xl flex items-center justify-center">
                  <Image src={action.iconSrc} alt={action.label} width={32} height={32} />
                </div>
                <span className="text-white text-xs text-center leading-tight">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Latest Members Section - List View */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-xl font-bold font-nunito">
              Legújabb Tagok
            </h2>
            <Link href="/taglista" className="text-[#D2F159] text-sm font-nunito">
              Összes
            </Link>
          </div>

          <div className="flex flex-col">
            {recentMembers.length > 0 ? recentMembers.map((member) => (
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
            )) : (
              <div className="w-full text-center py-8 text-white/40">
                Nincs új tag
              </div>
            )}
          </div>
        </section>
      </div>


      {/* Profile Menu */}
      <MobileProfileMenu
        isOpen={showProfileMenu}
        onClose={() => setShowProfileMenu(false)}
        onShowInfo={() => setShowAppInfo(true)}
        userName={userName}
        userEmail={session?.user?.email || ""}
      />

      {/* App Info Modal */}
      <AppInfoModal
        isOpen={showAppInfo}
        onClose={() => setShowAppInfo(false)}
      />

      {/* Notifications Panel */}
      <MobileNotifications
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
          <div className="bg-[#252a32] rounded-[24px] w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-semibold">Tag szerkesztése</h2>
              <button
                onClick={closeEditModal}
                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-white/60 text-xs mb-1 block">Vezetéknév</label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159]"
                />
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block">Keresztnév</label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159]"
                />
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block">Email cím</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159]"
                />
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block">Telefonszám</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-[#333842] border border-white/12 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#D2F159]"
                />
              </div>
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-semibold">Üzenet küldése</h2>
              <button
                onClick={closeEmailModal}
                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-[#333842] rounded-lg p-3 mb-4">
              <p className="text-white/60 text-xs">Címzett</p>
              <p className="text-white text-sm">{emailingMember.firstName} {emailingMember.lastName}</p>
              <p className="text-[#D2F159] text-xs">{emailingMember.email}</p>
            </div>

            <div className="space-y-4">
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
                className="flex-1 py-3 rounded-full bg-[#D2F159] text-[#171725] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sendingEmail ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Küldés...
                  </>
                ) : (
                  "Küldés"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Member Detail Popup */}
      <MemberDetailPopup
        memberId={selectedMemberId || ""}
        isOpen={!!selectedMemberId}
        onClose={() => setSelectedMemberId(null)}
        onPaymentRecorded={() => fetchMembers()}
      />

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
    </div>
    </div>
  )
}
