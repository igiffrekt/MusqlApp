import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const members = await prisma.student.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
        beltLevel: true,
        createdAt: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            attendances: true,
            payments: true,
          },
        },
      },
    })

    return NextResponse.json({ members })
  } catch (error) {
    console.error("Admin members error:", error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}
