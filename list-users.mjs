import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const users = await prisma.user.findMany({
  include: { organization: { select: { name: true, subscriptionStatus: true, trialEndsAt: true, setupCompletedAt: true } } },
  orderBy: { createdAt: "desc" }
});
console.log("Név | Email | Szerepkör | Szervezet | Státusz | Trial vége | Setup");
console.log("---|---|---|---|---|---|---");
users.forEach(u => {
  const org = u.organization;
  console.log([
    u.name || "-",
    u.email,
    u.role,
    org?.name || "-",
    org?.subscriptionStatus || "-",
    org?.trialEndsAt ? new Date(org.trialEndsAt).toLocaleDateString("hu") : "-",
    org?.setupCompletedAt ? "✓" : "✗"
  ].join(" | "));
});
await prisma.$disconnect();
