import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// DEV ONLY: Debug organization data
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const orgName = searchParams.get("org") || "Teszt"

  try {
    // Find org
    const org = await prisma.organization.findFirst({
      where: { name: { contains: orgName } },
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true }
        },
        students: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        locations: {
          select: { id: true, name: true }
        },
        sessions: {
          select: { 
            id: true, 
            title: true,
            attendances: {
              select: { id: true, studentId: true }
            }
          }
        },
        groups: {
          select: { 
            id: true, 
            name: true,
            students: {
              select: { studentId: true }
            }
          }
        }
      }
    })

    if (!org) {
      return NextResponse.json({ error: "Org not found" }, { status: 404 })
    }

    return NextResponse.json({
      organization: {
        id: org.id,
        name: org.name,
      },
      counts: {
        users: org.users.length,
        students: org.students.length,
        locations: org.locations.length,
        sessions: org.sessions.length,
        groups: org.groups.length,
      },
      users: org.users,
      students: org.students,
      locations: org.locations,
      sessions: org.sessions,
      groups: org.groups,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

// DELETE empty student and cleanup
export async function DELETE(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 })
  }

  try {
    // Delete empty student
    const deleted = await prisma.student.deleteMany({
      where: {
        AND: [
          { firstName: "" },
          { lastName: "" },
          { email: "" }
        ]
      }
    })

    return NextResponse.json({ 
      success: true, 
      deletedEmptyStudents: deleted.count 
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
