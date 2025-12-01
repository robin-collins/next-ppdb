// src/lib/import/extractor.ts
// Archive extraction utility for .zip and .tar.gz files

import AdmZip from 'adm-zip'
import * as tar from 'tar'
import * as fs from 'fs/promises'
import * as path from 'path'

export interface ExtractResult {
  success: boolean
  sqlFilePath?: string
  originalFilename?: string
  error?: string
  tempDir?: string
}

/**
 * Extract archive and find .sql file
 * Supports: .sql (passthrough), .zip, .tar.gz, .tgz
 */
export async function extractSqlFile(
  filePath: string,
  tempDir: string
): Promise<ExtractResult> {
  const ext = path.extname(filePath).toLowerCase()

  try {
    // Plain .sql file - just return the path
    if (ext === '.sql') {
      return {
        success: true,
        sqlFilePath: filePath,
        originalFilename: path.basename(filePath),
        tempDir,
      }
    }

    // Create temp directory for extraction
    await fs.mkdir(tempDir, { recursive: true })

    // Handle .zip files
    if (ext === '.zip') {
      return await extractZip(filePath, tempDir)
    }

    // Handle .tar.gz and .tgz files
    if (ext === '.gz' || ext === '.tgz') {
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
 * Extract ZIP file and find .sql file
 */
async function extractZip(
  zipPath: string,
  tempDir: string
): Promise<ExtractResult> {
  try {
    const zip = new AdmZip(zipPath)
    const entries = zip.getEntries()

    // Find .sql file in archive
    const sqlEntry = entries.find(
      entry =>
        !entry.isDirectory && entry.entryName.toLowerCase().endsWith('.sql')
    )

    if (!sqlEntry) {
      return {
        success: false,
        error: 'No .sql file found in ZIP archive',
      }
    }

    // Extract just the SQL file
    const extractedPath = path.join(tempDir, path.basename(sqlEntry.entryName))
    zip.extractEntryTo(sqlEntry, tempDir, false, true)

    // Rename if needed to match basename
    const actualPath = path.join(tempDir, sqlEntry.entryName)
    if (actualPath !== extractedPath) {
      try {
        await fs.rename(actualPath, extractedPath)
      } catch {
        // If rename fails, the file might already be at extractedPath
      }
    }

    return {
      success: true,
      sqlFilePath: extractedPath,
      originalFilename: path.basename(sqlEntry.entryName),
      tempDir,
    }
  } catch (error) {
    return {
      success: false,
      error: `ZIP extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Extract .tar.gz file and find .sql file
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

    // Find .sql file in extracted contents
    const sqlFile = await findSqlFile(tempDir)

    if (!sqlFile) {
      return {
        success: false,
        error: 'No .sql file found in tar.gz archive',
      }
    }

    return {
      success: true,
      sqlFilePath: sqlFile,
      originalFilename: path.basename(sqlFile),
      tempDir,
    }
  } catch (error) {
    return {
      success: false,
      error: `TAR extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Recursively find .sql file in directory
 */
async function findSqlFile(dir: string): Promise<string | null> {
  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      const found = await findSqlFile(fullPath)
      if (found) return found
    } else if (entry.name.toLowerCase().endsWith('.sql')) {
      return fullPath
    }
  }

  return null
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
  return ['.sql', '.zip', '.gz', '.tgz'].includes(ext)
}

/**
 * Get file type description for display
 */
export function getFileTypeDescription(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  switch (ext) {
    case '.sql':
      return 'SQL file'
    case '.zip':
      return 'ZIP archive'
    case '.gz':
    case '.tgz':
      return 'TAR.GZ archive'
    default:
      return 'Unknown'
  }
}
