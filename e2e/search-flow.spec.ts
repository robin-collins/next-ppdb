/**
 * E2E Tests: Search Flow
 *
 * Tests for the complete search flow from homepage to animal details
 */

import { test, expect } from '@playwright/test'

test.describe('Search Flow', () => {
  test('should search for an animal and view details', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')

    // Wait for page to load
    await expect(
      page.locator('h2', { hasText: 'Search for Animals' })
    ).toBeVisible()

    // Type in search box
    const searchInput = page.locator('input[type="search"]').first()
    await searchInput.fill('Cody')
    await searchInput.press('Enter')

    // Wait for results to load
    await page.waitForLoadState('networkidle')

    // Should see animal cards
    await expect(page.locator('[class*="cursor-pointer"]').first()).toBeVisible(
      {
        timeout: 10000,
      }
    )

    // Click on first result
    await page.locator('[class*="cursor-pointer"]').first().click()

    // Should navigate to animal detail page
    await expect(page).toHaveURL(/\/animals\/\d+/, { timeout: 5000 })

    // Should see animal details
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should use suggestion chips to search', async ({ page }) => {
    await page.goto('/')

    // Wait for empty state
    await expect(
      page.locator('h2', { hasText: 'Search for Animals' })
    ).toBeVisible()

    // Click on a suggestion chip (e.g., "Maltese")
    await page.locator('button', { hasText: 'Maltese' }).click()

    // Wait for results
    await page.waitForLoadState('networkidle')

    // Should show results or "no results" message
    const searchInput = page.locator('input[type="search"]').first()
    await expect(searchInput).toHaveValue('Maltese')
  })

  test('should show empty state when no search is performed', async ({
    page,
  }) => {
    await page.goto('/')

    // Should see empty state
    await expect(
      page.locator('h2', { hasText: 'Search for Animals' })
    ).toBeVisible()
    await expect(
      page.locator(
        'text=Enter an animal name, breed, or owner in the search box'
      )
    ).toBeVisible()

    // Should see suggestion chips
    await expect(page.locator('button', { hasText: 'Cody' })).toBeVisible()
    await expect(page.locator('button', { hasText: 'Maltese' })).toBeVisible()
  })

  test('should clear search and return to empty state', async ({ page }) => {
    await page.goto('/')

    // Perform a search
    const searchInput = page.locator('input[type="search"]').first()
    await searchInput.fill('Test')
    await searchInput.press('Enter')
    await page.waitForLoadState('networkidle')

    // Clear the search
    await searchInput.clear()

    // Should show empty state again
    await expect(
      page.locator('h2', { hasText: 'Search for Animals' })
    ).toBeVisible()
  })

  test('should navigate to customer page from animal card', async ({
    page,
  }) => {
    await page.goto('/')

    // Search for animals
    const searchInput = page.locator('input[type="search"]').first()
    await searchInput.fill('Cody')
    await searchInput.press('Enter')
    await page.waitForLoadState('networkidle')

    // Wait for results
    const firstCard = page.locator('[class*="cursor-pointer"]').first()
    await firstCard.waitFor({ state: 'visible', timeout: 10000 })

    // Click on customer area (not the card itself)
    const customerArea = firstCard.locator('.customer-area').first()
    if (await customerArea.isVisible()) {
      await customerArea.click()

      // Should navigate to customer page
      await expect(page).toHaveURL(/\/customer\/\d+/, { timeout: 5000 })
    }
  })
})
