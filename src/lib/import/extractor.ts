// src/lib/import/extractor.ts
// Archive extraction utility for .zip and .tar.gz files
// Handles legacy PPDB backup structure with nested folders and per-table SQL files

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

    // Plain .sql file - assume it's a combined dump
    if (ext === '.sql') {
      return {
        success: true,
        sqlFiles: [
          {
            table: 'combined',
            path: filePath,
            filename: path.basename(filePath),
          },
        ],
        tempDir,
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
 */
async function extractZip(
  zipPath: string,
  tempDir: string
): Promise<ExtractResult> {
  try {
    const zip = new AdmZip(zipPath)
    zip.extractAllTo(tempDir, true)

    // Find backup folder or SQL files
    return await findSqlFilesInDir(tempDir)
  } catch (error) {
    return {
      success: false,
      error: `ZIP extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Extract .tar.gz file and find SQL files
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
    return await findSqlFilesInDir(tempDir)
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
