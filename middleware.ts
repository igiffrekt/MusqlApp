import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const token = req.auth
  const pathname = req.nextUrl.pathname
  const isAuthPage = pathname.startsWith('/auth')
  const isApiRoute = pathname.startsWith('/api')

  // Allow access to auth pages
  if (isAuthPage) {
    return NextResponse.next()
  }

  // If user is not authenticated and trying to access protected route
  if (!token && !isApiRoute) {
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }

  // Role-based route protection
  if (token) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = (token as any).userRole as string | undefined

    // Block students from trainer routes
    if (userRole === "STUDENT" && pathname.startsWith('/trainer')) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Block students from admin routes
    if (userRole === "STUDENT" && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Block non-admins from admin routes
    if (pathname.startsWith('/admin') && userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}