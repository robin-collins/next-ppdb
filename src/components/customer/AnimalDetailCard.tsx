'use client'

import { formatDateAU } from '@/lib/date'

interface AnimalDetailCardProps {
  animal: {
    id: number
    name: string
    breed: string
    colour?: string
    sex: 'Male' | 'Female'
    lastVisit?: Date | string | null
    cost?: number | null
  }
  onDelete?: (id: number) => void
  onClick?: (id: number) => void
}

export default function AnimalDetailCard({
  animal,
  onDelete,
  onClick,
}: AnimalDetailCardProps) {
  const formatCost = (cost: number | null | undefined) => {
    if (!cost) return 'N/A'
    return `$${cost.toFixed(0)}`
  }

  return (
    <div
      className="animal-card group relative cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-indigo-600 hover:shadow-md"
      onClick={() => onClick?.(animal.id)}
    >
      {/* Gradient Top Border */}
      <div
        className="absolute top-0 right-0 left-0 h-1 rounded-t-2xl"
        style={{
          background:
            'linear-gradient(90deg, var(--primary), var(--secondary))',
        }}
      />

      {/* Header with Avatar and Delete Button */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
            style={{
              background:
                'linear-gradient(135deg, rgba(99, 102, 241, 0.7), var(--secondary))',
            }}
          >
            {animal.name.charAt(0).toUpperCase()}
          </div>
          {/* Name and Breed */}
          <div>
            <h3 className="text-lg font-bold text-gray-900">{animal.name}</h3>
            <p className="text-sm text-gray-600">{animal.breed}</p>
          </div>
        </div>

        {/* Delete Button */}
        {onDelete && (
          <button
            onClick={e => {
              e.stopPropagation()
              if (
                window.confirm(
                  `Are you sure you want to delete ${animal.name}? This action cannot be undone.`
                )
              ) {
                onDelete(animal.id)
              }
            }}
            className="rounded-lg p-1 text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-100 hover:text-red-600"
            aria-label="Delete animal"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {/* Color */}
        <div>
          <div className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Color
          </div>
          <div className="mt-1 font-medium text-gray-800">
            {animal.colour || 'Not specified'}
          </div>
        </div>

        {/* Sex */}
        <div>
          <div className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Sex
          </div>
          <div className="mt-1 font-medium text-gray-800">{animal.sex}</div>
        </div>

        {/* Last Visit */}
        <div>
          <div className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Last Visit
          </div>
          <div className="mt-1 font-medium text-gray-800">
            {animal.lastVisit ? formatDateAU(animal.lastVisit) : 'Never'}
          </div>
        </div>

        {/* Service Cost */}
        <div>
          <div className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Service Cost
          </div>
          <div className="mt-1 font-medium text-gray-800">
            {formatCost(animal.cost)}
          </div>
        </div>
      </div>
    </div>
  )
}
