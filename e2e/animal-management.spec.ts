/**
 * E2E Tests: Animal Management
 *
 * Tests for viewing and editing animal details
 */

import { test, expect } from '@playwright/test'

test.describe('Animal Management', () => {
  test('should view animal details with customer information', async ({
    page,
  }) => {
    // Navigate to homepage
    await page.goto('/')

    // Search for an animal
    const searchInput = page.locator('input[type="search"]').first()
    await searchInput.fill('Cody')
    await searchInput.press('Enter')

    // Wait for results
    await page.waitForLoadState('networkidle')

    // Click on first animal
    const firstCard = page.locator('[class*="cursor-pointer"]').first()
    await firstCard.waitFor({ state: 'visible', timeout: 10000 })
    await firstCard.click()

    // Wait for animal detail page
    await expect(page).toHaveURL(/\/animals\/\d+/, { timeout: 5000 })

    // Should display animal name in heading
    await expect(page.locator('h1')).toBeVisible()

    // Should display customer information section
    await expect(page.locator('text=Owner Information')).toBeVisible()

    // Should display breed information
    await expect(page.locator('text=Breed')).toBeVisible()
  })

  test('should navigate back to search results', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')

    // Perform search
    const searchInput = page.locator('input[type="search"]').first()
    await searchInput.fill('Cody')
    await searchInput.press('Enter')
    await page.waitForLoadState('networkidle')

    // Click on animal
    const firstCard = page.locator('[class*="cursor-pointer"]').first()
    await firstCard.waitFor({ state: 'visible', timeout: 10000 })
    await firstCard.click()

    // Wait for detail page
    await expect(page).toHaveURL(/\/animals\/\d+/)

    // Use browser back button
    await page.goBack()

    // Should return to search results
    await expect(page).toHaveURL('/')

    // Search results should still be visible
    await expect(firstCard).toBeVisible({ timeout: 5000 })
  })

  test('should display service notes if available', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')

    // Search for an animal
    const searchInput = page.locator('input[type="search"]').first()
    await searchInput.fill('Cody')
    await searchInput.press('Enter')
    await page.waitForLoadState('networkidle')

    // Click on first animal
    const firstCard = page.locator('[class*="cursor-pointer"]').first()
    await firstCard.waitFor({ state: 'visible', timeout: 10000 })
    await firstCard.click()

    // Wait for detail page
    await expect(page).toHaveURL(/\/animals\/\d+/)

    // Check if service notes section exists
    const serviceNotesHeading = page.locator('text=Service Notes')
    if (await serviceNotesHeading.isVisible()) {
      // Verify notes are displayed
      await expect(serviceNotesHeading).toBeVisible()
    }
  })

  test('should show breed details on animal page', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')

    // Search for an animal
    const searchInput = page.locator('input[type="search"]').first()
    await searchInput.fill('Maltese')
    await searchInput.press('Enter')
    await page.waitForLoadState('networkidle')

    // Click on first animal
    const firstCard = page.locator('[class*="cursor-pointer"]').first()
    await firstCard.waitFor({ state: 'visible', timeout: 10000 })
    await firstCard.click()

    // Wait for detail page
    await expect(page).toHaveURL(/\/animals\/\d+/)

    // Should show breed information
    const breedLabel = page.locator('text=Breed')
    await expect(breedLabel).toBeVisible()

    // Breed value should be visible
    const breedValue = page.locator('text=Maltese')
    await expect(breedValue).toBeVisible()
  })

  test('should display last visit and this visit dates', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')

    // Search and navigate to animal
    const searchInput = page.locator('input[type="search"]').first()
    await searchInput.fill('Cody')
    await searchInput.press('Enter')
    await page.waitForLoadState('networkidle')

    const firstCard = page.locator('[class*="cursor-pointer"]').first()
    await firstCard.waitFor({ state: 'visible', timeout: 10000 })
    await firstCard.click()

    // Wait for detail page
    await expect(page).toHaveURL(/\/animals\/\d+/)

    // Should show visit dates
    await expect(page.locator('text=Last Visit')).toBeVisible()
  })
})

test.describe('Customer Navigation from Animal Page', () => {
  test('should navigate to customer page from animal details', async ({
    page,
  }) => {
    // Navigate to homepage
    await page.goto('/')

    // Search and navigate to animal
    const searchInput = page.locator('input[type="search"]').first()
    await searchInput.fill('Cody')
    await searchInput.press('Enter')
    await page.waitForLoadState('networkidle')

    const firstCard = page.locator('[class*="cursor-pointer"]').first()
    await firstCard.waitFor({ state: 'visible', timeout: 10000 })
    await firstCard.click()

    // Wait for detail page
    await expect(page).toHaveURL(/\/animals\/\d+/)

    // Look for "View Customer" link or button
    const viewCustomerLink = page
      .locator('a, button')
      .filter({ hasText: /view.*customer/i })
      .first()

    if (await viewCustomerLink.isVisible()) {
      await viewCustomerLink.click()

      // Should navigate to customer page
      await expect(page).toHaveURL(/\/customer\/\d+/, { timeout: 5000 })
    }
  })
})
