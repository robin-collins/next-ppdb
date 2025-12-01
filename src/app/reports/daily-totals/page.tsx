'use client'
import { useEffect, useState, useMemo } from 'react'
import { useSidebarState } from '@/hooks/useSidebarState'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

interface AnalyticsPoint {
  label: string
  dateKey: string
  count: number
  revenue: number
  breedBreakdown: Record<string, number>
}

interface Summary {
  totalRevenue: number
  totalAnimals: number
  avgPrice: number
}

interface ApiResponse {
  data: AnalyticsPoint[]
  summary: Summary
}

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly'

export default function DailyTotalsPage() {
  const {
    sidebarOpen,
    sidebarPinned,
    skipTransition,
    setSidebarOpen,
    toggleSidebar,
    togglePin,
  } = useSidebarState()

  const [searchQuery, setSearchQuery] = useState('')
  const [period, setPeriod] = useState<Period>('daily')
  const [endDate, setEndDate] = useState(
    () => new Date().toISOString().split('T')[0]
  )

  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `/api/reports/analytics?period=${period}&endDate=${endDate}`
        )
        if (!res.ok) throw new Error('Failed to load analytics')
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [period, endDate])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      window.location.href = `/?q=${encodeURIComponent(query)}`
    }
  }

  // Helpers for Chart Scaling
  const maxRevenue = useMemo(() => {
    if (!data?.data.length) return 0
    return Math.max(...data.data.map(d => d.revenue)) * 1.1 // +10% padding
  }, [data])

  const maxAnimals = useMemo(() => {
    if (!data?.data.length) return 0
    return Math.max(...data.data.map(d => d.count)) * 1.1
  }, [data])

  // Helper for Period Description
  const periodDescription = useMemo(() => {
    const end = new Date(endDate)
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }

    if (period === 'daily') {
      const start = new Date(end)
      start.setDate(end.getDate() - 6)
      return `Last 7 days: ${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`
    } else if (period === 'weekly') {
      // 8 weeks
      const start = new Date(end)
      start.setDate(end.getDate() - 55)
      return `Last 8 weeks: ${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`
    } else if (period === 'monthly') {
      // 6 months
      const start = new Date(end)
      start.setMonth(end.getMonth() - 5)
      return `Last 6 months ending ${end.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
    } else if (period === 'yearly') {
      // 3 years
      const start = new Date(end)
      start.setFullYear(end.getFullYear() - 2)
      return `Last 3 years: ${start.getFullYear()} - ${end.getFullYear()}`
    }
    return 'Selected period'
  }, [period, endDate])

  // Breed Colors Map (Auto-generated for top 10 breeds)
  const breedColors = useMemo(() => {
    if (!data) return {}
    // Use Hex codes for guaranteed visibility
    const colors = [
      '#60A5FA', // blue-400
      '#4ADE80', // green-400
      '#FACC15', // yellow-400
      '#F87171', // red-400
      '#C084FC', // purple-400
      '#F472B6', // pink-400
      '#818CF8', // indigo-400
      '#2DD4BF', // teal-400
      '#FB923C', // orange-400
      '#22D3EE', // cyan-400
    ]

    // 1. Calculate totals per breed
    const breedCounts: Record<string, number> = {}
    data.data.forEach(p => {
      Object.entries(p.breedBreakdown).forEach(([breed, count]) => {
        breedCounts[breed] = (breedCounts[breed] || 0) + count
      })
    })

    // 2. Sort and take top 10
    const topBreeds = Object.entries(breedCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([breed]) => breed)

    const map: Record<string, string> = {}
    topBreeds.forEach((b, i) => {
      map[b] = colors[i % colors.length]
    })
    return map
  }, [data])

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
          { label: 'Reports', href: '/reports/daily-totals' },
          { label: 'Analytics', current: true },
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
        className={`relative z-[1] mt-6 mr-6 mb-6 flex-1 overflow-hidden rounded-[2rem] border border-gray-200 bg-white/95 shadow-xl backdrop-blur-[20px] ${
          skipTransition ? '' : 'transition-[margin-left] duration-[250ms]'
        }`}
        style={{
          marginLeft: sidebarPinned
            ? 'calc(var(--sidebar-width) + 1.5rem)'
            : '1.5rem',
        }}
      >
        <div className="p-8">
          {/* Header Section */}
          <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="mb-2 font-[family-name:var(--font-display)] text-[2.5rem] leading-[1.2] font-bold tracking-[-0.02em] text-gray-900">
                Analytics Dashboard
              </h1>
              <p className="font-[family-name:var(--font-body)] text-lg font-normal text-gray-600">
                Revenue trends and animal statistics
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Date Picker */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none"
                />
              </div>

              {/* Period Selector */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  Period
                </label>
                <div className="flex rounded-lg bg-gray-100 p-1">
                  {(['daily', 'weekly', 'monthly', 'yearly'] as Period[]).map(
                    p => (
                      <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`rounded-md border-none px-3 py-2 font-[family-name:var(--font-accent)] text-sm font-semibold capitalize transition-all duration-[250ms] ${
                          period === p
                            ? 'bg-white text-[var(--primary)] shadow-sm'
                            : 'bg-transparent text-gray-600 hover:bg-[var(--primary-light)] hover:text-[var(--primary-dark)]'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
              {error}
            </div>
          )}

          {loading && !data && (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-6">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--primary-light)] border-t-[var(--primary)]" />
              <p className="text-lg font-medium text-[var(--primary)]">
                Loading analytics...
              </p>
            </div>
          )}

          {!loading && data && (
            <div className="animate-[fadeIn_0.5s_ease-out]">
              {/* Summary Cards */}
              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                <SummaryCard
                  title="Total Animals"
                  value={data.summary.totalAnimals}
                  subtitle={periodDescription}
                  icon="animals"
                  color="primary"
                />
                <SummaryCard
                  title="Total Revenue"
                  value={`$${data.summary.totalRevenue.toLocaleString()}`}
                  subtitle={periodDescription}
                  icon="revenue"
                  color="accent"
                />
                <SummaryCard
                  title="Average Price"
                  value={`$${data.summary.avgPrice.toFixed(2)}`}
                  subtitle={`Per animal for ${data.summary.totalAnimals} animals`}
                  icon="avg"
                  color="tan"
                />
              </div>

              {/* Charts Grid */}
              <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-1">
                {/* Revenue Line Chart (SVG) */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-6 font-[family-name:var(--font-display)] text-lg font-bold text-gray-900">
                    Revenue Trends
                  </h3>
                  <div className="relative h-[300px] w-full">
                    {data.data.length > 1 ? (
                      <svg
                        className="h-full w-full overflow-visible"
                        viewBox={`0 0 ${data.data.length * 100} 300`}
                        preserveAspectRatio="none"
                      >
                        {/* Grid Lines */}
                        <line
                          x1="0"
                          y1="0"
                          x2="100%"
                          y2="0"
                          stroke="#e5e7eb"
                          strokeDasharray="4 4"
                        />
                        <line
                          x1="0"
                          y1="150"
                          x2="100%"
                          y2="150"
                          stroke="#e5e7eb"
                          strokeDasharray="4 4"
                        />
                        <line
                          x1="0"
                          y1="300"
                          x2="100%"
                          y2="300"
                          stroke="#e5e7eb"
                          strokeDasharray="4 4"
                        />

                        {/* Area Fill - handled by SimpleLineChart component below */}

                        <SimpleLineChart
                          data={data.data}
                          maxVal={maxRevenue}
                          valueKey="revenue"
                          color="var(--primary)"
                        />
                      </svg>
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        Not enough data for trend line
                      </div>
                    )}
                  </div>
                  {/* X-Axis Labels */}
                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span>{data.data[0]?.label}</span>
                    <span>{data.data[data.data.length - 1]?.label}</span>
                  </div>
                </div>

                {/* Stacked Bar Chart */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-4">
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-gray-900">
                      Animals & Breeds
                    </h3>
                  </div>

                  <div className="flex h-[300px] items-end justify-between gap-2 border-b border-gray-200 pb-2">
                    {data.data.map((point, i) => {
                      const heightPct =
                        maxAnimals > 0 ? (point.count / maxAnimals) * 100 : 0
                      return (
                        <div
                          key={i}
                          className="group relative flex h-full w-full flex-col justify-end"
                        >
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs whitespace-nowrap text-white group-hover:block">
                            <div className="font-bold">{point.label}</div>
                            <div>Total: {point.count}</div>
                            {Object.entries(point.breedBreakdown).map(
                              ([b, c]) => (
                                <div key={b} className="text-[10px]">
                                  {b}: {c}
                                </div>
                              )
                            )}
                          </div>

                          {/* Stacked Bar */}
                          <div
                            style={{ height: `${heightPct}%` }}
                            className="flex w-full flex-col overflow-hidden rounded-t-sm bg-gray-100"
                          >
                            {Object.entries(point.breedBreakdown).map(
                              ([breed, count]) => {
                                const segmentHeight =
                                  (count / point.count) * 100
                                return (
                                  <div
                                    key={breed}
                                    style={{
                                      height: `${segmentHeight}%`,
                                      backgroundColor:
                                        breedColors[breed] || '#d1d5db', // Fallback to gray-300 hex
                                    }}
                                    className="w-full"
                                  />
                                )
                              }
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {/* X-Axis Labels */}
                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    {data.data
                      .filter(
                        (_, i) => i % Math.ceil(data.data.length / 6) === 0
                      )
                      .map(d => (
                        <span key={d.dateKey}>{d.label}</span>
                      ))}
                  </div>

                  {/* Full Legend */}
                  <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4">
                    {Object.entries(breedColors).map(([breed, color]) => (
                      <div key={breed} className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 flex-shrink-0 rounded-none border border-black/10"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs font-medium text-gray-700">
                          {breed}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Detailed Table */}
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-gray-900">
                    Detailed Breakdown
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-50 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                      <tr>
                        <th className="px-6 py-3 text-left">Date/Period</th>
                        <th className="px-6 py-3 text-left">Animals</th>
                        <th className="px-6 py-3 text-left">Breeds</th>
                        <th className="px-6 py-3 text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {data.data
                        .slice()
                        .reverse()
                        .map(row => (
                          <tr key={row.dateKey} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">
                              {row.label}
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {row.count}
                            </td>
                            <td
                              className="max-w-[250px] truncate px-6 py-4 text-gray-500"
                              title={Object.keys(row.breedBreakdown).join(', ')}
                            >
                              {(() => {
                                const sortedBreeds = Object.entries(
                                  row.breedBreakdown
                                ).sort(([, a], [, b]) => b - a)
                                const top10 = sortedBreeds
                                  .slice(0, 10)
                                  .map(([b, c]) => `${b} (${c})`)
                                return top10.length < sortedBreeds.length
                                  ? `${top10.join(', ')}...`
                                  : top10.join(', ')
                              })()}
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-[var(--success)]">
                              ${row.revenue.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

// -- Subcomponents --

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string
  value: string | number
  subtitle: string
  icon: string
  color: 'primary' | 'accent' | 'tan'
}) {
  const colors = {
    primary: 'text-[var(--primary)] bg-[var(--primary-light)]',
    accent: 'text-[var(--accent)] bg-[var(--accent-light)]',
    tan: 'text-[var(--tan)] bg-[var(--peach)]',
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-[family-name:var(--font-accent)] text-xs font-bold tracking-widest text-gray-500 uppercase">
          {title}
        </span>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors[color]}`}
        >
          {/* Simplified Icons */}
          {icon === 'animals' && (
            <div className="h-3 w-3 rounded-full border-2 border-current" />
          )}
          {icon === 'revenue' && <div className="text-lg font-bold">$</div>}
          {icon === 'avg' && <div className="text-xs font-bold">%</div>}
        </div>
      </div>
      <div className="mb-1 text-3xl font-extrabold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{subtitle}</div>
    </div>
  )
}

function SimpleLineChart({
  data,
  maxVal,
  valueKey,
  color,
}: {
  data: AnalyticsPoint[]
  maxVal: number
  valueKey: 'revenue' | 'count'
  color: string
}) {
  if (maxVal === 0) return null

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 100
      const y = 100 - ((d[valueKey] || 0) / maxVal) * 100
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Area */}
      <path d={`M 0,100 ${points} L 100,100 Z`} fill="url(#gradient)" />
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2" // Scaled by vector-effect usually, but standard SVG scaling applies here.
        // To fix stroke width distortion in preserveAspectRatio="none", ideally we use vector-effect="non-scaling-stroke"
        // But React/Tailwind setup might strip it or need specific attr.
        vectorEffect="non-scaling-stroke"
      />
      {/* Dots */}
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100
        const y = 100 - ((d[valueKey] || 0) / maxVal) * 100
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="1"
            fill="white"
            stroke={color}
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
            className="hover:r-2 hover:stroke-width-1 transition-all"
          >
            <title>
              {d.label}: {d[valueKey]}
            </title>
          </circle>
        )
      })}
    </svg>
  )
}
