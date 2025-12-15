// src/app/api/admin/backup/route.ts - Full database backup implementation
import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs/promises'
import * as path from 'path'
import archiver from 'archiver'
import { createWriteStream } from 'fs'
import { log, logError } from '@/lib/logger'

const execAsync = promisify(exec)

// Backup directory relative to project root
const BACKUP_DIR = path.join(process.cwd(), 'backups')
const MAX_BACKUPS = 5

// Parse DATABASE_URL to extract connection details
function parseDbUrl(url: string) {
  const regex = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/
  const match = url.match(regex)
  if (!match) throw new Error('Invalid DATABASE_URL format')
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: match[4],
    database: match[5],
  }
}

/**
 * Build MySQL client SSL flags compatible with both MySQL and MariaDB clients
 * MariaDB uses --skip-ssl, MySQL 8.0+ uses --ssl-mode=DISABLED
 * Since Debian trixie's default-mysql-client is MariaDB, we use --skip-ssl
 */
function getMysqlSslFlags(): string {
  return '--skip-ssl'
}

// Get timestamp in YYYYMMDD-HHmmss format
function getTimestamp(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  return `${year}${month}${day}-${hours}${minutes}${seconds}`
}

// Ensure backup directory exists
async function ensureBackupDir() {
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true })
  } catch {
    // Directory already exists
  }
}

// Get list of existing backups sorted by date (newest first)
async function getExistingBackups(): Promise<string[]> {
  try {
    const files = await fs.readdir(BACKUP_DIR)
    return files
      .filter(f => f.endsWith('-backup.zip'))
      .sort()
      .reverse()
  } catch {
    return []
  }
}

// Clean up old backups, keeping only MAX_BACKUPS
async function cleanupOldBackups() {
  const backups = await getExistingBackups()
  if (backups.length > MAX_BACKUPS) {
    const toDelete = backups.slice(MAX_BACKUPS)
    for (const file of toDelete) {
      try {
        await fs.unlink(path.join(BACKUP_DIR, file))
        log.debug(`Deleted old backup: ${file}`)
      } catch (err) {
        logError(`Failed to delete backup ${file}`, err)
      }
    }
  }
}

// Create ZIP file from SQL dump
async function createZip(sqlPath: string, zipPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(zipPath)
    const archive = archiver('zip', { zlib: { level: 9 } })

    output.on('close', () => resolve())
    archive.on('error', err => reject(err))

    archive.pipe(output)
    archive.file(sqlPath, { name: path.basename(sqlPath) })
    archive.finalize()
  })
}

// POST /api/admin/backup - Create a new backup
export async function POST() {
  try {
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
      return NextResponse.json(
        { error: 'DATABASE_URL not configured' },
        { status: 500 }
      )
    }

    const db = parseDbUrl(dbUrl)
    const timestamp = getTimestamp()
    const sqlFilename = `${timestamp}-backup.sql`
    const zipFilename = `${timestamp}-backup.zip`

    await ensureBackupDir()

    const sqlPath = path.join(BACKUP_DIR, sqlFilename)
    const zipPath = path.join(BACKUP_DIR, zipFilename)

    // Use mysqldump to create SQL dump (structure + data for all tables)
    // --single-transaction for consistent backup without locking
    // --routines includes stored procedures
    // --triggers includes triggers
    // --events includes scheduled events
    // Note: We don't use --databases flag to avoid CREATE DATABASE/USE statements
    // This allows restoring to any database name for testing
    // --skip-ssl: MariaDB client compatibility (Debian trixie's default-mysql-client)
    const sslFlags = getMysqlSslFlags()
    const mysqldumpCmd = `mysqldump --host=${db.host} --port=${db.port} --user=${db.user} --password='${db.password}' ${sslFlags} --single-transaction --routines --triggers --events ${db.database} > "${sqlPath}"`

    try {
      await execAsync(mysqldumpCmd)
    } catch (dumpErr) {
      // Clean up partial file if exists
      try {
        await fs.unlink(sqlPath)
      } catch {
        /* ignore */
      }
      logError('mysqldump error', dumpErr)
      const errMsg =
        dumpErr instanceof Error ? dumpErr.message : 'Unknown error'
      return NextResponse.json(
        { error: `Database dump failed: ${errMsg}` },
        { status: 500 }
      )
    }

    // Get SQL file size
    const sqlStats = await fs.stat(sqlPath)

    // Create ZIP archive
    await createZip(sqlPath, zipPath)

    // Get ZIP file size
    const zipStats = await fs.stat(zipPath)

    // Remove the uncompressed SQL file
    await fs.unlink(sqlPath)

    // Clean up old backups
    await cleanupOldBackups()

    return NextResponse.json({
      success: true,
      filename: zipFilename,
      timestamp,
      sqlSize: sqlStats.size,
      zipSize: zipStats.size,
      downloadUrl: `/api/admin/backup/download/${zipFilename}`,
    })
  } catch (err) {
    logError('Backup error', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Backup failed' },
      { status: 500 }
    )
  }
}

// GET /api/admin/backup - List available backups
export async function GET() {
  try {
    await ensureBackupDir()
    const backups = await getExistingBackups()

    const backupDetails = await Promise.all(
      backups.map(async filename => {
        const filePath = path.join(BACKUP_DIR, filename)
        const stats = await fs.stat(filePath)
        // Extract timestamp from filename (YYYYMMDD-HHmmss-backup.zip)
        const timestamp = filename.replace('-backup.zip', '')
        return {
          filename,
          timestamp,
          size: stats.size,
          createdAt: stats.birthtime.toISOString(),
          downloadUrl: `/api/admin/backup/download/${filename}`,
        }
      })
    )

    return NextResponse.json({
      backups: backupDetails,
      maxBackups: MAX_BACKUPS,
      backupDir: BACKUP_DIR,
    })
  } catch (err) {
    logError('List backups error', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to list backups' },
      { status: 500 }
    )
  }
}
