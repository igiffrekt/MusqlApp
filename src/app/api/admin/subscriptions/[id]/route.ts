import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import type { SubscriptionStatus } from "@prisma/client"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id } = await params
    const body = await request.json()
    const { status } = body as { status?: SubscriptionStatus }

    // Update the organization's subscription status
    const updated = await prisma.organization.update({
      where: { id },
      data: { 
        ...(status && { subscriptionStatus: status }), 
      },
      select: {
        id: true,
        name: true,
        subscriptionStatus: true,
        stripeSubscriptionId: true,
        licenseTier: true,
      },
    })
    return NextResponse.json({ organization: updated })
  } catch (error) {
    console.error("Error updating subscription:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}
