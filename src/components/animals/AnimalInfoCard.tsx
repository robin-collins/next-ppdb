'use client'
import { useState } from 'react'

interface AnimalInfoCardProps {
  animal: {
    id: number
    name: string
    breed: string
    sex: 'Male' | 'Female'
    colour: string | null
    cost: number
    lastVisit: Date | null
    thisVisit: Date | null
    comments: string | null
  }
  onUpdate: (partial: {
    name?: string
    breed?: string
    sex?: 'Male' | 'Female'
    colour?: string
    cost?: number
    lastVisit?: string
    thisVisit?: string
    comments?: string
  }) => Promise<void>
}

export default function AnimalInfoCard({
  animal,
  onUpdate,
}: AnimalInfoCardProps) {
  const [form, setForm] = useState({
    name: animal.name || '',
    breed: animal.breed || '',
    sex: animal.sex || 'Male',
    colour: animal.colour || '',
    cost: animal.cost || 0,
    lastVisit: animal.lastVisit
      ? new Date(animal.lastVisit).toISOString().slice(0, 10)
      : '',
    thisVisit: animal.thisVisit
      ? new Date(animal.thisVisit).toISOString().slice(0, 10)
      : '',
    comments: animal.comments || '',
  })

  const save = async () => {
    await onUpdate({
      name: form.name,
      breed: form.breed,
      sex: form.sex as 'Male' | 'Female',
      colour: form.colour || undefined,
      cost: Number(form.cost) || 0,
      lastVisit: form.lastVisit || undefined,
      thisVisit: form.thisVisit || undefined,
      comments: form.comments || undefined,
    })
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Details</h3>
        <button className="btn btn-primary" onClick={save}>
          Save
        </button>
      </div>
      <div className="card-content">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              className="form-input"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Breed</label>
            <input
              className="form-input"
              value={form.breed}
              onChange={e => setForm({ ...form, breed: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Sex</label>
            <select
              className="form-select"
              value={form.sex}
              onChange={e =>
                setForm({ ...form, sex: e.target.value as 'Male' | 'Female' })
              }
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Colour</label>
            <input
              className="form-input"
              value={form.colour}
              onChange={e => setForm({ ...form, colour: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Cost</label>
            <input
              type="number"
              className="form-input"
              value={form.cost}
              onChange={e => setForm({ ...form, cost: Number(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Last Visit</label>
            <input
              type="date"
              className="form-input"
              value={form.lastVisit}
              onChange={e => setForm({ ...form, lastVisit: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">This Visit</label>
            <input
              type="date"
              className="form-input"
              value={form.thisVisit}
              onChange={e => setForm({ ...form, thisVisit: e.target.value })}
            />
          </div>
          <div className="form-group full-width">
            <label className="form-label">Comments</label>
            <textarea
              className="form-textarea"
              value={form.comments}
              onChange={e => setForm({ ...form, comments: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
