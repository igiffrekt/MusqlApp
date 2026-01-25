import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth-utils"
import { sanitizeString } from "@/lib/validation"

/**
 * GET /api/locations - Fetch all locations for the organization
 * @returns {Location[]} Array of locations
 * @auth Required
 */
export async function GET() {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId } = authResult

    const locations = await prisma.location.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        phone: true,
        email: true,
        capacity: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ locations })
  } catch (error) {
    console.error("Failed to fetch locations:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/locations - Create a new location
 * @body {string} name - Location name (required)
 * @body {string} address - Street address (optional)
 * @body {string} city - City (optional)
 * @body {string} phone - Phone number (optional)
 * @body {string} email - Email (optional)
 * @body {number} capacity - Capacity (optional)
 * @returns {Location} Created location object
 * @auth Required
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId } = authResult

    const { name, address, city, phone, email, capacity } = await request.json()

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { message: "A helyszín neve kötelező" },
        { status: 400 }
      )
    }

    const location = await prisma.location.create({
      data: {
        name: sanitizeString(name),
        address: address ? sanitizeString(address) : null,
        city: city ? sanitizeString(city) : null,
        phone: phone ? sanitizeString(phone) : null,
        email: email ? sanitizeString(email) : null,
        capacity: capacity ? parseInt(capacity, 10) : null,
        organizationId,
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        phone: true,
        email: true,
        capacity: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ location }, { status: 201 })
  } catch (error) {
    console.error("Failed to create location:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
