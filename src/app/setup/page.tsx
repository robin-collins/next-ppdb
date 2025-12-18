'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import DiagnosticResults from '@/components/setup/DiagnosticResults'
import FileUploader from '@/components/setup/FileUploader'
import ImportProgress, {
  type LogArchiveInfo,
} from '@/components/setup/ImportProgress'
import { HealthCheckResult } from '@/lib/diagnostics/types'

type WizardStep = 'diagnostics' | 'upload' | 'importing' | 'complete' | 'error'

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

interface ImportStats {
  [table: string]: {
    total: number
    imported: number
    repaired: number
    skipped: number
    failed: number
  }
}

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState<WizardStep>('diagnostics')
  const [health, setHealth] = useState<HealthCheckResult | null>(null)
  const [healthLoading, setHealthLoading] = useState(true)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [importStats, setImportStats] = useState<ImportStats | null>(null)
  const [logArchive, setLogArchive] = useState<LogArchiveInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchHealth = useCallback(async () => {
    setHealthLoading(true)
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      setHealth(data)
      // Note: We no longer auto-redirect when healthy.
      // If DB has data, the diagnostics page will block progression.
    } catch {
      setError('Failed to check system status')
    } finally {
      setHealthLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHealth()
  }, [fetchHealth])

  const handleUploadComplete = (result: UploadResult) => {
    setUploadResult(result)
    setStep('importing')
    setError(null)
  }

  const handleUploadError = (errorMsg: string) => {
    setError(errorMsg)
  }

  const handleImportComplete = (
    stats: ImportStats,
    archive: LogArchiveInfo | null
  ) => {
    setImportStats(stats)
    setLogArchive(archive)
    setError(null) // Clear any previous errors on successful completion
    setStep('complete')
    // Set cookie to indicate setup is complete
    document.cookie = 'ppdb_setup_complete=true; path=/; max-age=31536000' // 1 year
  }

  const handleImportError = (errorMsg: string) => {
    setError(errorMsg)
    setStep('error')
  }

  const handleRetry = () => {
    setError(null)
    setUploadResult(null)
    setStep('upload')
  }

  const handleGoToApp = () => {
    router.push('/')
  }

  const allChecksPassed = health?.status === 'healthy'
  const needsImport = health?.status === 'needs_setup'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-xl text-white">
              <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">
                Pampered Pooch Database
              </h1>
              <p className="text-gray-500">Initial Setup</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <div className="mx-auto max-w-4xl px-6 py-6">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4">
              {['Diagnostics', 'Upload', 'Import', 'Complete'].map(
                (label, index) => {
                  const stepMap: WizardStep[] = [
                    'diagnostics',
                    'upload',
                    'importing',
                    'complete',
                  ]
                  const currentStepIndex = stepMap.indexOf(step)
                  const isActive = index === currentStepIndex
                  const isCompleted = index < currentStepIndex

                  return (
                    <div key={label} className="flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : isActive
                              ? 'bg-primary text-white'
                              : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {isCompleted ? (
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span
                        className={`hidden sm:inline ${
                          isActive
                            ? 'font-medium text-gray-900'
                            : 'text-gray-500'
                        }`}
                      >
                        {label}
                      </span>
                      {index < 3 && (
                        <div
                          className={`h-0.5 w-8 ${
                            isCompleted ? 'bg-green-500' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>
                  )
                }
              )}
            </div>
          </div>

          {/* Error Banner */}
          {error && step !== 'error' && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="h-5 w-5 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="font-medium text-red-800">Error</p>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Content Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            {/* Step: Diagnostics */}
            {step === 'diagnostics' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Welcome to Setup
                  </h2>
                  <p className="mt-2 text-gray-600">
                    Let&apos;s check your system and get your database ready.
                  </p>
                </div>

                <DiagnosticResults health={health} loading={healthLoading} />

                {!healthLoading && needsImport && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={() => setStep('upload')}
                      className="bg-primary hover:bg-primary-hover rounded-lg px-6 py-3 font-semibold text-white transition-colors"
                    >
                      Continue to Upload
                    </button>
                  </div>
                )}

                {!healthLoading && allChecksPassed && (
                  <div className="space-y-4 pt-4">
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-start gap-3">
                        <svg
                          className="h-5 w-5 flex-shrink-0 text-amber-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        <div>
                          <p className="font-medium text-amber-800">
                            Database Already Contains Data
                          </p>
                          <p className="mt-1 text-sm text-amber-700">
                            The setup wizard cannot proceed because your
                            database already has data. To protect your existing
                            data, import is blocked when records exist in the
                            database.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <button
                        onClick={handleGoToApp}
                        className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700"
                      >
                        Go to Application
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step: Upload */}
            {step === 'upload' && (
              <div className="space-y-6">
                <FileUploader
                  onUploadComplete={handleUploadComplete}
                  onError={handleUploadError}
                />

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setStep('diagnostics')}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {/* Step: Importing */}
            {step === 'importing' && uploadResult && (
              <ImportProgress
                uploadId={uploadResult.uploadId}
                backupType={uploadResult.backupType}
                backupSourceDescription={uploadResult.backupSourceDescription}
                onComplete={handleImportComplete}
                onError={handleImportError}
              />
            )}

            {/* Step: Complete */}
            {step === 'complete' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-10 w-10 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h2 className="mt-4 text-2xl font-bold text-gray-900">
                    Setup Complete!
                  </h2>
                  <p className="mt-2 text-gray-600">
                    Your database has been successfully initialized.
                  </p>
                </div>

                {/* Import Summary */}
                {importStats && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <h3 className="mb-3 font-semibold text-gray-800">
                      Import Summary
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {['breeds', 'customers', 'animals', 'notes'].map(
                        table => {
                          const stats = importStats[table]
                          if (!stats) return null
                          const hasWarnings =
                            stats.skipped > 0 || stats.repaired > 0
                          return (
                            <div
                              key={table}
                              className={`rounded-lg border p-3 ${
                                hasWarnings
                                  ? 'border-amber-200 bg-amber-50'
                                  : 'border-green-200 bg-green-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-800 capitalize">
                                  {table}
                                </span>
                                {hasWarnings ? (
                                  <span className="text-xs text-amber-600">
                                    ⚠️ Has warnings
                                  </span>
                                ) : (
                                  <span className="text-xs text-green-600">
                                    ✓ Clean
                                  </span>
                                )}
                              </div>
                              <div className="mt-2 space-y-1 text-sm text-gray-600">
                                <div className="flex justify-between">
                                  <span>Imported:</span>
                                  <span className="font-medium text-green-700">
                                    {stats.imported}
                                  </span>
                                </div>
                                {stats.repaired > 0 && (
                                  <div className="flex justify-between">
                                    <span>Repaired:</span>
                                    <span className="font-medium text-amber-600">
                                      {stats.repaired}
                                    </span>
                                  </div>
                                )}
                                {stats.skipped > 0 && (
                                  <div className="flex justify-between">
                                    <span>Skipped:</span>
                                    <span className="font-medium text-amber-600">
                                      {stats.skipped}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        }
                      )}
                    </div>
                    <p className="mt-3 text-xs text-gray-500">
                      Check the import logs in the logs/import/ directory for
                      details on any repaired or skipped records.
                    </p>
                  </div>
                )}

                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  {logArchive?.available && (
                    <button
                      onClick={() =>
                        window.open(
                          `/api/setup/import/logs/${logArchive.downloadId}`,
                          '_blank'
                        )
                      }
                      className="border-primary text-primary hover:bg-primary/5 flex items-center gap-2 rounded-lg border-2 bg-white px-8 py-3 font-semibold transition-colors"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Download Logs
                    </button>
                  )}
                  <button
                    onClick={handleGoToApp}
                    className="bg-primary hover:bg-primary-hover rounded-lg px-8 py-3 font-semibold text-white transition-colors"
                  >
                    Launch Application
                  </button>
                </div>
              </div>
            )}

            {/* Step: Error */}
            {step === 'error' && (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                  <svg
                    className="h-10 w-10 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Import Failed
                </h2>
                <p className="text-gray-600">{error}</p>
                <button
                  onClick={handleRetry}
                  className="bg-primary hover:bg-primary-hover rounded-lg px-8 py-3 font-semibold text-white transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
