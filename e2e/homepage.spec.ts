import { test, expect } from '@playwright/test'

test('loads the Next.js homepage and captures a screenshot', async ({
  page,
}) => {
  const response = await page.goto('/')
  expect(response?.ok()).toBeTruthy()

  await page.waitForLoadState('networkidle')

  // Wait for Next.js compilation indicators to disappear
  await page.waitForFunction(
    () => {
      // Check for Next.js dev compilation indicators
      const nextBuildIndicator = document.querySelector(
        '[data-nextjs-scroll-focus-boundary]'
      )
      const nextErrorOverlay = document.querySelector('nextjs-portal')
      const nextCompiling = document.querySelector('#__next-build-watcher')

      // Also check if document.readyState is complete
      const isDocumentReady = document.readyState === 'complete'

      // Ensure React has hydrated (check for Next.js hydration markers)
      const nextRootElement = document.querySelector('#__next')
      const hasReactProps =
        nextRootElement &&
        Object.keys(nextRootElement).some(key =>
          key.startsWith('__reactInternalInstance')
        )

      return isDocumentReady && !nextCompiling && !nextErrorOverlay
    },
    {},
    { timeout: 15000 }
  )

  // Wait for Next.js hydration to complete by checking for React event handlers
  await page.waitForFunction(
    () => {
      // In dev mode, Next.js adds specific classes and attributes after hydration
      const nextRoot = document.querySelector('#__next')
      if (!nextRoot) return false

      // Check if any interactive elements have event handlers (sign of hydration)
      const interactiveElements = document.querySelectorAll(
        'button, input, [role="button"], a'
      )
      let hasEventListeners = false

      for (let element of interactiveElements) {
        // Check if element has React event handlers (indicated by properties starting with __react)
        const props = Object.getOwnPropertyNames(element)
        if (
          props.some(prop => prop.includes('react') || prop.includes('fiber'))
        ) {
          hasEventListeners = true
          break
        }
      }

      return hasEventListeners || interactiveElements.length === 0
    },
    {},
    { timeout: 10000 }
  )

  // Additional wait for any lazy-loaded content and final DOM stabilization
  await page.waitForFunction(
    () => {
      return new Promise<boolean>(resolve => {
        let timeoutId: NodeJS.Timeout
        let observer: MutationObserver
        let changeCount = 0

        const resetTimer = () => {
          clearTimeout(timeoutId)
          timeoutId = setTimeout(() => {
            observer.disconnect()
            resolve(true)
          }, 3000) // Extended to 3 seconds for dev compilation
        }

        observer = new MutationObserver(mutations => {
          // Filter out trivial changes (like style recalculations)
          const significantChanges = mutations.filter(mutation => {
            if (mutation.type === 'attributes') {
              return !['style', 'class'].includes(mutation.attributeName || '')
            }
            return (
              mutation.type === 'childList' &&
              (mutation.addedNodes.length > 0 ||
                mutation.removedNodes.length > 0)
            )
          })

          if (significantChanges.length > 0) {
            changeCount++
            resetTimer()
          }
        })

        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['data-testid', 'aria-label', 'role', 'id', 'class'],
        })

        // Start the initial timer
        resetTimer()
      })
    },
    {},
    { timeout: 45000 } // Extended timeout for dev compilation
  )

  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'THE PAMPERED POOCH'
  )

  await expect(
    page.getByText('Enter search criteria and click "Find Animal"')
  ).toHaveText('Enter search criteria and click "Find Animal"')

  const screenshot = await page.screenshot({
    path: 'test-results/homepage-smoke.png',
    fullPage: true,
  })
  expect(screenshot.length).toBeGreaterThan(0)
})
