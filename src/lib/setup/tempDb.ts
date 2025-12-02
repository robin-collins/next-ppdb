// src/lib/setup/tempDb.ts
// Temporary database management for two-stage import process
// Handles both single combined SQL and multiple per-table SQL files

import { exec } from 'child_process'
import { promisify } from 'util'
import { PrismaClient } from '@/generated/prisma'
import { parseDbUrl } from '@/lib/diagnostics/checks'
import { SqlFileInfo } from '@/lib/import/extractor'

const execAsync = promisify(exec)

export interface TempDbConfig {
  name: string
  connectionUrl: string
}

/**
 * Create a temporary database for import staging
 * The app creates this automatically - no pre-creation needed
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
    console.log(`[TempDB] Created temporary database: ${tempDbName}`)
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
 * Import a single SQL file into temp database using mysql client
 */
export async function importSqlFileToTempDb(
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

  onProgress?.(`Importing: ${sqlFilePath}`)

  // Import using mysql client
  const importCmd = `mysql -h${config.host} -P${config.port} -u${config.user} -p'${config.password}' ${tempDbName} < "${sqlFilePath}"`

  try {
    await execAsync(importCmd, { maxBuffer: 50 * 1024 * 1024 }) // 50MB buffer
  } catch (error) {
    throw new Error(
      `SQL import failed for ${sqlFilePath}: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Import multiple SQL files into temp database in order
 * For legacy PPDB backups with per-table SQL files
 */
export async function importSqlFilesToTempDb(
  tempDbName: string,
  sqlFiles: SqlFileInfo[],
  onProgress?: (message: string, current: number, total: number) => void
): Promise<void> {
  const mainDbUrl = process.env.DATABASE_URL
  if (!mainDbUrl) {
    throw new Error('DATABASE_URL not configured')
  }

  const config = parseDbUrl(mainDbUrl)
  if (!config) {
    throw new Error('Invalid DATABASE_URL format')
  }

  console.log(
    `[TempDB] Importing ${sqlFiles.length} SQL files to ${tempDbName}`
  )

  for (let i = 0; i < sqlFiles.length; i++) {
    const file = sqlFiles[i]
    onProgress?.(
      `Importing ${file.table}.sql (${i + 1}/${sqlFiles.length})`,
      i + 1,
      sqlFiles.length
    )

    const importCmd = `mysql -h${config.host} -P${config.port} -u${config.user} -p'${config.password}' ${tempDbName} < "${file.path}"`

    try {
      await execAsync(importCmd, { maxBuffer: 50 * 1024 * 1024 })
      console.log(`[TempDB] Imported ${file.filename} successfully`)
    } catch (error) {
      throw new Error(
        `SQL import failed for ${file.filename}: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  onProgress?.('SQL import completed', sqlFiles.length, sqlFiles.length)
}

/**
 * Legacy single-file import (kept for backwards compatibility)
 */
export async function importSqlToTempDb(
  tempDbName: string,
  sqlFilePath: string,
  onProgress?: (message: string) => void
): Promise<void> {
  onProgress?.('Starting SQL import to temporary database...')
  await importSqlFileToTempDb(tempDbName, sqlFilePath, onProgress)
  onProgress?.('SQL import completed successfully')
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
    console.log(`[TempDB] Dropped temporary database: ${tempDbName}`)
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
