import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Public paths that don't require auth
  const publicPaths = [
    '/auth',
    '/api/auth',
    '/api/health',
    '/api/dev',
    '/api/organizations/lookup',
    '/api/subscribe/resume',
    '/api/webhooks',
    '/_next',
    '/favicon.ico',
    '/manifest.json',
    '/sw.js',
    '/pwa-icons',
    '/icons',
    '/img',
    '/adatvedelem',
    '/impresszum',
    '/aszf',
    '/onboarding',
    '/subscribe',
  ]
  
  // Check if path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  
  if (isPublicPath) {
    return NextResponse.next()
  }
  
  // Check for session cookie (NextAuth sets this)
  const sessionToken = request.cookies.get('authjs.session-token') || 
                       request.cookies.get('__Secure-authjs.session-token')
  
  // If no session and trying to access protected route, redirect to onboarding
  if (!sessionToken) {
    const onboardingUrl = new URL('/onboarding', request.url)
    return NextResponse.redirect(onboardingUrl)
  }
  
  // For authenticated users accessing dashboard routes, we need to check subscription
  // This is handled in the page/layout level since middleware can't easily fetch from DB
  // The root layout or dashboard layout will check subscription status
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
