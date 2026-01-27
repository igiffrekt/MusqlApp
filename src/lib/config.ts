/**
 * Centralized configuration for the application
 * All hardcoded values should be defined here
 */

// Supported currencies
export type Currency = 'USD' | 'EUR' | 'HUF'

// License tier pricing per currency (in smallest unit: cents/forint)
export const LICENSE_PRICES = {
  STARTER: {
    USD: 2900,      // $29/month
    EUR: 2700,      // €27/month  
    HUF: 1090000,   // 10,900 Ft/month (stored as fillér)
  },
  PROFESSIONAL: {
    USD: 7900,      // $79/month
    EUR: 7300,      // €73/month
    HUF: 2990000,   // 29,900 Ft/month
  },
  ENTERPRISE: {
    USD: 19900,     // $199/month
    EUR: 18500,     // €185/month
    HUF: 7490000,   // 74,900 Ft/month
  },
} as const

// Display prices (human readable)
export const LICENSE_DISPLAY_PRICES = {
  STARTER: {
    USD: '$29',
    EUR: '€27',
    HUF: '10 900 Ft',
  },
  PROFESSIONAL: {
    USD: '$79',
    EUR: '€73',
    HUF: '29 900 Ft',
  },
  ENTERPRISE: {
    USD: '$199',
    EUR: '€185',
    HUF: '74 900 Ft',
  },
} as const

// Currency symbols
export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  HUF: 'Ft',
} as const

// Trial period in days
export const TRIAL_PERIOD_DAYS = 15

// License tier limits
export const LICENSE_LIMITS = {
  STARTER: {
    maxStudents: 25,
    maxSessions: 50,
    maxTrainers: 2,
  },
  PROFESSIONAL: {
    maxStudents: 100,
    maxSessions: 200,
    maxTrainers: 10,
  },
  ENTERPRISE: {
    maxStudents: -1, // unlimited
    maxSessions: -1, // unlimited
    maxTrainers: -1, // unlimited
  },
} as const

// License tier display names
export const LICENSE_TIER_NAMES = {
  STARTER: 'Starter',
  PROFESSIONAL: 'Professional', 
  ENTERPRISE: 'Enterprise',
} as const

// License tier features for display
export const LICENSE_FEATURES = {
  STARTER: [
    'Max 25 tag',
    'Max 50 óra/hó',
    'Max 2 edző',
    'Email támogatás',
  ],
  PROFESSIONAL: [
    'Max 100 tag',
    'Max 200 óra/hó',
    'Max 10 edző',
    'Prioritás támogatás',
    'Egyéni márka',
  ],
  ENTERPRISE: [
    'Korlátlan tag',
    'Korlátlan óra',
    'Korlátlan edző',
    'Dedikált támogatás',
    'API hozzáférés',
    'Egyéni funkciók',
  ],
} as const

// Country to currency mapping
export const COUNTRY_CURRENCY: Record<string, Currency> = {
  HU: 'HUF',
  US: 'USD',
  // European countries default to EUR
  AT: 'EUR', BE: 'EUR', BG: 'EUR', HR: 'EUR', CY: 'EUR',
  CZ: 'EUR', DK: 'EUR', EE: 'EUR', FI: 'EUR', FR: 'EUR',
  DE: 'EUR', GR: 'EUR', IE: 'EUR', IT: 'EUR', LV: 'EUR',
  LT: 'EUR', LU: 'EUR', MT: 'EUR', NL: 'EUR', PL: 'EUR',
  PT: 'EUR', RO: 'EUR', SK: 'EUR', SI: 'EUR', ES: 'EUR',
  SE: 'EUR', GB: 'EUR', CH: 'EUR', NO: 'EUR',
}

// Default currency for unknown countries
export const DEFAULT_CURRENCY: Currency = 'EUR'

// Session defaults
export const SESSION_DEFAULTS = {
  capacity: 10,
  sessionType: 'REGULAR',
} as const

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  limit: 50,
  maxLimit: 100,
} as const
