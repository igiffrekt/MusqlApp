import { Stripe } from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is required")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-12-15.clover",
  typescript: true,
})

export const getStripeCustomer = async (customerId: string) => {
  try {
    return await stripe.customers.retrieve(customerId)
  } catch (error) {
    console.error("Failed to retrieve Stripe customer:", error)
    return null
  }
}

export const createStripeCustomer = async (email: string, name: string, organizationId: string) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        organizationId,
      },
    })
    return customer
  } catch (error) {
    console.error("Failed to create Stripe customer:", error)
    throw error
  }
}

export const createPaymentIntent = async (
  amount: number,
  currency: string = "usd",
  customerId?: string,
  metadata?: Record<string, string>
) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: customerId,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    })
    return paymentIntent
  } catch (error) {
    console.error("Failed to create payment intent:", error)
    throw error
  }
}

export const createSubscription = async (
  customerId: string,
  priceId: string,
  metadata?: Record<string, string>
) => {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{
        price: priceId,
      }],
      metadata,
    })
    return subscription
  } catch (error) {
    console.error("Failed to create subscription:", error)
    throw error
  }
}

export const createPrice = async (
  amount: number,
  currency: string = "usd",
  productName: string,
  interval?: "month" | "year"
) => {
  try {
    // First create a product
    const product = await stripe.products.create({
      name: productName,
    })

    // Then create a price
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(amount * 100),
      currency,
      ...(interval && {
        recurring: {
          interval,
        },
      }),
    })

    return { product, price }
  } catch (error) {
    console.error("Failed to create price:", error)
    throw error
  }
}

export const confirmPaymentIntent = async (paymentIntentId: string) => {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId)
    return paymentIntent
  } catch (error) {
    console.error("Failed to confirm payment intent:", error)
    throw error
  }
}