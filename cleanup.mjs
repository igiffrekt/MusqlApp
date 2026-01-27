import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Find users without organization
const usersWithoutOrg = await prisma.user.findMany({
  where: { organizationId: null },
  select: { id: true, email: true, name: true, role: true, createdAt: true }
});

console.log("Users without organization:", JSON.stringify(usersWithoutOrg, null, 2));

// Delete accounts linked to these users
for (const user of usersWithoutOrg) {
  await prisma.account.deleteMany({ where: { userId: user.id } });
  await prisma.authSession.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
  console.log("Deleted user:", user.email);
}

// Also find and show all organizations
const orgs = await prisma.organization.findMany({
  select: { id: true, name: true, slug: true }
});
console.log("Organizations:", JSON.stringify(orgs, null, 2));

await prisma.$disconnect();
