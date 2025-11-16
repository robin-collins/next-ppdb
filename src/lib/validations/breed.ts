// src/lib/validations/breed.ts
import { z } from 'zod'

export const createBreedSchema = z.object({
  name: z.string().min(1, 'name is required').max(100),
  avgtime: z.string().max(50).optional().nullable(),
  avgcost: z
    .union([z.number(), z.string().regex(/^\d+(\.\d+)?$/)])
    .transform(val => (typeof val === 'number' ? val : Number(val)))
    .nullable()
    .optional(),
})

export const updateBreedSchema = createBreedSchema.partial()

export type CreateBreedInput = z.infer<typeof createBreedSchema>
export type UpdateBreedInput = z.infer<typeof updateBreedSchema>
