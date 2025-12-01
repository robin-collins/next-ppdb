// src/lib/validations/customer.ts
import { z } from 'zod'
import { isAsciiEmail } from 'sane-email-validation'

// Phone number normalization helper
export function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-()]/g, '')
}

/**
 * Validates an email address using sane-email-validation package.
 * Returns true if the email is valid or empty (empty is allowed).
 * Uses isAsciiEmail() which only accepts ASCII email addresses.
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.trim() === '') return true // Empty is allowed
  return isAsciiEmail(email.trim())
}

/**
 * Gets a user-friendly error message for invalid email.
 */
export function getEmailValidationError(email: string): string | null {
  if (!email || email.trim() === '') return null
  if (!isAsciiEmail(email.trim())) {
    return 'Please enter a valid email address (e.g., name@example.com)'
  }
  return null
}

// Custom phone validator (max 11 chars for international numbers)
const phoneSchema = z
  .string()
  .max(20, 'Phone number cannot exceed 20 characters') // Allow formatting chars in input
  .refine(
    val => {
      if (!val || val === '') return true
      const digitsOnly = normalizePhone(val)
      return digitsOnly.length <= 11
    },
    { message: 'Phone number cannot exceed 11 digits' }
  )
  .optional()
  .or(z.literal(''))
  .transform(val =>
    val === undefined
      ? undefined
      : !val || val === ''
        ? null
        : normalizePhone(val)
  )

// Email validator (max 200 chars as per DB schema)
const emailSchema = z
  .string()
  .max(200, 'Email cannot exceed 200 characters')
  .refine(val => !val || val === '' || isAsciiEmail(val.trim()), {
    message: 'Please enter a valid email address (e.g., name@example.com)',
  })
  .optional()
  .or(z.literal(''))
  .transform(val =>
    val === undefined ? undefined : !val || val === '' ? null : val.trim()
  )

// Postcode validator (stored as smallint 0-9999)
const postcodeSchema = z
  .union([z.string(), z.number()])
  .optional()
  .transform(val => {
    if (!val || val === 0 || val === '0' || val === '') return null
    const num = typeof val === 'string' ? parseInt(val, 10) : val
    if (isNaN(num) || num < 0 || num > 9999) return null
    return num
  })

export const searchCustomersSchema = z.object({
  q: z.string().optional().default(''), // Search query (name, phone, email)
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
})

export const createCustomerSchema = z.object({
  surname: z
    .string()
    .min(1, 'Surname is required')
    .max(20, 'Surname cannot exceed 20 characters'),
  firstname: z
    .string()
    .max(20, 'First name cannot exceed 20 characters')
    .optional()
    .or(z.literal(''))
    .transform(val => (!val || val === '' ? null : val)),
  address: z
    .string()
    .max(50, 'Address cannot exceed 50 characters')
    .optional()
    .or(z.literal(''))
    .transform(val => (!val || val === '' ? null : val)),
  suburb: z
    .string()
    .max(20, 'Suburb cannot exceed 20 characters')
    .optional()
    .or(z.literal(''))
    .transform(val => (!val || val === '' ? null : val)),
  postcode: postcodeSchema,
  phone1: phoneSchema,
  phone2: phoneSchema,
  phone3: phoneSchema,
  email: emailSchema,
})

// For updates, we need special handling to distinguish between:
// - Field not provided (undefined) -> don't update
// - Field provided as empty string -> set to null
// - Field provided with value -> set to value
export const updateCustomerSchema = z.object({
  surname: z
    .string()
    .min(1, 'Surname is required')
    .max(20, 'Surname cannot exceed 20 characters')
    .optional(),
  firstname: z
    .string()
    .max(20, 'First name cannot exceed 20 characters')
    .transform(val => (val === '' ? null : val))
    .optional(),
  address: z
    .string()
    .max(50, 'Address cannot exceed 50 characters')
    .transform(val => (val === '' ? null : val))
    .optional(),
  suburb: z
    .string()
    .max(20, 'Suburb cannot exceed 20 characters')
    .transform(val => (val === '' ? null : val))
    .optional(),
  postcode: postcodeSchema.optional(),
  phone1: z
    .string()
    .max(20, 'Phone number cannot exceed 20 characters')
    .refine(
      val => {
        if (!val || val === '') return true
        return normalizePhone(val).length <= 11
      },
      { message: 'Phone number cannot exceed 11 digits' }
    )
    .transform(val => {
      if (val === '') return null
      return normalizePhone(val)
    })
    .optional(),
  phone2: z
    .string()
    .max(20, 'Phone number cannot exceed 20 characters')
    .refine(
      val => {
        if (!val || val === '') return true
        return normalizePhone(val).length <= 11
      },
      { message: 'Phone number cannot exceed 11 digits' }
    )
    .transform(val => {
      if (val === '') return null
      return normalizePhone(val)
    })
    .optional(),
  phone3: z
    .string()
    .max(20, 'Phone number cannot exceed 20 characters')
    .refine(
      val => {
        if (!val || val === '') return true
        return normalizePhone(val).length <= 11
      },
      { message: 'Phone number cannot exceed 11 digits' }
    )
    .transform(val => {
      if (val === '') return null
      return normalizePhone(val)
    })
    .optional(),
  email: z
    .string()
    .max(200, 'Email cannot exceed 200 characters')
    .refine(val => !val || val === '' || isAsciiEmail(val.trim()), {
      message: 'Please enter a valid email address (e.g., name@example.com)',
    })
    .transform(val => (val === '' ? null : val?.trim()))
    .optional(),
})

export type SearchCustomersInput = z.infer<typeof searchCustomersSchema>
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
