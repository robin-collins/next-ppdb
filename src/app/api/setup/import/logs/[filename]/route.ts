// src/app/api/setup/import/logs/[filename]/route.ts
// Download endpoint for import log ZIP archives

import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Get the logs directory path.
 * Checks multiple possible locations to handle different deployment contexts:
 * 1. process.cwd()/logs/import (standard Next.js development)
 * 2. /app/logs/import (Docker container absolute path)
 */
function getLogsDir(): string {
  const candidates = [
    path.join(process.cwd(), 'logs', 'import'),
    '/app/logs/import', // Docker container path
  ]

  for (const dir of candidates) {
    if (fs.existsSync(dir)) {
      return dir
    }
  }

  // Default to process.cwd() path even if it doesn't exist
  // (error will be handled by the route handler)
  return candidates[0]
}

/**
 * Find the file in possible log directories.
 * Returns the full path if found, null otherwise.
 */
function findLogFile(filename: string): string | null {
  const candidates = [
    path.join(process.cwd(), 'logs', 'import', filename),
    path.join('/app/logs/import', filename),
  ]

  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) {
      return filePath
    }
  }

  return null
}

/**
 * GET /api/setup/import/logs/[filename]
 *
 * Download an import log archive by filename.
 * Only serves .zip files from the logs/import directory.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params

  // Security: Only allow .zip files
  if (!filename.endsWith('.zip')) {
    return NextResponse.json(
      { error: 'Invalid file type. Only ZIP archives are available.' },
      { status: 400 }
    )
  }

  // Security: Prevent directory traversal attacks
  const sanitizedFilename = path.basename(filename)
  if (sanitizedFilename !== filename || filename.includes('..')) {
    return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
  }

  // Find the file in possible locations
  const filePath = findLogFile(sanitizedFilename)
  const logsDir = getLogsDir()

  // Log diagnostic info in debug mode
  if (process.env.DEBUG === 'true') {
    console.log('[Import Logs Download] Debug info:', {
      requestedFilename: filename,
      sanitizedFilename,
      processCwd: process.cwd(),
      logsDir,
      filePath,
      fileExists: filePath ? fs.existsSync(filePath) : false,
    })
  }

  if (!filePath) {
    // Log details for debugging 404 issues
    console.error('[Import Logs Download] File not found:', {
      requestedFilename: filename,
      sanitizedFilename,
      searchedPaths: [
        path.join(process.cwd(), 'logs', 'import', sanitizedFilename),
        path.join('/app/logs/import', sanitizedFilename),
      ],
      processCwd: process.cwd(),
      logsDirExists: fs.existsSync(logsDir),
    })

    return NextResponse.json(
      { error: 'Log archive not found. It may have been deleted or expired.' },
      { status: 404 }
    )
  }

  // Verify file is within a valid logs directory (security check)
  try {
    const realPath = fs.realpathSync(filePath)
    const validLogsDirs = [
      path.join(process.cwd(), 'logs', 'import'),
      '/app/logs/import',
    ]

    let isValidPath = false
    for (const dir of validLogsDirs) {
      if (fs.existsSync(dir)) {
        const logsRealPath = fs.realpathSync(dir)
        if (realPath.startsWith(logsRealPath)) {
          isValidPath = true
          break
        }
      }
    }

    if (!isValidPath) {
      console.error(
        '[Import Logs Download] Access denied - path outside logs directory:',
        {
          realPath,
          validLogsDirs,
        }
      )
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check file exists and get stats
    const stats = fs.statSync(filePath)

    if (!stats.isFile()) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Create readable stream for efficient large file handling
    const fileStream = fs.createReadStream(filePath)

    // Convert Node.js ReadableStream to Web ReadableStream
    const webStream = new ReadableStream({
      start(controller) {
        fileStream.on('data', (chunk: Buffer | string) => {
          if (typeof chunk === 'string') {
            controller.enqueue(new TextEncoder().encode(chunk))
          } else {
            controller.enqueue(new Uint8Array(chunk))
          }
        })
        fileStream.on('end', () => {
          controller.close()
        })
        fileStream.on('error', err => {
          controller.error(err)
        })
      },
      cancel() {
        fileStream.destroy()
      },
    })

    // Return the file as a download
    return new Response(webStream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${sanitizedFilename}"`,
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    // File doesn't exist or other error
    if (
      error instanceof Error &&
      'code' in error &&
      (error as NodeJS.ErrnoException).code === 'ENOENT'
    ) {
      console.error('[Import Logs Download] ENOENT error:', {
        filePath,
        error: error.message,
      })
      return NextResponse.json(
        {
          error: 'Log archive not found. It may have been deleted or expired.',
        },
        { status: 404 }
      )
    }

    console.error('[Import Logs Download] Error:', error)
    return NextResponse.json(
      { error: 'Failed to download log archive' },
      { status: 500 }
    )
  }
}
