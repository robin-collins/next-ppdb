// src/app/api/setup/import/route.ts
// Server-Sent Events (SSE) endpoint for database import with progress streaming
// Handles legacy PPDB backup structure with per-table SQL files

import { NextRequest } from 'next/server'
import * as path from 'path'
import * as fs from 'fs/promises'
import { exec } from 'child_process'
import { promisify } from 'util'
import {
  createTempDatabase,
  importSqlFilesToTempDb,
  importSqlToTempDb,
  createTempPrismaClient,
  getTempDbCounts,
  cleanupTempDb,
} from '@/lib/setup/tempDb'

const execAsync = promisify(exec)
import {
  importBreedsRaw,
  importCustomersRaw,
  importAnimalsRaw,
  importNotesRaw,
  getImportLogDir,
} from '@/lib/import/rawImporter'
import {
  writeImportSummary,
  type ImportSummary,
} from '@/lib/import/importLogger'
import {
  cleanupTempDir,
  SqlFileInfo,
  getSqlFilesInOrder,
} from '@/lib/import/extractor'
import { clearDiagnosticCache } from '@/lib/diagnostics'
import { PrismaClient } from '@/generated/prisma'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'setup')

// Metadata file saved by upload route
interface UploadMetadata {
  sqlFiles: SqlFileInfo[]
  backupPath?: string
}

export async function GET(request: NextRequest) {
  const uploadId = request.nextUrl.searchParams.get('uploadId')

  if (!uploadId) {
    return new Response(JSON.stringify({ error: 'Missing uploadId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Verify upload exists
  const uploadDir = path.join(UPLOAD_DIR, uploadId)
  const extractedDir = path.join(uploadDir, 'extracted')

  try {
    await fs.access(uploadDir)
  } catch {
    return new Response(JSON.stringify({ error: 'Upload not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Try to find SQL files - either from metadata or by scanning
  let sqlFiles: SqlFileInfo[] = []

  // First, try to read metadata file if it exists
  try {
    const metadataPath = path.join(uploadDir, 'metadata.json')
    const metadataContent = await fs.readFile(metadataPath, 'utf-8')
    const metadata: UploadMetadata = JSON.parse(metadataContent)
    sqlFiles = metadata.sqlFiles
  } catch {
    // No metadata file, scan for SQL files
    sqlFiles = await findSqlFiles(uploadDir, extractedDir)
  }

  if (sqlFiles.length === 0) {
    return new Response(JSON.stringify({ error: 'No SQL files found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Sort files in correct import order
  const orderedFiles = getSqlFilesInOrder(sqlFiles)

  console.log(
    `[Import] Starting import with ${orderedFiles.length} SQL files:`,
    orderedFiles.map(f => f.filename)
  )

  // Create SSE stream
  const encoder = new TextEncoder()
  let tempPrisma: PrismaClient | null = null
  let tempDbName: string | null = null

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: object) => {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
        controller.enqueue(encoder.encode(message))
      }

      try {
        // Track import start time for summary report
        const importStartTime = new Date()

        // Phase 1: Create temp database
        send('progress', {
          phase: 'creating_temp_db',
          message: 'Creating temporary database...',
        })

        const tempDb = await createTempDatabase()
        tempDbName = tempDb.name
        tempPrisma = createTempPrismaClient(tempDb.connectionUrl)

        send('log', {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `Temporary database created: ${tempDbName}`,
        })

        // Phase 2: Import SQL files to temp DB
        send('progress', {
          phase: 'importing_temp',
          message: `Importing ${orderedFiles.length} SQL files to temporary database...`,
        })

        // Check if we have multiple per-table files or a single combined file
        const isCombinedFile =
          orderedFiles.length === 1 && orderedFiles[0].table === 'combined'

        if (isCombinedFile) {
          // Single combined SQL file
          await importSqlToTempDb(tempDbName, orderedFiles[0].path, msg => {
            send('log', {
              timestamp: new Date().toISOString(),
              level: 'info',
              message: msg,
            })
          })
        } else {
          // Multiple per-table SQL files
          await importSqlFilesToTempDb(
            tempDbName,
            orderedFiles,
            (msg, current, total) => {
              send('log', {
                timestamp: new Date().toISOString(),
                level: 'info',
                message: msg,
              })
              send('sql_progress', {
                current,
                total,
                message: msg,
              })
            }
          )
        }

        // Get record counts from temp DB
        const counts = await getTempDbCounts(tempPrisma)
        send('log', {
          timestamp: new Date().toISOString(),
          level: 'success',
          message: `Found records: breeds=${counts.breed}, customers=${counts.customer}, animals=${counts.animal}, notes=${counts.notes}`,
        })

        // Phase 2.5: Ensure production database has tables
        send('progress', {
          phase: 'creating_schema',
          message: 'Creating production database tables...',
        })

        try {
          // Run prisma db push to create tables in production DB
          await execAsync('npx prisma db push --skip-generate', {
            cwd: process.cwd(),
            env: { ...process.env },
          })
          send('log', {
            timestamp: new Date().toISOString(),
            level: 'success',
            message: 'Production database schema created successfully',
          })
        } catch (schemaError) {
          // Tables might already exist, which is fine
          send('log', {
            timestamp: new Date().toISOString(),
            level: 'warning',
            message: `Schema push: ${schemaError instanceof Error ? schemaError.message : 'Unknown error'}`,
          })
        }

        // Create log directory for this import session
        const logDir = getImportLogDir()
        send('log', {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `Import logs will be saved to: ${logDir}`,
        })

        // Phase 3: Import breeds to production (using raw SQL reader)
        send('progress', {
          phase: 'importing_breeds',
          currentTable: 'breed',
          message: `Importing ${counts.breed} breeds...`,
        })

        const breedResult = await importBreedsRaw(
          tempDbName,
          logDir,
          (current, total) => {
            send('batch', {
              table: 'breed',
              processed: current,
              total: total,
              valid: 0,
              repaired: 0,
              skipped: 0,
            })
          }
        )

        // Send final stats for this table
        send('batch', {
          table: 'breed',
          processed: breedResult.stats.total,
          total: breedResult.stats.total,
          valid: breedResult.stats.imported,
          repaired: breedResult.stats.repaired,
          skipped: breedResult.stats.skipped,
        })

        send('log', {
          timestamp: new Date().toISOString(),
          level: breedResult.stats.failed > 0 ? 'warning' : 'success',
          message: `Breeds: ${breedResult.stats.imported} imported, ${breedResult.stats.repaired} repaired, ${breedResult.stats.skipped} skipped, ${breedResult.stats.failed} failed`,
        })

        send('table_complete', {
          table: 'breed',
          stats: breedResult.stats,
        })

        // Phase 4: Import customers (using raw SQL reader)
        send('progress', {
          phase: 'importing_customers',
          currentTable: 'customer',
          message: `Importing ${counts.customer} customers...`,
        })

        const customerResult = await importCustomersRaw(
          tempDbName,
          logDir,
          (current, total) => {
            send('batch', {
              table: 'customer',
              processed: current,
              total: total,
              valid: 0,
              repaired: 0,
              skipped: 0,
            })
          }
        )

        // Send final stats for this table
        send('batch', {
          table: 'customer',
          processed: customerResult.stats.total,
          total: customerResult.stats.total,
          valid: customerResult.stats.imported,
          repaired: customerResult.stats.repaired,
          skipped: customerResult.stats.skipped,
        })

        send('log', {
          timestamp: new Date().toISOString(),
          level: customerResult.stats.failed > 0 ? 'warning' : 'success',
          message: `Customers: ${customerResult.stats.imported} imported, ${customerResult.stats.repaired} repaired, ${customerResult.stats.skipped} skipped, ${customerResult.stats.failed} failed`,
        })

        send('table_complete', {
          table: 'customer',
          stats: customerResult.stats,
        })

        // Phase 5: Import animals (using raw SQL reader)
        send('progress', {
          phase: 'importing_animals',
          currentTable: 'animal',
          message: `Importing ${counts.animal} animals...`,
        })

        const animalResult = await importAnimalsRaw(
          tempDbName,
          logDir,
          breedResult.idMap,
          customerResult.idMap,
          (current, total) => {
            send('batch', {
              table: 'animal',
              processed: current,
              total: total,
              valid: 0,
              repaired: 0,
              skipped: 0,
            })
          }
        )

        // Send final stats for this table
        send('batch', {
          table: 'animal',
          processed: animalResult.stats.total,
          total: animalResult.stats.total,
          valid: animalResult.stats.imported,
          repaired: animalResult.stats.repaired,
          skipped: animalResult.stats.skipped,
        })

        send('log', {
          timestamp: new Date().toISOString(),
          level: animalResult.stats.failed > 0 ? 'warning' : 'success',
          message: `Animals: ${animalResult.stats.imported} imported, ${animalResult.stats.repaired} repaired, ${animalResult.stats.skipped} skipped, ${animalResult.stats.failed} failed`,
        })

        send('table_complete', {
          table: 'animal',
          stats: animalResult.stats,
        })

        // Phase 6: Import notes (using raw SQL reader)
        send('progress', {
          phase: 'importing_notes',
          currentTable: 'notes',
          message: `Importing ${counts.notes} notes...`,
        })

        const notesResult = await importNotesRaw(
          tempDbName,
          logDir,
          animalResult.idMap,
          (current, total) => {
            send('batch', {
              table: 'notes',
              processed: current,
              total: total,
              valid: 0,
              repaired: 0,
              skipped: 0,
            })
          }
        )

        // Send final stats for this table
        send('batch', {
          table: 'notes',
          processed: notesResult.stats.total,
          total: notesResult.stats.total,
          valid: notesResult.stats.imported,
          repaired: notesResult.stats.repaired,
          skipped: notesResult.stats.skipped,
        })

        send('log', {
          timestamp: new Date().toISOString(),
          level: notesResult.stats.failed > 0 ? 'warning' : 'success',
          message: `Notes: ${notesResult.stats.imported} imported, ${notesResult.stats.repaired} repaired, ${notesResult.stats.skipped} skipped, ${notesResult.stats.failed} failed`,
        })

        send('table_complete', {
          table: 'notes',
          stats: notesResult.stats,
        })

        // Cleanup
        send('progress', {
          phase: 'cleanup',
          message: 'Cleaning up temporary resources...',
        })

        await cleanupTempDb(tempPrisma, tempDbName)
        await cleanupTempDir(uploadDir)

        // Clear diagnostic cache so next health check shows success
        clearDiagnosticCache()

        // Complete - calculate duration and write summary
        const importEndTime = new Date()
        const durationMs = importEndTime.getTime() - importStartTime.getTime()
        const durationStr = `${Math.floor(durationMs / 60000)}m ${Math.floor((durationMs % 60000) / 1000)}s`

        const totalStats = {
          breeds: breedResult.stats,
          customers: customerResult.stats,
          animals: animalResult.stats,
          notes: notesResult.stats,
        }

        // Write summary report
        const summary: ImportSummary = {
          breeds: breedResult.stats,
          customers: customerResult.stats,
          animals: animalResult.stats,
          notes: notesResult.stats,
          startTime: importStartTime.toISOString(),
          endTime: importEndTime.toISOString(),
          duration: durationStr,
        }

        const summaryPath = await writeImportSummary(logDir, summary)

        send('log', {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `Import logs saved to: ${logDir}`,
        })

        send('log', {
          timestamp: new Date().toISOString(),
          level: 'success',
          message: `Summary report: ${summaryPath}`,
        })

        send('complete', {
          success: true,
          stats: totalStats,
          logDir: logDir,
          summaryPath: summaryPath,
          message: 'Database import completed successfully!',
        })
      } catch (error) {
        console.error('[Import] Error:', error)
        send('error', {
          message: error instanceof Error ? error.message : 'Import failed',
        })

        // Cleanup on error
        if (tempPrisma || tempDbName) {
          await cleanupTempDb(tempPrisma, tempDbName).catch(() => {})
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

/**
 * Find SQL files in upload directory by scanning
 */
async function findSqlFiles(
  uploadDir: string,
  extractedDir: string
): Promise<SqlFileInfo[]> {
  const sqlFiles: SqlFileInfo[] = []

  // Known legacy backup paths to check
  const legacyPaths = [
    path.join(extractedDir, 'srv/www/htdocs/ppdb/backup'),
    path.join(extractedDir, 'var/www/html/ppdb/backup'),
    path.join(extractedDir, 'backup'),
    extractedDir,
    uploadDir,
  ]

  for (const dir of legacyPaths) {
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
      if (sqlFiles.length > 0) {
        break // Found files, stop searching
      }
    } catch {
      // Directory doesn't exist, continue
    }
  }

  // If still no files, do recursive search
  if (sqlFiles.length === 0) {
    await findSqlFilesRecursive(uploadDir, sqlFiles)
  }

  return sqlFiles
}

/**
 * Recursively find SQL files
 */
async function findSqlFilesRecursive(
  dir: string,
  results: SqlFileInfo[]
): Promise<void> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        await findSqlFilesRecursive(fullPath, results)
      } else if (entry.name.toLowerCase().endsWith('.sql')) {
        const tableName = entry.name.toLowerCase().replace('.sql', '')
        results.push({
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
