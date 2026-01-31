"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUserProfile } from "@/contexts/UserProfileContext"
import { MobileHomepage } from "@/components/mobile/MobileHomepage"
import { MobileStudentHomepage } from "@/components/mobile/MobileStudentHomepage"
import { useMembersStore } from "@/lib/stores/members-store"
import {
  Calendar,
  Users,
  ArrowRight,
  Plus,
  Wallet,
  UserPlus,
  MapPin,
  Edit3,
  X,
  Check,
  Sparkles,
  Activity,
  ChevronRight,
} from "lucide-react"
import { format, isToday, isTomorrow } from "date-fns"
import { hu } from "date-fns/locale"

interface UpcomingSession {
  id: string
  title: string
  date: string
  time: string
  location: string
  attendeeCount: number
  maxAttendees: number
}

const quickActions = [
  { id: "1", label: "Tagfelvétel", icon: UserPlus, href: "/tagfelvetel", color: "#D2F159" },
  { id: "2", label: "Taglista", icon: Users, href: "/taglista", color: "#1ad598" },
  { id: "3", label: "Időpontok", icon: Calendar, href: "/idopontok", color: "#f59e0b" },
  { id: "4", label: "Pénzügy", icon: Wallet, href: "/penzugy", color: "#ea3a3d" },
]

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const { image: profileImage } = useUserProfile()
  const router = useRouter()
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [setupChecked, setSetupChecked] = useState(false)

  const members = useMembersStore((state) => state.members)
  const initialized = useMembersStore((state) => state.initialized)
  const fetchMembers = useMembersStore((state) => state.fetchMembers)

  const recentMembers = [...members]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const userRole = session?.user?.role || "STUDENT"
  const isAdmin = userRole === "ADMIN" || userRole === "TRAINER"
  const isStudent = userRole === "STUDENT"
  const userName = session?.user?.name?.split(" ")[0] || "Felhasználó"
  const organizationName = session?.user?.organization?.name || "Egyesület"
  const userInitials = (session?.user?.name || "U").split(" ").map(n => n[0]).join("").toUpperCase()

  const today = new Date()
  const formattedDate = format(today, "yyyy. MMMM d., EEEE", { locale: hu })

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!initialized) fetchMembers()
  }, [initialized, fetchMembers])

  useEffect(() => {
    const checkSetupNeeded = async () => {
      if (status !== "authenticated" || setupChecked) return
      if (!isAdmin) { setSetupChecked(true); return }
      try {
        const locResponse = await fetch("/api/locations")
        if (locResponse.ok) {
          const locData = await locResponse.json()
          if (!locData.locations || locData.locations.length === 0) {
            router.replace("/setup")
            return
          }
        }
      } catch (err) { console.error("Failed to check locations:", err) }
      setSetupChecked(true)
    }
    checkSetupNeeded()
  }, [session, status, router, setupChecked, isAdmin])

  useEffect(() => {
    if (session?.user) loadDashboardData()
    else if (session === null) setLoading(false)
  }, [session])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const now = new Date()
      const endDate = new Date(now)
      endDate.setDate(endDate.getDate() + 14)
      const sessionsRes = await fetch(`/api/sessions?startDate=${now.toISOString()}&endDate=${endDate.toISOString()}`)
      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json()
        const sessions = (sessionsData.sessions || [])
          .filter((s: { status: string }) => s.status !== "CANCELLED" && s.status !== "COMPLETED")
          .map((s: any) => ({
            id: s.id,
            title: s.title || "Edzés",
            date: s.startTime,
            time: new Date(s.startTime).toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" }),
            location: s.location || "Nincs megadva",
            attendeeCount: s._count?.attendances || 0,
            maxAttendees: s.totalMembers || s.capacity || 15,
          }))
          .slice(0, 4)
        setUpcomingSessions(sessions)
      }
    } catch (error) { console.error("Failed to load dashboard data:", error) }
    finally { setLoading(false) }
  }

  const formatEventDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    if (isToday(date)) return "Ma"
    if (isTomorrow(date)) return "Holnap"
    return format(date, "MMM d.", { locale: hu })
  }

  const getStatusBadge = (status: string, member?: any) => {
    if (member && member.groups?.length === 0) {
      return (
        <div className="flex items-center gap-1 bg-[#D2F159]/10 border border-[#D2F159]/40 rounded-full px-2.5 py-0.5">
          <Plus className="w-3 h-3 text-[#D2F159]" />
          <span className="text-[#D2F159] text-xs">Új</span>
        </div>
      )
    }
    if (status === "active") {
      return (
        <div className="flex items-center gap-1 bg-[#1ad598]/10 border border-[#1ad598]/40 rounded-full px-2.5 py-0.5">
          <Check className="w-3 h-3 text-[#1ad598]" />
          <span className="text-[#1ad598] text-xs">OK</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-1 bg-[#ea3a3d]/10 border border-[#ea3a3d]/40 rounded-full px-2.5 py-0.5">
        <X className="w-3 h-3 text-[#ea3a3d]" />
        <span className="text-[#ea3a3d] text-xs">Hátralék</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D2F159]" />
      </div>
    )
  }

  if (isMobile) {
    if (isStudent) return <MobileStudentHomepage />
    return <MobileHomepage />
  }

  const todaySessions = upcomingSessions.filter(s => isToday(new Date(s.date))).length

  return (
    <div className="font-lufga space-y-6">
      {/* WELCOME ISLAND */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#D2F159] via-[#c5e44e] to-[#a8c93a] p-6"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/10 rounded-full translate-y-1/2" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Avatar className="w-16 h-16 border-4 border-white/30 shadow-lg">
              <AvatarImage src={profileImage || ""} />
              <AvatarFallback className="bg-[#171725] text-[#D2F159] font-bold text-xl">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-[#171725]/60 text-sm font-medium">Üdvözöllek,</p>
              <h1 className="text-[#171725] text-2xl font-bold">{userName}! 👋</h1>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4 text-[#171725]/60" />
                <span className="text-[#171725]/80 font-medium">{organizationName}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[#171725]/60 text-sm">Ma</p>
            <p className="text-[#171725] font-semibold capitalize">{formattedDate}</p>
            <Link
              href="/trainer/sessions"
              className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 bg-[#171725] text-[#D2F159] font-semibold rounded-xl hover:bg-[#252a32] transition-colors shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Új edzés
            </Link>
          </div>
        </div>
      </motion.div>

      {/* STATS ISLAND */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl bg-[#252a32] border border-white/5 p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Activity className="w-5 h-5 text-[#D2F159]" />
          <h2 className="text-white font-semibold">Áttekintés</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Stat 1 - Aktív tagok */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#D2F159]/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-4 rounded-2xl bg-[#1e2229] border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#D2F159]/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#D2F159]" />
                </div>
              </div>
              <p className="text-white text-2xl font-bold">{members.length}</p>
              <p className="text-white/50 text-sm">Aktív tag</p>
            </div>
          </div>

          {/* Stat 2 - Mai edzések */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1ad598]/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-4 rounded-2xl bg-[#1e2229] border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#1ad598]/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#1ad598]" />
                </div>
              </div>
              <p className="text-white text-2xl font-bold">{todaySessions}</p>
              <p className="text-white/50 text-sm">Mai edzés</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="col-span-2 space-y-6">
          {/* EVENTS ISLAND */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl bg-[#252a32] border border-white/5 p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#D2F159]" />
                <h2 className="text-white font-semibold">Közelgő edzések</h2>
              </div>
              <Link href="/idopontok" className="flex items-center gap-1 text-[#D2F159] text-sm hover:underline">
                Összes <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {upcomingSessions.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {upcomingSessions.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    onClick={() => router.push(`/idopontok/${event.id}`)}
                    className="group cursor-pointer rounded-2xl bg-[#1e2229] border border-white/5 hover:border-[#D2F159]/30 transition-all overflow-hidden"
                  >
                    <div className="flex items-stretch">
                      <div className="w-20 bg-[#D2F159] flex flex-col items-center justify-center py-4">
                        <span className="text-[#171725] text-xs font-medium uppercase">{formatEventDate(event.date)}</span>
                        <span className="text-[#171725] text-2xl font-bold">{event.time}</span>
                      </div>
                      <div className="flex-1 p-4">
                        <h3 className="text-white font-medium mb-1 group-hover:text-[#D2F159] transition-colors">{event.title}</h3>
                        <p className="text-white/40 text-sm flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </p>
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white/40 text-xs">Résztvevők</span>
                            <span className="text-white text-xs font-medium">{event.attendeeCount}/{event.maxAttendees}</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#333842] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#D2F159] rounded-full"
                              style={{ width: `${Math.min((event.attendeeCount / event.maxAttendees) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-2xl bg-[#1e2229] border border-dashed border-white/10">
                <Calendar className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/40 mb-4">Nincs közelgő edzés</p>
                <Link
                  href="/trainer/sessions"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#D2F159] text-[#171725] font-medium rounded-xl hover:bg-[#c5e44e] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Új edzés létrehozása
                </Link>
              </div>
            )}
          </motion.div>

          {/* QUICK ACCESS ISLAND */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-3xl bg-[#252a32] border border-white/5 p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-5 h-5 text-[#D2F159]" />
              <h2 className="text-white font-semibold">Gyorselérés</h2>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <Link
                    href={action.href}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-[#1e2229] border border-white/5 hover:border-[#D2F159]/30 hover:bg-[#252a32] transition-all group"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${action.color}20` }}
                    >
                      <action.icon className="w-5 h-5" style={{ color: action.color }} />
                    </div>
                    <span className="text-white text-sm font-medium">{action.label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN - Members */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-3xl bg-[#252a32] border border-white/5 p-6 h-fit"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#D2F159]" />
              <h2 className="text-white font-semibold">Legújabb tagok</h2>
            </div>
            <Link href="/taglista" className="flex items-center gap-1 text-[#D2F159] text-sm hover:underline">
              Mind <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {recentMembers.length > 0 ? (
            <div className="space-y-2">
              {recentMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#1e2229] hover:bg-[#292e38] border border-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-[#D2F159]/20">
                      <AvatarFallback className="bg-[#333842] text-white text-sm">
                        {member.firstName?.[0]}{member.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-medium text-sm">{member.firstName} {member.lastName}</p>
                      <p className="text-white/40 text-xs">
                        {format(new Date(member.createdAt), "MMM d.", { locale: hu })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(member.status, member)}
                    <Link
                      href={`/trainer/students/${member.id}/edit`}
                      className="p-2 rounded-lg text-white/30 hover:text-[#D2F159] hover:bg-[#333842] transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}

              <Link
                href="/tagfelvetel"
                className="flex items-center justify-center gap-2 p-4 mt-3 rounded-xl border-2 border-dashed border-[#D2F159]/30 text-[#D2F159] hover:bg-[#D2F159]/10 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">Új tag felvétele</span>
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 mb-4">Még nincs tag</p>
              <Link
                href="/tagfelvetel"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#D2F159] text-[#171725] font-medium rounded-xl hover:bg-[#c5e44e] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Első tag felvétele
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
