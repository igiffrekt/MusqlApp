import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { checkFeatureAccess, checkLimit, getCurrentTier } from "@/lib/license"
import type { FeatureKey, LimitationKey } from "@/types"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'currentTier':
        const tierData = await getCurrentTier()
        return NextResponse.json(tierData)

      case 'checkFeature':
        const feature = searchParams.get('feature') as FeatureKey | null
        if (!feature) {
          return NextResponse.json({ error: "Feature parameter required" }, { status: 400 })
        }
        const hasAccess = await checkFeatureAccess(feature)
        return NextResponse.json({ hasAccess })

      case 'checkLimit':
        const limitType = searchParams.get('limitType') as LimitationKey | null
        if (!limitType) {
          return NextResponse.json({ error: "Limit type parameter required" }, { status: 400 })
        }
        const limitData = await checkLimit(limitType)
        return NextResponse.json(limitData)

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("License API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}