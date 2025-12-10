'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useSidebarState } from '@/hooks/useSidebarState'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { DocsNav } from '@/components/docs/DocsNav'
import { DocsSearch } from '@/components/docs/DocsSearch'
import { DocNode } from '@/lib/docs'

export interface DocsShellProps {
  children: React.ReactNode
  navItems: DocNode[]
}

export function DocsShell({ children, navItems }: DocsShellProps) {
  const pathname = usePathname()
  const {
    sidebarOpen,
    sidebarPinned,
    skipTransition,
    setSidebarOpen,
    toggleSidebar,
    togglePin,
  } = useSidebarState()

  // No-op search for docs pages - we use the internal DocsSearch
  const handleSearch = () => {}

  // Breadcrumb Logic
  const generateBreadcrumbs = () => {
    // Splits path: /docs/foo/bar -> ['', 'docs', 'foo', 'bar']
    const segments = pathname.split('/').filter(Boolean)

    // Build crumbs array
    const crumbs = segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/')
      const isLast = index === segments.length - 1

      // Default title is capitalized segment
      let title =
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')

      // Try to find matching title in navItems
      // This is a simple deep search - could be optimized but nav tree is small
      const findTitle = (items: DocNode[]): string | undefined => {
        if (!items) return undefined
        for (const item of items) {
          // Check if this item matches the current CUMULATIVE path
          // Actually, our nav items have full hrefs.
          // So we just look for an item where item.href matches URL so far.
          if (item.href === href) return item.title

          if (item.items) {
            const found = findTitle(item.items)
            if (found) return found
          }
        }
      }

      // Don't search for "docs" root, we hardcode it
      if (segment !== 'docs') {
        const foundTitle = findTitle(navItems)
        if (foundTitle) title = foundTitle
      } else {
        title = 'Docs'
      }

      return { title, href, isLast }
    })

    return crumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <Header
        onToggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        sidebarPinned={sidebarPinned}
        onSearch={handleSearch}
        searchValue=""
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        isPinned={sidebarPinned}
        onClose={() => setSidebarOpen(false)}
        onTogglePin={togglePin}
        currentPath="/docs"
        skipTransition={skipTransition}
      />

      {/* Main Content */}
      <main
        className={`mt-6 mr-6 mb-6 flex-1 overflow-hidden rounded-2xl bg-white/95 !p-8 shadow-xl backdrop-blur-[20px] ${
          skipTransition ? '' : 'transition-[margin-left] duration-[250ms]'
        }`}
        style={{
          marginLeft: sidebarPinned
            ? 'calc(var(--sidebar-width) + 1.5rem)'
            : '1.5rem',
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-12 lg:flex-row">
          {/* Docs Navigation (Left) */}
          <aside className="hidden flex-shrink-0 lg:block">
            <DocsNav items={navItems} />
          </aside>

          {/* Content Area (Right) */}
          <div className="min-w-0 flex-1">
            {/* Docs Header with Search */}
            <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-8">
              <nav className="flex items-center text-sm text-gray-500">
                {breadcrumbs.map((crumb, i) => (
                  <div key={crumb.href} className="flex items-center">
                    {i > 0 && <span className="mx-2">/</span>}
                    {crumb.isLast ? (
                      <span className="font-medium text-gray-900">
                        {crumb.title}
                      </span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="hover:text-primary hover:underline"
                      >
                        {crumb.title}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
              <DocsSearch />
            </div>

            <div className="prose prose-lg prose-slate max-w-none">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
