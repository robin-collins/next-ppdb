'use client'

interface Animal {
  lastVisit?: Date | string | null
  cost?: number | null
}

interface CustomerStatsCardProps {
  customer: {
    animalCount: number
    animals: Animal[]
  }
}

export default function CustomerStatsCard({
  customer,
}: CustomerStatsCardProps) {
  // Calculate statistics
  const calculateStats = () => {
    const yearsActive = 10 // Placeholder - would calculate from first visit

    const totalVisits = customer.animals.length * 5 // Placeholder

    const totalSpent = customer.animals.reduce((sum, animal) => {
      return sum + (animal.cost || 0)
    }, 0)

    return {
      yearsActive: yearsActive > 0 ? `${yearsActive}+` : '< 1',
      animals: customer.animalCount,
      totalVisits: totalVisits > 0 ? `${totalVisits}+` : '0',
      totalSpent: totalSpent > 0 ? `$${Math.round(totalSpent)}+` : '$0',
    }
  }

  const stats = calculateStats()

  return (
    <div className="card overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
      {/* Card Header */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900">
          <svg
            className="h-5 w-5 text-indigo-600"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
          </svg>
          Customer Statistics
        </h2>
      </div>

      {/* Card Content */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Years Active */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
            <div
              className="text-2xl font-extrabold"
              style={{ color: 'var(--primary)' }}
            >
              {stats.yearsActive}
            </div>
            <div className="mt-1 text-xs font-semibold tracking-widest text-gray-600 uppercase">
              Years Active
            </div>
          </div>

          {/* Animals */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
            <div
              className="text-2xl font-extrabold"
              style={{ color: 'var(--primary)' }}
            >
              {stats.animals}
            </div>
            <div className="mt-1 text-xs font-semibold tracking-widest text-gray-600 uppercase">
              Animals
            </div>
          </div>

          {/* Total Visits */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
            <div
              className="text-2xl font-extrabold"
              style={{ color: 'var(--primary)' }}
            >
              {stats.totalVisits}
            </div>
            <div className="mt-1 text-xs font-semibold tracking-widest text-gray-600 uppercase">
              Total Visits
            </div>
          </div>

          {/* Total Spent */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
            <div
              className="text-2xl font-extrabold"
              style={{ color: 'var(--primary)' }}
            >
              {stats.totalSpent}
            </div>
            <div className="mt-1 text-xs font-semibold tracking-widest text-gray-600 uppercase">
              Total Spent
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
