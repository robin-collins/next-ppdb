'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSidebarState } from '@/hooks/useSidebarState'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

type ValidationDetail = {
  path?: string[]
  message: string
}

export default function AddCustomerPage() {
  const router = useRouter()
  const {
    sidebarOpen,
    sidebarPinned,
    skipTransition,
    setSidebarOpen,
    toggleSidebar,
    togglePin,
  } = useSidebarState()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    firstname: '',
    surname: '',
    address: '',
    suburb: '',
    postcode: '',
    phone1: '',
    phone2: '',
    phone3: '',
    email: '',
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})
    setSuccessMessage('')

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle validation errors
        if (data.details && Array.isArray(data.details)) {
          const newErrors: Record<string, string> = {}
          data.details.forEach((detail: ValidationDetail) => {
            if (detail.path && detail.path.length > 0) {
              newErrors[detail.path[0]] = detail.message
            }
          })
          setErrors(newErrors)
        } else {
          setErrors({ general: data.error || 'Failed to create customer' })
        }
        return
      }

      // Success!
      setSuccessMessage(
        `Customer "${data.firstname || ''} ${data.surname}" created successfully!`
      )

      // Reset form
      setFormData({
        firstname: '',
        surname: '',
        address: '',
        suburb: '',
        postcode: '',
        phone1: '',
        phone2: '',
        phone3: '',
        email: '',
      })

      // Redirect to customer detail page after a short delay
      setTimeout(() => {
        router.push(`/customer/${data.id}`)
      }, 1500)
    } catch (error) {
      console.error('Error creating customer:', error)
      setErrors({
        general: 'An unexpected error occurred. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClear = () => {
    setFormData({
      firstname: '',
      surname: '',
      address: '',
      suburb: '',
      postcode: '',
      phone1: '',
      phone2: '',
      phone3: '',
      email: '',
    })
    setErrors({})
    setSuccessMessage('')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        onToggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        sidebarPinned={sidebarPinned}
        onSearch={() => {}}
        searchValue=""
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Add Customer', current: true },
        ]}
      />

      <Sidebar
        isOpen={sidebarOpen}
        isPinned={sidebarPinned}
        onClose={() => setSidebarOpen(false)}
        onTogglePin={togglePin}
        currentPath="/customers/add"
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
          <div
            className="content-wrapper"
            style={{
              paddingLeft: '48px',
              paddingRight: '48px',
              paddingTop: '36px',
              paddingBottom: '36px',
            }}
          >
            {/* Page Header */}
            <div
              style={{
                marginBottom: '36px',
                paddingLeft: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <h1
                className="text-[2.5rem] leading-tight font-extrabold text-gray-900"
                style={{ margin: 0 }}
              >
                Add Customer
              </h1>
              <p className="text-lg text-gray-600" style={{ margin: 0 }}>
                Create a new customer record in the database
              </p>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div
                className="animate-[slideInUp_0.4s_ease-out] rounded-xl border border-green-200 bg-green-50"
                style={{
                  marginBottom: '24px',
                  paddingLeft: '24px',
                  paddingRight: '24px',
                  paddingTop: '18px',
                  paddingBottom: '18px',
                }}
              >
                <div className="flex items-center gap-3">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <p className="font-semibold text-green-800">
                    {successMessage}
                  </p>
                </div>
              </div>
            )}

            {/* General Error Message */}
            {errors.general && (
              <div
                className="animate-[slideInUp_0.4s_ease-out] rounded-xl border border-red-200 bg-red-50"
                style={{
                  marginBottom: '24px',
                  paddingLeft: '24px',
                  paddingRight: '24px',
                  paddingTop: '18px',
                  paddingBottom: '18px',
                }}
              >
                <div className="flex items-center gap-3">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <p className="font-semibold text-red-800">{errors.general}</p>
                </div>
              </div>
            )}

            {/* Form Card */}
            <div className="card animate-[slideInUp_0.4s_ease-out] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div
                className="card-header flex items-center justify-between border-b border-gray-200 bg-gray-50"
                style={{
                  paddingLeft: '30px',
                  paddingRight: '30px',
                  paddingTop: '24px',
                  paddingBottom: '24px',
                }}
              >
                <h2 className="card-title m-0 flex items-center gap-3 text-xl font-bold text-gray-900">
                  <svg
                    className="h-5 w-5 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Customer Information
                </h2>
              </div>

              <div
                className="card-content"
                style={{
                  paddingLeft: '30px',
                  paddingRight: '30px',
                  paddingTop: '24px',
                  paddingBottom: '24px',
                }}
              >
                <form onSubmit={handleSubmit}>
                  <div
                    className="form-grid grid grid-cols-1 gap-8 md:grid-cols-2"
                    style={{ marginBottom: '30px' }}
                  >
                    {/* Firstname */}
                    <div className="form-group flex flex-col gap-3">
                      <label
                        htmlFor="firstname"
                        className="form-label text-sm font-semibold text-gray-700"
                        style={{ marginBottom: '6px' }}
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstname"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleInputChange}
                        style={{
                          paddingLeft: '18px',
                          paddingRight: '18px',
                          paddingTop: '15px',
                          paddingBottom: '15px',
                        }}
                        className={`form-input rounded-lg border-2 bg-white text-base transition-all ${
                          errors.firstname
                            ? 'border-red-500'
                            : 'border-gray-200 focus:border-indigo-600 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] focus:outline-none'
                        }`}
                        placeholder="Enter first name"
                        maxLength={20}
                      />
                      {errors.firstname && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.firstname}
                        </p>
                      )}
                    </div>

                    {/* Surname */}
                    <div className="form-group flex flex-col gap-3">
                      <label
                        htmlFor="surname"
                        className="form-label mb-1 text-sm font-semibold text-gray-700"
                      >
                        Surname <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="surname"
                        name="surname"
                        value={formData.surname}
                        onChange={handleInputChange}
                        style={{
                          paddingLeft: '18px',
                          paddingRight: '18px',
                          paddingTop: '15px',
                          paddingBottom: '15px',
                        }}
                        className={`form-input rounded-lg border-2 bg-white text-base transition-all ${
                          errors.surname
                            ? 'border-red-500'
                            : 'border-gray-200 focus:border-indigo-600 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] focus:outline-none'
                        }`}
                        placeholder="Enter surname"
                        required
                        maxLength={20}
                      />
                      {errors.surname && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.surname}
                        </p>
                      )}
                    </div>

                    {/* Address */}
                    <div className="form-group col-span-1 flex flex-col gap-3 md:col-span-2">
                      <label
                        htmlFor="address"
                        className="form-label mb-1 text-sm font-semibold text-gray-700"
                      >
                        Address
                      </label>
                      <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        style={{
                          paddingLeft: '18px',
                          paddingRight: '18px',
                          paddingTop: '15px',
                          paddingBottom: '15px',
                          minHeight: '120px',
                        }}
                        className={`form-textarea resize-vertical rounded-lg border-2 bg-white text-base transition-all ${
                          errors.address
                            ? 'border-red-500'
                            : 'border-gray-200 focus:border-indigo-600 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] focus:outline-none'
                        }`}
                        placeholder="Enter street address"
                        maxLength={50}
                        rows={3}
                      />
                      {errors.address && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.address}
                        </p>
                      )}
                    </div>

                    {/* Suburb */}
                    <div className="form-group flex flex-col gap-3">
                      <label
                        htmlFor="suburb"
                        className="form-label mb-1 text-sm font-semibold text-gray-700"
                      >
                        Suburb
                      </label>
                      <input
                        type="text"
                        id="suburb"
                        name="suburb"
                        value={formData.suburb}
                        onChange={handleInputChange}
                        style={{
                          paddingLeft: '18px',
                          paddingRight: '18px',
                          paddingTop: '15px',
                          paddingBottom: '15px',
                        }}
                        className={`form-input rounded-lg border-2 bg-white text-base transition-all ${
                          errors.suburb
                            ? 'border-red-500'
                            : 'border-gray-200 focus:border-indigo-600 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] focus:outline-none'
                        }`}
                        placeholder="Enter suburb"
                        maxLength={20}
                      />
                      {errors.suburb && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.suburb}
                        </p>
                      )}
                    </div>

                    {/* Postcode */}
                    <div className="form-group flex flex-col gap-3">
                      <label
                        htmlFor="postcode"
                        className="form-label mb-1 text-sm font-semibold text-gray-700"
                      >
                        Postcode
                      </label>
                      <input
                        type="text"
                        id="postcode"
                        name="postcode"
                        value={formData.postcode}
                        onChange={handleInputChange}
                        style={{
                          paddingLeft: '18px',
                          paddingRight: '18px',
                          paddingTop: '15px',
                          paddingBottom: '15px',
                        }}
                        className={`form-input rounded-lg border-2 bg-white text-base transition-all ${
                          errors.postcode
                            ? 'border-red-500'
                            : 'border-gray-200 focus:border-indigo-600 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] focus:outline-none'
                        }`}
                        placeholder="Enter postcode (e.g., 3000)"
                        maxLength={4}
                        pattern="[0-9]*"
                      />
                      {errors.postcode && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.postcode}
                        </p>
                      )}
                    </div>

                    {/* Phone1 */}
                    <div className="form-group flex flex-col gap-3">
                      <label
                        htmlFor="phone1"
                        className="form-label mb-1 text-sm font-semibold text-gray-700"
                      >
                        Phone 1
                      </label>
                      <input
                        type="tel"
                        id="phone1"
                        name="phone1"
                        value={formData.phone1}
                        onChange={handleInputChange}
                        style={{
                          paddingLeft: '18px',
                          paddingRight: '18px',
                          paddingTop: '15px',
                          paddingBottom: '15px',
                        }}
                        className={`form-input rounded-lg border-2 bg-white text-base transition-all ${
                          errors.phone1
                            ? 'border-red-500'
                            : 'border-gray-200 focus:border-indigo-600 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] focus:outline-none'
                        }`}
                        placeholder="Primary phone number"
                        maxLength={10}
                      />
                      {errors.phone1 && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.phone1}
                        </p>
                      )}
                    </div>

                    {/* Phone2 */}
                    <div className="form-group flex flex-col gap-3">
                      <label
                        htmlFor="phone2"
                        className="form-label mb-1 text-sm font-semibold text-gray-700"
                      >
                        Phone 2
                      </label>
                      <input
                        type="tel"
                        id="phone2"
                        name="phone2"
                        value={formData.phone2}
                        onChange={handleInputChange}
                        style={{
                          paddingLeft: '18px',
                          paddingRight: '18px',
                          paddingTop: '15px',
                          paddingBottom: '15px',
                        }}
                        className={`form-input rounded-lg border-2 bg-white text-base transition-all ${
                          errors.phone2
                            ? 'border-red-500'
                            : 'border-gray-200 focus:border-indigo-600 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] focus:outline-none'
                        }`}
                        placeholder="Secondary phone number"
                        maxLength={10}
                      />
                      {errors.phone2 && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.phone2}
                        </p>
                      )}
                    </div>

                    {/* Phone3 */}
                    <div className="form-group flex flex-col gap-3">
                      <label
                        htmlFor="phone3"
                        className="form-label mb-1 text-sm font-semibold text-gray-700"
                      >
                        Phone 3
                      </label>
                      <input
                        type="tel"
                        id="phone3"
                        name="phone3"
                        value={formData.phone3}
                        onChange={handleInputChange}
                        style={{
                          paddingLeft: '18px',
                          paddingRight: '18px',
                          paddingTop: '15px',
                          paddingBottom: '15px',
                        }}
                        className={`form-input rounded-lg border-2 bg-white text-base transition-all ${
                          errors.phone3
                            ? 'border-red-500'
                            : 'border-gray-200 focus:border-indigo-600 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] focus:outline-none'
                        }`}
                        placeholder="Tertiary phone number"
                        maxLength={10}
                      />
                      {errors.phone3 && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.phone3}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="form-group flex flex-col gap-3">
                      <label
                        htmlFor="email"
                        className="form-label mb-1 text-sm font-semibold text-gray-700"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        style={{
                          paddingLeft: '18px',
                          paddingRight: '18px',
                          paddingTop: '15px',
                          paddingBottom: '15px',
                        }}
                        className={`form-input rounded-lg border-2 bg-white text-base transition-all ${
                          errors.email
                            ? 'border-red-500'
                            : 'border-gray-200 focus:border-indigo-600 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] focus:outline-none'
                        }`}
                        placeholder="customer@example.com"
                        maxLength={200}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div
                    className="flex flex-wrap items-center gap-4 border-t border-gray-200"
                    style={{ paddingTop: '30px' }}
                  >
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-primary flex items-center justify-center gap-2 rounded-xl border-0 bg-indigo-600 text-base font-semibold text-white transition-all hover:-translate-y-px hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                      style={{
                        paddingLeft: '24px',
                        paddingRight: '24px',
                        paddingTop: '15px',
                        paddingBottom: '15px',
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="h-4 w-4 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Creating...
                        </>
                      ) : (
                        <>
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          Insert Record
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleClear}
                      disabled={isSubmitting}
                      className="btn btn-secondary flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-gray-100 text-base font-semibold text-gray-700 transition-all hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                      style={{
                        paddingLeft: '24px',
                        paddingRight: '24px',
                        paddingTop: '15px',
                        paddingBottom: '15px',
                      }}
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Clear Form
                    </button>

                    <button
                      type="button"
                      onClick={() => router.push('/')}
                      disabled={isSubmitting}
                      className="btn btn-secondary flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-gray-100 text-base font-semibold text-gray-700 transition-all hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                      style={{
                        paddingLeft: '24px',
                        paddingRight: '24px',
                        paddingTop: '15px',
                        paddingBottom: '15px',
                      }}
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                      </svg>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Help Text */}
            <div
              className="rounded-lg border border-blue-200 bg-blue-50"
              style={{
                marginTop: '24px',
                paddingLeft: '24px',
                paddingRight: '24px',
                paddingTop: '18px',
                paddingBottom: '18px',
              }}
            >
              <div className="flex gap-3">
                <svg
                  className="h-5 w-5 flex-shrink-0 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="mb-1 font-semibold">Tips:</p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>Surname is required</li>
                    <li>Phone numbers will be automatically normalized</li>
                    <li>
                      Postcode should be a 4-digit number (e.g., 3000 for
                      Melbourne)
                    </li>
                    <li>
                      After creating, you&apos;ll be redirected to the customer
                      detail page
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
