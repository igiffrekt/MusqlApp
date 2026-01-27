import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    
    // Simplified query - find orgs that need reminders
    const pendingOrgs = await prisma.organization.findMany({
      where: {
        setupToken: { not: null },
        setupCompletedAt: null,
        createdAt: { lt: oneHourAgo },
      },
      include: {
        users: {
          where: { role: 'ADMIN' },
          take: 1,
        },
      },
    })

    // If no pending orgs, return early
    if (pendingOrgs.length === 0) {
      return NextResponse.json({ 
        sent: 0,
        failed: 0,
        message: 'No pending organizations found',
        results: [],
      })
    }

    const results = []

    for (const org of pendingOrgs) {
      const admin = org.users[0]
      if (!admin?.email) {
        results.push({ orgId: org.id, status: 'skipped', reason: 'no admin email' })
        continue
      }

      // Skip if trial has expired
      if (org.trialEndsAt && new Date() > org.trialEndsAt) {
        results.push({ orgId: org.id, status: 'skipped', reason: 'trial expired' })
        continue
      }

      const resumeUrl = `https://musql.app/subscribe/resume/${org.setupToken}`
      const trialEndDate = org.trialEndsAt 
        ? new Date(org.trialEndsAt).toLocaleDateString('hu-HU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : '15 nap múlva'

      const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #171725; padding: 40px; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #D2F159; font-size: 32px; margin: 0;">💪 Musql</h1>
          </div>
          
          <h2 style="color: white; font-size: 24px; text-align: center; margin-bottom: 20px;">
            A vezérlőpultod vár rád!
          </h2>
          
          <p style="color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6; text-align: center;">
            Kedves ${admin.name || 'Edző'}!<br><br>
            Észrevettük, hogy még nem fejezted be a regisztrációt a <strong style="color: #D2F159;">${org.name}</strong> szervezet számára.
          </p>
          
          <div style="background: rgba(210, 241, 89, 0.1); border: 1px solid rgba(210, 241, 89, 0.3); border-radius: 12px; padding: 20px; margin: 30px 0;">
            <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px;">
              🎁 <strong style="color: white;">15 napos ingyenes próbaidő</strong> vár rád<br>
              💳 <strong style="color: white;">Nem terhelünk</strong> a próbaidő alatt<br>
              📅 Első fizetés: <strong style="color: #D2F159;">${trialEndDate}</strong>
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resumeUrl}" style="display: inline-block; background: #D2F159; color: #171725; font-weight: bold; font-size: 18px; padding: 16px 40px; border-radius: 100px; text-decoration: none;">
              Folytatás ahol abbahagytam →
            </a>
          </div>
          
          <p style="color: rgba(255,255,255,0.5); font-size: 12px; text-align: center; margin-top: 40px;">
            Ha nem te regisztráltál, nyugodtan hagyd figyelmen kívül ezt az emailt.<br>
            Kérdésed van? Írj nekünk: hello@musql.app
          </p>
        </div>
      `

      try {
        await sendEmail({
          to: admin.email,
          subject: '💪 A Musql vezérlőpultod vár rád!',
          html,
        })
        results.push({ orgId: org.id, email: admin.email, status: 'sent' })
      } catch (err) {
        console.error('Email send error:', err)
        results.push({ orgId: org.id, email: admin.email, status: 'failed', error: String(err) })
      }
    }

    return NextResponse.json({ 
      sent: results.filter(r => r.status === 'sent').length,
      failed: results.filter(r => r.status === 'failed').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      results,
    })
  } catch (error) {
    console.error('Reminder endpoint error:', error)
    return NextResponse.json(
      { error: 'Failed to send reminders', details: String(error) },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get('orgId')
  
  if (!orgId) {
    // Return stats
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const count = await prisma.organization.count({
      where: {
        setupToken: { not: null },
        setupCompletedAt: null,
        createdAt: { lt: oneHourAgo },
      },
    })
    return NextResponse.json({ pendingOrganizations: count })
  }

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      users: {
        where: { role: 'ADMIN' },
        take: 1,
      },
    },
  })

  if (!org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
  }

  const admin = org.users[0]
  
  return NextResponse.json({ 
    organization: org.name,
    adminEmail: admin?.email || null,
    setupToken: org.setupToken,
    setupCompletedAt: org.setupCompletedAt,
    resumeUrl: org.setupToken ? `https://musql.app/subscribe/resume/${org.setupToken}` : null,
  })
}
