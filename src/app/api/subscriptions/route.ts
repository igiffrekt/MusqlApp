import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "@/lib/db"
import { createStripeCustomer, createSubscription } from "@/lib/stripe"
import { LICENSE_PRICES } from "@/lib/config"
import type { LicenseTier } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId } = authResult
    const { licenseTier } = await request.json()

    if (!licenseTier || !["STARTER", "PROFESSIONAL", "ENTERPRISE"].includes(licenseTier)) {
      return NextResponse.json({ message: "Invalid license tier" }, { status: 400 })
    }

    // Get organization details
    const organization = await prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
    })

    if (!organization) {
      return NextResponse.json({ message: "Organization not found" }, { status: 404 })
    }

    // Get or create Stripe customer
    let customerId = organization.stripeCustomerId

    if (!customerId) {
      // Create Stripe customer using admin user's email
      const adminUser = await prisma.user.findFirst({
        where: {
          organizationId,
          role: "ADMIN",
        },
      })

      if (!adminUser) {
        return NextResponse.json({ message: "Organization admin not found" }, { status: 404 })
      }

      const customer = await createStripeCustomer(
        adminUser.email,
        adminUser.name || organization.name,
        organizationId
      )

      customerId = customer.id

      // Update organization with Stripe customer ID
      await prisma.organization.update({
        where: {
          id: organizationId,
        },
        data: {
          stripeCustomerId: customerId,
        },
      })
    }

    // For now, we'll use a simple approach with fixed prices
    // In production, you'd create proper products and prices in Stripe
    const priceAmount = LICENSE_PRICES[licenseTier as keyof typeof LICENSE_PRICES]

    // Create a one-time payment for the license (simplified)
    // In a real implementation, you'd create recurring subscriptions
    const subscription = await createSubscription(customerId, `price_${licenseTier.toLowerCase()}`, {
      organizationId,
      licenseTier,
    })

    // Update organization with new license tier and subscription status
    await prisma.organization.update({
      where: {
        id: organizationId,
      },
      data: {
        licenseTier: licenseTier as LicenseTier,
        subscriptionStatus: "ACTIVE",
      },
    })

    return NextResponse.json({
      subscription,
      message: "Subscription created successfully",
    })
  } catch (error) {
    console.error("Failed to create subscription:", error)
    return NextResponse.json(
      { message: "Failed to create subscription" },
      { status: 500 }
    )
  }
}

// Get current subscription status
export async function GET() {
  try {
    const authResult = await requireAdmin()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId } = authResult

    const organization = await prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
      select: {
        licenseTier: true,
        subscriptionStatus: true,
        stripeCustomerId: true,
      },
    })

    if (!organization) {
      return NextResponse.json({ message: "Organization not found" }, { status: 404 })
    }

    return NextResponse.json({
      licenseTier: organization.licenseTier,
      subscriptionStatus: organization.subscriptionStatus,
      stripeCustomerId: organization.stripeCustomerId,
    })
  } catch (error) {
    console.error("Failed to get subscription:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}