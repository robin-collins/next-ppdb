/**
 * Shared API Types
 *
 * Type definitions for API responses and requests.
 * These types match the transformed data from API routes.
 */

// ============ Customer Types ============

export interface CustomerSummary {
  id: number
  surname: string
  firstname?: string | null
}

export interface CustomerDetails extends CustomerSummary {
  address?: string | null
  suburb?: string | null
  postcode?: number | null
  phone1?: string | null
  phone2?: string | null
  phone3?: string | null
  email?: string | null
}

export interface CustomerResponse extends CustomerDetails {
  animals?: AnimalSummary[]
  animalCount?: number
  totalNotesCount?: number
  earliestNoteDate?: Date | string | null
  latestNoteDate?: Date | string | null
}

// ============ Animal Types ============

export type Sex = 'Male' | 'Female' | 'Unknown'

export interface AnimalSummary {
  id: number
  name: string
  breed: string
  sex: Sex
}

export interface AnimalDetails extends AnimalSummary {
  colour: string | null
  cost: number
  lastVisit: Date | string
  thisVisit: Date | string
  comments: string | null
}

export interface AnimalResponse extends AnimalDetails {
  customer: CustomerDetails
  relevanceScore?: number
  serviceNotes?: NoteResponse[]
}

// ============ Note Types ============

export interface NoteResponse {
  id: number
  animalId: number
  notes: string
  serviceDate: Date | string
}

export interface CreateNoteData {
  notes: string
  serviceDate?: string
}

// ============ Breed Types ============

export interface BreedResponse {
  id: number
  name: string
  avgtime: string | null
  avgcost: number | null
}

// ============ Request Types ============

export interface CreateAnimalData {
  customerId: number
  name: string
  breed: string
  sex: Sex
  colour?: string
  cost?: number
  lastVisit?: string
  thisVisit?: string
  comments?: string
}

export interface UpdateAnimalData {
  name?: string
  breed?: string
  sex?: Sex
  colour?: string
  cost?: number
  lastVisit?: string
  thisVisit?: string
  comments?: string
}

export interface CreateCustomerData {
  surname: string
  firstname?: string
  address?: string
  suburb?: string
  postcode?: number
  phone1?: string
  phone2?: string
  phone3?: string
  email?: string
}

export type UpdateCustomerData = Partial<CreateCustomerData>

// ============ Pagination Types ============

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}

// ============ Error Types ============

export interface ApiError {
  error: string
  details?: unknown
}

export interface ValidationError extends ApiError {
  issues?: Array<{
    path: string[]
    message: string
  }>
}
