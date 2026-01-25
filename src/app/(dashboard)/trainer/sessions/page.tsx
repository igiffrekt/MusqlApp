"use client"

import { useState, useEffect } from "react"
import { Calendar, momentLocalizer, View } from "react-big-calendar"
import moment from "moment"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Calendar as CalendarIcon, Users, Clock, MapPin, Edit, Trash2 } from "lucide-react"
import "react-big-calendar/lib/css/react-big-calendar.css"
import "./calendar.css"

const localizer = momentLocalizer(moment)

interface Session {
  id: string
  title: string
  description: string | null
  trainerId: string
  trainer: {
    name: string
  }
  startTime: string
  endTime: string
  capacity: number
  location: string | null
  sessionType: string
  status: string
  isRecurring: boolean
  _count?: {
    attendances: number
  }
}

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: Session
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [view, setView] = useState<View>('month')
  const [currentDate, setCurrentDate] = useState(new Date())

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    capacity: 10,
    location: "",
    sessionType: "REGULAR",
    isRecurring: false,
    recurringRule: "",
  })

  useEffect(() => {
    fetchSessions()
  }, [])

  useEffect(() => {
    // Convert sessions to calendar events
    const events: CalendarEvent[] = sessions.map(session => ({
      id: session.id,
      title: `${session.title} (${session._count?.attendances || 0}/${session.capacity})`,
      start: new Date(session.startTime),
      end: new Date(session.endTime),
      resource: session,
    }))
    setCalendarEvents(events)
  }, [sessions])

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/sessions")
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions)
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSession = async () => {
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsCreateDialogOpen(false)
        resetForm()
        fetchSessions()
      }
    } catch (error) {
      console.error("Failed to create session:", error)
    }
  }

  const handleEditSession = async () => {
    if (!selectedSession) return

    try {
      const response = await fetch(`/api/sessions/${selectedSession.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsEditDialogOpen(false)
        setSelectedSession(null)
        resetForm()
        fetchSessions()
      }
    } catch (error) {
      console.error("Failed to update session:", error)
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchSessions()
      }
    } catch (error) {
      console.error("Failed to delete session:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      capacity: 10,
      location: "",
      sessionType: "REGULAR",
      isRecurring: false,
      recurringRule: "",
    })
  }

  const openEditDialog = (session: Session) => {
    setSelectedSession(session)
    setFormData({
      title: session.title,
      description: session.description || "",
      startTime: moment(session.startTime).format("YYYY-MM-DDTHH:mm"),
      endTime: moment(session.endTime).format("YYYY-MM-DDTHH:mm"),
      capacity: session.capacity,
      location: session.location || "",
      sessionType: session.sessionType,
      isRecurring: session.isRecurring,
      recurringRule: "",
    })
    setIsEditDialogOpen(true)
  }

  const handleSelectEvent = (event: CalendarEvent) => {
    openEditDialog(event.resource)
  }

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setFormData(prev => ({
      ...prev,
      startTime: moment(start).format("YYYY-MM-DDTHH:mm"),
      endTime: moment(end).format("YYYY-MM-DDTHH:mm"),
    }))
    setIsCreateDialogOpen(true)
  }

  const eventStyleGetter = (event: CalendarEvent) => {
    const session = event.resource
    const attendanceCount = session._count?.attendances || 0
    const isFull = attendanceCount >= session.capacity
    const isUpcoming = new Date(session.startTime) > new Date()

    let backgroundColor = "#10B981" // green for regular sessions
    if (session.sessionType === "PRIVATE") backgroundColor = "#3B82F6" // blue
    if (session.sessionType === "SEMINAR") backgroundColor = "#8B5CF6" // purple
    if (session.sessionType === "GRADING") backgroundColor = "#F59E0B" // amber

    if (isFull) backgroundColor = "#EF4444" // red for full
    if (!isUpcoming) backgroundColor = "#6B7280" // gray for past

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
      },
    }
  }

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case "REGULAR": return "bg-green-100 text-green-800"
      case "PRIVATE": return "bg-blue-100 text-blue-800"
      case "SEMINAR": return "bg-purple-100 text-purple-800"
      case "GRADING": return "bg-amber-100 text-amber-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED": return "bg-blue-100 text-blue-800"
      case "CONFIRMED": return "bg-green-100 text-green-800"
      case "IN_PROGRESS": return "bg-yellow-100 text-yellow-800"
      case "COMPLETED": return "bg-gray-100 text-gray-800"
      case "CANCELLED": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading sessions...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Session Scheduling</h1>
          <p className="text-gray-600">Manage training sessions and schedules</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Session
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-w-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            }}
          >
            <DialogHeader>
              <DialogTitle>Create New Session</DialogTitle>
              <DialogDescription>
                Schedule a new training session.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Session Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter session title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Session description (optional)"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                    min={1}
                  />
                </div>
                <div>
                  <Label htmlFor="sessionType">Session Type</Label>
                  <Select value={formData.sessionType} onValueChange={(value) => setFormData(prev => ({ ...prev, sessionType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REGULAR">Regular Training</SelectItem>
                      <SelectItem value="PRIVATE">Private Lesson</SelectItem>
                      <SelectItem value="SEMINAR">Seminar</SelectItem>
                      <SelectItem value="GRADING">Grading</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Room or location (optional)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSession}>Create Session</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle>Session Calendar</CardTitle>
          <CardDescription>
            View and manage all training sessions. Click on a session to edit, or select a time slot to create a new session.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[600px]">
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              eventPropGetter={eventStyleGetter}
              views={['month', 'week', 'day']}
              view={view}
              onView={(view) => setView(view)}
              date={currentDate}
              onNavigate={setCurrentDate}
              components={{
                event: ({ event }) => (
                  <div className="p-1 text-xs">
                    <div className="font-medium truncate">{event.resource.title}</div>
                    <div className="text-xs opacity-90">
                      {moment(event.start).format("HH:mm")} - {moment(event.end).format("HH:mm")}
                    </div>
                  </div>
                ),
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
          <CardDescription>
            A list of all scheduled sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions
              .filter(session => new Date(session.startTime) > new Date())
              .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
              .slice(0, 10)
              .map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{session.title}</h3>
                      <Badge className={getSessionTypeColor(session.sessionType)}>
                        {session.sessionType}
                      </Badge>
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        {moment(session.startTime).format("MMM DD, YYYY")}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {moment(session.startTime).format("HH:mm")} - {moment(session.endTime).format("HH:mm")}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {session._count?.attendances || 0}/{session.capacity}
                      </div>
                      {session.location && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {session.location}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Trainer: {session.trainer.name}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(session)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSession(session.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Session Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Session</DialogTitle>
            <DialogDescription>
              Update session details and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Session Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter session title"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Session description (optional)"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-startTime">Start Time</Label>
                <Input
                  id="edit-startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-endTime">End Time</Label>
                <Input
                  id="edit-endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-capacity">Capacity</Label>
                <Input
                  id="edit-capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                  min={1}
                />
              </div>
              <div>
                <Label htmlFor="edit-sessionType">Session Type</Label>
                <Select value={formData.sessionType} onValueChange={(value) => setFormData(prev => ({ ...prev, sessionType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REGULAR">Regular Training</SelectItem>
                    <SelectItem value="PRIVATE">Private Lesson</SelectItem>
                    <SelectItem value="SEMINAR">Seminar</SelectItem>
                    <SelectItem value="GRADING">Grading</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Room or location (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSession}>Update Session</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}