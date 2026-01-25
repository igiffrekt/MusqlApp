import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { emails } = await request.json()
  
  const results = []
  
  for (const email of emails) {
    const user = await prisma.user.findUnique({ 
      where: { email },
      select: { id: true }
    })
    
    if (!user) {
      results.push({ email, status: 'not found' })
      continue
    }
    
    // Delete associated data
    await prisma.account.deleteMany({ where: { userId: user.id } })
    await prisma.notification.deleteMany({ where: { userId: user.id } })
    
    // Delete the user
    await prisma.user.delete({ where: { id: user.id } })
    
    results.push({ email, status: 'deleted' })
  }
  
  // Clean up join requests
  const joinRequests = await prisma.joinRequest.deleteMany({
    where: { email: { in: emails.map((e: string) => e.toLowerCase()) } }
  })
  
  return NextResponse.json({ results, joinRequestsDeleted: joinRequests.count })
}
