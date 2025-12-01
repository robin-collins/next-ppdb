// src/lib/import/validator.ts
// Record validation per table with remediation

import {
  normalizeDate,
  truncateString,
  normalizePhone,
  normalizeEmail,
  normalizeNonNegativeInt,
  normalizePostcode,
  normalizeTime,
  normalizeSex,
  createLog,
  LogEntry,
} from './remediation'

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ValidationResult<T> {
  valid: boolean
  data?: T
  skip: boolean
  skipReason?: string
  repairs: string[]
  logs: LogEntry[]
}

export interface BreedRecord {
  breedID: number
  breedname: string
  avgtime: Date | null
  avgcost: number | null
}

export interface CustomerRecord {
  customerID: number
  surname: string
  firstname: string | null
  address: string | null
  suburb: string | null
  postcode: number | null
  phone1: string | null
  phone2: string | null
  phone3: string | null
  email: string | null
}

export interface AnimalRecord {
  animalID: number
  animalname: string
  breedID: number
  customerID: number
  SEX: 'Male' | 'Female'
  colour: string | null
  cost: number
  lastvisit: Date
  thisvisit: Date
  comments: string | null
}

export interface NotesRecord {
  noteID: number
  animalID: number
  notes: string
  date: Date
}

// ============================================
// BREED VALIDATION
// ============================================

export function validateBreed(
  raw: Record<string, unknown>,
  existingNames: Set<string>
): ValidationResult<BreedRecord> {
  const repairs: string[] = []
  const logs: LogEntry[] = []

  // breedID
  const breedID = normalizeNonNegativeInt(raw.breedID, 0)
  if (breedID === 0) {
    repairs.push('breedID was 0 or invalid, will auto-increment')
  }

  // breedname - required, unique, max 30 chars
  const truncatedBreedname = truncateString(raw.breedname, 30, '')
  let breedname = truncatedBreedname.value
  if (truncatedBreedname.wasTruncated) {
    repairs.push(
      `breedname truncated from "${raw.breedname}" to "${breedname}"`
    )
  }
  if (!breedname) {
    breedname = 'Unknown'
    repairs.push('Empty breedname set to "Unknown"')
  }

  // Handle duplicate names
  const originalName = breedname
  let suffix = 1
  while (existingNames.has(breedname.toLowerCase())) {
    breedname = `${originalName.substring(0, 27)}_${suffix}`
    suffix++
  }
  if (breedname !== originalName) {
    repairs.push(
      `Duplicate breedname "${originalName}" renamed to "${breedname}"`
    )
  }

  // avgtime
  const avgtime = raw.avgtime ? normalizeTime(raw.avgtime) : null

  // avgcost
  const avgcost =
    raw.avgcost !== null && raw.avgcost !== undefined
      ? normalizeNonNegativeInt(raw.avgcost, 0)
      : null

  if (repairs.length > 0) {
    logs.push(
      createLog('warning', `Breed "${breedname}" repaired`, {
        table: 'breed',
        recordId: breedID,
        details: repairs.join('; '),
      })
    )
  }

  return {
    valid: true,
    data: { breedID, breedname, avgtime, avgcost },
    skip: false,
    repairs,
    logs,
  }
}

// ============================================
// CUSTOMER VALIDATION
// ============================================

export function validateCustomer(
  raw: Record<string, unknown>
): ValidationResult<CustomerRecord> {
  const repairs: string[] = []
  const logs: LogEntry[] = []

  // customerID
  const customerID = normalizeNonNegativeInt(raw.customerID, 0)
  if (customerID === 0) {
    repairs.push('customerID was 0 or invalid, will auto-increment')
  }

  // surname - required, max 20 chars
  const truncatedSurname = truncateString(raw.surname, 20, '')
  let surname = truncatedSurname.value
  if (truncatedSurname.wasTruncated) {
    repairs.push(`surname truncated to 20 chars`)
  }
  if (!surname) {
    surname = 'Unknown'
    repairs.push('Empty surname set to "Unknown"')
  }

  // firstname - optional, max 20 chars
  const firstnameResult = truncateString(raw.firstname, 20, '')
  const firstname = firstnameResult.value || null
  if (firstnameResult.wasTruncated) {
    repairs.push('firstname truncated to 20 chars')
  }

  // address - optional, max 50 chars
  const addressResult = truncateString(raw.address, 50, '')
  const address = addressResult.value || null
  if (addressResult.wasTruncated) {
    repairs.push('address truncated to 50 chars')
  }

  // suburb - optional, max 20 chars
  const suburbResult = truncateString(raw.suburb, 20, '')
  const suburb = suburbResult.value || null
  if (suburbResult.wasTruncated) {
    repairs.push('suburb truncated to 20 chars')
  }

  // postcode - 0-9999 range
  const postcode = normalizePostcode(raw.postcode)

  // phones
  const phone1 = normalizePhone(raw.phone1)
  const phone2 = normalizePhone(raw.phone2)
  const phone3 = normalizePhone(raw.phone3)

  // email
  const originalEmail = raw.email
  const email = normalizeEmail(raw.email)
  if (originalEmail && !email) {
    repairs.push(`Invalid email "${originalEmail}" removed`)
  }

  if (repairs.length > 0) {
    logs.push(
      createLog('warning', `Customer "${surname}" repaired`, {
        table: 'customer',
        recordId: customerID,
        details: repairs.join('; '),
      })
    )
  }

  return {
    valid: true,
    data: {
      customerID,
      surname,
      firstname,
      address,
      suburb,
      postcode,
      phone1,
      phone2,
      phone3,
      email,
    },
    skip: false,
    repairs,
    logs,
  }
}

// ============================================
// ANIMAL VALIDATION
// ============================================

export function validateAnimal(
  raw: Record<string, unknown>,
  validCustomerIds: Set<number>,
  validBreedIds: Set<number>,
  unknownBreedId: number
): ValidationResult<AnimalRecord> {
  const repairs: string[] = []
  const logs: LogEntry[] = []

  // animalID
  const animalID = normalizeNonNegativeInt(raw.animalID, 0)

  // customerID - must exist
  const customerID = normalizeNonNegativeInt(raw.customerID, 0)
  if (!validCustomerIds.has(customerID)) {
    logs.push(
      createLog(
        'warning',
        `Orphan animal skipped: customerID ${customerID} not found`,
        {
          table: 'animal',
          recordId: animalID,
        }
      )
    )
    return {
      valid: false,
      skip: true,
      skipReason: `Customer ${customerID} not found`,
      repairs: [],
      logs,
    }
  }

  // breedID - use Unknown breed if not found
  let breedID = normalizeNonNegativeInt(raw.breedID, 0)
  if (!validBreedIds.has(breedID)) {
    repairs.push(`breedID ${breedID} not found, mapped to Unknown breed`)
    breedID = unknownBreedId
  }

  // animalname - max 12 chars
  const truncatedAnimalname = truncateString(raw.animalname, 12, '')
  let animalname = truncatedAnimalname.value
  if (truncatedAnimalname.wasTruncated) {
    repairs.push(`animalname truncated to 12 chars`)
  }
  if (!animalname) {
    animalname = 'Pet'
    repairs.push('Empty animalname set to "Pet"')
  }

  // SEX
  const SEX = normalizeSex(raw.SEX)

  // colour
  const colour = raw.colour ? String(raw.colour) : ''

  // cost
  const cost = normalizeNonNegativeInt(raw.cost, 0)

  // dates
  const lastvisit = normalizeDate(raw.lastvisit)
  const thisvisit = normalizeDate(raw.thisvisit)

  // comments
  const commentsResult = truncateString(raw.comments, 255, '')
  const comments = commentsResult.value || null

  if (repairs.length > 0) {
    logs.push(
      createLog('warning', `Animal "${animalname}" repaired`, {
        table: 'animal',
        recordId: animalID,
        details: repairs.join('; '),
      })
    )
  }

  return {
    valid: true,
    data: {
      animalID,
      animalname,
      breedID,
      customerID,
      SEX,
      colour,
      cost,
      lastvisit,
      thisvisit,
      comments,
    },
    skip: false,
    repairs,
    logs,
  }
}

// ============================================
// NOTES VALIDATION
// ============================================

export function validateNote(
  raw: Record<string, unknown>,
  validAnimalIds: Set<number>
): ValidationResult<NotesRecord> {
  const logs: LogEntry[] = []

  // noteID
  const noteID = normalizeNonNegativeInt(raw.noteID, 0)

  // animalID - must exist
  const animalID = normalizeNonNegativeInt(raw.animalID, 0)
  if (!validAnimalIds.has(animalID)) {
    logs.push(
      createLog(
        'warning',
        `Orphan note skipped: animalID ${animalID} not found`,
        {
          table: 'notes',
          recordId: noteID,
        }
      )
    )
    return {
      valid: false,
      skip: true,
      skipReason: `Animal ${animalID} not found`,
      repairs: [],
      logs,
    }
  }

  // notes - required
  const notes = raw.notes ? String(raw.notes).trim() : ''
  if (!notes) {
    logs.push(
      createLog('warning', `Empty note skipped`, {
        table: 'notes',
        recordId: noteID,
      })
    )
    return {
      valid: false,
      skip: true,
      skipReason: 'Empty notes content',
      repairs: [],
      logs,
    }
  }

  // date
  const date = normalizeDate(raw.date)

  return {
    valid: true,
    data: { noteID, animalID, notes, date },
    skip: false,
    repairs: [],
    logs,
  }
}
