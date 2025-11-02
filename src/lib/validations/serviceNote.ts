// src/lib/validations/serviceNote.ts
import { z } from 'zod'

export const createServiceNoteSchema = z.object({
  animalId: z.number().int().positive(),
  serviceDate: z.string().datetime(),
  serviceDetails: z.string().min(1, 'Service details are required').max(2000),
  cost: z.number().positive().optional(),
  technicianCode: z.string().max(10).optional(),
})

export const updateServiceNoteSchema = createServiceNoteSchema
  .partial()
  .omit({ animalId: true })

export type CreateServiceNoteInput = z.infer<typeof createServiceNoteSchema>
export type UpdateServiceNoteInput = z.infer<typeof updateServiceNoteSchema>
