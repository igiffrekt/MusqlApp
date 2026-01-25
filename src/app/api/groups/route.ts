import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth-utils"

/**
 * GET /api/groups - Fetch all groups for the organization
 * @returns {Group[]} Array of groups with member counts
 * @auth Required
 */
export async function GET() {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId } = authResult

    const groups = await prisma.group.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        dailyFee: true,
        monthlyFee: true,
        currency: true,
        createdAt: true,
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    // Transform to include memberCount
    const groupsWithCount = groups.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      dailyFee: g.dailyFee,
      monthlyFee: g.monthlyFee,
      currency: g.currency,
      memberCount: g._count.students,
      createdAt: g.createdAt,
    }))

    return NextResponse.json({ groups: groupsWithCount })
  } catch (error) {
    console.error("Failed to fetch groups:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/groups - Create a new group
 * @body {string} name - Group name (required)
 * @body {string} description - Group description (optional)
 * @body {number} dailyFee - Daily fee in currency (optional)
 * @body {number} monthlyFee - Monthly fee in currency (optional)
 * @returns {Group} Created group object
 * @auth Required
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId } = authResult

    const { name, description, dailyFee, monthlyFee } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json(
        { message: "A csoport neve kötelező" },
        { status: 400 }
      )
    }

    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        dailyFee: dailyFee || 0,
        monthlyFee: monthlyFee || 0,
        organizationId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        dailyFee: true,
        monthlyFee: true,
        currency: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      {
        group: {
          ...group,
          memberCount: 0,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Failed to create group:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
