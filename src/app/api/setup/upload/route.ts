// src/app/api/setup/upload/route.ts
// File upload handler for database backup import

import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid'
import {
  extractSqlFile,
  isValidFileType,
  getFileTypeDescription,
} from '@/lib/import/extractor'

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'setup')

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!isValidFileType(file.name)) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported: .sql, .zip, .tar.gz, .tgz' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        },
        { status: 400 }
      )
    }

    // Generate unique upload ID
    const uploadId = uuidv4()
    const uploadDir = path.join(UPLOAD_DIR, uploadId)
    const tempDir = path.join(uploadDir, 'extracted')

    // Create upload directory
    await mkdir(uploadDir, { recursive: true })

    // Save uploaded file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const uploadedFilePath = path.join(uploadDir, file.name)
    await writeFile(uploadedFilePath, buffer)

    // Extract SQL file
    const extractResult = await extractSqlFile(uploadedFilePath, tempDir)

    if (!extractResult.success) {
      return NextResponse.json(
        { error: extractResult.error || 'Failed to extract SQL file' },
        { status: 400 }
      )
    }

    // Basic validation - check if it looks like a valid SQL file
    // (We'll do more thorough validation during import)

    return NextResponse.json({
      success: true,
      uploadId,
      filename: file.name,
      fileType: getFileTypeDescription(file.name),
      size: file.size,
      sqlFile: extractResult.sqlFilePath,
      originalSqlFilename: extractResult.originalFilename,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
