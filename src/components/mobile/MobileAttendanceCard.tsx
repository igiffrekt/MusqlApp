"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TouchButton } from "@/components/ui/touch-button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, AlertCircle, User, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { saveAttendanceOffline, isOnline } from "@/lib/offlineStorage"
import { toast } from "sonner"

interface Student {
  id: string
  firstName: string
  lastName: string
  email?: string
  beltLevel?: string
}

interface AttendanceRecord {
  studentId: string
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | null
  timestamp?: number
}

interface MobileAttendanceCardProps {
  student: Student
  attendance: AttendanceRecord | null
  onAttendanceChange: (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => void
  sessionId: string
  disabled?: boolean
}

export function MobileAttendanceCard({
  student,
  attendance,
  onAttendanceChange,
  sessionId,
  disabled = false
}: MobileAttendanceCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [localStatus, setLocalStatus] = useState<'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | null>(
    attendance?.status || null
  )

  const handleAttendanceClick = async (status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    if (disabled || isUpdating) return

    setIsUpdating(true)
    setLocalStatus(status)

    try {
      // Try online first
      if (isOnline()) {
        await onAttendanceChange(student.id, status)
      } else {
        // Save offline
        await saveAttendanceOffline(sessionId, student.id, status)
        toast.success("Attendance saved offline", {
          description: "Will sync when back online"
        })
      }

      // Update local state
      setLocalStatus(status)
    } catch (error) {
      console.error('Failed to update attendance:', error)
      toast.error("Failed to update attendance")
      setLocalStatus(attendance?.status || null)
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusIcon = (status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | null) => {
    switch (status) {
      case 'PRESENT':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'ABSENT':
        return <XCircle className="w-6 h-6 text-red-500" />
      case 'LATE':
        return <Clock className="w-6 h-6 text-yellow-500" />
      case 'EXCUSED':
        return <AlertCircle className="w-6 h-6 text-blue-500" />
      default:
        return <User className="w-6 h-6 text-gray-400" />
    }
  }

  const getStatusBadge = (status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | null) => {
    const variants = {
      PRESENT: "bg-green-100 text-green-800",
      ABSENT: "bg-red-100 text-red-800",
      LATE: "bg-yellow-100 text-yellow-800",
      EXCUSED: "bg-blue-100 text-blue-800"
    }

    if (!status) return null

    return (
      <Badge className={cn("text-xs", variants[status])}>
        {status.toLowerCase()}
      </Badge>
    )
  }

  return (
    <Card className={cn(
      "transition-all duration-200",
      localStatus && "ring-2 ring-blue-200",
      isUpdating && "opacity-75"
    )}>
      <CardContent className="p-4">
        {/* Student Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              {getStatusIcon(localStatus)}
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {student.firstName} {student.lastName}
              </h3>
              {student.beltLevel && (
                <p className="text-sm text-gray-600">{student.beltLevel}</p>
              )}
              {localStatus && getStatusBadge(localStatus)}
            </div>
          </div>
        </div>

        {/* Attendance Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <TouchButton
            variant={localStatus === 'PRESENT' ? 'default' : 'outline'}
            className={cn(
              "h-14 text-base font-medium",
              localStatus === 'PRESENT' && "bg-green-500 hover:bg-green-600"
            )}
            onClick={() => handleAttendanceClick('PRESENT')}
            disabled={disabled || isUpdating}
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Present
          </TouchButton>

          <TouchButton
            variant={localStatus === 'ABSENT' ? 'default' : 'outline'}
            className={cn(
              "h-14 text-base font-medium",
              localStatus === 'ABSENT' && "bg-red-500 hover:bg-red-600"
            )}
            onClick={() => handleAttendanceClick('ABSENT')}
            disabled={disabled || isUpdating}
          >
            <XCircle className="w-5 h-5 mr-2" />
            Absent
          </TouchButton>

          <TouchButton
            variant={localStatus === 'LATE' ? 'default' : 'outline'}
            className={cn(
              "h-14 text-base font-medium",
              localStatus === 'LATE' && "bg-yellow-500 hover:bg-yellow-600"
            )}
            onClick={() => handleAttendanceClick('LATE')}
            disabled={disabled || isUpdating}
          >
            <Clock className="w-5 h-5 mr-2" />
            Late
          </TouchButton>

          <TouchButton
            variant={localStatus === 'EXCUSED' ? 'default' : 'outline'}
            className={cn(
              "h-14 text-base font-medium",
              localStatus === 'EXCUSED' && "bg-blue-500 hover:bg-blue-600"
            )}
            onClick={() => handleAttendanceClick('EXCUSED')}
            disabled={disabled || isUpdating}
          >
            <AlertCircle className="w-5 h-5 mr-2" />
            Excused
          </TouchButton>
        </div>

        {/* Offline indicator */}
        {!isOnline() && (
          <div className="mt-3 p-2 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-800 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Offline mode - data will sync when connected
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface MobileAttendanceGridProps {
  students: Student[]
  attendance: Record<string, AttendanceRecord>
  onAttendanceChange: (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => void
  sessionId: string
  disabled?: boolean
}

export function MobileAttendanceGrid({
  students,
  attendance,
  onAttendanceChange,
  sessionId,
  disabled
}: MobileAttendanceGridProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Mark Attendance</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{students.length} students</span>
        </div>
      </div>

      <div className="space-y-3">
        {students.map((student) => (
          <MobileAttendanceCard
            key={student.id}
            student={student}
            attendance={attendance[student.id] || null}
            onAttendanceChange={onAttendanceChange}
            sessionId={sessionId}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  )
}