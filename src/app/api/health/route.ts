// src/app/api/health/route.ts
// Health check endpoint for application startup diagnostics

import { NextResponse } from 'next/server'
import { runDiagnostics, clearDiagnosticCache } from '@/lib/diagnostics'

/**
 * GET /api/health
 * Returns the current health status of the application
 */
export async function GET() {
  try {
    const result = await runDiagnostics()

    // Set appropriate HTTP status based on health
    const httpStatus =
      result.status === 'healthy'
        ? 200
        : result.status === 'needs_setup'
          ? 503
          : 500

    return NextResponse.json(result, { status: httpStatus })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        checks: {
          envConfig: { passed: false, message: 'Check failed' },
          dbConnection: { passed: false, message: 'Check failed' },
          tablesExist: { passed: false, message: 'Check failed' },
          schemaValid: { passed: false, message: 'Check failed' },
          dataPresent: { passed: false, message: 'Check failed' },
        },
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/health
 * Clear the diagnostic cache and re-run checks
 * Useful after setup completes to force fresh check
 */
export async function POST() {
  try {
    clearDiagnosticCache()
    const result = await runDiagnostics()

    return NextResponse.json({
      message: 'Cache cleared and diagnostics re-run',
      result,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to refresh',
      },
      { status: 500 }
    )
  }
}
