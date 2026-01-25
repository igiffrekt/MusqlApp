import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { email, ...data } = await request.json()
  
  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 })
  }
  
  const user = await prisma.user.update({
    where: { email },
    data,
    select: { id: true, email: true, name: true, phone: true, role: true }
  })
  
  return NextResponse.json({ success: true, user })
}
