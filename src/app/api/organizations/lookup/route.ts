import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/**
 * GET /api/organizations/lookup?slug=xyz
 * Public endpoint to look up organization by slug
 * Returns only public info (id, name, slug)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug")

    if (!slug) {
      return NextResponse.json(
        { message: "A slug parameter megadasa kotelezo" },
        { status: 400 }
      )
    }

    const organization = await prisma.organization.findUnique({
      where: { slug: slug.toLowerCase() },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    })

    if (!organization) {
      return NextResponse.json(
        { message: "Szervezet nem talalhato" },
        { status: 404 }
      )
    }

    return NextResponse.json(organization)
  } catch (error) {
    console.error("Organization lookup error:", error)
    return NextResponse.json(
      { message: "Szerver hiba" },
      { status: 500 }
    )
  }
}
