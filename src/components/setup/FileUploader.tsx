'use client'

import { useState, useCallback, useRef } from 'react'

/** Backup type detected during file extraction */
type BackupType = 'legacy' | 'nextjs' | 'unknown'

interface SqlFileInfo {
  table: string
  path: string
  filename: string
}

interface UploadResult {
  success: boolean
  uploadId: string
  filename: string
  fileType: string
  size: number
  sqlFiles: SqlFileInfo[]
  backupPath?: string
  /** Detected backup type: 'legacy' (PHP app), 'nextjs' (this app), or 'unknown' */
  backupType?: BackupType
  /** Human-readable description of the backup source */
  backupSourceDescription?: string
}

interface FileUploaderProps {
  onUploadComplete: (result: UploadResult) => void
  onError: (error: string) => void
}

export default function FileUploader({
  onUploadComplete,
  onError,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const validateFile = (file: File): string | null => {
    const validExtensions = ['.sql', '.zip', '.gz', '.tgz']
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))

    if (
      !validExtensions.includes(ext) &&
      !file.name.toLowerCase().endsWith('.tar.gz')
    ) {
      return 'Invalid file type. Supported: .sql, .zip, .tar.gz, .tgz'
    }

    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      return 'File too large. Maximum size: 100MB'
    }

    return null
  }

  const handleFile = useCallback(
    async (file: File) => {
      const error = validateFile(file)
      if (error) {
        onError(error)
        return
      }

      setSelectedFile(file)
      setIsUploading(true)
      setUploadProgress(0)

      try {
        const formData = new FormData()
        formData.append('file', file)

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 10, 90))
        }, 200)

        const response = await fetch('/api/setup/upload', {
          method: 'POST',
          body: formData,
        })

        clearInterval(progressInterval)
        setUploadProgress(100)

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Upload failed')
        }

        const result = await response.json()
        onUploadComplete(result)
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Upload failed')
        setSelectedFile(null)
      } finally {
        setIsUploading(false)
      }
    },
    [onUploadComplete, onError]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleFile(files[0])
      }
    },
    [handleFile]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFile(files[0])
      }
    },
    [handleFile]
  )

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">
        Upload Database Backup
      </h2>
      <p className="text-gray-600">
        Select a database backup file to initialize your application. Supported
        formats: SQL files (.sql) or compressed archives (.zip, .tar.gz).
      </p>

      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'hover:border-primary border-gray-300 hover:bg-gray-50'
        } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".sql,.zip,.gz,.tgz"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="space-y-3">
            <div className="border-t-primary mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200" />
            <p className="font-medium text-gray-700">
              Uploading {selectedFile?.name}...
            </p>
            <div className="mx-auto h-2 max-w-xs overflow-hidden rounded-full bg-gray-200">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500">{uploadProgress}%</p>
          </div>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="font-medium text-gray-700">
              Drag & drop your backup file here
            </p>
            <p className="mt-1 text-sm text-gray-500">or click to browse</p>
            <p className="mt-3 text-xs text-gray-400">
              Supports .sql, .zip, .tar.gz (max 100MB)
            </p>
          </>
        )}
      </div>

      {selectedFile && !isUploading && (
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <svg
            className="text-primary h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <div className="flex-1">
            <p className="font-medium text-gray-800">{selectedFile.name}</p>
            <p className="text-sm text-gray-500">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
