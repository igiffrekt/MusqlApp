import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id } = await params
    const body = await request.json()
    const { status, cancelAtPeriodEnd } = body

    const updated = await prisma.subscription.update({
      where: { id },
      data: { 
        ...(status && { status }), 
        ...(cancelAtPeriodEnd !== undefined && { cancelAtPeriodEnd }) 
      },
    })
    return NextResponse.json({ subscription: updated })
  } catch (error) {
    console.error("Error updating subscription:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}
