import "server-only"

import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import type { Adapter } from "next-auth/adapters"
import { prisma } from "@/lib/db"
import Google from "next-auth/providers/google"
import Facebook from "next-auth/providers/facebook"
import Credentials from "next-auth/providers/credentials"
import Resend from "next-auth/providers/resend"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    Google({
      allowDangerousEmailAccountLinking: true,
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Facebook({
      allowDangerousEmailAccountLinking: true,
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: process.env.EMAIL_FROM || "Musql <noreply@musql.com>",
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
            include: { organization: true, customRole: true }
          })

          if (!user || !user.password) {
            return null
          }

          const bcrypt = await import("bcryptjs")
          const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password)

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            organizationId: user.organizationId ?? undefined,
            organization: user.organization,
          } as any
        } catch (error) {
          console.error("Auth error:", error instanceof Error ? error.message : error)
          return null
        }
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      console.log("[SIGNIN] provider:", account?.provider, "email:", user.email)
      const email = user.email
      if (!email) return false

      if (account?.provider === "google" || account?.provider === "facebook") {
        const existingUser = await prisma.user.findUnique({
          where: { email },
          select: { organizationId: true },
        })
        console.log("[SIGNIN] existingUser:", existingUser)

        if (existingUser && !existingUser.organizationId) {
          console.log("[SIGNIN] Redirecting existing user without org to /auth/setup-org")
          return "/auth/setup-org"
        }
        
        if (!existingUser) {
          console.log("[SIGNIN] New OAuth user, allowing sign in")
          return true
        }
        
        console.log("[SIGNIN] Existing user with org, allowing sign in")
        return true
      }

      if (account?.provider === "resend") {
        const existingUser = await prisma.user.findUnique({
          where: { email },
          include: { organization: true },
        })

        if (!existingUser) {
          const approvedRequest = await prisma.joinRequest.findFirst({
            where: { email: email.toLowerCase(), status: "APPROVED" },
          })

          if (!approvedRequest) {
            return "/auth/tag/signin?error=not_approved"
          }
        }
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      console.log("[REDIRECT] url:", url, "baseUrl:", baseUrl)
      if (url === baseUrl || url === baseUrl + "/") {
        console.log("[REDIRECT] Redirecting to /auth/setup-org")
        return baseUrl + "/auth/setup-org"
      }
      if (url.startsWith("/")) return baseUrl + url
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.userRole = user.role
        token.organizationId = user.organizationId
        token.organization = user.organization
      }

      if (trigger === "signIn" || trigger === "signUp" || trigger === "update" || !token.organizationId) {
        const email = token.email
        if (email) {
          const dbUser = await prisma.user.findUnique({
            where: { email },
            include: { organization: true },
          })
          if (dbUser) {
            token.userRole = dbUser.role
            token.organizationId = dbUser.organizationId ?? undefined
            token.organization = dbUser.organization
            console.log("[JWT] Loaded from DB:", dbUser.email, "orgId:", dbUser.organizationId)
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user && token) {
        session.user.id = token.sub!
        session.user.role = token.userRole!
        session.user.organizationId = token.organizationId!
        session.user.organization = token.organization ?? null
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
  },
})
