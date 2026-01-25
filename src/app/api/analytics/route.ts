import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-utils"
import { getAnalyticsData } from "@/lib/analytics-service"
import { isValidDate } from "@/lib/validation"

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { organizationId } = authResult
    const { searchParams } = new URL(request.url)

    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    if (!startDate || !endDate) {
      return NextResponse.json(
        { message: "startDate and endDate are required" },
        { status: 400 }
      )
    }

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return NextResponse.json(
        { message: "Invalid date format" },
        { status: 400 }
      )
    }

    const dateRange = {
      start: new Date(startDate),
      end: new Date(endDate),
    }

    const analyticsData = await getAnalyticsData(organizationId, dateRange)

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error("Failed to fetch analytics:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}