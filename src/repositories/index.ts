/**
 * Repository Exports
 *
 * Central export point for all repository interfaces and implementations.
 */

// Types and interfaces
export type {
  IAnimalRepository,
  ICustomerRepository,
  IBreedRepository,
  INotesRepository,
  AnimalWithRelations,
  AnimalWithNotes,
  CustomerWithAnimals,
  BreedWithAnimals,
  NoteWithAnimal,
  PaginationOptions,
  SearchOptions,
} from './types'

// Implementations
export { AnimalRepository, animalRepository } from './animal.repository'
export { CustomerRepository, customerRepository } from './customer.repository'
export { BreedRepository, breedRepository } from './breed.repository'
export { NotesRepository, notesRepository } from './notes.repository'
