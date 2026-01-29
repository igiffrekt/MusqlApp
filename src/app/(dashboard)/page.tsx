"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MobileHomepage } from "@/components/mobile/MobileHomepage"
import { MobileStudentHomepage } from "@/components/mobile/MobileStudentHomepage"
import { useMembersStore } from "@/lib/stores/members-store"
import {
  Calendar,
  CheckCircle,
  Clock,
  Users,
  ArrowRight,
  Plus,
  TrendingUp,
  Wallet,
  UserPlus,
  MapPin,
  Phone,
  Mail,
  Edit3,
  X,
  Check,
  Bell,
} from "lucide-react"
import { format, isToday, isTomorrow, startOfMonth, endOfMonth } from "date-fns"
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

interface StatsCard {
  label: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: React.ElementType
  color: string
}

// Quick action items matching mobile
const quickActions = [
  { id: "1", label: "Tagfelvétel", icon: UserPlus, href: "/tagfelvetel", color: "#D2F159" },
  { id: "2", label: "Taglista", icon: Users, href: "/taglista", color: "#1ad598" },
  { id: "3", label: "Időpontok", icon: Calendar, href: "/idopontok", color: "#f59e0b" },
  { id: "4", label: "Pénzügy", icon: Wallet, href: "/penzugy", color: "#ea3a3d" },
]

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [stats, setStats] = useState<StatsCard[]>([])
  const [setupChecked, setSetupChecked] = useState(false)

  // Members from store
  const members = useMembersStore((state) => state.members)
  const initialized = useMembersStore((state) => state.initialized)
  const fetchMembers = useMembersStore((state) => state.fetchMembers)

  // Get 5 most recent members
  const recentMembers = [...members]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const userRole = session?.user?.role || "STUDENT"
  const isAdmin = userRole === "ADMIN" || userRole === "TRAINER"
  const isStudent = userRole === "STUDENT"
  const userName = session?.user?.name?.split(" ")[0] || "Felhasználó"
  const organizationName = session?.user?.organization?.name || "Egyesület"
  const userInitials = (session?.user?.name || "U").split(" ").map(n => n[0]).join("").toUpperCase()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fetch members
  useEffect(() => {
    if (!initialized) {
      fetchMembers()
    }
  }, [initialized, fetchMembers])

  // Check if new org needs setup
  useEffect(() => {
    const checkSetupNeeded = async () => {
      if (status !== "authenticated" || setupChecked) return
      if (!isAdmin) {
        setSetupChecked(true)
        return
      }

      try {
        const locResponse = await fetch("/api/locations")
        if (locResponse.ok) {
          const locData = await locResponse.json()
          if (!locData.locations || locData.locations.length === 0) {
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
  }, [session, status, router, setupChecked, isAdmin])

  // Load dashboard data
  useEffect(() => {
    if (session?.user) {
      loadDashboardData()
    } else if (session === null) {
      setLoading(false)
    }
  }, [session])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const now = new Date()
      const endDate = new Date(now)
      endDate.setDate(endDate.getDate() + 14)

      // Fetch upcoming sessions
      const sessionsRes = await fetch(
        `/api/sessions?startDate=${now.toISOString()}&endDate=${endDate.toISOString()}`
      )

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
          .slice(0, 3)
        setUpcomingSessions(sessions)
      }

      // Set stats
      setStats([
        { label: "Aktív tagok", value: members.length || 0, change: "+12%", changeType: "positive", icon: Users, color: "#D2F159" },
        { label: "Mai edzések", value: 3, icon: Calendar, color: "#1ad598" },
        { label: "Havi bevétel", value: "847k", change: "+8%", changeType: "positive", icon: TrendingUp, color: "#f59e0b" },
        { label: "Jelenlét", value: "92%", icon: CheckCircle, color: "#ea3a3d" },
      ])
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatEventDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    if (isToday(date)) return "Ma"
    if (isTomorrow(date)) return "Holnap"
    return format(date, "MMM d., EEEE", { locale: hu })
  }

  const getStatusBadge = (status: string, member?: any) => {
    if (member && member.groups?.length === 0) {
      return (
        <div className="flex items-center gap-1 bg-[#D2F159]/10 border border-[#D2F159]/40 rounded-full px-3 py-1">
          <Plus className="w-3 h-3 text-[#D2F159]" />
          <span className="text-[#D2F159] text-xs">Csoporthoz adom</span>
        </div>
      )
    }
    if (status === "active") {
      return (
        <div className="flex items-center gap-1 bg-[#1ad598]/10 border border-[#1ad598]/40 rounded-full px-3 py-1">
          <Check className="w-3 h-3 text-[#1ad598]" />
          <span className="text-[#1ad598] text-xs">Rendezve</span>
        </div>
      )
    } else if (status === "debt") {
      return (
        <div className="flex items-center gap-1 bg-[#ea3a3d]/10 border border-[#ea3a3d]/40 rounded-full px-3 py-1">
          <X className="w-3 h-3 text-[#ea3a3d]" />
          <span className="text-[#ea3a3d] text-xs">Tartozás</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-1 bg-[#f59e0b]/10 border border-[#f59e0b]/40 rounded-full px-3 py-1">
        <span className="text-[#f59e0b] text-xs">Rendezetlen</span>
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

  // Mobile views
  if (isMobile) {
    if (isStudent) return <MobileStudentHomepage />
    return <MobileHomepage />
  }

  // Desktop Dashboard
  return (
    <div className="font-lufga">
      {/* Header Section - matching mobile style */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Avatar className="w-14 h-14 border-2 border-[#D2F159]/30">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback className="bg-[#D2F159] text-[#171725] font-semibold text-lg">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-white/60 text-sm">Üdv, {userName}!</p>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#D2F159]" />
              <span className="text-white font-semibold">{organizationName}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="relative p-3 rounded-2xl bg-[#252a32] hover:bg-[#333842] transition-colors">
            <Bell className="w-5 h-5 text-white/60" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#ea3a3d] rounded-full text-white text-xs flex items-center justify-center font-bold">
              3
            </span>
          </button>
          <Link
            href="/trainer/sessions"
            className="flex items-center gap-2 px-5 py-3 bg-[#D2F159] text-[#171725] font-semibold rounded-2xl hover:bg-[#c5e44e] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Új edzés
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#252a32] rounded-2xl p-5 border border-white/5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/50 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                {stat.change && (
                  <p className={`text-xs mt-1 ${stat.changeType === "positive" ? "text-[#1ad598]" : "text-[#ea3a3d]"}`}>
                    {stat.change}
                  </p>
                )}
              </div>
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid - Two columns */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Events + Quick Actions */}
        <div className="col-span-2 space-y-6">
          {/* Upcoming Events Section */}
          <div>
            <h2 className="text-white text-xl font-semibold mb-4">Következő Eseményeim</h2>
            <div className="grid grid-cols-3 gap-4">
              {upcomingSessions.length > 0 ? upcomingSessions.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#252a32] rounded-3xl overflow-hidden group hover:ring-2 hover:ring-[#D2F159]/30 transition-all cursor-pointer"
                  onClick={() => router.push(`/idopontok/${event.id}`)}
                >
                  {/* Card Header */}
                  <div className="bg-[#333842] p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#D2F159] flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[#171725]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">{event.title}</h3>
                      <p className="text-white/40 text-sm truncate">{event.location}</p>
                    </div>
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-white/40 text-xs">{formatEventDate(event.date)}</p>
                        <p className="text-white text-lg font-medium">{event.time}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#D2F159] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ArrowRight className="w-5 h-5 text-[#171725]" />
                      </div>
                    </div>
                    
                    {/* Attendance bar */}
                    <div className="pt-3 border-t border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/40 text-xs">Résztvevők</span>
                        <span className="text-white text-sm font-medium">
                          {event.attendeeCount}/{event.maxAttendees}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#333842] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#D2F159] rounded-full transition-all"
                          style={{ width: `${(event.attendeeCount / event.maxAttendees) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="col-span-3 bg-[#252a32] rounded-3xl p-12 text-center">
                  <Calendar className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40">Nincs közelgő esemény</p>
                  <Link
                    href="/trainer/sessions"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#D2F159] text-[#171725] font-medium rounded-xl hover:bg-[#c5e44e] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Új edzés létrehozása
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Access Section */}
          <div>
            <h2 className="text-white text-xl font-semibold mb-4">Gyorselérés</h2>
            <div className="grid grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={action.href}
                    className="flex flex-col items-center gap-3 p-6 bg-[#252a32] rounded-2xl border border-white/5 hover:border-[#D2F159]/30 hover:bg-[#2a2f38] transition-all group"
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${action.color}20` }}
                    >
                      <action.icon className="w-6 h-6" style={{ color: action.color }} />
                    </div>
                    <span className="text-white text-sm font-medium">{action.label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Members */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-xl font-semibold">Legújabb Tagok</h2>
            <Link href="/taglista" className="text-[#D2F159] text-sm hover:underline">
              Összes
            </Link>
          </div>

          <div className="bg-[#252a32] rounded-3xl p-4">
            {recentMembers.length > 0 ? (
              <div className="space-y-1">
                {recentMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between py-3 px-2 rounded-xl hover:bg-[#333842] transition-colors"
                  >
                    {/* Avatar + Name */}
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-[#333842] text-white text-sm">
                          {member.firstName?.[0]}{member.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white font-medium text-sm">{member.firstName}</p>
                        <p className="text-[#D2F159] text-xs">{member.lastName}</p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="hidden xl:block">
                      {getStatusBadge(member.status, member)}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {member.phone && (
                        <a
                          href={`tel:${member.phone.replace(/\s/g, "")}`}
                          className="p-2 rounded-lg hover:bg-[#252a32] text-white/40 hover:text-white transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="p-2 rounded-lg hover:bg-[#252a32] text-white/40 hover:text-white transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                      <Link
                        href={`/trainer/students/${member.id}/edit`}
                        className="p-2 rounded-lg hover:bg-[#252a32] text-white/40 hover:text-white transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-10 h-10 text-white/20 mx-auto mb-2" />
                <p className="text-white/40 text-sm">Nincs tag</p>
                <Link
                  href="/tagfelvetel"
                  className="inline-flex items-center gap-1 mt-3 text-[#D2F159] text-sm hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  Tag hozzáadása
                </Link>
              </div>
            )}

            {recentMembers.length > 0 && (
              <Link
                href="/taglista"
                className="flex items-center justify-center gap-2 mt-4 py-3 text-[#D2F159] text-sm font-medium hover:bg-[#333842] rounded-xl transition-colors"
              >
                Összes tag megtekintése
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
