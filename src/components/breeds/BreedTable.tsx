'use client'
import { useState } from 'react'

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
  onDelete: (id: number) => Promise<void>
}

export default function BreedTable({
  rows,
  onUpdate,
  onDelete,
}: BreedTableProps) {
  const [editing, setEditing] = useState<Record<number, BreedRow>>({})
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const ConfirmDialog = require('../ConfirmDialog').default

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

  return (
    <section
      className="breed-management"
      style={{
        animation: 'slideInUp 0.4s var(--ease-out) 0.1s forwards',
        opacity: 0,
      }}
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
          <h2 className="section-title">Existing Breeds Database</h2>
        </div>
      </div>

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
            {rows.map(r => {
              const edit = editing[r.id]
              return (
                <tr key={r.id}>
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
                        value={edit.avgtime || ''}
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
                      r.avgtime || '—'
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
                        step="5"
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
                            title={`Update ${r.name}`}
                            aria-label={`Update ${r.name}`}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1-2.73 2.71-2.73 7.08 0 9.79 2.73 2.71 7.15 2.71 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.88 4.55-2.64 6.29-3.51 3.48-9.21 3.48-12.72 0-3.5-3.47-3.53-9.11-.02-12.58 3.51-3.47 9.14-3.47 12.65 0L21 3v7.12z" />
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
                            className="btn btn-secondary btn-small"
                            onClick={() => startEdit(r)}
                            title={`Edit ${r.name}`}
                          >
                            Edit
                          </button>
                          <button
                            aria-label={`Delete breed ${r.name}`}
                            className="btn btn-danger btn-small"
                            onClick={() => setConfirmId(r.id)}
                            title={`Delete ${r.name}`}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={confirmId !== null}
        title="Delete breed"
        message="Are you sure you want to delete this breed? This cannot be undone."
        confirmText="Delete"
        onConfirm={async () => {
          if (confirmId !== null) {
            await onDelete(confirmId)
            setConfirmId(null)
          }
        }}
        onCancel={() => setConfirmId(null)}
      />
    </section>
  )
}
