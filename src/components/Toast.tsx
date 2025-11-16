'use client'
import { useEffect } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
  durationMs?: number
}

export default function Toast({
  message,
  type = 'info',
  onClose,
  durationMs = 3000,
}: ToastProps) {
  useEffect(() => {
    const id = setTimeout(onClose, durationMs)
    return () => clearTimeout(id)
  }, [onClose, durationMs])

  const color =
    type === 'success'
      ? 'text-green-700'
      : type === 'error'
        ? 'text-red-700'
        : 'text-gray-800'
  const bg =
    type === 'success'
      ? 'bg-green-50'
      : type === 'error'
        ? 'bg-red-50'
        : 'bg-gray-50'

  return (
    <div
      className={`fixed right-6 bottom-6 z-[400] rounded-lg border px-4 py-3 shadow-md ${bg} ${color}`}
    >
      <div className="flex items-center gap-3">
        <span>{message}</span>
        <button className="btn btn-outline" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  )
}
