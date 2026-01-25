// Shared type definitions for the application

import type { LicenseTier } from "@prisma/client"

// License feature flags
export interface TierFeatures {
  studentManagement: boolean
  sessionScheduling: boolean
  basicAttendance: boolean
  paymentTracking: boolean
  stripePayments: boolean
  smsNotifications: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  advancedReports: boolean
  multiLocation: boolean
  customBranding: boolean
  apiAccess: boolean
  prioritySupport: boolean
  studentProgress: boolean
  eventManagement: boolean
  marketingTools: boolean
}

// License limitations
export interface TierLimitations {
  maxStudents: number
  maxTrainers: number
  maxSessionsPerMonth: number
  maxPaymentsPerMonth: number
}

// Full tier configuration
export interface TierConfig {
  name: string
  price: number
  maxStudents: number
  maxTrainers: number
  features: TierFeatures
  limitations: TierLimitations
}

// License tier response from API
export interface CurrentTierResponse {
  tier: LicenseTier | null
  status: string
  features: TierFeatures
  limitations: TierLimitations
}

// Limit check response
export interface LimitCheckResponse {
  allowed: boolean
  current: number
  limit: number
}

// Feature keys type
export type FeatureKey = keyof TierFeatures

// Limitation keys type
export type LimitationKey = keyof TierLimitations

// Emergency contact for students
export interface EmergencyContact {
  name: string
  phone: string
  relationship: string
}

// Notification preferences
export interface NotificationPreferences {
  email?: boolean
  sms?: boolean
  push?: boolean
  sessionReminders?: boolean
  paymentReminders?: boolean
  attendanceAlerts?: boolean
}

// Offline queue item
export interface OfflineQueueItem {
  id: string
  type: "attendance" | "payment" | "form"
  data: AttendanceOfflineData | PaymentOfflineData | FormSubmissionData
  timestamp: number
  synced: boolean
  endpoint?: string
}

// Offline attendance data
export interface AttendanceOfflineData {
  sessionId: string
  studentId: string
  status: string
  checkInTime?: string
  notes?: string
}

// Offline payment data
export interface PaymentOfflineData {
  studentId: string
  amount: number
  paymentType: string
  paymentMethod: string
  notes?: string
}

// Form submission data for offline storage
export interface FormSubmissionData {
  endpoint: string
  method: string
  body: Record<string, unknown>
}

// API cache entry
export interface ApiCacheEntry {
  data: unknown
  timestamp: number
  ttl: number
}

// Notification payload
export interface NotificationPayload {
  userId: string
  title: string
  message: string
  type?: "INFO" | "SUCCESS" | "WARNING" | "ERROR"
  channels?: ("email" | "sms" | "push" | "inApp")[]
  data?: Record<string, unknown>
}
