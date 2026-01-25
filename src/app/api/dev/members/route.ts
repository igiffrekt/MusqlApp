import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// DEV ONLY: List all students/members
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 })
  }

  try {
    const students = await prisma.student.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        organization: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    const joinRequests = await prisma.joinRequest.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        organization: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    const emptyStudentNames = students.filter(s => 
      (!s.firstName || s.firstName.trim() === '') && 
      (!s.lastName || s.lastName.trim() === '')
    )
    const emptyJoinNames = joinRequests.filter(j => !j.name || j.name.trim() === '')

    return NextResponse.json({ 
      students: {
        total: students.length,
        emptyNames: emptyStudentNames.length,
        withEmptyNames: emptyStudentNames,
        all: students
      },
      joinRequests: {
        total: joinRequests.length,
        emptyNames: emptyJoinNames.length,
        withEmptyNames: emptyJoinNames,
        all: joinRequests
      }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
