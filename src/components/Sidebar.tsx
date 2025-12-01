'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface SidebarProps {
  isOpen: boolean
  isPinned: boolean
  onClose: () => void
  onTogglePin: () => void
  currentPath: string
  skipTransition?: boolean // Skip animation on initial page load when pinned
}

export default function Sidebar({
  isOpen,
  isPinned,
  onClose,
  onTogglePin,
  currentPath,
  skipTransition = false,
}: SidebarProps) {
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [isResizing, setIsResizing] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const sidebarRef = useRef<HTMLElement>(null)
  const [sidebarDate, setSidebarDate] = useState('')

  useEffect(() => {
    updateDate()
    const interval = setInterval(updateDate, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Check if mobile on mount and window resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const updateDate = () => {
    const now = new Date()
    const dateText = now.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
    setSidebarDate(dateText)
  }

  // Resize functionality
  const startResize = (e: React.MouseEvent) => {
    setIsResizing(true)
    e.preventDefault()
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const newWidth = Math.max(200, Math.min(500, e.clientX))
      setSidebarWidth(newWidth)
      document.documentElement.style.setProperty(
        '--sidebar-width',
        `${newWidth}px`
      )
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    } else {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg
          className="h-[18px] w-[18px]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
        </svg>
      ),
      active: currentPath === '/dashboard',
    },
    {
      href: '/',
      label: 'Search Results',
      icon: (
        <svg
          className="h-[18px] w-[18px]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
      ),
      active: currentPath === '/' || currentPath === '/search',
    },
    {
      href: '/customers/add',
      label: 'Add Customer',
      icon: (
        <svg
          className="h-[18px] w-[18px]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      ),
      active: currentPath === '/customers/add',
    },
    {
      href: '/breeds',
      label: 'Manage Breeds',
      icon: (
        <svg
          className="h-[18px] w-[18px]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
      active: currentPath === '/breeds',
    },
    {
      href: '/reports/daily-totals',
      label: 'Daily Analytics',
      icon: (
        <svg
          className="h-[18px] w-[18px]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z" />
        </svg>
      ),
      active: currentPath === '/reports/daily-totals',
    },
    {
      href: '/customers/history',
      label: 'Customer History',
      icon: (
        <svg
          className="h-[18px] w-[18px]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      ),
      active: currentPath === '/customers/history',
    },
    {
      href: '/admin/backup',
      label: 'Database Backup',
      icon: (
        <svg
          className="h-[18px] w-[18px]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
        </svg>
      ),
      active: currentPath === '/admin/backup',
    },
  ]

  return (
    <>
      {/* Overlay */}
      {isOpen && !isPinned && (
        <div
          className="fixed inset-0 z-[150] bg-transparent"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <nav
        ref={sidebarRef}
        style={{
          width: isMobile
            ? `min(${sidebarWidth}px, 80vw)`
            : `${sidebarWidth}px`,
        }}
        className={`fixed top-0 left-0 z-[200] flex h-screen flex-col overflow-hidden border-r border-gray-200 bg-white/98 shadow-xl backdrop-blur-[20px] ${
          skipTransition ? '' : 'transition-transform duration-300'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Resize Handle */}
        <div
          onMouseDown={startResize}
          className={`hover:bg-primary absolute top-0 right-[-2px] z-10 h-full w-1 cursor-col-resize bg-transparent transition-colors ${
            isResizing ? 'bg-primary' : ''
          }`}
        />

        {/* Sidebar Header (matches main header top band) */}
        <div className="sidebar_indent flex h-[92px] items-center gap-6 border-b border-gray-200 bg-white pr-[24px] pl-[24px]">
          <div className="hamburger-menu">
            {/* Hamburger/Unpin button */}
            <button
              onClick={isPinned ? onTogglePin : onClose}
              className={`flex h-11 w-11 items-center justify-center rounded-lg transition-all ${
                isPinned ? 'hover:opacity-90' : 'bg-gray-100 hover:bg-gray-200'
              }`}
              style={
                isPinned ? { backgroundColor: 'var(--primary)' } : undefined
              }
              aria-label={isPinned ? 'Unpin sidebar' : 'Close sidebar'}
            >
              {isPinned ? (
                /* Filled pushpin icon when pinned */
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M16 9V4l1 0c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1l1 0v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z" />
                </svg>
              ) : (
                /* Hamburger icon when not pinned */
                <div className="flex flex-col gap-1">
                  <span className="h-0.5 w-5 rounded-sm bg-gray-700" />
                  <span className="h-0.5 w-5 rounded-sm bg-gray-700" />
                  <span className="h-0.5 w-5 rounded-sm bg-gray-700" />
                </div>
              )}
            </button>
          </div>

          {/* Brand */}
          <div
            className="brand-header flex cursor-pointer items-center gap-3 whitespace-nowrap"
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
              <h1 className="text-xl font-bold text-gray-800">
                Pampered Pooch
              </h1>
              <p className="text-xs text-gray-600">Professional Pet Care</p>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="sidebar_indent flex items-center justify-end gap-2 border-b border-gray-100 bg-gray-50 px-[24px] py-3">
          {/* Pin button - only show when not pinned (when pinned, use header pin icon to unpin) */}
          {!isPinned && (
            <button
              onClick={onTogglePin}
              className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-gray-600 transition-all hover:bg-gray-200 hover:text-gray-800"
              title="Pin sidebar"
            >
              {/* Unpinned icon - outline pushpin */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M14 4v5c0 1.12.37 2.16 1 3H9c.65-.86 1-1.9 1-3V4h4m3-2H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3V4h1c.55 0 1-.45 1-1s-.45-1-1-1z" />
              </svg>
            </button>
          )}
          {/* Close button - also unpins if pinned */}
          <button
            onClick={() => {
              if (isPinned) {
                onTogglePin() // Unpin first
              }
              onClose() // Then close
            }}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-gray-600 transition-all hover:bg-gray-200 hover:text-gray-800"
            title="Close sidebar"
          >
            {/* Sidebar collapse/close icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="sidebar_indent flex-1 overflow-y-auto p-4">
          {navItems.map(item => (
            <div key={item.label} className="mb-1">
              <Link
                href={item.href}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  item.active
                    ? 'bg-primary-light text-primary font-semibold'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="bg-primary-light text-primary rounded-full px-4 py-2 text-center text-sm font-semibold">
            {sidebarDate}
          </div>
        </div>
      </nav>
    </>
  )
}
