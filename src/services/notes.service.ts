/**
 * Notes Service - Business logic for service notes operations
 */
import { formatDateAU, getTodayLocalDateString } from '@/lib/date'

/**
 * Parse a note to extract cost and technician code
 */
export function parseNote(noteText: string): {
  text: string
  cost: number | null
  technicianCode: string | null
} {
  let cost: number | null = null
  let technicianCode: string | null = null
  let text = noteText

  // Extract cost pattern: $XX or $XX.XX
  const costMatch = noteText.match(/\$(\d+(?:\.\d{2})?)/)
  if (costMatch) {
    cost = parseFloat(costMatch[1])
  }

  // Extract technician code: 2-3 uppercase letters at end
  const techMatch = noteText.match(/\s([A-Z]{2,3})$/)
  if (techMatch) {
    technicianCode = techMatch[1]
    // Remove technician code from text for cleaner display
    text = noteText.replace(/\s[A-Z]{2,3}$/, '')
  }

  return { text, cost, technicianCode }
}

/**
 * Extract staff initials from note text following business rules:
 *
 * 1. Initials are alphabetic only (A-Z), 2-3 letters maximum
 * 2. Extract from the last meaningful token of the note text
 * 3. If the last token is a price ($XX), use the second-to-last token
 * 4. Skip invalid trailing tokens (4+ letters, numbers) and continue searching
 * 5. Return uppercase initials or null if not valid
 *
 * Examples:
 * - "wash and dry SJC" → "SJC"
 * - "short cut 7 $65 cc" → "CC" (price at end, use token before)
 * - "full clip 7 pdl muzzle HM " → "HM"
 * - "Full clip long 3 CC $60 CLUB" → "CC" (CLUB is 4 chars, $60 is price, CC is valid)
 */
export function extractStaffInitials(noteText: string): string | null {
  if (!noteText || typeof noteText !== 'string') {
    return null
  }

  // Split on whitespace and filter empty tokens
  const tokens = noteText.trim().split(/\s+/).filter(Boolean)

  if (tokens.length === 0) {
    return null
  }

  // Pattern for valid staff initials: exactly 2-3 alphabetic characters
  const initialsPattern = /^[A-Za-z]{2,3}$/
  // Pattern for skippable tokens: prices ($XX), 4+ letter words, words containing digits
  const skippablePattern = /^\$\d+$|^[A-Za-z]{4,}$|.*\d.*/

  // Check tokens from the end, looking for valid initials
  // Skip prices and invalid trailing tokens (4+ letters, contains numbers)
  // Search within a reasonable window (last 4 tokens)
  const searchLimit = Math.max(0, tokens.length - 4)

  for (let i = tokens.length - 1; i >= searchLimit; i--) {
    const token = tokens[i]

    // Check if this token is valid initials
    if (initialsPattern.test(token)) {
      return token.toUpperCase()
    }

    // Skip prices and other skippable tokens (4+ letter words, numbers)
    if (skippablePattern.test(token)) {
      continue
    }

    // If we hit a non-skippable token that's also not valid initials, stop
    // This prevents matching initials that are too far back in the note
    break
  }

  return null
}

/**
 * Format note for display with cost and technician highlighted
 */
export function formatNoteDisplay(noteText: string): {
  mainText: string
  costDisplay: string | null
  technicianDisplay: string | null
} {
  const parsed = parseNote(noteText)

  return {
    mainText: parsed.text.replace(/\s*\$\d+(?:\.\d{2})?\s*/, ' ').trim(),
    costDisplay: parsed.cost ? `$${parsed.cost}` : null,
    technicianDisplay: parsed.technicianCode,
  }
}

/**
 * Auto-append cost to note if not present
 */
export function appendCostToNote(noteText: string, animalCost: number): string {
  // Don't add if cost is 0 or already has a cost
  if (animalCost === 0 || /\$\d+/.test(noteText)) {
    return noteText
  }

  const costString = `$${animalCost}`

  // Check if note ends with technician code (2-3 uppercase letters)
  const techMatch = noteText.match(/\s([A-Z]{2,3})$/)
  if (techMatch) {
    // Insert cost before technician code
    return noteText.replace(/\s([A-Z]{2,3})$/, ` ${costString} $1`)
  }

  // Append cost at end
  return `${noteText} ${costString}`
}

/**
 * Format date for note display (DD-MM-YYYY Australian format)
 */
export function formatNoteDate(date: Date | string): string {
  return formatDateAU(date)
}

/**
 * Get current date formatted for new note (YYYY-MM-DD in local timezone)
 *
 * IMPORTANT: Uses local timezone instead of UTC to ensure correct date
 */
export function getCurrentDateForNote(): string {
  return getTodayLocalDateString()
}

/**
 * Validate note content
 */
export function validateNoteContent(content: string): {
  valid: boolean
  message?: string
} {
  const trimmed = content.trim()

  if (!trimmed) {
    return { valid: false, message: 'Note content cannot be empty' }
  }

  if (trimmed.length > 1000) {
    return { valid: false, message: 'Note content too long (max 1000 chars)' }
  }

  return { valid: true }
}

/**
 * Calculate total service cost from notes
 */
export function calculateTotalFromNotes(
  notes: Array<{ notes: string }>
): number {
  return notes.reduce((total, note) => {
    const { cost } = parseNote(note.notes)
    return total + (cost || 0)
  }, 0)
}
