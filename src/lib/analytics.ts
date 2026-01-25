// Additional analytics file for Vercel Analytics
'use client'

import { track } from '@vercel/analytics'

export const trackEvent = (event: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    track(event, properties)
  }
}

export const trackPageView = (page: string) => {
  trackEvent('page_view', { page })
}

export const trackUserAction = (action: string, details?: Record<string, any>) => {
  trackEvent('user_action', { action, ...details })
}

export const trackFeatureUsage = (feature: string, tier?: string) => {
  trackEvent('feature_usage', { feature, license_tier: tier })
}

export const trackSubscriptionEvent = (event: string, tier: string, details?: Record<string, any>) => {
  trackEvent(`subscription_${event}`, { tier, ...details })
}

export const trackPerformanceMetric = (metric: string, value: number, unit?: string) => {
  trackEvent('performance_metric', { metric, value, unit })
}

export const trackError = (error: string, context?: Record<string, any>) => {
  trackEvent('error_occurred', { error, ...context })
}

// Conversion tracking
export const trackConversion = (conversionType: string, value?: number) => {
  trackEvent('conversion', { type: conversionType, value })
}

// User engagement tracking
export const trackEngagement = (action: string, duration?: number) => {
  trackEvent('engagement', { action, duration })
}