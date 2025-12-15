// src/lib/import/extractor.ts
// Archive extraction utility for .zip and .tar.gz files
// Handles both:
// - Legacy PPDB backup structure (.tar.gz) with nested folders and per-table SQL files
// - New Next.js app backup format (.zip) with single combined SQL dump

import AdmZip from 'adm-zip'
import * as tar from 'tar'
import * as fs from 'fs/promises'
import * as path from 'path'

// Expected SQL files from legacy PPDB backup
export const EXPECTED_SQL_FILES = [
  'breed.sql',
  'customer.sql',
  'animal.sql',
  'notes.sql',
] as const

// Known backup folder paths in legacy PPDB tar.gz archives
const LEGACY_BACKUP_PATHS = [
  'srv/www/htdocs/ppdb/backup',
  'var/www/html/ppdb/backup',
  'backup',
]

// Pattern to identify new app backup files: YYYYMMDD-HHmmss-backup.sql
const NEW_APP_BACKUP_PATTERN = /^\d{8}-\d{6}-backup\.sql$/

/**
 * Backup type enumeration
 * - 'legacy': Original PHP application backup (.tar.gz with per-table SQL files)
 * - 'nextjs': New Next.js application backup (.zip with combined mysqldump)
 * - 'unknown': Could not determine backup type (generic SQL file)
 */
export type BackupType = 'legacy' | 'nextjs' | 'unknown'

export interface SqlFileInfo {
  table: string
  path: string
  filename: string
}

export interface ExtractResult {
  success: boolean
  sqlFiles?: SqlFileInfo[]
  error?: string
  tempDir?: string
  backupPath?: string
  /** Detected backup type */
  backupType?: BackupType
  /** Human-readable description of the backup source */
  backupSourceDescription?: string
}

/**
 * Extract archive and find SQL backup files
 * Supports: .sql (single file), .zip, .tar.gz, .tgz
 *
 * For legacy PPDB backups (.tar.gz), looks for:
 * - Nested path: srv/www/htdocs/ppdb/backup/
 * - 4 SQL files: breed.sql, customer.sql, animal.sql, notes.sql
 */
export async function extractSqlFile(
  filePath: string,
  tempDir: string
): Promise<ExtractResult> {
  const ext = path.extname(filePath).toLowerCase()
  const filename = path.basename(filePath).toLowerCase()

  try {
    // Create temp directory for extraction
    await fs.mkdir(tempDir, { recursive: true })

    // Plain .sql file - check if it's a new app backup or generic SQL
    if (ext === '.sql') {
      const sqlFilename = path.basename(filePath)
      const isNextJsBackup = NEW_APP_BACKUP_PATTERN.test(sqlFilename)

      return {
        success: true,
        sqlFiles: [
          {
            table: 'combined',
            path: filePath,
            filename: sqlFilename,
          },
        ],
        tempDir,
        backupType: isNextJsBackup ? 'nextjs' : 'unknown',
        backupSourceDescription: isNextJsBackup
          ? 'Next.js PPDB backup (combined mysqldump format)'
          : 'Generic SQL backup file',
      }
    }

    // Handle .zip files
    if (ext === '.zip') {
      return await extractZip(filePath, tempDir)
    }

    // Handle .tar.gz and .tgz files
    if (ext === '.gz' || ext === '.tgz' || filename.endsWith('.tar.gz')) {
      return await extractTarGz(filePath, tempDir)
    }

    return {
      success: false,
      error: `Unsupported file type: ${ext}. Supported: .sql, .zip, .tar.gz, .tgz`,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Extraction failed',
    }
  }
}

/**
 * Extract ZIP file and find SQL files
 * Detects both new Next.js app backups and legacy backups packaged as ZIP
 */
async function extractZip(
  zipPath: string,
  tempDir: string
): Promise<ExtractResult> {
  try {
    const zip = new AdmZip(zipPath)
    const entries = zip.getEntries()

    // Check if this is a new Next.js app backup
    // These contain a single SQL file matching pattern: YYYYMMDD-HHmmss-backup.sql
    const sqlEntries = entries.filter(e =>
      e.entryName.toLowerCase().endsWith('.sql')
    )

    if (sqlEntries.length === 1) {
      const sqlEntry = sqlEntries[0]
      const sqlFilename = path.basename(sqlEntry.entryName)

      // Check if filename matches new app backup pattern
      if (NEW_APP_BACKUP_PATTERN.test(sqlFilename)) {
        // This is a new Next.js app backup
        zip.extractAllTo(tempDir, true)
        const extractedPath = path.join(tempDir, sqlEntry.entryName)

        return {
          success: true,
          sqlFiles: [
            {
              table: 'combined',
              path: extractedPath,
              filename: sqlFilename,
            },
          ],
          tempDir,
          backupType: 'nextjs',
          backupSourceDescription:
            'Next.js PPDB backup (combined mysqldump format)',
        }
      }
    }

    // Not a new app backup, extract and search for SQL files
    zip.extractAllTo(tempDir, true)

    // Find backup folder or SQL files (legacy format)
    const result = await findSqlFilesInDir(tempDir)

    // Determine backup type based on what we found
    if (result.success && result.sqlFiles) {
      const expectedFiles: readonly string[] = EXPECTED_SQL_FILES
      const hasPerTableFiles = result.sqlFiles.some(f =>
        expectedFiles.includes(f.filename.toLowerCase())
      )
      if (hasPerTableFiles) {
        result.backupType = 'legacy'
        result.backupSourceDescription =
          'Legacy PHP PPDB backup (per-table SQL files)'
      } else if (result.sqlFiles.length === 1) {
        result.backupType = 'unknown'
        result.backupSourceDescription = 'Generic SQL backup file'
      } else {
        result.backupType = 'unknown'
        result.backupSourceDescription = 'Unknown backup format'
      }
    }

    return result
  } catch (error) {
    return {
      success: false,
      error: `ZIP extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Extract .tar.gz file and find SQL files
 * Legacy PPDB backups are always in tar.gz format with per-table SQL files
 */
async function extractTarGz(
  tarPath: string,
  tempDir: string
): Promise<ExtractResult> {
  try {
    // Extract all files to temp directory
    await tar.extract({
      file: tarPath,
      cwd: tempDir,
    })

    // Find backup folder or SQL files
    const result = await findSqlFilesInDir(tempDir)

    // tar.gz backups are always legacy format
    if (result.success) {
      result.backupType = 'legacy'
      result.backupSourceDescription =
        'Legacy PHP PPDB backup (per-table SQL files)'
    }

    return result
  } catch (error) {
    return {
      success: false,
      error: `TAR extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Find SQL files in extracted directory
 * Handles both legacy nested structure and flat structure
 */
async function findSqlFilesInDir(baseDir: string): Promise<ExtractResult> {
  // First, try to find legacy PPDB backup folder structure
  for (const backupPath of LEGACY_BACKUP_PATHS) {
    const fullBackupPath = path.join(baseDir, backupPath)
    try {
      const stat = await fs.stat(fullBackupPath)
      if (stat.isDirectory()) {
        const sqlFiles = await collectSqlFilesFromDir(fullBackupPath)
        if (sqlFiles.length > 0) {
          return {
            success: true,
            sqlFiles,
            tempDir: baseDir,
            backupPath: fullBackupPath,
          }
        }
      }
    } catch {
      // Path doesn't exist, continue checking
    }
  }

  // Fallback: recursively search for SQL files
  const sqlFiles = await findAllSqlFiles(baseDir)

  if (sqlFiles.length === 0) {
    return {
      success: false,
      error:
        'No SQL files found in archive. Expected: breed.sql, customer.sql, animal.sql, notes.sql',
    }
  }

  return {
    success: true,
    sqlFiles,
    tempDir: baseDir,
  }
}

/**
 * Collect SQL files from a specific directory (non-recursive)
 */
async function collectSqlFilesFromDir(dir: string): Promise<SqlFileInfo[]> {
  const sqlFiles: SqlFileInfo[] = []

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      if (!entry.isDirectory() && entry.name.toLowerCase().endsWith('.sql')) {
        const tableName = entry.name.toLowerCase().replace('.sql', '')
        sqlFiles.push({
          table: tableName,
          path: path.join(dir, entry.name),
          filename: entry.name,
        })
      }
    }
  } catch {
    // Directory read failed
  }

  return sqlFiles
}

/**
 * Recursively find all SQL files in directory
 */
async function findAllSqlFiles(dir: string): Promise<SqlFileInfo[]> {
  const sqlFiles: SqlFileInfo[] = []

  async function recurse(currentDir: string): Promise<void> {
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name)

        if (entry.isDirectory()) {
          await recurse(fullPath)
        } else if (entry.name.toLowerCase().endsWith('.sql')) {
          const tableName = entry.name.toLowerCase().replace('.sql', '')
          sqlFiles.push({
            table: tableName,
            path: fullPath,
            filename: entry.name,
          })
        }
      }
    } catch {
      // Skip directories we can't read
    }
  }

  await recurse(dir)
  return sqlFiles
}

/**
 * Get SQL files in the correct import order (respects FK dependencies)
 * Order: breed → customer → animal → notes
 */
export function getSqlFilesInOrder(files: SqlFileInfo[]): SqlFileInfo[] {
  const order = ['breed', 'customer', 'animal', 'notes']
  const ordered: SqlFileInfo[] = []

  for (const tableName of order) {
    const file = files.find(f => f.table === tableName)
    if (file) {
      ordered.push(file)
    }
  }

  // Add any other SQL files that weren't in our expected list
  for (const file of files) {
    if (!order.includes(file.table) && file.table !== 'combined') {
      ordered.push(file)
    }
  }

  // If there's a combined file, it should be first (and only)
  const combined = files.find(f => f.table === 'combined')
  if (combined && ordered.length === 0) {
    return [combined]
  }

  return ordered
}

/**
 * Clean up temporary extraction directory
 */
export async function cleanupTempDir(tempDir: string): Promise<void> {
  try {
    await fs.rm(tempDir, { recursive: true, force: true })
  } catch {
    // Ignore cleanup errors
  }
}

/**
 * Validate uploaded file type
 */
export function isValidFileType(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase()
  const name = filename.toLowerCase()
  return (
    ['.sql', '.zip', '.gz', '.tgz'].includes(ext) || name.endsWith('.tar.gz')
  )
}

/**
 * Get file type description for display
 */
export function getFileTypeDescription(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  const name = filename.toLowerCase()
  if (ext === '.sql') return 'SQL file'
  if (ext === '.zip') return 'ZIP archive'
  if (ext === '.gz' || ext === '.tgz' || name.endsWith('.tar.gz'))
    return 'TAR.GZ archive'
  return 'Unknown'
}
