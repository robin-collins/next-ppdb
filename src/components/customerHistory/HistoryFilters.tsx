'use client'
import { useState, useEffect } from 'react'

interface HistoryFiltersProps {
  defaultMonths?: 12 | 24 | 36
  defaultQuery?: string
  onChange: (filters: { months: 12 | 24 | 36; q: string }) => void
}

export default function HistoryFilters({
  defaultMonths = 12,
  defaultQuery = '',
  onChange,
}: HistoryFiltersProps) {
  const [months, setMonths] = useState<12 | 24 | 36>(defaultMonths)
  const [q, setQ] = useState(defaultQuery)

  useEffect(() => {
    onChange({ months, q })
  }, [months, q, onChange])

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Filters</h3>
      </div>
      <div className="card-content">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Inactive Period</label>
            <select
              className="form-select"
              value={months}
              onChange={e => setMonths(Number(e.target.value) as 12 | 24 | 36)}
            >
              <option value={12}>12+ months</option>
              <option value={24}>24+ months</option>
              <option value={36}>36+ months</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Search (name/email/phone)</label>
            <input
              className="form-input"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="e.g. Collins, 0412, john@"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
