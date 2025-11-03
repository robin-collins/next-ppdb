import AnimalCard from './AnimalCard'

interface Animal {
  id: number
  name: string
  breed: string
  colour: string | null
  customer: {
    surname: string
    phone1?: string | null
  }
  lastVisit: Date
  cost: number
  relevanceScore?: number
}

interface ResultsViewProps {
  animals: Animal[]
  query: string
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  onAnimalClick: (id: number) => void
}

export default function ResultsView({
  animals,
  query,
  viewMode,
  onViewModeChange,
  onAnimalClick,
}: ResultsViewProps) {
  return (
    <div className="p-6">
      {/* Results Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="mb-1 text-2xl font-bold text-gray-800">
            {animals.length} Animal{animals.length !== 1 ? 's' : ''} Found
          </h2>
          <div className="text-sm text-gray-600">
            Search results for{' '}
            <span className="bg-primary-light text-primary rounded px-2 py-1 font-semibold">
              {query}
            </span>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`flex items-center gap-2 rounded-md px-3 py-2 transition-all ${
              viewMode === 'grid'
                ? 'text-primary bg-white shadow-sm'
                : 'text-gray-600'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
            </svg>
            Cards
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`flex items-center gap-2 rounded-md px-3 py-2 transition-all ${
              viewMode === 'list'
                ? 'text-primary bg-white shadow-sm'
                : 'text-gray-600'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
            </svg>
            List
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {animals.map((animal, index) => (
            <div
              key={animal.id}
              style={{ animationDelay: `${index * 0.05}s` }}
              className="animate-[slideInUp_0.4s_ease-out_forwards]"
            >
              <AnimalCard animal={animal} onClick={onAnimalClick} />
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          {animals.map((animal, index) => {
            const initials = animal.name.charAt(0).toUpperCase()
            const formattedDate = new Date(animal.lastVisit).toLocaleDateString(
              'en-US',
              {
                month: 'short',
                day: 'numeric',
              }
            )

            return (
              <div
                key={animal.id}
                onClick={() => onAnimalClick(animal.id)}
                style={{ animationDelay: `${index * 0.05}s` }}
                className={`hover:bg-primary-light flex cursor-pointer items-center gap-4 border-b border-gray-100 px-4 py-3 transition-all last:border-b-0 hover:shadow-[0_0_0_1px_rgba(99,102,241,0.1),0_4px_12px_rgba(99,102,241,0.15),inset_0_1px_0_rgba(255,255,255,0.1)] ${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <div className="from-primary-light to-secondary text-primary hover:from-primary hover:to-secondary flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold transition-all hover:scale-105 hover:text-white">
                  {initials}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-800">
                    {animal.name}
                  </h4>
                  <div className="text-xs text-gray-600">
                    {animal.breed} • {animal.customer.surname}
                  </div>
                </div>
                {animal.relevanceScore !== undefined && (
                  <div className="min-w-[60px] text-center text-xs text-gray-600">
                    Score: {animal.relevanceScore}
                  </div>
                )}
                <div className="min-w-[80px] text-center text-sm text-gray-700">
                  {animal.customer.phone1 || 'N/A'}
                </div>
                <div className="min-w-[80px] text-center text-sm text-gray-700">
                  {formattedDate}
                </div>
                <div className="text-primary min-w-[60px] text-right text-sm font-semibold">
                  ${animal.cost}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
