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
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Breeds</h3>
      </div>
      <div className="card-content overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Avg Time</th>
              <th>Avg Cost</th>
              <th>Actions</th>
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
                      r.name
                    )}
                  </td>
                  <td>
                    {edit ? (
                      <input
                        className="form-input"
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
                      />
                    ) : (
                      r.avgtime || '—'
                    )}
                  </td>
                  <td>
                    {edit ? (
                      <input
                        type="number"
                        className="form-input"
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
                      />
                    ) : (
                      (r.avgcost ?? '—')
                    )}
                  </td>
                  <td className="flex gap-2">
                    {edit ? (
                      <>
                        <button
                          className="btn btn-primary"
                          onClick={() => save(r.id)}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-outline"
                          onClick={() => cancelEdit(r.id)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          aria-label={`Edit breed ${r.name}`}
                          className="btn btn-secondary"
                          onClick={() => startEdit(r)}
                        >
                          Edit
                        </button>
                        <button
                          aria-label={`Delete breed ${r.name}`}
                          className="btn btn-danger"
                          onClick={() => setConfirmId(r.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
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
    </div>
  )
}
