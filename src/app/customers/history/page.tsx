'use client'
import { useEffect, useState, useCallback } from 'react'
import HistoryFilters from '@/components/customerHistory/HistoryFilters'
import CustomerHistoryTable from '@/components/customerHistory/CustomerHistoryTable'
import StatsBar from '@/components/customerHistory/StatsBar'
import Breadcrumbs from '@/components/Breadcrumbs'

interface ApiResponse {
  months: 12 | 24 | 36
  q: string
  total: number
  oldestVisit: string | null
  customers: Array<{
    id: number
    surname: string
    firstname: string | null
    email: string | null
    phone1: string | null
    phone2: string | null
    phone3: string | null
    latestVisit: string | null
    monthsSince: number | null
  }>
}

export default function CustomersHistoryPage() {
  const [filters, setFilters] = useState<{ months: 12 | 24 | 36; q: string }>({
    months: 12,
    q: '',
  })
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const query = new URLSearchParams({
        months: String(filters.months),
        q: filters.q,
      }).toString()
      const res = await fetch(`/api/customers/history?${query}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to load history')
      }
      const body = (await res.json()) as ApiResponse
      setData(body)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="main-content">
      <div className="content-wrapper">
        <div className="mb-4">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Customers', href: '/' },
              { label: 'History', current: true },
            ]}
          />
        </div>
        <HistoryFilters
          defaultMonths={filters.months}
          defaultQuery={filters.q}
          onChange={setFilters}
        />
        {error ? (
          <div className="mt-4 text-red-600" role="alert" aria-live="polite">
            {error}
          </div>
        ) : loading || !data ? (
          <div className="mt-4">Loading…</div>
        ) : (
          <>
            <div className="mt-4">
              <StatsBar total={data.total} oldestVisit={data.oldestVisit} />
            </div>
            <div className="mt-4">
              <CustomerHistoryTable rows={data.customers} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
