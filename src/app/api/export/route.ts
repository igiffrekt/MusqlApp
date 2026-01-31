import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-utils"
import { prisma } from "@/lib/db"

/**
 * GET /api/export - Export all organization data
 * Query params:
 *   - format: "json" | "csv" (default: json)
 * @auth Required (Admin only)
 */
export async function GET(request: Request) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    // Only admins can export data
    if (authResult.user.role !== "ADMIN" && authResult.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Csak adminisztrátorok exportálhatnak adatokat" },
        { status: 403 }
      )
    }

    const organizationId = authResult.organizationId
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "json"

    // Fetch all organization data
    const [organization, students, groups, sessions, payments, locations, users] = await Promise.all([
      prisma.organization.findUnique({
        where: { id: organizationId },
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
          licenseTier: true,
          subscriptionStatus: true,
        },
      }),
      prisma.student.findMany({
        where: { organizationId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          dateOfBirth: true,
          status: true,
          beltLevel: true,
          emergencyContact: true,
          createdAt: true,
          groups: {
            select: {
              group: {
                select: { name: true },
              },
            },
          },
        },
      }),
      prisma.group.findMany({
        where: { organizationId },
        select: {
          id: true,
          name: true,
          description: true,
          dailyFee: true,
          monthlyFee: true,
          createdAt: true,
        },
      }),
      prisma.session.findMany({
        where: { organizationId },
        select: {
          id: true,
          title: true,
          startTime: true,
          endTime: true,
          status: true,
          capacity: true,
          location: true,
          attendances: {
            select: {
              student: {
                select: { firstName: true, lastName: true },
              },
              status: true,
              createdAt: true,
            },
          },
        },
        orderBy: { startTime: "desc" },
        take: 1000,
      }),
      prisma.payment.findMany({
        where: {
          student: { organizationId },
        },
        select: {
          id: true,
          amount: true,
          status: true,
          paymentMethod: true,
          paymentType: true,
          notes: true,
          dueDate: true,
          paidDate: true,
          createdAt: true,
          student: {
            select: { firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 1000,
      }),
      prisma.location.findMany({
        where: { organizationId },
        select: {
          id: true,
          name: true,
          address: true,
          createdAt: true,
        },
      }),
      prisma.user.findMany({
        where: { organizationId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
    ])

    // Parse emergency contact for guardian info
    const transformedStudents = students.map((s) => {
      let guardian = { name: "", phone: "", email: "" }
      if (s.emergencyContact) {
        try {
          const contact = JSON.parse(s.emergencyContact as string)
          guardian = {
            name: contact.name || "",
            phone: contact.phone || "",
            email: contact.email || "",
          }
        } catch {
          // ignore parse errors
        }
      }
      return {
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
        phone: s.phone,
        dateOfBirth: s.dateOfBirth,
        status: s.status,
        beltLevel: s.beltLevel,
        createdAt: s.createdAt,
        groups: s.groups.map((g) => g.group.name),
        guardianName: guardian.name,
        guardianPhone: guardian.phone,
        guardianEmail: guardian.email,
      }
    })

    const exportData = {
      exportDate: new Date().toISOString(),
      organization,
      students: transformedStudents,
      groups,
      sessions: sessions.map((s) => ({
        ...s,
        location: s.location || null,
        attendances: s.attendances.map((a) => ({
          studentName: `${a.student.firstName} ${a.student.lastName}`,
          status: a.status,
          checkedInAt: a.createdAt,
        })),
      })),
      payments: payments.map((p) => ({
        ...p,
        studentName: `${p.student.firstName} ${p.student.lastName}`,
      })),
      locations,
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      })),
    }

    if (format === "csv") {
      // Generate CSV for students (most common export need)
      const csvHeaders = [
        "Név",
        "Vezetéknév",
        "Keresztnév",
        "Email",
        "Telefon",
        "Születési dátum",
        "Státusz",
        "Öv fokozat",
        "Csatlakozás",
        "Csoportok",
        "Gondviselő neve",
        "Gondviselő telefon",
        "Gondviselő email",
      ]

      const csvRows = transformedStudents.map((s) => [
        s.name,
        s.firstName,
        s.lastName,
        s.email || "",
        s.phone || "",
        s.dateOfBirth ? new Date(s.dateOfBirth).toLocaleDateString("hu-HU") : "",
        s.status,
        s.beltLevel || "",
        s.createdAt ? new Date(s.createdAt).toLocaleDateString("hu-HU") : "",
        s.groups.join(", "),
        s.guardianName,
        s.guardianPhone,
        s.guardianEmail,
      ])

      const csvContent = [
        csvHeaders.join(";"),
        ...csvRows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";")
        ),
      ].join("\n")

      // Add BOM for Excel compatibility with Hungarian characters
      const bom = "\uFEFF"

      return new NextResponse(bom + csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="musql-export-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    // JSON format
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="musql-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json(
      { error: "Hiba történt az exportálás során" },
      { status: 500 }
    )
  }
}
