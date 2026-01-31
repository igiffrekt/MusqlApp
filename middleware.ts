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
    '/api/subscribe',
    '/api/webhooks',
    '/api/join-requests',
    '/_next',
    '/favicon.ico',
    '/manifest.json',
    '/sw.js',
    '/pwa-icons',
    '/icons',
    '/fonts',
    '/img',
    '/adatvedelem',
    '/impresszum',
    '/aszf',
    '/cookie-szabalyzat',
    '/onboarding',
    '/subscribe',
    '/sitemap.xml',
    '/robots.txt',
  ]
  
  // Root path shows landing page for unauthenticated users
  if (pathname === '/') {
    return NextResponse.next()
  }
  
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
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files
     */
    '/((?!_next/static|_next/image|favicon.ico|fonts|icons|img|pwa-icons|manifest.json|sw.js|robots.txt|sitemap.xml).*)',
  ],
}
