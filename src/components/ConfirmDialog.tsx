'use client'
import { useEffect } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title = 'Confirm',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/30">
      <div className="card max-w-md">
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
        </div>
        <div className="card-content">
          <p>{message}</p>
          <div className="mt-4 flex gap-2">
            <button className="btn btn-danger" onClick={onConfirm}>
              {confirmText}
            </button>
            <button className="btn btn-outline" onClick={onCancel}>
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
