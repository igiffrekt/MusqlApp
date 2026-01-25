import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import DashboardPage from "./(dashboard)/page"

export default async function HomePage() {
  const session = await auth()

  if (session) {
    return <DashboardPage />
  } else {
    redirect("/onboarding")
  }
}
