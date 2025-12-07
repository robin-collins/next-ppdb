'use client'

import { useState } from 'react'

export function DocsSearch() {
  const [query, setQuery] = useState('')

  return (
    <div className="relative w-full max-w-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          className="h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <input
        type="text"
        className="focus:ring-primary block w-full rounded-full border-0 bg-gray-50 py-2 pr-4 pl-10 text-gray-900 ring-1 ring-gray-200 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
        placeholder="Search documentation..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
        <kbd className="inline-flex items-center rounded border border-gray-200 px-1 font-sans text-xs text-gray-400">
          Ctrl K
        </kbd>
      </div>
    </div>
  )
}
