// src/components/ErrorBoundary.tsx
'use client'
import { useAnimalsStore } from '@/store/animalsStore'

interface ErrorDisplayProps {
  error?: string | null
  onClear?: () => void
}

export function ErrorDisplay({ error, onClear }: ErrorDisplayProps) {
  if (!error) return null

  return (
    <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
      <div className="flex items-center justify-between">
        <span>{error}</span>
        {onClear && (
          <button
            onClick={onClear}
            className="font-bold text-red-500 hover:text-red-700"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}

// Usage in components
export function SearchFormWithErrorHandling() {
  const { error, setError } = useAnimalsStore()

  return (
    <>
      <ErrorDisplay error={error} onClear={() => setError(null)} />
      {/* Rest of component */}
    </>
  )
}
