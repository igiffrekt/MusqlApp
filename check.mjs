import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const users = await prisma.user.findMany({ 
  select: { id: true, email: true, organizationId: true, role: true },
  take: 5,
  orderBy: { createdAt: "desc" }
});
console.log(JSON.stringify(users, null, 2));
await prisma.$disconnect();
