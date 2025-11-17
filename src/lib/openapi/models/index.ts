/**
 * Shared OpenAPI types and utilities
 *
 * This file exports common types and schemas used across multiple API endpoints.
 */

import { z } from 'zod'

/**
 * Common error response schema
 */
export const ErrorResponseDTO = z.object({
  error: z.string().describe('Error message'),
  details: z.any().optional().describe('Additional error details'),
})

/**
 * Common success response schema
 */
export const SuccessResponseDTO = z.object({
  message: z.string().describe('Success message'),
})

/**
 * Pagination metadata schema
 */
export const PaginationDTO = z.object({
  page: z.number().int().positive().describe('Current page number'),
  pageSize: z.number().int().positive().describe('Items per page'),
  total: z.number().int().nonnegative().describe('Total number of items'),
  totalPages: z.number().int().nonnegative().describe('Total number of pages'),
})
