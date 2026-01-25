import { FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  // Clean up test data or reset state
  console.log('Global teardown running...')

  // Clean up test database, files, etc.

  console.log('Global teardown completed.')
}

export default globalTeardown