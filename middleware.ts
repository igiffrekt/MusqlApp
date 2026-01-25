import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Simple middleware that checks for auth cookie
// Full auth validation happens in API routes/server components
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Public paths that don't require auth
  const publicPaths = [
    '/auth',
    '/api/auth',
    '/api/health',
    '/api/organizations/lookup',
    '/_next',
    '/favicon.ico',
    '/manifest.json',
    '/sw.js',
    '/pwa-icons',
    '/icons',
    '/img',
  ]
  
  // Check if path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  
  if (isPublicPath) {
    return NextResponse.next()
  }
  
  // Check for session cookie (NextAuth sets this)
  const sessionToken = request.cookies.get('authjs.session-token') || 
                       request.cookies.get('__Secure-authjs.session-token')
  
  // If no session and trying to access protected route, redirect to signin
  if (!sessionToken) {
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|pwa-icons|icons|img|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
