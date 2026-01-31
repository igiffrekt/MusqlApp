import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { config } from 'dotenv'

config({ path: '.env.local' })

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const org = await prisma.organization.update({
    where: { id: 'test-org-1' },
    data: {
      licenseTier: 'PRO',
      subscriptionStatus: 'ACTIVE',
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }
  })
  console.log('Updated:', org.name, '| Status:', org.subscriptionStatus, '| Tier:', org.licenseTier)
}

main().catch(console.error).finally(() => { prisma.$disconnect(); pool.end() })
