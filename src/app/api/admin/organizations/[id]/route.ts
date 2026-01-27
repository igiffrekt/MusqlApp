import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, slug, licenseTier, subscriptionStatus } = body

    const updated = await prisma.organization.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(licenseTier && { licenseTier }),
        ...(subscriptionStatus && { subscriptionStatus }),
      },
    })

    return NextResponse.json({ organization: updated })
  } catch (error) {
    console.error("Error updating organization:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await prisma.organization.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting organization:", error)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        users: { select: { id: true, name: true, email: true, role: true } },
        students: { select: { id: true, name: true, status: true } },
        _count: { select: { users: true, students: true, sessions: true } },
      },
    })

    if (!organization) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json({ organization })
  } catch (error) {
    console.error("Error fetching organization:", error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}
