'use client'

import type { StaffWorkSummary } from '@/app/api/reports/staff-summary/route'

interface StaffWorkloadCardProps {
  staff: StaffWorkSummary[]
  loading?: boolean
}

// Color palette for staff badges - visually distinct colors
const BADGE_COLORS = [
  { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  {
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
  },
  { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-200' },
  { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200' },
  { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
]

function getColorForIndex(index: number) {
  return BADGE_COLORS[index % BADGE_COLORS.length]
}

export default function StaffWorkloadCard({
  staff,
  loading = false,
}: StaffWorkloadCardProps) {
  if (loading) {
    return (
      <div className="mt-8 rounded-lg border border-[var(--gray-200)] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[var(--gray-900)]">
          Staff Workload Summary
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--primary-light)] border-t-[var(--primary)]"></div>
          <span className="ml-3 text-[var(--gray-600)]">Loading...</span>
        </div>
      </div>
    )
  }

  if (staff.length === 0) {
    return (
      <div className="mt-8 rounded-lg border border-[var(--gray-200)] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[var(--gray-900)]">
          Staff Workload Summary
        </h3>
        <p className="text-center text-[var(--gray-500)]">
          No staff workload data available for this date.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-8 rounded-lg border border-[var(--gray-200)] bg-white p-6 shadow-sm print:mt-4 print:break-inside-avoid">
      <h3 className="mb-4 text-lg font-semibold text-[var(--gray-900)]">
        Staff Workload Summary
      </h3>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {staff.map((member, index) => {
          const color = getColorForIndex(index)
          const breedEntries = Object.entries(member.breeds).sort(
            (a, b) => b[1] - a[1]
          )

          return (
            <div
              key={member.initials}
              className={`rounded-lg border ${color.border} ${color.bg} p-4`}
            >
              {/* Staff Header */}
              <div className="mb-3 flex items-center justify-between">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${color.text} bg-white shadow-sm`}
                >
                  {member.initials}
                </span>
                <span
                  className={`text-lg font-bold ${color.text}`}
                  title="Total animals"
                >
                  {member.totalAnimals} animal
                  {member.totalAnimals !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Breed Breakdown */}
              <div className="space-y-1">
                {breedEntries.map(([breedName, count]) => (
                  <div
                    key={breedName}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate pr-2 text-[var(--gray-700)]">
                      {breedName}
                    </span>
                    <span className={`font-medium ${color.text}`}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Print Footer - Grand Total */}
      <div className="mt-4 flex justify-end border-t border-[var(--gray-200)] pt-4">
        <div className="text-right">
          <span className="text-sm text-[var(--gray-600)]">Total Staff: </span>
          <span className="font-bold text-[var(--gray-900)]">
            {staff.length}
          </span>
          <span className="mx-2 text-[var(--gray-400)]">|</span>
          <span className="text-sm text-[var(--gray-600)]">Total Jobs: </span>
          <span className="font-bold text-[var(--primary-dark)]">
            {staff.reduce((sum, s) => sum + s.totalAnimals, 0)}
          </span>
        </div>
      </div>
    </div>
  )
}
