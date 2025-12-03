// src/store/animalsStore.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type {
  AnimalResponse,
  CreateAnimalData,
  UpdateAnimalData,
  PaginationMeta,
} from '@/types/api'

// Re-export for backward compatibility
type Animal = AnimalResponse

interface SearchParams {
  q?: string
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

interface AnimalsState {
  // Data
  animals: Animal[]
  selectedAnimal: Animal | null
  pagination: PaginationMeta
  searchParams: SearchParams
  loading: boolean
  mutating: boolean // For update/delete operations (separate from loading to avoid page flash)
  error: string | null

  // Actions
  setAnimals: (animals: Animal[]) => void
  setSelectedAnimal: (animal: Animal | null) => void
  setPagination: (pagination: PaginationMeta) => void
  setSearchParams: (params: SearchParams) => void
  setLoading: (loading: boolean) => void
  setMutating: (mutating: boolean) => void
  setError: (error: string | null) => void
  clearSearch: () => void

  // API Actions
  searchAnimals: (params: SearchParams) => Promise<void>
  fetchAnimal: (id: number) => Promise<void>
  createAnimal: (data: CreateAnimalData) => Promise<Animal>
  updateAnimal: (id: number, data: UpdateAnimalData) => Promise<void>
  deleteAnimal: (id: number) => Promise<void>
  addNote: (
    animalId: number,
    payload: { notes: string; serviceDate?: string }
  ) => Promise<void>
  deleteNote: (noteId: number, animalId?: number) => Promise<void>
}

export const useAnimalsStore = create<AnimalsState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        animals: [],
        selectedAnimal: null,
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        searchParams: {},
        loading: false,
        mutating: false,
        error: null,

        // Basic setters
        setAnimals: animals => set({ animals }),
        setSelectedAnimal: animal => set({ selectedAnimal: animal }),
        setPagination: pagination => set({ pagination }),
        setSearchParams: params => set({ searchParams: params }),
        setLoading: loading => set({ loading }),
        setMutating: mutating => set({ mutating }),
        setError: error => set({ error }),
        clearSearch: () =>
          set({
            searchParams: {},
            animals: [],
            pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
          }),

        // API Actions
        searchAnimals: async params => {
          set({ loading: true, error: null })
          try {
            const query = new URLSearchParams({
              q: params.q || '',
              page: (params.page || 1).toString(),
              limit: (params.limit || 20).toString(),
              sort: params.sort || 'relevance',
              order: params.order || 'desc',
            }).toString()

            const response = await fetch(`/api/animals?${query}`)

            if (!response.ok) {
              throw new Error('Failed to search animals')
            }

            const data = await response.json()

            set({
              animals: data.animals,
              pagination: data.pagination,
              searchParams: params,
            })
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Search failed',
            })
          } finally {
            set({ loading: false })
          }
        },

        fetchAnimal: async id => {
          set({ loading: true, error: null })
          try {
            const response = await fetch(`/api/animals/${id}`)

            if (!response.ok) {
              throw new Error('Failed to fetch animal')
            }

            const animal = await response.json()
            set({ selectedAnimal: animal })
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to fetch animal',
            })
          } finally {
            set({ loading: false })
          }
        },

        createAnimal: async data => {
          set({ loading: true, error: null })
          try {
            const response = await fetch('/api/animals', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            })

            if (!response.ok) {
              const errorData = await response.json()
              throw new Error(errorData.error || 'Failed to create animal')
            }

            const createdAnimal = await response.json()

            // Refresh the current search
            const { searchParams } = get()
            if (Object.keys(searchParams).length > 0) {
              await get().searchAnimals(searchParams)
            }

            set({ loading: false })
            return createdAnimal
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to create animal',
              loading: false,
            })
            throw error
          }
        },

        updateAnimal: async (id, data) => {
          // Set mutating flag for UI feedback (separate from loading to avoid page flash)
          set({ error: null, mutating: true })
          try {
            const response = await fetch(`/api/animals/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            })

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}))
              throw new Error(errorData.error || 'Failed to update animal')
            }

            const updatedAnimal = await response.json()

            // Update selected animal if it's the one being updated
            const { selectedAnimal } = get()
            if (selectedAnimal && selectedAnimal.id === id) {
              set({ selectedAnimal: updatedAnimal })
            }

            // Refresh the current search (without loading state)
            const { searchParams } = get()
            if (Object.keys(searchParams).length > 0) {
              // Silently refresh search results
              const query = new URLSearchParams({
                q: searchParams.q || '',
                page: (searchParams.page || 1).toString(),
                limit: (searchParams.limit || 20).toString(),
                sort: searchParams.sort || 'relevance',
                order: searchParams.order || 'desc',
              }).toString()
              const searchResponse = await fetch(`/api/animals?${query}`)
              if (searchResponse.ok) {
                const searchData = await searchResponse.json()
                set({
                  animals: searchData.animals,
                  pagination: searchData.pagination,
                })
              }
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Failed to update animal'
            set({ error: errorMessage })
            throw error // Re-throw so caller can handle
          } finally {
            set({ mutating: false })
          }
        },

        deleteAnimal: async id => {
          // Set mutating flag for UI feedback (separate from loading to avoid page flash)
          set({ error: null, mutating: true })
          try {
            const response = await fetch(`/api/animals/${id}`, {
              method: 'DELETE',
            })

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}))
              throw new Error(errorData.error || 'Failed to delete animal')
            }

            // Clear selected animal if it's the one being deleted
            const { selectedAnimal } = get()
            if (selectedAnimal && selectedAnimal.id === id) {
              set({ selectedAnimal: null })
            }

            // Silently refresh the current search
            const { searchParams } = get()
            if (Object.keys(searchParams).length > 0) {
              const query = new URLSearchParams({
                q: searchParams.q || '',
                page: (searchParams.page || 1).toString(),
                limit: (searchParams.limit || 20).toString(),
                sort: searchParams.sort || 'relevance',
                order: searchParams.order || 'desc',
              }).toString()
              const searchResponse = await fetch(`/api/animals?${query}`)
              if (searchResponse.ok) {
                const searchData = await searchResponse.json()
                set({
                  animals: searchData.animals,
                  pagination: searchData.pagination,
                })
              }
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Failed to delete animal'
            set({ error: errorMessage })
            throw error // Re-throw so caller can handle
          } finally {
            set({ mutating: false })
          }
        },

        addNote: async (animalId, payload) => {
          // Set mutating flag for UI feedback
          set({ error: null, mutating: true })
          try {
            const response = await fetch(`/api/animals/${animalId}/notes`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}))
              throw new Error(errorData.error || 'Failed to add note')
            }
            // Silently refresh selected animal to get updated notes
            const animalResponse = await fetch(`/api/animals/${animalId}`)
            if (animalResponse.ok) {
              const animal = await animalResponse.json()
              set({ selectedAnimal: animal })
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Failed to add note'
            set({ error: errorMessage })
            throw error // Re-throw so caller can handle
          } finally {
            set({ mutating: false })
          }
        },

        deleteNote: async (noteId, animalId) => {
          // Set mutating flag for UI feedback
          set({ error: null, mutating: true })
          try {
            const response = await fetch(`/api/notes/${noteId}`, {
              method: 'DELETE',
            })
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}))
              throw new Error(errorData.error || 'Failed to delete note')
            }
            // Silently refresh selected animal if provided
            if (animalId) {
              const animalResponse = await fetch(`/api/animals/${animalId}`)
              if (animalResponse.ok) {
                const animal = await animalResponse.json()
                set({ selectedAnimal: animal })
              }
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Failed to delete note'
            set({ error: errorMessage })
            throw error // Re-throw so caller can handle
          } finally {
            set({ mutating: false })
          }
        },
      }),
      {
        name: 'animals-storage',
        partialize: state => ({
          searchParams: state.searchParams,
          selectedAnimal: state.selectedAnimal,
        }),
      }
    ),
    {
      name: 'animals-store',
    }
  )
)
