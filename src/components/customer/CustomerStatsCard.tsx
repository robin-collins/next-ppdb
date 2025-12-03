interface Animal {
  lastVisit?: Date | string | null
  cost?: number | null
  notesCount?: number
}

interface CustomerStatsCardProps {
  customer: {
    animalCount: number
    animals: Animal[]
    totalNotesCount?: number
    earliestNoteDate?: Date | string | null
    latestNoteDate?: Date | string | null
  }
}

export default function CustomerStatsCard({
  customer,
}: CustomerStatsCardProps) {
  // Calculate statistics based on actual notes data
  const calculateStats = () => {
    // Total visits = count of all notes across all animals
    const totalVisits = customer.totalNotesCount || 0

    // Years active = difference between earliest and latest note dates
    let yearsActiveDisplay = 'New'

    if (
      customer.earliestNoteDate &&
      customer.latestNoteDate &&
      totalVisits > 0
    ) {
      const earliest = new Date(customer.earliestNoteDate)
      const latest = new Date(customer.latestNoteDate)

      // Calculate years and months difference
      const yearsDiff = latest.getFullYear() - earliest.getFullYear()
      const monthsDiff = latest.getMonth() - earliest.getMonth()

      // Total months
      const totalMonths = yearsDiff * 12 + monthsDiff
      const years = Math.floor(totalMonths / 12)
      const months = totalMonths % 12

      if (years > 0 && months > 0) {
        yearsActiveDisplay = `${years}y ${months}m`
      } else if (years > 0) {
        yearsActiveDisplay = `${years} Year${years > 1 ? 's' : ''}`
      } else if (months > 0) {
        yearsActiveDisplay = `${months} Month${months > 1 ? 's' : ''}`
      } else {
        yearsActiveDisplay = '< 1m'
      }
    }

    // Total spent = sum of all animal costs
    const totalSpent = customer.animals.reduce((sum, animal) => {
      return sum + (animal.cost || 0)
    }, 0)

    return {
      yearsActive: yearsActiveDisplay,
      animals: customer.animalCount,
      totalVisits: totalVisits.toString(),
      totalSpent: totalSpent > 0 ? `$${Math.round(totalSpent)}` : '$0',
    }
  }

  const stats = calculateStats()

  return (
    <div className="card">
      {/* Card Header */}
      <div className="card-header">
        <h2 className="card-title">
          <svg
            className="card-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            ></path>
          </svg>
          Customer Statistics
        </h2>
      </div>

      {/* Card Content */}
      <div className="card-content">
        <div className="grid grid-cols-2 gap-4">
          {/* Years Active */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-center transition-all hover:shadow-md">
            <div
              className="text-2xl font-extrabold"
              style={{ color: 'var(--primary)' }}
            >
              {stats.yearsActive}
            </div>
            <div className="mt-1 text-xs font-semibold tracking-widest text-gray-500 uppercase">
              Years Active
            </div>
          </div>

          {/* Animals */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-center transition-all hover:shadow-md">
            <div
              className="text-2xl font-extrabold"
              style={{ color: 'var(--secondary)' }}
            >
              {stats.animals}
            </div>
            <div className="mt-1 text-xs font-semibold tracking-widest text-gray-500 uppercase">
              Animals
            </div>
          </div>

          {/* Total Visits */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-center transition-all hover:shadow-md">
            <div
              className="text-2xl font-extrabold"
              style={{ color: 'var(--accent)' }}
            >
              {stats.totalVisits}
            </div>
            <div className="mt-1 text-xs font-semibold tracking-widest text-gray-500 uppercase">
              Total Visits
            </div>
          </div>

          {/* Total Spent */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-center transition-all hover:shadow-md">
            <div
              className="text-2xl font-extrabold"
              style={{ color: 'var(--success)' }}
            >
              {stats.totalSpent}
            </div>
            <div className="mt-1 text-xs font-semibold tracking-widest text-gray-500 uppercase">
              Total Spent
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
