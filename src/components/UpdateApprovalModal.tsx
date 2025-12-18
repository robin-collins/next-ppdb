'use client'

import { useState } from 'react'

interface PendingUpdate {
  id: string
  currentVersion: string
  newVersion: string
  status: 'PENDING' | 'APPROVED' | 'EXECUTED' | 'FAILED'
  releaseNotes?: string
  releaseTitle?: string
  releaseUrl?: string
  detectedAt: string
  approvedBy?: string
  approvedAt?: string
}

interface UpdateApprovalModalProps {
  update: PendingUpdate
  onClose: () => void
  onApprove: (approverName: string) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function UpdateApprovalModal({
  update,
  onClose,
  onApprove,
  onCancel,
  isLoading = false,
}: UpdateApprovalModalProps) {
  const [approverName, setApproverName] = useState('')
  const [showApproveConfirm, setShowApproveConfirm] = useState(false)

  const handleApprove = () => {
    if (!approverName.trim()) {
      return
    }
    onApprove(approverName.trim())
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-AU', {
      timeZone: 'Australia/Adelaide',
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  // Simple markdown to HTML conversion for release notes
  const renderMarkdown = (text: string) => {
    // Convert headers
    const html = text
      .replace(
        /^### (.*$)/gim,
        '<h4 class="text-base font-semibold mt-3 mb-1">$1</h4>'
      )
      .replace(
        /^## (.*$)/gim,
        '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>'
      )
      .replace(/^# (.*$)/gim, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
      // Convert bold and italic
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Convert links
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>'
      )
      // Convert bullet lists
      .replace(/^- (.*$)/gim, '<li class="ml-4">• $1</li>')
      // Convert code blocks
      .replace(
        /`([^`]+)`/g,
        '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>'
      )
      // Convert line breaks
      .replace(/\n\n/g, '</p><p class="my-2">')
      .replace(/\n/g, '<br/>')

    return `<p class="my-2">${html}</p>`
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 mx-4 max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-xl border-2 border-amber-400 bg-white shadow-2xl">
        {/* Header - Warning colored */}
        <div className="border-b border-amber-200 bg-amber-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
              <svg
                className="h-6 w-6 text-amber-600"
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
            <div>
              <h2 className="text-xl font-bold text-amber-900">
                Update Available
              </h2>
              <p className="text-sm text-amber-700">
                v{update.currentVersion} → v{update.newVersion}
              </p>
            </div>
            {/* Close button */}
            <button
              onClick={onClose}
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-amber-600 hover:bg-amber-100"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Release Notes - Scrollable */}
        <div className="max-h-[40vh] overflow-y-auto px-6 py-4">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            {update.releaseTitle || `Release v${update.newVersion}`}
          </h3>

          {/* Render markdown release notes */}
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{
              __html: renderMarkdown(
                update.releaseNotes || 'No release notes available.'
              ),
            }}
          />

          {update.releaseUrl && (
            <a
              href={update.releaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
            >
              View on GitHub
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
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          )}
        </div>

        {/* Details */}
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-3">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
            <span>Detected: {formatDate(update.detectedAt)}</span>
            {update.status === 'APPROVED' && update.approvedBy && (
              <>
                <span>Approved by: {update.approvedBy}</span>
                {update.approvedAt && (
                  <span>Approved: {formatDate(update.approvedAt)}</span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Approval Form (only for PENDING status) */}
        {update.status === 'PENDING' && !showApproveConfirm && (
          <div className="border-t border-gray-200 px-6 py-4">
            <label className="block text-sm font-medium text-gray-700">
              Your Name (for approval record)
            </label>
            <input
              type="text"
              value={approverName}
              onChange={e => setApproverName(e.target.value)}
              placeholder="Enter your name"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        )}

        {/* Approval Confirmation */}
        {showApproveConfirm && (
          <div className="border-t border-amber-200 bg-amber-50 px-6 py-4">
            <p className="text-sm font-medium text-amber-800">
              Are you sure you want to approve this update?
            </p>
            <p className="mt-1 text-xs text-amber-600">
              The update will be executed at 8:00 PM (Australia/Adelaide).
            </p>
          </div>
        )}

        {/* Footer with Actions */}
        <div className="flex justify-end gap-3 border-t border-gray-200 bg-white px-6 py-4">
          {!showApproveConfirm ? (
            <>
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="rounded-lg border-2 border-transparent bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-200 hover:shadow-md disabled:opacity-50"
              >
                Cancel Update
              </button>
              {update.status === 'PENDING' && (
                <button
                  onClick={() => {
                    if (approverName.trim()) {
                      setShowApproveConfirm(true)
                    }
                  }}
                  disabled={!approverName.trim() || isLoading}
                  className="rounded-lg border-2 border-transparent bg-amber-500 px-4 py-2 font-medium text-white transition-all hover:border-amber-600 hover:bg-amber-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Approve Update
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => setShowApproveConfirm(false)}
                disabled={isLoading}
                className="rounded-lg border-2 border-transparent bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-200"
              >
                Go Back
              </button>
              <button
                onClick={handleApprove}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-lg border-2 border-transparent bg-green-500 px-4 py-2 font-medium text-white transition-all hover:border-green-600 hover:bg-green-600 hover:shadow-md disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Approving...
                  </>
                ) : (
                  'Confirm Approval'
                )}
              </button>
            </>
          )}
        </div>

        {/* Execution time notice */}
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-2 text-center text-xs text-gray-500">
          Approved updates execute at 8:00 PM (Australia/Adelaide)
        </div>
      </div>
    </div>
  )
}

// Export the PendingUpdate type for use in other components
export type { PendingUpdate }
