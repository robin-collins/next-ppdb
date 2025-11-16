'use client'

interface StatsBarProps {
  total: number
  oldestVisit: string | null
}

export default function StatsBar({ total, oldestVisit }: StatsBarProps) {
  return (
    <div className="card">
      <div className="card-content">
        <div className="flex gap-6">
          <div>
            <div className="meta-label">Total Inactive</div>
            <div className="meta-value">{total}</div>
          </div>
          <div>
            <div className="meta-label">Oldest Visit</div>
            <div className="meta-value">
              {oldestVisit ? new Date(oldestVisit).toLocaleDateString() : '—'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
