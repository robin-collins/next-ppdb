'use client'

import { formatDateAU } from '@/lib/date'

interface Animal {
  id: number
  name: string
  breed: string
  sex: 'Male' | 'Female'
  colour?: string
  lastVisit?: Date | string | null
  thisVisit?: Date | string | null
}

interface CustomerHeaderProps {
  customer: {
    id: number
    surname: string
    firstname: string | null
    phone1: string | null
    email?: string | null
    animalCount: number
    animals: Animal[]
  }
  onEdit?: () => void
  onAddAnimal?: () => void
  onViewHistory?: () => void
}

export default function CustomerHeader({
  customer,
  onEdit,
  onAddAnimal,
  onViewHistory,
}: CustomerHeaderProps) {
  const fullName =
    [customer.firstname, customer.surname].filter(Boolean).join(' ') ||
    customer.surname

  // Get customer status based on first visit
  const getCustomerStatus = () => {
    // For now, default to Active - in future could calculate from first visit year
    return {
      label: 'Active',
      className: 'bg-green-100 text-green-800',
    }
  }

  const status = getCustomerStatus()

  // Get last visit date from most recent animal visit
  const getLastVisit = () => {
    if (!customer.animals || customer.animals.length === 0) return null

    const lastVisits = customer.animals
      .map(animal => animal.lastVisit)
      .filter(Boolean)
      .map(date => new Date(date as string))
      .sort((a, b) => b.getTime() - a.getTime())

    return lastVisits.length > 0 ? lastVisits[0] : null
  }

  const lastVisit = getLastVisit()

  const formatDate = (date: Date) => {
    return formatDateAU(date)
  }

  return (
    <div className="mb-8 flex flex-col gap-6 border-b border-gray-200 pb-6 md:flex-row">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div
          className="flex h-[120px] w-[120px] items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 to-indigo-600 text-5xl font-extrabold text-white shadow-lg"
          style={{
            background:
              'linear-gradient(135deg, var(--secondary), var(--primary))',
          }}
        >
          {customer.surname.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Customer Info */}
      <div className="flex-1">
        {/* Name and Status Badge */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h1 className="text-4xl font-extrabold text-gray-900">{fullName}</h1>
          <span
            className={`rounded-full px-4 py-1 text-sm font-semibold ${status.className}`}
          >
            {status.label}
          </span>
        </div>

        {/* Meta Grid */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {/* Customer Since */}
          <div>
            <div className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Customer Since
            </div>
            <div className="mt-1 text-base font-semibold text-gray-800">
              {new Date().getFullYear() - 5}
            </div>
          </div>

          {/* Primary Phone */}
          <div>
            <div className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Primary Phone
            </div>
            <div className="mt-1 text-base font-semibold text-gray-800">
              {customer.phone1 || 'N/A'}
            </div>
          </div>

          {/* Animals */}
          <div>
            <div className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Animals
            </div>
            <div className="mt-1 text-base font-semibold text-gray-800">
              {customer.animalCount}{' '}
              {customer.animalCount === 1 ? 'Pet' : 'Pets'}
            </div>
          </div>

          {/* Last Visit */}
          <div>
            <div className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Last Visit
            </div>
            <div className="mt-1 text-base font-semibold text-gray-800">
              {lastVisit ? formatDate(lastVisit) : 'N/A'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-indigo-700"
            style={{
              background: 'var(--primary)',
            }}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Customer
          </button>

          <button
            onClick={onAddAnimal}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5"
            style={{
              background: 'var(--success)',
            }}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Animal
          </button>

          <button
            onClick={onViewHistory}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5"
            style={{
              background: 'var(--secondary)',
            }}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Full History
          </button>
        </div>
      </div>
    </div>
  )
}
