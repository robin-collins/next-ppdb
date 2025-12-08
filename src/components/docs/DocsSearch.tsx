'use client'

import { useState, useEffect, useMemo } from 'react'
import Fuse from 'fuse.js'
import { useRouter } from 'next/navigation'

interface SearchResult {
  url: string
  title: string
  description: string
  content: string
}

export function DocsSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [index, setIndex] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  // Load the index once on mount
  useEffect(() => {
    fetch('/search-index.json')
      .then((res) => res.json())
      .then((data) => setIndex(data))
      .catch((err) => console.error('Failed to load search index:', err))
  }, [])

  // Configure Fuse.js
  const fuse = useMemo(() => {
    return new Fuse(index, {
      keys: [
        { name: 'title', weight: 2 },
        { name: 'description', weight: 1.5 },
        { name: 'content', weight: 1 }
      ],
      threshold: 0.3,
      includeScore: true,
      ignoreLocation: true,
    })
  }, [index])

  // Run search when query changes
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }
    const searchResults = fuse.search(query)
    setResults(searchResults.slice(0, 8).map((result) => result.item))
    setIsOpen(true)
  }, [query, fuse])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false)
    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

  const handleResultClick = (url: string) => {
    setQuery('')
    setIsOpen(false)
    router.push(url)
  }

  return (
    <div className="relative w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
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
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length >= 2 && setIsOpen(true)}
      />
      <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
        <kbd className="inline-flex items-center rounded border border-gray-200 px-1 font-sans text-xs text-gray-400">
          Ctrl K
        </kbd>
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          <ul className="max-h-96 overflow-auto">
            {results.map((result, idx) => (
              <li key={result.url} className={idx === 0 ? '' : 'border-t border-gray-100'}>
                <button
                  onClick={() => handleResultClick(result.url)}
                  className="block w-full text-left p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">{result.title}</div>
                  {result.description && (
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {result.description}
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

