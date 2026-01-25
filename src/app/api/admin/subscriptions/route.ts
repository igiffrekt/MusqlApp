import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const subscriptions = await prisma.organization.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        licenseTier: true,
        subscriptionStatus: true,
        stripeCustomerId: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: true,
            students: true,
          },
        },
      },
    })

    return NextResponse.json({ subscriptions })
  } catch (error) {
    console.error("Admin subscriptions error:", error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { id, subscriptionStatus, licenseTier } = body

    if (!id) {
      return NextResponse.json({ error: "Organization ID required" }, { status: 400 })
    }

    const updates: Record<string, string> = {}
    if (subscriptionStatus) updates.subscriptionStatus = subscriptionStatus
    if (licenseTier) updates.licenseTier = licenseTier

    const organization = await prisma.organization.update({
      where: { id },
      data: updates,
    })

    return NextResponse.json({ organization })
  } catch (error) {
    console.error("Admin subscription update error:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}
