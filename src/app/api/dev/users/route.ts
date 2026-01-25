import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// DEV ONLY: List all users
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 })
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organization: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    const emptyNames = users.filter(u => !u.name || u.name.trim() === '')

    return NextResponse.json({ 
      total: users.length,
      emptyNames: emptyNames.length,
      users,
      usersWithEmptyNames: emptyNames
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
