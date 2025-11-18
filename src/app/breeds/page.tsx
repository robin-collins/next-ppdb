'use client'
import { useCallback, useEffect, useState } from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import BreedForm from '@/components/breeds/BreedForm'
import BreedTable from '@/components/breeds/BreedTable'
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarPinned, setSidebarPinned] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

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

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // Search functionality can be implemented later if needed
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* MANDATORY: Header */}
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        onSearch={handleSearch}
        searchValue={searchQuery}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Breeds', current: true },
        ]}
      />

      {/* MANDATORY: Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        isPinned={sidebarPinned}
        onClose={() => setSidebarOpen(false)}
        onTogglePin={() => setSidebarPinned(!sidebarPinned)}
        currentPath="/breeds"
      />

      {/* Main content shifts when pinned */}
      <main
        className={`main-content ${sidebarPinned ? 'ml-[calc(var(--sidebar-width)+1.5rem)]' : ''}`}
      >
        <div className="content-wrapper">
          {/* Page Header */}
          <div className="page-header">
            <div className="page-title-section">
              <h1>Breed Management</h1>
              <p className="page-subtitle">
                Manage breed database with custom grooming times and pricing
              </p>
            </div>
          </div>

          {/* Add New Breed Section */}
          <BreedForm onCreate={onCreate} />

          {/* Error Display */}
          {error ? (
            <div
              className="mt-4 rounded-lg bg-red-50 p-4 text-red-600"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          ) : null}

          {/* Loading State */}
          {loading ? (
            <div className="mt-4 text-center text-gray-600">Loading…</div>
          ) : null}

          {/* Breed Table */}
          <div className="mt-8">
            <BreedTable rows={rows} onUpdate={onUpdate} onDelete={onDelete} />
          </div>

          {/* Toast Notification */}
          {toast ? (
            <Toast
              message={toast}
              type="success"
              onClose={() => setToast(null)}
            />
          ) : null}
        </div>
      </main>
    </div>
  )
}
