import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sendEmail } from "@/lib/notifications"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { to, subject, message, memberName } = body

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, message" },
        { status: 400 }
      )
    }

    // Format the HTML email
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #171725;">Üzenet a ${session.user.organization?.name || "Musql"} csapatától</h2>
        <p>Kedves ${memberName || "Tag"}!</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          ${message.replace(/\n/g, "<br>")}
        </div>
        <p style="color: #666; font-size: 12px;">
          Ez az üzenet a ${session.user.organization?.name || "Musql"} rendszerén keresztül lett küldve.
          <br>Feladó: ${session.user.name || session.user.email}
        </p>
      </div>
    `

    const result = await sendEmail({
      to,
      subject,
      html,
      from: `${session.user.organization?.name || "Musql"} <noreply@musql.com>`,
    })

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Failed to send email:", error)
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    )
  }
}
