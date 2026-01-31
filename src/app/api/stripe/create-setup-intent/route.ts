import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId, user } = authResult
    const userId = user.id

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
      await prisma.organization.update({
        where: { id: organizationId },
        data: { stripeCustomerId: customerId },
      })
    }

    // Create a SetupIntent with automatic payment methods (includes Card, Google Pay, Apple Pay)
    // usage: 'off_session' is required for wallets to appear
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      usage: 'off_session',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      metadata: {
        organizationId,
        userId,
      },
    })

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      customerId,
    })
  } catch (error) {
    console.error('Failed to create setup intent:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { message: errorMessage || 'Failed to create setup intent' },
      { status: 500 }
    )
  }
}
