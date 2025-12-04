/**
 * Repository Types and Interfaces
 *
 * Defines the contract for data access operations.
 * Services depend on these interfaces, not concrete implementations.
 */

import type { Prisma } from '@/generated/prisma'

// Common types used across repositories
export type AnimalWithRelations = Prisma.animalGetPayload<{
  include: { customer: true; breed: true }
}>

export type AnimalWithNotes = Prisma.animalGetPayload<{
  include: { customer: true; breed: true; notes: true }
}>

export type CustomerWithAnimals = Prisma.customerGetPayload<{
  include: { animal: true }
}>

export type BreedWithAnimals = Prisma.breedGetPayload<{
  include: { animal: true }
}>

export type NoteWithAnimal = Prisma.notesGetPayload<{
  include: { animal: true }
}>

// Pagination options
export interface PaginationOptions {
  page: number
  limit: number
}

// Search options
export interface SearchOptions extends PaginationOptions {
  query: string
  sort?: string
  order?: 'asc' | 'desc'
}

// Animal Repository Interface
export interface IAnimalRepository {
  findById(id: number): Promise<AnimalWithNotes | null>
  findMany(options: SearchOptions): Promise<{
    animals: AnimalWithRelations[]
    total: number
  }>
  create(data: Prisma.animalCreateInput): Promise<AnimalWithRelations>
  update(
    id: number,
    data: Prisma.animalUpdateInput
  ): Promise<AnimalWithRelations>
  delete(id: number): Promise<void>
  countByCustomer(customerId: number): Promise<number>
}

// Customer Repository Interface
export interface ICustomerRepository {
  findById(id: number): Promise<CustomerWithAnimals | null>
  findMany(options: SearchOptions): Promise<{
    customers: CustomerWithAnimals[]
    total: number
  }>
  findByIdBasic(id: number): Promise<Prisma.customerGetPayload<object> | null>
  create(data: Prisma.customerCreateInput): Promise<CustomerWithAnimals>
  update(
    id: number,
    data: Prisma.customerUpdateInput
  ): Promise<CustomerWithAnimals>
  delete(id: number): Promise<void>
  search(query: string): Promise<CustomerWithAnimals[]>
}

// Breed Repository Interface
export interface IBreedRepository {
  findById(id: number): Promise<BreedWithAnimals | null>
  findByName(name: string): Promise<Prisma.breedGetPayload<object> | null>
  findAll(): Promise<Prisma.breedGetPayload<object>[]>
  create(data: Prisma.breedCreateInput): Promise<Prisma.breedGetPayload<object>>
  update(
    id: number,
    data: Prisma.breedUpdateInput
  ): Promise<Prisma.breedGetPayload<object>>
  delete(id: number): Promise<void>
  countAnimals(breedId: number): Promise<number>
}

// Notes Repository Interface
export interface INotesRepository {
  findById(id: number): Promise<NoteWithAnimal | null>
  findByAnimalId(animalId: number): Promise<Prisma.notesGetPayload<object>[]>
  create(data: Prisma.notesCreateInput): Promise<Prisma.notesGetPayload<object>>
  update(
    id: number,
    data: Prisma.notesUpdateInput
  ): Promise<Prisma.notesGetPayload<object>>
  delete(id: number): Promise<void>
  deleteByAnimalId(animalId: number): Promise<number>
  countByAnimalId(animalId: number): Promise<number>
}
