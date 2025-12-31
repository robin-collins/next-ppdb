'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSidebarState } from '@/hooks/useSidebarState'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import UpdateApprovalModal from '@/components/UpdateApprovalModal'
import type { PendingUpdate } from '@/components/UpdateApprovalModal'

interface UpdateHistory extends PendingUpdate {
  executedAt?: string
  executionDuration?: number
  errorMessage?: string
  rollbackPerformed?: boolean
  rollbackDetails?: string
}

export default function AdminUpdatesPage() {
  const {
    sidebarOpen,
    sidebarPinned,
    skipTransition,
    setSidebarOpen,
    toggleSidebar,
    togglePin,
  } = useSidebarState()

  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingUpdate, setPendingUpdate] = useState<PendingUpdate | null>(null)
  const [updateHistory, setUpdateHistory] = useState<UpdateHistory[]>([])
  const [lastCheck, setLastCheck] = useState<string | null>(null)
  const [environment, setEnvironment] = useState<Record<string, string>>({})
  const [showModal, setShowModal] = useState(false)
  const [showEnv, setShowEnv] = useState(false)

  const fetchUpdates = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch(
        '/api/admin/updates/pending?history=true&limit=20'
      )
      if (!res.ok) throw new Error('Failed to fetch updates')
      const data = await res.json()
      setPendingUpdate(data.pending)
      setUpdateHistory(data.history || [])
      setLastCheck(data.lastCheck)
      setEnvironment(data.environment || {})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch updates')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUpdates()
  }, [fetchUpdates])

  const handleApprove = async (approverName: string) => {
    if (!pendingUpdate) return

    setActionLoading(true)
    try {
      const res = await fetch(
        `/api/admin/updates/${pendingUpdate.id}/approve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ approvedBy: approverName }),
        }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to approve update')
      }

      setShowModal(false)
      await fetchUpdates()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve update')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!pendingUpdate) return

    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/updates/${pendingUpdate.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to cancel update')
      }

      setShowModal(false)
      await fetchUpdates()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel update')
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleString('en-AU', {
      timeZone: 'Australia/Adelaide',
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A'
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${Math.round(ms / 1000)}s`
    return `${Math.round(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
            Pending
          </span>
        )
      case 'APPROVED':
        return (
          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
            Approved
          </span>
        )
      case 'EXECUTED':
        return (
          <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
            Executed
          </span>
        )
      case 'FAILED':
        return (
          <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
            Failed
          </span>
        )
      default:
        return (
          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
            {status}
          </span>
        )
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
          { label: 'System Updates', current: true },
        ]}
      />
      <Sidebar
        isOpen={sidebarOpen}
        isPinned={sidebarPinned}
        onClose={() => setSidebarOpen(false)}
        onTogglePin={togglePin}
        currentPath="/admin/updates"
        skipTransition={skipTransition}
        onUpdateClick={update => {
          setPendingUpdate(update as PendingUpdate)
          setShowModal(true)
        }}
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
          <h1 className="mb-6 text-2xl font-bold text-gray-900">
            System Updates
          </h1>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-red-800">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-sm text-red-600 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--primary)]" />
            </div>
          )}

          {!loading && (
            <>
              {/* Current Update Status */}
              <div className="card mb-6">
                <div className="card-header flex items-center justify-between">
                  <h2 className="card-title text-xl font-semibold">
                    Current Status
                  </h2>
                  <button
                    onClick={fetchUpdates}
                    className="flex items-center gap-2 rounded-lg border-2 border-transparent bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-200"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Refresh
                  </button>
                </div>
                <div className="card-content p-6">
                  {lastCheck && (
                    <p className="mb-4 text-sm text-gray-500">
                      Last version check: {formatDate(lastCheck)}
                    </p>
                  )}

                  {pendingUpdate ? (
                    <div
                      className={`rounded-lg border-2 p-4 ${
                        pendingUpdate.status === 'PENDING'
                          ? 'border-amber-300 bg-amber-50'
                          : 'border-blue-300 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(pendingUpdate.status)}
                            <span className="font-medium text-gray-900">
                              v{pendingUpdate.currentVersion} → v
                              {pendingUpdate.newVersion}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">
                            {pendingUpdate.releaseTitle ||
                              `Release v${pendingUpdate.newVersion}`}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            Detected: {formatDate(pendingUpdate.detectedAt)}
                          </p>
                          {pendingUpdate.status === 'APPROVED' &&
                            pendingUpdate.approvedBy && (
                              <p className="text-xs text-gray-500">
                                Approved by {pendingUpdate.approvedBy} on{' '}
                                {formatDate(pendingUpdate.approvedAt)}
                              </p>
                            )}
                        </div>
                        <button
                          onClick={() => setShowModal(true)}
                          className={`rounded-lg border-2 border-transparent px-4 py-2 font-medium text-white transition-all hover:shadow-md ${
                            pendingUpdate.status === 'PENDING'
                              ? 'bg-amber-500 hover:border-amber-600 hover:bg-amber-600'
                              : 'bg-blue-500 hover:border-blue-600 hover:bg-blue-600'
                          }`}
                        >
                          {pendingUpdate.status === 'PENDING'
                            ? 'Review & Approve'
                            : 'View Details'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <p className="mt-2 font-medium text-gray-900">
                        System is up to date
                      </p>
                      <p className="text-sm text-gray-500">
                        No pending updates available
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Update History */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title text-xl font-semibold">
                    Update History
                  </h2>
                </div>
                <div className="card-content p-6">
                  {updateHistory.length === 0 ? (
                    <p className="text-center text-gray-500">
                      No update history available
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {updateHistory.map(update => (
                        <div
                          key={update.id}
                          className={`rounded-lg border p-4 ${
                            update.status === 'EXECUTED'
                              ? 'border-green-200 bg-green-50'
                              : update.status === 'FAILED'
                                ? 'border-red-200 bg-red-50'
                                : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(update.status)}
                                <span className="font-medium text-gray-900">
                                  v{update.currentVersion} → v
                                  {update.newVersion}
                                </span>
                              </div>
                              {update.executedAt && (
                                <p className="mt-1 text-xs text-gray-500">
                                  {update.status === 'EXECUTED'
                                    ? 'Executed'
                                    : 'Failed'}
                                  : {formatDate(update.executedAt)}
                                  {update.executionDuration &&
                                    ` (${formatDuration(update.executionDuration)})`}
                                </p>
                              )}
                              {update.status === 'FAILED' &&
                                update.errorMessage && (
                                  <p className="mt-2 text-sm text-red-600">
                                    {update.errorMessage}
                                  </p>
                                )}
                              {update.rollbackPerformed && (
                                <p className="mt-1 text-xs text-amber-600">
                                  Rollback performed:{' '}
                                  {update.rollbackDetails ||
                                    'Automatically reverted'}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* System Environment (Collapsible) */}
              <div className="card mt-6">
                <button
                  onClick={() => setShowEnv(!showEnv)}
                  className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-gray-50"
                  aria-expanded={showEnv}
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                      />
                    </svg>
                    <h2 className="text-xl font-semibold text-gray-900">
                      System Environment
                    </h2>
                  </div>
                  <svg
                    className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                      showEnv ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showEnv && (
                  <div className="border-t border-gray-100 bg-gray-50/50 p-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(environment).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex flex-col rounded-lg bg-white p-3 shadow-sm ring-1 ring-gray-100"
                        >
                          <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                            {key === 'app' ? 'Application' : key}
                          </span>
                          <span className="mt-1 font-mono text-sm font-medium text-gray-900">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Update Approval Modal */}
      {showModal && pendingUpdate && (
        <UpdateApprovalModal
          update={pendingUpdate}
          onClose={() => setShowModal(false)}
          onApprove={handleApprove}
          onCancel={handleCancel}
          isLoading={actionLoading}
        />
      )}
    </div>
  )
}
