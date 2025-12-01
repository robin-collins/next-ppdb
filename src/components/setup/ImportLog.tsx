'use client'

import { useRef, useEffect, useState } from 'react'

interface LogEntry {
  timestamp: string
  level: 'info' | 'success' | 'warning' | 'error'
  table?: string
  recordId?: number
  message: string
  details?: string
}

interface ImportLogProps {
  logs: LogEntry[]
}

export default function ImportLog({ logs }: ImportLogProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [logs, autoScroll])

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
      setAutoScroll(isAtBottom)
    }
  }

  const getLevelStyles = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return 'text-green-700 bg-green-50'
      case 'warning':
        return 'text-amber-700 bg-amber-50'
      case 'error':
        return 'text-red-700 bg-red-50'
      default:
        return 'text-blue-700 bg-blue-50'
    }
  }

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return (
          <svg
            className="h-3.5 w-3.5 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )
      case 'warning':
        return (
          <svg
            className="h-3.5 w-3.5 text-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        )
      case 'error':
        return (
          <svg
            className="h-3.5 w-3.5 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )
      default:
        return (
          <svg
            className="h-3.5 w-3.5 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
    }
  }

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString()
    } catch {
      return ''
    }
  }

  if (logs.length === 0) {
    return null
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div
        className="flex cursor-pointer items-center justify-between border-b border-gray-200 px-4 py-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <svg
            className={`h-4 w-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="font-medium text-gray-700">Import Log</span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {logs.length} entries
          </span>
        </div>
        {!autoScroll && isExpanded && (
          <button
            onClick={e => {
              e.stopPropagation()
              setAutoScroll(true)
            }}
            className="text-primary text-xs hover:underline"
          >
            Resume auto-scroll
          </button>
        )}
      </div>

      {isExpanded && (
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="max-h-64 overflow-y-auto p-2 font-mono text-xs"
        >
          {logs.map((log, index) => (
            <div
              key={index}
              className={`mb-1 flex items-start gap-2 rounded px-2 py-1 ${getLevelStyles(log.level)}`}
            >
              <span className="flex-shrink-0 pt-0.5">
                {getLevelIcon(log.level)}
              </span>
              <span className="flex-shrink-0 text-gray-400">
                {formatTime(log.timestamp)}
              </span>
              {log.table && (
                <span className="flex-shrink-0 rounded bg-gray-200 px-1 text-gray-600">
                  {log.table}
                </span>
              )}
              <span className="flex-1">{log.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
