import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import {
  notifySessionReminder,
  notifyPaymentDue,
  notifyAttendanceMarked,
  notifyNewStudent
} from "@/lib/notifications"

// Trigger automated notifications
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { type, sessionId, studentId, paymentId } = await request.json()

    switch (type) {
      case "session_reminder":
        if (!sessionId) {
          return NextResponse.json({ message: "Session ID required" }, { status: 400 })
        }
        await notifySessionReminder(sessionId)
        break

      case "payment_due":
        if (!paymentId) {
          return NextResponse.json({ message: "Payment ID required" }, { status: 400 })
        }
        await notifyPaymentDue(paymentId)
        break

      case "attendance_marked":
        if (!sessionId || !studentId) {
          return NextResponse.json({ message: "Session ID and Student ID required" }, { status: 400 })
        }
        // We'll need the status too, but for now just notify
        await notifyAttendanceMarked(sessionId, studentId, "PRESENT")
        break

      case "new_student":
        if (!studentId) {
          return NextResponse.json({ message: "Student ID required" }, { status: 400 })
        }
        await notifyNewStudent(studentId)
        break

      default:
        return NextResponse.json({ message: "Invalid notification type" }, { status: 400 })
    }

    return NextResponse.json({ message: "Notification sent successfully" })
  } catch (error) {
    console.error("Failed to trigger notification:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}