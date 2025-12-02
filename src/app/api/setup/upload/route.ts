// src/app/api/setup/upload/route.ts
// File upload handler for database backup import
// Handles legacy PPDB backup archives with per-table SQL files

import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid'
import {
  extractSqlFile,
  isValidFileType,
  getFileTypeDescription,
  getSqlFilesInOrder,
  SqlFileInfo,
} from '@/lib/import/extractor'

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'setup')

export interface UploadResponse {
  success: boolean
  uploadId: string
  filename: string
  fileType: string
  size: number
  sqlFiles: SqlFileInfo[]
  backupPath?: string
  error?: string
}

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

    // Extract SQL files
    const extractResult = await extractSqlFile(uploadedFilePath, tempDir)

    if (!extractResult.success || !extractResult.sqlFiles) {
      return NextResponse.json(
        { error: extractResult.error || 'Failed to extract SQL files' },
        { status: 400 }
      )
    }

    // Get files in correct import order (breed → customer → animal → notes)
    const orderedFiles = getSqlFilesInOrder(extractResult.sqlFiles)

    // Log found files for debugging
    console.log(
      `[Upload] Found ${orderedFiles.length} SQL files:`,
      orderedFiles.map(f => f.filename)
    )

    // Save metadata for import route
    const metadata = {
      sqlFiles: orderedFiles,
      backupPath: extractResult.backupPath,
    }
    await writeFile(
      path.join(uploadDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    )

    const response: UploadResponse = {
      success: true,
      uploadId,
      filename: file.name,
      fileType: getFileTypeDescription(file.name),
      size: file.size,
      sqlFiles: orderedFiles,
      backupPath: extractResult.backupPath,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
