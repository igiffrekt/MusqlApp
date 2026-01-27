import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Public paths that dont require auth
  const publicPaths = [
    '/auth',
    '/api/auth',
    '/api/health',
    '/api/dev',
    '/api/organizations/lookup',
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
  
  // For authenticated users, check if they have an organization
  // We can check via the session, but middleware cant easily call auth()
  // So we rely on the client-side checks in setup-org and setup pages
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|pwa-icons|icons|img|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
