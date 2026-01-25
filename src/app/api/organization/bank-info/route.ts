import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Find the user and their organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        organization: {
          select: {
            bankAccountName: true,
            bankAccountNumber: true,
            bankName: true,
          }
        },
        student: {
          include: {
            organization: {
              select: {
                bankAccountName: true,
                bankAccountNumber: true,
                bankName: true,
              }
            }
          }
        }
      },
    })

    // Get org from user directly or from student relationship
    const org = user?.organization || user?.student?.organization

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    return NextResponse.json({
      bankAccountName: org.bankAccountName,
      bankAccountNumber: org.bankAccountNumber,
      bankName: org.bankName,
    })
  } catch (error) {
    console.error("Bank info error:", error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}
