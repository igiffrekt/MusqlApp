import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-utils"
import { prisma } from "@/lib/db"

// Subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const userId = authResult.user.id
    const { endpoint, p256dh, auth: authKey, userAgent } = await request.json()

    if (!endpoint || !p256dh || !authKey) {
      return NextResponse.json({ message: "Invalid subscription data" }, { status: 400 })
    }

    // Check if subscription already exists
    const existingSubscription = await prisma.pushSubscription.findUnique({
      where: {
        userId_endpoint: {
          userId,
          endpoint,
        },
      },
    })

    if (existingSubscription) {
      // Update existing subscription
      await prisma.pushSubscription.update({
        where: {
          userId_endpoint: {
            userId,
            endpoint,
          },
        },
        data: {
          p256dh,
          auth: authKey,
          userAgent,
        },
      })
    } else {
      // Create new subscription
      await prisma.pushSubscription.create({
        data: {
          userId,
          endpoint,
          p256dh,
          auth: authKey,
          userAgent,
        },
      })
    }

    return NextResponse.json({ message: "Push subscription saved" })
  } catch (error) {
    console.error("Failed to save push subscription:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

// Get user's push subscriptions
export async function GET() {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const userId = authResult.user.id

    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        endpoint: true,
        userAgent: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ subscriptions })
  } catch (error) {
    console.error("Failed to fetch push subscriptions:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}