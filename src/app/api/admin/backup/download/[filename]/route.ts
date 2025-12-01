// src/app/api/admin/backup/download/[filename]/route.ts - Download backup file
import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs/promises'
import { createReadStream, existsSync } from 'fs'
import * as path from 'path'

const BACKUP_DIR = path.join(process.cwd(), 'backups')

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params

    // Validate filename format to prevent directory traversal
    if (!filename.match(/^\d{8}-\d{6}-backup\.zip$/)) {
      return NextResponse.json(
        { error: 'Invalid filename format' },
        { status: 400 }
      )
    }

    const filePath = path.join(BACKUP_DIR, filename)

    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Backup file not found' },
        { status: 404 }
      )
    }

    // Get file stats for Content-Length
    const stats = await fs.stat(filePath)

    // Create a readable stream
    const stream = createReadStream(filePath)

    // Convert Node.js stream to Web ReadableStream
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', chunk => {
          controller.enqueue(chunk)
        })
        stream.on('end', () => {
          controller.close()
        })
        stream.on('error', err => {
          controller.error(err)
        })
      },
      cancel() {
        stream.destroy()
      },
    })

    // Return file with appropriate headers
    return new NextResponse(webStream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    console.error('Download error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Download failed' },
      { status: 500 }
    )
  }
}
