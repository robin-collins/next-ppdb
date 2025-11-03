'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCustomersStore } from '@/store/customersStore'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

export default function CustomerAnimalsPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = parseInt(params.id as string)

  const { selectedCustomer, loading, fetchCustomer } = useCustomersStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarPinned, setSidebarPinned] = useState(false)

  useEffect(() => {
    if (customerId && !isNaN(customerId)) {
      fetchCustomer(customerId)
    }
  }, [customerId, fetchCustomer])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
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
        currentPath={`/customer/${customerId}/animals`}
      />

      <main
        className={`m-6 flex-1 transition-all duration-300 ${
          sidebarPinned ? 'ml-[calc(var(--sidebar-width)+1.5rem)]' : ''
        }`}
      >
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Page Header */}
          <div className="overflow-hidden rounded-2xl bg-white/95 p-6 shadow-xl backdrop-blur-[20px]">
            <div className="flex items-center justify-between">
              <div>
                <button
                  onClick={() => router.push(`/customer/${customerId}`)}
                  className="text-primary mb-2 text-sm hover:underline"
                >
                  ← Back to Customer Details
                </button>
                <h1 className="text-3xl font-bold text-gray-900">
                  Animals for {fullName}
                </h1>
                <p className="mt-1 text-gray-600">
                  {customer.animalCount} animal(s) registered
                </p>
              </div>
              <button
                onClick={() =>
                  router.push(`/animals/new?customerId=${customerId}`)
                }
                className="bg-success rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
              >
                + Add Animal
              </button>
            </div>
          </div>

          {/* Animals Grid */}
          {customer.animals.length === 0 ? (
            <div className="overflow-hidden rounded-2xl bg-white/95 p-12 text-center shadow-xl backdrop-blur-[20px]">
              <p className="text-lg text-gray-600">
                No animals registered for this customer.
              </p>
              <button
                onClick={() =>
                  router.push(`/animals/new?customerId=${customerId}`)
                }
                className="bg-primary hover:bg-primary-hover mt-4 rounded-lg px-6 py-2 text-white"
              >
                Add First Animal
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {customer.animals.map(animal => (
                <div
                  key={animal.id}
                  className="group cursor-pointer overflow-hidden rounded-2xl bg-white/95 shadow-xl backdrop-blur-[20px] transition-all hover:scale-[1.02] hover:shadow-2xl"
                  onClick={() => router.push(`/animals/${animal.id}`)}
                >
                  <div className="from-primary to-secondary bg-gradient-to-br p-6">
                    <h3 className="text-2xl font-bold text-white">
                      {animal.name}
                    </h3>
                    <p className="text-white/90">{animal.breed}</p>
                  </div>
                  <div className="p-6">
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">
                          Sex
                        </dt>
                        <dd className="text-sm text-gray-900">{animal.sex}</dd>
                      </div>
                      {animal.colour && (
                        <div className="flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">
                            Colour
                          </dt>
                          <dd className="text-sm text-gray-900">
                            {animal.colour}
                          </dd>
                        </div>
                      )}
                      {animal.lastVisit && (
                        <div className="flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">
                            Last Visit
                          </dt>
                          <dd className="text-sm text-gray-900">
                            {new Date(animal.lastVisit).toLocaleDateString()}
                          </dd>
                        </div>
                      )}
                    </dl>
                    <button className="group-hover:bg-primary mt-4 w-full rounded-lg bg-gray-100 py-2 text-sm font-semibold text-gray-700 transition-colors group-hover:text-white">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
