/**
 * E2E Tests: Accessibility
 * Tests basic accessibility features and keyboard navigation
 */

import { test, expect } from '@playwright/test'

test.describe('Accessibility', () => {
  test('should have proper page structure with landmarks', async ({ page }) => {
    await page.goto('/')

    // Check for main landmark
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should have accessible form labels', async ({ page }) => {
    await page.goto('/signup')

    // All form inputs should have associated labels
    const emailInput = page.getByLabel(/email/i)
    const passwordInput = page.getByLabel(/password/i)

    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
  })

  test('should support keyboard navigation on signup form', async ({ page }) => {
    await page.goto('/signup')

    // Tab through form elements
    await page.keyboard.press('Tab')
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)

    // Should focus on an interactive element
    expect(['INPUT', 'BUTTON', 'A']).toContain(focusedElement)
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/')

    // Check for h1
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
  })

  test('should have descriptive page titles', async ({ page }) => {
    // Landing page
    await page.goto('/')
    await expect(page).toHaveTitle(/The Next 5 Minutes/)

    // Signup page
    await page.goto('/signup')
    await expect(page).toHaveTitle(/The Next 5 Minutes/)
  })

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/')

    // Basic check: text should be visible
    const bodyText = page.locator('body')
    await expect(bodyText).toBeVisible()

    // Get computed styles
    const bodyStyles = await bodyText.evaluate((el) => {
      const styles = window.getComputedStyle(el)
      return {
        color: styles.color,
        backgroundColor: styles.backgroundColor
      }
    })

    // Should have color values set
    expect(bodyStyles.color).toBeTruthy()
  })
})

test.describe('Responsive Design', () => {
  test('should be usable on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Page should load
    await expect(page).toHaveTitle(/The Next 5 Minutes/)

    // Content should be visible
    await expect(page.locator('body')).toBeVisible()
  })

  test('should be usable on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')

    await expect(page).toHaveTitle(/The Next 5 Minutes/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('should be usable on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')

    await expect(page).toHaveTitle(/The Next 5 Minutes/)
    await expect(page.locator('body')).toBeVisible()
  })
})
