import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-utils"
import { prisma } from "@/lib/db"

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const userId = authResult.user.id
    const body = await request.json()
    const { firstName, lastName, phone, profileImage } = body

    // Debug logging
    console.log("[Profile Update] User:", userId)
    console.log("[Profile Update] Name:", firstName, lastName)
    console.log("[Profile Update] Has image:", !!profileImage)
    if (profileImage) {
      console.log("[Profile Update] Image length:", profileImage.length)
      console.log("[Profile Update] Image starts with:", profileImage.substring(0, 50))
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: `${firstName || ""} ${lastName || ""}`.trim() || null,
        phone: phone || null,
        image: profileImage || null,
      },
    })

    console.log("[Profile Update] Saved! Image in DB:", !!updatedUser.image)
    if (updatedUser.image) {
      console.log("[Profile Update] Saved image length:", updatedUser.image.length)
    }

    return NextResponse.json({
      success: true,
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        image: updatedUser.image,
      },
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const userId = authResult.user.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        phone: true,
        image: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    console.log("[Profile Get] User:", userId)
    console.log("[Profile Get] Has image:", !!user.image)
    if (user.image) {
      console.log("[Profile Get] Image length:", user.image.length)
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}
