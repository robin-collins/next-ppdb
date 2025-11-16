'use client'
import { useState } from 'react'

interface BreedFormProps {
  onCreate: (payload: {
    name: string
    avgtime?: string | null
    avgcost?: number | null
  }) => Promise<void>
}

export default function BreedForm({ onCreate }: BreedFormProps) {
  const [name, setName] = useState('')
  const [avgtime, setAvgtime] = useState('')
  const [avgcost, setAvgcost] = useState<number | ''>('')

  const submit = async () => {
    if (!name.trim()) return
    await onCreate({
      name: name.trim(),
      avgtime: avgtime || null,
      avgcost: avgcost === '' ? null : Number(avgcost),
    })
    setName('')
    setAvgtime('')
    setAvgcost('')
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Add Breed</h3>
        <button className="btn btn-primary" onClick={submit}>
          Create
        </button>
      </div>
      <div className="card-content">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Avg Time</label>
            <input
              className="form-input"
              value={avgtime}
              onChange={e => setAvgtime(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Avg Cost</label>
            <input
              type="number"
              className="form-input"
              value={avgcost}
              onChange={e =>
                setAvgcost(e.target.value === '' ? '' : Number(e.target.value))
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
