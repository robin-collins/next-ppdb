// src/lib/validations/animal.ts
import { z } from 'zod'

// Minimum valid date (to prevent zero dates and ancient dates)
const MIN_DATE = new Date('1900-01-01')

// Custom date validator that ensures:
// 1. Valid ISO datetime string format
// 2. Can be parsed to a valid Date object
// 3. Not a zero date (0000-00-00)
// 4. Not before minimum date (1900-01-01)
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

export const searchAnimalsSchema = z.object({
  q: z.string().optional().default(''), // Single unified query
  page: z.number().int().positive().default(1),
})

export const createAnimalSchema = z.object({
  customerId: z.number().int().positive(),
  name: z.string().min(1, 'Animal name is required').max(50),
  breed: z.string().min(1, 'Breed is required').max(50),
  sex: z.enum(['Male', 'Female', 'Unknown']),
  colour: z.string().max(30).optional(),
  cost: z.number().positive().optional(),
  lastVisit: validDateString.optional(),
  thisVisit: validDateString.optional(),
  comments: z.string().max(1000).optional(),
})

export const updateAnimalSchema = createAnimalSchema
  .partial()
  .omit({ customerId: true })

export type SearchAnimalsInput = z.infer<typeof searchAnimalsSchema>
export type CreateAnimalInput = z.infer<typeof createAnimalSchema>
export type UpdateAnimalInput = z.infer<typeof updateAnimalSchema>
