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
  // Type assertion needed due to @auth/prisma-adapter version mismatch with next-auth
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    // Magic link provider for students
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
            where: {
              email: credentials.email as string
            },
            include: {
              organization: true,
              customRole: true,
            }
          })

          if (!user || !user.password) {
            return null
          }

          // Compare password with hashed password
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
            organizationId: user.organizationId,
            organization: user.organization,
          }
        } catch (error) {
          console.error("Auth error:", error instanceof Error ? error.message : error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async signIn({ user, account }) {
      // For magic link (Resend) provider, check if user has approved join request
      if (account?.provider === "resend") {
        const email = user.email
        if (!email) return false

        // Check if user exists and has an approved organization
        const existingUser = await prisma.user.findUnique({
          where: { email },
          include: { organization: true },
        })

        if (!existingUser) {
          // Check if there's an approved join request for this email
          const approvedRequest = await prisma.joinRequest.findFirst({
            where: {
              email: email.toLowerCase(),
              status: "APPROVED",
            },
          })

          if (!approvedRequest) {
            // No approved request, block sign in
            return "/auth/tag/signin?error=not_approved"
          }
        }
      }
      return true
    },
    async jwt({ token, user, account, trigger }) {
      // On initial sign in or when user object is available
      if (user) {
        token.userRole = user.role
        token.organizationId = user.organizationId
        token.organization = user.organization
      }

      // For magic link users, fetch their data from DB
      if (account?.provider === "resend" || trigger === "signIn") {
        const email = token.email
        if (email) {
          const dbUser = await prisma.user.findUnique({
            where: { email },
            include: { organization: true },
          })
          if (dbUser) {
            token.userRole = dbUser.role
            token.organizationId = dbUser.organizationId
            token.organization = dbUser.organization
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