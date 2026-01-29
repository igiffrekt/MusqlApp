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
    if (authResult.user.role !== "ADMIN") {
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
          name: true,
          email: true,
          phone: true,
          dateOfBirth: true,
          status: true,
          joinedAt: true,
          parentName: true,
          parentPhone: true,
          parentEmail: true,
          notes: true,
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
          color: true,
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
          location: {
            select: { name: true },
          },
          group: {
            select: { name: true },
          },
          attendances: {
            select: {
              student: {
                select: { name: true },
              },
              status: true,
              checkedInAt: true,
            },
          },
        },
        orderBy: { startTime: "desc" },
        take: 1000, // Limit to last 1000 sessions
      }),
      prisma.payment.findMany({
        where: {
          student: { organizationId },
        },
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          paymentMethod: true,
          description: true,
          dueDate: true,
          paidAt: true,
          createdAt: true,
          student: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 1000, // Limit to last 1000 payments
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

    const exportData = {
      exportDate: new Date().toISOString(),
      organization,
      students: students.map((s) => ({
        ...s,
        groups: s.groups.map((g) => g.group.name),
      })),
      groups,
      sessions: sessions.map((s) => ({
        ...s,
        location: s.location?.name || null,
        group: s.group?.name || null,
        attendances: s.attendances.map((a) => ({
          studentName: a.student.name,
          status: a.status,
          checkedInAt: a.checkedInAt,
        })),
      })),
      payments: payments.map((p) => ({
        ...p,
        studentName: p.student.name,
      })),
      locations,
      users: users.map((u) => ({
        ...u,
        // Don't export sensitive data
      })),
    }

    if (format === "csv") {
      // Generate CSV for students (most common export need)
      const csvHeaders = [
        "Név",
        "Email",
        "Telefon",
        "Születési dátum",
        "Státusz",
        "Csatlakozás",
        "Csoportok",
        "Szülő neve",
        "Szülő telefon",
        "Szülő email",
        "Megjegyzés",
      ]

      const csvRows = exportData.students.map((s) => [
        s.name,
        s.email || "",
        s.phone || "",
        s.dateOfBirth ? new Date(s.dateOfBirth).toLocaleDateString("hu-HU") : "",
        s.status,
        s.joinedAt ? new Date(s.joinedAt).toLocaleDateString("hu-HU") : "",
        s.groups.join(", "),
        s.parentName || "",
        s.parentPhone || "",
        s.parentEmail || "",
        s.notes || "",
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
