import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const coaches = await prisma.user.findMany({
      where: {
        role: { in: ["ADMIN", "TRAINER"] },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({ coaches })
  } catch (error) {
    console.error("Admin coaches error:", error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}
