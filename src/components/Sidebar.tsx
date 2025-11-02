'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface SidebarProps {
  isOpen: boolean
  isPinned: boolean
  onClose: () => void
  onTogglePin: () => void
  currentPath: string
}

export default function Sidebar({
  isOpen,
  isPinned,
  onClose,
  onTogglePin,
  currentPath,
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
      href: '/',
      label: 'Dashboard',
      icon: (
        <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
        </svg>
      ),
      active: currentPath === '/dashboard',
    },
    {
      href: '/',
      label: 'Search Results',
      icon: (
        <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
      ),
      active: currentPath === '/' || currentPath === '/search',
    },
    {
      href: '/customers/new',
      label: 'Add Customer',
      icon: (
        <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      ),
      active: currentPath === '/customers/new',
    },
    {
      href: '/breeds',
      label: 'Manage Breeds',
      icon: (
        <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
      active: currentPath === '/breeds',
    },
    {
      href: '/analytics',
      label: 'Daily Analytics',
      icon: (
        <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z" />
        </svg>
      ),
      active: currentPath === '/analytics',
    },
    {
      href: '/history',
      label: 'Customer History',
      icon: (
        <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      ),
      active: currentPath === '/history',
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
          width: isMobile ? `min(${sidebarWidth}px, 80vw)` : `${sidebarWidth}px`,
        }}
        className={`fixed left-0 top-0 z-[200] flex h-screen flex-col overflow-hidden border-r border-gray-200 bg-white/98 shadow-xl backdrop-blur-[20px] transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isPinned ? 'relative' : ''}`}
      >
        {/* Resize Handle */}
        <div
          onMouseDown={startResize}
          className={`absolute right-[-2px] top-0 z-10 h-full w-1 cursor-col-resize bg-transparent transition-colors hover:bg-primary ${
            isResizing ? 'bg-primary' : ''
          }`}
        />

        {/* Sidebar Header (matches main header top band) */}
        <div className="sidebar_indent flex h-[92px] items-center border-b border-gray-200 bg-white pl-[24px] pr-[24px]">
          <div className="flex items-center gap-3 whitespace-nowrap">
            {/* Hamburger, mirrors header */}
            <button
              onClick={onClose}
              className={`flex flex-col gap-1 rounded-lg bg-gray-100 p-3 transition-all hover:bg-gray-200`}
              aria-label="Toggle sidebar"
            >
              <span className={`h-0.5 w-5 rounded-sm bg-gray-700`} />
              <span className={`h-0.5 w-5 rounded-sm bg-gray-700`} />
              <span className={`h-0.5 w-5 rounded-sm bg-gray-700`} />
            </button>

            {/* Brand */}
            <div className="brand-header flex cursor-default items-center gap-3 whitespace-nowrap">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17L10.58 10.76C10.21 10.88 9.84 11 9.5 11C8.12 11 7 9.88 7 8.5C7 7.12 8.12 6 9.5 6C9.84 6 10.21 6.12 10.58 6.24L12.19 4.63C11.34 3.91 10.2 3.5 9 3.5C6.79 3.5 5 5.29 5 7.5S6.79 11.5 9 11.5C9.85 11.5 10.65 11.2 11.26 10.74L17.5 17H19.5L21 15.5V13.5L15.33 7.83L21 9Z" />
                </svg>
              </div>
              <div className="brand-text hidden sm:block whitespace-nowrap">
                <h3 className="text-xl font-bold text-gray-800">Pampered Pooch</h3>
                <p className="text-xs text-gray-600">Professional Pet Care</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Actions (moved below header to keep top band identical) */}
        <div className="sidebar_indent flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-[24px] py-3">
          <button
            onClick={onTogglePin}
            className={`flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-gray-600 transition-all hover:bg-gray-200 hover:text-gray-800 ${
              isPinned ? 'bg-primary text-white' : ''
            }`}
            title="Pin sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 4V2a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4v2h1l1 10c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2l1-10h1V4h-4zm-6-2h4v2h-4V2zm7 4l-1 10H8l-1-10h10z" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-gray-600 transition-all hover:bg-gray-200 hover:text-gray-800"
            title="Close sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="sidebar_indent flex-1 overflow-y-auto p-4">
          {navItems.map((item) => (
            <div key={item.label} className="mb-1">
              <Link
                href={item.href}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  item.active
                    ? 'bg-primary-light font-semibold text-primary'
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
          <div className="rounded-full bg-primary-light px-4 py-2 text-center text-sm font-semibold text-primary">
            {sidebarDate}
          </div>
        </div>
      </nav>
    </>
  )
}

