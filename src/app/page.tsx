import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import DashboardPage from './(dashboard)/page'
import LandingPage from './(landing)/page'

export default async function HomePage() {
  console.log('[HOME] Starting...')
  
  let session
  try {
    session = await auth()
    console.log('[HOME] Session:', JSON.stringify(session?.user || null))
  } catch (error) {
    console.error('[HOME] Auth error:', error)
    // Show landing page for unauthenticated users
    return <LandingPage />
  }

  if (!session) {
    console.log('[HOME] No session, showing landing page')
    return <LandingPage />
  }

  console.log('[HOME] User role:', session.user?.role)
  console.log('[HOME] User orgId:', session.user?.organizationId)

  // SUPER_ADMIN without organization goes to admin dashboard
  if (session.user?.role === 'SUPER_ADMIN' && !session.user?.organizationId) {
    console.log('[HOME] SUPER_ADMIN without org, redirecting to /admin')
    redirect('/admin')
  }

  // Regular users with organization - check subscription status
  if (session.user?.organizationId) {
    // Check if setup is completed (subscription paywall)
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
      console.log('[HOME] Setup not completed, redirecting to /subscribe')
      redirect('/subscribe')
    }

    // Check if subscription is valid (TRIAL or ACTIVE)
    const validStatuses = ['TRIAL', 'ACTIVE']
    if (!validStatuses.includes(organization.subscriptionStatus)) {
      console.log('[HOME] Invalid subscription status, redirecting to /subscribe/pending')
      redirect('/subscribe/pending')
    }

    // Check if trial has expired
    if (organization.subscriptionStatus === 'TRIAL' && organization.trialEndsAt) {
      const now = new Date()
      if (now > organization.trialEndsAt) {
        console.log('[HOME] Trial expired, redirecting to /subscribe/pending')
        redirect('/subscribe/pending')
      }
    }

    console.log('[HOME] Has org with valid subscription, showing dashboard')
    return <DashboardPage />
  }

  // Logged in but no organization - go to setup
  console.log('[HOME] No org, redirecting to /auth/setup-org')
  redirect('/auth/setup-org')
}
