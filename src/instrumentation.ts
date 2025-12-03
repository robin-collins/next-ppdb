/**
 * Next.js Instrumentation Hook
 *
 * This file is automatically loaded by Next.js at startup.
 * Used to validate environment variables before the app starts.
 *
 * See: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on server side (Node.js runtime)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnvironmentOrExit } = await import('./lib/env')

    // Validate environment variables
    // This will exit the process if validation fails
    validateEnvironmentOrExit()
  }
}
