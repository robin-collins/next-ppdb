/**
 * Notes Service - Business logic for service notes operations
 */

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
 * Format date for note display
 */
export function formatNoteDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date

  return d.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Get current date formatted for new note
 */
export function getCurrentDateForNote(): string {
  return new Date().toISOString().split('T')[0]
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
