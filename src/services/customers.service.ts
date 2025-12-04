/**
 * Customers Service - Business logic for customer operations
 */

import type { CustomerWithAnimals } from '@/repositories'

/**
 * Normalize phone number by removing spaces, dashes, parentheses
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)]/g, '')
}

/**
 * Format customer full name
 */
export function formatCustomerName(
  surname: string,
  firstname?: string | null
): string {
  if (firstname) {
    return `${firstname} ${surname}`
  }
  return surname
}

/**
 * Calculate customer statistics
 */
export function calculateCustomerStats(customer: CustomerWithAnimals): {
  animalCount: number
  totalNotes: number
  earliestVisit: Date | null
  latestVisit: Date | null
} {
  const animalCount = customer.animal.length

  // These would need notes data to calculate properly
  // For now, return defaults
  return {
    animalCount,
    totalNotes: 0,
    earliestVisit: null,
    latestVisit: null,
  }
}

/**
 * Check if a phone number is valid (not empty, not 'Unknown', not '0')
 */
export function isValidPhone(phone: string | null | undefined): boolean {
  if (!phone) return false
  const trimmed = phone.trim().toLowerCase()
  return trimmed !== '' && trimmed !== 'unknown' && trimmed !== '0'
}

/**
 * Format phone number for display (add spaces)
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
  }
  if (digits.length === 8) {
    return `${digits.slice(0, 4)} ${digits.slice(4)}`
  }
  return phone
}

/**
 * Get display-ready customer contact info
 */
export function getCustomerContacts(customer: {
  phone1?: string | null
  phone2?: string | null
  phone3?: string | null
  email?: string | null
}): {
  phones: string[]
  email: string | null
} {
  const phones = [customer.phone1, customer.phone2, customer.phone3].filter(
    isValidPhone
  ) as string[]

  const email =
    customer.email && customer.email.includes('@') ? customer.email : null

  return { phones, email }
}

/**
 * Validate customer can be deleted (check for animals)
 */
export function validateCustomerDeletion(customer: CustomerWithAnimals): {
  canDelete: boolean
  animalCount: number
  message?: string
} {
  const animalCount = customer.animal.length

  if (animalCount > 0) {
    return {
      canDelete: false,
      animalCount,
      message: `Customer has ${animalCount} animal(s). Choose to rehome or delete them.`,
    }
  }

  return { canDelete: true, animalCount: 0 }
}
