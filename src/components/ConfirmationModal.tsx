'use client'

import { useEffect, useState } from 'react'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  isDanger?: boolean
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDanger = false,
}: ConfirmationModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isVisible && !isOpen) return null

  return (
    <div
      className={`fixed inset-0 z-[300] flex items-center justify-center px-4 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all duration-300 ${
          isOpen ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'
        }`}
      >
        <div className="mb-4 flex items-center gap-3">
          {isDanger && (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          )}
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        </div>

        <p className="mb-8 text-gray-600">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md ${
              isDanger
                ? 'bg-[var(--error)] hover:bg-[#c86158]'
                : 'bg-[var(--primary)] hover:bg-[var(--primary-hover)]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
