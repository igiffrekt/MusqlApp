import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 })
  }

  const orgs = await prisma.organization.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    }
  })

  return NextResponse.json({ organizations: orgs })
}
