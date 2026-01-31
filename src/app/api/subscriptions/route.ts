import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { LICENSE_PRICES, TRIAL_PERIOD_DAYS, Currency } from '@/lib/config'
import type { LicenseTier } from '@prisma/client'
import crypto from 'crypto'

// Get current subscription status
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
        licenseTier: true,
        subscriptionStatus: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        trialEndsAt: true,
        setupToken: true,
        setupCompletedAt: true,
        currency: true,
      },
    })

    if (!organization) {
      return NextResponse.json({ message: 'Organization not found' }, { status: 404 })
    }

    return NextResponse.json({
      licenseTier: organization.licenseTier,
      subscriptionStatus: organization.subscriptionStatus,
      stripeCustomerId: organization.stripeCustomerId,
      stripeSubscriptionId: organization.stripeSubscriptionId,
      trialEndsAt: organization.trialEndsAt?.toISOString() || null,
      setupToken: organization.setupToken,
      setupCompletedAt: organization.setupCompletedAt?.toISOString() || null,
      currency: organization.currency,
    })
  } catch (error) {
    console.error('Failed to get subscription:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create or update subscription
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId } = authResult; const userId = authResult.user.id
    const { licenseTier, currency = 'EUR' } = await request.json()

    if (!licenseTier || !['STARTER', 'PROFESSIONAL', 'ENTERPRISE'].includes(licenseTier)) {
      return NextResponse.json({ message: 'Invalid license tier' }, { status: 400 })
    }

    // Get organization and admin user
    const [organization, adminUser] = await Promise.all([
      prisma.organization.findUnique({ where: { id: organizationId } }),
      prisma.user.findUnique({ where: { id: userId } }),
    ])

    if (!organization || !adminUser) {
      return NextResponse.json({ message: 'Organization or user not found' }, { status: 404 })
    }

    // Get or create Stripe customer
    let customerId = organization.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: adminUser.email,
        name: adminUser.name || organization.name,
        metadata: { organizationId },
      })
      customerId = customer.id
    }

    // Generate setup token if not exists
    const setupToken = organization.setupToken || crypto.randomBytes(32).toString('hex')
    
    // Calculate trial end date
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_PERIOD_DAYS)

    // Update organization
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        stripeCustomerId: customerId,
        licenseTier: licenseTier as LicenseTier,
        setupToken,
        trialEndsAt,
        currency,
      },
    })

    return NextResponse.json({
      message: 'Subscription info updated',
      setupToken,
      trialEndsAt: trialEndsAt.toISOString(),
    })
  } catch (error) {
    console.error('Failed to update subscription:', error)
    return NextResponse.json(
      { message: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}
