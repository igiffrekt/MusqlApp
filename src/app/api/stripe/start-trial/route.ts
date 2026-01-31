import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-utils'
import { TRIAL_PERIOD_DAYS, LICENSE_PRICES } from '@/lib/config'
import type { LicenseTier } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId } = authResult
    const { paymentMethodId, currency = 'HUF' } = await request.json()

    if (!paymentMethodId) {
      return NextResponse.json({ message: 'Payment method is required' }, { status: 400 })
    }

    // Get organization
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    })

    if (!organization) {
      return NextResponse.json({ message: 'Organization not found' }, { status: 404 })
    }

    const customerId = organization.stripeCustomerId
    if (!customerId) {
      return NextResponse.json({ message: 'No Stripe customer found' }, { status: 400 })
    }

    // Set the payment method as default for the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    })

    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })

    // Get or create the STARTER price
    const licenseTier: LicenseTier = 'STARTER'
    const priceAmount = LICENSE_PRICES[licenseTier][currency as keyof typeof LICENSE_PRICES.STARTER]
    const priceLookupKey = `musql_starter_${currency.toLowerCase()}_monthly_v2`

    let priceId: string

    // Try to find existing price
    const existingPrices = await stripe.prices.list({
      lookup_keys: [priceLookupKey],
      limit: 1,
    })

    if (existingPrices.data.length > 0) {
      priceId = existingPrices.data[0].id
    } else {
      // Create product and price
      const product = await stripe.products.create({
        name: `Musql Alap csomag (Havi)`,
        metadata: { tier: licenseTier, billingPeriod: 'monthly' },
      })

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: priceAmount,
        currency: currency.toLowerCase(),
        recurring: { interval: 'month' },
        lookup_key: priceLookupKey,
      })
      priceId = price.id
    }

    // Calculate trial end date
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_PERIOD_DAYS)

    // Create subscription with trial
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      trial_period_days: TRIAL_PERIOD_DAYS,
      default_payment_method: paymentMethodId,
      metadata: {
        organizationId,
        licenseTier,
      },
    })

    // Update organization with trial info
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        licenseTier,
        currency,
        trialEndsAt,
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: 'TRIAL',
        setupCompletedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      trialEndsAt: trialEndsAt.toISOString(),
      subscriptionId: subscription.id,
    })
  } catch (error) {
    console.error('Failed to start trial:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const stripeError = (error as any)?.raw?.message || errorMessage
    return NextResponse.json(
      { message: stripeError || 'Failed to start trial' },
      { status: 500 }
    )
  }
}
