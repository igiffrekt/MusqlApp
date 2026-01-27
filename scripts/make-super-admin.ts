import { PrismaClient, UserRole } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { config } from "dotenv"

config({ path: ".env.local" })

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  // Find users
  const users = await prisma.user.findMany({
    where: { 
      OR: [
        { email: { contains: "stickerey" } },
        { role: UserRole.SUPER_ADMIN }
      ]
    },
    select: { id: true, email: true, name: true, role: true }
  })
  
  console.log("Found users:", JSON.stringify(users, null, 2))
  
  // Update stickerey to SUPER_ADMIN if found
  const stickerey = users.find(u => u.email?.includes("stickerey"))
  if (stickerey && stickerey.role !== UserRole.SUPER_ADMIN) {
    const updated = await prisma.user.update({
      where: { id: stickerey.id },
      data: { role: UserRole.SUPER_ADMIN }
    })
    console.log("Updated to SUPER_ADMIN:", updated.email)
  } else if (stickerey) {
    console.log("Already SUPER_ADMIN:", stickerey.email)
  } else {
    console.log("No stickerey user found")
  }
}

main().catch(console.error).finally(() => { pool.end(); prisma.$disconnect() })
