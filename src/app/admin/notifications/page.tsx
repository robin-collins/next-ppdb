'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSidebarState } from '@/hooks/useSidebarState'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

interface Notification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  source: 'backup' | 'version_check' | 'update_execution' | 'system'
  status: 'unread' | 'read' | 'archived'
  createdAt: string
  readAt?: string
  archivedAt?: string
}

export default function AdminNotificationsPage() {
  const {
    sidebarOpen,
    sidebarPinned,
    skipTransition,
    setSidebarOpen,
    toggleSidebar,
    togglePin,
  } = useSidebarState()

  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentNotifications, setCurrentNotifications] = useState<
    Notification[]
  >([])
  const [archivedNotifications, setArchivedNotifications] = useState<
    Notification[]
  >([])
  const [showArchived, setShowArchived] = useState(false)

  const fetchNotifications = useCallback(async () => {
    try {
      setError(null)
      const [currentRes, archivedRes] = await Promise.all([
        fetch('/api/admin/notifications?status=current'),
        fetch('/api/admin/notifications?status=archived'),
      ])

      if (!currentRes.ok || !archivedRes.ok) {
        throw new Error('Failed to fetch notifications')
      }

      const currentData = await currentRes.json()
      const archivedData = await archivedRes.json()

      setCurrentNotifications(currentData.notifications || [])
      setArchivedNotifications(archivedData.notifications || [])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch notifications'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleMarkAsRead = async (id: string) => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'read' }),
      })
      if (!res.ok) throw new Error('Failed to mark as read')
      await fetchNotifications()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as read')
    } finally {
      setActionLoading(null)
    }
  }

  const handleArchive = async (id: string) => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive' }),
      })
      if (!res.ok) throw new Error('Failed to archive')
      await fetchNotifications()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id: string) => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete')
      await fetchNotifications()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    } finally {
      setActionLoading(null)
    }
  }

  const handleMarkAllAsRead = async () => {
    setActionLoading('all')
    try {
      const res = await fetch('/api/admin/notifications?action=markAllRead', {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Failed to mark all as read')
      await fetchNotifications()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to mark all as read'
      )
    } finally {
      setActionLoading(null)
    }
  }

  const handleClearArchived = async () => {
    setActionLoading('clearArchived')
    try {
      const res = await fetch('/api/admin/notifications?action=clearArchived', {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Failed to clear archived')
      await fetchNotifications()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear archived')
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-AU', {
      timeZone: 'Australia/Adelaide',
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-5 w-5 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )
      case 'warning':
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
            <svg
              className="h-5 w-5 text-amber-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )
      case 'error':
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-5 w-5 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )
      default:
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-5 w-5 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )
    }
  }

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'backup':
        return 'Backup'
      case 'version_check':
        return 'Updates'
      case 'update_execution':
        return 'Update Execution'
      default:
        return 'System'
    }
  }

  const renderNotificationCard = (
    notification: Notification,
    showActions: boolean
  ) => (
    <div
      key={notification.id}
      className={`rounded-lg border p-4 transition-all ${
        notification.status === 'unread'
          ? 'border-blue-200 bg-blue-50'
          : notification.status === 'archived'
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        {getTypeIcon(notification.type)}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900">{notification.title}</h3>
            {notification.status === 'unread' && (
              <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-medium text-white">
                New
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
          <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
            <span>{formatDate(notification.createdAt)}</span>
            <span className="rounded bg-gray-100 px-1.5 py-0.5">
              {getSourceLabel(notification.source)}
            </span>
          </div>
        </div>
        {showActions && (
          <div className="flex items-center gap-2">
            {notification.status === 'unread' && (
              <button
                onClick={() => handleMarkAsRead(notification.id)}
                disabled={actionLoading === notification.id}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                title="Mark as read"
              >
                <svg
                  className="h-5 w-5"
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
              </button>
            )}
            {notification.status !== 'archived' && (
              <button
                onClick={() => handleArchive(notification.id)}
                disabled={actionLoading === notification.id}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                title="Archive"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
              </button>
            )}
            {notification.status === 'archived' && (
              <button
                onClick={() => handleDelete(notification.id)}
                disabled={actionLoading === notification.id}
                className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                title="Delete permanently"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )

  const unreadCount = currentNotifications.filter(
    n => n.status === 'unread'
  ).length

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
          { label: 'Notifications', current: true },
        ]}
      />
      <Sidebar
        isOpen={sidebarOpen}
        isPinned={sidebarPinned}
        onClose={() => setSidebarOpen(false)}
        onTogglePin={togglePin}
        currentPath="/admin/notifications"
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
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <button
              onClick={fetchNotifications}
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
              {/* Current Notifications */}
              <div className="card mb-6">
                <div className="card-header flex items-center justify-between">
                  <h2 className="card-title text-xl font-semibold">
                    Current Notifications
                    {unreadCount > 0 && (
                      <span className="ml-2 rounded-full bg-blue-500 px-2 py-0.5 text-xs font-medium text-white">
                        {unreadCount} new
                      </span>
                    )}
                  </h2>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      disabled={actionLoading === 'all'}
                      className="text-sm text-[var(--primary)] hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="card-content p-6">
                  {currentNotifications.length === 0 ? (
                    <div className="py-8 text-center">
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
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                      <p className="mt-2 text-gray-500">No notifications</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentNotifications.map(notification =>
                        renderNotificationCard(notification, true)
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Archived Notifications */}
              <div className="card">
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className="card-header flex w-full items-center justify-between"
                >
                  <h2 className="card-title text-xl font-semibold">
                    Archived Notifications
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({archivedNotifications.length})
                    </span>
                  </h2>
                  <svg
                    className={`h-5 w-5 text-gray-400 transition-transform ${
                      showArchived ? 'rotate-180' : ''
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
                {showArchived && (
                  <div className="card-content p-6">
                    {archivedNotifications.length > 0 && (
                      <div className="mb-4 flex justify-end">
                        <button
                          onClick={handleClearArchived}
                          disabled={actionLoading === 'clearArchived'}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Clear all archived
                        </button>
                      </div>
                    )}
                    {archivedNotifications.length === 0 ? (
                      <p className="text-center text-gray-500">
                        No archived notifications
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {archivedNotifications.map(notification =>
                          renderNotificationCard(notification, true)
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
