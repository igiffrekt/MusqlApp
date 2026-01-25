import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { email, role } = await request.json()
  
  if (!email || !role) {
    return NextResponse.json({ error: "email and role required" }, { status: 400 })
  }
  
  const validRoles = ["SUPER_ADMIN", "ADMIN", "TRAINER", "STUDENT"]
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: `role must be one of: ${validRoles.join(", ")}` }, { status: 400 })
  }
  
  const user = await prisma.user.update({
    where: { email },
    data: { role },
    select: { id: true, email: true, role: true, name: true }
  })
  
  return NextResponse.json({ success: true, user })
}
