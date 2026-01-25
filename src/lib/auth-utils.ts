import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

/**
 * Extended user type with organization context
 */
export interface AuthenticatedUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role: "SUPER_ADMIN" | "ADMIN" | "TRAINER" | "STUDENT"
  organizationId: string
  organization?: {
    id: string
    name: string
    licenseTier: string
    subscriptionStatus: string
  } | null
}

/**
 * Extended session type with proper typing
 */
export interface AuthenticatedSession {
  user: AuthenticatedUser
  expires: string
}

/**
 * Result type for auth check
 */
export type AuthResult =
  | { success: true; session: AuthenticatedSession; user: AuthenticatedUser; organizationId: string }
  | { success: false; response: NextResponse }

/**
 * Check authentication and return typed session
 * Use this in API routes instead of raw auth() + type casting
 */
export async function requireAuth(): Promise<AuthResult> {
  const session = await auth()

  if (!session?.user) {
    return {
      success: false,
      response: NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      ),
    }
  }

  const user = session.user as AuthenticatedUser

  if (!user.organizationId) {
    return {
      success: false,
      response: NextResponse.json(
        { message: "Organization context required" },
        { status: 403 }
      ),
    }
  }

  return {
    success: true,
    session: session as AuthenticatedSession,
    user,
    organizationId: user.organizationId,
  }
}

/**
 * Check if user has required role
 */
export function hasRole(
  user: AuthenticatedUser,
  allowedRoles: Array<"SUPER_ADMIN" | "ADMIN" | "TRAINER" | "STUDENT">
): boolean {
  return allowedRoles.includes(user.role)
}

/**
 * Check authentication and role
 */
export async function requireAuthWithRole(
  allowedRoles: Array<"SUPER_ADMIN" | "ADMIN" | "TRAINER" | "STUDENT">
): Promise<AuthResult> {
  const authResult = await requireAuth()

  if (!authResult.success) {
    return authResult
  }

  if (!hasRole(authResult.user, allowedRoles)) {
    return {
      success: false,
      response: NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      ),
    }
  }

  return authResult
}

/**
 * Check if user is admin (ADMIN or SUPER_ADMIN)
 */
export async function requireAdmin(): Promise<AuthResult> {
  return requireAuthWithRole(["ADMIN", "SUPER_ADMIN"])
}

/**
 * Check if user is trainer or higher
 */
export async function requireTrainer(): Promise<AuthResult> {
  return requireAuthWithRole(["TRAINER", "ADMIN", "SUPER_ADMIN"])
}
