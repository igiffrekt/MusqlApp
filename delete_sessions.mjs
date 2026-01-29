import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'aihmasir3n@gmail.com' } })
  if (!user) { console.log('User not found'); return }
  console.log('User:', user.id, 'OrgId:', user.organizationId)
  
  if (!user.organizationId) { console.log('No organization'); return }
  
  const sessions = await prisma.session.findMany({ where: { organizationId: user.organizationId } })
  console.log('Sessions found:', sessions.length)
  
  // Delete attendances first
  for (const s of sessions) {
    await prisma.attendance.deleteMany({ where: { sessionId: s.id } })
  }
  
  // Delete sessions
  const deleted = await prisma.session.deleteMany({ where: { organizationId: user.organizationId } })
  console.log('Deleted:', deleted.count, 'sessions')
}

main().catch(console.error).finally(() => prisma.$disconnect())
