// src/components/SetupGuard.tsx
// Server component that enforces database setup before app use
// Implements "fail fast, fail clearly" philosophy

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { runDiagnostics } from '@/lib/diagnostics'

interface SetupGuardProps {
  children: React.ReactNode
}

// Paths that should bypass the setup guard
const BYPASS_PATHS = ['/setup', '/api/', '/_next/', '/favicon', '/docs']

/**
 * SetupGuard - Server component that checks database state on every request
 *
 * This component:
 * 1. Runs diagnostic checks against the database
 * 2. Logs results to console with clear formatting
 * 3. Redirects to /setup if database needs initialization
 * 4. Allows the app to render if everything is healthy
 *
 * IMPORTANT: This component skips checks during build time to prevent
 * build failures when the database is not available.
 */
export async function SetupGuard({ children }: SetupGuardProps) {
  // Skip diagnostics during build time
  // NEXT_PHASE is set during build: 'phase-production-build' or 'phase-export'
  const buildPhase = process.env.NEXT_PHASE
  if (
    buildPhase === 'phase-production-build' ||
    buildPhase === 'phase-export'
  ) {
    console.log('[SetupGuard] Skipping during build phase')
    return <>{children}</>
  }

  // Get current pathname from headers
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || '/'
  const referer = headersList.get('referer') || ''

  // Debug: Log what path we're checking
  console.log(`[SetupGuard] Checking path: ${pathname}`)

  // Check if this path should bypass the guard
  const shouldBypass = BYPASS_PATHS.some(
    path => pathname.startsWith(path) || referer.includes('/setup')
  )

  if (shouldBypass) {
    console.log(`[SetupGuard] Bypassing for path: ${pathname}`)
    return <>{children}</>
  }

  // Run diagnostics (uses cache internally) - ONLY at runtime, never during build
  console.log('[SetupGuard] Running diagnostics...')
  const result = await runDiagnostics()
  console.log(`[SetupGuard] Diagnostic status: ${result.status}`)

  // Only log if something is wrong to avoid noise on every navigation
  if (result.status !== 'healthy') {
    console.log('\n========================================')
    console.log('🐕 PPDB DIAGNOSTICS WARNING')
    console.log(`   Path: ${pathname}`)
    console.log('========================================')

    // Log failures
    const checks = result.checks
    const checkIcon = (passed: boolean) => (passed ? '✅' : '❌')

    if (!checks.envConfig.passed)
      console.log(
        `[1/5] Environment: ${checkIcon(false)} - ${checks.envConfig.message}`
      )
    if (!checks.dbConnection.passed)
      console.log(
        `[2/5] Database: ${checkIcon(false)} - ${checks.dbConnection.message}`
      )
    if (!checks.tablesExist.passed)
      console.log(
        `[3/5] Tables: ${checkIcon(false)} - ${checks.tablesExist.message}`
      )
    if (!checks.schemaValid.passed)
      console.log(
        `[4/5] Schema: ${checkIcon(false)} - ${checks.schemaValid.message}`
      )
    if (!checks.dataPresent.passed)
      console.log(
        `[5/5] Data: ${checkIcon(false)} - ${checks.dataPresent.message}`
      )

    console.log(`Status: ${result.status.toUpperCase()}`)
    console.log('========================================\n')
  }

  // If setup is needed, redirect
  if (result.status === 'needs_setup' || result.status === 'unhealthy') {
    console.log('⚠️  REDIRECTING TO /setup')
    console.log('   Database requires initialization before use.\n')
    redirect('/setup')
  }

  // Database is healthy - render the app
  // Database is healthy - render the app
  return <>{children}</>
}
