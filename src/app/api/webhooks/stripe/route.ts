import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/db"

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const sig = (await headers()).get("stripe-signature")!

    let event

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error"
      console.error(`Webhook signature verification failed.`, message)
      return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object

        // Update payment status in database
        if (paymentIntent.metadata?.paymentId) {
          await prisma.payment.update({
            where: {
              id: paymentIntent.metadata.paymentId,
            },
            data: {
              status: "PAID",
              paidDate: new Date(),
              paymentMethod: "STRIPE",
              stripePaymentIntentId: paymentIntent.id,
            },
          })
        }
        break

      case "payment_intent.payment_failed":
        const failedPaymentIntent = event.data.object

        // Update payment status to failed
        if (failedPaymentIntent.metadata?.paymentId) {
          await prisma.payment.update({
            where: {
              id: failedPaymentIntent.metadata.paymentId,
            },
            data: {
              status: "CANCELLED",
            },
          })
        }
        break

      case "customer.subscription.created":
        const subscription = event.data.object

        // Handle subscription creation for license tiers
        if (subscription.metadata?.organizationId) {
          await prisma.organization.update({
            where: {
              id: subscription.metadata.organizationId,
            },
            data: {
              subscriptionStatus: "ACTIVE",
              stripeCustomerId: subscription.customer as string,
            },
          })
        }
        break

      case "customer.subscription.updated":
        const updatedSubscription = event.data.object

        // Handle subscription updates
        if (updatedSubscription.metadata?.organizationId) {
          const status = updatedSubscription.status === "active" ? "ACTIVE" : "CANCELLED"

          await prisma.organization.update({
            where: {
              id: updatedSubscription.metadata.organizationId,
            },
            data: {
              subscriptionStatus: status,
            },
          })
        }
        break

      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object

        // Handle subscription cancellation
        if (deletedSubscription.metadata?.organizationId) {
          await prisma.organization.update({
            where: {
              id: deletedSubscription.metadata.organizationId,
            },
            data: {
              subscriptionStatus: "CANCELLED",
            },
          })
        }
        break

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}