'use client'
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import PricingModifier from './PricingModifier'

interface BreedRow {
  id: number
  name: string
  avgtime: string | null
  avgcost: number | null
}

interface BreedTableProps {
  rows: BreedRow[]
  onUpdate: (
    id: number,
    partial: { name?: string; avgtime?: string | null; avgcost?: number | null }
  ) => Promise<void>
  onDelete: (id: number, migrateToBreedId?: number) => Promise<void>
  onPricingUpdated?: () => void
  onToast?: (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning'
  ) => void
}

// State for delete confirmation
interface DeleteConfirmState {
  id: number
  name: string
  typedName: string
  animalCount: number | null // null = loading, 0 = no animals
  loading: boolean
  migrateToBreedId: number | null
  rowRect: DOMRect | null // For positioning the modal
}

// State for pricing modifier
interface PricingState {
  breedId?: number
  breedName?: string
  currentAvgcost?: number | null
}

export default function BreedTable({
  rows,
  onUpdate,
  onDelete,
  onPricingUpdated,
  onToast,
}: BreedTableProps) {
  const [editing, setEditing] = useState<Record<number, BreedRow>>({})
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState | null>(
    null
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [globalPricingOpen, setGlobalPricingOpen] = useState(false)
  const [individualPricing, setIndividualPricing] =
    useState<PricingState | null>(null)
  const deleteInputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Focus input when delete confirmation opens and loading is done
  useEffect(() => {
    if (deleteConfirm && !deleteConfirm.loading && deleteInputRef.current) {
      deleteInputRef.current.focus()
    }
  }, [deleteConfirm])

  // Handle escape key to cancel delete
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (deleteConfirm && e.key === 'Escape') {
        setDeleteConfirm(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [deleteConfirm])

  // Fetch animal count when initiating delete (without actually deleting)
  const initiateDelete = useCallback(
    async (breed: BreedRow, buttonElement: HTMLElement) => {
      const rect = buttonElement.getBoundingClientRect()

      setDeleteConfirm({
        id: breed.id,
        name: breed.name,
        typedName: '',
        animalCount: null,
        loading: true,
        migrateToBreedId: null,
        rowRect: rect,
      })

      // Fetch the animal count via GET with a check parameter
      try {
        const res = await fetch(`/api/breeds/${breed.id}/animals/count`)
        if (res.ok) {
          const data = await res.json()
          setDeleteConfirm(prev =>
            prev
              ? {
                  ...prev,
                  animalCount: data.count ?? 0,
                  loading: false,
                }
              : null
          )
        } else {
          // Endpoint doesn't exist or error - assume 0 and proceed with confirmation
          setDeleteConfirm(prev =>
            prev
              ? {
                  ...prev,
                  animalCount: 0,
                  loading: false,
                }
              : null
          )
        }
      } catch {
        // Error fetching - assume 0 animals and show confirmation anyway
        setDeleteConfirm(prev =>
          prev
            ? {
                ...prev,
                animalCount: 0,
                loading: false,
              }
            : null
        )
      }
    },
    []
  )

  // Get other breeds for migration dropdown
  const otherBreeds = useMemo(() => {
    if (!deleteConfirm) return []
    return rows
      .filter(r => r.id !== deleteConfirm.id)
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [rows, deleteConfirm])

  // Filter by search query
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows
    const query = searchQuery.toLowerCase()
    return rows.filter(row => row.name.toLowerCase().includes(query))
  }, [rows, searchQuery])

  // Pricing success/error handlers
  const handlePricingSuccess = useCallback(
    (message: string) => {
      onToast?.(message, 'success')
      onPricingUpdated?.()
    },
    [onToast, onPricingUpdated]
  )

  const handlePricingError = useCallback(
    (message: string) => {
      onToast?.(message, 'error')
    },
    [onToast]
  )

  // Open individual pricing for a breed
  const openIndividualPricing = useCallback((breed: BreedRow) => {
    setGlobalPricingOpen(false) // Close global if open
    setIndividualPricing({
      breedId: breed.id,
      breedName: breed.name,
      currentAvgcost: breed.avgcost,
    })
  }, [])

  const startEdit = (row: BreedRow) => {
    setEditing(prev => ({ ...prev, [row.id]: { ...row } }))
  }
  const cancelEdit = (id: number) => {
    setEditing(prev => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
  }
  const save = async (id: number) => {
    const row = editing[id]
    if (!row) return
    await onUpdate(id, {
      name: row.name,
      avgtime: row.avgtime,
      avgcost: row.avgcost,
    })
    cancelEdit(id)
  }

  // Helper to format avgtime from ISO date to HH:MM:SS
  const formatTime = (isoTime: string | null): string => {
    if (!isoTime) return '—'
    try {
      // If it matches HH:MM:SS format, return as is
      if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(isoTime)) return isoTime

      const date = new Date(isoTime)
      if (isNaN(date.getTime())) return isoTime

      const hours = date.getUTCHours().toString().padStart(2, '0')
      const mins = date.getUTCMinutes().toString().padStart(2, '0')
      const secs = date.getUTCSeconds().toString().padStart(2, '0')
      return `${hours}:${mins}:${secs}`
    } catch {
      return isoTime // Return as-is if already formatted
    }
  }

  return (
    <section
      className="breed-management"
      style={{
        animation: 'slideInUp 0.4s var(--ease-out) 0.1s forwards',
        opacity: 0,
        animationFillMode: 'forwards',
      }}
      aria-labelledby="breed-database-title"
    >
      <div className="management-header">
        <div className="section-header">
          <svg
            className="section-icon"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <h2 className="section-title" id="breed-database-title">
            Existing Breeds Database
          </h2>
          {/* Global Pricing Button */}
          <button
            onClick={() => {
              setIndividualPricing(null) // Close individual if open
              setGlobalPricingOpen(!globalPricingOpen)
            }}
            className={`ml-4 flex items-center gap-2 rounded-lg border-2 px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
              globalPricingOpen
                ? 'border-indigo-600 bg-indigo-600 text-white shadow-md'
                : 'border-indigo-300 bg-indigo-50 text-indigo-700 hover:scale-105 hover:border-indigo-500 hover:bg-indigo-100 hover:shadow-md'
            }`}
            title="Modify pricing for all breeds"
            aria-expanded={globalPricingOpen}
            aria-controls="global-pricing-panel"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
            </svg>
            Modify All Pricing
          </button>
        </div>

        <div className="controls-section" role="search">
          <div className="search-box">
            <svg
              className="breed-search-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <input
              type="text"
              className="breed-search-input"
              id="breedSearch"
              placeholder="Search breeds..."
              aria-label="Search breeds"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Global Pricing Modifier Panel */}
      {globalPricingOpen && (
        <div id="global-pricing-panel">
          <PricingModifier
            onClose={() => setGlobalPricingOpen(false)}
            onSuccess={handlePricingSuccess}
            onError={handlePricingError}
          />
        </div>
      )}

      <div className="breed-table-container">
        <table className="breed-table" aria-label="Breed management table">
          <thead>
            <tr>
              <th scope="col">Breed Name</th>
              <th scope="col">Average Time</th>
              <th scope="col">Average Cost</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map(r => {
              const edit = editing[r.id]
              const breedRow = (
                <tr>
                  <td>
                    {edit ? (
                      <input
                        className="form-input"
                        value={edit.name}
                        onChange={e =>
                          setEditing(prev => ({
                            ...prev,
                            [r.id]: { ...prev[r.id], name: e.target.value },
                          }))
                        }
                      />
                    ) : (
                      <div className="breed-name">{r.name}</div>
                    )}
                  </td>
                  <td>
                    {edit ? (
                      <input
                        className="time-input"
                        value={
                          formatTime(edit.avgtime) === '—'
                            ? ''
                            : formatTime(edit.avgtime)
                        }
                        onChange={e =>
                          setEditing(prev => ({
                            ...prev,
                            [r.id]: {
                              ...prev[r.id],
                              avgtime: e.target.value || null,
                            },
                          }))
                        }
                        pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
                        title="Format: HH:MM:SS"
                        aria-label={`Average time for ${r.name}`}
                      />
                    ) : (
                      formatTime(r.avgtime)
                    )}
                  </td>
                  <td>
                    {edit ? (
                      <input
                        type="number"
                        className="cost-input"
                        value={edit.avgcost ?? ''}
                        onChange={e =>
                          setEditing(prev => ({
                            ...prev,
                            [r.id]: {
                              ...prev[r.id],
                              avgcost:
                                e.target.value === ''
                                  ? null
                                  : Number(e.target.value),
                            },
                          }))
                        }
                        min="0"
                        step="1"
                        aria-label={`Average cost for ${r.name}`}
                      />
                    ) : r.avgcost !== null ? (
                      `$${r.avgcost}`
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {edit ? (
                        <>
                          <button
                            className="btn btn-success btn-small"
                            onClick={() => save(r.id)}
                            title={`Save ${r.name}`}
                            aria-label={`Save ${r.name}`}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path d="M17 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
                            </svg>
                          </button>
                          <button
                            className="btn btn-secondary btn-small"
                            onClick={() => cancelEdit(r.id)}
                            title="Cancel edit"
                            aria-label="Cancel edit"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            aria-label={`Edit breed ${r.name}`}
                            className="btn btn-small border-transparent bg-transparent text-gray-400 transition-all duration-200 hover:text-amber-500 hover:[&>svg]:drop-shadow-[0_0_5px_rgba(245,158,11,0.9)]"
                            onClick={() => startEdit(r)}
                            title={`Edit ${r.name}`}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                            </svg>
                          </button>
                          <button
                            aria-label={`Delete breed ${r.name}`}
                            className="btn btn-small border-transparent bg-transparent text-gray-400 transition-all duration-200 hover:text-red-500 hover:[&>svg]:drop-shadow-[0_0_5px_rgba(239,68,68,0.9)]"
                            onClick={e =>
                              initiateDelete(r, e.currentTarget as HTMLElement)
                            }
                            title={`Delete ${r.name}`}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                            </svg>
                          </button>
                          <button
                            aria-label={`Modify pricing for ${r.name}`}
                            className={`btn btn-small border-transparent bg-transparent transition-all duration-200 ${
                              individualPricing?.breedId === r.id
                                ? 'text-green-600 [&>svg]:drop-shadow-[0_0_5px_rgba(34,197,94,0.9)]'
                                : 'text-gray-400 hover:text-green-500 hover:[&>svg]:drop-shadow-[0_0_5px_rgba(34,197,94,0.9)]'
                            }`}
                            onClick={() => openIndividualPricing(r)}
                            title={`Modify pricing for ${r.name}`}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )

              // Show individual pricing modifier after the selected breed row
              const showPricingModifier = individualPricing?.breedId === r.id

              return (
                <React.Fragment key={r.id}>
                  {breedRow}
                  {showPricingModifier && (
                    <tr>
                      <td colSpan={4} className="p-0">
                        <PricingModifier
                          breedId={individualPricing.breedId}
                          breedName={individualPricing.breedName}
                          currentAvgcost={individualPricing.currentAvgcost}
                          onClose={() => setIndividualPricing(null)}
                          onSuccess={handlePricingSuccess}
                          onError={handlePricingError}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Floating Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-[400] flex items-start justify-center"
          style={{
            paddingTop: deleteConfirm.rowRect
              ? `${Math.max(100, deleteConfirm.rowRect.top - 50)}px`
              : '100px',
          }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDeleteConfirm(null)}
          />

          {/* Modal */}
          <div
            ref={modalRef}
            className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl"
            style={{
              animation: 'slideInUp 0.2s ease-out',
              border: '2px solid #ef4444',
            }}
          >
            {deleteConfirm.loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-200 border-t-red-600" />
                <span className="ml-3 text-gray-600">
                  Checking for associated animals...
                </span>
              </div>
            ) : (
              <DeleteModalContent
                deleteConfirm={deleteConfirm}
                setDeleteConfirm={setDeleteConfirm}
                otherBreeds={otherBreeds}
                onDelete={onDelete}
                deleteInputRef={deleteInputRef}
              />
            )}
          </div>
        </div>
      )}
    </section>
  )
}

/* Separate component to avoid complex inline JSX */
function DeleteModalContent({
  deleteConfirm,
  setDeleteConfirm,
  otherBreeds,
  onDelete,
  deleteInputRef,
}: {
  deleteConfirm: DeleteConfirmState
  setDeleteConfirm: React.Dispatch<
    React.SetStateAction<DeleteConfirmState | null>
  >
  otherBreeds: BreedRow[]
  onDelete: (id: number, migrateToBreedId?: number) => Promise<void>
  deleteInputRef: React.RefObject<HTMLInputElement | null>
}) {
  const hasAnimals = (deleteConfirm.animalCount ?? 0) > 0
  const canDelete =
    deleteConfirm.typedName === deleteConfirm.name &&
    (!hasAnimals || deleteConfirm.migrateToBreedId !== null)

  return (
    <>
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 rounded-full bg-red-100 p-3">
          <svg
            className="h-6 w-6 text-red-600"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-red-700">
            Delete &quot;{deleteConfirm.name}&quot;?
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            This action <strong>cannot be undone</strong>.
          </p>
        </div>
        <button
          className="ml-auto text-gray-400 hover:text-gray-600"
          onClick={() => setDeleteConfirm(null)}
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>

      {/* Animal warning */}
      {hasAnimals && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-800">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
            </svg>
            <strong>{deleteConfirm.animalCount} animal(s)</strong> use this
            breed
          </div>
          <p className="mt-2 text-sm text-amber-700">
            Select a breed to migrate these animals to before deleting:
          </p>
          <select
            className="mt-2 w-full rounded-md border border-amber-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
            value={deleteConfirm.migrateToBreedId ?? ''}
            onChange={e =>
              setDeleteConfirm(prev =>
                prev
                  ? {
                      ...prev,
                      migrateToBreedId: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    }
                  : null
              )
            }
          >
            <option value="">-- Select a breed --</option>
            {otherBreeds.map(b => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Type to confirm */}
      <div className="mt-4">
        <label
          htmlFor="confirm-breed-name"
          className="block text-sm font-medium text-gray-700"
        >
          To confirm, type{' '}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-red-600">
            {deleteConfirm.name}
          </code>{' '}
          below:
        </label>
        <input
          ref={deleteInputRef}
          id="confirm-breed-name"
          type="text"
          className="mt-2 w-full rounded-md border border-red-300 px-3 py-2 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
          placeholder={`Type "${deleteConfirm.name}" to confirm`}
          value={deleteConfirm.typedName}
          onChange={e =>
            setDeleteConfirm(prev =>
              prev ? { ...prev, typedName: e.target.value } : null
            )
          }
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {/* Buttons */}
      <div className="mt-6 flex gap-3">
        <button
          className={`flex-1 rounded-lg px-4 py-2.5 font-medium transition-all ${
            canDelete
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'cursor-not-allowed bg-gray-200 text-gray-400'
          }`}
          disabled={!canDelete}
          onClick={async () => {
            if (canDelete) {
              await onDelete(
                deleteConfirm.id,
                deleteConfirm.migrateToBreedId ?? undefined
              )
              setDeleteConfirm(null)
            }
          }}
        >
          <span className="flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
            </svg>
            {hasAnimals
              ? `Delete & Migrate ${deleteConfirm.animalCount} Animals`
              : 'Delete Breed'}
          </span>
        </button>
        <button
          className="rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
          onClick={() => setDeleteConfirm(null)}
        >
          Cancel
        </button>
      </div>
    </>
  )
}
