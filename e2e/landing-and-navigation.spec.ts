/**
 * E2E Tests: Landing Page and Navigation
 * Tests the landing page loads and navigation works
 */

import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('should load the landing page successfully', async ({ page }) => {
    await page.goto('/')

    // Check page title
    await expect(page).toHaveTitle(/The Next 5 Minutes/)

    // Check main heading is visible
    await expect(page.getByRole('heading', { name: /Next 5 Minutes/i })).toBeVisible()
  })

  test('should have working navigation to signup', async ({ page }) => {
    await page.goto('/')

    // Find and click signup/get started link
    const signupLink = page.getByRole('link', { name: /get started|sign up/i }).first()
    await signupLink.click()

    // Should navigate to signup page
    await expect(page).toHaveURL(/\/signup/)
  })

  test('should display key value propositions', async ({ page }) => {
    await page.goto('/')

    // Check for content about 5-minute activities
    await expect(page.getByText(/5.minute/i)).toBeVisible()
  })
})

test.describe('Navigation', () => {
  test('should redirect unauthenticated users to signup', async ({ page }) => {
    // Try to access protected route
    await page.goto('/dashboard')

    // Should redirect to signup
    await expect(page).toHaveURL(/\/signup/)
  })

  test('should show responsive navigation', async ({ page }) => {
    await page.goto('/')

    // Check viewport handles (mobile simulation)
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)

    // Page should still be functional
    await expect(page).toHaveTitle(/The Next 5 Minutes/)
  })
})
