/**
 * Service Exports
 *
 * Central export point for all business logic services.
 */

// Animal service functions
export {
  normalizePhone,
  calculateRelevanceScore,
  sortByRelevance,
} from './animals.service'

// Customer service functions
export {
  formatCustomerName,
  calculateCustomerStats,
  isValidPhone,
  formatPhone,
  getCustomerContacts,
  validateCustomerDeletion,
} from './customers.service'

// Breed service functions
export {
  formatAvgTime,
  parseAvgTime,
  validateBreedDeletion,
  calculateAnimalPriceAdjustment,
  normalizeBreedName,
  getBreedDefaults,
} from './breeds.service'

// Notes service functions
export {
  parseNote,
  formatNoteDisplay,
  appendCostToNote,
  formatNoteDate,
  getCurrentDateForNote,
  validateNoteContent,
  calculateTotalFromNotes,
} from './notes.service'
