/**
 * Centralized configuration for the application
 * All hardcoded values should be defined here
 */

// Supported currencies
export type Currency = 'USD' | 'EUR' | 'HUF'

// License tier pricing per currency (in smallest unit: cents/fillér)
export const LICENSE_PRICES = {
  STARTER: {
    USD: 2500,      // $25/month
    EUR: 2300,      // €23/month  
    HUF: 990000,    // 9,900 Ft/month (stored as fillér)
  },
  PRO: {
    USD: 4900,      // $49/month
    EUR: 4500,      // €45/month
    HUF: 1999000,   // 19,990 Ft/month
  },
  PROFESSIONAL: {
    USD: 7500,      // $75/month
    EUR: 6900,      // €69/month
    HUF: 2999000,   // 29,990 Ft/month
  },
  ENTERPRISE: {
    USD: 18900,     // $189/month
    EUR: 17500,     // €175/month
    HUF: 7499000,   // 74,990 Ft/month
  },
} as const

// Display prices (human readable)
export const LICENSE_DISPLAY_PRICES = {
  STARTER: {
    USD: '$25',
    EUR: '€23',
    HUF: '9 900 Ft',
  },
  PRO: {
    USD: '$49',
    EUR: '€45',
    HUF: '19 990 Ft',
  },
  PROFESSIONAL: {
    USD: '$75',
    EUR: '€69',
    HUF: '29 990 Ft',
  },
  ENTERPRISE: {
    USD: '$189',
    EUR: '€175',
    HUF: '74 990 Ft',
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
    maxStudents: 5,
    maxSessions: 50,
    maxTrainers: 2,
    maxLocations: 1,
  },
  PRO: {
    maxStudents: 30,
    maxSessions: 100,
    maxTrainers: 5,
    maxLocations: 2,
  },
  PROFESSIONAL: {
    maxStudents: 75,
    maxSessions: 200,
    maxTrainers: 10,
    maxLocations: 3,
  },
  ENTERPRISE: {
    maxStudents: -1, // unlimited
    maxSessions: -1, // unlimited
    maxTrainers: -1, // unlimited
    maxLocations: -1, // unlimited
  },
} as const

// License tier display names (Hungarian)
export const LICENSE_TIER_NAMES = {
  STARTER: 'Alap',
  PRO: 'Pro',
  PROFESSIONAL: 'Prémium', 
  ENTERPRISE: 'Üzleti',
} as const

// License tier features for display (Hungarian)
export const LICENSE_FEATURES = {
  STARTER: [
    'Max 5 tag',
    'Max 50 óra/hó',
    'Max 2 edző',
    'Email támogatás',
  ],
  PRO: [
    'Max 30 tag',
    'Max 100 óra/hó',
    'Max 5 edző',
    'Email értesítések',
    'Alap riportok',
  ],
  PROFESSIONAL: [
    'Max 75 tag',
    'Max 200 óra/hó',
    'Max 10 edző',
    'Online fizetés',
    'Értesítések & üzenetküldés',
    'Riportok',
  ],
  ENTERPRISE: [
    'Korlátlan tag',
    'Korlátlan óraszám',
    'Korlátlan edző & helyszín',
    'Kiemelt ügyfélszolgálat',
    'API hozzáférés',
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
