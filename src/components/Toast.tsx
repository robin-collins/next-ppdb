'use client'
import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  onClose: () => void
  durationMs?: number
}

export default function Toast({
  message,
  type = 'info',
  onClose,
  durationMs = 3000,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = setTimeout(() => setIsVisible(true), 10)

    // Trigger exit animation before closing
    const exitTimer = setTimeout(() => {
      setIsVisible(false)
    }, durationMs - 300) // Start fading out 300ms before removal

    // Actual removal
    const removeTimer = setTimeout(onClose, durationMs)

    return () => {
      clearTimeout(enterTimer)
      clearTimeout(exitTimer)
      clearTimeout(removeTimer)
    }
  }, [onClose, durationMs])

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-800 border-green-200'
      case 'error':
        return 'bg-red-50 text-red-800 border-red-200'
      case 'warning':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200'
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg
            className="h-5 w-5 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )
      case 'error':
        return (
          <svg
            className="h-5 w-5 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )
      case 'warning':
        return (
          <svg
            className="h-5 w-5 text-yellow-500"
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
        )
      default:
        return (
          <svg
            className="h-5 w-5 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
    }
  }

  return (
    <div
      className={`fixed top-24 left-1/2 z-[200] flex -translate-x-1/2 items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-300 ${getStyles()} ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      }`}
      role="alert"
    >
      {getIcon()}
      <span className="font-medium">{message}</span>
      <button
        onClick={() => setIsVisible(false)}
        className="ml-2 rounded-lg p-1 hover:bg-black/5"
        aria-label="Close notification"
      >
        <svg
          className="h-4 w-4 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  )
}
