'use client'

import { useState, useEffect, useCallback } from 'react'
import ImportLog from './ImportLog'

interface ImportStats {
  totalRecords: number
  processedRecords: number
  validRecords: number
  repairedRecords: number
  skippedRecords: number
}

interface LogEntry {
  timestamp: string
  level: 'info' | 'success' | 'warning' | 'error'
  table?: string
  recordId?: number
  message: string
  details?: string
}

interface FinalStats {
  [table: string]: {
    total: number
    imported: number
    repaired: number
    skipped: number
    failed: number
  }
}

/** Backup type detected during file extraction */
type BackupType = 'legacy' | 'nextjs' | 'unknown'

interface ImportProgressProps {
  uploadId: string
  /** Detected backup type */
  backupType?: BackupType
  /** Human-readable description of the backup source */
  backupSourceDescription?: string
  onComplete: (stats: FinalStats) => void
  onError: (error: string) => void
}

const TABLE_ORDER = ['breed', 'customer', 'animal', 'notes']

export default function ImportProgress({
  uploadId,
  backupType,
  backupSourceDescription,
  onComplete,
  onError,
}: ImportProgressProps) {
  const [_phase, setPhase] = useState<string>('starting')
  const [message, setMessage] = useState<string>('Initializing import...')
  const [currentTable, setCurrentTable] = useState<string>('')
  const [tableStats, setTableStats] = useState<Record<string, ImportStats>>({})
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [hasError, setHasError] = useState(false)

  const startImport = useCallback(() => {
    const eventSource = new EventSource(
      `/api/setup/import?uploadId=${uploadId}`
    )

    eventSource.addEventListener('progress', e => {
      const data = JSON.parse(e.data)
      setPhase(data.phase)
      setMessage(data.message)
      if (data.currentTable) {
        setCurrentTable(data.currentTable)
      }
    })

    eventSource.addEventListener('batch', e => {
      const data = JSON.parse(e.data)
      setTableStats(prev => ({
        ...prev,
        [data.table]: {
          totalRecords: data.total,
          processedRecords: data.processed,
          validRecords: data.valid,
          repairedRecords: data.repaired,
          skippedRecords: data.skipped,
        },
      }))
    })

    eventSource.addEventListener('log', e => {
      const log = JSON.parse(e.data)
      setLogs(prev => [...prev.slice(-500), log]) // Keep last 500 logs
    })

    eventSource.addEventListener('table_complete', e => {
      const data = JSON.parse(e.data)
      // Map server stats format to UI format
      const mappedStats = {
        totalRecords: data.stats.total,
        processedRecords: data.stats.total,
        validRecords: data.stats.imported,
        repairedRecords: data.stats.repaired,
        skippedRecords: data.stats.skipped,
      }
      setTableStats(prev => ({
        ...prev,
        [data.table]: mappedStats,
      }))
      setLogs(prev => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          level: 'success',
          table: data.table,
          message: `Completed ${data.table}: ${mappedStats.validRecords} imported, ${mappedStats.repairedRecords} repaired, ${mappedStats.skippedRecords} skipped`,
        },
      ])
    })

    // Track completion state locally to avoid stale closure issues
    let completed = false
    let errored = false

    eventSource.addEventListener('complete', e => {
      completed = true
      const data = JSON.parse(e.data)
      setIsComplete(true)
      setPhase('complete')
      setMessage(data.message)
      eventSource.close()
      // Pass final stats to parent after short delay for user to see completion
      setTimeout(() => onComplete(data.stats), 2000)
    })

    eventSource.addEventListener('error', (e: Event) => {
      // Only handle if we haven't completed successfully
      if (completed) return

      // SSE error events from our API include data via MessageEvent
      const messageEvent = e as MessageEvent
      try {
        if (messageEvent.data) {
          const data = JSON.parse(messageEvent.data)
          errored = true
          setHasError(true)
          onError(data.message || 'Import failed')
          eventSource.close()
        }
        // If no data, this might just be a connection close - don't treat as error yet
      } catch {
        // Parse error with data means actual error from server
        if (messageEvent.data) {
          errored = true
          setHasError(true)
          onError('Import failed unexpectedly')
          eventSource.close()
        }
      }
    })

    eventSource.onerror = () => {
      // Only treat as error if we haven't completed and haven't already errored
      if (!completed && !errored) {
        // Give a small delay to check if complete event is coming
        setTimeout(() => {
          if (!completed && !errored) {
            errored = true
            setHasError(true)
            onError('Connection to server lost')
            eventSource.close()
          }
        }, 500)
      }
    }

    return () => {
      eventSource.close()
    }
  }, [uploadId, onComplete, onError])

  useEffect(() => {
    const cleanup = startImport()
    return cleanup
  }, [startImport])

  const getTableProgress = (table: string): number => {
    const stats = tableStats[table]
    if (!stats || stats.totalRecords === 0) return 0
    return Math.round((stats.processedRecords / stats.totalRecords) * 100)
  }

  const getTotalProgress = (): number => {
    const tables = TABLE_ORDER.filter(t => tableStats[t])
    if (tables.length === 0) return 0

    let totalProcessed = 0
    let totalRecords = 0

    for (const table of tables) {
      totalProcessed += tableStats[table]?.processedRecords || 0
      totalRecords += tableStats[table]?.totalRecords || 0
    }

    if (totalRecords === 0) return 0
    return Math.round((totalProcessed / totalRecords) * 100)
  }

  // Helper to get backup type badge color
  const getBackupTypeBadgeColor = () => {
    switch (backupType) {
      case 'legacy':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'nextjs':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Helper to get backup type label
  const getBackupTypeLabel = () => {
    switch (backupType) {
      case 'legacy':
        return 'Legacy PHP Backup'
      case 'nextjs':
        return 'Next.js Backup'
      default:
        return 'Unknown Format'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-gray-800">
            Importing Database
          </h2>
          {backupType && (
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getBackupTypeBadgeColor()}`}
              >
                {getBackupTypeLabel()}
              </span>
              {backupSourceDescription && (
                <span className="text-xs text-gray-500">
                  {backupSourceDescription}
                </span>
              )}
            </div>
          )}
        </div>
        {!isComplete && !hasError && (
          <span className="text-primary text-2xl font-bold">
            {getTotalProgress()}%
          </span>
        )}
      </div>

      {/* Status Message */}
      <div
        className={`rounded-lg p-4 ${
          isComplete
            ? 'border-green-200 bg-green-50'
            : hasError
              ? 'border-red-200 bg-red-50'
              : 'border-blue-200 bg-blue-50'
        } border`}
      >
        <div className="flex items-center gap-3">
          {!isComplete && !hasError && (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          )}
          {isComplete && (
            <svg
              className="h-5 w-5 text-green-600"
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
          )}
          {hasError && (
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
          <span
            className={`font-medium ${
              isComplete
                ? 'text-green-800'
                : hasError
                  ? 'text-red-800'
                  : 'text-blue-800'
            }`}
          >
            {message}
          </span>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="space-y-2">
        <div className="h-3 overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-full transition-all duration-300 ${
              isComplete
                ? 'bg-green-500'
                : hasError
                  ? 'bg-red-500'
                  : 'bg-primary'
            }`}
            style={{ width: `${isComplete ? 100 : getTotalProgress()}%` }}
          />
        </div>
      </div>

      {/* Table Progress */}
      <div className="space-y-3">
        {TABLE_ORDER.map(table => {
          const stats = tableStats[table]
          const isActive = currentTable === table
          const isDone =
            stats &&
            stats.processedRecords === stats.totalRecords &&
            stats.totalRecords > 0

          return (
            <div
              key={table}
              className={`rounded-lg border p-3 transition-colors ${
                isActive
                  ? 'border-primary bg-primary/5'
                  : isDone
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isDone && (
                    <svg
                      className="h-4 w-4 text-green-600"
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
                  )}
                  {isActive && !isDone && (
                    <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                  )}
                  <span
                    className={`font-medium capitalize ${isDone ? 'text-green-800' : 'text-gray-800'}`}
                  >
                    {table}
                  </span>
                </div>
                {stats && (
                  <span className="text-sm text-gray-600">
                    {stats.processedRecords}/{stats.totalRecords}
                  </span>
                )}
              </div>
              {stats && (
                <>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full transition-all duration-300 ${isDone ? 'bg-green-500' : 'bg-primary'}`}
                      style={{ width: `${getTableProgress(table)}%` }}
                    />
                  </div>
                  <div className="mt-1 flex gap-4 text-xs text-gray-500">
                    <span>Valid: {stats.validRecords}</span>
                    <span>Repaired: {stats.repairedRecords}</span>
                    <span>Skipped: {stats.skippedRecords}</span>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Log Viewer */}
      <ImportLog logs={logs} />
    </div>
  )
}
