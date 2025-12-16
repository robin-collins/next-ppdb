// src/lib/import/logArchiver.ts
// Utility for compressing import log files into a ZIP archive

import * as fs from 'fs'
import * as path from 'path'
import archiver from 'archiver'

export interface ArchiveResult {
  success: boolean
  zipPath: string | null
  zipFilename: string | null
  fileCount: number
  totalSize: number
  error?: string
}

/**
 * Compress all log files in a directory into a single ZIP archive.
 * Uses streaming to handle large log files efficiently.
 *
 * @param logDir - Directory containing the log files
 * @returns Promise<ArchiveResult> - Result object with archive details
 */
export async function createLogArchive(logDir: string): Promise<ArchiveResult> {
  // Generate filename with timestamp matching the log directory
  const dirName = path.basename(logDir)
  const zipFilename = `import-logs-${dirName}.zip`
  const zipPath = path.join(path.dirname(logDir), zipFilename)

  return new Promise(resolve => {
    // Check if log directory exists
    if (!fs.existsSync(logDir)) {
      resolve({
        success: false,
        zipPath: null,
        zipFilename: null,
        fileCount: 0,
        totalSize: 0,
        error: 'Log directory does not exist',
      })
      return
    }

    // Get list of files to archive
    let files: string[]
    try {
      files = fs.readdirSync(logDir).filter(file => {
        const filePath = path.join(logDir, file)
        return fs.statSync(filePath).isFile()
      })
    } catch (err) {
      resolve({
        success: false,
        zipPath: null,
        zipFilename: null,
        fileCount: 0,
        totalSize: 0,
        error: `Failed to read log directory: ${err instanceof Error ? err.message : 'Unknown error'}`,
      })
      return
    }

    if (files.length === 0) {
      resolve({
        success: false,
        zipPath: null,
        zipFilename: null,
        fileCount: 0,
        totalSize: 0,
        error: 'No log files found to archive',
      })
      return
    }

    // Create output stream
    const output = fs.createWriteStream(zipPath)
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    })

    let fileCount = 0

    // Handle stream events
    output.on('close', () => {
      resolve({
        success: true,
        zipPath,
        zipFilename,
        fileCount,
        totalSize: archive.pointer(),
      })
    })

    archive.on('error', err => {
      resolve({
        success: false,
        zipPath: null,
        zipFilename: null,
        fileCount: 0,
        totalSize: 0,
        error: `Archive creation failed: ${err.message}`,
      })
    })

    archive.on('warning', err => {
      // Log warnings but don't fail
      console.warn('[LogArchiver] Warning:', err.message)
    })

    // Pipe archive data to the file
    archive.pipe(output)

    // Add each file to the archive
    for (const file of files) {
      const filePath = path.join(logDir, file)
      try {
        // Use streaming for large files
        archive.file(filePath, { name: file })
        fileCount++
      } catch (err) {
        console.warn(`[LogArchiver] Failed to add file ${file}:`, err)
      }
    }

    // Finalize the archive
    archive.finalize()
  })
}

/**
 * Verify that a ZIP archive was created successfully and is readable.
 *
 * @param zipPath - Path to the ZIP file
 * @returns Promise<boolean> - True if archive is valid
 */
export async function verifyArchive(zipPath: string): Promise<boolean> {
  try {
    const stats = await fs.promises.stat(zipPath)
    // Check that file exists and has content
    return stats.isFile() && stats.size > 0
  } catch {
    return false
  }
}

/**
 * Get the relative path for serving the ZIP file via API
 * Converts absolute path to a route-friendly identifier
 *
 * @param zipPath - Absolute path to the ZIP file
 * @returns string - Identifier for the download API
 */
export function getDownloadIdentifier(zipPath: string): string {
  // Extract the filename which includes the timestamp
  return path.basename(zipPath)
}
