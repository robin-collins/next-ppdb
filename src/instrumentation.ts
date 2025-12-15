/**
 * Next.js Instrumentation Hook
 *
 * This file is automatically loaded by Next.js at startup (once).
 * Used to:
 * 1. Validate environment variables
 * 2. Check if database needs setup (one-time check)
 *
 * See: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on server side (Node.js runtime)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnvironmentOrExit } = await import('./lib/env')
    const { setNeedsSetup } = await import('./lib/setupState')

    // Validate environment variables
    // This will exit the process if validation fails
    validateEnvironmentOrExit()

    // Run one-time startup check to determine if setup is needed
    console.log('[Instrumentation] Running one-time setup check...')

    try {
      const { checkDataPresent } = await import('./lib/diagnostics/checks')

      // Check if all tables have data
      const dataCheck = await checkDataPresent()

      if (dataCheck.passed) {
        console.log('[Instrumentation] Database has data - setup not required')
        setNeedsSetup(false)
      } else {
        console.log(`[Instrumentation] Setup required: ${dataCheck.message}`)
        setNeedsSetup(true)
      }
    } catch (error) {
      // If we can't check (DB not ready, etc.), assume setup is needed
      // This is safe because /setup will verify the actual state
      console.log(
        `[Instrumentation] Could not verify database state, assuming setup needed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
      setNeedsSetup(true)
    }

    console.log('[Instrumentation] Startup check complete')
  }
}
