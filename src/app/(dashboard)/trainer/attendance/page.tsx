"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Clock, Search, Users, Calendar, Filter, Download } from "lucide-react"
import { format } from "date-fns"

interface Session {
  id: string
  title: string
  startTime: string
  endTime: string
  capacity: number
  location: string | null
  status: string
  _count: {
    attendances: number
  }
}

interface Student {
  id: string
  firstName: string
  lastName: string
  email: string | null
  beltLevel: string | null
}

interface Attendance {
  id: string
  studentId: string
  status: string
  checkInTime: string | null
  student: {
    firstName: string
    lastName: string
    email: string | null
    beltLevel: string | null
  }
}

export default function AttendancePage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [sessionLoading, setSessionLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [bulkAction, setBulkAction] = useState<"present" | "absent" | "late" | "excused" | null>(null)

  useEffect(() => {
    fetchSessions()
    fetchStudents()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/sessions?upcoming=true")
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

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/students?active=true")
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students)
      }
    } catch (error) {
      console.error("Failed to fetch students:", error)
    }
  }

  const fetchSessionAttendance = async (sessionId: string) => {
    setSessionLoading(true)
    try {
      const response = await fetch(`/api/sessions/${sessionId}/attendance`)
      if (response.ok) {
        const data = await response.json()
        setAttendance(data.attendance)
      }
    } catch (error) {
      console.error("Failed to fetch attendance:", error)
    } finally {
      setSessionLoading(false)
    }
  }

  const markAttendance = async (studentId: string, status: string) => {
    if (!selectedSession) return

    try {
      const response = await fetch(`/api/sessions/${selectedSession.id}/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId,
          status,
        }),
      })

      if (response.ok) {
        fetchSessionAttendance(selectedSession.id)
      }
    } catch (error) {
      console.error("Failed to mark attendance:", error)
    }
  }

  const updateAttendance = async (attendanceId: string, status: string) => {
    try {
      const response = await fetch(`/api/attendance/${attendanceId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok && selectedSession) {
        fetchSessionAttendance(selectedSession.id)
      }
    } catch (error) {
      console.error("Failed to update attendance:", error)
    }
  }

  const bulkMarkAttendance = async (status: string) => {
    if (!selectedSession) return

    const unregisteredStudents = students.filter(student =>
      !attendance.some(att => att.studentId === student.id)
    )

    try {
      const promises = unregisteredStudents.map(student =>
        fetch(`/api/sessions/${selectedSession.id}/attendance`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId: student.id,
            status,
          }),
        })
      )

      await Promise.all(promises)

      if (selectedSession) {
        fetchSessionAttendance(selectedSession.id)
      }
    } catch (error) {
      console.error("Failed to bulk mark attendance:", error)
    }
  }

  const exportAttendance = () => {
    if (!selectedSession || !attendance.length) return

    const csvContent = [
      ["Student Name", "Email", "Belt Level", "Status", "Check-in Time"],
      ...attendance.map(att => [
        `${att.student.firstName} ${att.student.lastName}`,
        att.student.email || "",
        att.student.beltLevel || "",
        att.status,
        att.checkInTime ? format(new Date(att.checkInTime), "HH:mm") : "",
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attendance-${selectedSession.title}-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleSessionSelect = (session: Session) => {
    setSelectedSession(session)
    fetchSessionAttendance(session.id)
  }

  const getAttendanceStatusColor = (status: string) => {
    switch (status) {
      case "PRESENT": return "bg-green-100 text-green-800"
      case "ABSENT": return "bg-red-100 text-red-800"
      case "LATE": return "bg-yellow-100 text-yellow-800"
      case "EXCUSED": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED": return "bg-blue-100 text-blue-800"
      case "CONFIRMED": return "bg-green-100 text-green-800"
      case "IN_PROGRESS": return "bg-yellow-100 text-yellow-800"
      case "COMPLETED": return "bg-gray-100 text-gray-800"
      case "CANCELLED": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || session.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const attendanceStats = {
    present: attendance.filter(a => a.status === "PRESENT").length,
    absent: attendance.filter(a => a.status === "ABSENT").length,
    late: attendance.filter(a => a.status === "LATE").length,
    excused: attendance.filter(a => a.status === "EXCUSED").length,
    total: attendance.length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading attendance tracking...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Tracking</h1>
          <p className="text-gray-600">Mark and manage student attendance for sessions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Today's Sessions</CardTitle>
            <CardDescription>
              Select a session to mark attendance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedSession?.id === session.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleSessionSelect(session)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{session.title}</h3>
                      <div className="flex items-center text-xs text-gray-600 mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {format(new Date(session.startTime), "HH:mm")} - {format(new Date(session.endTime), "HH:mm")}
                      </div>
                      {session.location && (
                        <p className="text-xs text-gray-600">{session.location}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge className={getSessionStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                      <div className="flex items-center text-xs text-gray-600">
                        <Users className="w-3 h-3 mr-1" />
                        {session._count.attendances}/{session.capacity}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Attendance Management */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>
                  {selectedSession ? selectedSession.title : "Select a Session"}
                </CardTitle>
                {selectedSession && (
                  <CardDescription>
                    {format(new Date(selectedSession.startTime), "PPP")} •{" "}
                    {format(new Date(selectedSession.startTime), "HH:mm")} -{" "}
                    {format(new Date(selectedSession.endTime), "HH:mm")}
                    {selectedSession.location && ` • ${selectedSession.location}`}
                  </CardDescription>
                )}
              </div>
              {selectedSession && (
                <Button variant="outline" size="sm" onClick={exportAttendance}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedSession ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Users className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Session Selected</h3>
                <p className="text-gray-600">Choose a session from the list to start marking attendance.</p>
              </div>
            ) : sessionLoading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Loading attendance...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Attendance Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{attendanceStats.present}</div>
                    <div className="text-xs text-gray-600">Present</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{attendanceStats.absent}</div>
                    <div className="text-xs text-gray-600">Absent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{attendanceStats.late}</div>
                    <div className="text-xs text-gray-600">Late</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{attendanceStats.excused}</div>
                    <div className="text-xs text-gray-600">Excused</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">{attendanceStats.total}</div>
                    <div className="text-xs text-gray-600">Total</div>
                  </div>
                </div>

                {/* Bulk Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => bulkMarkAttendance("PRESENT")}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark All Present
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => bulkMarkAttendance("ABSENT")}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Mark All Absent
                  </Button>
                </div>

                {/* Attendance List */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Belt Level</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Check-in Time</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendance.map((att) => (
                        <TableRow key={att.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {att.student.firstName} {att.student.lastName}
                              </div>
                              {att.student.email && (
                                <div className="text-sm text-gray-600">{att.student.email}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{att.student.beltLevel || "—"}</TableCell>
                          <TableCell>
                            <Badge className={getAttendanceStatusColor(att.status)}>
                              {att.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {att.checkInTime
                              ? format(new Date(att.checkInTime), "HH:mm")
                              : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <Button
                                size="sm"
                                variant={att.status === "PRESENT" ? "default" : "outline"}
                                onClick={() => updateAttendance(att.id, "PRESENT")}
                              >
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant={att.status === "ABSENT" ? "default" : "outline"}
                                onClick={() => updateAttendance(att.id, "ABSENT")}
                              >
                                <XCircle className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant={att.status === "LATE" ? "default" : "outline"}
                                onClick={() => updateAttendance(att.id, "LATE")}
                              >
                                <Clock className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}

                      {/* Unregistered students */}
                      {students
                        .filter(student => !attendance.some(att => att.studentId === student.id))
                        .map((student) => (
                          <TableRow key={student.id} className="bg-gray-50">
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {student.firstName} {student.lastName}
                                </div>
                                {student.email && (
                                  <div className="text-sm text-gray-600">{student.email}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{student.beltLevel || "—"}</TableCell>
                            <TableCell>
                              <Badge className="bg-gray-100 text-gray-800">Not Marked</Badge>
                            </TableCell>
                            <TableCell>—</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => markAttendance(student.id, "PRESENT")}
                                >
                                  <CheckCircle className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => markAttendance(student.id, "ABSENT")}
                                >
                                  <XCircle className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => markAttendance(student.id, "LATE")}
                                >
                                  <Clock className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}