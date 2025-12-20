'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSidebarState } from '@/hooks/useSidebarState'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import AnimalAvatar from '@/components/AnimalAvatar'
import { routes } from '@/lib/routes'
import { formatDateAU } from '@/lib/date'

interface InactiveAnimal {
  animalId: number
  name: string
  breed: string
  lastVisit: string | null
  monthsSince: number | null
}

interface CustomerData {
  customerId: number
  name: string
  address: string
  phone: string
  animals: InactiveAnimal[]
  oldestVisit: string | null
}

interface ApiResponse {
  months: number
  q: string
  total: number
  totalAnimals: number
  totalPages: number
  page: number
  limit: number
  oldestVisit: string | null
  customers: CustomerData[]
}

export default function CustomersHistoryPage() {
  const router = useRouter()
  const {
    sidebarOpen,
    sidebarPinned,
    skipTransition,
    setSidebarOpen,
    toggleSidebar,
    togglePin,
  } = useSidebarState()
  const [searchQuery, setSearchQuery] = useState('')
  const [historySearchQuery, setHistorySearchQuery] = useState('')
  const [timePeriod, setTimePeriod] = useState<'12' | '24' | '36'>('12')
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(25)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        months: timePeriod,
        page: page.toString(),
        limit: limit.toString(),
      })
      if (historySearchQuery) params.set('q', historySearchQuery)
      const res = await fetch(`/api/customers/history?${params}`)
      if (!res.ok) throw new Error('Failed to load data')
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [timePeriod, page, limit, historySearchQuery])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    setPage(1)
  }, [timePeriod, historySearchQuery, limit])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) window.location.href = `/?q=${encodeURIComponent(query)}`
  }

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never'
    return formatDateAU(dateString)
  }

  const getDateBadgeClass = (monthsSince: number | null): string => {
    if (monthsSince === null) return 'very-old'
    if (monthsSince >= 36) return 'very-old'
    if (monthsSince >= 24) return 'old'
    return ''
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        onToggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        sidebarPinned={sidebarPinned}
        onSearch={handleSearch}
        searchValue={searchQuery}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Customers', href: '/' },
          { label: 'History', current: true },
        ]}
      />
      <Sidebar
        isOpen={sidebarOpen}
        isPinned={sidebarPinned}
        onClose={() => setSidebarOpen(false)}
        onTogglePin={togglePin}
        currentPath="/customers/history"
        skipTransition={skipTransition}
      />

      <main
        className={`relative z-0 mt-6 mr-6 mb-6 flex-1 overflow-hidden rounded-[2rem] bg-white/95 shadow-xl backdrop-blur-[20px] ${skipTransition ? '' : 'transition-[margin-left] duration-[250ms]'}`}
        style={{
          marginLeft: sidebarPinned
            ? 'calc(var(--sidebar-width) + 1.5rem)'
            : '1.5rem',
        }}
      >
        <div className="content-wrapper">
          <div className="mb-8">
            <h1 className="mb-2 flex items-center gap-3 font-[family-name:var(--font-display)] text-[2.5rem] leading-[1.2] font-bold tracking-[-0.02em] text-[var(--gray-900)]">
              <svg
                className="h-10 w-10 text-[var(--primary)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Customer History
            </h1>
            <p className="m-0 font-[family-name:var(--font-body)] text-[1.125rem] font-normal text-[var(--gray-600)]">
              Identify customers who have stopped coming in for services
            </p>
          </div>

          <div className="card">
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
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                Inactive Customers
              </h2>
            </div>
            <div className="card-content">
              {/* Filter Bar */}
              <div className="filter-bar">
                <div className="search-wrapper">
                  <div className="search-bar">
                    <svg
                      className="search-icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search by name, address, phone, animal, or breed..."
                      value={historySearchQuery}
                      onChange={e => setHistorySearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="filter-group">
                  <label className="filter-label" htmlFor="timePeriod">
                    Inactive Period:
                  </label>
                  <select
                    id="timePeriod"
                    className="filter-select"
                    value={timePeriod}
                    onChange={e =>
                      setTimePeriod(e.target.value as '12' | '24' | '36')
                    }
                  >
                    <option value="12">12+ Months</option>
                    <option value="24">24+ Months</option>
                    <option value="36">36+ Months</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label className="filter-label" htmlFor="perPage">
                    Per Page:
                  </label>
                  <select
                    id="perPage"
                    className="filter-select"
                    value={limit}
                    onChange={e => setLimit(Number(e.target.value))}
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="stats-bar">
                <div className="stat-item">
                  <span className="stat-number">{data?.total ?? '—'}</span>
                  <span className="stat-label">Customers</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {data?.totalAnimals ?? '—'}
                  </span>
                  <span className="stat-label">Animals</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {data?.oldestVisit ? formatDate(data.oldestVisit) : '—'}
                  </span>
                  <span className="stat-label">Oldest Visit</span>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="flex min-h-[200px] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary-light)] border-t-[var(--primary)]" />
                </div>
              ) : (
                <>
                  <div className="table-wrapper">
                    <table className="customer-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Address</th>
                          <th>Phone</th>
                          <th>Animals</th>
                          <th>Last Visit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!data || data.customers.length === 0 ? (
                          <tr>
                            <td colSpan={5}>
                              <div className="empty-state">
                                <svg
                                  className="empty-state-icon"
                                  width="80"
                                  height="80"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                  />
                                </svg>
                                <h3>No Inactive Customers Found</h3>
                                <p>
                                  All customers have visited within the selected
                                  period
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          data.customers.map(customer => (
                            <tr
                              key={customer.customerId}
                              onClick={() =>
                                router.push(
                                  routes.customers.detail(customer.customerId)
                                )
                              }
                              className="cursor-pointer hover:bg-[var(--primary-light)]/30"
                            >
                              <td>
                                <div className="customer-name">
                                  {customer.name}
                                </div>
                              </td>
                              <td>
                                <div className="customer-address">
                                  {customer.address}
                                </div>
                              </td>
                              <td>
                                <div className="customer-phone">
                                  {customer.phone}
                                </div>
                              </td>
                              <td>
                                <div className="flex flex-wrap gap-2">
                                  {customer.animals.map(animal => (
                                    <div
                                      key={animal.animalId}
                                      onClick={e => {
                                        e.stopPropagation()
                                        router.push(
                                          routes.animals.detail(animal.animalId)
                                        )
                                      }}
                                      className="flex cursor-pointer items-center gap-1 rounded-lg bg-gray-50 px-2 py-1 transition-all hover:bg-[var(--accent-light)] hover:shadow-md hover:ring-2 hover:ring-[var(--accent)]"
                                    >
                                      <AnimalAvatar
                                        animalName={animal.name}
                                        breedName={animal.breed}
                                        size="sm"
                                      />
                                      <div className="text-xs">
                                        <div className="font-medium text-gray-900">
                                          {animal.name}
                                        </div>
                                        <div className="text-gray-500">
                                          {animal.breed}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td>
                                <span
                                  className={`date-badge ${getDateBadgeClass(customer.animals[0]?.monthsSince ?? null)}`}
                                >
                                  {formatDate(customer.oldestVisit)}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {data && data.totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                      <div className="text-sm text-gray-600">
                        Page {data.page} of {data.totalPages} ({data.total}{' '}
                        customers)
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPage(1)}
                          disabled={page === 1}
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          First
                        </button>
                        <button
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Prev
                        </button>
                        <button
                          onClick={() =>
                            setPage(p => Math.min(data.totalPages, p + 1))
                          }
                          disabled={page === data.totalPages}
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Next
                        </button>
                        <button
                          onClick={() => setPage(data.totalPages)}
                          disabled={page === data.totalPages}
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Last
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
