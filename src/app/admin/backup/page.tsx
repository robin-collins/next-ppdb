'use client'
import { useState } from 'react'

export default function AdminBackupPage() {
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const triggerBackup = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/admin/backup')
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Backup failed')
      }
      const body = await res.json()
      setResult(JSON.stringify(body, null, 2))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Backup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="main-content">
      <div className="content-wrapper">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Admin Backup</h3>
            <button
              className="btn btn-primary"
              onClick={triggerBackup}
              disabled={loading}
            >
              {loading ? 'Running…' : 'Run Backup'}
            </button>
          </div>
          <div className="card-content">
            <p>
              This is a stub that returns a JSON payload. Replace with archive
              streaming later.
            </p>
            {error ? (
              <div
                className="mt-4 text-red-600"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            ) : null}
            {result ? (
              <pre className="mt-4 break-words whitespace-pre-wrap">
                {result}
              </pre>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
