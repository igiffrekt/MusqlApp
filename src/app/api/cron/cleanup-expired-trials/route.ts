import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/**
 * CRON: Cleanup expired trial accounts after 30 days
 * Should be called daily via cron job
 * 
 * Authorization: Requires CRON_SECRET in headers
 */
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Find organizations where:
    // - Status is TRIAL
    // - Trial ended more than 30 days ago
    // - No active subscription
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const expiredOrgs = await prisma.organization.findMany({
      where: {
        subscriptionStatus: "TRIAL",
        trialEndsAt: {
          lt: thirtyDaysAgo,
        },
        stripeSubscriptionId: null, // No active subscription
      },
      select: {
        id: true,
        name: true,
        trialEndsAt: true,
        _count: {
          select: {
            users: true,
            students: true,
          },
        },
      },
    })

    const results: { orgId: string; name: string; deleted: boolean; error?: string }[] = []

    for (const org of expiredOrgs) {
      try {
        // Delete organization and all related data
        await prisma.$transaction(async (tx) => {
          // Delete attendances first (references sessions and students)
          await tx.attendance.deleteMany({
            where: { 
              session: { organizationId: org.id } 
            },
          })

          // Delete sessions
          await tx.session.deleteMany({
            where: { organizationId: org.id },
          })

          // Delete payments (references students)
          await tx.payment.deleteMany({
            where: { 
              student: { organizationId: org.id } 
            },
          })

          // Delete student-group relations
          await tx.studentGroup.deleteMany({
            where: {
              student: { organizationId: org.id },
            },
          })

          // Delete students
          await tx.student.deleteMany({
            where: { organizationId: org.id },
          })

          // Delete groups
          await tx.group.deleteMany({
            where: { organizationId: org.id },
          })

          // Delete join requests
          await tx.joinRequest.deleteMany({
            where: { organizationId: org.id },
          })

          // Delete locations
          await tx.location.deleteMany({
            where: { organizationId: org.id },
          })

          // Delete roles
          await tx.role.deleteMany({
            where: { organizationId: org.id },
          })

          // Delete user-related data
          const userIds = await tx.user.findMany({
            where: { organizationId: org.id },
            select: { id: true },
          })

          for (const user of userIds) {
            await tx.notification.deleteMany({ where: { userId: user.id } })
            await tx.pushSubscription.deleteMany({ where: { userId: user.id } })
            await tx.account.deleteMany({ where: { userId: user.id } })
            await tx.authSession.deleteMany({ where: { userId: user.id } })
          }

          // Delete users
          await tx.user.deleteMany({
            where: { organizationId: org.id },
          })

          // Finally delete the organization
          await tx.organization.delete({
            where: { id: org.id },
          })
        })

        results.push({
          orgId: org.id,
          name: org.name,
          deleted: true,
        })

        console.log(`[CRON] Deleted expired trial org: ${org.name} (ID: ${org.id})`)
      } catch (error) {
        console.error(`[CRON] Failed to delete org ${org.id}:`, error)
        results.push({
          orgId: org.id,
          name: org.name,
          deleted: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({
      success: true,
      processed: expiredOrgs.length,
      deleted: results.filter(r => r.deleted).length,
      failed: results.filter(r => !r.deleted).length,
      results,
    })
  } catch (error) {
    console.error("[CRON] Cleanup expired trials error:", error)
    return NextResponse.json(
      { error: "Failed to process cleanup" },
      { status: 500 }
    )
  }
}
