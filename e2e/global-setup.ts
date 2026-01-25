import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  // Setup test database or seed data if needed
  console.log('Global setup running...')

  // You can add database setup, API calls, or other global setup here
  // For example, creating test users, organizations, etc.

  console.log('Global setup completed.')
}

export default globalSetup