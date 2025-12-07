'use client'

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
              <div className="flex items-center text-sm text-gray-500">
                <span>Docs</span>
                <span className="mx-2">/</span>
                <span className="font-medium text-gray-900">Overview</span>
              </div>
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
