"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Calendar, Check, ChevronDown, ChevronUp, Users, MapPin, Loader2, X, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMembersStore } from "@/lib/stores/members-store"

// localStorage key for attendance data
const ATTENDANCE_STORAGE_KEY = "musql_attendance_data"

// Helper to get saved attendance from localStorage
const getSavedAttendance = (sessionId: string): Record<string, boolean> => {
  if (typeof window === "undefined") return {}
  try {
    const stored = localStorage.getItem(ATTENDANCE_STORAGE_KEY)
    if (!stored) return {}
    const data = JSON.parse(stored) as Record<string, Record<string, boolean>>
    return data[sessionId] || {}
  } catch {
    return {}
  }
}

// Helper to save attendance to localStorage
const saveAttendanceToStorage = (sessionId: string, attendance: Record<string, boolean>) => {
  if (typeof window === "undefined") return
  try {
    const stored = localStorage.getItem(ATTENDANCE_STORAGE_KEY)
    const data = stored ? JSON.parse(stored) as Record<string, Record<string, boolean>> : {}
    data[sessionId] = attendance
    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error("Failed to save attendance to localStorage:", e)
  }
}

// Check if sessionId is a mock format (session-X-Y or past-X-Y)
const isMockSessionId = (sessionId: string): boolean => {
  return sessionId.startsWith("session-") || sessionId.startsWith("past-")
}

interface Member {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  status: "active" | "inactive" | "debt"
  attended: boolean
}

interface SessionDetail {
  id: string
  title: string
  date: Date
  startTime: string
  endTime: string
  location: string
  locationAddress: string
  group: string
  groupId: string
  status: "scheduled" | "in-progress" | "completed" | "cancelled"
  notes?: string
  members: Member[]
}

// Helper to format date in Hungarian (short format)
const formatFullDate = (date: Date): string => {
  const days = ["Vas", "Hét", "Ke", "Sze", "Csüt", "Pén", "Szo"]
  const months = ["jan.", "feb.", "márc.", "ápr.", "máj.", "jún.", "júl.", "aug.", "szept.", "okt.", "nov.", "dec."]

  const dayName = days[date.getDay()]
  const day = date.getDate()
  const month = months[date.getMonth()]

  return `${month} ${day}. ${dayName}`
}

// Mock members by group
const getMembersByGroup = (groupId: string): Member[] => {
  const membersByGroup: Record<string, Member[]> = {
    "iskolas-csoport": [
      { id: "1", firstName: "Kovács", lastName: "Bence", email: "kovacs.bence@gmail.com", phone: "+36 30 123 4567", status: "active", attended: false },
      { id: "2", firstName: "Nagy", lastName: "Emma", email: "nagy.emma@gmail.com", phone: "+36 20 234 5678", status: "active", attended: false },
      { id: "3", firstName: "Tóth", lastName: "Máté", email: "toth.mate@yahoo.com", phone: "+36 70 345 6789", status: "debt", attended: false },
      { id: "4", firstName: "Szabó", lastName: "Luca", email: "szabo.luca@outlook.hu", phone: "+36 30 456 7890", status: "active", attended: false },
      { id: "5", firstName: "Horváth", lastName: "Ádám", email: "horvath.adam@gmail.com", phone: "+36 20 567 8901", status: "active", attended: false },
      { id: "6", firstName: "Varga", lastName: "Hanna", email: "varga.hanna@freemail.hu", phone: "+36 70 678 9012", status: "debt", attended: false },
      { id: "7", firstName: "Kiss", lastName: "Dávid", email: "kiss.david@gmail.com", phone: "+36 30 789 0123", status: "active", attended: false },
      { id: "8", firstName: "Molnár", lastName: "Zsófia", email: "molnar.zsofia@citromail.hu", phone: "+36 20 890 1234", status: "active", attended: false },
      { id: "9", firstName: "Németh", lastName: "Levente", email: "nemeth.levente@gmail.com", phone: "+36 70 901 2345", status: "debt", attended: false },
      { id: "10", firstName: "Farkas", lastName: "Nóra", email: "farkas.nora@outlook.com", phone: "+36 30 012 3456", status: "active", attended: false },
      { id: "11", firstName: "Balogh", lastName: "Marcell", email: "balogh.marcell@gmail.com", phone: "+36 20 111 2233", status: "active", attended: false },
      { id: "12", firstName: "Papp", lastName: "Lilla", email: "papp.lilla@yahoo.com", phone: "+36 70 222 3344", status: "active", attended: false },
      { id: "13", firstName: "Lakatos", lastName: "Olivér", email: "lakatos.oliver@gmail.com", phone: "+36 30 333 4455", status: "debt", attended: false },
      { id: "14", firstName: "Oláh", lastName: "Réka", email: "olah.reka@freemail.hu", phone: "+36 20 444 5566", status: "active", attended: false },
      { id: "15", firstName: "Simon", lastName: "Bálint", email: "simon.balint@gmail.com", phone: "+36 70 555 6677", status: "active", attended: false },
    ],
    "felnott-hobbi-csoport": [
      { id: "16", firstName: "Fekete", lastName: "István", email: "fekete.istvan@gmail.com", phone: "+36 30 666 7788", status: "active", attended: false },
      { id: "17", firstName: "Török", lastName: "Katalin", email: "torok.katalin@citromail.hu", phone: "+36 20 777 8899", status: "debt", attended: false },
      { id: "18", firstName: "Vincze", lastName: "Péter", email: "vincze.peter@outlook.hu", phone: "+36 70 888 9900", status: "active", attended: false },
      { id: "19", firstName: "Hegedűs", lastName: "Eszter", email: "hegedus.eszter@gmail.com", phone: "+36 30 999 0011", status: "active", attended: false },
      { id: "20", firstName: "Szűcs", lastName: "Tamás", email: "szucs.tamas@yahoo.com", phone: "+36 20 100 2003", status: "debt", attended: false },
      { id: "21", firstName: "Kocsis", lastName: "Anita", email: "kocsis.anita@gmail.com", phone: "+36 70 200 3004", status: "active", attended: false },
      { id: "22", firstName: "Pintér", lastName: "Gábor", email: "pinter.gabor@freemail.hu", phone: "+36 30 300 4005", status: "active", attended: false },
      { id: "23", firstName: "Budai", lastName: "Mónika", email: "budai.monika@gmail.com", phone: "+36 20 400 5006", status: "debt", attended: false },
      { id: "24", firstName: "Antal", lastName: "László", email: "antal.laszlo@outlook.com", phone: "+36 70 500 6007", status: "active", attended: false },
      { id: "25", firstName: "Bodnár", lastName: "Judit", email: "bodnar.judit@gmail.com", phone: "+36 30 600 7008", status: "active", attended: false },
      { id: "26", firstName: "Horváth", lastName: "Tamás", email: "igiffrekt@gmail.com", phone: "+36308655151", status: "active", attended: false },
    ],
    "kezdo-csoport": [
      { id: "27", firstName: "Jakab", lastName: "Márton", email: "jakab.marton@gmail.com", phone: "+36 30 111 2222", status: "active", attended: false },
      { id: "28", firstName: "Fodor", lastName: "Boglárka", email: "fodor.boglarka@gmail.com", phone: "+36 20 222 3333", status: "active", attended: false },
      { id: "29", firstName: "Tímár", lastName: "Zoltán", email: "timar.zoltan@yahoo.com", phone: "+36 70 333 4444", status: "active", attended: false },
      { id: "30", firstName: "Barta", lastName: "Emese", email: "barta.emese@gmail.com", phone: "+36 30 444 5555", status: "active", attended: false },
      { id: "31", firstName: "Kerekes", lastName: "Attila", email: "kerekes.attila@outlook.hu", phone: "+36 20 555 6666", status: "debt", attended: false },
      { id: "32", firstName: "Szalai", lastName: "Dóra", email: "szalai.dora@gmail.com", phone: "+36 70 666 7777", status: "active", attended: false },
    ],
    "versenyzok": [
      { id: "33", firstName: "Major", lastName: "Kristóf", email: "major.kristof@gmail.com", phone: "+36 30 777 8888", status: "active", attended: false },
      { id: "34", firstName: "Szilágyi", lastName: "Petra", email: "szilagyi.petra@gmail.com", phone: "+36 20 888 9999", status: "active", attended: false },
      { id: "35", firstName: "Gál", lastName: "Dominik", email: "gal.dominik@yahoo.com", phone: "+36 70 999 0000", status: "active", attended: false },
      { id: "36", firstName: "Boros", lastName: "Nikolett", email: "boros.nikolett@gmail.com", phone: "+36 30 000 1111", status: "active", attended: false },
      { id: "37", firstName: "Fehér", lastName: "Ákos", email: "feher.akos@outlook.hu", phone: "+36 20 111 0000", status: "active", attended: false },
    ],
    "hetvegi-intenziv": [
      { id: "38", firstName: "Lengyel", lastName: "Gergő", email: "lengyel.gergo@gmail.com", phone: "+36 30 123 9999", status: "active", attended: false },
      { id: "39", firstName: "Vida", lastName: "Enikő", email: "vida.eniko@gmail.com", phone: "+36 20 234 8888", status: "active", attended: false },
      { id: "40", firstName: "Kozma", lastName: "Richárd", email: "kozma.richard@yahoo.com", phone: "+36 70 345 7777", status: "active", attended: false },
      { id: "41", firstName: "Fazekas", lastName: "Virág", email: "fazekas.virag@gmail.com", phone: "+36 30 456 6666", status: "debt", attended: false },
      { id: "42", firstName: "Orbán", lastName: "Milán", email: "orban.milan@outlook.hu", phone: "+36 20 567 5555", status: "active", attended: false },
      { id: "43", firstName: "Katona", lastName: "Sára", email: "katona.sara@gmail.com", phone: "+36 70 678 4444", status: "active", attended: false },
      { id: "44", firstName: "Faragó", lastName: "Benjámin", email: "farago.benjamin@gmail.com", phone: "+36 30 789 3333", status: "active", attended: false },
      { id: "45", firstName: "Somogyi", lastName: "Flóra", email: "somogyi.flora@yahoo.com", phone: "+36 20 890 2222", status: "active", attended: false },
    ],
  }

  return membersByGroup[groupId] || []
}

// Mock session detail generator
const getSessionDetail = (sessionId: string): SessionDetail | null => {
  // Parse session ID to extract info
  // Format: session-{dayOffset}-{index} or past-{dayOffset}-{index}
  const isPast = sessionId.startsWith("past-")
  const parts = sessionId.split("-")

  if (parts.length < 3) return null

  const dayOffset = parseInt(parts[1])
  const now = new Date()
  const sessionDate = new Date(now)

  if (isPast) {
    sessionDate.setDate(sessionDate.getDate() - dayOffset)
  } else {
    sessionDate.setDate(sessionDate.getDate() + dayOffset)
  }

  // Determine session type based on day of week and index
  const dayOfWeek = sessionDate.getDay()
  const sessionIndex = parts[2]

  let sessionData: { title: string; group: string; groupId: string; location: string; locationAddress: string; time: string; endTime: string } | null = null

  if (dayOfWeek === 1) {
    sessionData = { title: "Iskolás csoport edzés", group: "Iskolás csoport", groupId: "iskolas-csoport", location: "Suzuki Aréna", locationAddress: "Esztergom, Bajcsy-Zsilinszky út 12.", time: "17:00", endTime: "18:30" }
  } else if (dayOfWeek === 2) {
    sessionData = { title: "Kezdő csoport edzés", group: "Kezdő csoport", groupId: "kezdo-csoport", location: "Sport Centrum", locationAddress: "Dorog, Kossuth Lajos utca 45.", time: "18:00", endTime: "19:30" }
  } else if (dayOfWeek === 3) {
    if (sessionIndex === "3a") {
      sessionData = { title: "Iskolás csoport edzés", group: "Iskolás csoport", groupId: "iskolas-csoport", location: "Suzuki Aréna", locationAddress: "Esztergom, Bajcsy-Zsilinszky út 12.", time: "17:00", endTime: "18:30" }
    } else {
      sessionData = { title: "Felnőtt hobbi edzés", group: "Felnőtt hobbi csoport", groupId: "felnott-hobbi-csoport", location: "Suzuki Aréna", locationAddress: "Esztergom, Bajcsy-Zsilinszky út 12.", time: "19:00", endTime: "20:30" }
    }
  } else if (dayOfWeek === 4) {
    if (sessionIndex === "4a") {
      sessionData = { title: "Kezdő csoport edzés", group: "Kezdő csoport", groupId: "kezdo-csoport", location: "Sport Centrum", locationAddress: "Dorog, Kossuth Lajos utca 45.", time: "18:00", endTime: "19:30" }
    } else {
      sessionData = { title: "Versenyző edzés", group: "Versenyzők", groupId: "versenyzok", location: "Dobó István Gimnázium", locationAddress: "Esztergom, Petőfi Sándor u. 20.", time: "15:00", endTime: "16:30" }
    }
  } else if (dayOfWeek === 5) {
    sessionData = { title: "Felnőtt hobbi edzés", group: "Felnőtt hobbi csoport", groupId: "felnott-hobbi-csoport", location: "Suzuki Aréna", locationAddress: "Esztergom, Bajcsy-Zsilinszky út 12.", time: "18:00", endTime: "19:30" }
  } else if (dayOfWeek === 6) {
    sessionData = { title: "Hétvégi intenzív", group: "Hétvégi intenzív", groupId: "hetvegi-intenziv", location: "FitPark Wellness", locationAddress: "Tatabánya, Árpád út 88.", time: "10:00", endTime: "12:00" }
  }

  if (!sessionData) return null

  // Get saved attendance from localStorage
  const savedAttendance = getSavedAttendance(sessionId)

  // Get members and apply saved attendance, or random for past sessions without saved data
  const members = getMembersByGroup(sessionData.groupId).map(m => {
    // If we have saved attendance for this member, use it
    if (savedAttendance[m.id] !== undefined) {
      return { ...m, attended: savedAttendance[m.id] }
    }
    // For past sessions without saved data, generate random attendance
    if (isPast) {
      return { ...m, attended: Math.random() > 0.3 }
    }
    // For upcoming sessions without saved data, default to not attended
    return { ...m, attended: false }
  })

  return {
    id: sessionId,
    title: sessionData.title,
    date: sessionDate,
    startTime: sessionData.time,
    endTime: sessionData.endTime,
    location: sessionData.location,
    locationAddress: sessionData.locationAddress,
    group: sessionData.group,
    groupId: sessionData.groupId,
    status: isPast ? "completed" : "scheduled",
    members,
  }
}

interface Props {
  sessionId: string
}

export function MobileSessionDetail({ sessionId }: Props) {
  const router = useRouter()
  const [session, setSession] = useState<SessionDetail | null>(null)
  const [showAllMembers, setShowAllMembers] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  // Members store for refreshing after adding
  const resetMembersStore = useMembersStore((state) => state.reset)

  // Add member modal state
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMemberForm, setNewMemberForm] = useState({ firstName: "", lastName: "", email: "", phone: "", guardian: "" })
  const [addingMember, setAddingMember] = useState(false)

  // Fetch session data
  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true)

      // Try mock data first for mock IDs
      if (isMockSessionId(sessionId)) {
        const mockSession = getSessionDetail(sessionId)
        if (mockSession) {
          setSession(mockSession)
          setLoading(false)
          return
        }
      }

      // Fetch from API for real session IDs
      try {
        const response = await fetch(`/api/sessions/${sessionId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch session")
        }
        const responseData = await response.json()
        const data = responseData.session

        if (!data) {
          throw new Error("Session not found in response")
        }

        // Transform API response to SessionDetail format
        const locationData = data.locationRef || null
        const locationName = locationData?.name || data.location || "Nincs helyszín"
        const locationAddress = locationData
          ? `${locationData.address || ""}${locationData.city ? `, ${locationData.city}` : ""}`
          : ""

        // Build attendance map from existing records
        const attendanceMap = new Map<string, boolean>()
        ;(data.attendances || []).forEach((attendance: {
          studentId: string
          status: string
        }) => {
          attendanceMap.set(attendance.studentId, attendance.status === "PRESENT")
        })

        // Fetch all students from organization to show full member list
        let allMembers: Member[] = []
        try {
          const studentsResponse = await fetch("/api/students")
          if (studentsResponse.ok) {
            const studentsData = await studentsResponse.json()
            allMembers = (studentsData.students || []).map((s: {
              id: string
              firstName: string
              lastName: string
              email?: string
              phone?: string
              status: string
            }) => ({
              id: s.id,
              firstName: s.firstName,
              lastName: s.lastName,
              email: s.email,
              phone: s.phone,
              status: s.status?.toLowerCase() === "active" ? "active" as const : "active" as const,
              attended: attendanceMap.get(s.id) || false,
            }))
          }
        } catch (e) {
          console.error("Failed to fetch students:", e)
          // Fall back to just attendance records
          allMembers = (data.attendances || []).map((attendance: {
            studentId: string
            status: string
            student: { id: string; firstName: string; lastName: string }
          }) => ({
            id: attendance.student?.id || attendance.studentId,
            firstName: attendance.student?.firstName || "Ismeretlen",
            lastName: attendance.student?.lastName || "",
            email: undefined,
            phone: undefined,
            status: "active" as const,
            attended: attendance.status === "PRESENT",
          }))
        }

        const apiSession: SessionDetail = {
          id: data.id,
          title: data.title,
          date: new Date(data.startTime),
          startTime: new Date(data.startTime).toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit", hour12: false }),
          endTime: new Date(data.endTime).toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit", hour12: false }),
          location: locationName,
          locationAddress: locationAddress,
          group: data.title || "Edzés",
          groupId: "",
          status: data.status === "COMPLETED" ? "completed" : data.status === "CANCELLED" ? "cancelled" : "scheduled",
          members: allMembers,
        }
        setSession(apiSession)
      } catch (error) {
        console.error("Failed to fetch session:", error)
        // Try mock data as fallback
        const mockSession = getSessionDetail(sessionId)
        setSession(mockSession)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [sessionId])

  const attendedCount = useMemo(() => {
    return session?.members.filter(m => m.attended).length || 0
  }, [session])

  const totalCount = session?.members.length || 0

  const toggleAttendance = (memberId: string) => {
    if (!session) return

    setSession(prev => {
      if (!prev) return prev
      return {
        ...prev,
        members: prev.members.map(m =>
          m.id === memberId ? { ...m, attended: !m.attended } : m
        ),
      }
    })
  }

  const markAllPresent = () => {
    if (!session) return
    setSession(prev => {
      if (!prev) return prev
      return {
        ...prev,
        members: prev.members.map(m => ({ ...m, attended: true })),
      }
    })
  }

  const markAllAbsent = () => {
    if (!session) return
    setSession(prev => {
      if (!prev) return prev
      return {
        ...prev,
        members: prev.members.map(m => ({ ...m, attended: false })),
      }
    })
  }

  const handleAddMember = async () => {
    if (!newMemberForm.firstName.trim() || !newMemberForm.lastName.trim()) return

    setAddingMember(true)
    try {
      // Create member via API
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: newMemberForm.firstName.trim(),
          lastName: newMemberForm.lastName.trim(),
          email: newMemberForm.email.trim() || undefined,
          phone: newMemberForm.phone.trim() || undefined,
          guardian: newMemberForm.guardian.trim() || undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const studentId = data.student.id

        // If session has a real group (CUID format), add the student to that group
        // Skip mock groupIds like "iskolas-csoport" which don't exist in DB
        const groupId = session?.groupId
        const isRealGroupId = groupId && groupId.startsWith("c") && groupId.length > 20

        if (isRealGroupId) {
          try {
            await fetch(`/api/students/${studentId}/groups`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ groupId }),
            })
          } catch (e) {
            console.error("Failed to add student to group:", e)
          }
        }

        // Add new member to session with attended = true
        const newMember: Member = {
          id: studentId,
          firstName: data.student.firstName,
          lastName: data.student.lastName,
          email: data.student.email,
          phone: data.student.phone,
          status: "active",
          attended: true,
        }

        setSession(prev => {
          if (!prev) return prev
          return {
            ...prev,
            members: [...prev.members, newMember],
          }
        })

        // Reset members store so it will refetch on next visit to taglista
        resetMembersStore()

        // Reset form and close modal
        setNewMemberForm({ firstName: "", lastName: "", email: "", phone: "", guardian: "" })
        setShowAddMember(false)
      }
    } catch (error) {
      console.error("Failed to add member:", error)
    } finally {
      setAddingMember(false)
    }
  }

  const saveAttendance = async () => {
    if (!session) return
    setSaving(true)

    // Build attendance map for localStorage
    const attendanceMap: Record<string, boolean> = {}
    session.members.forEach(m => {
      attendanceMap[m.id] = m.attended
    })

    // Save to localStorage (works for mock session IDs)
    saveAttendanceToStorage(session.id, attendanceMap)

    // Try to save to API (will work when using real session IDs)
    try {
      const attendanceRecords = session.members.map(m => ({
        studentId: m.id,
        status: m.attended ? "PRESENT" : "ABSENT" as const,
      }))

      await fetch(`/api/sessions/${session.id}/attendance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendance: attendanceRecords }),
      })
    } catch (e) {
      // API call may fail for mock IDs, but localStorage save succeeded
      console.log("API save skipped (mock session ID or not authenticated)")
    }

    setSaving(false)
    router.back()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#171725] flex items-center justify-center font-lufga">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#D2F159] mx-auto mb-3 animate-spin" />
          <p className="text-white/60">Betöltés...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#171725] flex items-center justify-center font-lufga">
        <div className="text-center">
          <Calendar className="w-12 h-12 text-white/40 mx-auto mb-3" />
          <p className="text-white/60">Az edzés nem található</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-[#D2F159] text-[#171725] rounded-full text-sm font-medium"
          >
            Vissza
          </button>
        </div>
      </div>
    )
  }

  const isPast = session.status === "completed"

  return (
    <div className="min-h-screen bg-[#171725] pb-32 font-lufga">
      {/* Header */}
      <div className="px-6 pt-14">
        <div className="flex flex-col gap-4">
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 flex items-center justify-center"
            >
              <Image src="/icons/arrow-back-icon.svg" alt="Vissza" width={32} height={32} />
            </button>
            <h1 className="text-white text-xl font-semibold">Edzés részletei</h1>
            <button className="w-8 h-8 flex items-center justify-center">
              <Image src="/icons/more-icon.svg" alt="Több" width={32} height={32} />
            </button>
          </div>
        </div>
      </div>

      {/* Session Info Card */}
      <div className="px-6 mt-6">
        <div className="bg-[#252a32] rounded-[24px] p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-white text-xl font-semibold mb-1">{session.title}</h2>
              <div className="flex items-center gap-1.5 text-white/40 text-sm mb-2">
                <Users className="w-4 h-4" />
                <span>{session.group}</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/40 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{session.location}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[#D2F159] text-lg font-semibold">{session.startTime}</p>
              <p className="text-white/60 text-sm">{formatFullDate(session.date)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Section */}
      <div className="px-6 mt-6">
        {/* Attendance Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-white text-lg font-semibold">Jelenlét</h3>
            <div className="flex items-center gap-2 bg-[#333842] rounded-full px-3 py-1">
              <div className="w-20 h-1.5 bg-[#252a32] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#D2F159] rounded-full transition-all duration-300"
                  style={{ width: `${totalCount > 0 ? (attendedCount / totalCount) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[#D2F159] text-sm font-medium">
                {attendedCount}/{totalCount}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowAllMembers(!showAllMembers)}
            className="text-white/60"
          >
            {showAllMembers ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={markAllPresent}
            className="flex-1 py-2 rounded-full bg-[#1ad598]/20 text-[#1ad598] text-sm font-medium hover:bg-[#1ad598]/30 transition-colors"
          >
            Mindenki jelen
          </button>
          <button
            onClick={markAllAbsent}
            className="flex-1 py-2 rounded-full bg-[#ea3a3d]/20 text-[#ea3a3d] text-sm font-medium hover:bg-[#ea3a3d]/30 transition-colors"
          >
            Törlés
          </button>
        </div>

        {/* Members List */}
        {showAllMembers && (
          <div className="flex flex-col">
            {session.members.map((member) => (
              <button
                key={member.id}
                onClick={() => toggleAttendance(member.id)}
                className="flex items-center justify-between py-3 px-1"
              >
                {/* Name */}
                <div className="text-left">
                  <p className="text-white font-semibold text-xs">{member.firstName}</p>
                  <p className="text-[#D2F159] text-xs">{member.lastName}</p>
                </div>

                {/* Status Badge */}
                {member.attended ? (
                  <div className="flex items-center gap-1 bg-[#1ad598]/10 border border-[#1ad598]/40 rounded-full px-2 py-1">
                    <Check className="w-4 h-4 text-[#1ad598]" />
                    <span className="text-[#1ad598] text-[11px] font-normal">Jelen</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-[#ea3a3d]/10 border border-[#ea3a3d]/40 rounded-full px-2 py-1">
                    <X className="w-4 h-4 text-[#ea3a3d]" />
                    <span className="text-[#ea3a3d] text-[11px] font-normal">Hiányzik</span>
                  </div>
                )}

                {/* Debt indicator if applicable */}
                {member.status === "debt" && (
                  <div className="flex items-center gap-1 bg-[#ea3a3d]/10 border border-[#ea3a3d]/40 rounded-full px-2 py-1">
                    <span className="text-[#ea3a3d] text-[11px] font-normal">Tartozás</span>
                  </div>
                )}

                {/* Checkbox */}
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                  member.attended
                    ? "border-[#1ad598] bg-[#1ad598]"
                    : "border-white/20"
                )}>
                  {member.attended && <Check className="w-4 h-4 text-white" />}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Member Button */}
      <button
        onClick={() => setShowAddMember(true)}
        className="fixed bottom-24 right-6 bg-[#D2F159] rounded-full flex items-center justify-center shadow-lg z-30 active:scale-95 transition-transform"
        style={{ width: 'calc(var(--spacing) * 14)', height: 'calc(var(--spacing) * 14)' }}
      >
        <Image src="/icons/user-add-icon-dark.svg" alt="Tag hozzáadása" width={32} height={32} />
      </button>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#171725] border-t border-[#333842] p-4 z-40">
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="flex-1 py-3 rounded-full border border-white/20 text-white text-sm font-medium"
          >
            Mégse
          </button>
          <button
            onClick={saveAttendance}
            disabled={saving}
            className="flex-1 py-3 rounded-full bg-[#D2F159] text-[#171725] text-sm font-medium disabled:opacity-50"
          >
            {saving ? "Mentés..." : "Jelenlét mentése"}
          </button>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
          <div className="w-full bg-[#252a32] rounded-t-[24px] p-6 animate-slide-in-bottom">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-lg font-semibold">Új tag hozzáadása</h2>
              <button
                onClick={() => setShowAddMember(false)}
                disabled={addingMember}
                className="w-8 h-8 rounded-full bg-[#333842] flex items-center justify-center disabled:opacity-50"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 text-xs mb-2 block">Vezetéknév *</label>
                  <div className="bg-[#171725] rounded-2xl border border-white/5 px-4 py-3">
                    <input
                      type="text"
                      value={newMemberForm.lastName}
                      onChange={(e) => setNewMemberForm(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Kovács"
                      className="w-full bg-transparent text-white placeholder-white/30 outline-none text-sm"
                      disabled={addingMember}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-white/60 text-xs mb-2 block">Keresztnév *</label>
                  <div className="bg-[#171725] rounded-2xl border border-white/5 px-4 py-3">
                    <input
                      type="text"
                      value={newMemberForm.firstName}
                      onChange={(e) => setNewMemberForm(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="János"
                      className="w-full bg-transparent text-white placeholder-white/30 outline-none text-sm"
                      disabled={addingMember}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-white/60 text-xs mb-2 block">Email cím</label>
                <div className="bg-[#171725] rounded-2xl border border-white/5 px-4 py-3">
                  <input
                    type="email"
                    value={newMemberForm.email}
                    onChange={(e) => setNewMemberForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="kovacs.janos@email.com"
                    className="w-full bg-transparent text-white placeholder-white/30 outline-none text-sm"
                    disabled={addingMember}
                  />
                </div>
              </div>

              <div>
                <label className="text-white/60 text-xs mb-2 block">Telefonszám</label>
                <div className="bg-[#171725] rounded-2xl border border-white/5 px-4 py-3">
                  <input
                    type="tel"
                    value={newMemberForm.phone}
                    onChange={(e) => setNewMemberForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+36 30 123 4567"
                    className="w-full bg-transparent text-white placeholder-white/30 outline-none text-sm"
                    disabled={addingMember}
                  />
                </div>
              </div>

              <div>
                <label className="text-white/60 text-xs mb-2 block">Gondviselő neve (kiskorúak esetén)</label>
                <div className="bg-[#171725] rounded-2xl border border-white/5 px-4 py-3">
                  <input
                    type="text"
                    value={newMemberForm.guardian}
                    onChange={(e) => setNewMemberForm(prev => ({ ...prev, guardian: e.target.value }))}
                    placeholder="Kovács Péter"
                    className="w-full bg-transparent text-white placeholder-white/30 outline-none text-sm"
                    disabled={addingMember}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleAddMember}
              disabled={!newMemberForm.firstName.trim() || !newMemberForm.lastName.trim() || addingMember}
              className={cn(
                "w-full py-4 rounded-full font-semibold text-base transition-all flex items-center justify-center gap-2",
                newMemberForm.firstName.trim() && newMemberForm.lastName.trim() && !addingMember
                  ? "bg-[#D2F159] text-[#171725]"
                  : "bg-[#333842] text-white/40 cursor-not-allowed"
              )}
            >
              {addingMember ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Hozzáadás...
                </>
              ) : (
                "Tag hozzáadása"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
