/**
 * Scheduler Update Workflow E2E Tests
 *
 * Tests the complete update detection, approval, and execution workflow.
 * Note: These tests require mock data seeded in Valkey.
 */

import { test, expect } from '@playwright/test'

// Mock pending update for testing
const mockPendingUpdate = {
  id: 'test-update-001',
  currentVersion: '0.1.2',
  newVersion: '0.1.3',
  releaseNotes: '## Test Release\n\n- Feature 1: New awesome feature\n- Bug fix 2: Fixed critical issue\n- Improvement 3: Better performance',
  releaseTitle: 'Release v0.1.3',
  releaseUrl: 'https://github.com/robin-collins/next-ppdb/releases/tag/v0.1.3',
  status: 'PENDING',
  detectedAt: new Date().toISOString(),
}

test.describe('Scheduler Update Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page to ensure sidebar is available
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should show update available notification in sidebar when pending update exists', async ({ page }) => {
    // Mock the API response for pending updates
    await page.route('**/api/admin/updates/pending', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          currentUpdate: mockPendingUpdate,
          history: [],
        }),
      })
    })

    // Reload to trigger the fetch
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Open sidebar if not already open
    const sidebarToggle = page.locator('[aria-label="Toggle sidebar"]')
    if (await sidebarToggle.isVisible()) {
      await sidebarToggle.click()
    }

    // Check for update notification
    const updateNotification = page.locator('text=Update Available')
    await expect(updateNotification).toBeVisible({ timeout: 10000 })
  })

  test('should display correct version transition in update notification', async ({ page }) => {
    await page.route('**/api/admin/updates/pending', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          currentUpdate: mockPendingUpdate,
          history: [],
        }),
      })
    })

    await page.reload()
    await page.waitForLoadState('networkidle')

    // Open sidebar
    const sidebarToggle = page.locator('[aria-label="Toggle sidebar"]')
    if (await sidebarToggle.isVisible()) {
      await sidebarToggle.click()
    }

    // Check version text
    const versionText = page.locator(`text=v${mockPendingUpdate.currentVersion} → v${mockPendingUpdate.newVersion}`)
    await expect(versionText).toBeVisible({ timeout: 10000 })
  })

  test('should navigate to updates page from sidebar', async ({ page }) => {
    await page.route('**/api/admin/updates/pending', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          currentUpdate: mockPendingUpdate,
          history: [],
        }),
      })
    })

    await page.reload()
    await page.waitForLoadState('networkidle')

    // Open sidebar
    const sidebarToggle = page.locator('[aria-label="Toggle sidebar"]')
    if (await sidebarToggle.isVisible()) {
      await sidebarToggle.click()
    }

    // Click on System Updates link
    const systemUpdatesLink = page.locator('text=System Updates')
    await systemUpdatesLink.click()

    // Verify navigation
    await expect(page).toHaveURL(/\/admin\/updates/)
  })

  test('should display updates management page correctly', async ({ page }) => {
    await page.route('**/api/admin/updates/pending', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          currentUpdate: mockPendingUpdate,
          history: [
            {
              ...mockPendingUpdate,
              id: 'history-001',
              currentVersion: '0.1.1',
              newVersion: '0.1.2',
              status: 'EXECUTED',
              executedAt: new Date(Date.now() - 86400000).toISOString(),
            },
          ],
        }),
      })
    })

    await page.goto('/admin/updates')
    await page.waitForLoadState('networkidle')

    // Check page title
    await expect(page.locator('h1')).toContainText('System Updates')

    // Check current update is displayed
    await expect(page.locator(`text=${mockPendingUpdate.newVersion}`)).toBeVisible()
  })

  test('should show notification bell icon in header', async ({ page }) => {
    await page.route('**/api/admin/notifications', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          notifications: [
            {
              id: 'notif-001',
              type: 'info',
              title: 'Update Available',
              message: 'A new version is available',
              source: 'version_check',
              status: 'unread',
              createdAt: new Date().toISOString(),
            },
          ],
        }),
      })
    })

    await page.reload()
    await page.waitForLoadState('networkidle')

    // Check bell icon exists
    const bellIcon = page.locator('[href="/admin/notifications"]').first()
    await expect(bellIcon).toBeVisible()
  })

  test('should show unread badge on notification icon', async ({ page }) => {
    const unreadNotifications = [
      {
        id: 'notif-001',
        type: 'warning',
        title: 'Update Available',
        message: 'A new version is available',
        source: 'version_check',
        status: 'unread',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'notif-002',
        type: 'info',
        title: 'Backup Complete',
        message: 'Daily backup completed successfully',
        source: 'backup',
        status: 'unread',
        createdAt: new Date().toISOString(),
      },
    ]

    await page.route('**/api/admin/notifications', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ notifications: unreadNotifications }),
      })
    })

    await page.reload()
    await page.waitForLoadState('networkidle')

    // Check badge shows count
    const badge = page.locator('[href="/admin/notifications"] span').first()
    await expect(badge).toContainText('2')
  })

  test('should navigate to notifications page', async ({ page }) => {
    await page.route('**/api/admin/notifications', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ notifications: [] }),
      })
    })

    await page.reload()
    await page.waitForLoadState('networkidle')

    // Click notification bell
    const bellIcon = page.locator('[href="/admin/notifications"]').first()
    await bellIcon.click()

    // Verify navigation
    await expect(page).toHaveURL(/\/admin\/notifications/)
  })

  test('should display notifications page correctly', async ({ page }) => {
    const notifications = [
      {
        id: 'notif-001',
        type: 'success',
        title: 'Backup Complete',
        message: 'Daily backup completed successfully',
        source: 'backup',
        status: 'read',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'notif-002',
        type: 'info',
        title: 'Version Check',
        message: 'No updates available',
        source: 'version_check',
        status: 'archived',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        archivedAt: new Date().toISOString(),
      },
    ]

    await page.route('**/api/admin/notifications', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ notifications }),
      })
    })

    await page.goto('/admin/notifications')
    await page.waitForLoadState('networkidle')

    // Check page title
    await expect(page.locator('h1')).toContainText('Notifications')
  })
})

test.describe('Update Approval Flow', () => {
  test('should show approve and cancel buttons for pending update', async ({ page }) => {
    await page.route('**/api/admin/updates/pending', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          currentUpdate: mockPendingUpdate,
          history: [],
        }),
      })
    })

    await page.goto('/admin/updates')
    await page.waitForLoadState('networkidle')

    // Check approve button exists
    const approveButton = page.locator('button:has-text("Approve")')
    await expect(approveButton).toBeVisible()

    // Check cancel button exists
    const cancelButton = page.locator('button:has-text("Cancel")')
    await expect(cancelButton).toBeVisible()
  })

  test('should show approved status after approval', async ({ page }) => {
    const approvedUpdate = {
      ...mockPendingUpdate,
      status: 'APPROVED',
      approvedBy: 'Test User',
      approvedAt: new Date().toISOString(),
    }

    await page.route('**/api/admin/updates/pending', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          currentUpdate: approvedUpdate,
          history: [],
        }),
      })
    })

    await page.goto('/admin/updates')
    await page.waitForLoadState('networkidle')

    // Check approved status is shown
    const approvedStatus = page.locator('text=APPROVED')
    await expect(approvedStatus).toBeVisible()
  })

  test('should display update history', async ({ page }) => {
    const history = [
      {
        id: 'hist-001',
        currentVersion: '0.1.1',
        newVersion: '0.1.2',
        status: 'EXECUTED',
        detectedAt: new Date(Date.now() - 172800000).toISOString(),
        approvedBy: 'Admin',
        approvedAt: new Date(Date.now() - 172800000).toISOString(),
        executedAt: new Date(Date.now() - 172700000).toISOString(),
      },
      {
        id: 'hist-002',
        currentVersion: '0.1.0',
        newVersion: '0.1.1',
        status: 'EXECUTED',
        detectedAt: new Date(Date.now() - 259200000).toISOString(),
        approvedBy: 'Admin',
        approvedAt: new Date(Date.now() - 259200000).toISOString(),
        executedAt: new Date(Date.now() - 259100000).toISOString(),
      },
    ]

    await page.route('**/api/admin/updates/pending', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          currentUpdate: null,
          history,
        }),
      })
    })

    await page.goto('/admin/updates')
    await page.waitForLoadState('networkidle')

    // Check history section exists
    const historySection = page.locator('text=Update History')
    await expect(historySection).toBeVisible()

    // Check history items
    await expect(page.locator('text=v0.1.2')).toBeVisible()
    await expect(page.locator('text=v0.1.1')).toBeVisible()
  })
})

test.describe('Health Endpoint Scheduler Status', () => {
  test('should include scheduler status in health response', async ({ page }) => {
    const response = await page.request.get('/api/health')
    expect(response.ok()).toBeTruthy()

    const data = await response.json()

    // Check scheduler status is included
    expect(data).toHaveProperty('scheduler')
    expect(data.scheduler).toHaveProperty('available')
    expect(data.scheduler).toHaveProperty('pendingUpdate')
    expect(data.scheduler).toHaveProperty('notifications')
  })
})
