import { useRouter } from 'next/navigation'
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
    email?: string | null
  }
  lastVisit: Date | string
  cost: number
  relevanceScore?: number
}

// Format phone number with spaces for readability: 0412345678 -> 0412 345 678
function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
  }
  if (digits.length === 8) {
    return `${digits.slice(0, 4)} ${digits.slice(4)}`
  }
  return phone
}

// Validate phone - filter out "Unknown", empty, and "0" values
function isValidPhone(phone: string | null | undefined): phone is string {
  if (!phone) return false
  const trimmed = phone.trim().toLowerCase()
  return trimmed !== '' && trimmed !== 'unknown' && trimmed !== '0'
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
  const router = useRouter()

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

      {/* List View (Table) - Compact single-line layout */}
      {viewMode === 'list' && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          {/* Table Header */}
          <div className="grid grid-cols-[minmax(320px,2fr)_minmax(400px,3fr)] gap-6 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-bold tracking-wider text-gray-500 uppercase md:px-6">
            <SortHeader column="animal" label="Animal" />
            <SortHeader column="customer" label="Customer & Contact" />
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

              // Get all valid phone numbers (filter out "Unknown" and empty values)
              const allPhones = [
                animal.customer.phone1,
                animal.customer.phone2,
                animal.customer.phone3,
              ].filter(isValidPhone)

              // Check if email looks valid (contains @)
              const validEmail =
                animal.customer.email && animal.customer.email.includes('@')
                  ? animal.customer.email
                  : null

              // Format postcode to 4 digits with leading zeros
              const formattedPostcode = animal.customer.postcode
                ? animal.customer.postcode.toString().padStart(4, '0')
                : null

              // Handle phone/email clicks - prevent row click
              const handleContactClick = (e: React.MouseEvent) => {
                e.stopPropagation()
              }

              return (
                <div
                  key={animal.id}
                  style={{ animationDelay: `${index * 0.03}s` }}
                  className={`grid grid-cols-[minmax(320px,2fr)_minmax(400px,3fr)] items-center gap-6 px-4 py-3 md:px-6 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-100'
                  }`}
                >
                  {/* Animal Column - Single line: Avatar NAME Breed  color: XXX  cost: $XX  Last Visit: XXX */}
                  <div
                    onClick={() => onAnimalClick(animal.id)}
                    className="-my-3 -ml-4 flex min-w-0 cursor-pointer items-center gap-2 py-3 pl-4 transition-colors hover:bg-[var(--primary-light)] md:-ml-6 md:pl-6"
                    title="View animal details"
                  >
                    <AnimalAvatar
                      animalName={animal.name}
                      breedName={animal.breed}
                      size="sm"
                      className="flex-shrink-0"
                    />
                    <div className="truncate font-bold text-[var(--gray-900)]">
                      {animal.name}
                    </div>
                    <div className="truncate text-sm font-medium text-[var(--primary)]">
                      {animal.breed}
                    </div>
                    {animal.colour && (
                      <div className="text-sm whitespace-nowrap text-[var(--gray-500)]">
                        <span className="font-bold">color:</span>{' '}
                        {animal.colour}
                      </div>
                    )}
                    <div className="text-sm font-bold whitespace-nowrap text-[var(--secondary)]">
                      cost: ${animal.cost}
                    </div>
                    <div className="text-sm whitespace-nowrap text-[var(--gray-600)]">
                      <span className="font-bold">Last Visit:</span>{' '}
                      {formattedDate}
                    </div>
                  </div>

                  {/* Customer & Contact Column - Single line: Name | Address | SUBURB | POSTCODE | PHONE1 | email | PHONE2 | PHONE3 */}
                  <div
                    onClick={() =>
                      router.push(`/customer/${animal.customer.id}`)
                    }
                    className="-my-3 -mr-4 flex min-w-0 cursor-pointer items-center gap-2 py-3 pr-4 transition-colors hover:bg-[var(--primary-light)] md:-mr-6 md:pr-6"
                    title="View customer details"
                  >
                    {/* Customer Name */}
                    <div className="font-bold whitespace-nowrap text-[var(--gray-800)] uppercase">
                      {animal.customer.surname}
                      {animal.customer.firstname && (
                        <span className="font-normal text-[var(--gray-600)] normal-case">
                          , {animal.customer.firstname}
                        </span>
                      )}
                    </div>

                    {/* Address */}
                    {animal.customer.address && (
                      <>
                        <div className="text-gray-300">|</div>
                        <div className="truncate text-sm text-[var(--gray-500)]">
                          {animal.customer.address}
                        </div>
                      </>
                    )}

                    {/* Suburb */}
                    {animal.customer.suburb && (
                      <>
                        <div className="text-gray-300">|</div>
                        <div className="text-sm font-semibold whitespace-nowrap text-[var(--secondary)] uppercase">
                          {animal.customer.suburb}
                        </div>
                      </>
                    )}

                    {/* Postcode */}
                    {formattedPostcode && (
                      <>
                        <div className="text-gray-300">|</div>
                        <div className="text-sm font-semibold whitespace-nowrap text-[var(--secondary)]">
                          {formattedPostcode}
                        </div>
                      </>
                    )}

                    {/* Phone 1 */}
                    {allPhones[0] && (
                      <>
                        <div className="text-gray-300">|</div>
                        <a
                          href={`tel:${allPhones[0].replace(/\s/g, '')}`}
                          onClick={handleContactClick}
                          className="flex items-center gap-1 text-sm font-semibold whitespace-nowrap text-[var(--secondary)] transition-colors hover:text-[var(--secondary-hover)]"
                        >
                          <svg
                            className="h-3 w-3 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          <span className="font-mono">
                            {formatPhone(allPhones[0])}
                          </span>
                        </a>
                      </>
                    )}

                    {/* Email */}
                    {validEmail && (
                      <>
                        <div className="text-gray-300">|</div>
                        <a
                          href={`mailto:${validEmail}`}
                          onClick={handleContactClick}
                          className="flex items-center gap-1 truncate text-sm text-[var(--gray-600)] transition-colors hover:text-[var(--primary)]"
                        >
                          <svg
                            className="h-3 w-3 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="truncate">{validEmail}</span>
                        </a>
                      </>
                    )}

                    {/* Phone 2 */}
                    {allPhones[1] && (
                      <>
                        <div className="text-gray-300">|</div>
                        <a
                          href={`tel:${allPhones[1].replace(/\s/g, '')}`}
                          onClick={handleContactClick}
                          className="flex items-center gap-1 text-sm font-semibold whitespace-nowrap text-[var(--gray-600)] transition-colors hover:text-[var(--gray-800)]"
                        >
                          <svg
                            className="h-3 w-3 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          <span className="font-mono">
                            {formatPhone(allPhones[1])}
                          </span>
                        </a>
                      </>
                    )}

                    {/* Phone 3 */}
                    {allPhones[2] && (
                      <>
                        <div className="text-gray-300">|</div>
                        <a
                          href={`tel:${allPhones[2].replace(/\s/g, '')}`}
                          onClick={handleContactClick}
                          className="flex items-center gap-1 text-sm font-semibold whitespace-nowrap text-[var(--gray-600)] transition-colors hover:text-[var(--gray-800)]"
                        >
                          <svg
                            className="h-3 w-3 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          <span className="font-mono">
                            {formatPhone(allPhones[2])}
                          </span>
                        </a>
                      </>
                    )}
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
