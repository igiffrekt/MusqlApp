import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "@/lib/db"
import { createSubscription, createPrice, createStripeCustomer } from "@/lib/stripe"
import { LicenseTier, TIER_FEATURES } from "@/lib/license"
import type { LicenseTier as PrismaLicenseTier } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId } = authResult
    const { targetTier, currentTier } = await request.json()

    const validTiers = ["STARTER", "PROFESSIONAL", "ENTERPRISE"]
    if (!targetTier || !validTiers.includes(targetTier)) {
      return NextResponse.json({ message: "Invalid target tier" }, { status: 400 })
    }

    // Get organization
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    })

    if (!organization) {
      return NextResponse.json({ message: "Organization not found" }, { status: 404 })
    }

    // Check if already on target tier
    if (organization.licenseTier === targetTier) {
      return NextResponse.json({ message: "Already on this tier" }, { status: 400 })
    }

    // Get or create Stripe customer
    let customerId = organization.stripeCustomerId

    if (!customerId) {
      // Create Stripe customer
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
        where: { id: organizationId },
        data: { stripeCustomerId: customerId },
      })
    }

    const targetTierConfig = TIER_FEATURES[targetTier as LicenseTier]

    // For now, create a simple subscription
    // In production, you'd create proper products and prices in Stripe
    try {
      // Create a price for this tier (this is simplified - in production you'd reuse existing prices)
      const { price } = await createPrice(
        targetTierConfig.price,
        "usd",
        `${targetTierConfig.name} Plan`,
        "month"
      )

      // Create subscription
      const subscription = await createSubscription(customerId, price.id, {
        organizationId,
        targetTier,
      })

      // Update organization
      await prisma.organization.update({
        where: { id: organizationId },
        data: {
          licenseTier: targetTier as PrismaLicenseTier,
          subscriptionStatus: "ACTIVE",
        },
      })

      return NextResponse.json({
        message: "Subscription upgraded successfully",
        subscription,
        newTier: targetTier,
      })
    } catch (stripeError) {
      console.error("Stripe error:", stripeError)

      // Handle specific Stripe errors
      if (stripeError instanceof Error && 'type' in stripeError) {
        const error = stripeError as { type: string; message: string }
        if (error.type === "StripeCardError") {
          return NextResponse.json({
            message: "Payment failed: " + error.message
          }, { status: 400 })
        }
      }

      return NextResponse.json({
        message: "Payment processing failed. Please try again."
      }, { status: 500 })
    }
  } catch (error) {
    console.error("Failed to upgrade subscription:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}