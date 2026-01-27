import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token hiányzik' }, { status: 400 })
    }

    // Find organization by setup token
    const organization = await prisma.organization.findUnique({
      where: { setupToken: token },
      include: {
        users: {
          where: { role: 'ADMIN' },
          take: 1,
        },
      },
    })

    if (!organization) {
      return NextResponse.json({ error: 'Érvénytelen vagy lejárt link' }, { status: 404 })
    }

    // Check if setup is already completed
    if (organization.setupCompletedAt) {
      return NextResponse.json({ 
        redirectTo: '/auth/signin',
        message: 'Az előfizetés már aktív. Kérjük jelentkezz be.',
      })
    }

    // Token is valid, redirect to subscribe page
    // The user will need to sign in first, then they'll be redirected
    return NextResponse.json({ 
      redirectTo: '/subscribe',
      organizationId: organization.id,
      organizationName: organization.name,
    })
  } catch (error) {
    console.error('Failed to verify resume token:', error)
    return NextResponse.json(
      { error: 'Hiba történt' },
      { status: 500 }
    )
  }
}
