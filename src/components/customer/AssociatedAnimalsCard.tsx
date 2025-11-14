'use client'

import AnimalDetailCard from './AnimalDetailCard'

interface Animal {
  id: number
  name: string
  breed: string
  sex: 'Male' | 'Female'
  colour?: string
  lastVisit?: Date | string | null
  cost?: number | null
}

interface AssociatedAnimalsCardProps {
  animals: Animal[]
  onAddAnimal?: () => void
  onDeleteAnimal?: (id: number) => void
  onClickAnimal?: (id: number) => void
}

export default function AssociatedAnimalsCard({
  animals,
  onAddAnimal,
  onDeleteAnimal,
  onClickAnimal,
}: AssociatedAnimalsCardProps) {
  return (
    <div className="card overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
        <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900">
          <svg
            className="h-5 w-5 text-indigo-600"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M4.5 6.75c0-.69.56-1.25 1.25-1.25h12.5c.69 0 1.25.56 1.25 1.25v10.5c0 .69-.56 1.25-1.25 1.25H5.75c-.69 0-1.25-.56-1.25-1.25V6.75zM12 15.25l5.5-5.5L16 8.25l-4 4-1.75-1.75L8.75 12 12 15.25z" />
          </svg>
          Associated Animals ({animals.length})
        </h2>
        <button
          onClick={onAddAnimal}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'var(--success)' }}
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
      </div>

      {/* Card Content */}
      <div className="p-6">
        {animals.length === 0 ? (
          <div className="py-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17L10.58 10.76C10.21 10.88 9.84 11 9.5 11C8.12 11 7 9.88 7 8.5C7 7.12 8.12 6 9.5 6C9.84 6 10.21 6.12 10.58 6.24L12.19 4.63C11.34 3.91 10.2 3.5 9 3.5C6.79 3.5 5 5.29 5 7.5S6.79 11.5 9 11.5C9.85 11.5 10.65 11.2 11.26 10.74L17.5 17H19.5L21 15.5V13.5L15.33 7.83L21 9Z" />
            </svg>
            <p className="mt-4 text-gray-600">
              No animals registered for this customer.
            </p>
            <button
              onClick={onAddAnimal}
              className="mt-4 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'var(--primary)' }}
            >
              Add First Animal
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {animals.map(animal => (
              <AnimalDetailCard
                key={animal.id}
                animal={animal}
                onDelete={onDeleteAnimal}
                onClick={onClickAnimal}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
