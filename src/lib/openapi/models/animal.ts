/**
 * Animal API DTOs (Data Transfer Objects)
 *
 * These Zod schemas define the shape of Animal data for OpenAPI documentation
 * and provide runtime validation for API requests and responses.
 */

import { z } from 'zod'

/**
 * Customer nested object in Animal responses
 */
const CustomerNestedDTO = z.object({
  id: z.number().int().positive().describe('Customer ID'),
  firstname: z.string().nullable().describe('Customer first name'),
  surname: z.string().describe('Customer surname/last name'),
  email: z.string().email().nullable().describe('Customer email address'),
  phone1: z.string().nullable().describe('Primary phone number'),
  phone2: z.string().nullable().describe('Secondary phone number'),
  phone3: z.string().nullable().describe('Tertiary phone number'),
})

/**
 * Breed nested object in Animal responses
 */
const BreedNestedDTO = z.object({
  id: z.number().int().positive().describe('Breed ID'),
  breedname: z.string().describe('Breed name'),
})

/**
 * Service note nested object in Animal responses
 */
const ServiceNoteDTO = z.object({
  noteID: z.number().int().positive().describe('Note ID'),
  notes: z.string().describe('Service note content'),
  date: z.string().datetime().describe('Note date (ISO 8601 format)'),
})

/**
 * Minimum valid date (to prevent zero dates and ancient dates)
 */
const MIN_DATE = new Date('1900-01-01')

/**
 * Custom date validator that ensures:
 * 1. Valid ISO datetime string format
 * 2. Can be parsed to a valid Date object
 * 3. Not a zero date (0000-00-00)
 * 4. Not before minimum date (1900-01-01)
 */
const validDateString = z
  .string()
  .datetime()
  .refine(
    dateStr => {
      const date = new Date(dateStr)
      // Check if date is valid (not NaN)
      if (isNaN(date.getTime())) {
        return false
      }
      // Check if year is 0 (zero date)
      if (date.getFullYear() === 0) {
        return false
      }
      // Check if before minimum date
      if (date < MIN_DATE) {
        return false
      }
      return true
    },
    {
      message: `Date must be a valid date on or after ${MIN_DATE.toISOString().split('T')[0]}`,
    }
  )
  .describe('ISO 8601 datetime string (e.g., "2024-01-15T10:30:00Z")')

/**
 * Full Animal DTO for API responses
 *
 * Represents a complete animal record with nested customer, breed, and service notes.
 */
export const AnimalDTO = z.object({
  id: z.number().int().positive().describe('Animal ID'),
  name: z.string().max(50).describe('Animal name'),
  breed: z.string().describe('Breed name'),
  breedID: z.number().int().positive().describe('Breed ID'),
  sex: z.enum(['Male', 'Female', 'Unknown']).describe('Animal sex/gender'),
  colour: z.string().nullable().describe('Animal colour/coat color'),
  cost: z
    .number()
    .int()
    .nonnegative()
    .describe('Service cost in cents or smallest currency unit'),
  lastVisit: z
    .string()
    .datetime()
    .describe('Last visit date (ISO 8601 format)'),
  thisVisit: z
    .string()
    .datetime()
    .describe('Current visit date (ISO 8601 format)'),
  comments: z.string().nullable().describe('Additional comments or notes'),
  customer: CustomerNestedDTO.describe('Customer who owns this animal'),
  breedInfo: BreedNestedDTO.optional().describe('Detailed breed information'),
  serviceNotes: z
    .array(ServiceNoteDTO)
    .describe('History of service notes for this animal'),
})

/**
 * DTO for creating a new animal
 *
 * Requires customer ID and breed name, with optional fields for additional details.
 */
export const CreateAnimalDTO = z.object({
  customerId: z
    .number()
    .int()
    .positive()
    .describe('ID of the customer who owns this animal'),
  name: z
    .string()
    .min(1, 'Animal name is required')
    .max(50)
    .describe('Animal name'),
  breed: z.string().min(1, 'Breed is required').max(50).describe('Breed name'),
  sex: z.enum(['Male', 'Female', 'Unknown']).describe('Animal sex/gender'),
  colour: z.string().max(30).optional().describe('Animal colour/coat color'),
  cost: z
    .number()
    .positive()
    .optional()
    .describe('Service cost in cents or smallest currency unit'),
  lastVisit: validDateString.optional(),
  thisVisit: validDateString.optional(),
  comments: z
    .string()
    .max(1000)
    .optional()
    .describe('Additional comments or notes'),
})

/**
 * DTO for updating an existing animal
 *
 * All fields are optional. Only provided fields will be updated.
 */
export const UpdateAnimalDTO = CreateAnimalDTO.partial()
  .omit({
    customerId: true,
  })
  .describe('Partial animal data for updates. All fields optional.')

/**
 * Query parameters for searching animals
 */
export const AnimalSearchQuery = z.object({
  q: z
    .string()
    .optional()
    .describe(
      'Search query - searches across animal name, breed, customer name, email, and phone numbers'
    ),
  page: z
    .number()
    .int()
    .positive()
    .default(1)
    .describe('Page number for pagination (1-indexed)'),
})

/**
 * Type exports for TypeScript consumers
 */
export type AnimalDTO = z.infer<typeof AnimalDTO>
export type CreateAnimalDTO = z.infer<typeof CreateAnimalDTO>
export type UpdateAnimalDTO = z.infer<typeof UpdateAnimalDTO>
export type AnimalSearchQuery = z.infer<typeof AnimalSearchQuery>
