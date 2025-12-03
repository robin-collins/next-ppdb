// src/store/customersStore.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// Customer store uses its own types as they include additional fields
// for the UI that may differ from API response types
interface Customer {
  id: number
  surname: string
  firstname: string | null
  address: string | null
  suburb: string | null
  postcode: string | null
  phone1: string | null
  phone2: string | null
  phone3: string | null
  email: string | null
  animalCount: number
  animals: {
    id: number
    name: string
    breed: string
    breedId?: number
    sex: 'Male' | 'Female'
    colour?: string
    cost?: number
    lastVisit?: Date
    thisVisit?: Date
    comments?: string | null
  }[]
}

interface CreateCustomerData {
  surname: string
  firstname?: string
  address?: string
  suburb?: string
  postcode?: string | number
  phone1?: string
  phone2?: string
  phone3?: string
  email?: string
}

interface UpdateCustomerData {
  surname?: string
  firstname?: string
  address?: string
  suburb?: string
  postcode?: string | number
  phone1?: string
  phone2?: string
  phone3?: string
  email?: string
}

interface SearchParams {
  q?: string
  page?: number
  limit?: number
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface CustomersState {
  // Data
  customers: Customer[]
  selectedCustomer: Customer | null
  pagination: PaginationData
  searchParams: SearchParams
  loading: boolean
  mutating: boolean // For update/delete operations (separate from loading to avoid page flash)
  error: string | null

  // Actions
  setCustomers: (customers: Customer[]) => void
  setSelectedCustomer: (customer: Customer | null) => void
  setPagination: (pagination: PaginationData) => void
  setSearchParams: (params: SearchParams) => void
  setLoading: (loading: boolean) => void
  setMutating: (mutating: boolean) => void
  setError: (error: string | null) => void
  clearSearch: () => void

  // API Actions
  searchCustomers: (params: SearchParams) => Promise<void>
  fetchCustomer: (id: number) => Promise<void>
  createCustomer: (data: CreateCustomerData) => Promise<Customer>
  updateCustomer: (id: number, data: UpdateCustomerData) => Promise<void>
  deleteCustomer: (id: number) => Promise<void>
  deleteAnimal: (id: number) => Promise<void>
}

export const useCustomersStore = create<CustomersState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        customers: [],
        selectedCustomer: null,
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        searchParams: {},
        loading: false,
        mutating: false,
        error: null,

        // Basic setters
        setCustomers: customers => set({ customers }),
        setSelectedCustomer: customer => set({ selectedCustomer: customer }),
        setPagination: pagination => set({ pagination }),
        setSearchParams: params => set({ searchParams: params }),
        setLoading: loading => set({ loading }),
        setMutating: mutating => set({ mutating }),
        setError: error => set({ error }),
        clearSearch: () =>
          set({
            searchParams: {},
            customers: [],
            pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
          }),

        // API Actions
        searchCustomers: async params => {
          set({ loading: true, error: null })
          try {
            const query = new URLSearchParams({
              q: params.q || '',
              page: (params.page || 1).toString(),
              limit: (params.limit || 20).toString(),
            }).toString()

            const response = await fetch(`/api/customers?${query}`)

            if (!response.ok) {
              throw new Error('Failed to search customers')
            }

            const data = await response.json()

            set({
              customers: data.customers,
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

        fetchCustomer: async id => {
          set({ loading: true, error: null })
          try {
            const response = await fetch(`/api/customers/${id}`)

            if (!response.ok) {
              throw new Error('Failed to fetch customer')
            }

            const customer = await response.json()
            set({ selectedCustomer: customer })
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to fetch customer',
            })
          } finally {
            set({ loading: false })
          }
        },

        createCustomer: async data => {
          set({ loading: true, error: null })
          try {
            const response = await fetch('/api/customers', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            })

            if (!response.ok) {
              const errorData = await response.json()
              throw new Error(errorData.error || 'Failed to create customer')
            }

            const newCustomer = await response.json()

            // Refresh the current search
            const { searchParams } = get()
            if (Object.keys(searchParams).length > 0) {
              await get().searchCustomers(searchParams)
            }

            set({ loading: false })
            return newCustomer
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to create customer',
              loading: false,
            })
            throw error
          }
        },

        updateCustomer: async (id, data) => {
          // Set mutating flag for UI feedback (separate from loading to avoid page flash)
          set({ error: null, mutating: true })
          try {
            const response = await fetch(`/api/customers/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            })

            if (!response.ok) {
              const errorData = await response.json()

              // Create a custom error that includes field-level errors
              const error = new Error(
                errorData.message ||
                  errorData.error ||
                  'Failed to update customer'
              ) as Error & { fieldErrors?: Record<string, string> }

              // Attach field errors if present (for validation errors)
              if (errorData.fieldErrors) {
                error.fieldErrors = errorData.fieldErrors
              }

              throw error
            }

            const updatedCustomer = await response.json()

            // Update selected customer if it's the one being updated
            const { selectedCustomer } = get()
            if (selectedCustomer && selectedCustomer.id === id) {
              set({ selectedCustomer: updatedCustomer })
            }

            // Silently refresh the current search (without loading state)
            const { searchParams } = get()
            if (Object.keys(searchParams).length > 0) {
              const query = new URLSearchParams({
                q: searchParams.q || '',
                page: (searchParams.page || 1).toString(),
                limit: (searchParams.limit || 20).toString(),
              }).toString()
              const searchResponse = await fetch(`/api/customers?${query}`)
              if (searchResponse.ok) {
                const searchData = await searchResponse.json()
                set({
                  customers: searchData.customers,
                  pagination: searchData.pagination,
                })
              }
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Failed to update customer'
            set({ error: errorMessage })
            throw error // Re-throw so caller can handle
          } finally {
            set({ mutating: false })
          }
        },

        deleteCustomer: async id => {
          // Set mutating flag for UI feedback (separate from loading to avoid page flash)
          set({ error: null, mutating: true })
          try {
            const response = await fetch(`/api/customers/${id}`, {
              method: 'DELETE',
            })

            if (!response.ok) {
              const errorData = await response.json()
              throw new Error(
                errorData.error ||
                  errorData.details ||
                  'Failed to delete customer'
              )
            }

            // Clear selected customer if it's the one being deleted
            const { selectedCustomer } = get()
            if (selectedCustomer && selectedCustomer.id === id) {
              set({ selectedCustomer: null })
            }

            // Silently refresh the current search
            const { searchParams } = get()
            if (Object.keys(searchParams).length > 0) {
              const query = new URLSearchParams({
                q: searchParams.q || '',
                page: (searchParams.page || 1).toString(),
                limit: (searchParams.limit || 20).toString(),
              }).toString()
              const searchResponse = await fetch(`/api/customers?${query}`)
              if (searchResponse.ok) {
                const searchData = await searchResponse.json()
                set({
                  customers: searchData.customers,
                  pagination: searchData.pagination,
                })
              }
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Failed to delete customer'
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
              const errorData = await response.json()
              throw new Error(
                errorData.error ||
                  errorData.details ||
                  'Failed to delete animal'
              )
            }

            // Silently refresh selected customer to update the animals list
            const { selectedCustomer } = get()
            if (selectedCustomer) {
              const customerResponse = await fetch(
                `/api/customers/${selectedCustomer.id}`
              )
              if (customerResponse.ok) {
                const customer = await customerResponse.json()
                set({ selectedCustomer: customer })
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
      }),
      {
        name: 'customers-storage',
        partialize: state => ({
          searchParams: state.searchParams,
          selectedCustomer: state.selectedCustomer,
        }),
      }
    ),
    {
      name: 'customers-store',
    }
  )
)
