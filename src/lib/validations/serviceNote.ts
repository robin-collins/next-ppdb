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

// Lightweight schema aligning with current MVP API for adding a note
export const addAnimalNoteSchema = z.object({
  notes: z.string().min(1, 'notes is required'),
  serviceDate: z.string().datetime().optional(),
})

export type AddAnimalNoteInput = z.infer<typeof addAnimalNoteSchema>
