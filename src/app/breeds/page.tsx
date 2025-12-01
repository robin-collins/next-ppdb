'use client'
import { useCallback, useEffect, useState } from 'react'
import { useSidebarState } from '@/hooks/useSidebarState'
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

interface ToastState {
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

export default function BreedsPage() {
  const [rows, setRows] = useState<Breed[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const {
    sidebarOpen,
    sidebarPinned,
    skipTransition,
    setSidebarOpen,
    toggleSidebar,
    togglePin,
  } = useSidebarState()
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
      setToast({ message: 'Breed created', type: 'success' })
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Failed to create breed'
      setToast({ message: errorMsg, type: 'error' })
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
      setToast({ message: 'Breed updated', type: 'success' })
    } catch (e) {
      setToast({
        message: e instanceof Error ? e.message : 'Failed to update breed',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async (id: number, migrateToBreedId?: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/breeds/${id}`, {
        method: 'DELETE',
        headers: migrateToBreedId ? { 'Content-Type': 'application/json' } : {},
        body: migrateToBreedId
          ? JSON.stringify({ migrateToBreedId })
          : undefined,
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to delete breed')
      }
      const result = await res.json()
      await load()
      if (result.migratedAnimals > 0) {
        setToast({
          message: `Breed deleted, ${result.migratedAnimals} animal(s) migrated`,
          type: 'success',
        })
      } else {
        setToast({ message: 'Breed deleted', type: 'success' })
      }
    } catch (e) {
      setToast({
        message: e instanceof Error ? e.message : 'Failed to delete breed',
        type: 'error',
      })
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
        onToggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        sidebarPinned={sidebarPinned}
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
        onTogglePin={togglePin}
        currentPath="/breeds"
        skipTransition={skipTransition}
      />

      {/* Main content shifts when pinned */}
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
        <div>
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
            <BreedTable
              rows={rows}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onPricingUpdated={load}
              onToast={(message, type) => setToast({ message, type })}
            />
          </div>

          {/* Toast Notification */}
          {toast ? (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          ) : null}
        </div>
      </main>
    </div>
  )
}
