'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSidebarState } from '@/hooks/useSidebarState'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import AnimalAvatar from '@/components/AnimalAvatar'

interface CustomerData {
  name: string
  address: string
  phone: string
  animal: string
  breed: string
  lastVisit: string
}

interface ApiResponse {
  months: 12 | 24 | 36
  q: string
  total: number
  oldestVisit: string | null
  customers: CustomerData[]
}

export default function CustomersHistoryPage() {
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
  const [timePeriod, setTimePeriod] = useState<'all' | '12' | '24' | '36'>('12')
  const [_data, _setData] = useState<ApiResponse | null>(null)
  const [filteredData, setFilteredData] = useState<CustomerData[]>([])
  const [_loading, _setLoading] = useState(true)
  const [_error, _setError] = useState<string | null>(null)

  // Mock data for now (matches mockui HTML)
  const customerData: CustomerData[] = useMemo(
    () => [
      {
        name: 'Chelsea Donhardt',
        address: '409 Proctor Rd, Yundi 5172',
        phone: '0428568458',
        animal: 'Cody',
        breed: 'Corgi',
        lastVisit: '2020-12-03',
      },
      {
        name: 'Kirby Madden-Campbell',
        address: '2/9 Quinliven Rd, Port Willunga',
        phone: '0426266480',
        animal: 'Naboo',
        breed: 'Cat',
        lastVisit: '2017-08-03',
      },
      {
        name: 'Stacey Abercrombie',
        address: '3 Kauma Ave, Aldinga Beach 5173',
        phone: '0435853405',
        animal: 'Marnie',
        breed: 'Huskie',
        lastVisit: '2020-10-08',
      },
      {
        name: 'Emily Abley',
        address: '11 Clyde Tce, Mount Compass 5210',
        phone: '0435519234',
        animal: 'Peppa',
        breed: 'Labradoodle',
        lastVisit: '2017-11-16',
      },
      {
        name: 'Andrew Adair',
        address: 'Lot 1022 Pages Flat, Myponga 5202',
        phone: '0459498523',
        animal: 'Seth',
        breed: 'Huskie',
        lastVisit: '2020-12-17',
      },
      {
        name: 'Andrew Adair',
        address: 'Lot 1022 Pages Flat, Myponga 5202',
        phone: '0459498523',
        animal: 'Rudi',
        breed: 'Huskie',
        lastVisit: '2020-12-17',
      },
      {
        name: 'Anthony Adami',
        address: '71 Berry Rd, Mt Compass 5172',
        phone: '0405977622',
        animal: 'Dely',
        breed: 'Labrador',
        lastVisit: '2021-10-14',
      },
      {
        name: 'Jenny Adams',
        address: '35 Dolphin Ave, Carrickalinga 5203',
        phone: '0408811493',
        animal: 'Maisie',
        breed: 'Schnauzer Miniature',
        lastVisit: '2019-02-13',
      },
      {
        name: 'Yvonne Adams',
        address: '145/91 Main Rd, Mc Laren Vale 5171',
        phone: '83238936',
        animal: 'Emma',
        breed: 'Tenterfield Terrier',
        lastVisit: '2019-05-25',
      },
      {
        name: 'Tina Adams',
        address: '15 Moore St, Willunga 5172',
        phone: '0400779846',
        animal: 'Archie',
        breed: 'Welsh Springer Spanial',
        lastVisit: '2020-10-30',
      },
      {
        name: 'Tina Adams',
        address: '15 Moore St, Willunga 5172',
        phone: '0400779846',
        animal: 'Mira',
        breed: 'Welsh Springer Spanial',
        lastVisit: '2020-10-30',
      },
      {
        name: 'Amanda Adams',
        address: '6 Jayden Crt, Hindmarsh Island 5171',
        phone: '0468968394',
        animal: 'Sao',
        breed: 'Spoodle',
        lastVisit: '2021-08-03',
      },
      {
        name: 'Amanda Adams',
        address: '6 Jayden Crt, Hindmarsh Island 5171',
        phone: '0468968394',
        animal: 'Coco',
        breed: 'Spoodle',
        lastVisit: '2021-08-03',
      },
      {
        name: 'Laura Adamson',
        address: '23 Wellington Ave, Sellicks Beach 5174',
        phone: '0422559262',
        animal: 'Jax',
        breed: 'Cocker Spaniel',
        lastVisit: '2020-01-03',
      },
      {
        name: 'Madeline Adamson',
        address: '25 Stock Dry, Port Elliot 5212',
        phone: '0423152861',
        animal: 'Pippa',
        breed: 'Golden Retriever',
        lastVisit: '2021-08-05',
      },
    ],
    []
  )

  const getMonthsSince = (dateString: string): number => {
    const lastVisit = new Date(dateString)
    const now = new Date()
    return (
      (now.getFullYear() - lastVisit.getFullYear()) * 12 +
      (now.getMonth() - lastVisit.getMonth())
    )
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getDateBadgeClass = (dateString: string): string => {
    const months = getMonthsSince(dateString)
    if (months >= 36) return 'very-old'
    if (months >= 24) return 'old'
    return ''
  }

  const applyFilters = useCallback(() => {
    const filterByTimePeriod = (
      data: CustomerData[],
      months: string
    ): CustomerData[] => {
      if (months === 'all') return data
      const monthsNum = parseInt(months)
      return data.filter(
        customer => getMonthsSince(customer.lastVisit) >= monthsNum
      )
    }

    const searchFilter = (
      data: CustomerData[],
      query: string
    ): CustomerData[] => {
      if (!query.trim()) return data
      const lowerQuery = query.toLowerCase()
      return data.filter(customer => {
        return (
          customer.name.toLowerCase().includes(lowerQuery) ||
          customer.address.toLowerCase().includes(lowerQuery) ||
          customer.phone.includes(lowerQuery) ||
          customer.animal.toLowerCase().includes(lowerQuery) ||
          customer.breed.toLowerCase().includes(lowerQuery)
        )
      })
    }

    let filtered = [...customerData]
    filtered = filterByTimePeriod(filtered, timePeriod)
    filtered = searchFilter(filtered, historySearchQuery)
    setFilteredData(filtered)
    _setLoading(false)
  }, [timePeriod, historySearchQuery, customerData])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const stats = {
    totalCount: customerData.length,
    displayedCount: filteredData.length,
    oldestDate:
      filteredData.length > 0
        ? formatDate(
            new Date(
              Math.min(
                ...filteredData.map(c => new Date(c.lastVisit).getTime())
              )
            )
              .toISOString()
              .split('T')[0]
          )
        : '—',
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* MANDATORY: Header */}
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

      {/* MANDATORY: Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        isPinned={sidebarPinned}
        onClose={() => setSidebarOpen(false)}
        onTogglePin={togglePin}
        currentPath="/customers/history"
        skipTransition={skipTransition}
      />

      {/* Main Content */}
      <main
        className={`relative z-0 mt-6 mr-6 mb-6 flex-1 overflow-hidden rounded-[2rem] bg-white/95 shadow-xl backdrop-blur-[20px] ${
          skipTransition ? '' : 'transition-[margin-left] duration-[250ms]'
        }`}
        style={{
          marginLeft: sidebarPinned
            ? 'calc(var(--sidebar-width) + 1.5rem)'
            : '1.5rem',
        }}
      >
        <div className="content-wrapper">
          {/* Page Title */}
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
              Manage historical customer records and track inactive customers
            </p>
          </div>

          {/* Historical Customers Card */}
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
                Historical Customers
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
                      setTimePeriod(
                        e.target.value as 'all' | '12' | '24' | '36'
                      )
                    }
                  >
                    <option value="all">All Records</option>
                    <option value="12">12+ Months</option>
                    <option value="24">24+ Months</option>
                    <option value="36">36+ Months</option>
                  </select>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="stats-bar">
                <div className="stat-item">
                  <span className="stat-number">{stats.totalCount}</span>
                  <span className="stat-label">Total Records</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{stats.displayedCount}</span>
                  <span className="stat-label">Displayed</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{stats.oldestDate}</span>
                  <span className="stat-label">Oldest Visit</span>
                </div>
              </div>

              {/* Table */}
              <div className="table-wrapper">
                <table className="customer-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Address</th>
                      <th>Phone</th>
                      <th>Animal</th>
                      <th>Last Visit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length === 0 ? (
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
                              ></path>
                            </svg>
                            <h3>No Customers Found</h3>
                            <p>Try adjusting your search or filter criteria</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((customer, index) => (
                        <tr
                          key={`${customer.name}-${customer.animal}-${index}`}
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <td>
                            <div className="customer-name">{customer.name}</div>
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
                            <div className="customer-animal">
                              <AnimalAvatar
                                animalName={customer.animal}
                                breedName={customer.breed}
                                size="sm"
                              />
                              <div className="animal-info">
                                <div className="animal-name">
                                  {customer.animal}
                                </div>
                                <div className="animal-breed">
                                  {customer.breed}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`date-badge ${getDateBadgeClass(customer.lastVisit)}`}
                            >
                              {formatDate(customer.lastVisit)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
