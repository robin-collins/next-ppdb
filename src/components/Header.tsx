'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'

interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface HeaderProps {
  onToggleSidebar: () => void
  sidebarOpen: boolean
  sidebarPinned?: boolean
  onSearch: (query: string) => void
  searchValue: string
  breadcrumbs?: BreadcrumbItem[]
}

export default function Header({
  onToggleSidebar,
  sidebarOpen,
  sidebarPinned = false,
  onSearch,
  searchValue,
  breadcrumbs,
}: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
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
    // If not on home page, navigate to home with empty search
    if (pathname !== '/') {
      router.push('/')
    } else {
      onSearch('')
    }
  }

  const handleSearchClick = () => {
    // If not on home page, navigate to home with query parameter
    if (pathname !== '/') {
      if (query.trim()) {
        router.push(`/?q=${encodeURIComponent(query)}`)
      } else {
        router.push('/')
      }
    } else {
      // On home page, use the provided callback
      onSearch(query)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearchClick()
    }
  }

  return (
    <header className="sticky top-0 z-[100] border-b border-gray-200 bg-white pr-[24px] pl-[24px] shadow-md">
      <div className="flex h-[92px] flex-nowrap items-center gap-6">
        {/* Hamburger Menu / Pin Indicator */}
        <div className="hamburger-menu">
          <button
            onClick={onToggleSidebar}
            className={`flex h-11 w-11 items-center justify-center rounded-lg transition-all ${
              sidebarPinned
                ? 'hover:opacity-90'
                : 'bg-gray-100 hover:bg-gray-200'
            } ${sidebarOpen && !sidebarPinned ? 'active' : ''}`}
            style={
              sidebarPinned ? { backgroundColor: 'var(--primary)' } : undefined
            }
            aria-label={sidebarPinned ? 'Sidebar pinned' : 'Toggle sidebar'}
          >
            {/* Pinned icon - filled pushpin (shown when pinned) */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="white"
              className={`flex-shrink-0 ${sidebarPinned ? 'block' : 'hidden'}`}
            >
              <path d="M16 9V4l1 0c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1l1 0v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z" />
            </svg>
            {/* Hamburger / X animation (shown when not pinned) */}
            <div
              className={`flex flex-col gap-1 ${sidebarPinned ? 'hidden' : 'block'}`}
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
            </div>
          </button>
        </div>

        {/* Brand Logo */}
        <div
          className="brand-header flex cursor-pointer items-center gap-3"
          onClick={() => (window.location.href = '/')}
        >
          <Image
            src="/images/logo.png"
            alt="Pampered Pooch Logo"
            width={250}
            height={80}
            className="h-[80px] w-auto object-contain"
            priority
          />
          <div className="brand-text hidden sm:block">
            <h1 className="text-xl font-bold text-gray-800">Pampered Pooch</h1>
            <p className="text-xs text-gray-600">Professional Pet Care</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center" role="search">
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
              className="h-[53px] w-[300px] border-none bg-transparent py-0 pr-3 text-base font-medium text-gray-800 outline-none lg:w-[400px]"
            />
            <div className="ml-3 flex items-center gap-3">
              <button
                type="button"
                onClick={handleSearchClick}
                className="flex h-[37px] min-w-[88px] items-center justify-center gap-2 rounded-md border-2 border-transparent bg-[var(--primary)] px-4 text-center text-sm font-semibold text-white transition-all duration-200 hover:scale-110 hover:border-[var(--primary-dark)] hover:bg-[var(--primary-hover)] hover:shadow-md"
              >
                Search
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="flex h-[37px] min-w-[80px] items-center justify-center gap-2 rounded-md border-2 border-transparent bg-gray-100 px-4 text-center text-sm font-semibold text-gray-700 transition-all duration-200 hover:scale-110 hover:border-gray-300 hover:bg-gray-200 hover:shadow-md"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="hidden flex-1 items-center xl:flex">
            <nav className="flex items-center gap-2 text-sm">
              {breadcrumbs.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  {item.current ? (
                    <span className="font-medium text-gray-800">
                      {item.label}
                    </span>
                  ) : (
                    <a
                      href={item.href}
                      className="text-[var(--primary)] hover:underline"
                    >
                      {item.label}
                    </a>
                  )}
                  {index < breadcrumbs.length - 1 && (
                    <span className="text-gray-400">›</span>
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}

        {/* Date Display */}
        <div className="ml-auto hidden flex-shrink-0 rounded-full bg-[var(--primary-light)] !px-6 !py-2 text-sm font-semibold whitespace-nowrap text-[var(--primary)] lg:block">
          {dateTime}
        </div>
      </div>
    </header>
  )
}
