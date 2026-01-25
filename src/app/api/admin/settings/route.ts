import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const authResult = await requireAdmin()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId } = authResult

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        settings: true,
        notificationSettings: true,
      },
    })

    if (!organization) {
      return NextResponse.json({ message: "Organization not found" }, { status: 404 })
    }

    return NextResponse.json({
      settings: {
        ...organization,
        settings: organization.settings ? JSON.parse(organization.settings as string) : {},
        notificationSettings: organization.notificationSettings ? JSON.parse(organization.notificationSettings as string) : {},
      }
    })
  } catch (error) {
    console.error("Failed to fetch settings:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId } = authResult
    const { settings, notificationSettings } = await request.json()

    const updateData: {
      settings?: string
      name?: string
      notificationSettings?: string
    } = {}

    if (settings) {
      updateData.settings = JSON.stringify(settings)

      // Update organization name if provided
      if (settings.name) {
        updateData.name = settings.name
      }
    }

    if (notificationSettings) {
      updateData.notificationSettings = JSON.stringify(notificationSettings)
    }

    const updatedOrganization = await prisma.organization.update({
      where: { id: organizationId },
      data: updateData,
      select: {
        id: true,
        name: true,
        settings: true,
        notificationSettings: true,
      },
    })

    return NextResponse.json({
      settings: {
        ...updatedOrganization,
        settings: updatedOrganization.settings ? JSON.parse(updatedOrganization.settings as string) : {},
        notificationSettings: updatedOrganization.notificationSettings ? JSON.parse(updatedOrganization.notificationSettings as string) : {},
      }
    })
  } catch (error) {
    console.error("Failed to update settings:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}