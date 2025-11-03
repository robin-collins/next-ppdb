# PPDB Redesign Implementation Plan

## Overview

This document outlines the complete implementation plan for transforming the current Next.js 15 PPDB application to match the modern design draft (`reference/redesign/ppdb_search_results.html`).

**Current State:** Basic blue background with inline search form and table-based results.

**Target State:** Modern professional UI with:

- Persistent glassmorphic header with integrated search
- Collapsible/resizable sidebar navigation
- Animated gradient background
- Card-based grid/list view toggle
- Empty states with suggestions
- Modern design system with shadows, animations, and hover effects

---

## Design System Tokens

### Color Palette (CSS Custom Properties)

```css
/* Primary Colors */
--primary: #6366f1;
--primary-hover: #4f46e5;
--primary-light: #e0e7ff;

/* Secondary & Accent */
--secondary: #06b6d4;
--secondary-hover: #0891b2;
--accent: #f59e0b;
--accent-hover: #d97706;

/* Status Colors */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;

/* Neutrals */
--white: #ffffff;
--gray-50: #f8fafc;
--gray-100: #f1f5f9;
--gray-200: #e2e8f0;
--gray-300: #cbd5e1;
--gray-400: #94a3b8;
--gray-500: #64748b;
--gray-600: #475569;
--gray-700: #334155;
--gray-800: #1e293b;
--gray-900: #0f172a;
```

### Typography

```css
--font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

### Spacing Scale

```css
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
```

### Border Radius

```css
--radius-sm: 0.375rem; /* 6px */
--radius-md: 0.5rem; /* 8px */
--radius-lg: 0.75rem; /* 12px */
--radius-xl: 1rem; /* 16px */
--radius-2xl: 1.5rem; /* 24px */
--radius-full: 9999px;
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl:
  0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
```

### Layout Constants

```css
--sidebar-width: 280px;
--header-height: 70px;
```

### Animated Gradient Background

```css
background: linear-gradient(
  135deg,
  #667eea 0%,
  #764ba2 25%,
  #6366f1 50%,
  #06b6d4 75%,
  #10b981 100%
);
background-size: 400% 400%;
animation: gradientShift 15s ease infinite;

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
```

---

## Phase 1: Design System Foundation

### Task 1.1: Update globals.css

**File:** `src/app/globals.css`

**Action:** Replace entire contents with the following:

```css
@import 'tailwindcss';

/* Import Inter font */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

:root {
  /* Primary Colors */
  --primary: #6366f1;
  --primary-hover: #4f46e5;
  --primary-light: #e0e7ff;

  /* Secondary & Accent */
  --secondary: #06b6d4;
  --secondary-hover: #0891b2;
  --accent: #f59e0b;
  --accent-hover: #d97706;

  /* Status Colors */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;

  /* Neutrals */
  --white: #ffffff;
  --gray-50: #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-300: #cbd5e1;
  --gray-400: #94a3b8;
  --gray-500: #64748b;
  --gray-600: #475569;
  --gray-700: #334155;
  --gray-800: #1e293b;
  --gray-900: #0f172a;

  /* Typography */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

  /* Spacing Scale */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;

  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg:
    0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl:
    0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);

  /* Layout */
  --sidebar-width: 280px;
  --header-height: 70px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  line-height: 1.6;
}

body {
  font-family: var(--font-family);
  background: linear-gradient(
    135deg,
    #667eea 0%,
    #764ba2 25%,
    #6366f1 50%,
    #06b6d4 75%,
    #10b981 100%
  );
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  min-height: 100vh;
  color: var(--gray-800);
  overflow-x: hidden;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Verification:** Refresh browser - background should animate between gradient colors.

---

## Phase 2: Header Component

### Task 2.1: Create Header Component

**File:** `src/components/Header.tsx`

**Component Structure:**

- Hamburger menu button (left)
- Brand logo with icon and text (center-left)
- Search bar (center, flex-grow)
- Date/time display (right)

**Props Interface:**

```typescript
interface HeaderProps {
  onToggleSidebar: () => void
  sidebarOpen: boolean
  onSearch: (query: string) => void
  searchValue: string
}
```

**HTML Structure:**

```tsx
'use client'
import { useState, useEffect } from 'react'

export default function Header({
  onToggleSidebar,
  sidebarOpen,
  onSearch,
  searchValue,
}: HeaderProps) {
  const [query, setQuery] = useState(searchValue)
  const [dateTime, setDateTime] = useState('')

  useEffect(() => {
    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const updateDateTime = () => {
    const now = new Date()
    const timeText = now
      .toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      .toLowerCase()
    const dateText = now.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    setDateTime(`${timeText} ${dateText}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  const handleClear = () => {
    setQuery('')
    onSearch('')
  }

  return (
    <header className="sticky top-0 z-[100] border-b border-white/20 bg-white/95 p-4 shadow-md backdrop-blur-[20px]">
      <div className="mx-auto flex max-w-[1400px] items-center gap-6">
        {/* Hamburger Menu */}
        <div className="hamburger-menu">
          <button
            onClick={onToggleSidebar}
            className={`flex flex-col gap-1 rounded-lg bg-gray-100 p-3 transition-all hover:bg-gray-200 ${sidebarOpen ? 'active' : ''}`}
            aria-label="Toggle sidebar"
          >
            <span
              className={`h-0.5 w-5 rounded-sm bg-gray-700 transition-all ${sidebarOpen ? 'translate-y-[6px] rotate-45' : ''}`}
            />
            <span
              className={`h-0.5 w-5 rounded-sm bg-gray-700 transition-all ${sidebarOpen ? 'opacity-0' : ''}`}
            />
            <span
              className={`h-0.5 w-5 rounded-sm bg-gray-700 transition-all ${sidebarOpen ? '-translate-y-[6px] -rotate-45' : ''}`}
            />
          </button>
        </div>

        {/* Brand Logo */}
        <div
          className="brand-header flex cursor-pointer items-center gap-3"
          onClick={() => (window.location.href = '/')}
        >
          <div className="from-primary to-secondary flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17L10.58 10.76C10.21 10.88 9.84 11 9.5 11C8.12 11 7 9.88 7 8.5C7 7.12 8.12 6 9.5 6C9.84 6 10.21 6.12 10.58 6.24L12.19 4.63C11.34 3.91 10.2 3.5 9 3.5C6.79 3.5 5 5.29 5 7.5S6.79 11.5 9 11.5C9.85 11.5 10.65 11.2 11.26 10.74L17.5 17H19.5L21 15.5V13.5L15.33 7.83L21 9Z" />
            </svg>
          </div>
          <div className="brand-text hidden sm:block">
            <h1 className="text-xl font-bold text-gray-800">Pampered Pooch</h1>
            <p className="text-xs text-gray-600">Professional Pet Care</p>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex flex-1 items-center">
          <div className="focus-within:border-primary relative flex w-full max-w-[600px] items-center rounded-2xl border-2 border-gray-200 bg-white shadow-sm transition-all focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.1),0_4px_6px_-1px_rgb(0_0_0_/_0.1),0_2px_4px_-2px_rgb(0_0_0_/_0.1)]">
            <svg
              className="ml-4 h-5 w-5 flex-shrink-0 text-gray-400"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search animals, breeds, owners..."
              className="flex-1 border-none bg-transparent px-4 py-4 text-base font-medium text-gray-800 outline-none"
            />
            <div className="mr-2 flex gap-2">
              <button
                type="submit"
                className="bg-primary hover:bg-primary-hover flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-white transition-all"
              >
                Search
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-200"
              >
                Clear
              </button>
            </div>
          </div>
        </form>

        {/* Date Display */}
        <div className="bg-primary-light text-primary hidden rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap lg:block">
          {dateTime}
        </div>
      </div>
    </header>
  )
}
```

**Styling Notes:**

- Use `backdrop-filter: blur(20px)` for glassmorphic effect
- Sticky positioning with `position: sticky; top: 0;`
- Hamburger animation: rotate bars on active state
- Search bar expands with focus ring effect

---

## Phase 3: Sidebar Component

### Task 3.1: Create Sidebar Component

**File:** `src/components/Sidebar.tsx`

**Component Features:**

1. Slide-in/out animation (transform: translateX)
2. Pin/unpin button (fixes position when pinned)
3. Resizable width (drag handle on right edge)
4. Navigation menu with active states
5. Date display in footer
6. Overlay for mobile

**Props Interface:**

```typescript
interface SidebarProps {
  isOpen: boolean
  isPinned: boolean
  onClose: () => void
  onTogglePin: () => void
  currentPath: string
}
```

**State Management:**

```typescript
const [sidebarWidth, setSidebarWidth] = useState(280)
const [isResizing, setIsResizing] = useState(false)
```

**Navigation Items:**

```typescript
const navItems = [
  { href: '/', label: 'Dashboard', icon: 'dashboard', active: false },
  { href: '/', label: 'Search Results', icon: 'search', active: true },
  { href: '/customers/new', label: 'Add Customer', icon: 'add', active: false },
  { href: '/breeds', label: 'Manage Breeds', icon: 'star', active: false },
  {
    href: '/analytics',
    label: 'Daily Analytics',
    icon: 'analytics',
    active: false,
  },
  {
    href: '/history',
    label: 'Customer History',
    icon: 'history',
    active: false,
  },
]
```

**HTML Structure:**

```tsx
'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

export default function Sidebar({
  isOpen,
  isPinned,
  onClose,
  onTogglePin,
  currentPath,
}: SidebarProps) {
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef<HTMLElement>(null)
  const [sidebarDate, setSidebarDate] = useState('')

  useEffect(() => {
    updateDate()
    const interval = setInterval(updateDate, 60000) // Update every minute
    return () => clearInterval(interval)
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
      href: '/customers/new',
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
      active: currentPath === '/customers/new',
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
      href: '/analytics',
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
      active: currentPath === '/analytics',
    },
    {
      href: '/history',
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
        style={{ width: `${sidebarWidth}px` }}
        className={`fixed top-0 left-0 z-[200] flex h-screen flex-col overflow-hidden border-r border-gray-200 bg-white/98 shadow-xl backdrop-blur-[20px] transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isPinned ? 'relative' : ''}`}
      >
        {/* Resize Handle */}
        <div
          onMouseDown={startResize}
          className={`hover:bg-primary absolute top-0 right-[-2px] z-10 h-full w-1 cursor-col-resize bg-transparent transition-colors ${
            isResizing ? 'bg-primary' : ''
          }`}
        />

        {/* Sidebar Header */}
        <div className="flex min-h-[70px] items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="from-primary to-secondary flex h-[35px] w-[35px] items-center justify-center rounded-lg bg-gradient-to-br text-white">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17L10.58 10.76C10.21 10.88 9.84 11 9.5 11C8.12 11 7 9.88 7 8.5C7 7.12 8.12 6 9.5 6C9.84 6 10.21 6.12 10.58 6.24L12.19 4.63C11.34 3.91 10.2 3.5 9 3.5C6.79 3.5 5 5.29 5 7.5S6.79 11.5 9 11.5C9.85 11.5 10.65 11.2 11.26 10.74L17.5 17H19.5L21 15.5V13.5L15.33 7.83L21 9Z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800">
                Pampered Pooch
              </h3>
              <p className="text-xs text-gray-600">Professional Pet Care</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onTogglePin}
              className={`flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-gray-600 transition-all hover:bg-gray-200 hover:text-gray-800 ${
                isPinned ? 'bg-primary text-white' : ''
              }`}
              title="Pin sidebar"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M16 4V2a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4v2h1l1 10c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2l1-10h1V4h-4zm-6-2h4v2h-4V2zm7 4l-1 10H8l-1-10h10z" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-gray-600 transition-all hover:bg-gray-200 hover:text-gray-800"
              title="Close sidebar"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto p-4">
          {navItems.map(item => (
            <div key={item.href} className="mb-1">
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
```

**Resize Logic:**

- Min width: 200px
- Max width: 500px
- Drag handle on right edge (4px wide, invisible until hover)
- Updates CSS variable `--sidebar-width`

---

## Phase 4: Empty State Component

### Task 4.1: Create EmptyState Component

**File:** `src/components/EmptyState.tsx`

**Props Interface:**

```typescript
interface EmptyStateProps {
  onSuggestionClick: (suggestion: string) => void
}
```

**HTML Structure:**

```tsx
export default function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  const suggestions = ['Cody', 'Maltese', 'James', 'active']

  return (
    <div className="flex min-h-[calc(100vh-var(--header-height)-3rem)] items-center justify-center p-8">
      <div className="max-w-[500px] text-center">
        <div className="mb-6 flex justify-center text-gray-400">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>

        <h2 className="mb-3 text-3xl font-bold text-gray-800">
          Search for Animals
        </h2>

        <p className="mb-8 text-lg leading-relaxed text-gray-600">
          Enter an animal name, breed, or owner in the search box above to find
          grooming records.
        </p>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <p className="mb-3 text-xs font-bold tracking-wider text-gray-700 uppercase">
            Try searching for:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map(suggestion => (
              <button
                key={suggestion}
                onClick={() => onSuggestionClick(suggestion)}
                className="hover:border-primary hover:bg-primary-light hover:text-primary cursor-pointer rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## Phase 5: Results Components

### Task 5.1: Create AnimalCard Component

**File:** `src/components/AnimalCard.tsx`

**Props Interface:**

```typescript
interface AnimalCardProps {
  animal: {
    id: number
    name: string
    breed: string
    colour: string | null
    customer: {
      surname: string
      phone1?: string | null
    }
    lastVisit: Date
    cost: number
  }
  onClick: (id: number) => void
}
```

**HTML Structure:**

```tsx
export default function AnimalCard({ animal, onClick }: AnimalCardProps) {
  const initials = animal.name.charAt(0).toUpperCase()
  const formattedDate = new Date(animal.lastVisit).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  })

  return (
    <div
      onClick={() => onClick(animal.id)}
      className="group hover:border-primary relative cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Top accent bar */}
      <div className="from-primary to-secondary group-hover:from-primary group-hover:via-secondary group-hover:to-accent h-1 bg-gradient-to-r transition-all group-hover:h-1.5" />

      <div className="p-4 pt-5">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="from-primary to-secondary flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br text-xl font-bold text-white shadow-[0_2px_8px_rgba(99,102,241,0.2)] transition-all group-hover:scale-110 group-hover:shadow-[0_4px_16px_rgba(99,102,241,0.3)]">
              {initials}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{animal.name}</h3>
              <p className="text-sm text-gray-600">{animal.breed}</p>
            </div>
          </div>
          <span className="from-success rounded-full border border-green-300 bg-gradient-to-br to-[#059669] px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase shadow-sm transition-all group-hover:shadow-[0_2px_8px_rgba(16,185,129,0.3)]">
            Active
          </span>
        </div>

        {/* Info Grid */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="group-hover:border-primary/10 rounded-lg border border-gray-100 bg-gray-50 p-2 transition-all group-hover:bg-white/80">
            <span className="mb-1 block text-[0.7rem] font-bold tracking-wider text-gray-500 uppercase">
              Owner
            </span>
            <span className="font-semibold text-gray-800">
              {animal.customer.surname}
            </span>
          </div>

          <div className="group-hover:border-primary/10 rounded-lg border border-gray-100 bg-gray-50 p-2 transition-all group-hover:bg-white/80">
            <span className="mb-1 block text-[0.7rem] font-bold tracking-wider text-gray-500 uppercase">
              Color
            </span>
            <span className="font-semibold text-gray-800">
              {animal.colour || 'N/A'}
            </span>
          </div>

          <div className="group-hover:border-primary/10 rounded-lg border border-gray-100 bg-gray-50 p-2 transition-all group-hover:bg-white/80">
            <span className="mb-1 block text-[0.7rem] font-bold tracking-wider text-gray-500 uppercase">
              Phone
            </span>
            <span className="font-semibold text-gray-800">
              {animal.customer.phone1 || 'N/A'}
            </span>
          </div>

          <div className="group-hover:border-primary/10 rounded-lg border border-gray-100 bg-gray-50 p-2 transition-all group-hover:bg-white/80">
            <span className="mb-1 block text-[0.7rem] font-bold tracking-wider text-gray-500 uppercase">
              Last Visit
            </span>
            <span className="font-semibold text-gray-800">{formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### Task 5.2: Create ResultsView Component

**File:** `src/components/ResultsView.tsx`

**Props Interface:**

```typescript
interface ResultsViewProps {
  animals: Animal[]
  query: string
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  onAnimalClick: (id: number) => void
}
```

**HTML Structure:**

```tsx
import AnimalCard from './AnimalCard'

export default function ResultsView({
  animals,
  query,
  viewMode,
  onViewModeChange,
  onAnimalClick,
}: ResultsViewProps) {
  return (
    <div className="p-6">
      {/* Results Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="mb-1 text-2xl font-bold text-gray-800">
            {animals.length} Animal{animals.length !== 1 ? 's' : ''} Found
          </h2>
          <div className="text-sm text-gray-600">
            Search results for{' '}
            <span className="bg-primary-light text-primary rounded px-2 py-1 font-semibold">
              {query}
            </span>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`flex items-center gap-2 rounded-md px-3 py-2 transition-all ${
              viewMode === 'grid'
                ? 'text-primary bg-white shadow-sm'
                : 'text-gray-600'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
            </svg>
            Cards
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`flex items-center gap-2 rounded-md px-3 py-2 transition-all ${
              viewMode === 'list'
                ? 'text-primary bg-white shadow-sm'
                : 'text-gray-600'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
            </svg>
            List
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {animals.map((animal, index) => (
            <div
              key={animal.id}
              style={{ animationDelay: `${index * 0.05}s` }}
              className="animate-[slideInUp_0.4s_ease-out_forwards]"
            >
              <AnimalCard animal={animal} onClick={onAnimalClick} />
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          {animals.map((animal, index) => {
            const initials = animal.name.charAt(0).toUpperCase()
            const formattedDate = new Date(animal.lastVisit).toLocaleDateString(
              'en-US',
              {
                month: 'short',
                day: 'numeric',
              }
            )

            return (
              <div
                key={animal.id}
                onClick={() => onAnimalClick(animal.id)}
                style={{ animationDelay: `${index * 0.05}s` }}
                className={`hover:bg-primary-light flex cursor-pointer items-center gap-4 border-b border-gray-100 px-4 py-3 transition-all last:border-b-0 hover:shadow-[0_0_0_1px_rgba(99,102,241,0.1),0_4px_12px_rgba(99,102,241,0.15),inset_0_1px_0_rgba(255,255,255,0.1)] ${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <div className="from-primary-light to-secondary text-primary hover:from-primary hover:to-secondary flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold transition-all hover:scale-105 hover:text-white">
                  {initials}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-800">
                    {animal.name}
                  </h4>
                  <div className="text-xs text-gray-600">
                    {animal.breed} • {animal.customer.surname}
                  </div>
                </div>
                <div className="min-w-[80px] text-center text-sm text-gray-700">
                  {animal.customer.phone1 || 'N/A'}
                </div>
                <div className="min-w-[80px] text-center text-sm text-gray-700">
                  {formattedDate}
                </div>
                <div className="text-primary min-w-[60px] text-right text-sm font-semibold">
                  ${animal.cost}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

---

## Phase 6: Layout Integration

### Task 6.1: Update Root Layout

**File:** `src/app/layout.tsx`

**Changes:**

- Update metadata (title, description)
- Change font to Inter
- Keep structure minimal (Header + Sidebar will be in page.tsx)

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pampered Pooch Database',
  description: 'Professional pet grooming customer record database',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
```

### Task 6.2: Refactor Main Page

**File:** `src/app/page.tsx`

**Complete Implementation:**

```tsx
'use client'
import { useState, useEffect } from 'react'
import { useAnimalsStore } from '@/store/animalsStore'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import EmptyState from '@/components/EmptyState'
import ResultsView from '@/components/ResultsView'

export default function HomePage() {
  const { animals, pagination, loading, searchAnimals } = useAnimalsStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarPinned, setSidebarPinned] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (query: string) => {
    if (!query.trim() && !hasSearched) return

    setSearchQuery(query)
    setHasSearched(true)

    await searchAnimals({
      search: query,
      page: 1,
    })
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSearch(suggestion)
  }

  const handleAnimalClick = (id: number) => {
    window.location.href = `/animals/${id}`
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        onSearch={handleSearch}
        searchValue={searchQuery}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        isPinned={sidebarPinned}
        onClose={() => setSidebarOpen(false)}
        onTogglePin={() => setSidebarPinned(!sidebarPinned)}
        currentPath="/"
      />

      {/* Main Content */}
      <main
        className={`m-6 flex-1 overflow-hidden rounded-3xl bg-white/95 shadow-xl backdrop-blur-[20px] transition-all duration-300 ${
          sidebarPinned ? 'ml-[calc(var(--sidebar-width)+1.5rem)]' : ''
        }`}
      >
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-lg text-gray-600">Searching...</div>
          </div>
        ) : !hasSearched || (animals.length === 0 && !searchQuery) ? (
          <EmptyState onSuggestionClick={handleSuggestionClick} />
        ) : animals.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
            <h2 className="mb-2 text-2xl font-bold text-gray-800">
              No Results Found
            </h2>
            <p className="text-gray-600">
              No animals found matching &quot;{searchQuery}&quot;. Try a
              different search term.
            </p>
          </div>
        ) : (
          <ResultsView
            animals={animals}
            query={searchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onAnimalClick={handleAnimalClick}
          />
        )}
      </main>
    </div>
  )
}
```

---

## Phase 7: Responsive Design

### Task 7.1: Add Mobile Breakpoints

**Mobile Adjustments (in each component):**

#### Header Mobile (max-width: 768px):

```css
/* Hide brand text */
.brand-text {
  display: none;
}

/* Hide date display */
.date-display {
  display: none;
}

/* Full width search */
.search-section {
  max-width: none;
}
```

#### Sidebar Mobile:

```css
/* Limit sidebar width on mobile */
width: min(280px, 80vw);

/* Never pin on mobile */
@media (max-width: 768px) {
  .sidebar.pinned {
    position: fixed;
  }
}
```

#### Results Mobile:

```css
/* Single column grid */
@media (max-width: 768px) {
  .results-grid {
    grid-template-columns: 1fr;
  }
}

/* Simplified list view */
@media (max-width: 768px) {
  .list-content {
    grid-template-columns: auto 1fr auto;
  }

  /* Hide middle details */
  .list-detail:nth-child(4) {
    display: none;
  }
}
```

---

## Phase 8: Testing Checklist

### Visual Tests:

- [ ] Animated gradient background visible and animating
- [ ] Header sticky at top with glassmorphic effect
- [ ] Hamburger menu animates (3 bars → X)
- [ ] Search bar has focus ring effect
- [ ] Date/time updates every second
- [ ] Sidebar slides in/out smoothly
- [ ] Pin button toggles active state
- [ ] Resize handle visible on hover
- [ ] Navigation items show active state
- [ ] Empty state displays with suggestions
- [ ] Animal cards have hover effects
- [ ] Status badges show gradient
- [ ] Avatar initials display correctly
- [ ] Grid view: 2 columns on desktop, 1 on mobile
- [ ] List view: alternating row colors
- [ ] View toggle buttons work
- [ ] Staggered animations on results

### Interaction Tests:

- [ ] Clicking hamburger opens/closes sidebar
- [ ] Clicking overlay closes sidebar (when not pinned)
- [ ] Pin button keeps sidebar open
- [ ] Drag resize handle changes sidebar width (200-500px)
- [ ] Search form submits on Enter key
- [ ] Clear button empties search
- [ ] Suggestion tags trigger search
- [ ] Clicking animal card navigates to detail
- [ ] Navigation links work
- [ ] Sidebar closes on navigation (when not pinned)

### Responsive Tests:

- [ ] Desktop (1920px): Full layout with all elements
- [ ] Tablet (768px): Brand text hidden, date hidden
- [ ] Mobile (480px): Single column, simplified list
- [ ] Sidebar never pins on mobile
- [ ] Touch interactions work on mobile

---

## Implementation Order Summary

1. **Phase 1** (30 min): Update `globals.css` with design tokens
2. **Phase 2** (60 min): Build `Header.tsx` component
3. **Phase 3** (90 min): Build `Sidebar.tsx` with resize logic
4. **Phase 4** (30 min): Create `EmptyState.tsx`
5. **Phase 5** (60 min): Create `AnimalCard.tsx` and `ResultsView.tsx`
6. **Phase 6** (45 min): Integrate all components in `page.tsx` and `layout.tsx`
7. **Phase 7** (30 min): Add responsive breakpoints
8. **Phase 8** (30 min): Test all interactions

**Total Estimated Time:** 6-7 hours

---

## Notes

- All components are client-side (`'use client'`) due to interactive state
- Use Tailwind CSS for styling (already configured)
- CSS custom properties provide design consistency
- Animations use CSS transitions (no external libraries)
- SVG icons embedded inline (no icon library needed)
- Responsive design uses CSS breakpoints (no separate mobile components)
- State management via Zustand store (already exists)

---

## File Structure After Implementation

```
src/
├── app/
│   ├── layout.tsx (updated)
│   ├── page.tsx (refactored)
│   └── globals.css (updated with design system)
├── components/
│   ├── Header.tsx (new)
│   ├── Sidebar.tsx (new)
│   ├── EmptyState.tsx (new)
│   ├── AnimalCard.tsx (new)
│   ├── ResultsView.tsx (new)
│   ├── SearchForm.tsx (can be removed - integrated into Header)
│   ├── AnimalList.tsx (can be removed - replaced by ResultsView)
│   └── ErrorBoundary.tsx (keep)
└── store/
    └── animalsStore.ts (keep, no changes needed)
```

---

## Troubleshooting

### Issue: Sidebar not sliding

**Solution:** Ensure `transition-transform duration-300` is applied and `translate-x-full` toggles

### Issue: Glassmorphic effect not showing

**Solution:** Check `backdrop-filter: blur(20px)` is supported, add `-webkit-backdrop-filter` fallback

### Issue: Resize handle not working

**Solution:** Verify `onMouseDown` is attached and `mousemove`/`mouseup` listeners are active

### Issue: Gradient not animating

**Solution:** Check `@keyframes gradientShift` is defined and `animation` property is applied

### Issue: Search not working

**Solution:** Verify `searchAnimals` function from store is called correctly with proper parameters

---

## Success Criteria

The implementation is complete when:

1. Landing page matches design draft visually
2. All interactive elements work smoothly
3. Responsive design adapts to mobile/tablet
4. No console errors or warnings
5. Search functionality integrated with new UI
6. All animations perform at 60fps
7. Code passes `pnpm type-check` and `pnpm lint`

---

**END OF DOCUMENT**
