// src/lib/setup/tempDb.ts
// Temporary database management for two-stage import process

import { exec } from 'child_process'
import { promisify } from 'util'
import { PrismaClient } from '@/generated/prisma'
import { parseDbUrl } from '@/lib/diagnostics/checks'

const execAsync = promisify(exec)

export interface TempDbConfig {
  name: string
  connectionUrl: string
}

/**
 * Create a temporary database for import staging
 */
export async function createTempDatabase(): Promise<TempDbConfig> {
  const mainDbUrl = process.env.DATABASE_URL
  if (!mainDbUrl) {
    throw new Error('DATABASE_URL not configured')
  }

  const config = parseDbUrl(mainDbUrl)
  if (!config) {
    throw new Error('Invalid DATABASE_URL format')
  }

  // Generate unique temp database name
  const tempDbName = `ppdb_import_${Date.now()}`

  // Create the temp database using mysql client
  const createDbCmd = `mysql -h${config.host} -P${config.port} -u${config.user} -p'${config.password}' -e "CREATE DATABASE IF NOT EXISTS \\\`${tempDbName}\\\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"`

  try {
    await execAsync(createDbCmd)
  } catch (error) {
    throw new Error(
      `Failed to create temp database: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }

  // Build connection URL for temp database
  const tempConnectionUrl = `mysql://${config.user}:${encodeURIComponent(config.password)}@${config.host}:${config.port}/${tempDbName}`

  return {
    name: tempDbName,
    connectionUrl: tempConnectionUrl,
  }
}

/**
 * Import SQL file into temp database using mysql client
 */
export async function importSqlToTempDb(
  tempDbName: string,
  sqlFilePath: string,
  onProgress?: (message: string) => void
): Promise<void> {
  const mainDbUrl = process.env.DATABASE_URL
  if (!mainDbUrl) {
    throw new Error('DATABASE_URL not configured')
  }

  const config = parseDbUrl(mainDbUrl)
  if (!config) {
    throw new Error('Invalid DATABASE_URL format')
  }

  onProgress?.('Starting SQL import to temporary database...')

  // Import using mysql client with source command
  const importCmd = `mysql -h${config.host} -P${config.port} -u${config.user} -p'${config.password}' ${tempDbName} < "${sqlFilePath}"`

  try {
    await execAsync(importCmd, { maxBuffer: 50 * 1024 * 1024 }) // 50MB buffer for large outputs
    onProgress?.('SQL import completed successfully')
  } catch (error) {
    throw new Error(
      `SQL import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Create Prisma client for temp database
 */
export function createTempPrismaClient(connectionUrl: string): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: {
        url: connectionUrl,
      },
    },
  })
}

/**
 * Get record counts from temp database
 */
export async function getTempDbCounts(
  tempPrisma: PrismaClient
): Promise<Record<string, number>> {
  const [breedCount, customerCount, animalCount, notesCount] =
    await Promise.all([
      tempPrisma.breed.count(),
      tempPrisma.customer.count(),
      tempPrisma.animal.count(),
      tempPrisma.notes.count(),
    ])

  return {
    breed: breedCount,
    customer: customerCount,
    animal: animalCount,
    notes: notesCount,
  }
}

/**
 * Drop the temporary database
 */
export async function dropTempDatabase(tempDbName: string): Promise<void> {
  const mainDbUrl = process.env.DATABASE_URL
  if (!mainDbUrl) {
    return // Nothing to drop if no config
  }

  const config = parseDbUrl(mainDbUrl)
  if (!config) {
    return
  }

  const dropDbCmd = `mysql -h${config.host} -P${config.port} -u${config.user} -p'${config.password}' -e "DROP DATABASE IF EXISTS \\\`${tempDbName}\\\`"`

  try {
    await execAsync(dropDbCmd)
  } catch {
    // Ignore drop errors - best effort cleanup
    console.warn(`Warning: Failed to drop temp database ${tempDbName}`)
  }
}

/**
 * Disconnect temp Prisma client and cleanup
 */
export async function cleanupTempDb(
  tempPrisma: PrismaClient | null,
  tempDbName: string | null
): Promise<void> {
  if (tempPrisma) {
    try {
      await tempPrisma.$disconnect()
    } catch {
      // Ignore disconnect errors
    }
  }

  if (tempDbName) {
    await dropTempDatabase(tempDbName)
  }
}
