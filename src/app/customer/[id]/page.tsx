'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCustomersStore } from '@/store/customersStore'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import CustomerInfoCard from '@/components/customer/CustomerInfoCard'
import AssociatedAnimalsCard from '@/components/customer/AssociatedAnimalsCard'

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
          { label: 'Home', href: '/' },
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

      <main className={`main-content ${sidebarPinned ? 'sidebar-pinned' : ''}`}>
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
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
