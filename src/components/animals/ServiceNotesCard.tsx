'use client'
import { useState } from 'react'

interface Note {
  id: number
  animalId: number
  notes: string
  serviceDate: Date
}

interface ServiceNotesCardProps {
  notes: Note[]
  onAddNote: (text: string, serviceDate?: string) => Promise<void>
  onDeleteNote: (id: number) => Promise<void>
}

export default function ServiceNotesCard({
  notes,
  onAddNote,
  onDeleteNote,
}: ServiceNotesCardProps) {
  const [text, setText] = useState('')
  const [date, setDate] = useState('')

  const add = async () => {
    if (!text.trim()) return
    await onAddNote(text.trim(), date || undefined)
    setText('')
    setDate('')
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Service Notes</h3>
        <div className="flex gap-2">
          <input
            type="date"
            className="form-input"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
          <button className="btn btn-primary" onClick={add}>
            Add
          </button>
        </div>
      </div>
      <div className="card-content">
        <div className="form-group full-width">
          <label className="form-label">New note</label>
          <textarea
            className="form-textarea"
            value={text}
            onChange={e => setText(e.target.value)}
          />
        </div>
        <div className="mt-4">
          {notes.length === 0 ? (
            <div className="text-gray-500">No notes yet.</div>
          ) : (
            <ul className="flex flex-col gap-2">
              {notes.map(n => (
                <li key={n.id} className="list-item">
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">
                      {new Date(n.serviceDate).toLocaleDateString()}
                    </div>
                    <div>{n.notes}</div>
                  </div>
                  <button
                    className="btn btn-danger"
                    onClick={() => onDeleteNote(n.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
