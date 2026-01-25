import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" })
  }

  const user = session.user as { id?: string; organizationId?: string; email?: string; role?: string; name?: string }
  
  let org = null
  let studentCount = 0
  if (user.organizationId) {
    org = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: { id: true, name: true }
    })
    studentCount = await prisma.student.count({
      where: { organizationId: user.organizationId }
    })
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    },
    organization: org,
    studentCount
  })
}
