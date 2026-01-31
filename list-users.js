const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, organizationId: true, createdAt: true },
    orderBy: { createdAt: "desc" }
  });
  console.log("=== USERS ===");
  console.log(JSON.stringify(users, null, 2));
  
  const orgs = await prisma.organization.findMany({
    select: { id: true, name: true, slug: true, createdAt: true }
  });
  console.log("\n=== ORGANIZATIONS ===");
  console.log(JSON.stringify(orgs, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
