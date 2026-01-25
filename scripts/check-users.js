const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Find org by name
  const org = await prisma.organization.findFirst({
    where: { name: { contains: "Teszt" } },
    select: { id: true, name: true }
  });
  
  console.log("Organization:", org);
  
  if (org) {
    // Find users in this org
    const users = await prisma.user.findMany({ 
      where: { organizationId: org.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    });
    console.log("\nUsers in org:");
    console.log(JSON.stringify(users, null, 2));
    
    // Find empty names
    const emptyNames = users.filter(u => !u.name || u.name.trim() === '');
    if (emptyNames.length > 0) {
      console.log("\n⚠️  Users with empty names:");
      console.log(JSON.stringify(emptyNames, null, 2));
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
