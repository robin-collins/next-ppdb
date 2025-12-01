// src/lib/diagnostics/types.ts
// TypeScript interfaces for the startup diagnostic system

/**
 * Result of a single diagnostic check
 */
export interface CheckResult {
  passed: boolean
  message: string
  details?: Record<string, unknown>
}

/**
 * All diagnostic checks performed at startup
 */
export interface DiagnosticChecks {
  envConfig: CheckResult
  dbConnection: CheckResult
  tablesExist: CheckResult
  schemaValid: CheckResult
  dataPresent: CheckResult
}

/**
 * Overall health status of the application
 */
export type HealthStatus = 'healthy' | 'unhealthy' | 'needs_setup'

/**
 * Complete health check response
 */
export interface HealthCheckResult {
  status: HealthStatus
  checks: DiagnosticChecks
  timestamp: string
  redirectTo?: '/setup'
}

/**
 * Expected table schema for validation
 */
export interface TableSchema {
  name: string
  requiredColumns: string[]
}

/**
 * Table data count result
 */
export interface TableCount {
  table: string
  count: number
}

/**
 * Database connection configuration parsed from DATABASE_URL
 */
export interface DbConfig {
  host: string
  port: string
  user: string
  password: string
  database: string
}

/**
 * Expected schemas for all required tables
 */
export const EXPECTED_TABLES: TableSchema[] = [
  {
    name: 'breed',
    requiredColumns: ['breedID', 'breedname', 'avgtime', 'avgcost'],
  },
  {
    name: 'customer',
    requiredColumns: [
      'customerID',
      'surname',
      'firstname',
      'address',
      'suburb',
      'postcode',
      'phone1',
      'phone2',
      'phone3',
      'email',
    ],
  },
  {
    name: 'animal',
    requiredColumns: [
      'animalID',
      'animalname',
      'breedID',
      'customerID',
      'SEX',
      'colour',
      'cost',
      'lastvisit',
      'thisvisit',
      'comments',
    ],
  },
  {
    name: 'notes',
    requiredColumns: ['noteID', 'animalID', 'notes', 'date'],
  },
]

/**
 * Required table names for quick reference
 */
export const REQUIRED_TABLES = ['breed', 'customer', 'animal', 'notes'] as const
export type RequiredTable = (typeof REQUIRED_TABLES)[number]
