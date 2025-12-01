'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAnimalsStore } from '@/store/animalsStore'
import { useSidebarState } from '@/hooks/useSidebarState'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import EmptyState from '@/components/EmptyState'
import ResultsView from '@/components/ResultsView'

function HomePageInner() {
  const searchParams = useSearchParams()
  const { animals, loading, searchAnimals } = useAnimalsStore()
  const {
    sidebarOpen,
    sidebarPinned,
    skipTransition,
    setSidebarOpen,
    toggleSidebar,
    togglePin,
  } = useSidebarState()
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (query: string) => {
    if (!query.trim() && !hasSearched) return

    setSearchQuery(query)
    setHasSearched(true)

    await searchAnimals({
      q: query,
      page: 1,
    })
  }

  // Handle URL query parameter on mount
  useEffect(() => {
    const urlQuery = searchParams.get('q')
    if (urlQuery) {
      handleSearch(urlQuery)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const handleSuggestionClick = (suggestion: string) => {
    handleSearch(suggestion)
  }

  const handleAnimalClick = (id: number) => {
    window.location.href = `/animals/${id}`
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <Header
        onToggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        sidebarPinned={sidebarPinned}
        onSearch={handleSearch}
        searchValue={searchQuery}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        isPinned={sidebarPinned}
        onClose={() => setSidebarOpen(false)}
        onTogglePin={togglePin}
        currentPath="/"
        skipTransition={skipTransition}
      />

      {/* Main Content */}
      <main
        className={`mt-6 mr-6 mb-6 flex-1 overflow-hidden rounded-2xl bg-white/95 !p-6 shadow-xl backdrop-blur-[20px] ${
          skipTransition ? '' : 'transition-[margin-left] duration-[250ms]'
        }`}
        style={{
          marginLeft: sidebarPinned
            ? 'calc(var(--sidebar-width) + 1.5rem)'
            : '1.5rem',
        }}
      >
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-lg text-gray-600">Searching...</div>
          </div>
        ) : !hasSearched || (animals.length === 0 && !searchQuery) ? (
          <EmptyState onSuggestionClick={handleSuggestionClick} />
        ) : animals.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center !p-8">
            <h2 className="mb-2 text-2xl font-bold text-gray-800">
              No Results Found
            </h2>
            <p className="text-gray-600">
              No animals found matching &quot;{searchQuery}&quot;. Try a
              different search term.
            </p>
          </div>
        ) : (
          <ResultsView
            animals={animals}
            query={searchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onAnimalClick={handleAnimalClick}
          />
        )}
      </main>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomePageInner />
    </Suspense>
  )
}
