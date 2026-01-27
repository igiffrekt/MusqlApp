import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-utils'
import type { LicenseTier } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId } = authResult
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Retrieve the Checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    })

    // Verify this session belongs to this organization
    if (session.metadata?.organizationId !== organizationId) {
      return NextResponse.json({ error: 'Session mismatch' }, { status: 403 })
    }

    if (session.status !== 'complete') {
      return NextResponse.json({ error: 'Payment not complete' }, { status: 400 })
    }

    const subscription = session.subscription as import('stripe').Stripe.Subscription | null

    // Update organization with subscription info
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        subscriptionStatus: 'TRIAL',
        licenseTier: (session.metadata?.licenseTier as LicenseTier) || 'STARTER',
        stripeSubscriptionId: subscription?.id || null,
        setupCompletedAt: new Date(),
        stripeCustomerId: session.customer as string,
      },
    })

    return NextResponse.json({ 
      success: true,
      subscriptionId: subscription?.id,
    })
  } catch (error) {
    console.error('Failed to verify session:', error)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}
