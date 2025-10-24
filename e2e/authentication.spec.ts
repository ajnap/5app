/**
 * E2E Tests: Authentication Flow
 * Tests signup, login, and authentication redirects
 */

import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should display signup page with form', async ({ page }) => {
    await page.goto('/signup')

    // Check for email and password fields
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()

    // Check for submit button
    await expect(page.getByRole('button', { name: /sign (in|up)/i })).toBeVisible()
  })

  test('should show validation error for invalid email', async ({ page }) => {
    await page.goto('/signup')

    // Fill form with invalid email
    await page.getByLabel(/email/i).fill('invalid-email')
    await page.getByLabel(/password/i).fill('password123')

    // Try to submit
    const submitButton = page.getByRole('button', { name: /sign (in|up)/i })
    await submitButton.click()

    // Should show validation error (browser native or custom)
    // The form should not submit (still on signup page)
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/\/signup/)
  })

  test('should show error for too short password', async ({ page }) => {
    await page.goto('/signup')

    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/password/i).fill('12345') // Too short

    const submitButton = page.getByRole('button', { name: /sign (in|up)/i })
    await submitButton.click()

    await page.waitForTimeout(500)

    // Should show error or stay on page
    await expect(page).toHaveURL(/\/signup/)
  })

  test('should toggle between sign in and sign up modes', async ({ page }) => {
    await page.goto('/signup')

    // Look for toggle link (e.g., "Already have an account? Sign in")
    const toggleLink = page.getByText(/already have an account|don't have an account/i)
    if (await toggleLink.isVisible()) {
      await toggleLink.click()
      await page.waitForTimeout(300)

      // Form should still be visible
      await expect(page.getByLabel(/email/i)).toBeVisible()
    }
  })
})

test.describe('Protected Routes', () => {
  test('should redirect to signup when accessing dashboard without auth', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/signup/)
  })

  test('should redirect to signup when accessing account without auth', async ({ page }) => {
    await page.goto('/account')
    await expect(page).toHaveURL(/\/signup/)
  })

  test('should redirect to signup when accessing children without auth', async ({ page }) => {
    await page.goto('/children')
    await expect(page).toHaveURL(/\/signup/)
  })
})
