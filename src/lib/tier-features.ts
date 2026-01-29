// Tier feature definitions and limits
// This is the single source of truth for what each tier includes

export type TierName = "STARTER" | "PRO" | "ENTERPRISE"

export interface TierLimits {
  maxMembers: number
  maxCoaches: number
  maxLocations: number
  maxGroups: number
}

export interface TierFeatures {
  // Core
  sessionScheduling: boolean
  attendanceTracking: boolean
  basicReports: boolean
  memberAppAccess: boolean
  dataExportCsv: boolean
  
  // Payments
  manualPaymentTracking: boolean
  onlinePayments: boolean
  automatedBilling: boolean
  invoiceGeneration: boolean
  
  // Communication
  emailNotifications: boolean
  pushNotifications: boolean
  smsReminders: boolean
  unlimitedSms: boolean
  
  // Advanced
  advancedReports: boolean
  customReports: boolean
  memberSelfService: boolean
  waitlistManagement: boolean
  beltRankProgression: boolean
  staffPermissions: boolean
  
  // Enterprise
  customBranding: boolean
  whiteLabelOption: boolean
  apiAccess: boolean
  webhookIntegrations: boolean
  multiLocationManagement: boolean
  
  // Support
  emailSupport: boolean
  prioritySupport: boolean
  phoneSupport: boolean
  dedicatedAccountManager: boolean
  onboardingTraining: boolean
  slaGuarantee: boolean
}

export interface TierDefinition {
  name: TierName
  displayName: string
  description: string
  monthlyPrice: number // in HUF
  yearlyPrice: number // in HUF
  limits: TierLimits
  features: TierFeatures
  popular?: boolean
}

export const TIERS: Record<TierName, TierDefinition> = {
  STARTER: {
    name: "STARTER",
    displayName: "Starter",
    description: "Kis kluboknak és egyéni edzőknek",
    monthlyPrice: 9990,
    yearlyPrice: 99990,
    limits: {
      maxMembers: 5,
      maxCoaches: 2,
      maxLocations: 1,
      maxGroups: 3,
    },
    features: {
      // Core - all included
      sessionScheduling: true,
      attendanceTracking: true,
      basicReports: true,
      memberAppAccess: true,
      dataExportCsv: true,
      
      // Payments - basic only
      manualPaymentTracking: true,
      onlinePayments: false,
      automatedBilling: false,
      invoiceGeneration: false,
      
      // Communication - none
      emailNotifications: false,
      pushNotifications: false,
      smsReminders: false,
      unlimitedSms: false,
      
      // Advanced - none
      advancedReports: false,
      customReports: false,
      memberSelfService: false,
      waitlistManagement: false,
      beltRankProgression: false,
      staffPermissions: false,
      
      // Enterprise - none
      customBranding: false,
      whiteLabelOption: false,
      apiAccess: false,
      webhookIntegrations: false,
      multiLocationManagement: false,
      
      // Support - basic
      emailSupport: true,
      prioritySupport: false,
      phoneSupport: false,
      dedicatedAccountManager: false,
      onboardingTraining: false,
      slaGuarantee: false,
    },
  },
  
  PRO: {
    name: "PRO",
    displayName: "Pro",
    description: "Növekvő edzőtermeknek és akadémiáknak",
    monthlyPrice: 29990,
    yearlyPrice: 299990,
    popular: true,
    limits: {
      maxMembers: 75,
      maxCoaches: 10,
      maxLocations: 3,
      maxGroups: 10,
    },
    features: {
      // Core - all included
      sessionScheduling: true,
      attendanceTracking: true,
      basicReports: true,
      memberAppAccess: true,
      dataExportCsv: true,
      
      // Payments - full
      manualPaymentTracking: true,
      onlinePayments: true,
      automatedBilling: true,
      invoiceGeneration: true,
      
      // Communication - most
      emailNotifications: true,
      pushNotifications: true,
      smsReminders: true,
      unlimitedSms: false,
      
      // Advanced - most
      advancedReports: true,
      customReports: false,
      memberSelfService: true,
      waitlistManagement: true,
      beltRankProgression: true,
      staffPermissions: false,
      
      // Enterprise - none
      customBranding: false,
      whiteLabelOption: false,
      apiAccess: false,
      webhookIntegrations: false,
      multiLocationManagement: false,
      
      // Support - priority
      emailSupport: true,
      prioritySupport: true,
      phoneSupport: false,
      dedicatedAccountManager: false,
      onboardingTraining: false,
      slaGuarantee: false,
    },
  },
  
  ENTERPRISE: {
    name: "ENTERPRISE",
    displayName: "Elite+",
    description: "Nagy szervezeteknek és franchise hálózatoknak",
    monthlyPrice: 99990,
    yearlyPrice: 999990,
    limits: {
      maxMembers: -1, // -1 = unlimited
      maxCoaches: -1,
      maxLocations: -1,
      maxGroups: -1,
    },
    features: {
      // Core - all included
      sessionScheduling: true,
      attendanceTracking: true,
      basicReports: true,
      memberAppAccess: true,
      dataExportCsv: true,
      
      // Payments - full
      manualPaymentTracking: true,
      onlinePayments: true,
      automatedBilling: true,
      invoiceGeneration: true,
      
      // Communication - full
      emailNotifications: true,
      pushNotifications: true,
      smsReminders: true,
      unlimitedSms: true,
      
      // Advanced - full
      advancedReports: true,
      customReports: true,
      memberSelfService: true,
      waitlistManagement: true,
      beltRankProgression: true,
      staffPermissions: true,
      
      // Enterprise - full
      customBranding: true,
      whiteLabelOption: true,
      apiAccess: true,
      webhookIntegrations: true,
      multiLocationManagement: true,
      
      // Support - full
      emailSupport: true,
      prioritySupport: true,
      phoneSupport: true,
      dedicatedAccountManager: true,
      onboardingTraining: true,
      slaGuarantee: true,
    },
  },
}

// Feature display configuration for UI
export interface FeatureDisplay {
  key: keyof TierFeatures | keyof TierLimits
  name: string
  category: "limits" | "core" | "payments" | "communication" | "advanced" | "enterprise" | "support"
  description?: string
}

export const FEATURE_DISPLAY: FeatureDisplay[] = [
  // Limits
  { key: "maxMembers", name: "Tagok száma", category: "limits" },
  { key: "maxCoaches", name: "Edzők/személyzet", category: "limits" },
  { key: "maxLocations", name: "Helyszínek", category: "limits" },
  { key: "maxGroups", name: "Csoportok", category: "limits" },
  
  // Core
  { key: "sessionScheduling", name: "Órarend kezelés", category: "core" },
  { key: "attendanceTracking", name: "Jelenlét követés", category: "core" },
  { key: "basicReports", name: "Alap riportok", category: "core" },
  { key: "memberAppAccess", name: "Tag app hozzáférés", category: "core" },
  { key: "dataExportCsv", name: "Adat exportálás (CSV)", category: "core" },
  
  // Payments
  { key: "manualPaymentTracking", name: "Kézi fizetés nyilvántartás", category: "payments" },
  { key: "onlinePayments", name: "Online fizetés (Stripe)", category: "payments" },
  { key: "automatedBilling", name: "Automatikus számlázás", category: "payments" },
  { key: "invoiceGeneration", name: "Számla generálás", category: "payments" },
  
  // Communication
  { key: "emailNotifications", name: "Email értesítések", category: "communication" },
  { key: "pushNotifications", name: "Push értesítések", category: "communication" },
  { key: "smsReminders", name: "SMS emlékeztetők", category: "communication" },
  { key: "unlimitedSms", name: "Korlátlan SMS", category: "communication" },
  
  // Advanced
  { key: "advancedReports", name: "Haladó riportok", category: "advanced" },
  { key: "customReports", name: "Egyedi riportok", category: "advanced" },
  { key: "memberSelfService", name: "Tag önkiszolgáló portál", category: "advanced" },
  { key: "waitlistManagement", name: "Várólisták kezelése", category: "advanced" },
  { key: "beltRankProgression", name: "Öv/rang előrehaladás", category: "advanced" },
  { key: "staffPermissions", name: "Személyzet jogosultságok", category: "advanced" },
  
  // Enterprise
  { key: "customBranding", name: "Egyedi arculat/logó", category: "enterprise" },
  { key: "whiteLabelOption", name: "White-label opció", category: "enterprise" },
  { key: "apiAccess", name: "API hozzáférés", category: "enterprise" },
  { key: "webhookIntegrations", name: "Webhook integrációk", category: "enterprise" },
  { key: "multiLocationManagement", name: "Több helyszín kezelés", category: "enterprise" },
  
  // Support
  { key: "emailSupport", name: "Email támogatás", category: "support" },
  { key: "prioritySupport", name: "Prioritásos támogatás", category: "support" },
  { key: "phoneSupport", name: "Telefonos támogatás", category: "support" },
  { key: "dedicatedAccountManager", name: "Dedikált ügyfélmenedzser", category: "support" },
  { key: "onboardingTraining", name: "Bevezetés és tréning", category: "support" },
  { key: "slaGuarantee", name: "SLA garancia", category: "support" },
]

// Helper to get limit display value
export function formatLimit(value: number): string {
  return value === -1 ? "Korlátlan" : value.toString()
}

// Helper to check if org has feature
export function hasFeature(tierName: TierName, featureKey: keyof TierFeatures): boolean {
  return TIERS[tierName]?.features[featureKey] ?? false
}

// Helper to check if org is within limits
export function isWithinLimit(tierName: TierName, limitKey: keyof TierLimits, currentValue: number): boolean {
  const limit = TIERS[tierName]?.limits[limitKey]
  if (limit === -1) return true // unlimited
  return currentValue < limit
}

// Helper to format price
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("hu-HU").format(price) + " Ft"
}
