'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { GITHUB_REPO_URL, DOCS_SITE_URL } from '@/constants'
import { formatDateTimeHeader } from '@/lib/date'

interface NotificationSummary {
  unread: number
  highestPriority: 'error' | 'warning' | 'success' | 'info' | null
}

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
  const [notifications, setNotifications] = useState<NotificationSummary>({
    unread: 0,
    highestPriority: null,
  })

  // Fetch notification summary
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications')
      if (res.ok) {
        const data = await res.json()
        const unreadNotifications =
          data.notifications?.filter(
            (n: { status: string }) => n.status === 'unread'
          ) || []

        // Determine highest priority (error > warning > success > info)
        let highestPriority: NotificationSummary['highestPriority'] = null
        const types = unreadNotifications.map((n: { type: string }) => n.type)

        if (types.includes('error')) {
          highestPriority = 'error'
        } else if (types.includes('warning')) {
          highestPriority = 'warning'
        } else if (types.includes('success')) {
          highestPriority = 'success'
        } else if (types.includes('info')) {
          highestPriority = 'info'
        }

        setNotifications({
          unread: unreadNotifications.length,
          highestPriority,
        })
      }
    } catch {
      // Silently ignore - notifications are optional
    }
  }, [])

  // Poll for notifications every 60 seconds
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

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
    setDateTime(formatDateTimeHeader(now))
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

        {/* External Links */}
        <div className="hidden items-center gap-3 lg:flex">
          {process.env.NEXT_PUBLIC_APP_VERSION && (
            <span className="text-xs text-gray-400">
              v{process.env.NEXT_PUBLIC_APP_VERSION}
            </span>
          )}
          <Link
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-all hover:bg-gray-200 hover:text-gray-900"
            title="GitHub Repository"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
          </Link>
          <Link
            href={DOCS_SITE_URL}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-all hover:bg-gray-200 hover:text-gray-900"
            title="Documentation"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
          </Link>
        </div>

        {/* Notification Bell */}
        <Link
          href="/admin/notifications"
          className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-gray-200 ${
            notifications.highestPriority === 'error'
              ? 'bg-red-100 text-red-600'
              : notifications.highestPriority === 'warning'
                ? 'bg-yellow-100 text-yellow-600'
                : 'bg-gray-100 text-gray-600'
          } ${notifications.unread > 0 && (notifications.highestPriority === 'error' || notifications.highestPriority === 'warning') ? 'animate-pulse' : ''}`}
          title={
            notifications.unread > 0
              ? `${notifications.unread} unread notification${notifications.unread > 1 ? 's' : ''}`
              : 'No notifications'
          }
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
          </svg>
          {notifications.unread > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {notifications.unread > 9 ? '9+' : notifications.unread}
            </span>
          )}
        </Link>

        {/* Date Display */}
        <div className="ml-auto hidden flex-shrink-0 rounded-full bg-[var(--primary-light)] !px-6 !py-2 text-sm font-semibold whitespace-nowrap text-[var(--primary)] lg:block">
          {dateTime}
        </div>
      </div>
    </header>
  )
}
