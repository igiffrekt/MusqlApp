import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-utils'
import { LICENSE_PRICES, TRIAL_PERIOD_DAYS, Currency } from '@/lib/config'
import type { LicenseTier } from '@prisma/client'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId, userId } = authResult
    const { licenseTier, currency = 'EUR' } = await request.json()

    // Validate tier
    if (!licenseTier || !['STARTER', 'PROFESSIONAL', 'ENTERPRISE'].includes(licenseTier)) {
      return NextResponse.json({ message: 'Invalid license tier' }, { status: 400 })
    }

    // Validate currency
    if (!['USD', 'EUR', 'HUF'].includes(currency)) {
      return NextResponse.json({ message: 'Invalid currency' }, { status: 400 })
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
      await prisma.organization.update({
        where: { id: organizationId },
        data: { stripeCustomerId: customerId },
      })
    }

    // Get price amount
    const priceAmount = LICENSE_PRICES[licenseTier as keyof typeof LICENSE_PRICES][currency as Currency]
    
    // Create or get the price in Stripe
    // Using a deterministic price lookup key
    const priceLookupKey = `musql_${licenseTier.toLowerCase()}_${currency.toLowerCase()}_monthly`
    
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
        name: `Musql ${licenseTier.charAt(0) + licenseTier.slice(1).toLowerCase()} Plan`,
        metadata: { tier: licenseTier },
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

    // Generate setup token for resume URL
    const setupToken = crypto.randomBytes(32).toString('hex')
    
    // Calculate trial end date
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_PERIOD_DAYS)

    // Update organization with setup token and trial info
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        setupToken,
        trialEndsAt,
        licenseTier: licenseTier as LicenseTier,
        currency,
      },
    })

    // Create Stripe Checkout session with trial
    const baseUrl = process.env.NEXTAUTH_URL || 'https://musql.app'
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: TRIAL_PERIOD_DAYS,
        metadata: {
          organizationId,
          licenseTier,
        },
      },
      success_url: `${baseUrl}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/subscribe/pending`,
      metadata: {
        organizationId,
        licenseTier,
        setupToken,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      payment_method_collection: 'if_required',
    })

    return NextResponse.json({ 
      checkoutUrl: session.url,
      setupToken,
      trialEndsAt: trialEndsAt.toISOString(),
    })
  } catch (error) {
    console.error('Failed to create checkout session:', error)
    return NextResponse.json(
      { message: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
