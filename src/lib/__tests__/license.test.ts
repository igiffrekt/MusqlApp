import { TIER_FEATURES } from '../license'
import type { LicenseTier } from '../license'

// Mock the auth and database functions
jest.mock('../auth', () => ({
  auth: jest.fn(),
}))

jest.mock('../db', () => ({
  prisma: {
    organization: {
      findUnique: jest.fn(),
    },
    user: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    student: {
      count: jest.fn(),
    },
    session: {
      count: jest.fn(),
    },
    payment: {
      aggregate: jest.fn(),
    },
  },
}))

describe('License System', () => {
  const mockAuth = require('../auth').auth
  const mockPrisma = require('../db').prisma

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('TIER_FEATURES', () => {
    it('should define all license tiers', () => {
      expect(Object.keys(TIER_FEATURES)).toHaveLength(3)
      expect(TIER_FEATURES).toHaveProperty("STARTER")
      expect(TIER_FEATURES).toHaveProperty("PROFESSIONAL")
      expect(TIER_FEATURES).toHaveProperty("ENTERPRISE")
    })

    it('should have increasing limits', () => {
      const starter = TIER_FEATURES["STARTER"]
      const professional = TIER_FEATURES["PROFESSIONAL"]
      const enterprise = TIER_FEATURES["ENTERPRISE"]

      expect(professional.maxStudents).toBeGreaterThan(starter.maxStudents)
      expect(enterprise.maxStudents).toBe(-1) // Unlimited
      expect(professional.price).toBeGreaterThan(starter.price)
      expect(enterprise.price).toBeGreaterThan(professional.price)
    })

    it('should have correct feature flags', () => {
      // Starter should not have advanced features
      expect(TIER_FEATURES["STARTER"].features.stripePayments).toBe(false)
      expect(TIER_FEATURES["STARTER"].features.smsNotifications).toBe(false)

      // Professional should have more features
      expect(TIER_FEATURES["PROFESSIONAL"].features.stripePayments).toBe(true)
      expect(TIER_FEATURES["PROFESSIONAL"].features.smsNotifications).toBe(true)

      // Enterprise should have all features
      expect(TIER_FEATURES["ENTERPRISE"].features.stripePayments).toBe(true)
      expect(TIER_FEATURES["ENTERPRISE"].features.multiLocation).toBe(true)
    })
  })

  describe('Feature Access Control', () => {
    it('should grant access during trial', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', organizationId: 'org-1' }
      })

      mockPrisma.organization.findUnique.mockResolvedValue({
        licenseTier: "STARTER" as LicenseTier,
        subscriptionStatus: 'TRIAL'
      })

      const { checkFeatureAccess } = await import('../license')
      const hasAccess = await checkFeatureAccess('stripePayments')
      expect(hasAccess).toBe(true)
    })

    it('should deny access to premium features on starter plan', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', organizationId: 'org-1' }
      })

      mockPrisma.organization.findUnique.mockResolvedValue({
        licenseTier: "STARTER" as LicenseTier,
        subscriptionStatus: 'ACTIVE'
      })

      const { checkFeatureAccess } = await import('../license')
      const hasAccess = await checkFeatureAccess('stripePayments')
      expect(hasAccess).toBe(false)
    })

    it('should grant access to premium features on professional plan', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', organizationId: 'org-1' }
      })

      mockPrisma.organization.findUnique.mockResolvedValue({
        licenseTier: "PROFESSIONAL" as LicenseTier,
        subscriptionStatus: 'ACTIVE'
      })

      const { checkFeatureAccess } = await import('../license')
      const hasAccess = await checkFeatureAccess('stripePayments')
      expect(hasAccess).toBe(true)
    })
  })

  describe('Usage Limits', () => {
    it('should enforce student limits', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', organizationId: 'org-1' }
      })

      mockPrisma.organization.findUnique.mockResolvedValue({
        licenseTier: "STARTER" as LicenseTier,
        subscriptionStatus: 'ACTIVE'
      })

      mockPrisma.student.count.mockResolvedValue(25) // At limit

      const { checkLimit } = await import('../license')
      const limit = await checkLimit('maxStudents')

      expect(limit.allowed).toBe(false)
      expect(limit.current).toBe(25)
      expect(limit.limit).toBe(25)
    })

    it('should allow unlimited usage on enterprise', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', organizationId: 'org-1' }
      })

      mockPrisma.organization.findUnique.mockResolvedValue({
        licenseTier: "ENTERPRISE" as LicenseTier,
        subscriptionStatus: 'ACTIVE'
      })

      const { checkLimit } = await import('../license')
      const limit = await checkLimit('maxStudents')

      expect(limit.allowed).toBe(true)
      expect(limit.limit).toBe(-1) // Unlimited
    })
  })
})
