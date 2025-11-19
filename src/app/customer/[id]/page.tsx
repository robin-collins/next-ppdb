'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCustomersStore } from '@/store/customersStore'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import CustomerInfoCard from '@/components/customer/CustomerInfoCard'
import AssociatedAnimalsCard from '@/components/customer/AssociatedAnimalsCard'
import CustomerStatsCard from '@/components/customer/CustomerStatsCard'
import Toast from '@/components/Toast'

import ConfirmationModal from '@/components/ConfirmationModal'

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
    deleteAnimal,
  } = useCustomersStore()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarPinned, setSidebarPinned] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
    show: boolean
  }>({ message: '', type: 'info', show: false })

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    animalId: number | null
  }>({ isOpen: false, animalId: null })

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

  const handleDeleteAnimal = (animalId: number) => {
    setDeleteModal({ isOpen: true, animalId })
  }

  const confirmDeleteAnimal = async () => {
    if (deleteModal.animalId) {
      try {
        await deleteAnimal(deleteModal.animalId)
        setToast({
          message: 'Animal deleted successfully',
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
    setDeleteModal({ isOpen: false, animalId: null })
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

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, animalId: null })}
        onConfirm={confirmDeleteAnimal}
        title="Delete Animal"
        message="Are you sure you want to delete this animal? This action cannot be undone."
        confirmLabel="Delete"
        isDanger={true}
      />

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
              <CustomerStatsCard customer={customer} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
