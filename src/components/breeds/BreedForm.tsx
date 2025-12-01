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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
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
    <section
      className="add-breed-section"
      style={{
        animation: 'slideInUp 0.4s var(--ease-out) forwards',
      }}
      aria-labelledby="add-breed-title"
    >
      <div className="section-header">
        <svg
          className="section-icon"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
        <h2 className="section-title" id="add-breed-title">
          Add New Breed
        </h2>
      </div>

      <form
        className="form-grid"
        onSubmit={submit}
        aria-label="Add new breed form"
      >
        <div className="form-group">
          <label className="form-label" htmlFor="newBreedName">
            Breed Name
          </label>
          <input
            type="text"
            className="form-input"
            id="newBreedName"
            placeholder="Enter breed name (e.g., Golden Retriever)"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            aria-required="true"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="newBreedTime">
            Average Time (HH:MM:SS)
          </label>
          <input
            type="text"
            className="form-input"
            id="newBreedTime"
            placeholder="01:00:00 (default)"
            value={avgtime}
            onChange={e => setAvgtime(e.target.value)}
            pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
            aria-describedby="time-format-hint"
          />
          <span id="time-format-hint" className="mt-1 text-xs text-gray-500">
            Default: 01:00:00 (1 hour)
          </span>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="newBreedCost">
            Average Cost ($)
          </label>
          <input
            type="number"
            className="form-input"
            id="newBreedCost"
            placeholder="Auto (lowest existing)"
            value={avgcost}
            onChange={e =>
              setAvgcost(e.target.value === '' ? '' : Number(e.target.value))
            }
            min="0"
            step="1"
            aria-describedby="cost-hint"
          />
          <span id="cost-hint" className="mt-1 text-xs text-gray-500">
            Default: Lowest existing breed cost
          </span>
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          aria-label="Add new breed to database"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Add Breed
        </button>
      </form>
    </section>
  )
}
