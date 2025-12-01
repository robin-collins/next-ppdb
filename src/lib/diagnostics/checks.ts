// src/lib/diagnostics/checks.ts
// Individual diagnostic check functions for startup validation

import { prisma } from '@/lib/prisma'
import {
  CheckResult,
  DbConfig,
  EXPECTED_TABLES,
  REQUIRED_TABLES,
  TableCount,
} from './types'

/**
 * Parse DATABASE_URL to extract connection details
 */
export function parseDbUrl(url: string): DbConfig | null {
  const regex = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/
  const match = url.match(regex)
  if (!match) return null
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: match[4],
    database: match[5],
  }
}

/**
 * Check 1: Verify DATABASE_URL environment variable exists and is valid
 */
export async function checkEnvConfig(): Promise<CheckResult> {
  const dbUrl = process.env.DATABASE_URL

  if (!dbUrl) {
    return {
      passed: false,
      message: 'DATABASE_URL environment variable is not set',
      details: {
        hint: 'Add DATABASE_URL to your .env file with format: mysql://user:password@host:port/database',
      },
    }
  }

  const config = parseDbUrl(dbUrl)
  if (!config) {
    return {
      passed: false,
      message: 'DATABASE_URL format is invalid',
      details: {
        hint: 'Expected format: mysql://user:password@host:port/database',
        received: dbUrl.replace(/:[^:@]+@/, ':***@'), // Hide password
      },
    }
  }

  return {
    passed: true,
    message: 'Database configuration is valid',
    details: {
      host: config.host,
      port: config.port,
      database: config.database,
    },
  }
}

/**
 * Check 2: Test MySQL connection with timeout
 */
export async function checkDbConnection(): Promise<CheckResult> {
  try {
    // Simple query with timeout to test connection
    const result = await Promise.race([
      prisma.$queryRaw`SELECT 1 as connected`,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      ),
    ])

    if (Array.isArray(result) && result.length > 0) {
      return {
        passed: true,
        message: 'Successfully connected to MySQL server',
      }
    }

    return {
      passed: false,
      message: 'Connection test returned unexpected result',
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'

    return {
      passed: false,
      message: 'Failed to connect to MySQL server',
      details: {
        error: errorMessage,
        hints: [
          'Verify MySQL server is running',
          'Check host and port are correct',
          'Ensure user credentials are valid',
          'Confirm database exists',
        ],
      },
    }
  }
}

/**
 * Check 3: Verify all required tables exist
 */
export async function checkTablesExist(): Promise<CheckResult> {
  try {
    const dbConfig = parseDbUrl(process.env.DATABASE_URL || '')
    if (!dbConfig) {
      return {
        passed: false,
        message: 'Cannot check tables: invalid DATABASE_URL',
      }
    }

    // Query INFORMATION_SCHEMA to get table names
    const tables = await prisma.$queryRaw<{ TABLE_NAME: string }[]>`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = ${dbConfig.database}
      AND TABLE_TYPE = 'BASE TABLE'
    `

    const existingTables = tables.map(t => t.TABLE_NAME.toLowerCase())
    const missingTables = REQUIRED_TABLES.filter(
      table => !existingTables.includes(table.toLowerCase())
    )

    if (missingTables.length > 0) {
      return {
        passed: false,
        message: `Missing required tables: ${missingTables.join(', ')}`,
        details: {
          required: REQUIRED_TABLES,
          existing: existingTables.filter(t =>
            REQUIRED_TABLES.map(r => r.toLowerCase()).includes(t)
          ),
          missing: missingTables,
        },
      }
    }

    return {
      passed: true,
      message: 'All required tables exist',
      details: {
        tables: REQUIRED_TABLES,
      },
    }
  } catch (error) {
    return {
      passed: false,
      message: 'Failed to check table existence',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    }
  }
}

/**
 * Check 4: Verify table schemas match expected structure
 */
export async function checkSchemaValid(): Promise<CheckResult> {
  try {
    const dbConfig = parseDbUrl(process.env.DATABASE_URL || '')
    if (!dbConfig) {
      return {
        passed: false,
        message: 'Cannot check schema: invalid DATABASE_URL',
      }
    }

    const schemaIssues: string[] = []

    for (const expectedTable of EXPECTED_TABLES) {
      // Get columns for this table
      const columns = await prisma.$queryRaw<{ COLUMN_NAME: string }[]>`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = ${dbConfig.database}
        AND TABLE_NAME = ${expectedTable.name}
      `

      const existingColumns = columns.map(c => c.COLUMN_NAME.toLowerCase())

      // Check for missing columns
      const missingColumns = expectedTable.requiredColumns.filter(
        col => !existingColumns.includes(col.toLowerCase())
      )

      if (missingColumns.length > 0) {
        schemaIssues.push(
          `Table '${expectedTable.name}' missing columns: ${missingColumns.join(', ')}`
        )
      }
    }

    if (schemaIssues.length > 0) {
      return {
        passed: false,
        message: 'Schema validation failed',
        details: {
          issues: schemaIssues,
        },
      }
    }

    return {
      passed: true,
      message: 'All table schemas are valid',
    }
  } catch (error) {
    return {
      passed: false,
      message: 'Failed to validate schema',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    }
  }
}

/**
 * Check 5: Verify all tables contain data
 */
export async function checkDataPresent(): Promise<CheckResult> {
  try {
    const tableCounts: TableCount[] = []
    const emptyTables: string[] = []

    // Count records in each table
    for (const table of REQUIRED_TABLES) {
      let count = 0

      // Use Prisma model counts for type safety
      switch (table) {
        case 'breed':
          count = await prisma.breed.count()
          break
        case 'customer':
          count = await prisma.customer.count()
          break
        case 'animal':
          count = await prisma.animal.count()
          break
        case 'notes':
          count = await prisma.notes.count()
          break
      }

      tableCounts.push({ table, count })
      if (count === 0) {
        emptyTables.push(table)
      }
    }

    if (emptyTables.length > 0) {
      return {
        passed: false,
        message: `Empty tables detected: ${emptyTables.join(', ')}`,
        details: {
          tableCounts,
          emptyTables,
          hint: 'Import a database backup to populate the tables',
        },
      }
    }

    return {
      passed: true,
      message: 'All tables contain data',
      details: {
        tableCounts,
        totalRecords: tableCounts.reduce((sum, tc) => sum + tc.count, 0),
      },
    }
  } catch (error) {
    return {
      passed: false,
      message: 'Failed to check data presence',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    }
  }
}
