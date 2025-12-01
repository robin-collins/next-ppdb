'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSidebarState } from '@/hooks/useSidebarState'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

interface BackupInfo {
  filename: string
  timestamp: string
  size: number
  createdAt: string
  downloadUrl: string
}

interface BackupResult {
  success: boolean
  filename: string
  timestamp: string
  sqlSize: number
  zipSize: number
  downloadUrl: string
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatTimestamp(ts: string): string {
  // Format: YYYYMMDD-HHmmss to readable
  const year = ts.slice(0, 4)
  const month = ts.slice(4, 6)
  const day = ts.slice(6, 8)
  const hour = ts.slice(9, 11)
  const min = ts.slice(11, 13)
  const sec = ts.slice(13, 15)
  return `${day}/${month}/${year} ${hour}:${min}:${sec}`
}

export default function AdminBackupPage() {
  const {
    sidebarOpen,
    sidebarPinned,
    skipTransition,
    setSidebarOpen,
    toggleSidebar,
    togglePin,
  } = useSidebarState()
  const [backups, setBackups] = useState<BackupInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('')
  const [lastResult, setLastResult] = useState<BackupResult | null>(null)

  const fetchBackups = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/backup')
      if (res.ok) {
        const data = await res.json()
        setBackups(data.backups || [])
      }
    } catch {
      // Ignore fetch errors on initial load
    }
  }, [])

  useEffect(() => {
    fetchBackups()
  }, [fetchBackups])

  const createBackup = async () => {
    setLoading(true)
    setError(null)
    setStatus('Connecting to database...')
    setLastResult(null)

    try {
      setStatus('Creating database dump (this may take a moment)...')

      const res = await fetch('/api/admin/backup', { method: 'POST' })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Backup failed')
      }

      const result: BackupResult = await res.json()
      setLastResult(result)
      setStatus('Backup created! Starting download...')

      // Auto-download the new backup
      await downloadBackup(result.downloadUrl, result.filename)

      // Refresh backup list
      await fetchBackups()
      setStatus('Backup complete!')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Backup failed')
      setStatus('')
    } finally {
      setLoading(false)
    }
  }

  const downloadBackup = async (url: string, filename: string) => {
    setDownloading(filename)
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error('Download failed')

      const blob = await res.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Download failed')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        onToggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        sidebarPinned={sidebarPinned}
        onSearch={() => {}}
        searchValue=""
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Admin', href: '/admin/backup' },
          { label: 'Database Backup', current: true },
        ]}
      />
      <Sidebar
        isOpen={sidebarOpen}
        isPinned={sidebarPinned}
        onClose={() => setSidebarOpen(false)}
        onTogglePin={togglePin}
        currentPath="/admin/backup"
        skipTransition={skipTransition}
      />
      <main
        className={`mt-6 mr-6 mb-6 flex-1 overflow-hidden rounded-2xl bg-white/95 p-6 shadow-xl backdrop-blur-[20px] ${
          skipTransition ? '' : 'transition-[margin-left] duration-[250ms]'
        }`}
        style={{
          marginLeft: sidebarPinned
            ? 'calc(var(--sidebar-width) + 1.5rem)'
            : '1.5rem',
        }}
      >
        <div className="mx-auto max-w-4xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="font-display mb-2 text-3xl font-bold text-gray-900">
              Database Backup
            </h1>
            <p className="text-gray-600">
              Create and manage database backups. Up to 5 recent backups are
              stored.
            </p>
          </div>

          {/* Create Backup Card */}
          <div className="card mb-6">
            <div className="card-header flex items-center justify-between">
              <h2 className="card-title text-xl font-semibold">
                Create New Backup
              </h2>
            </div>
            <div className="card-content p-6">
              <p className="mb-4 text-gray-600">
                Creates a complete SQL dump of the database including all
                tables, structure, and data. The backup is compressed as a ZIP
                file.
              </p>

              {/* Progress Indicator */}
              {loading && (
                <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <span className="font-medium text-blue-800">{status}</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-200">
                    <div className="h-full w-full animate-pulse rounded-full bg-blue-600"></div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {/* Success Display */}
              {lastResult && !loading && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="mb-2 font-medium text-green-800">
                    Backup created successfully!
                  </p>
                  <div className="space-y-1 text-sm text-green-700">
                    <p>File: {lastResult.filename}</p>
                    <p>SQL Size: {formatBytes(lastResult.sqlSize)}</p>
                    <p>ZIP Size: {formatBytes(lastResult.zipSize)}</p>
                  </div>
                </div>
              )}

              <button
                onClick={createBackup}
                disabled={loading}
                className="btn-primary rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Creating Backup...' : 'Create Backup Now'}
              </button>
            </div>
          </div>

          {/* Existing Backups Card */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title text-xl font-semibold">
                Available Backups
              </h2>
            </div>
            <div className="card-content p-6">
              {backups.length === 0 ? (
                <p className="py-8 text-center text-gray-500">
                  No backups available. Create your first backup above.
                </p>
              ) : (
                <div className="space-y-3">
                  {backups.map(backup => (
                    <div
                      key={backup.filename}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-gray-300"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {backup.filename}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatTimestamp(backup.timestamp)} •{' '}
                          {formatBytes(backup.size)}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          downloadBackup(backup.downloadUrl, backup.filename)
                        }
                        disabled={downloading === backup.filename}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800 disabled:opacity-50"
                      >
                        {downloading === backup.filename
                          ? 'Downloading...'
                          : 'Download'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
