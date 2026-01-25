import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN,
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',
  replaysOnErrorSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
    Sentry.httpIntegration(),
  ],

  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA,

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Filter out client-side errors in server-side code
  beforeSend(event, hint) {
    // Filter out common non-actionable errors
    if (event.exception) {
      const error = hint.originalException
      if (error && typeof error === 'object' && 'message' in error) {
        const message = (error as Error).message

        // Ignore common network errors that are not actionable
        if (message.includes('Network Error') ||
            message.includes('Failed to fetch') ||
            message.includes('Load failed')) {
          return null
        }

        // Ignore PWA service worker errors
        if (message.includes('service worker') ||
            message.includes('ServiceWorker')) {
          return null
        }
      }
    }

    return event
  },

  // Capture console errors in production
  beforeBreadcrumb(breadcrumb, hint) {
    if (breadcrumb.category === 'console' && process.env.NODE_ENV === 'production') {
      // Only capture error level console messages
      return breadcrumb.level === 'error' ? breadcrumb : null
    }
    return breadcrumb
  },
})

// Custom error boundary for React components
export class ErrorBoundary extends Sentry.ErrorBoundary {
  constructor(props: React.ComponentProps<typeof Sentry.ErrorBoundary>) {
    super(props)
  }
}

// Performance monitoring helpers
export const measurePerformance = <T>(name: string, fn: () => Promise<T>): Promise<T> => {
  const startTime = Date.now()

  return fn().finally(() => {
    const duration = Date.now() - startTime
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `Function ${name} completed in ${duration}ms`,
      level: 'info',
    })
  })
}

// Custom error reporting
export const reportError = (error: Error, context?: Record<string, string | number | boolean>) => {
  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach((key) => {
        scope.setTag(key, context[key])
      })
    }

    scope.setTag('custom_error', 'true')
    Sentry.captureException(error)
  })
}

// User feedback collection
export const captureUserFeedback = (feedback: {
  name?: string
  email?: string
  message: string
  url?: string
}) => {
  Sentry.captureMessage(`User Feedback: ${feedback.message}`, {
    level: 'info',
    tags: {
      feedback: 'user',
    },
    extra: feedback,
  })
}

// Feature usage tracking
export const trackFeatureUsage = (feature: string, metadata?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    category: 'feature',
    message: `Feature used: ${feature}`,
    level: 'info',
    data: metadata,
  })
}

export default Sentry