import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import type { LicenseTier, SubscriptionStatus } from '@prisma/client'
import type Stripe from 'stripe'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const sig = (await headers()).get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('Webhook signature verification failed:', message)
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
    }

    console.log('[Webhook] Event:', event.type)

    switch (event.type) {
      // Checkout completed - initial subscription setup
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const organizationId = session.metadata?.organizationId
        const licenseTier = session.metadata?.licenseTier as LicenseTier

        if (organizationId) {
          await prisma.organization.update({
            where: { id: organizationId },
            data: {
              subscriptionStatus: 'TRIAL',
              licenseTier: licenseTier || 'STARTER',
              stripeCustomerId: session.customer as string,
              setupCompletedAt: new Date(),
            },
          })
          console.log('[Webhook] Checkout completed for org:', organizationId)
        }
        break
      }

      // Subscription created
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        const organizationId = subscription.metadata?.organizationId

        if (organizationId) {
          const status: SubscriptionStatus = subscription.status === 'trialing' ? 'TRIAL' : 'ACTIVE'
          
          await prisma.organization.update({
            where: { id: organizationId },
            data: {
              subscriptionStatus: status,
              stripeSubscriptionId: subscription.id,
              stripeCustomerId: subscription.customer as string,
            },
          })
          console.log('[Webhook] Subscription created for org:', organizationId, 'status:', status)
        }
        break
      }

      // Subscription updated (trial ended, renewed, etc.)
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const organizationId = subscription.metadata?.organizationId

        if (organizationId) {
          let status: SubscriptionStatus = 'ACTIVE'
          
          switch (subscription.status) {
            case 'trialing':
              status = 'TRIAL'
              break
            case 'active':
              status = 'ACTIVE'
              break
            case 'past_due':
              status = 'PAST_DUE'
              break
            case 'canceled':
            case 'unpaid':
              status = 'CANCELLED'
              break
          }

          await prisma.organization.update({
            where: { id: organizationId },
            data: {
              subscriptionStatus: status,
              licenseTier: (subscription.metadata?.licenseTier as LicenseTier) || undefined,
            },
          })
          console.log('[Webhook] Subscription updated for org:', organizationId, 'status:', status)
        }
        break
      }

      // Subscription deleted/cancelled
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const organizationId = subscription.metadata?.organizationId

        if (organizationId) {
          await prisma.organization.update({
            where: { id: organizationId },
            data: {
              subscriptionStatus: 'CANCELLED',
            },
          })
          console.log('[Webhook] Subscription cancelled for org:', organizationId)
        }
        break
      }

      // Trial will end soon (3 days before)
      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription
        const organizationId = subscription.metadata?.organizationId
        
        if (organizationId) {
          // TODO: Send reminder email
          console.log('[Webhook] Trial ending soon for org:', organizationId)
        }
        break
      }

      // Payment succeeded
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const organizationId = subscription.metadata?.organizationId

          if (organizationId) {
            await prisma.organization.update({
              where: { id: organizationId },
              data: {
                subscriptionStatus: 'ACTIVE',
              },
            })
            console.log('[Webhook] Payment succeeded for org:', organizationId)
          }
        }
        break
      }

      // Payment failed
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const organizationId = subscription.metadata?.organizationId

          if (organizationId) {
            await prisma.organization.update({
              where: { id: organizationId },
              data: {
                subscriptionStatus: 'PAST_DUE',
              },
            })
            console.log('[Webhook] Payment failed for org:', organizationId)
            // TODO: Send payment failed email
          }
        }
        break
      }

      default:
        console.log('[Webhook] Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
