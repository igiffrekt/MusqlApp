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
        slug: true,
        settings: true,
        notificationSettings: true,
        monthlyPassPrice: true,
        monthlyPassStudentPrice: true,
        dailyPrice: true,
        dailyStudentPrice: true,
        privateSessionPrice: true,
        bankAccountName: true,
        bankAccountNumber: true,
        bankName: true,
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
    const body = await request.json()
    const { 
      settings, 
      notificationSettings,
      monthlyPassPrice,
      monthlyPassStudentPrice,
      dailyPrice,
      dailyStudentPrice,
      privateSessionPrice,
      bankAccountName,
      bankAccountNumber,
      bankName,
    } = body

    const updateData: {
      settings?: string
      name?: string
      notificationSettings?: string
      monthlyPassPrice?: number | null
      monthlyPassStudentPrice?: number | null
      dailyPrice?: number | null
      dailyStudentPrice?: number | null
      privateSessionPrice?: number | null
      bankAccountName?: string | null
      bankAccountNumber?: string | null
      bankName?: string | null
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

    // Handle pricing fields
    if (monthlyPassPrice !== undefined) updateData.monthlyPassPrice = monthlyPassPrice
    if (monthlyPassStudentPrice !== undefined) updateData.monthlyPassStudentPrice = monthlyPassStudentPrice
    if (dailyPrice !== undefined) updateData.dailyPrice = dailyPrice
    if (dailyStudentPrice !== undefined) updateData.dailyStudentPrice = dailyStudentPrice
    if (privateSessionPrice !== undefined) updateData.privateSessionPrice = privateSessionPrice

    // Handle bank account fields
    if (bankAccountName !== undefined) updateData.bankAccountName = bankAccountName || null
    if (bankAccountNumber !== undefined) updateData.bankAccountNumber = bankAccountNumber || null
    if (bankName !== undefined) updateData.bankName = bankName || null

    const updatedOrganization = await prisma.organization.update({
      where: { id: organizationId },
      data: updateData,
      select: {
        id: true,
        name: true,
        slug: true,
        settings: true,
        notificationSettings: true,
        monthlyPassPrice: true,
        monthlyPassStudentPrice: true,
        dailyPrice: true,
        dailyStudentPrice: true,
        privateSessionPrice: true,
        bankAccountName: true,
        bankAccountNumber: true,
        bankName: true,
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