'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCustomersStore } from '@/store/customersStore'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import CustomerHeader from '@/components/customer/CustomerHeader'
import CustomerInfoCard from '@/components/customer/CustomerInfoCard'
import AssociatedAnimalsCard from '@/components/customer/AssociatedAnimalsCard'
import ContactDetailsCard from '@/components/customer/ContactDetailsCard'
import CustomerStatsCard from '@/components/customer/CustomerStatsCard'
import QuickActionsCard from '@/components/customer/QuickActionsCard'

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
    deleteCustomer,
  } = useCustomersStore()

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
    } catch (error) {
      throw error
    }
  }

  const handleDeleteCustomer = async () => {
    const fullName =
      [customer.firstname, customer.surname].filter(Boolean).join(' ') ||
      customer.surname

    if (
      window.confirm(
        `Are you sure you want to delete customer "${fullName}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteCustomer(customerId)
        router.push('/')
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Failed to delete customer'
        alert(message)
      }
    }
  }

  const handleAddAnimal = () => {
    // Navigate to add animal page
    router.push(`/customer/${customerId}/newAnimal`)
  }

  const handleViewAnimals = () => {
    // Filter animals for this customer on main page
    router.push(`/?customer=${customerId}`)
  }

  const handleViewHistory = () => {
    // Navigate to customer history page (to be implemented)
    alert('Customer history feature coming soon!')
  }

  const handleClickAnimal = (animalId: number) => {
    router.push(`/animals/${animalId}`)
  }

  const handleDeleteAnimal = async (_animalId: number) => {
    // This would require an animal store method
    alert('Delete animal functionality to be implemented')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        onSearch={() => {}}
        searchValue=""
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Customers', href: '/' },
          { label: customer.surname, current: true },
        ]}
      />

      <Sidebar
        isOpen={sidebarOpen}
        isPinned={sidebarPinned}
        onClose={() => setSidebarOpen(false)}
        onTogglePin={() => setSidebarPinned(!sidebarPinned)}
        currentPath={`/customer/${customerId}`}
      />

      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarPinned ? 'ml-[var(--sidebar-width)]' : ''
        }`}
      >
        <div className="mx-auto max-w-[1400px] space-y-8 p-6">
          {/* Customer Header */}
          <CustomerHeader
            customer={customer}
            onEdit={() => {
              // Edit mode is handled within CustomerInfoCard
            }}
            onAddAnimal={handleAddAnimal}
            onViewHistory={handleViewHistory}
          />

          {/* Two-Column Grid */}
          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* Main Column */}
            <div className="space-y-8">
              <CustomerInfoCard
                customer={customer}
                onUpdate={handleUpdateCustomer}
              />
              <AssociatedAnimalsCard
                animals={customer.animals}
                onAddAnimal={handleAddAnimal}
                onDeleteAnimal={handleDeleteAnimal}
                onClickAnimal={handleClickAnimal}
              />
            </div>

            {/* Sidebar Column */}
            <div className="space-y-8">
              <ContactDetailsCard
                customer={customer}
                onEdit={() => {
                  // Edit mode is handled within CustomerInfoCard
                }}
              />
              <CustomerStatsCard customer={customer} />
              <QuickActionsCard
                customerId={customerId}
                onUpdateRecord={() => {
                  // Edit mode is handled within CustomerInfoCard
                }}
                onAddAnimal={handleAddAnimal}
                onViewAnimals={handleViewAnimals}
                onViewHistory={handleViewHistory}
                onDeleteCustomer={handleDeleteCustomer}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
