/**
 * Date Formatting Utilities
 *
 * This module provides consistent date formatting across the application.
 * All dates are displayed in Australian format (DD-MM-YYYY) and respect
 * the timezone configured in the TZ environment variable.
 *
 * IMPORTANT: Always use these utilities for date formatting to ensure
 * consistency across the application.
 */

/**
 * Format a date in Australian format: DD-MM-YYYY
 *
 * @param date - Date object, ISO string, or null/undefined
 * @returns Formatted date string or 'N/A' if invalid
 */
export function formatDateAU(date: Date | string | null | undefined): string {
  if (!date) return 'N/A'

  const d = typeof date === 'string' ? new Date(date) : date

  // Check for invalid date
  if (isNaN(d.getTime())) return 'N/A'

  // Check for zero/invalid dates from database (1900-01-01 or 0000-00-00)
  if (d.getFullYear() < 1901) return 'N/A'

  return d.toLocaleDateString('en-AU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Format a date in short Australian format with month name: DD MMM YYYY
 *
 * @param date - Date object, ISO string, or null/undefined
 * @returns Formatted date string or 'N/A' if invalid
 */
export function formatDateShortAU(
  date: Date | string | null | undefined
): string {
  if (!date) return 'N/A'

  const d = typeof date === 'string' ? new Date(date) : date

  // Check for invalid date
  if (isNaN(d.getTime())) return 'N/A'

  // Check for zero/invalid dates from database
  if (d.getFullYear() < 1901) return 'N/A'

  return d.toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Get today's date as YYYY-MM-DD string in LOCAL timezone
 *
 * IMPORTANT: This correctly uses local timezone instead of UTC.
 * Using new Date().toISOString().split('T')[0] would return UTC date
 * which can differ from local date (e.g., Adelaide UTC+10:30).
 *
 * @returns Date string in YYYY-MM-DD format
 */
export function getTodayLocalDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Format time in Australian format: h:mm am/pm
 *
 * @param date - Date object or null/undefined
 * @returns Formatted time string
 */
export function formatTimeAU(date: Date | null | undefined): string {
  if (!date) return ''

  return date
    .toLocaleTimeString('en-AU', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .toLowerCase()
}

/**
 * Format date for sidebar display: Day DD MMM
 *
 * @param date - Date object
 * @returns Formatted date string
 */
export function formatDateSidebar(date: Date): string {
  return date.toLocaleDateString('en-AU', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
}

/**
 * Format datetime for display in header: h:mm am/pm Day, DD MMM YYYY
 *
 * @param date - Date object
 * @returns Formatted datetime string
 */
export function formatDateTimeHeader(date: Date): string {
  const timeText = date
    .toLocaleTimeString('en-AU', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .toLowerCase()

  const dateText = date.toLocaleDateString('en-AU', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return `${timeText} ${dateText}`
}

/**
 * Parse a date string and return a Date object
 * Handles ISO strings and YYYY-MM-DD format
 *
 * @param dateString - Date string to parse
 * @returns Date object or null if invalid
 */
export function parseDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null

  const d = new Date(dateString)

  if (isNaN(d.getTime())) return null

  return d
}

/**
 * Format a date for form input (YYYY-MM-DD)
 * Correctly handles timezone to ensure the displayed date matches
 * the actual calendar date.
 *
 * @param date - Date object, ISO string, or null/undefined
 * @returns Date string in YYYY-MM-DD format or empty string
 */
export function formatDateForInput(
  date: Date | string | null | undefined
): string {
  if (!date) return ''

  const d = typeof date === 'string' ? new Date(date) : date

  if (isNaN(d.getTime())) return ''

  // Check for zero/invalid dates from database
  if (d.getFullYear() < 1901) return ''

  // Use local date components to avoid timezone issues
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
