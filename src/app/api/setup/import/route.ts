// src/app/api/setup/import/route.ts
// Server-Sent Events (SSE) endpoint for database import with progress streaming

import { NextRequest } from 'next/server'
import * as path from 'path'
import * as fs from 'fs/promises'
import {
  createTempDatabase,
  importSqlToTempDb,
  createTempPrismaClient,
  getTempDbCounts,
  cleanupTempDb,
} from '@/lib/setup/tempDb'
import {
  importBreeds,
  importCustomers,
  importAnimals,
  importNotes,
} from '@/lib/import/importer'
import { cleanupTempDir } from '@/lib/import/extractor'
import { clearDiagnosticCache } from '@/lib/diagnostics'
import { PrismaClient } from '@/generated/prisma'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'setup')

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

  // Find SQL file
  let sqlFilePath: string | null = null
  try {
    const files = await fs.readdir(uploadDir)
    for (const file of files) {
      if (file.endsWith('.sql')) {
        sqlFilePath = path.join(uploadDir, file)
        break
      }
    }
    if (!sqlFilePath) {
      const extractedFiles = await fs.readdir(extractedDir).catch(() => [])
      for (const file of extractedFiles) {
        if (file.endsWith('.sql')) {
          sqlFilePath = path.join(extractedDir, file)
          break
        }
      }
    }
  } catch {
    // Continue to find SQL file recursively
  }

  if (!sqlFilePath) {
    // Try to find recursively
    const findSql = async (dir: string): Promise<string | null> => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true })
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name)
          if (entry.isDirectory()) {
            const found = await findSql(fullPath)
            if (found) return found
          } else if (entry.name.endsWith('.sql')) {
            return fullPath
          }
        }
      } catch {
        // Ignore errors
      }
      return null
    }
    sqlFilePath = await findSql(uploadDir)
  }

  if (!sqlFilePath) {
    return new Response(JSON.stringify({ error: 'SQL file not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

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

        // Phase 2: Import SQL to temp DB
        send('progress', {
          phase: 'importing_temp',
          message: 'Importing SQL file to temporary database...',
        })

        await importSqlToTempDb(tempDbName, sqlFilePath!, msg => {
          send('log', {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: msg,
          })
        })

        // Get record counts from temp DB
        const counts = await getTempDbCounts(tempPrisma)
        send('log', {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `Found records: breeds=${counts.breed}, customers=${counts.customer}, animals=${counts.animal}, notes=${counts.notes}`,
        })

        // Phase 3: Import breeds
        send('progress', {
          phase: 'importing_breeds',
          currentTable: 'breed',
          message: `Importing ${counts.breed} breeds...`,
        })

        const breedResult = await importBreeds(tempPrisma, progress => {
          send('batch', {
            table: 'breed',
            processed: progress.stats.processedRecords,
            total: progress.stats.totalRecords,
            valid: progress.stats.validRecords,
            repaired: progress.stats.repairedRecords,
            skipped: progress.stats.skippedRecords,
          })
          for (const log of progress.logs) {
            send('log', log)
          }
        })

        send('table_complete', {
          table: 'breed',
          stats: breedResult.stats,
        })

        // Phase 4: Import customers
        send('progress', {
          phase: 'importing_customers',
          currentTable: 'customer',
          message: `Importing ${counts.customer} customers...`,
        })

        const customerResult = await importCustomers(tempPrisma, progress => {
          send('batch', {
            table: 'customer',
            processed: progress.stats.processedRecords,
            total: progress.stats.totalRecords,
            valid: progress.stats.validRecords,
            repaired: progress.stats.repairedRecords,
            skipped: progress.stats.skippedRecords,
          })
        })

        send('table_complete', {
          table: 'customer',
          stats: customerResult.stats,
        })

        // Phase 5: Import animals
        send('progress', {
          phase: 'importing_animals',
          currentTable: 'animal',
          message: `Importing ${counts.animal} animals...`,
        })

        const animalResult = await importAnimals(
          tempPrisma,
          breedResult.idMap,
          customerResult.idMap,
          progress => {
            send('batch', {
              table: 'animal',
              processed: progress.stats.processedRecords,
              total: progress.stats.totalRecords,
              valid: progress.stats.validRecords,
              repaired: progress.stats.repairedRecords,
              skipped: progress.stats.skippedRecords,
            })
          }
        )

        send('table_complete', {
          table: 'animal',
          stats: animalResult.stats,
        })

        // Phase 6: Import notes
        send('progress', {
          phase: 'importing_notes',
          currentTable: 'notes',
          message: `Importing ${counts.notes} notes...`,
        })

        const notesResult = await importNotes(
          tempPrisma,
          animalResult.idMap,
          progress => {
            send('batch', {
              table: 'notes',
              processed: progress.stats.processedRecords,
              total: progress.stats.totalRecords,
              valid: progress.stats.validRecords,
              repaired: progress.stats.repairedRecords,
              skipped: progress.stats.skippedRecords,
            })
          }
        )

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

        // Complete
        const totalStats = {
          breeds: breedResult.stats,
          customers: customerResult.stats,
          animals: animalResult.stats,
          notes: notesResult.stats,
        }

        send('complete', {
          success: true,
          stats: totalStats,
          message: 'Database import completed successfully!',
        })
      } catch (error) {
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
