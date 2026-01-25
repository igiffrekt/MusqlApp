import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-utils"
import { prisma } from "@/lib/db"

/**
 * DELETE /api/user/delete - Delete user account and all associated data
 * For admins: Also deletes the entire organization if they're the only admin
 * @auth Required
 */
export async function DELETE() {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const userId = authResult.user.id
    const organizationId = authResult.organizationId
    const userRole = authResult.user.role

    // Check if this user is an admin and if there are other admins in the org
    if (userRole === "ADMIN" || userRole === "TRAINER") {
      const otherAdmins = await prisma.user.count({
        where: {
          organizationId,
          id: { not: userId },
          role: { in: ["ADMIN", "TRAINER"] },
        },
      })

      // If this is the only admin, delete the entire organization
      // This will cascade delete all related data
      if (otherAdmins === 0) {
        await prisma.$transaction(async (tx) => {
          // Delete all sessions and their attendances (cascade handles attendances)
          await tx.session.deleteMany({
            where: { organizationId },
          })

          // Delete all students and their related data (payments, attendances, etc.)
          await tx.student.deleteMany({
            where: { organizationId },
          })

          // Delete all groups
          await tx.group.deleteMany({
            where: { organizationId },
          })

          // Delete all join requests
          await tx.joinRequest.deleteMany({
            where: { organizationId },
          })

          // Delete all locations
          await tx.location.deleteMany({
            where: { organizationId },
          })

          // Delete all roles
          await tx.role.deleteMany({
            where: { organizationId },
          })

          // Delete the user (will cascade delete notifications, accounts, sessions, push subscriptions)
          await tx.user.delete({
            where: { id: userId },
          })

          // Finally delete the organization
          await tx.organization.delete({
            where: { id: organizationId },
          })
        })

        return NextResponse.json({
          message: "Fiók és szervezet sikeresen törölve",
          deletedOrganization: true,
        })
      }
    }

    // If not the only admin, or if student, just delete the user
    await prisma.$transaction(async (tx) => {
      // Delete user's notifications
      await tx.notification.deleteMany({
        where: { userId },
      })

      // Delete user's push subscriptions
      await tx.pushSubscription.deleteMany({
        where: { userId },
      })

      // Delete user's accounts (OAuth connections)
      await tx.account.deleteMany({
        where: { userId },
      })

      // Delete user's auth sessions
      await tx.authSession.deleteMany({
        where: { userId },
      })

      // If user is linked to a student record, unlink it
      await tx.student.updateMany({
        where: { userId },
        data: { userId: null },
      })

      // Delete the user
      await tx.user.delete({
        where: { id: userId },
      })
    })

    return NextResponse.json({
      message: "Fiók sikeresen törölve",
      deletedOrganization: false,
    })
  } catch (error) {
    console.error("Failed to delete user account:", error)
    return NextResponse.json(
      { message: "Hiba történt a fiók törlése során" },
      { status: 500 }
    )
  }
}
