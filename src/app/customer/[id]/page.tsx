'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCustomersStore } from '@/store/customersStore'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = parseInt(params.id as string)

  const { selectedCustomer, loading, error, fetchCustomer } =
    useCustomersStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarPinned, setSidebarPinned] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (customerId && !isNaN(customerId)) {
      fetchCustomer(customerId)
    }
  }, [customerId, fetchCustomer])

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
  const fullName =
    [customer.firstname, customer.surname].filter(Boolean).join(' ') ||
    customer.surname

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        onSearch={() => {}}
        searchValue=""
      />

      <Sidebar
        isOpen={sidebarOpen}
        isPinned={sidebarPinned}
        onClose={() => setSidebarOpen(false)}
        onTogglePin={() => setSidebarPinned(!sidebarPinned)}
        currentPath={`/customer/${customerId}`}
      />

      <main
        className={`m-6 flex-1 transition-all duration-300 ${
          sidebarPinned ? 'ml-[calc(var(--sidebar-width)+1.5rem)]' : ''
        }`}
      >
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Customer Header */}
          <div className="overflow-hidden rounded-2xl bg-white/95 p-8 shadow-xl backdrop-blur-[20px]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="from-primary to-secondary flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br text-3xl font-bold text-white">
                  {fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">
                    {fullName}
                  </h1>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>
                      <strong>Phone:</strong> {customer.phone1 || 'N/A'}
                    </span>
                    <span>
                      <strong>Animals:</strong> {customer.animalCount}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-primary hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
                >
                  {isEditing ? 'Cancel' : 'Edit Customer'}
                </button>
                <button
                  onClick={() => router.push(`/customer/${customerId}/animals`)}
                  className="bg-secondary hover:bg-secondary-hover rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
                >
                  View Animals
                </button>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl bg-white/95 shadow-xl backdrop-blur-[20px]">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Contact Information
                </h2>
              </div>
              <div className="p-6">
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-base text-gray-900">
                      {customer.email || 'Not provided'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Phone 1
                    </dt>
                    <dd className="mt-1 text-base text-gray-900">
                      {customer.phone1 || 'Not provided'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Phone 2
                    </dt>
                    <dd className="mt-1 text-base text-gray-900">
                      {customer.phone2 || 'Not provided'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Phone 3
                    </dt>
                    <dd className="mt-1 text-base text-gray-900">
                      {customer.phone3 || 'Not provided'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl bg-white/95 shadow-xl backdrop-blur-[20px]">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <h2 className="text-xl font-bold text-gray-900">Address</h2>
              </div>
              <div className="p-6">
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Street Address
                    </dt>
                    <dd className="mt-1 text-base text-gray-900">
                      {customer.address || 'Not provided'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Suburb
                    </dt>
                    <dd className="mt-1 text-base text-gray-900">
                      {customer.suburb || 'Not provided'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Postcode
                    </dt>
                    <dd className="mt-1 text-base text-gray-900">
                      {customer.postcode || 'Not provided'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Animals List */}
          <div className="overflow-hidden rounded-2xl bg-white/95 shadow-xl backdrop-blur-[20px]">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900">
                Animals ({customer.animalCount})
              </h2>
            </div>
            <div className="p-6">
              {customer.animals.length === 0 ? (
                <p className="text-gray-600">
                  No animals registered for this customer.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {customer.animals.map(animal => (
                    <div
                      key={animal.id}
                      className="hover:border-primary cursor-pointer rounded-lg border border-gray-200 p-4 transition-all hover:shadow-md"
                      onClick={() => router.push(`/animals/${animal.id}`)}
                    >
                      <h3 className="text-lg font-semibold text-gray-900">
                        {animal.name}
                      </h3>
                      <p className="text-sm text-gray-600">{animal.breed}</p>
                      <p className="text-sm text-gray-500">{animal.sex}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
