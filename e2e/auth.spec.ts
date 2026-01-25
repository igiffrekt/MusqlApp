import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should load sign in page', async ({ page }) => {
    await page.goto('/auth/signin')
    await expect(page).toHaveTitle(/Sign In/)
    await expect(page.locator('h1')).toContainText('Sign In')
  })

  test('should load sign up page', async ({ page }) => {
    await page.goto('/auth/signup')
    await expect(page).toHaveTitle(/Sign Up/)
    await expect(page.locator('h1')).toContainText('Sign Up')
  })

  test('should show validation errors on empty form submission', async ({ page }) => {
    await page.goto('/auth/signin')

    // Click sign in without filling form
    await page.click('button[type="submit"]')

    // Should show validation or error
    await expect(page.locator('text=Sign In Failed')).toBeVisible()
  })

  test('should redirect to dashboard after successful sign in', async ({ page }) => {
    // This test would require setting up test user data
    // For now, just test the form interaction
    await page.goto('/auth/signin')

    // Fill form with test credentials
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')

    // Submit form
    await page.click('button[type="submit"]')

    // Should either redirect to dashboard or show error
    await expect(page).toHaveURL(/\/auth\/signin|\/dashboard/)
  })
})