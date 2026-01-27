import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import DashboardPage from "./(dashboard)/page"

export default async function HomePage() {
  console.log("[HOME] Starting...")
  
  let session
  try {
    session = await auth()
    console.log("[HOME] Session:", JSON.stringify(session?.user || null))
  } catch (error) {
    console.error("[HOME] Auth error:", error)
    redirect("/onboarding")
  }

  if (!session) {
    console.log("[HOME] No session, redirecting to onboarding")
    redirect("/onboarding")
  }

  console.log("[HOME] User role:", session.user?.role)
  console.log("[HOME] User orgId:", session.user?.organizationId)

  // SUPER_ADMIN without organization goes to admin dashboard
  if (session.user?.role === "SUPER_ADMIN" && !session.user?.organizationId) {
    console.log("[HOME] SUPER_ADMIN without org, redirecting to /admin")
    redirect("/admin")
  }

  // Regular users with organization see their dashboard
  if (session.user?.organizationId) {
    console.log("[HOME] Has org, showing dashboard")
    return <DashboardPage />
  }

  // Logged in but no organization - go to setup
  console.log("[HOME] No org, redirecting to /setup")
  redirect("/auth/setup-org")
}
