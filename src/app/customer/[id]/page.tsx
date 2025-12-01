'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCustomersStore } from '@/store/customersStore'
import { useSidebarState } from '@/hooks/useSidebarState'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import CustomerInfoCard from '@/components/customer/CustomerInfoCard'
import AssociatedAnimalsCard from '@/components/customer/AssociatedAnimalsCard'
import CustomerStatsCard from '@/components/customer/CustomerStatsCard'
import Toast from '@/components/Toast'

// Delete confirmation state interface for animals
interface DeleteConfirmState {
  id: number
  name: string
  typedName: string
  notesCount: number | null
  loading: boolean
}

// Animal info for customer delete modal
interface OrphanedAnimal {
  id: number
  name: string
  breed: string
  selected: boolean
}

// Delete confirmation state interface for customer
interface CustomerDeleteConfirmState {
  id: number
  name: string
  typedName: string
  animals: OrphanedAnimal[]
  loading: boolean
  migrateToCustomerId: number | null
  acknowledgeDeleteAnimals: boolean // User acknowledged animals will be deleted if not rehoming
}

// Simple customer type for migration dropdown
interface SimpleCustomer {
  id: number
  surname: string
  firstname: string | null
}

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = parseInt(params.id as string)

  const {
    selectedCustomer,
    loading,
    error,
    fetchCustomer,
    updateCustomer,
    deleteAnimal,
  } = useCustomersStore()

  const {
    sidebarOpen,
    sidebarPinned,
    skipTransition,
    setSidebarOpen,
    toggleSidebar,
    togglePin,
  } = useSidebarState()
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
    show: boolean
  }>({ message: '', type: 'info', show: false })

  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState | null>(
    null
  )
  const [customerDeleteConfirm, setCustomerDeleteConfirm] =
    useState<CustomerDeleteConfirmState | null>(null)
  const [otherCustomers, setOtherCustomers] = useState<SimpleCustomer[]>([])
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const deleteInputRef = useRef<HTMLInputElement>(null)
  const customerDeleteInputRef = useRef<HTMLInputElement>(null)
  const customerSearchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (customerId && !isNaN(customerId)) {
      fetchCustomer(customerId)
    }
  }, [customerId, fetchCustomer])

  // Initiate delete - fetch notes count and show modal (must be before early returns)
  const handleDeleteAnimal = useCallback(
    async (animalId: number, animalName: string) => {
      setDeleteConfirm({
        id: animalId,
        name: animalName,
        typedName: '',
        notesCount: null,
        loading: true,
      })

      // Fetch notes count
      try {
        const res = await fetch(`/api/animals/${animalId}/notes/count`)
        if (res.ok) {
          const data = await res.json()
          setDeleteConfirm(prev =>
            prev
              ? { ...prev, notesCount: data.count ?? 0, loading: false }
              : null
          )
        } else {
          setDeleteConfirm(prev =>
            prev ? { ...prev, notesCount: 0, loading: false } : null
          )
        }
      } catch {
        setDeleteConfirm(prev =>
          prev ? { ...prev, notesCount: 0, loading: false } : null
        )
      }
    },
    []
  )

  // Focus input when modal opens
  useEffect(() => {
    if (deleteConfirm && !deleteConfirm.loading && deleteInputRef.current) {
      deleteInputRef.current.focus()
    }
  }, [deleteConfirm])

  // Handle escape key for animal delete
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (deleteConfirm && e.key === 'Escape') {
        setDeleteConfirm(null)
      }
      if (customerDeleteConfirm && e.key === 'Escape') {
        setCustomerDeleteConfirm(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [deleteConfirm, customerDeleteConfirm])

  // Focus customer delete input when modal opens
  useEffect(() => {
    if (
      customerDeleteConfirm &&
      !customerDeleteConfirm.loading &&
      customerDeleteInputRef.current
    ) {
      customerDeleteInputRef.current.focus()
    }
  }, [customerDeleteConfirm])

  // Reset customer search when modal opens/closes
  useEffect(() => {
    if (!customerDeleteConfirm) {
      setCustomerSearchQuery('')
      setShowCustomerDropdown(false)
    }
  }, [customerDeleteConfirm])

  // Close customer dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        showCustomerDropdown &&
        customerSearchInputRef.current &&
        !customerSearchInputRef.current.parentElement?.parentElement?.contains(
          e.target as Node
        )
      ) {
        setShowCustomerDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showCustomerDropdown])

  // Initiate customer delete - get animal list and fetch other customers
  const initiateDeleteCustomer = useCallback(async () => {
    if (!selectedCustomer) return
    const fullName =
      `${selectedCustomer.firstname || ''} ${selectedCustomer.surname}`.trim()

    // Map customer's animals to OrphanedAnimal format, all selected by default
    const orphanedAnimals: OrphanedAnimal[] = (
      selectedCustomer.animals || []
    ).map(animal => ({
      id: animal.id,
      name: animal.name,
      breed: animal.breed,
      selected: true, // Default all animals to selected for rehoming
    }))

    setCustomerDeleteConfirm({
      id: customerId,
      name: fullName,
      typedName: '',
      animals: orphanedAnimals,
      loading: true,
      migrateToCustomerId: null,
      acknowledgeDeleteAnimals: false,
    })

    // Fetch other customers for migration dropdown
    try {
      // Fetch customers (max limit is 100 per API validation)
      const customersRes = await fetch('/api/customers?limit=100')

      if (!customersRes.ok) {
        console.error(
          'Failed to fetch customers:',
          customersRes.status,
          customersRes.statusText
        )
        const errorBody = await customersRes.text()
        console.error('Error body:', errorBody)
        setCustomerDeleteConfirm(prev =>
          prev ? { ...prev, loading: false } : null
        )
        return
      }

      const customersData = await customersRes.json()
      console.log(
        'Fetched customers:',
        customersData.customers?.length || 0,
        'total'
      )

      // Filter out current customer from migration options
      // API returns { customers: [...], pagination: {...} }
      const customersList = customersData.customers || []
      const others = customersList
        .filter((c: { id: number }) => c.id !== customerId)
        .map(
          (c: { id: number; surname: string; firstname: string | null }) => ({
            id: c.id,
            surname: c.surname,
            firstname: c.firstname,
          })
        )

      console.log('Other customers available for migration:', others.length)
      setOtherCustomers(others)
      setCustomerDeleteConfirm(prev =>
        prev ? { ...prev, loading: false } : null
      )
    } catch (error) {
      console.error('Error fetching customers for migration:', error)
      setCustomerDeleteConfirm(prev =>
        prev ? { ...prev, loading: false } : null
      )
    }
  }, [customerId, selectedCustomer])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-gray-600">Loading customer...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    )
  }

  if (!selectedCustomer) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-gray-600">Customer not found</div>
      </div>
    )
  }

  const customer = selectedCustomer

  // Handler functions
  const handleUpdateCustomer = async (
    data: Partial<typeof customer>
  ): Promise<void> => {
    try {
      // Convert null values to undefined for the update
      const updateData = {
        ...data,
        firstname: data.firstname === null ? undefined : data.firstname,
        address: data.address === null ? undefined : data.address,
        suburb: data.suburb === null ? undefined : data.suburb,
        postcode: data.postcode === null ? undefined : data.postcode,
        phone1: data.phone1 === null ? undefined : data.phone1,
        phone2: data.phone2 === null ? undefined : data.phone2,
        phone3: data.phone3 === null ? undefined : data.phone3,
        email: data.email === null ? undefined : data.email,
      }
      await updateCustomer(customerId, updateData)
      setToast({
        message: 'Customer record updated successfully',
        type: 'success',
        show: true,
      })
    } catch (error) {
      setToast({
        message: 'Failed to update customer record',
        type: 'error',
        show: true,
      })
      throw error
    }
  }

  const handleDeleteCustomer = async () => {
    await initiateDeleteCustomer()
  }

  // Confirm and execute customer deletion
  const confirmDeleteCustomer = async () => {
    if (!customerDeleteConfirm) return

    // Get selected animal IDs
    const selectedAnimalIds = customerDeleteConfirm.animals
      .filter(a => a.selected)
      .map(a => a.id)

    // Build request body
    const shouldMigrate =
      selectedAnimalIds.length > 0 && customerDeleteConfirm.migrateToCustomerId
    const shouldDeleteAnimals =
      selectedAnimalIds.length > 0 &&
      !customerDeleteConfirm.migrateToCustomerId &&
      customerDeleteConfirm.acknowledgeDeleteAnimals

    const hasDataToSend = shouldMigrate || shouldDeleteAnimals
    const requestBody = shouldMigrate
      ? {
          migrateToCustomerId: customerDeleteConfirm.migrateToCustomerId,
          animalIds: selectedAnimalIds,
        }
      : shouldDeleteAnimals
        ? {
            deleteAnimals: true,
            animalIds: selectedAnimalIds,
          }
        : undefined

    try {
      const res = await fetch(`/api/customers/${customerDeleteConfirm.id}`, {
        method: 'DELETE',
        headers: hasDataToSend ? { 'Content-Type': 'application/json' } : {},
        body: hasDataToSend ? JSON.stringify(requestBody) : undefined,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to delete customer')
      }

      const result = await res.json()
      const migrated = result.migratedAnimals || 0
      const deleted = result.deletedAnimals || 0

      setCustomerDeleteConfirm(null)

      // Build appropriate success message
      let message = 'Customer deleted successfully'
      if (migrated > 0 && deleted > 0) {
        message = `Customer deleted, ${migrated} animal(s) rehomed, ${deleted} animal(s) deleted`
      } else if (migrated > 0) {
        message = `Customer deleted, ${migrated} animal(s) rehomed`
      } else if (deleted > 0) {
        message = `Customer deleted with ${deleted} animal(s)`
      }

      setToast({
        message,
        type: 'success',
        show: true,
      })

      // Navigate away after short delay so user sees toast
      setTimeout(() => router.push('/'), 1500)
    } catch (error) {
      setToast({
        message:
          error instanceof Error ? error.message : 'Failed to delete customer',
        type: 'error',
        show: true,
      })
    }
  }

  const handleAddAnimal = () => {
    // Navigate to add animal page
    router.push(`/customer/${customerId}/newAnimal`)
  }

  const handleClickAnimal = (animalId: number) => {
    router.push(`/animals/${animalId}`)
  }

  // Perform delete after confirmation
  const confirmDeleteAnimal = async () => {
    if (deleteConfirm) {
      try {
        await deleteAnimal(deleteConfirm.id)
        const notesMsg =
          deleteConfirm.notesCount && deleteConfirm.notesCount > 0
            ? ` and ${deleteConfirm.notesCount} note(s)`
            : ''
        setToast({
          message: `Animal deleted successfully${notesMsg}`,
          type: 'success',
          show: true,
        })
      } catch {
        setToast({
          message: 'Failed to delete animal',
          type: 'error',
          show: true,
        })
      }
    }
    setDeleteConfirm(null)
  }

  return (
    <div className="flex min-h-screen flex-col">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
          durationMs={15000}
        />
      )}

      {/* Delete Customer Confirmation Modal */}
      {customerDeleteConfirm && (
        <div className="fixed inset-0 z-[400] flex items-start justify-center pt-24">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setCustomerDeleteConfirm(null)}
          />
          <div
            className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl"
            style={{
              animation: 'slideInUp 0.2s ease-out',
              border: '2px solid #ef4444',
            }}
          >
            {customerDeleteConfirm.loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-200 border-t-red-600" />
                <span className="ml-3 text-gray-600">
                  Checking for associated animals...
                </span>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-full bg-red-100 p-3">
                    <svg
                      className="h-6 w-6 text-red-600"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-red-700">
                      Delete &quot;{customerDeleteConfirm.name}&quot;?
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      This action <strong>cannot be undone</strong>.
                    </p>
                  </div>
                  <button
                    className="ml-auto text-gray-400 hover:text-gray-600"
                    onClick={() => setCustomerDeleteConfirm(null)}
                  >
                    <svg
                      className="h-6 w-6"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                  </button>
                </div>

                {/* Animals list with checkboxes for rehoming */}
                {customerDeleteConfirm.animals.length > 0 && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-center gap-2 text-amber-800">
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                      </svg>
                      <strong>
                        {customerDeleteConfirm.animals.length} animal(s)
                      </strong>{' '}
                      will be orphaned
                    </div>
                    <p className="mt-2 text-sm text-amber-700">
                      Select animals to rehome to another customer:
                    </p>

                    {/* Animal checkboxes */}
                    <div className="mt-3 max-h-40 space-y-2 overflow-y-auto rounded border border-amber-200 bg-white p-2">
                      {customerDeleteConfirm.animals.map(animal => (
                        <label
                          key={animal.id}
                          className="flex cursor-pointer items-center gap-3 rounded p-2 hover:bg-amber-50"
                        >
                          <input
                            type="checkbox"
                            checked={animal.selected}
                            onChange={() =>
                              setCustomerDeleteConfirm(prev =>
                                prev
                                  ? {
                                      ...prev,
                                      animals: prev.animals.map(a =>
                                        a.id === animal.id
                                          ? { ...a, selected: !a.selected }
                                          : a
                                      ),
                                    }
                                  : null
                              )
                            }
                            className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                          />
                          <span className="font-medium text-gray-800">
                            {animal.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({animal.breed})
                          </span>
                        </label>
                      ))}
                    </div>

                    {/* Select/Deselect all */}
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        className="text-xs text-amber-700 hover:text-amber-900 hover:underline"
                        onClick={() =>
                          setCustomerDeleteConfirm(prev =>
                            prev
                              ? {
                                  ...prev,
                                  animals: prev.animals.map(a => ({
                                    ...a,
                                    selected: true,
                                  })),
                                }
                              : null
                          )
                        }
                      >
                        Select all
                      </button>
                      <span className="text-xs text-gray-400">|</span>
                      <button
                        type="button"
                        className="text-xs text-amber-700 hover:text-amber-900 hover:underline"
                        onClick={() =>
                          setCustomerDeleteConfirm(prev =>
                            prev
                              ? {
                                  ...prev,
                                  animals: prev.animals.map(a => ({
                                    ...a,
                                    selected: false,
                                  })),
                                }
                              : null
                          )
                        }
                      >
                        Deselect all
                      </button>
                    </div>

                    {/* Migration type-ahead search - only show if any animals selected */}
                    {customerDeleteConfirm.animals.some(a => a.selected) && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-amber-800">
                          Rehome selected animals to:
                        </label>
                        <div className="relative mt-1">
                          <div className="relative">
                            <svg
                              className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                              />
                            </svg>
                            <input
                              ref={customerSearchInputRef}
                              type="text"
                              className="w-full rounded-md border border-amber-300 bg-white py-2 pr-3 pl-10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                              placeholder="Search for customer..."
                              value={customerSearchQuery}
                              onChange={e => {
                                setCustomerSearchQuery(e.target.value)
                                setShowCustomerDropdown(true)
                                // Clear selection if user starts typing again
                                if (customerDeleteConfirm.migrateToCustomerId) {
                                  setCustomerDeleteConfirm(prev =>
                                    prev
                                      ? { ...prev, migrateToCustomerId: null }
                                      : null
                                  )
                                }
                              }}
                              onFocus={() => setShowCustomerDropdown(true)}
                            />
                            {customerDeleteConfirm.migrateToCustomerId && (
                              <button
                                type="button"
                                className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                onClick={() => {
                                  setCustomerSearchQuery('')
                                  setCustomerDeleteConfirm(prev =>
                                    prev
                                      ? { ...prev, migrateToCustomerId: null }
                                      : null
                                  )
                                  customerSearchInputRef.current?.focus()
                                }}
                              >
                                <svg
                                  className="h-4 w-4"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                </svg>
                              </button>
                            )}
                          </div>

                          {/* Search results dropdown */}
                          {showCustomerDropdown &&
                            !customerDeleteConfirm.migrateToCustomerId && (
                              <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-amber-200 bg-white shadow-lg">
                                {(() => {
                                  const query = customerSearchQuery
                                    .toLowerCase()
                                    .trim()
                                  console.log(
                                    `Customer search: "${query}" (${query.length} chars), searching ${otherCustomers.length} customers`
                                  )
                                  const filtered = otherCustomers.filter(c => {
                                    const fullName =
                                      `${c.surname}${c.firstname ? ` ${c.firstname}` : ''}`.toLowerCase()
                                    const reverseName =
                                      `${c.firstname || ''} ${c.surname}`
                                        .toLowerCase()
                                        .trim()
                                    return (
                                      fullName.includes(query) ||
                                      reverseName.includes(query)
                                    )
                                  })
                                  console.log(
                                    `Customer search results: ${filtered.length} matches`
                                  )

                                  if (filtered.length === 0) {
                                    return (
                                      <div className="px-3 py-2 text-sm text-gray-500">
                                        {query
                                          ? 'No customers found'
                                          : 'Type to search...'}
                                      </div>
                                    )
                                  }

                                  return filtered.slice(0, 10).map(c => (
                                    <button
                                      key={c.id}
                                      type="button"
                                      className="w-full px-3 py-2 text-left text-sm hover:bg-amber-50 focus:bg-amber-100 focus:outline-none"
                                      onClick={() => {
                                        setCustomerDeleteConfirm(prev =>
                                          prev
                                            ? {
                                                ...prev,
                                                migrateToCustomerId: c.id,
                                              }
                                            : null
                                        )
                                        setCustomerSearchQuery(
                                          `${c.surname}${c.firstname ? `, ${c.firstname}` : ''}`
                                        )
                                        setShowCustomerDropdown(false)
                                      }}
                                    >
                                      <span className="font-medium">
                                        {c.surname}
                                      </span>
                                      {c.firstname && (
                                        <span className="text-gray-600">
                                          , {c.firstname}
                                        </span>
                                      )}
                                    </button>
                                  ))
                                })()}
                              </div>
                            )}

                          {/* Selected customer indicator */}
                          {customerDeleteConfirm.migrateToCustomerId && (
                            <div className="mt-1 text-xs text-green-600">
                              ✓ Customer selected
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Warning if animals not selected for rehoming */}
                    {customerDeleteConfirm.animals.some(a => !a.selected) && (
                      <p className="mt-2 text-xs text-red-600">
                        <strong>Warning:</strong> Unchecked animals will be
                        permanently deleted with this customer.
                      </p>
                    )}

                    {/* Acknowledge deletion checkbox - shown when animals selected but not rehoming */}
                    {customerDeleteConfirm.animals.some(a => a.selected) &&
                      !customerDeleteConfirm.migrateToCustomerId && (
                        <div className="mt-4 rounded-lg border-2 border-red-300 bg-red-50 p-3">
                          <label className="flex cursor-pointer items-start gap-3">
                            <input
                              type="checkbox"
                              checked={
                                customerDeleteConfirm.acknowledgeDeleteAnimals
                              }
                              onChange={e =>
                                setCustomerDeleteConfirm(prev =>
                                  prev
                                    ? {
                                        ...prev,
                                        acknowledgeDeleteAnimals:
                                          e.target.checked,
                                      }
                                    : null
                                )
                              }
                              className="mt-0.5 h-5 w-5 rounded border-red-300 text-red-600 focus:ring-red-500"
                            />
                            <span className="text-sm font-medium text-red-800">
                              I understand that{' '}
                              <strong>
                                {
                                  customerDeleteConfirm.animals.filter(
                                    a => a.selected
                                  ).length
                                }{' '}
                                animal(s)
                              </strong>{' '}
                              will be <strong>permanently deleted</strong>{' '}
                              because I have not selected a customer to rehome
                              them to.
                            </span>
                          </label>
                        </div>
                      )}
                  </div>
                )}

                {/* Type to confirm */}
                <div className="mt-4">
                  <label
                    htmlFor="confirm-customer-name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    To confirm, type{' '}
                    <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-red-600">
                      {customerDeleteConfirm.name}
                    </code>{' '}
                    below:
                  </label>
                  <input
                    ref={customerDeleteInputRef}
                    id="confirm-customer-name"
                    type="text"
                    className="mt-2 w-full rounded-md border border-red-300 px-3 py-2 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                    placeholder={`Type "${customerDeleteConfirm.name}" to confirm`}
                    value={customerDeleteConfirm.typedName}
                    onChange={e =>
                      setCustomerDeleteConfirm(prev =>
                        prev ? { ...prev, typedName: e.target.value } : null
                      )
                    }
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>

                {/* Buttons */}
                <div className="mt-6 flex gap-3">
                  {(() => {
                    const selectedAnimals =
                      customerDeleteConfirm.animals.filter(a => a.selected)
                    const hasSelectedAnimals = selectedAnimals.length > 0
                    const needsMigrationOrAcknowledge =
                      hasSelectedAnimals &&
                      !customerDeleteConfirm.migrateToCustomerId &&
                      !customerDeleteConfirm.acknowledgeDeleteAnimals
                    const nameTyped =
                      customerDeleteConfirm.typedName ===
                      customerDeleteConfirm.name
                    const canDelete = nameTyped && !needsMigrationOrAcknowledge

                    return (
                      <button
                        className={`flex-1 rounded-lg px-4 py-2.5 font-medium transition-all ${
                          canDelete
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'cursor-not-allowed bg-gray-200 text-gray-400'
                        }`}
                        disabled={!canDelete}
                        onClick={confirmDeleteCustomer}
                      >
                        <span className="flex items-center justify-center gap-2">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                          </svg>
                          Delete Customer
                          {hasSelectedAnimals &&
                          customerDeleteConfirm.migrateToCustomerId
                            ? ` & Rehome ${selectedAnimals.length} Animal${selectedAnimals.length > 1 ? 's' : ''}`
                            : hasSelectedAnimals &&
                                customerDeleteConfirm.acknowledgeDeleteAnimals
                              ? ` & ${selectedAnimals.length} Animal${selectedAnimals.length > 1 ? 's' : ''}`
                              : ''}
                        </span>
                      </button>
                    )
                  })()}
                  <button
                    className="rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setCustomerDeleteConfirm(null)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Animal Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[400] flex items-start justify-center pt-24">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDeleteConfirm(null)}
          />
          <div
            className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl"
            style={{
              animation: 'slideInUp 0.2s ease-out',
              border: '2px solid #ef4444',
            }}
          >
            {deleteConfirm.loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-200 border-t-red-600" />
                <span className="ml-3 text-gray-600">
                  Checking for service notes...
                </span>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-full bg-red-100 p-3">
                    <svg
                      className="h-6 w-6 text-red-600"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-red-700">
                      Delete &quot;{deleteConfirm.name}&quot;?
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      This action <strong>cannot be undone</strong>.
                    </p>
                  </div>
                  <button
                    className="ml-auto text-gray-400 hover:text-gray-600"
                    onClick={() => setDeleteConfirm(null)}
                  >
                    <svg
                      className="h-6 w-6"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                  </button>
                </div>

                {/* Notes warning */}
                {(deleteConfirm.notesCount ?? 0) > 0 && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-center gap-2 text-amber-800">
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                      </svg>
                      <strong>
                        {deleteConfirm.notesCount} service note(s)
                      </strong>{' '}
                      will also be deleted
                    </div>
                    <p className="mt-2 text-sm text-amber-700">
                      All service history for this animal will be permanently
                      removed.
                    </p>
                  </div>
                )}

                {/* Type to confirm */}
                <div className="mt-4">
                  <label
                    htmlFor="confirm-animal-name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    To confirm, type{' '}
                    <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-red-600">
                      {deleteConfirm.name}
                    </code>{' '}
                    below:
                  </label>
                  <input
                    ref={deleteInputRef}
                    id="confirm-animal-name"
                    type="text"
                    className="mt-2 w-full rounded-md border border-red-300 px-3 py-2 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                    placeholder={`Type "${deleteConfirm.name}" to confirm`}
                    value={deleteConfirm.typedName}
                    onChange={e =>
                      setDeleteConfirm(prev =>
                        prev ? { ...prev, typedName: e.target.value } : null
                      )
                    }
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>

                {/* Buttons */}
                <div className="mt-6 flex gap-3">
                  <button
                    className={`flex-1 rounded-lg px-4 py-2.5 font-medium transition-all ${
                      deleteConfirm.typedName === deleteConfirm.name
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'cursor-not-allowed bg-gray-200 text-gray-400'
                    }`}
                    disabled={deleteConfirm.typedName !== deleteConfirm.name}
                    onClick={confirmDeleteAnimal}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                      </svg>
                      Delete Animal
                      {(deleteConfirm.notesCount ?? 0) > 0
                        ? ` & ${deleteConfirm.notesCount} Notes`
                        : ''}
                    </span>
                  </button>
                  <button
                    className="rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setDeleteConfirm(null)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Header
        onToggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        sidebarPinned={sidebarPinned}
        onSearch={() => {}}
        searchValue=""
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Customers', href: '/' },
          { label: customer.surname, current: true },
        ]}
      />

      <Sidebar
        isOpen={sidebarOpen}
        isPinned={sidebarPinned}
        onClose={() => setSidebarOpen(false)}
        onTogglePin={togglePin}
        currentPath={`/customer/${customerId}`}
        skipTransition={skipTransition}
      />

      <main
        className={`mt-6 mr-6 mb-6 flex-1 overflow-hidden rounded-2xl bg-white/95 p-6 shadow-xl backdrop-blur-[20px] ${
          skipTransition ? '' : 'transition-[margin-left] duration-[250ms]'
        }`}
        style={{
          marginLeft: sidebarPinned
            ? 'calc(var(--sidebar-width) + 1.5rem)'
            : '1.5rem',
        }}
      >
        <div className="content-wrapper">
          {/* Page Title */}
          <div className="page-title-section">
            <div>
              <h1>
                <span className="page-title-icon">👤</span>
                Customer Detail
              </h1>
              <p className="page-subtitle">
                Manage customer information and associated animals
              </p>
            </div>
          </div>

          {/* Two-Column Grid */}
          <div className="content-grid">
            {/* Main Column */}
            <div className="main-column">
              <CustomerInfoCard
                customer={customer}
                onUpdate={handleUpdateCustomer}
                onDelete={handleDeleteCustomer}
              />
            </div>

            {/* Sidebar Column */}
            <div className="sidebar-column">
              <AssociatedAnimalsCard
                animals={customer.animals}
                onAddAnimal={handleAddAnimal}
                onDeleteAnimal={handleDeleteAnimal}
                onClickAnimal={handleClickAnimal}
              />
              <CustomerStatsCard customer={customer} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
