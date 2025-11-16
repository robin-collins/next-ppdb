// src/store/animalsStore.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// Define API response types that match the transformed data
interface Animal {
  id: number
  name: string
  breed: string
  colour: string | null
  sex: 'Male' | 'Female'
  cost: number
  lastVisit: Date
  thisVisit: Date
  comments: string | null
  relevanceScore?: number // Optional relevance score from search
  customer: {
    id: number
    surname: string
    firstname?: string | null
    address?: string | null
    suburb?: string | null
    postcode?: number | null
    phone1?: string | null
    phone2?: string | null
    phone3?: string | null
    email?: string | null
  }
  serviceNotes?: {
    id: number
    animalId: number
    notes: string
    serviceDate: Date
  }[]
}

// Define proper types for API data that match the validation schemas
interface CreateAnimalData {
  customerId: number
  name: string
  breed: string
  sex: 'Male' | 'Female' | 'Unknown'
  colour?: string
  cost?: number
  lastVisit?: string
  thisVisit?: string
  comments?: string
}

interface UpdateAnimalData {
  name?: string
  breed?: string
  sex?: 'Male' | 'Female' | 'Unknown'
  colour?: string
  cost?: number
  lastVisit?: string
  thisVisit?: string
  comments?: string
}

interface SearchParams {
  q?: string
  page?: number
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface AnimalsState {
  // Data
  animals: Animal[]
  selectedAnimal: Animal | null
  pagination: PaginationData
  searchParams: SearchParams
  loading: boolean
  error: string | null

  // Actions
  setAnimals: (animals: Animal[]) => void
  setSelectedAnimal: (animal: Animal | null) => void
  setPagination: (pagination: PaginationData) => void
  setSearchParams: (params: SearchParams) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearSearch: () => void

  // API Actions
  searchAnimals: (params: SearchParams) => Promise<void>
  fetchAnimal: (id: number) => Promise<void>
  createAnimal: (data: CreateAnimalData) => Promise<void>
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
        error: null,

        // Basic setters
        setAnimals: animals => set({ animals }),
        setSelectedAnimal: animal => set({ selectedAnimal: animal }),
        setPagination: pagination => set({ pagination }),
        setSearchParams: params => set({ searchParams: params }),
        setLoading: loading => set({ loading }),
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

            // Refresh the current search
            const { searchParams } = get()
            if (Object.keys(searchParams).length > 0) {
              await get().searchAnimals(searchParams)
            }
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to create animal',
            })
          } finally {
            set({ loading: false })
          }
        },

        updateAnimal: async (id, data) => {
          set({ loading: true, error: null })
          try {
            const response = await fetch(`/api/animals/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            })

            if (!response.ok) {
              const errorData = await response.json()
              throw new Error(errorData.error || 'Failed to update animal')
            }

            const updatedAnimal = await response.json()

            // Update selected animal if it's the one being updated
            const { selectedAnimal } = get()
            if (selectedAnimal && selectedAnimal.id === id) {
              set({ selectedAnimal: updatedAnimal })
            }

            // Refresh the current search
            const { searchParams } = get()
            if (Object.keys(searchParams).length > 0) {
              await get().searchAnimals(searchParams)
            }
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to update animal',
            })
          } finally {
            set({ loading: false })
          }
        },

        deleteAnimal: async id => {
          set({ loading: true, error: null })
          try {
            const response = await fetch(`/api/animals/${id}`, {
              method: 'DELETE',
            })

            if (!response.ok) {
              throw new Error('Failed to delete animal')
            }

            // Clear selected animal if it's the one being deleted
            const { selectedAnimal } = get()
            if (selectedAnimal && selectedAnimal.id === id) {
              set({ selectedAnimal: null })
            }

            // Refresh the current search
            const { searchParams } = get()
            if (Object.keys(searchParams).length > 0) {
              await get().searchAnimals(searchParams)
            }
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to delete animal',
            })
          } finally {
            set({ loading: false })
          }
        },

        addNote: async (animalId, payload) => {
          set({ loading: true, error: null })
          try {
            const response = await fetch(`/api/animals/${animalId}/notes`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
            if (!response.ok) {
              const errorData = await response.json()
              throw new Error(errorData.error || 'Failed to add note')
            }
            // Refresh selected animal to get updated notes
            await get().fetchAnimal(animalId)
          } catch (error) {
            set({
              error:
                error instanceof Error ? error.message : 'Failed to add note',
            })
          } finally {
            set({ loading: false })
          }
        },

        deleteNote: async (noteId, animalId) => {
          set({ loading: true, error: null })
          try {
            const response = await fetch(`/api/notes/${noteId}`, {
              method: 'DELETE',
            })
            if (!response.ok) {
              const errorData = await response.json()
              throw new Error(errorData.error || 'Failed to delete note')
            }
            // Refresh selected animal if provided
            if (animalId) {
              await get().fetchAnimal(animalId)
            }
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to delete note',
            })
          } finally {
            set({ loading: false })
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
