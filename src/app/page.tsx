import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import DashboardPage from './(dashboard)/page'
import LandingPage from '@/components/landing/LandingPage'

export default async function HomePage() {
  const session = await auth()

  // No session - show landing page
  if (!session) {
    return <LandingPage />
  }

  // SUPER_ADMIN without organization goes to admin dashboard
  if (session.user?.role === 'SUPER_ADMIN' && !session.user?.organizationId) {
    redirect('/admin')
  }

  // Regular users with organization - check subscription status
  if (session.user?.organizationId) {
    const organization = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
      select: {
        setupCompletedAt: true,
        subscriptionStatus: true,
        trialEndsAt: true,
      },
    })

    // If setup not completed, redirect to subscribe
    if (!organization?.setupCompletedAt) {
      redirect('/subscribe')
    }

    // Check if subscription is valid (TRIAL or ACTIVE)
    const validStatuses = ['TRIAL', 'ACTIVE']
    if (!validStatuses.includes(organization.subscriptionStatus)) {
      redirect('/subscribe/pending')
    }

    // Check if trial has expired
    if (organization.subscriptionStatus === 'TRIAL' && organization.trialEndsAt) {
      const now = new Date()
      if (now > organization.trialEndsAt) {
        redirect('/subscribe/pending')
      }
    }

    // Valid subscription - show dashboard
    return <DashboardPage />
  }

  // Logged in but no organization - go to setup
  redirect('/auth/setup-org')
}
