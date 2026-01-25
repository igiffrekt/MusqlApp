/**
 * Centralized configuration for the application
 * All hardcoded values should be defined here
 */

// License tier pricing (in cents)
export const LICENSE_PRICES = {
  STARTER: 2900,      // $29/month
  PROFESSIONAL: 7900, // $79/month
  ENTERPRISE: 19900,  // $199/month
} as const

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
  STARTER: "Starter",
  PROFESSIONAL: "Professional",
  ENTERPRISE: "Enterprise",
} as const

// Session defaults
export const SESSION_DEFAULTS = {
  capacity: 10,
  sessionType: "REGULAR",
} as const

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  limit: 50,
  maxLimit: 100,
} as const

// Notification defaults
export const NOTIFICATION_DEFAULTS = {
  limit: 50,
} as const

// Password requirements
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
} as const

// Theme colors (for reference, actual values in Tailwind config)
export const THEME_COLORS = {
  primary: {
    default: "#3b82f6", // blue-500
    hover: "#2563eb",   // blue-600
  },
  success: "#22c55e",   // green-500
  warning: "#f59e0b",   // amber-500
  error: "#ef4444",     // red-500
  info: "#3b82f6",      // blue-500
} as const

// Belt levels for martial arts
export const BELT_LEVELS = [
  "White",
  "Yellow",
  "Orange",
  "Green",
  "Blue",
  "Purple",
  "Brown",
  "Red",
  "Black",
] as const

// Session types
export const SESSION_TYPES = [
  "REGULAR",
  "PRIVATE",
  "GROUP",
  "SEMINAR",
  "GRADING",
] as const

// Payment frequencies
export const PAYMENT_FREQUENCIES = [
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "QUARTERLY",
  "YEARLY",
] as const

// Default notification sender
export const NOTIFICATION_SENDER = {
  name: "Musql",
  email: process.env.FROM_EMAIL || "noreply@musql.com",
} as const

// API rate limits (per minute)
export const RATE_LIMITS = {
  default: 100,
  auth: 10,
  upload: 20,
} as const

// File upload limits
export const UPLOAD_LIMITS = {
  maxFileSizeMB: 10,
  allowedImageTypes: ["image/jpeg", "image/png", "image/webp"],
  allowedDocTypes: ["application/pdf"],
} as const
