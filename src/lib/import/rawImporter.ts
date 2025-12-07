// src/lib/import/rawImporter.ts
// Raw SQL-based importer that bypasses Prisma's strict date parsing
// Handles dirty data including 0000-00-00 dates
// PRESERVES original IDs - does not auto-increment

import { exec } from 'child_process'
import { promisify } from 'util'
import { parseDbUrl } from '@/lib/diagnostics/checks'
import { ImportLogger, getImportLogDir } from './importLogger'
import {
  validateBreed,
  validateCustomer,
  validateAnimal,
  validateNote,
} from './validator'

const execAsync = promisify(exec)

// Progress callback type for UI updates
export type ProgressCallback = (current: number, total: number) => void

export interface RawImportStats {
  total: number
  imported: number
  repaired: number
  skipped: number
  failed: number
  orphaned: number // Subset of skipped - records missing parent ID
}

export interface RawImportResult {
  stats: RawImportStats
  idMap: Map<number, number>
  logFile: string
}

/**
 * Get all records from a temp table using raw SQL
 */
async function getRawRecords(
  tempDbName: string,
  table: string
): Promise<Record<string, unknown>[]> {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error('DATABASE_URL not configured')

  const config = parseDbUrl(dbUrl)
  if (!config) throw new Error('Invalid DATABASE_URL')

  // Query with explicit column output to handle bad dates
  // --ssl-mode=DISABLED for internal Docker network (works with both MySQL and MariaDB clients)
  const cmd = `mysql -h${config.host} -P${config.port} -u${config.user} -p'${config.password}' --ssl-mode=DISABLED ${tempDbName} -e "SELECT * FROM ${table}" --batch`

  const { stdout } = await execAsync(cmd, { maxBuffer: 100 * 1024 * 1024 })

  const lines = stdout.trim().split('\n')
  if (lines.length <= 1) return []

  const columns = lines[0].split('\t')
  const records: Record<string, unknown>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('\t')
    const row: Record<string, unknown> = {}
    columns.forEach((col, j) => {
      let val: unknown = values[j]
      if (val === 'NULL' || val === '\\N') val = null
      row[col] = val
    })
    records.push(row)
  }

  return records
}

/**
 * Get database config for production DB
 */
function getProductionDbConfig() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error('DATABASE_URL not configured')

  const config = parseDbUrl(dbUrl)
  if (!config) throw new Error('Invalid DATABASE_URL')

  return config
}

/**
 * Execute raw SQL INSERT with explicit ID (preserves original primary keys)
 */
async function rawInsert(
  table: string,
  columns: string[],
  values: (string | number | null)[]
): Promise<void> {
  const config = getProductionDbConfig()

  // Escape and format values for SQL
  const escapedValues = values.map(v => {
    if (v === null) return 'NULL'
    if (typeof v === 'number') return String(v)
    // Escape single quotes and backslashes for SQL
    const escaped = String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
    return `'${escaped}'`
  })

  const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${escapedValues.join(', ')})`
  const cmd = `mysql -h${config.host} -P${config.port} -u${config.user} -p'${config.password}' --ssl-mode=DISABLED ${config.database} -e "${sql.replace(/"/g, '\\"')}"`

  await execAsync(cmd)
}

/**
 * Import breeds with full logging - PRESERVES original breedID
 */
export async function importBreedsRaw(
  tempDbName: string,
  logDir: string,
  onProgress?: ProgressCallback
): Promise<RawImportResult> {
  const logger = new ImportLogger(logDir, 'breed')
  await logger.init()

  const stats: RawImportStats = {
    total: 0,
    imported: 0,
    repaired: 0,
    skipped: 0,
    failed: 0,
    orphaned: 0,
  }
  const idMap = new Map<number, number>()
  const existingNames = new Set<string>()

  await logger.logInfo(`Reading breeds from temp database: ${tempDbName}`)
  const records = await getRawRecords(tempDbName, 'breed')
  stats.total = records.length
  await logger.logInfo(`Found ${stats.total} breed records`)

  let processed = 0
  for (const raw of records) {
    const originalId = Number(raw.breedID) || 0
    const result = validateBreed(raw, existingNames)

    if (result.skip || !result.data) {
      stats.skipped++
      await logger.logSkipped(
        originalId,
        raw,
        result.skipReason || 'Validation failed'
      )
      processed++
      if (processed % 100 === 0) onProgress?.(processed, stats.total)
      continue
    }

    try {
      // Format time for SQL (avgtime is a TIME column)
      const formatTime = (d: Date | null): string | null => {
        if (!d || isNaN(d.getTime())) return null
        return d.toTimeString().slice(0, 8) // HH:MM:SS
      }

      // Use raw SQL INSERT with explicit breedID to preserve original ID
      await rawInsert(
        'breed',
        ['breedID', 'breedname', 'avgtime', 'avgcost'],
        [
          originalId,
          result.data.breedname,
          formatTime(result.data.avgtime),
          result.data.avgcost,
        ]
      )

      // ID preserved - no mapping needed, but record it for consistency
      idMap.set(originalId, originalId)
      existingNames.add(result.data.breedname.toLowerCase())

      if (result.repairs.length > 0) {
        stats.repaired++
        await logger.logRepaired(
          originalId,
          originalId,
          raw,
          result.data as unknown as Record<string, unknown>,
          result.repairs
        )
      } else {
        stats.imported++
        await logger.logImported(
          originalId,
          originalId,
          raw,
          result.data as unknown as Record<string, unknown>
        )
      }
    } catch (error) {
      stats.failed++
      await logger.logFailed(
        originalId,
        raw,
        error instanceof Error ? error.message : 'Unknown error'
      )
    }

    processed++
    if (processed % 100 === 0) onProgress?.(processed, stats.total)
  }

  // Final progress update
  onProgress?.(stats.total, stats.total)

  await logger.close()
  return { stats, idMap, logFile: `${logDir}/breed_import_*.log` }
}

/**
 * Import customers with full logging - PRESERVES original customerID
 */
export async function importCustomersRaw(
  tempDbName: string,
  logDir: string,
  onProgress?: ProgressCallback
): Promise<RawImportResult> {
  const logger = new ImportLogger(logDir, 'customer')
  await logger.init()

  const stats: RawImportStats = {
    total: 0,
    imported: 0,
    repaired: 0,
    skipped: 0,
    failed: 0,
    orphaned: 0,
  }
  const idMap = new Map<number, number>()

  const records = await getRawRecords(tempDbName, 'customer')
  stats.total = records.length
  await logger.logInfo(`Found ${stats.total} customer records`)

  let processed = 0
  for (const raw of records) {
    const originalId = Number(raw.customerID) || 0
    const result = validateCustomer(raw)

    if (result.skip || !result.data) {
      stats.skipped++
      await logger.logSkipped(
        originalId,
        raw,
        result.skipReason || 'Validation failed'
      )
      processed++
      if (processed % 100 === 0) onProgress?.(processed, stats.total)
      continue
    }

    try {
      // Use raw SQL INSERT with explicit customerID to preserve original ID
      await rawInsert(
        'customer',
        [
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
        [
          originalId,
          result.data.surname,
          result.data.firstname,
          result.data.address,
          result.data.suburb,
          result.data.postcode,
          result.data.phone1,
          result.data.phone2,
          result.data.phone3,
          result.data.email,
        ]
      )

      // ID preserved
      idMap.set(originalId, originalId)

      if (result.repairs.length > 0) {
        stats.repaired++
        await logger.logRepaired(
          originalId,
          originalId,
          raw,
          result.data as unknown as Record<string, unknown>,
          result.repairs
        )
      } else {
        stats.imported++
        await logger.logImported(
          originalId,
          originalId,
          raw,
          result.data as unknown as Record<string, unknown>
        )
      }
    } catch (error) {
      stats.failed++
      await logger.logFailed(
        originalId,
        raw,
        error instanceof Error ? error.message : 'Unknown error'
      )
    }

    processed++
    if (processed % 100 === 0) onProgress?.(processed, stats.total)
  }

  // Final progress update
  onProgress?.(stats.total, stats.total)

  await logger.close()
  return { stats, idMap, logFile: `${logDir}/customer_import_*.log` }
}

/**
 * Import animals with full logging - PRESERVES original animalID
 * Since IDs are preserved, breedIdMap and customerIdMap are Sets of valid IDs
 */
export async function importAnimalsRaw(
  tempDbName: string,
  logDir: string,
  breedIdMap: Map<number, number>,
  customerIdMap: Map<number, number>,
  onProgress?: ProgressCallback
): Promise<RawImportResult> {
  const logger = new ImportLogger(logDir, 'animal')
  await logger.init()

  const stats: RawImportStats = {
    total: 0,
    imported: 0,
    repaired: 0,
    skipped: 0,
    failed: 0,
    orphaned: 0,
  }
  const idMap = new Map<number, number>()

  // Get valid IDs (since IDs are preserved, the keys equal the values)
  const validCustomerIds = new Set(customerIdMap.keys())
  const validBreedIds = new Set(breedIdMap.keys())

  const records = await getRawRecords(tempDbName, 'animal')
  stats.total = records.length
  await logger.logInfo(`Found ${stats.total} animal records`)

  let processed = 0
  for (const raw of records) {
    const originalId = Number(raw.animalID) || 0
    const customerId = Number(raw.customerID) || 0
    const breedId = Number(raw.breedID) || 0

    // Check if customer was imported (ID preserved)
    if (!validCustomerIds.has(customerId)) {
      stats.skipped++
      stats.orphaned++ // Orphaned - missing parent customerID
      await logger.logSkipped(
        originalId,
        raw,
        `Orphaned: Customer ${customerId} not found (deleted?)`
      )
      processed++
      if (processed % 100 === 0) onProgress?.(processed, stats.total)
      continue
    }

    // Use original breedId if valid, otherwise skip (no more Unknown breed fallback)
    if (!validBreedIds.has(breedId) && breedId !== 0) {
      stats.skipped++
      await logger.logSkipped(
        originalId,
        raw,
        `Breed ${breedId} not found in import`
      )
      processed++
      if (processed % 100 === 0) onProgress?.(processed, stats.total)
      continue
    }

    const result = validateAnimal(
      { ...raw, customerID: customerId, breedID: breedId },
      validCustomerIds,
      validBreedIds,
      0 // No unknown breed fallback
    )

    if (result.skip || !result.data) {
      stats.skipped++
      await logger.logSkipped(
        originalId,
        raw,
        result.skipReason || 'Validation failed'
      )
      processed++
      if (processed % 100 === 0) onProgress?.(processed, stats.total)
      continue
    }

    try {
      // Format date for SQL (handle null/invalid dates)
      const formatDate = (d: Date | null): string | null => {
        if (!d || isNaN(d.getTime())) return null
        return d.toISOString().slice(0, 10) // YYYY-MM-DD
      }

      // Use raw SQL INSERT with explicit animalID to preserve original ID
      await rawInsert(
        'animal',
        [
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
        [
          originalId,
          result.data.animalname,
          breedId,
          customerId,
          result.data.SEX,
          result.data.colour || '',
          result.data.cost,
          formatDate(result.data.lastvisit),
          formatDate(result.data.thisvisit),
          result.data.comments,
        ]
      )

      // ID preserved
      idMap.set(originalId, originalId)

      if (result.repairs.length > 0) {
        stats.repaired++
        await logger.logRepaired(
          originalId,
          originalId,
          raw,
          result.data as unknown as Record<string, unknown>,
          result.repairs
        )
      } else {
        stats.imported++
        await logger.logImported(
          originalId,
          originalId,
          raw,
          result.data as unknown as Record<string, unknown>
        )
      }
    } catch (error) {
      stats.failed++
      await logger.logFailed(
        originalId,
        raw,
        error instanceof Error ? error.message : 'Unknown error'
      )
    }

    processed++
    if (processed % 100 === 0) onProgress?.(processed, stats.total)
  }

  // Final progress update
  onProgress?.(stats.total, stats.total)

  await logger.close()
  return { stats, idMap, logFile: `${logDir}/animal_import_*.log` }
}

/**
 * Import notes with full logging - PRESERVES original noteID
 */
export async function importNotesRaw(
  tempDbName: string,
  logDir: string,
  animalIdMap: Map<number, number>,
  onProgress?: ProgressCallback
): Promise<RawImportResult> {
  const logger = new ImportLogger(logDir, 'notes')
  await logger.init()

  const stats: RawImportStats = {
    total: 0,
    imported: 0,
    repaired: 0,
    skipped: 0,
    failed: 0,
    orphaned: 0,
  }
  const idMap = new Map<number, number>()

  const records = await getRawRecords(tempDbName, 'notes')
  stats.total = records.length
  await logger.logInfo(`Found ${stats.total} notes records`)

  // Valid animal IDs (IDs are preserved, so keys = values)
  const validAnimalIds = new Set(animalIdMap.keys())

  let processed = 0
  for (const raw of records) {
    const originalId = Number(raw.noteID) || 0
    const animalId = Number(raw.animalID) || 0

    // Check if animal was imported (ID preserved)
    if (!validAnimalIds.has(animalId)) {
      stats.skipped++
      stats.orphaned++ // Orphaned - missing parent animalID
      await logger.logSkipped(
        originalId,
        raw,
        `Orphaned: Animal ${animalId} not found (deleted?)`
      )
      processed++
      if (processed % 100 === 0) onProgress?.(processed, stats.total)
      continue
    }

    const result = validateNote({ ...raw, animalID: animalId }, validAnimalIds)

    if (result.skip || !result.data) {
      stats.skipped++
      await logger.logSkipped(
        originalId,
        raw,
        result.skipReason || 'Validation failed'
      )
      processed++
      if (processed % 100 === 0) onProgress?.(processed, stats.total)
      continue
    }

    try {
      // Format date for SQL
      const formatDate = (d: Date | null): string | null => {
        if (!d || isNaN(d.getTime())) return null
        return d.toISOString().slice(0, 10) // YYYY-MM-DD
      }

      // Use raw SQL INSERT with explicit noteID to preserve original ID
      await rawInsert(
        'notes',
        ['noteID', 'animalID', 'notes', 'date'],
        [originalId, animalId, result.data.notes, formatDate(result.data.date)]
      )

      // ID preserved
      idMap.set(originalId, originalId)
      stats.imported++
      await logger.logImported(
        originalId,
        originalId,
        raw,
        result.data as unknown as Record<string, unknown>
      )
    } catch (error) {
      stats.failed++
      await logger.logFailed(
        originalId,
        raw,
        error instanceof Error ? error.message : 'Unknown error'
      )
    }

    processed++
    if (processed % 100 === 0) onProgress?.(processed, stats.total)
  }

  // Final progress update
  onProgress?.(stats.total, stats.total)

  await logger.close()
  return { stats, idMap, logFile: `${logDir}/notes_import_*.log` }
}

export { getRawRecords, getImportLogDir }
