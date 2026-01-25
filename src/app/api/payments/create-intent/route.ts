import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-utils"
import { prisma } from "@/lib/db"
import { createPaymentIntent, createStripeCustomer } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId } = authResult
    const { paymentId, studentId, amount, currency = "usd" } = await request.json()

    // Verify payment belongs to organization
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        student: {
          organizationId,
        },
      },
      include: {
        student: true,
      },
    })

    if (!payment) {
      return NextResponse.json({ message: "Payment not found" }, { status: 404 })
    }

    if (payment.status === "PAID") {
      return NextResponse.json({ message: "Payment already completed" }, { status: 400 })
    }

    // Get organization for Stripe customer ID
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { stripeCustomerId: true },
    })

    if (!organization) {
      return NextResponse.json({ message: "Organization not found" }, { status: 404 })
    }

    // Get or create Stripe customer
    let customerId = organization.stripeCustomerId

    if (!customerId) {
      // Require valid email for Stripe customer
      if (!payment.student.email) {
        return NextResponse.json(
          { message: "Student email is required for payment processing" },
          { status: 400 }
        )
      }

      // Create Stripe customer
      const customer = await createStripeCustomer(
        payment.student.email,
        `${payment.student.firstName} ${payment.student.lastName}`,
        organizationId
      )

      customerId = customer.id

      // Update organization with Stripe customer ID
      await prisma.organization.update({
        where: { id: organizationId },
        data: { stripeCustomerId: customerId },
      })

    }

    // Create payment intent
    const paymentIntent = await createPaymentIntent(amount, currency, customerId, {
      paymentId,
      studentId: payment.student.id,
      organizationId,
    })

    // Update payment with Stripe payment intent ID
    await prisma.payment.update({
      where: {
        id: paymentId,
      },
      data: {
        stripePaymentIntentId: paymentIntent.id,
        paymentMethod: "STRIPE",
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error("Failed to create payment intent:", error)
    return NextResponse.json(
      { message: "Failed to create payment intent" },
      { status: 500 }
    )
  }
}