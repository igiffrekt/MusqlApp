import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"
import type { UserRole, LicenseTier, SubscriptionStatus } from "@prisma/client"

// Extend the Organization type for session
interface SessionOrganization {
  id: string
  name: string
  licenseTier: LicenseTier
  subscriptionStatus: SubscriptionStatus
}

declare module "next-auth" {
  interface User extends DefaultUser {
    role: UserRole
    organizationId: string
    organization: SessionOrganization | null
  }

  interface Session extends DefaultSession {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: UserRole
      organizationId: string
      organization: SessionOrganization | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    userRole?: UserRole
    organizationId?: string
    organization?: SessionOrganization | null
  }
}
