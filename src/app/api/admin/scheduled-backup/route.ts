/**
 * Scheduled Backup Endpoint
 *
 * Triggered by the scheduler container to perform nightly backups.
 * Creates backup, generates report, and sends email notification.
 */

import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs/promises'
import * as path from 'path'
import archiver from 'archiver'
import { createWriteStream } from 'fs'
import { log, logError } from '@/lib/logger'
import { validateSchedulerAuth } from '@/lib/scheduler-auth'
import { sendEmail } from '@/lib/email'
import {
  backupSuccessTemplate,
  backupFailureTemplate,
} from '@/lib/email-templates'
import { emailQueue } from '@/lib/email-queue'
import { notificationStore } from '@/lib/notification-store'
import { getMysqlSslFlags } from '@/lib/mysql-utils'

const execAsync = promisify(exec)

const BACKUP_DIR = path.join(process.cwd(), 'backups')
const MAX_BACKUPS = 5

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

async function ensureBackupDir() {
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true })
  } catch {
    // Directory already exists
  }
}

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

export async function POST(request: Request) {
  // Validate scheduler authentication
  if (!validateSchedulerAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()
  const emailTo = process.env.BACKUP_NOTIFICATION_EMAIL

  try {
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
      throw new Error('DATABASE_URL not configured')
    }

    const db = parseDbUrl(dbUrl)
    const timestamp = getTimestamp()
    const sqlFilename = `${timestamp}-backup.sql`
    const zipFilename = `${timestamp}-backup.zip`

    await ensureBackupDir()

    const sqlPath = path.join(BACKUP_DIR, sqlFilename)
    const zipPath = path.join(BACKUP_DIR, zipFilename)

    log.info('ScheduledBackup: Starting backup', { timestamp })

    // Use mysqldump to create SQL dump
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
      throw dumpErr
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

    const duration = Date.now() - startTime

    log.info('ScheduledBackup: Backup completed', {
      filename: zipFilename,
      sqlSize: sqlStats.size,
      zipSize: zipStats.size,
      duration,
    })

    // Create notification
    await notificationStore.create({
      type: 'success',
      title: 'Backup Completed',
      message: `Database backup ${zipFilename} created successfully (${(zipStats.size / 1024 / 1024).toFixed(2)} MB)`,
      source: 'backup',
      metadata: {
        filename: zipFilename,
        sqlSize: sqlStats.size,
        zipSize: zipStats.size,
        duration,
      },
    })

    // Send success email
    let emailStatus: {
      sent: boolean
      to?: string
      error?: string
      queued?: boolean
    } = { sent: false }

    if (emailTo) {
      const template = backupSuccessTemplate({
        filename: zipFilename,
        timestamp: new Date().toISOString(),
        sqlSize: sqlStats.size,
        zipSize: zipStats.size,
        downloadUrl: `/api/admin/backup/download/${zipFilename}`,
      })

      const emailResult = await sendEmail({
        to: emailTo,
        subject: `[PPDB] Backup Completed: ${zipFilename}`,
        html: template.html,
        text: template.text,
        attachments: [
          {
            filename: zipFilename,
            path: zipPath,
          },
        ],
      })

      if (emailResult.success) {
        emailStatus = { sent: true, to: emailTo }
      } else {
        // Queue for retry
        await emailQueue.enqueue({
          to: emailTo,
          subject: `[PPDB] Backup Completed: ${zipFilename}`,
          html: template.html,
          text: template.text,
          // Note: Attachment might be large, so we skip it for retry
        })
        emailStatus = {
          sent: false,
          to: emailTo,
          error: emailResult.error,
          queued: true,
        }
      }
    } else {
      emailStatus = {
        sent: false,
        error: 'No email recipient configured (BACKUP_NOTIFICATION_EMAIL)',
      }
    }

    return NextResponse.json({
      success: true,
      filename: zipFilename,
      timestamp,
      sqlSize: sqlStats.size,
      zipSize: zipStats.size,
      duration,
      downloadUrl: `/api/admin/backup/download/${zipFilename}`,
      email: emailStatus,
    })
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Backup failed'
    const duration = Date.now() - startTime

    logError('ScheduledBackup: Backup failed', err)

    // Create notification
    await notificationStore.create({
      type: 'error',
      title: 'Backup Failed',
      message: `Database backup failed: ${error}`,
      source: 'backup',
      metadata: { error, duration },
    })

    // Send failure email
    if (emailTo) {
      const template = backupFailureTemplate({
        error,
        timestamp: new Date().toISOString(),
        details: err instanceof Error ? err.stack : undefined,
      })

      const emailResult = await sendEmail({
        to: emailTo,
        subject: `[PPDB] Backup FAILED`,
        html: template.html,
        text: template.text,
      })

      if (!emailResult.success) {
        await emailQueue.enqueue({
          to: emailTo,
          subject: `[PPDB] Backup FAILED`,
          html: template.html,
          text: template.text,
        })
      }
    }

    return NextResponse.json({ error, duration }, { status: 500 })
  }
}
