// src/lib/validations/customer.ts
import { z } from 'zod'

export const createCustomerSchema = z.object({
  firstName: z.string().max(50).optional(),
  surname: z.string().min(1, 'Surname is required').max(50),
  address: z.string().max(100).optional(),
  suburb: z.string().max(50).optional(),
  postcode: z.string().max(10).optional(),
  phone1: z.string().max(20).optional(),
  phone2: z.string().max(20).optional(),
  phone3: z.string().max(20).optional(),
  email: z.string().email('Invalid email format').optional(),
})

export const updateCustomerSchema = createCustomerSchema.partial()

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
