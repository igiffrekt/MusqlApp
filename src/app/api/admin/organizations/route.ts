import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const organizations = await prisma.organization.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            users: true,
            students: true,
          },
        },
      },
    })

    return NextResponse.json({ organizations })
  } catch (error) {
    console.error("Admin organizations error:", error)
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
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "Organization ID required" }, { status: 400 })
    }

    const organization = await prisma.organization.update({
      where: { id },
      data: updates,
    })

    return NextResponse.json({ organization })
  } catch (error) {
    console.error("Admin organization update error:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Organization ID required" }, { status: 400 })
    }

    // Delete organization (cascade will handle related records)
    await prisma.organization.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin organization delete error:", error)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
