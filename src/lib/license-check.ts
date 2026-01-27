import { prisma } from '@/lib/db'
import { LICENSE_LIMITS, LICENSE_TIER_NAMES } from '@/lib/config'
import type { LicenseTier } from '@prisma/client'

export type LimitType = 'students' | 'sessions' | 'trainers' | 'locations'

interface LimitCheckResult {
  allowed: boolean
  current: number
  limit: number
  tierName: string
  limitType: LimitType
  suggestedTier?: LicenseTier
  suggestedTierName?: string
}

const LIMIT_MAP: Record<LimitType, keyof typeof LICENSE_LIMITS.STARTER> = {
  students: 'maxStudents',
  sessions: 'maxSessions',
  trainers: 'maxTrainers',
  locations: 'maxLocations',
}

const TIER_ORDER: LicenseTier[] = ['STARTER', 'PROFESSIONAL', 'ENTERPRISE']

function getNextTier(currentTier: LicenseTier): LicenseTier | null {
  const currentIndex = TIER_ORDER.indexOf(currentTier)
  if (currentIndex < TIER_ORDER.length - 1) {
    return TIER_ORDER[currentIndex + 1]
  }
  return null
}

export async function checkLicenseLimit(
  organizationId: string,
  limitType: LimitType
): Promise<LimitCheckResult> {
  // Get organization with tier
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { licenseTier: true },
  })

  if (!org) {
    throw new Error('Organization not found')
  }

  const tier = org.licenseTier
  const limitKey = LIMIT_MAP[limitType]
  const limit = LICENSE_LIMITS[tier][limitKey]
  const tierName = LICENSE_TIER_NAMES[tier]

  // Get current count based on type
  let current = 0
  
  switch (limitType) {
    case 'students':
      current = await prisma.student.count({
        where: { organizationId, status: 'ACTIVE' },
      })
      break
    case 'sessions':
      // Count sessions in current month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      const endOfMonth = new Date(startOfMonth)
      endOfMonth.setMonth(endOfMonth.getMonth() + 1)
      
      current = await prisma.session.count({
        where: {
          organizationId,
          startTime: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
      })
      break
    case 'trainers':
      current = await prisma.user.count({
        where: {
          organizationId,
          role: { in: ['ADMIN', 'TRAINER'] },
        },
      })
      break
    case 'locations':
      current = await prisma.location.count({
        where: { organizationId },
      })
      break
  }

  // -1 means unlimited
  const allowed = limit === -1 || current < limit

  // Find suggested tier if limit exceeded
  let suggestedTier: LicenseTier | undefined
  let suggestedTierName: string | undefined
  
  if (!allowed) {
    const nextTier = getNextTier(tier)
    if (nextTier) {
      const nextLimit = LICENSE_LIMITS[nextTier][limitKey]
      // Only suggest if next tier has higher limit or unlimited
      if (nextLimit === -1 || nextLimit > limit) {
        suggestedTier = nextTier
        suggestedTierName = LICENSE_TIER_NAMES[nextTier]
      }
    }
  }

  return {
    allowed,
    current,
    limit: limit === -1 ? Infinity : limit,
    tierName,
    limitType,
    suggestedTier,
    suggestedTierName,
  }
}

// Standard error response for limit exceeded
export function limitExceededResponse(result: LimitCheckResult) {
  const limitTypeNames: Record<LimitType, string> = {
    students: 'tag',
    sessions: 'óra',
    trainers: 'edző',
    locations: 'helyszín',
  }

  const typeName = limitTypeNames[result.limitType]
  
  return {
    error: 'LIMIT_EXCEEDED',
    message: `Elérted a(z) ${result.tierName} csomag ${typeName} limitjét (${result.limit}).`,
    details: {
      current: result.current,
      limit: result.limit,
      limitType: result.limitType,
      currentTier: result.tierName,
      suggestedTier: result.suggestedTier,
      suggestedTierName: result.suggestedTierName,
    },
  }
}
