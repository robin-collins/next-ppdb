'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSidebarState } from '@/hooks/useSidebarState'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { routes } from '@/lib/routes'

interface NavItem {
  href: string
  label: string
  description: string
  icon: React.ReactNode
  color: 'primary' | 'secondary' | 'accent' | 'warning' | 'success'
}

const navItems: NavItem[] = [
  {
    href: routes.home(),
    label: 'Search',
    description: 'Search animals and customers',
    color: 'primary',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
      </svg>
    ),
  },
  {
    href: routes.customers.add(),
    label: 'Add Customer',
    description: 'Register a new customer',
    color: 'secondary',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
  },
  {
    href: routes.breeds.list(),
    label: 'Manage Breeds',
    description: 'View and edit breed database',
    color: 'primary',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    href: routes.reports.analytics(),
    label: 'Analytics Dashboard',
    description: 'View revenue trends and statistics',
    color: 'secondary',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z" />
      </svg>
    ),
  },
  {
    href: routes.reports.dailyTotals(),
    label: 'Daily Totals',
    description: 'End of day takings report',
    color: 'secondary',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
      </svg>
    ),
  },
  {
    href: routes.customers.history(),
    label: 'Customer History',
    description: 'Browse customer visit history',
    color: 'primary',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
      </svg>
    ),
  },
  {
    href: '/admin/backup',
    label: 'Database Backup',
    description: 'Backup and restore data',
    color: 'secondary',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
      </svg>
    ),
  },
  {
    href: '/api/docs',
    label: 'API Docs',
    description: 'Interactive API documentation',
    color: 'primary',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
      </svg>
    ),
  },
]

const colorClasses = {
  primary: {
    bg: 'bg-[var(--primary)]',
    hover: 'hover:bg-[#c97d3d] hover:border-[#8b5a2b]',
    shadow: 'hover:shadow-[0_10px_30px_-5px_rgba(217,148,74,0.4)]',
  },
  secondary: {
    bg: 'bg-[var(--secondary)]',
    hover: 'hover:bg-[#178a6c] hover:border-[#0f6652]',
    shadow: 'hover:shadow-[0_10px_30px_-5px_rgba(27,158,126,0.4)]',
  },
  accent: {
    bg: 'bg-[var(--accent)]',
    hover: 'hover:bg-[#24a382] hover:border-[#178a6c]',
    shadow: 'hover:shadow-[0_10px_30px_-5px_rgba(45,184,148,0.4)]',
  },
  warning: {
    bg: 'bg-[var(--warning)]',
    hover: 'hover:bg-[#d9a45a] hover:border-[#c97d3d]',
    shadow: 'hover:shadow-[0_10px_30px_-5px_rgba(232,184,118,0.4)]',
  },
  success: {
    bg: 'bg-[var(--success)]',
    hover: 'hover:bg-[#24a382] hover:border-[#178a6c]',
    shadow: 'hover:shadow-[0_10px_30px_-5px_rgba(45,184,148,0.4)]',
  },
}

export default function DashboardPage() {
  const {
    sidebarOpen,
    sidebarPinned,
    skipTransition,
    setSidebarOpen,
    toggleSidebar,
    togglePin,
  } = useSidebarState()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        onToggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        sidebarPinned={sidebarPinned}
        onSearch={handleSearch}
        searchValue={searchQuery}
        breadcrumbs={[{ label: 'Dashboard', current: true }]}
      />

      <Sidebar
        isOpen={sidebarOpen}
        isPinned={sidebarPinned}
        onClose={() => setSidebarOpen(false)}
        onTogglePin={togglePin}
        currentPath="/dashboard"
        skipTransition={skipTransition}
      />

      <main
        className={`mt-6 mr-6 mb-6 flex-1 overflow-hidden rounded-2xl bg-white/95 p-8 shadow-xl backdrop-blur-[20px] ${
          skipTransition ? '' : 'transition-[margin-left] duration-[250ms]'
        }`}
        style={{
          marginLeft: sidebarPinned
            ? 'calc(var(--sidebar-width) + 1.5rem)'
            : '1.5rem',
        }}
      >
        {/* Page Header with Mascot */}
        <div className="mb-10 flex items-center gap-6">
          <div className="relative h-24 w-24 flex-shrink-0">
            <Image
              src="/images/CARTOON_DOG_7.png"
              alt="Pampered Pooch mascot"
              fill
              className="object-contain"
              style={{ animation: 'float 3s ease-in-out infinite' }}
            />
          </div>
          <div>
            <h1 className="text-3xl font-[var(--font-display)] font-bold text-[var(--gray-900)]">
              Welcome to Pampered Pooch
            </h1>
            <p className="mt-1 text-lg text-[var(--gray-600)]">
              Your professional pet grooming management system
            </p>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {navItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex flex-col items-center gap-4 rounded-2xl border-2 border-transparent p-6 text-center text-white transition-all duration-200 ${colorClasses[item.color].bg} ${colorClasses[item.color].hover} ${colorClasses[item.color].shadow} hover:scale-105`}
              style={{
                animation: `slideInUp 0.4s ease-out ${index * 0.1}s forwards`,
                opacity: 0,
              }}
            >
              <div className="rounded-full bg-white/20 p-4 transition-transform duration-200 group-hover:scale-110">
                {item.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold">{item.label}</h2>
                <p className="mt-1 text-sm opacity-90">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Stats or Info Section */}
        <div className="mt-12 rounded-xl border border-[var(--gray-200)] bg-[var(--gray-50)] p-6">
          <h3 className="mb-4 text-xl font-[var(--font-display)] font-semibold text-[var(--gray-800)]">
            Quick Tips
          </h3>
          <ul className="space-y-2 text-[var(--gray-600)]">
            <li className="flex items-center gap-2">
              <span className="text-[var(--primary)]">•</span>
              Use the search bar to quickly find animals or customers
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[var(--secondary)]">•</span>
              Pin the sidebar for easy navigation on larger screens
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[var(--accent)]">•</span>
              Check Daily Analytics for business insights
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}
