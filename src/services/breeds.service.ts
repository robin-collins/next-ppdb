/**
 * Breeds Service - Business logic for breed operations
 */

import type { BreedWithAnimals } from '@/repositories'

/**
 * Format avgtime for display (extract HH:MM:SS from Date/ISO string)
 */
export function formatAvgTime(avgtime: Date | string | null): string {
  if (!avgtime) return '01:00:00'

  if (avgtime instanceof Date) {
    return avgtime.toISOString().slice(11, 19)
  }

  // If it's already in HH:MM:SS format
  if (/^\d{2}:\d{2}:\d{2}$/.test(avgtime)) {
    return avgtime
  }

  // If it's an ISO string
  if (avgtime.includes('T')) {
    return avgtime.slice(11, 19)
  }

  return '01:00:00'
}

/**
 * Parse avgtime string to Date object for database storage
 */
export function parseAvgTime(timeString: string): Date {
  // Parse HH:MM:SS or HH:MM format
  const parts = timeString.split(':')
  const hours = parseInt(parts[0] || '1', 10)
  const minutes = parseInt(parts[1] || '0', 10)
  const seconds = parseInt(parts[2] || '0', 10)

  // Create a date with just the time component
  const date = new Date('1970-01-01T00:00:00Z')
  date.setUTCHours(hours, minutes, seconds)

  return date
}

/**
 * Validate breed can be deleted (check for animals using this breed)
 */
export function validateBreedDeletion(breed: BreedWithAnimals): {
  canDelete: boolean
  animalCount: number
  message?: string
} {
  const animalCount = breed.animal.length

  if (animalCount > 0) {
    return {
      canDelete: false,
      animalCount,
      message: `There are ${animalCount} animal(s) using this breed. Migrate them first.`,
    }
  }

  return { canDelete: true, animalCount: 0 }
}

/**
 * Calculate pricing adjustment for an animal based on breed price change
 */
export function calculateAnimalPriceAdjustment(
  currentAnimalCost: number,
  currentBreedCost: number,
  newBreedCost: number,
  adjustmentType: 'fixed' | 'percentage',
  adjustmentValue: number
): number {
  // Don't adjust animals with zero cost
  if (currentAnimalCost === 0) {
    return 0
  }

  // Calculate the price difference between animal and breed
  const priceDifference = currentAnimalCost - currentBreedCost

  if (adjustmentType === 'fixed') {
    // For fixed adjustment, add the same amount to animal as breed
    return currentAnimalCost + adjustmentValue
  } else {
    // For percentage, apply same percentage increase
    const percentageIncrease = adjustmentValue / 100
    const newPrice = Math.round(currentAnimalCost * (1 + percentageIncrease))

    // If animal was above breed price, preserve the difference
    if (priceDifference > 0) {
      return newBreedCost + priceDifference
    }

    return newPrice
  }
}

/**
 * Check if breed name already exists (case-insensitive)
 */
export function normalizeBreedName(name: string): string {
  return name.trim().toLowerCase()
}

/**
 * Get default values for new breed
 */
export function getBreedDefaults(): {
  avgtime: string
  avgcost: number
} {
  return {
    avgtime: '01:00:00',
    avgcost: 50, // Default cost, typically overridden
  }
}
