import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Find the student record linked to this user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { student: true },
    })

    if (!user?.student) {
      // User is not a student, return empty
      return NextResponse.json({ payments: [] })
    }

    const payments = await prisma.payment.findMany({
      where: { studentId: user.student.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        amount: true,
        status: true,
        dueDate: true,
        paidDate: true,
        paymentType: true,
      },
    })

    return NextResponse.json({ payments })
  } catch (error) {
    console.error("My payments error:", error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}
