'use client'
import { useState, useEffect } from 'react'

interface HeaderProps {
  onToggleSidebar: () => void
  sidebarOpen: boolean
  onSearch: (query: string) => void
  searchValue: string
}

export default function Header({
  onToggleSidebar,
  sidebarOpen,
  onSearch,
  searchValue,
}: HeaderProps) {
  const [query, setQuery] = useState(searchValue)
  const [dateTime, setDateTime] = useState('')

  useEffect(() => {
    setQuery(searchValue)
  }, [searchValue])

  useEffect(() => {
    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const updateDateTime = () => {
    const now = new Date()
    const timeText = now
      .toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      .toLowerCase()
    const dateText = now.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    setDateTime(`${timeText} ${dateText}`)
  }

  // search is triggered by explicit button click; no need for form submit handler

  const handleClear = () => {
    setQuery('')
    onSearch('')
  }

  const handleSearchClick = () => {
    onSearch(query)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearchClick()
    }
  }

  return (
    <header className="sticky top-0 z-[100] h-[92px] border-b border-gray-200 bg-white pr-[24px] pl-[24px] shadow-md">
      <div className="mx-auto flex h-full max-w-[1400px] flex-nowrap items-center gap-6">
        {/* Hamburger Menu */}
        <div className="hamburger-menu">
          <button
            onClick={onToggleSidebar}
            className={`flex flex-col gap-1 rounded-lg bg-gray-100 p-3 transition-all hover:bg-gray-200 ${sidebarOpen ? 'active' : ''}`}
            aria-label="Toggle sidebar"
          >
            <span
              className={`h-0.5 w-5 rounded-sm bg-gray-700 transition-all ${sidebarOpen ? 'translate-y-[6px] rotate-45' : ''}`}
            />
            <span
              className={`h-0.5 w-5 rounded-sm bg-gray-700 transition-all ${sidebarOpen ? 'opacity-0' : ''}`}
            />
            <span
              className={`h-0.5 w-5 rounded-sm bg-gray-700 transition-all ${sidebarOpen ? '-translate-y-[6px] -rotate-45' : ''}`}
            />
          </button>
        </div>

        {/* Brand Logo */}
        <div
          className="brand-header flex cursor-pointer items-center gap-3"
          onClick={() => (window.location.href = '/')}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17L10.58 10.76C10.21 10.88 9.84 11 9.5 11C8.12 11 7 9.88 7 8.5C7 7.12 8.12 6 9.5 6C9.84 6 10.21 6.12 10.58 6.24L12.19 4.63C11.34 3.91 10.2 3.5 9 3.5C6.79 3.5 5 5.29 5 7.5S6.79 11.5 9 11.5C9.85 11.5 10.65 11.2 11.26 10.74L17.5 17H19.5L21 15.5V13.5L15.33 7.83L21 9Z" />
            </svg>
          </div>
          <div className="brand-text hidden sm:block">
            <h1 className="text-xl font-bold text-gray-800">Pampered Pooch</h1>
            <p className="text-xs text-gray-600">Professional Pet Care</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-1 items-center" role="search">
          <div className="relative flex h-[53px] w-full max-w-[600px] items-center rounded-xl border-2 border-gray-200 bg-white !px-6 shadow-sm transition-all focus-within:border-[var(--primary)] focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.1),0_4px_6px_-1px_rgb(0_0_0_/_0.1),0_2px_4px_-2px_rgb(0_0_0_/_0.1)]">
            <svg
              className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by name, phone, email, or breed..."
              className="h-[53px] flex-1 border-none bg-transparent py-0 pr-3 text-base font-medium text-gray-800 outline-none"
            />
            <div className="ml-3 flex items-center gap-3">
              <button
                type="button"
                onClick={handleSearchClick}
                className="flex h-[37px] min-w-[88px] items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-center text-sm font-semibold text-white transition-all hover:bg-[var(--primary-hover)]"
              >
                Search
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="flex h-[37px] min-w-[80px] items-center justify-center gap-2 rounded-md bg-gray-100 px-4 text-center text-sm font-semibold text-gray-700 transition-all hover:bg-gray-200"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Date Display */}
        <div className="date-display hidden rounded-full bg-[var(--primary-light)] !px-6 !py-2 text-sm font-semibold whitespace-nowrap text-[var(--primary)] lg:block">
          {dateTime}
        </div>
      </div>
    </header>
  )
}
