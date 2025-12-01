'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'ppdb-sidebar-pinned'

interface SidebarState {
  sidebarOpen: boolean
  sidebarPinned: boolean
  skipTransition: boolean // True during initial hydration with pinned state
  setSidebarOpen: (open: boolean) => void
  setSidebarPinned: (pinned: boolean) => void
  toggleSidebar: () => void
  togglePin: () => void
  closeSidebar: () => void
}

/**
 * Custom hook for managing sidebar state with localStorage persistence.
 * The pinned state persists across page loads and navigation.
 */
export function useSidebarState(): SidebarState {
  const [sidebarOpen, setSidebarOpenState] = useState(false)
  const [sidebarPinned, setSidebarPinnedState] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [skipTransition, setSkipTransition] = useState(true) // Start true, set false after first render

  // Load pinned state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'true') {
      setSidebarPinnedState(true)
      setSidebarOpenState(true) // If pinned, should be open
    }
    setIsHydrated(true)

    // After a brief delay, enable transitions (allows initial render without animation)
    const timer = setTimeout(() => {
      setSkipTransition(false)
    }, 50)

    return () => clearTimeout(timer)
  }, [])

  // Persist pinned state to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, String(sidebarPinned))
    }
  }, [sidebarPinned, isHydrated])

  const setSidebarOpen = useCallback((open: boolean) => {
    setSidebarOpenState(open)
  }, [])

  const setSidebarPinned = useCallback((pinned: boolean) => {
    setSidebarPinnedState(pinned)
    if (pinned) {
      setSidebarOpenState(true) // Ensure sidebar is open when pinned
    }
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarOpenState(prev => !prev)
  }, [])

  const togglePin = useCallback(() => {
    setSidebarPinnedState(prev => {
      const newPinned = !prev
      if (newPinned) {
        setSidebarOpenState(true) // Ensure sidebar is open when pinning
      }
      return newPinned
    })
  }, [])

  const closeSidebar = useCallback(() => {
    setSidebarOpenState(false)
    setSidebarPinnedState(false)
  }, [])

  return {
    sidebarOpen: isHydrated ? sidebarOpen : false,
    sidebarPinned: isHydrated ? sidebarPinned : false,
    skipTransition,
    setSidebarOpen,
    setSidebarPinned,
    toggleSidebar,
    togglePin,
    closeSidebar,
  }
}
