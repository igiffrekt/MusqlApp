import { Resend } from "resend"
import twilio from "twilio"
import webpush from "web-push"
import { prisma } from "./db"

// Initialize services
const resend = new Resend(process.env.RESEND_API_KEY!)
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

// Configure web push
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:" + process.env.FROM_EMAIL || "noreply@musql.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
}

export interface NotificationOptions {
  userId?: string
  studentId?: string
  organizationId?: string
  email?: boolean
  sms?: boolean
  push?: boolean
  inApp?: boolean
}

export interface EmailData {
  to: string
  subject: string
  html: string
  from?: string
}

export interface SMSData {
  to: string
  body: string
  from?: string
}

export interface PushData {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: Record<string, unknown>
}

// Email notifications
export async function sendEmail(data: EmailData) {
  try {
    if (!resend) {
      console.warn("Resend not configured, skipping email")
      return null
    }

    const result = await resend.emails.send({
      from: data.from || "Musql <noreply@musql.com>",
      to: data.to,
      subject: data.subject,
      html: data.html,
    })

    return result
  } catch (error) {
    console.error("Failed to send email:", error)
    throw error
  }
}

// SMS notifications
export async function sendSMS(data: SMSData) {
  try {
    if (!twilioClient) {
      console.warn("Twilio not configured, skipping SMS")
      return null
    }

    const message = await twilioClient.messages.create({
      body: data.body,
      from: data.from || process.env.TWILIO_PHONE_NUMBER!,
      to: data.to,
    })

    return message
  } catch (error) {
    console.error("Failed to send SMS:", error)
    throw error
  }
}

// Push notifications
export async function sendPushNotification(
  subscription: webpush.PushSubscription,
  data: PushData
) {
  try {
    if (!process.env.VAPID_PUBLIC_KEY) {
      console.warn("Web push not configured, skipping push notification")
      return null
    }

    const payload = JSON.stringify({
      title: data.title,
      body: data.body,
      icon: data.icon || "/icon-192x192.png",
      badge: data.badge || "/icon-192x192.png",
      data: data.data,
    })

    const result = await webpush.sendNotification(subscription, payload)
    return result
  } catch (error) {
    console.error("Failed to send push notification:", error)
    throw error
  }
}

// In-app notifications
export async function createInAppNotification(
  userId: string,
  title: string,
  message: string,
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" = "INFO",
  actionUrl?: string
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        actionUrl,
        read: false,
      },
    })

    return notification
  } catch (error) {
    console.error("Failed to create in-app notification:", error)
    throw error
  }
}

// Get user notification preferences and contact info
export async function getUserNotificationSettings(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        notificationPreferences: true,
      },
    })

    return user
  } catch (error) {
    console.error("Failed to get user notification settings:", error)
    return null
  }
}

export async function getStudentContactInfo(studentId: string) {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        emergencyContact: true,
      },
    })

    return student
  } catch (error) {
    console.error("Failed to get student contact info:", error)
    return null
  }
}

// Automated notification triggers
export async function notifySessionReminder(sessionId: string) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        trainer: true,
        attendances: {
          include: {
            student: true,
          },
        },
        organization: true,
      },
    })

    if (!session) return

    const sessionDate = new Date(session.startTime).toLocaleDateString()
    const sessionTime = new Date(session.startTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })

    // Notify trainer
    await createInAppNotification(
      session.trainerId,
      "Közelgő Edzések",
      `Edzésed van: "${session.title}" – ${sessionDate}, ${sessionTime}`,
      "INFO",
      `/dashboard/sessions`
    )

    // Notify registered students
    for (const attendance of session.attendances) {
      const student = attendance.student

      if (!student) continue

      // In-app notification
      if (student.email) {
        await createInAppNotification(
          student.id,
          "Edzés Emlékeztető",
          `Edzésed van: "${session.title}" – ${sessionDate}, ${sessionTime}`,
          "INFO",
          `/student/sessions`
        )
      }

      // Email notification (if enabled)
      const userPrefs = await getUserNotificationSettings(student.id)
      const notificationPrefs = userPrefs?.notificationPreferences ? JSON.parse(userPrefs.notificationPreferences as string) : null
      if (notificationPrefs?.email && student.email) {
        const emailHtml = `
          <h2>Edzés Emlékeztető</h2>
          <p>Kedves ${student.firstName}!</p>
          <p>Emlékeztetünk a közelgő edzésedre:</p>
          <ul>
            <li><strong>Edzés:</strong> ${session.title}</li>
            <li><strong>Dátum:</strong> ${sessionDate}</li>
            <li><strong>Időpont:</strong> ${sessionTime}</li>
            <li><strong>Helyszín:</strong> ${session.location || "Később közöljük"}</li>
          </ul>
          <p>Várunk szeretettel!</p>
          <p>${session.organization?.name || "Az edzésstúdió"}</p>
        `

        await sendEmail({
          to: student.email,
          subject: `Edzés Emlékeztető: ${session.title}`,
          html: emailHtml,
        })
      }
    }
  } catch (error) {
    console.error("Failed to send session reminders:", error)
  }
}

export async function notifyPaymentDue(paymentId: string) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        student: {
          include: {
            organization: true,
          },
        },
      },
    })

    if (!payment || !payment.student.organization) return

    const dueDate = new Date(payment.dueDate).toLocaleDateString()
    const amount = payment.amount.toFixed(2)
    const organization = payment.student.organization

    // Notify student
    if (payment.student.email) {
      await createInAppNotification(
        payment.student.id,
        "Fizetés Esedékes",
        `${amount} Ft összegű ${payment.paymentType} befizetés esedékes: ${dueDate}`,
        "WARNING",
        `/student/payments`
      )

      const emailHtml = `
        <h2>Fizetési Emlékeztető</h2>
        <p>Kedves ${payment.student.firstName}!</p>
        <p>Emlékeztetünk, hogy az alábbi befizetés esedékes:</p>
        <ul>
          <li><strong>Összeg:</strong> ${amount} Ft</li>
          <li><strong>Típus:</strong> ${payment.paymentType}</li>
          <li><strong>Határidő:</strong> ${dueDate}</li>
        </ul>
        <p>Kérjük, rendezd a befizetést mielőbb.</p>
        <p>${organization.name}</p>
      `

      await sendEmail({
        to: payment.student.email,
        subject: `Fizetés Esedékes: ${amount} Ft`,
        html: emailHtml,
      })
    }

    // Notify trainer/admin
    const trainers = await prisma.user.findMany({
      where: {
        organizationId: payment.student.organizationId,
        role: { in: ["ADMIN", "TRAINER"] },
      },
    })

    for (const trainer of trainers) {
      await createInAppNotification(
        trainer.id,
        "Díjhátralék",
        `${payment.student.firstName} ${payment.student.lastName} részére ${amount} Ft befizetés esedékes: ${dueDate}`,
        "WARNING",
        `/dashboard/payments`
      )
    }
  } catch (error) {
    console.error("Failed to send payment due notifications:", error)
  }
}

export async function notifyAttendanceMarked(sessionId: string, studentId: string, status: string) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    })

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    })

    if (!session || !student) return

    const statusText = status === "PRESENT" ? "jelen" :
                      status === "ABSENT" ? "távol" :
                      status === "LATE" ? "késett" : "felmentve"

    // Notify student
    await createInAppNotification(
      student.id,
      "Jelenlét Frissítve",
      `Jelenléted a(z) "${session.title}" edzésen: ${statusText}`,
      status === "PRESENT" ? "SUCCESS" : "INFO",
      `/student/attendance`
    )

    // Notify trainer
    await createInAppNotification(
      session.trainerId,
      "Jelenlét Frissítve",
      `${student.firstName} ${student.lastName} jelenléte a(z) "${session.title}" edzésen: ${statusText}`,
      "INFO",
      `/dashboard/attendance`
    )
  } catch (error) {
    console.error("Failed to send attendance notifications:", error)
  }
}

export async function notifyNewStudent(studentId: string) {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { organization: true },
    })

    if (!student) return

    // Notify admins/trainers
    const staff = await prisma.user.findMany({
      where: {
        organizationId: student.organizationId,
        role: { in: ["ADMIN", "TRAINER"] },
      },
    })

    for (const user of staff) {
      await createInAppNotification(
        user.id,
        "Új Tag Regisztrált",
        `${student.firstName} ${student.lastName} új tagként regisztrált`,
        "SUCCESS",
        `/trainer/students/${student.id}`
      )
    }
  } catch (error) {
    console.error("Failed to send new student notifications:", error)
  }
}