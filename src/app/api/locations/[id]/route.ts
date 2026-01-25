import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth-utils"
import { sanitizeString } from "@/lib/validation"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/locations/[id] - Fetch a single location
 * @returns {Location} Location object
 * @auth Required
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId } = authResult
    const { id } = await params

    const location = await prisma.location.findFirst({
      where: {
        id,
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

    if (!location) {
      return NextResponse.json(
        { message: "Helyszín nem található" },
        { status: 404 }
      )
    }

    return NextResponse.json({ location })
  } catch (error) {
    console.error("Failed to fetch location:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/locations/[id] - Update a location
 * @body {string} name - Location name
 * @body {string} address - Street address
 * @body {string} city - City
 * @body {string} phone - Phone number
 * @body {string} email - Email
 * @body {number} capacity - Capacity
 * @returns {Location} Updated location object
 * @auth Required
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId } = authResult
    const { id } = await params
    const updates = await request.json()

    // Verify location belongs to organization
    const existingLocation = await prisma.location.findFirst({
      where: { id, organizationId },
    })

    if (!existingLocation) {
      return NextResponse.json(
        { message: "Helyszín nem található" },
        { status: 404 }
      )
    }

    // Sanitize and prepare update data
    const updateData: Record<string, string | number | null> = {}
    if (updates.name !== undefined) {
      updateData.name = sanitizeString(updates.name)
    }
    if (updates.address !== undefined) {
      updateData.address = updates.address ? sanitizeString(updates.address) : null
    }
    if (updates.city !== undefined) {
      updateData.city = updates.city ? sanitizeString(updates.city) : null
    }
    if (updates.phone !== undefined) {
      updateData.phone = updates.phone ? sanitizeString(updates.phone) : null
    }
    if (updates.email !== undefined) {
      updateData.email = updates.email ? sanitizeString(updates.email) : null
    }
    if (updates.capacity !== undefined) {
      updateData.capacity = updates.capacity ? parseInt(updates.capacity, 10) : null
    }

    const location = await prisma.location.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ location })
  } catch (error) {
    console.error("Failed to update location:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/locations/[id] - Delete a location
 * @returns {message} Success message
 * @auth Required
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId } = authResult
    const { id } = await params

    // Verify location belongs to organization
    const existingLocation = await prisma.location.findFirst({
      where: { id, organizationId },
    })

    if (!existingLocation) {
      return NextResponse.json(
        { message: "Helyszín nem található" },
        { status: 404 }
      )
    }

    await prisma.location.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Helyszín törölve" })
  } catch (error) {
    console.error("Failed to delete location:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
