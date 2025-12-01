// src/lib/import/remediation.ts
// Data repair and remediation strategies for import validation

import { isAsciiEmail } from 'sane-email-validation'

export interface RemediationResult<T> {
  data: T
  wasRepaired: boolean
  repairs: string[]
}

export interface LogEntry {
  timestamp: string
  level: 'info' | 'success' | 'warning' | 'error'
  table?: string
  recordId?: number
  message: string
  details?: string
}

/**
 * Create a log entry
 */
export function createLog(
  level: LogEntry['level'],
  message: string,
  options?: { table?: string; recordId?: number; details?: string }
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...options,
  }
}

// ============================================
// DATE REMEDIATION
// ============================================

/**
 * Normalize date values, handling MySQL zero dates
 */
export function normalizeDate(dateValue: unknown): Date {
  const DEFAULT_DATE = new Date('1900-01-01')

  if (!dateValue) return DEFAULT_DATE

  const dateStr = String(dateValue)

  // Handle MySQL zero date
  if (dateStr === '0000-00-00' || dateStr === '0000-00-00 00:00:00') {
    return DEFAULT_DATE
  }

  const parsed = new Date(dateStr)

  // Check if valid
  if (isNaN(parsed.getTime())) {
    return DEFAULT_DATE
  }

  // Check if too old
  if (parsed.getFullYear() < 1900) {
    return DEFAULT_DATE
  }

  return parsed
}

// ============================================
// STRING REMEDIATION
// ============================================

/**
 * Truncate string to max length
 */
export function truncateString(
  value: unknown,
  maxLength: number,
  defaultValue = ''
): { value: string; wasTruncated: boolean } {
  if (value === null || value === undefined) {
    return { value: defaultValue, wasTruncated: false }
  }

  const str = String(value).trim()
  if (str.length <= maxLength) {
    return { value: str, wasTruncated: false }
  }

  return { value: str.substring(0, maxLength), wasTruncated: true }
}

/**
 * Normalize phone number (strip non-digits, truncate)
 */
export function normalizePhone(value: unknown): string | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const str = String(value)
  const digitsOnly = str.replace(/[\s\-()]/g, '')

  if (digitsOnly.length === 0 || digitsOnly === '0') {
    return null
  }

  // Truncate to 10 digits max
  return digitsOnly.substring(0, 10)
}

/**
 * Validate and normalize email
 */
export function normalizeEmail(value: unknown): string | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const email = String(value).trim()

  if (email.length === 0) {
    return null
  }

  // Validate email format
  if (!isAsciiEmail(email)) {
    return null // Invalid emails become null
  }

  // Truncate to 200 chars (DB limit)
  return email.substring(0, 200)
}

// ============================================
// NUMERIC REMEDIATION
// ============================================

/**
 * Ensure non-negative integer
 */
export function normalizeNonNegativeInt(
  value: unknown,
  defaultValue = 0
): number {
  if (value === null || value === undefined) {
    return defaultValue
  }

  const num = typeof value === 'number' ? value : parseInt(String(value), 10)

  if (isNaN(num) || num < 0) {
    return defaultValue
  }

  return Math.floor(num)
}

/**
 * Normalize postcode (0-9999 range)
 */
export function normalizePostcode(value: unknown): number {
  const num = normalizeNonNegativeInt(value, 0)
  return num > 9999 ? 0 : num
}

// ============================================
// TIME REMEDIATION
// ============================================

/**
 * Normalize time value for avgtime field
 */
export function normalizeTime(value: unknown): Date {
  const DEFAULT_TIME = new Date('1970-01-01T00:00:00')

  if (!value) return DEFAULT_TIME

  const timeStr = String(value)

  // Handle various time formats
  const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/)
  if (timeMatch) {
    const hours = parseInt(timeMatch[1], 10)
    const minutes = parseInt(timeMatch[2], 10)
    const seconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0

    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      return new Date(
        `1970-01-01T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      )
    }
  }

  return DEFAULT_TIME
}

// ============================================
// ENUM REMEDIATION
// ============================================

/**
 * Normalize sex enum
 */
export function normalizeSex(value: unknown): 'Male' | 'Female' {
  if (!value) return 'Male'

  const str = String(value).toLowerCase().trim()

  if (str === 'female' || str === 'f') {
    return 'Female'
  }

  return 'Male' // Default to Male for any other value
}
