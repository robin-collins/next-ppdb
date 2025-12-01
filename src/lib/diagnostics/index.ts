// src/lib/diagnostics/index.ts
// Main diagnostic runner for application startup checks

import {
  checkEnvConfig,
  checkDbConnection,
  checkTablesExist,
  checkSchemaValid,
  checkDataPresent,
} from './checks'
import { DiagnosticChecks, HealthCheckResult, HealthStatus } from './types'

// Cache for health check results (30 second TTL)
let cachedResult: HealthCheckResult | null = null
let cacheTimestamp = 0
const CACHE_TTL_MS = 30000

/**
 * Run all diagnostic checks and determine application health status
 */
export async function runDiagnostics(): Promise<HealthCheckResult> {
  // Check cache first
  const now = Date.now()
  if (cachedResult && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedResult
  }

  const checks: DiagnosticChecks = {
    envConfig: { passed: false, message: 'Not checked' },
    dbConnection: { passed: false, message: 'Not checked' },
    tablesExist: { passed: false, message: 'Not checked' },
    schemaValid: { passed: false, message: 'Not checked' },
    dataPresent: { passed: false, message: 'Not checked' },
  }

  // Run checks in sequence (each depends on previous passing)

  // Check 1: Environment configuration
  checks.envConfig = await checkEnvConfig()
  if (!checks.envConfig.passed) {
    return buildResult('needs_setup', checks)
  }

  // Check 2: Database connection
  checks.dbConnection = await checkDbConnection()
  if (!checks.dbConnection.passed) {
    return buildResult('unhealthy', checks)
  }

  // Check 3: Tables exist
  checks.tablesExist = await checkTablesExist()
  if (!checks.tablesExist.passed) {
    return buildResult('needs_setup', checks)
  }

  // Check 4: Schema valid
  checks.schemaValid = await checkSchemaValid()
  if (!checks.schemaValid.passed) {
    return buildResult('needs_setup', checks)
  }

  // Check 5: Data present
  checks.dataPresent = await checkDataPresent()
  if (!checks.dataPresent.passed) {
    return buildResult('needs_setup', checks)
  }

  // All checks passed
  return buildResult('healthy', checks)
}

/**
 * Build the health check result object
 */
function buildResult(
  status: HealthStatus,
  checks: DiagnosticChecks
): HealthCheckResult {
  const result: HealthCheckResult = {
    status,
    checks,
    timestamp: new Date().toISOString(),
  }

  if (status === 'needs_setup') {
    result.redirectTo = '/setup'
  }

  // Cache the result
  cachedResult = result
  cacheTimestamp = Date.now()

  return result
}

/**
 * Clear the diagnostic cache (useful after setup completes)
 */
export function clearDiagnosticCache(): void {
  cachedResult = null
  cacheTimestamp = 0
}

/**
 * Quick check if setup is needed (uses cache)
 */
export async function needsSetup(): Promise<boolean> {
  const result = await runDiagnostics()
  return result.status === 'needs_setup'
}

/**
 * Quick check if database is healthy (uses cache)
 */
export async function isHealthy(): Promise<boolean> {
  const result = await runDiagnostics()
  return result.status === 'healthy'
}

// Re-export types for convenience
export * from './types'
