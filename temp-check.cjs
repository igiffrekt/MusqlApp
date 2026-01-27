// Load env manually
const fs = require("fs");
const envContent = fs.readFileSync(".env.local", "utf8");
envContent.split("\n").forEach(line => {
  const match = line.match(/^\s*([^#=]+)\s*=\s*["'"]?(.*)["'"]?\s*$/);
  if (match) process.env[match[1].trim()] = match[2].trim().replace(/["'"]$/, "");
});

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { 
      OR: [
        { role: "SUPER_ADMIN" }, 
        { email: { contains: "stickerey" } }
      ] 
    },
    select: { id: true, email: true, name: true, role: true }
  });
  console.log(JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
