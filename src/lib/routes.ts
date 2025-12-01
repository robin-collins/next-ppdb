/**
 * Centralized Route Helper Utilities
 *
 * This file provides type-safe route generation functions following the
 * RESTful URL structure defined in ROUTES.md
 *
 * IMPORTANT: All navigation in the application should use these helpers
 * to maintain consistency and prevent routing errors.
 */

/**
 * Home / Search Routes
 */
export const routes = {
  home: () => '/',
  dashboard: () => '/dashboard',
  search: (query?: string) =>
    query ? `/?q=${encodeURIComponent(query)}` : '/',

  /**
   * Customer Routes
   * Pattern: Nest for context (list/create), flatten for identity (view/edit)
   */
  customers: {
    list: () => '/customers',
    add: () => '/customers/add',
    detail: (id: number | string) => `/customer/${id}`,
    edit: (id: number | string) => `/customer/${id}/edit`,
    animals: (id: number | string) => `/customer/${id}/animals`,
    newAnimal: (id: number | string) => `/customer/${id}/newAnimal`,
    history: () => '/customers/history',
  },

  /**
   * Animal Routes
   * Pattern: Flatten for identity - animals are accessed directly by ID
   */
  animals: {
    list: () => '/animals',
    detail: (id: number | string) => `/animals/${id}`,
    edit: (id: number | string) => `/animals/${id}/edit`,
    notes: (id: number | string) => `/animals/${id}/notes`,
    newNote: (id: number | string) => `/animals/${id}/notes/new`,
  },

  /**
   * Breed Routes
   * Pattern: Nest for context (list/create), flatten for identity (view/edit)
   */
  breeds: {
    list: () => '/breeds',
    add: () => '/breeds/add',
    detail: (id: number | string) => `/breeds/${id}`,
    edit: (id: number | string) => `/breeds/${id}/edit`,
  },

  /**
   * Note Routes
   * Pattern: Flatten - notes are accessed directly by ID
   */
  notes: {
    detail: (id: number | string) => `/notes/${id}`,
    edit: (id: number | string) => `/notes/${id}/edit`,
  },

  /**
   * Report Routes
   */
  reports: {
    analytics: () => '/reports/analytics',
    dailyTotals: () => '/reports/daily-totals',
  },

  /**
   * API Routes
   */
  api: {
    customers: {
      base: () => '/api/customers',
      byId: (id: number | string) => `/api/customers/${id}`,
      history: () => '/api/customers/history',
    },
    animals: {
      base: () => '/api/animals',
      byId: (id: number | string) => `/api/animals/${id}`,
      notes: (id: number | string) => `/api/animals/${id}/notes`,
    },
    breeds: {
      base: () => '/api/breeds',
      byId: (id: number | string) => `/api/breeds/${id}`,
    },
    notes: {
      byId: (id: number | string) => `/api/notes/${id}`,
    },
    reports: {
      analytics: () => '/api/reports/analytics',
      dailyTotals: () => '/api/reports/daily-totals',
    },
    admin: {
      backup: () => '/api/admin/backup',
    },
  },
} as const

/**
 * Type definitions for route parameters
 */
export type RouteParams = {
  customerId: string
  animalId: string
  breedId: string
  noteId: string
}

/**
 * Navigation helper with query parameters
 */
export function buildUrl(
  path: string,
  queryParams?: Record<string, string | number>
): string {
  if (!queryParams || Object.keys(queryParams).length === 0) {
    return path
  }

  const params = new URLSearchParams()
  Object.entries(queryParams).forEach(([key, value]) => {
    params.append(key, String(value))
  })

  return `${path}?${params.toString()}`
}

/**
 * Example usage:
 *
 * ```typescript
 * import { routes } from '@/lib/routes'
 *
 * // Navigate to customer detail
 * router.push(routes.customers.detail(123))
 *
 * // Navigate to add animal for customer
 * router.push(routes.customers.newAnimal(123))
 *
 * // Navigate to animal detail
 * router.push(routes.animals.detail(456))
 *
 * // Navigate to add note to animal
 * router.push(routes.animals.newNote(456))
 *
 * // View specific note
 * router.push(routes.notes.detail(789))
 * ```
 */
