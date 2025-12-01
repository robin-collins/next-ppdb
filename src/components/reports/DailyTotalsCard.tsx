'use client'

interface DailyTotalsCardProps {
  dateTime: string
  totalAnimals: number
  totalRevenue: number
}

export default function DailyTotalsCard({
  dateTime,
  totalAnimals,
  totalRevenue,
}: DailyTotalsCardProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Daily Totals</h3>
      </div>
      <div className="card-content">
        <div className="flex gap-8">
          <div>
            <div className="meta-label">Report Generated</div>
            <div className="meta-value">
              {new Date(dateTime).toLocaleString()}
            </div>
          </div>
          <div>
            <div className="meta-label">Total Animals</div>
            <div className="meta-value">{totalAnimals}</div>
          </div>
          <div>
            <div className="meta-label">Total Revenue</div>
            <div className="meta-value">${totalRevenue.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
