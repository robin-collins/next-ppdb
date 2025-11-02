// src/lib/validations/animal.ts
import { z } from 'zod'

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
  lastVisit: z.string().datetime().optional(),
  thisVisit: z.string().datetime().optional(),
  comments: z.string().max(1000).optional(),
})

export const updateAnimalSchema = createAnimalSchema
  .partial()
  .omit({ customerId: true })

export type SearchAnimalsInput = z.infer<typeof searchAnimalsSchema>
export type CreateAnimalInput = z.infer<typeof createAnimalSchema>
export type UpdateAnimalInput = z.infer<typeof updateAnimalSchema>
