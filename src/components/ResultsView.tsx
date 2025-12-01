import AnimalCard from './AnimalCard'
import AnimalAvatar from './AnimalAvatar'
import Pagination from './Pagination'

interface Animal {
  id: number
  name: string
  breed: string
  colour: string | null
  customer: {
    id: number
    surname: string
    firstname?: string | null
    address?: string | null
    suburb?: string | null
    postcode?: number | null
    phone1?: string | null
    phone2?: string | null
    phone3?: string | null
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
  pagination: { page: number; limit: number; total: number; totalPages: number }
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
  sort: string
  order: 'asc' | 'desc'
  onSortChange: (sort: string, order: 'asc' | 'desc') => void
}

export default function ResultsView({
  animals,
  query,
  viewMode,
  onViewModeChange,
  onAnimalClick,
  pagination,
  onPageChange,
  onLimitChange,
  sort,
  order,
  onSortChange,
}: ResultsViewProps) {
  const handleSort = (column: string) => {
    if (sort === column) {
      onSortChange(column, order === 'asc' ? 'desc' : 'asc')
    } else {
      onSortChange(column, 'asc')
    }
  }

  const clearSort = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSortChange('relevance', 'desc')
  }

  const SortHeader = ({
    column,
    label,
    className = '',
  }: {
    column: string
    label: string
    className?: string
  }) => {
    const isSorted = sort === column
    return (
      <div
        onClick={() => handleSort(column)}
        className={`flex cursor-pointer items-center gap-1 select-none hover:text-gray-900 ${className} ${
          isSorted ? 'text-primary font-bold' : 'text-gray-600'
        }`}
      >
        {label}
        <div className="flex flex-col">
          {isSorted ? (
            <span>{order === 'asc' ? '↑' : '↓'}</span>
          ) : (
            <span className="text-[10px] text-gray-300">↕</span>
          )}
        </div>
        {isSorted && column !== 'relevance' && (
          <button
            onClick={clearSort}
            className="hover:bg-error/10 hover:text-error ml-1 rounded-full p-0.5 text-gray-400 transition-colors"
            title="Clear sorting"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Results Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="mb-1 text-2xl font-bold text-gray-800">
            {pagination.total} Animal{pagination.total !== 1 ? 's' : ''} Found
          </h2>
          <div className="text-sm text-gray-600">
            Search results for{' '}
            <span className="bg-primary-light text-primary rounded px-2 py-1 font-semibold">
              {query}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Limit Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show:</span>
            <select
              value={pagination.limit}
              onChange={e => onLimitChange(Number(e.target.value))}
              className="form-select py-1 pr-8 pl-2 text-sm"
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
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
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
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
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
              </svg>
              List
            </button>
          </div>
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

      {/* List View (Table) */}
      {viewMode === 'list' && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          {/* Table Header */}
          <div className="grid grid-cols-[2fr_2fr_2fr_1fr_1fr] gap-4 border-b border-gray-200 bg-gray-50 px-6 py-3 text-xs font-bold tracking-wider text-gray-500 uppercase">
            <SortHeader column="animal" label="Animal" />
            <SortHeader column="customer" label="Customer" />
            <div>Location</div>
            <SortHeader
              column="lastVisit"
              label="Last Visit"
              className="justify-center"
            />
            <div className="text-right">Cost</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-100">
            {animals.map((animal, index) => {
              const formattedDate = new Date(
                animal.lastVisit
              ).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: '2-digit',
              })

              const fullAddress = [
                animal.customer.address,
                animal.customer.suburb,
              ]
                .filter(Boolean)
                .join(', ')

              return (
                <div
                  key={animal.id}
                  onClick={() => onAnimalClick(animal.id)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  className={`hover:bg-primary-light grid cursor-pointer grid-cols-[2fr_2fr_2fr_1fr_1fr] items-center gap-4 px-6 py-4 transition-all hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                >
                  {/* Animal Column */}
                  <div className="flex items-center gap-3">
                    <AnimalAvatar
                      animalName={animal.name}
                      breedName={animal.breed}
                      size="sm"
                      className="transition-all hover:scale-105"
                    />
                    <div>
                      <div className="font-bold text-gray-900">
                        {animal.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {animal.breed}
                      </div>
                    </div>
                  </div>

                  {/* Customer Column */}
                  <div>
                    <div className="text-base font-bold text-gray-800">
                      {animal.customer.surname}
                      <span className="text-sm font-normal text-gray-600">
                        , {animal.customer.firstname}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {animal.customer.phone1}
                    </div>
                  </div>

                  {/* Location Column */}
                  <div className="text-sm text-gray-600">{fullAddress}</div>

                  {/* Last Visit Column */}
                  <div className="text-center text-sm font-medium text-gray-700">
                    {formattedDate}
                  </div>

                  {/* Cost Column */}
                  <div className="text-primary text-right text-sm font-bold">
                    ${animal.cost}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex justify-center">
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onChange={onPageChange}
        />
      </div>
    </div>
  )
}
