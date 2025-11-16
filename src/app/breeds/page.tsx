'use client'
import { useCallback, useEffect, useState } from 'react'
import BreedForm from '@/components/breeds/BreedForm'
import BreedTable from '@/components/breeds/BreedTable'
import Breadcrumbs from '@/components/Breadcrumbs'
import Toast from '@/components/Toast'

interface Breed {
  id: number
  name: string
  avgtime: string | null
  avgcost: number | null
}

export default function BreedsPage() {
  const [rows, setRows] = useState<Breed[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/breeds')
      if (!res.ok) throw new Error('Failed to load breeds')
      const data = (await res.json()) as Breed[]
      setRows(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load breeds')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const onCreate = async (payload: {
    name: string
    avgtime?: string | null
    avgcost?: number | null
  }) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/breeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to create breed')
      }
      await load()
      setToast('Breed created')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create breed')
    } finally {
      setLoading(false)
    }
  }

  const onUpdate = async (
    id: number,
    partial: { name?: string; avgtime?: string | null; avgcost?: number | null }
  ) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/breeds/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partial),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to update breed')
      }
      await load()
      setToast('Breed updated')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update breed')
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/breeds/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to delete breed')
      }
      await load()
      setToast('Breed deleted')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete breed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="main-content">
      <div className="content-wrapper">
        <div className="mb-4">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Breeds', current: true },
            ]}
          />
        </div>
        <BreedForm onCreate={onCreate} />
        {error ? (
          <div className="mt-4 text-red-600" role="alert" aria-live="polite">
            {error}
          </div>
        ) : null}
        {loading ? <div className="mt-4">Loading…</div> : null}
        <div className="mt-4">
          <BreedTable rows={rows} onUpdate={onUpdate} onDelete={onDelete} />
        </div>
        {toast ? (
          <Toast
            message={toast}
            type="success"
            onClose={() => setToast(null)}
          />
        ) : null}
      </div>
    </div>
  )
}
