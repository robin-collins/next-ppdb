'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DocNode } from '@/lib/docs'

interface DocsNavProps {
  items: DocNode[]
}

export function DocsNav({ items }: DocsNavProps) {
  const pathname = usePathname()

  // Helper to render tree
  // We'll flatten slightly for layout: Top level items are headers IF they have children
  // Or just links if they don't.

  return (
    <nav className="w-64 pr-8">
      <div className="sticky top-8">
        <h5 className="font-display mb-6 text-lg font-bold text-gray-900">
          Documentation
        </h5>

        <ul className="space-y-1">
          {items.map(node => {
            const isActive = pathname === node.href

            // If node has items (children), render as a section
            if (node.items && node.items.length > 0) {
              return (
                <li key={node.href} className="mb-6">
                  {node.href ? (
                    <Link
                      href={node.href}
                      className="font-display hover:text-primary mb-2 block font-semibold text-gray-900 transition-colors"
                    >
                      {node.title}
                    </Link>
                  ) : (
                    <h6 className="font-display mb-2 font-semibold text-gray-900">
                      {node.title}
                    </h6>
                  )}
                  <ul className="space-y-1 border-l border-gray-100">
                    {node.items.map(child => {
                      const isChildActive = pathname === child.href
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={`-ml-[1px] block border-l py-1 pl-4 text-sm transition-colors ${
                              isChildActive
                                ? 'border-primary text-primary font-medium'
                                : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
                            }`}
                          >
                            {child.title}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </li>
              )
            }

            // Top level "file" link
            return (
              <li key={node.href}>
                <Link
                  href={node.href}
                  className={`block py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary'
                      : 'text-gray-900 hover:text-gray-700'
                  }`}
                >
                  {node.title}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
