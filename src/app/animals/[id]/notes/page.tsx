'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAnimalsStore } from '@/store/animalsStore'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { routes } from '@/lib/routes'

export default function ServiceHistoryPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { selectedAnimal, fetchAnimal, loading, error } = useAnimalsStore()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarPinned, setSidebarPinned] = useState(false)
  const [searchQuery, _setSearchQuery] = useState('')

  useEffect(() => {
    const idNum = Number(params.id)
    if (Number.isFinite(idNum)) {
      fetchAnimal(idNum)
    }
  }, [params.id, fetchAnimal])

  const handleSearch = (query: string) => {
    router.push(query ? `/?q=${encodeURIComponent(query)}` : '/')
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
          onSearch={handleSearch}
          searchValue={searchQuery}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Service History', current: true },
          ]}
        />
        <Sidebar
          isOpen={sidebarOpen}
          isPinned={sidebarPinned}
          onClose={() => setSidebarOpen(false)}
          onTogglePin={() => setSidebarPinned(!sidebarPinned)}
          currentPath={`/animals/${params.id}/notes`}
        />
        <main
          className={`flex-1 transition-all duration-300 ${sidebarPinned ? 'ml-[var(--sidebar-width)]' : ''}`}
        >
          <div className="main-content">
            <div className="content-wrapper">
              <div className="text-red-600">{error}</div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (loading || !selectedAnimal) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
          onSearch={handleSearch}
          searchValue={searchQuery}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Service History', current: true },
          ]}
        />
        <Sidebar
          isOpen={sidebarOpen}
          isPinned={sidebarPinned}
          onClose={() => setSidebarOpen(false)}
          onTogglePin={() => setSidebarPinned(!sidebarPinned)}
          currentPath={`/animals/${params.id}/notes`}
        />
        <main
          className={`flex-1 transition-all duration-300 ${sidebarPinned ? 'ml-[var(--sidebar-width)]' : ''}`}
        >
          <div className="main-content">
            <div className="content-wrapper">Loading...</div>
          </div>
        </main>
      </div>
    )
  }

  const serviceNotes = selectedAnimal.serviceNotes || []

  // Calculate stats
  const totalServices = serviceNotes.length
  const notesWithPrices = serviceNotes.filter(note => note.notes.match(/\$\d+/))
  const prices = notesWithPrices.map(note => {
    const match = note.notes.match(/\$(\d+)/)
    return match ? parseInt(match[1]) : 0
  })
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0
  const priceRange =
    prices.length > 0
      ? minPrice === maxPrice
        ? `$${minPrice}`
        : `$${minPrice}-$${maxPrice}`
      : 'N/A'

  // Calculate years as customer
  const dates = serviceNotes.map(note => new Date(note.serviceDate))
  const oldestDate =
    dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : null
  const yearsAsCustomer = oldestDate
    ? Math.floor(
        (new Date().getTime() - oldestDate.getTime()) /
          (1000 * 60 * 60 * 24 * 365)
      )
    : 0
  const customerSince =
    yearsAsCustomer > 0 ? `${yearsAsCustomer}+ Years` : 'New Customer'

  // Determine visit pattern
  const visitPattern =
    totalServices > 20
      ? 'Regular'
      : totalServices > 10
        ? 'Frequent'
        : 'Occasional'

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        onSearch={handleSearch}
        searchValue={searchQuery}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Animals', href: '/' },
          {
            label: selectedAnimal.name,
            href: routes.animals.detail(params.id),
          },
          { label: 'Service History', current: true },
        ]}
      />
      <Sidebar
        isOpen={sidebarOpen}
        isPinned={sidebarPinned}
        onClose={() => setSidebarOpen(false)}
        onTogglePin={() => setSidebarPinned(!sidebarPinned)}
        currentPath={`/animals/${params.id}/notes`}
      />
      <main
        className={`flex-1 transition-all duration-300 ${sidebarPinned ? 'ml-[var(--sidebar-width)]' : ''}`}
      >
        <div className="main-content">
          <div className="content-wrapper">
            {/* Page Header */}
            <div className="page-header">
              <div className="page-title-section">
                <div className="animal-avatar-large">
                  {selectedAnimal.name.charAt(0).toUpperCase()}
                </div>
                <div className="page-title-content">
                  <h1>All Notes for {selectedAnimal.name}</h1>
                  <p className="page-subtitle">Complete service history</p>
                </div>
              </div>
              <button
                onClick={() => router.push(routes.animals.detail(params.id))}
                className="back-link"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Animal Info
              </button>
            </div>

            {/* History Card */}
            <div className="history-card">
              <div className="history-header">
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-number">{totalServices}</span>
                    <span className="stat-label">Total Services</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{customerSince}</span>
                    <span className="stat-label">Customer Since</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{priceRange}</span>
                    <span className="stat-label">Price Range</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{visitPattern}</span>
                    <span className="stat-label">Visit Pattern</span>
                  </div>
                </div>
              </div>
              <div className="history-body">
                {/* Service History Timeline */}
                {serviceNotes.length > 0 ? (
                  <div className="service-history">
                    {serviceNotes.map((note, index) => {
                      // Extract price from note text
                      const priceMatch = note.notes.match(/\$(\d+)/)
                      const price = priceMatch ? `$${priceMatch[1]}` : null

                      // Extract technician code (2-3 letter code at end or standalone)
                      const techMatch = note.notes.match(
                        /\b([A-Za-z]{2,3})\b\s*\.?\s*$/
                      )
                      const tech = techMatch ? techMatch[1].toUpperCase() : null

                      // Format the service date
                      const serviceDate = new Date(note.serviceDate)
                      const formattedDate = serviceDate.toLocaleDateString(
                        'en-GB',
                        {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        }
                      )

                      return (
                        <div
                          key={note.id}
                          className="history-service-item"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div className="service-date">
                            <svg
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            {formattedDate}
                          </div>
                          <div className="service-inline">
                            <div className="service-details">{note.notes}</div>
                            {price && (
                              <div className="service-price">{price}</div>
                            )}
                            {tech && (
                              <div className="service-meta">
                                <span className="service-tech">
                                  <svg
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                  </svg>
                                  {tech}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="py-8 text-center text-gray-500">
                    No service history available for this animal.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
