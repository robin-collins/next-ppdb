// src/store/customersStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { customer, animal } from '../generated/prisma'

// Define proper types for API data
interface CreateCustomerData {
  surname: string
  firstname?: string
  address?: string
  suburb?: string
  postcode?: string
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
  postcode?: string
  phone1?: string
  phone2?: string
  phone3?: string
  email?: string
}

interface CustomersState {
  customers: customer[]
  selectedCustomer: (customer & { animals: animal[] }) | null
  loading: boolean
  error: string | null

  // Actions
  setCustomers: (customers: customer[]) => void
  setSelectedCustomer: (
    customer: (customer & { animals: animal[] }) | null
  ) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // API Actions
  searchCustomers: (surname: string) => Promise<void>
  fetchCustomer: (id: number) => Promise<void>
  createCustomer: (data: CreateCustomerData) => Promise<void>
  updateCustomer: (id: number, data: UpdateCustomerData) => Promise<void>
}

export const useCustomersStore = create<CustomersState>()(
  devtools(
    (set, get) => ({
      customers: [],
      selectedCustomer: null,
      loading: false,
      error: null,

      setCustomers: customers => set({ customers }),
      setSelectedCustomer: customer => set({ selectedCustomer: customer }),
      setLoading: loading => set({ loading }),
      setError: error => set({ error }),

      searchCustomers: async surname => {
        set({ loading: true, error: null })
        try {
          const response = await fetch(
            `/api/customers?surname=${encodeURIComponent(surname)}`
          )

          if (!response.ok) {
            throw new Error('Failed to search customers')
          }

          const customers = await response.json()
          set({ customers })
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

          // Optionally refresh customers list
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to create customer',
          })
        } finally {
          set({ loading: false })
        }
      },

      updateCustomer: async (id, data) => {
        set({ loading: true, error: null })
        try {
          const response = await fetch(`/api/customers/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to update customer')
          }

          const updatedCustomer = await response.json()

          // Update selected customer if it's the one being updated
          const { selectedCustomer } = get()
          if (selectedCustomer && selectedCustomer.customerID === id) {
            set({ selectedCustomer: updatedCustomer })
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to update customer',
          })
        } finally {
          set({ loading: false })
        }
      },
    }),
    {
      name: 'customers-store',
    }
  )
)
