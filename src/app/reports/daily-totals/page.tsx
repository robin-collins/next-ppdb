'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSidebarState } from '@/hooks/useSidebarState'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { routes } from '@/lib/routes'
import type {
  DailyTotalAnimal,
  DailyTotalsResponse,
} from '@/app/api/reports/daily-totals/route'

function formatCurrency(dollars: number): string {
  return `$${dollars.toFixed(2)}`
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-AU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getDateInputValue(date: Date): string {
  return date.toISOString().split('T')[0]
}

export default function DailyTotalsPage() {
  const {
    sidebarOpen,
    sidebarPinned,
    skipTransition,
    setSidebarOpen,
    toggleSidebar,
    togglePin,
  } = useSidebarState()

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [data, setData] = useState<DailyTotalsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState<Date>(new Date())

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Fetch data when date changes
  const fetchData = useCallback(async (date: Date) => {
    setLoading(true)
    setError(null)
    try {
      const dateStr = getDateInputValue(date)
      const response = await fetch(
        `${routes.api.reports.dailyTotals()}?date=${dateStr}`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch daily totals')
      }
      const result: DailyTotalsResponse = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(selectedDate)
  }, [selectedDate, fetchData])

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value + 'T00:00:00')
    if (!isNaN(newDate.getTime())) {
      setSelectedDate(newDate)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        onToggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        sidebarPinned={sidebarPinned}
        onSearch={() => {}}
        searchValue=""
        breadcrumbs={[
          { label: 'Reports', href: routes.reports.analytics() },
          { label: 'Daily Totals', current: true },
        ]}
      />

      <Sidebar
        isOpen={sidebarOpen}
        isPinned={sidebarPinned}
        onClose={() => setSidebarOpen(false)}
        onTogglePin={togglePin}
        currentPath="/reports/daily-totals"
        skipTransition={skipTransition}
      />

      <main
        className={`print-main mt-6 mr-6 mb-6 flex-1 overflow-hidden rounded-2xl bg-white/95 p-8 shadow-xl backdrop-blur-[20px] ${
          skipTransition ? '' : 'transition-[margin-left] duration-[250ms]'
        }`}
        style={{
          marginLeft: sidebarPinned
            ? 'calc(var(--sidebar-width) + 1.5rem)'
            : '1.5rem',
        }}
      >
        {/* Page Header - Hidden when printing */}
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--gray-900)]">
              Daily Totals Report
            </h1>
            <p className="text-sm text-[var(--gray-600)]">
              End of day takings summary
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Date Selector */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="report-date"
                className="text-sm font-medium text-[var(--gray-700)]"
              >
                Date:
              </label>
              <input
                type="date"
                id="report-date"
                value={getDateInputValue(selectedDate)}
                onChange={handleDateChange}
                className="rounded-lg border-2 border-[var(--gray-200)] px-3 py-2 text-sm font-medium text-[var(--gray-800)] transition-all focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 focus:outline-none"
              />
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg border-2 border-transparent bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 hover:border-[var(--primary-dark)] hover:bg-[var(--primary-hover)] hover:shadow-md"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print Report
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary-light)] border-t-[var(--primary)]"></div>
            <span className="ml-3 text-[var(--gray-600)]">
              Loading report...
            </span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="rounded-lg border border-[var(--error)] bg-red-50 p-4 text-center text-[var(--error)]">
            {error}
          </div>
        )}

        {/* Report Content */}
        {!loading && !error && data && (
          <div className="print-content">
            {/* Printable Report Header */}
            <div className="print-header mb-6 border-b-2 border-[var(--gray-200)] pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[var(--gray-900)]">
                    Pampered Pooch - Daily Takings
                  </h2>
                  <p className="text-lg font-semibold text-[var(--gray-700)]">
                    {formatDate(selectedDate)}
                  </p>
                </div>
                <div className="text-right text-sm text-[var(--gray-600)]">
                  <p>Report generated:</p>
                  <p className="font-medium">
                    {formatDate(currentTime)} at {formatTime(currentTime)}
                  </p>
                </div>
              </div>
            </div>

            {/* Data Table */}
            {data.animals.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-[var(--gray-200)]">
                <table className="print-table w-full">
                  <thead>
                    <tr className="bg-[var(--gray-50)]">
                      <th className="border-b border-[var(--gray-200)] px-4 py-3 text-left text-sm font-semibold tracking-wide text-[var(--gray-700)] uppercase">
                        Animal / Owner
                      </th>
                      <th className="border-b border-[var(--gray-200)] px-4 py-3 text-left text-sm font-semibold tracking-wide text-[var(--gray-700)] uppercase">
                        Breed
                      </th>
                      <th className="border-b border-[var(--gray-200)] px-4 py-3 text-right text-sm font-semibold tracking-wide text-[var(--gray-700)] uppercase">
                        Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.animals.map((animal: DailyTotalAnimal, index) => (
                      <tr
                        key={animal.animalID}
                        className={
                          index % 2 === 0
                            ? 'bg-white'
                            : 'bg-[var(--gray-50)]/50'
                        }
                      >
                        <td className="border-b border-[var(--gray-100)] px-4 py-3">
                          <div className="font-medium text-[var(--gray-900)]">
                            {animal.animalName}
                          </div>
                          <div className="text-sm text-[var(--gray-600)]">
                            {animal.ownerName}
                          </div>
                        </td>
                        <td className="border-b border-[var(--gray-100)] px-4 py-3 text-[var(--gray-700)]">
                          {animal.breedName}
                        </td>
                        <td className="border-b border-[var(--gray-100)] px-4 py-3 text-right font-medium text-[var(--gray-900)]">
                          {formatCurrency(animal.cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[var(--primary-light)]">
                      <td
                        colSpan={2}
                        className="px-4 py-4 text-right font-semibold text-[var(--gray-800)]"
                      >
                        Total Animals:
                        <span className="ml-2 text-lg text-[var(--primary-dark)]">
                          {data.totalAnimals}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="text-sm font-medium text-[var(--gray-600)]">
                          Total Income
                        </div>
                        <div className="text-xl font-bold text-[var(--primary-dark)]">
                          {formatCurrency(data.totalRevenue)}
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="rounded-lg border border-[var(--gray-200)] bg-[var(--gray-50)] p-8 text-center">
                <p className="text-lg text-[var(--gray-600)]">
                  No animals visited on this date.
                </p>
              </div>
            )}

            {/* Print Footer */}
            <div className="print-footer mt-6 border-t border-[var(--gray-200)] pt-4 text-center text-sm text-[var(--gray-500)]">
              <p>Pampered Pooch Database - Daily Totals Report</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
