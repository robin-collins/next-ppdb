'use client'

interface QuickActionsCardProps {
  customerId: number
  onUpdateRecord?: () => void
  onAddAnimal?: () => void
  onViewAnimals?: () => void
  onViewHistory?: () => void
  onDeleteCustomer?: () => void
}

export default function QuickActionsCard({
  customerId: _customerId,
  onUpdateRecord,
  onAddAnimal,
  onViewAnimals,
  onViewHistory,
  onDeleteCustomer,
}: QuickActionsCardProps) {
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
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Quick Actions
        </h2>
      </div>

      {/* Card Content */}
      <div className="p-6">
        <div className="flex flex-col gap-3">
          {/* Update Record */}
          <button
            onClick={onUpdateRecord}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--primary)' }}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Update Record
          </button>

          {/* Add New Animal */}
          <button
            onClick={onAddAnimal}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--success)' }}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add New Animal
          </button>

          {/* View All Animals */}
          <button
            onClick={onViewAnimals}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--secondary)' }}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17L10.58 10.76C10.21 10.88 9.84 11 9.5 11C8.12 11 7 9.88 7 8.5C7 7.12 8.12 6 9.5 6C9.84 6 10.21 6.12 10.58 6.24L12.19 4.63C11.34 3.91 10.2 3.5 9 3.5C6.79 3.5 5 5.29 5 7.5S6.79 11.5 9 11.5C9.85 11.5 10.65 11.2 11.26 10.74L17.5 17H19.5L21 15.5V13.5L15.33 7.83L21 9Z" />
            </svg>
            View All Animals
          </button>

          {/* Customer History */}
          <button
            onClick={onViewHistory}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--accent)' }}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Customer History
          </button>

          {/* Delete Customer */}
          <button
            onClick={onDeleteCustomer}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--error)' }}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
            Delete Customer
          </button>
        </div>
      </div>
    </div>
  )
}
