'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import DiagnosticResults from '@/components/setup/DiagnosticResults'
import FileUploader from '@/components/setup/FileUploader'
import ImportProgress from '@/components/setup/ImportProgress'
import { HealthCheckResult } from '@/lib/diagnostics/types'

type WizardStep = 'diagnostics' | 'upload' | 'importing' | 'complete' | 'error'

interface UploadResult {
  success: boolean
  uploadId: string
  filename: string
  fileType: string
  size: number
  sqlFile: string
  originalSqlFilename: string
}

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState<WizardStep>('diagnostics')
  const [health, setHealth] = useState<HealthCheckResult | null>(null)
  const [healthLoading, setHealthLoading] = useState(true)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchHealth = useCallback(async () => {
    setHealthLoading(true)
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      setHealth(data)

      // If already healthy, redirect to home
      if (data.status === 'healthy') {
        router.push('/')
      }
    } catch {
      setError('Failed to check system status')
    } finally {
      setHealthLoading(false)
    }
  }, [router])

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

  const handleImportComplete = () => {
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
      <main className="mx-auto max-w-4xl px-6 py-8">
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
                        isActive ? 'font-medium text-gray-900' : 'text-gray-500'
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
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleGoToApp}
                    className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700"
                  >
                    Go to Application
                  </button>
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
              onComplete={handleImportComplete}
              onError={handleImportError}
            />
          )}

          {/* Step: Complete */}
          {step === 'complete' && (
            <div className="space-y-6 text-center">
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
              <h2 className="text-2xl font-bold text-gray-900">
                Setup Complete!
              </h2>
              <p className="text-gray-600">
                Your database has been successfully initialized. You&apos;re
                ready to start using the application.
              </p>
              <button
                onClick={handleGoToApp}
                className="bg-primary hover:bg-primary-hover rounded-lg px-8 py-3 font-semibold text-white transition-colors"
              >
                Launch Application
              </button>
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
      </main>
    </div>
  )
}
