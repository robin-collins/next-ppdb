// src/components/SetupGuard.tsx
// Server component that enforces database setup before app use
// Implements "fail fast, fail clearly" philosophy

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { runDiagnostics, clearDiagnosticCache } from '@/lib/diagnostics'

interface SetupGuardProps {
  children: React.ReactNode
}

// Paths that should bypass the setup guard
const BYPASS_PATHS = ['/setup', '/api/', '/_next/', '/favicon']

/**
 * SetupGuard - Server component that checks database state on every request
 *
 * This component:
 * 1. Runs diagnostic checks against the database
 * 2. Logs results to console with clear formatting
 * 3. Redirects to /setup if database needs initialization
 * 4. Allows the app to render if everything is healthy
 */
export async function SetupGuard({ children }: SetupGuardProps) {
  // Get current pathname from headers
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || '/'
  const referer = headersList.get('referer') || ''

  // Check if this path should bypass the guard
  const shouldBypass = BYPASS_PATHS.some(
    path => pathname.startsWith(path) || referer.includes('/setup')
  )

  if (shouldBypass) {
    return <>{children}</>
  }

  // Clear cache to ensure fresh check on each request
  clearDiagnosticCache()

  // Run diagnostics with verbose logging
  console.log('\n========================================')
  console.log('🐕 PPDB STARTUP DIAGNOSTICS')
  console.log(`   Path: ${pathname}`)
  console.log('========================================')

  const startTime = Date.now()
  const result = await runDiagnostics()
  const duration = Date.now() - startTime

  // Log each check result
  const checks = result.checks
  const checkIcon = (passed: boolean) => (passed ? '✅' : '❌')

  console.log(
    `\n[1/5] Environment Config: ${checkIcon(checks.envConfig.passed)}`
  )
  if (!checks.envConfig.passed) {
    console.log(`      ${checks.envConfig.message}`)
  }

  console.log(
    `[2/5] Database Connection: ${checkIcon(checks.dbConnection.passed)}`
  )
  if (!checks.dbConnection.passed) {
    console.log(`      ${checks.dbConnection.message}`)
  }

  console.log(`[3/5] Tables Exist: ${checkIcon(checks.tablesExist.passed)}`)
  if (!checks.tablesExist.passed) {
    console.log(`      ${checks.tablesExist.message}`)
    if (checks.tablesExist.details?.missingTables) {
      const missing = checks.tablesExist.details.missingTables as string[]
      console.log(`      Missing: ${missing.join(', ')}`)
    }
  }

  console.log(`[4/5] Schema Valid: ${checkIcon(checks.schemaValid.passed)}`)
  if (!checks.schemaValid.passed) {
    console.log(`      ${checks.schemaValid.message}`)
    if (checks.schemaValid.details?.errors) {
      const errors = checks.schemaValid.details.errors as string[]
      errors.forEach((err: string) => console.log(`      - ${err}`))
    }
  }

  console.log(`[5/5] Data Present: ${checkIcon(checks.dataPresent.passed)}`)
  if (!checks.dataPresent.passed) {
    console.log(`      ${checks.dataPresent.message}`)
    if (checks.dataPresent.details?.tableCounts) {
      const counts = checks.dataPresent.details.tableCounts as Record<
        string,
        number
      >
      const emptyTables = Object.entries(counts)
        .filter(([, count]) => count === 0)
        .map(([table]) => table)
      if (emptyTables.length > 0) {
        console.log(`      Empty tables: ${emptyTables.join(', ')}`)
      }
    }
  }

  console.log('\n----------------------------------------')
  console.log(`Status: ${result.status.toUpperCase()}`)
  console.log(`Duration: ${duration}ms`)
  console.log('========================================\n')

  // If setup is needed, redirect
  if (result.status === 'needs_setup' || result.status === 'unhealthy') {
    console.log('⚠️  REDIRECTING TO /setup')
    console.log('   Database requires initialization before use.\n')
    redirect('/setup')
  }

  // Database is healthy - render the app
  console.log('✅ Database healthy - proceeding with application\n')
  return <>{children}</>
}
