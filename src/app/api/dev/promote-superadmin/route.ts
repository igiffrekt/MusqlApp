import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

// DEV ONLY: Promote current user to SUPER_ADMIN
// Remove this file in production!
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed in production" }, { status: 403 })
  }

  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { role: "SUPER_ADMIN" },
      select: { id: true, email: true, name: true, role: true }
    })

    return NextResponse.json({ 
      success: true, 
      message: "User promoted to SUPER_ADMIN! Log out and log back in to see the admin link.",
      user 
    })
  } catch (error) {
    console.error("Failed to promote user:", error)
    return NextResponse.json({ error: "Failed to promote user" }, { status: 500 })
  }
}

// GET: Check current user role
export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  return NextResponse.json({ 
    user: session.user,
    tip: "POST to this endpoint to promote yourself to SUPER_ADMIN. Then log out and log back in."
  })
}
