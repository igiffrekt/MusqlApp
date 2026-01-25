import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteUsers() {
  const emails = ['igiffrekt@gmail.com', 'd3secondary@gmail.com']
  
  for (const email of emails) {
    console.log(`\nDeleting user: ${email}`)
    
    const user = await prisma.user.findUnique({ 
      where: { email },
      select: { id: true, organizationId: true }
    })
    
    if (!user) {
      console.log(`  User not found: ${email}`)
      continue
    }
    
    console.log(`  Found user ID: ${user.id}`)
    
    // Delete associated data
    const deleted = {
      accounts: await prisma.account.deleteMany({ where: { userId: user.id } }),
      sessions: await prisma.session.deleteMany({ where: { userId: user.id } }),
      notifications: await prisma.notification.deleteMany({ where: { userId: user.id } }),
    }
    
    console.log(`  Deleted: ${deleted.accounts.count} accounts, ${deleted.sessions.count} sessions, ${deleted.notifications.count} notifications`)
    
    // Delete the user
    await prisma.user.delete({ where: { id: user.id } })
    console.log(`  ✓ User deleted`)
  }
  
  // Also clean up any join requests with these emails
  const joinRequests = await prisma.joinRequest.deleteMany({
    where: { email: { in: emails.map(e => e.toLowerCase()) } }
  })
  console.log(`\nDeleted ${joinRequests.count} join requests`)
}

deleteUsers()
  .then(() => console.log('\nDone!'))
  .catch(console.error)
  .finally(() => prisma.$disconnect())
