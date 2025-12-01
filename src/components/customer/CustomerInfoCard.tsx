'use client'

import { useState, useCallback } from 'react'
import { getEmailValidationError } from '@/lib/validations/customer'

// Field error state interface
interface FieldErrors {
  [key: string]: string | null
}

interface CustomerInfoCardProps {
  customer: {
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
  }
  onUpdate?: (data: Partial<CustomerInfoCardProps['customer']>) => Promise<void>
  onDelete?: () => Promise<void>
}

export default function CustomerInfoCard({
  customer,
  onUpdate,
  onDelete,
}: CustomerInfoCardProps) {
  const [formData, setFormData] = useState({
    firstname: customer.firstname || '',
    surname: customer.surname || '',
    address: customer.address || '',
    suburb: customer.suburb || '',
    postcode: customer.postcode || '',
    phone1: customer.phone1 || '',
    phone2: customer.phone2 || '',
    phone3: customer.phone3 || '',
    email: customer.email || '',
  })

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validate a single field and return error message or null
  const validateField = useCallback(
    (name: string, value: string): string | null => {
      switch (name) {
        case 'email':
          return getEmailValidationError(value)
        case 'surname':
          if (!value || value.trim() === '') {
            return 'Surname is required'
          }
          if (value.length > 20) {
            return 'Surname cannot exceed 20 characters'
          }
          return null
        case 'firstname':
          if (value.length > 20) {
            return 'First name cannot exceed 20 characters'
          }
          return null
        case 'phone1':
        case 'phone2':
        case 'phone3': {
          if (!value || value.trim() === '') return null
          // Strip formatting characters for validation
          const digitsOnly = value.replace(/[\s\-()]/g, '')
          if (!/^\d+$/.test(digitsOnly)) {
            return 'Phone must contain only digits'
          }
          if (digitsOnly.length > 11) {
            return 'Phone number cannot exceed 11 digits'
          }
          return null
        }
        case 'postcode': {
          if (!value || value.trim() === '') return null
          if (!/^\d{4}$/.test(value)) {
            return 'Postcode must be exactly 4 digits'
          }
          return null
        }
        default:
          return null
      }
    },
    []
  )

  // Validate all fields and return true if valid
  const validateAllFields = useCallback((): boolean => {
    const errors: FieldErrors = {}
    let isValid = true

    // Validate each field
    Object.entries(formData).forEach(([name, value]) => {
      const error = validateField(name, value)
      if (error) {
        errors[name] = error
        isValid = false
      }
    })

    setFieldErrors(errors)
    return isValid
  }, [formData, validateField])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target

    // For phone fields, only allow digits (max 11)
    if (['phone1', 'phone2', 'phone3'].includes(name)) {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 11)
      setFormData(prev => ({ ...prev, [name]: digitsOnly }))
    }
    // For postcode, only allow digits (max 4)
    else if (name === 'postcode') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 4)
      setFormData(prev => ({ ...prev, [name]: digitsOnly }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: null,
      }))
    }
  }

  // Validate on blur for immediate feedback
  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    const error = validateField(name, value)
    setFieldErrors(prev => ({
      ...prev,
      [name]: error,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields before submitting
    if (!validateAllFields()) {
      return // Don't submit if validation fails
    }

    if (onUpdate) {
      setIsSubmitting(true)
      try {
        await onUpdate(formData)
      } catch (error) {
        // Handle server-side validation errors
        if (error instanceof Error) {
          // Check if error message contains field-specific info
          const serverError = error as Error & {
            fieldErrors?: Record<string, string>
          }
          if (serverError.fieldErrors) {
            setFieldErrors(prev => ({
              ...prev,
              ...serverError.fieldErrors,
            }))
          }
        }
        throw error
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  // Helper to get input class based on error state
  const getInputClassName = (fieldName: string) => {
    const baseClass =
      'w-full rounded-lg border-2 px-4 py-3 text-base transition-all focus:ring-4 focus:outline-none'
    const hasError = fieldErrors[fieldName]
    return hasError
      ? `${baseClass} border-red-500 focus:border-red-500 focus:ring-red-100`
      : `${baseClass} border-gray-200 focus:border-[var(--primary)] focus:ring-[rgba(217,148,74,0.1)]`
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <svg
            className="card-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            ></path>
          </svg>
          Customer Information
        </h2>
      </div>
      <div className="card-content">
        <form id="customerForm" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* First Name */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-semibold text-gray-700"
                htmlFor="firstname"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstname"
                name="firstname"
                className={getInputClassName('firstname')}
                placeholder="Enter first name"
                value={formData.firstname}
                onChange={handleInputChange}
                onBlur={handleBlur}
                maxLength={20}
              />
              {fieldErrors.firstname && (
                <span className="text-sm text-red-600">
                  {fieldErrors.firstname}
                </span>
              )}
            </div>

            {/* Surname */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-semibold text-gray-700"
                htmlFor="surname"
              >
                Surname *
              </label>
              <input
                type="text"
                id="surname"
                name="surname"
                className={getInputClassName('surname')}
                placeholder="Enter surname"
                value={formData.surname}
                onChange={handleInputChange}
                onBlur={handleBlur}
                maxLength={20}
                required
              />
              {fieldErrors.surname && (
                <span className="text-sm text-red-600">
                  {fieldErrors.surname}
                </span>
              )}
            </div>

            {/* Address */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label
                className="text-sm font-semibold text-gray-700"
                htmlFor="address"
              >
                Address
              </label>
              <textarea
                id="address"
                name="address"
                className="min-h-[100px] w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-base transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[rgba(217,148,74,0.1)] focus:outline-none"
                placeholder="Enter street address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>

            {/* Suburb */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-semibold text-gray-700"
                htmlFor="suburb"
              >
                Suburb
              </label>
              <input
                type="text"
                id="suburb"
                name="suburb"
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-base transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[rgba(217,148,74,0.1)] focus:outline-none"
                placeholder="Enter suburb/city"
                value={formData.suburb}
                onChange={handleInputChange}
              />
            </div>

            {/* Postcode */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-semibold text-gray-700"
                htmlFor="postcode"
              >
                Postcode
              </label>
              <input
                type="text"
                id="postcode"
                name="postcode"
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-base transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[rgba(217,148,74,0.1)] focus:outline-none"
                placeholder="4 digits (e.g., 3000)"
                value={formData.postcode}
                onChange={handleInputChange}
                onBlur={handleBlur}
                maxLength={4}
              />
              {fieldErrors.postcode && (
                <span className="text-sm text-red-600">
                  {fieldErrors.postcode}
                </span>
              )}
            </div>

            {/* Phone 1 */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-semibold text-gray-700"
                htmlFor="phone1"
              >
                Phone 1
              </label>
              <input
                type="tel"
                id="phone1"
                name="phone1"
                className={getInputClassName('phone1')}
                placeholder="Enter primary phone"
                value={formData.phone1}
                onChange={handleInputChange}
                onBlur={handleBlur}
              />
              {fieldErrors.phone1 && (
                <span className="text-sm text-red-600">
                  {fieldErrors.phone1}
                </span>
              )}
            </div>

            {/* Phone 2 */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-semibold text-gray-700"
                htmlFor="phone2"
              >
                Phone 2
              </label>
              <input
                type="tel"
                id="phone2"
                name="phone2"
                className={getInputClassName('phone2')}
                placeholder="Enter secondary phone"
                value={formData.phone2}
                onChange={handleInputChange}
                onBlur={handleBlur}
              />
              {fieldErrors.phone2 && (
                <span className="text-sm text-red-600">
                  {fieldErrors.phone2}
                </span>
              )}
            </div>

            {/* Phone 3 */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-semibold text-gray-700"
                htmlFor="phone3"
              >
                Phone 3
              </label>
              <input
                type="tel"
                id="phone3"
                name="phone3"
                className={getInputClassName('phone3')}
                placeholder="Enter tertiary phone"
                value={formData.phone3}
                onChange={handleInputChange}
                onBlur={handleBlur}
              />
              {fieldErrors.phone3 && (
                <span className="text-sm text-red-600">
                  {fieldErrors.phone3}
                </span>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-semibold text-gray-700"
                htmlFor="email"
              >
                Email
              </label>
              <input
                type="text"
                id="email"
                name="email"
                className={getInputClassName('email')}
                placeholder="Enter email address (e.g., name@example.com)"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                maxLength={200}
              />
              {fieldErrors.email && (
                <span className="text-sm text-red-600">
                  {fieldErrors.email}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3 border-t border-gray-200 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all ${
                isSubmitting
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:-translate-y-px hover:shadow-md'
              }`}
              style={{ background: 'var(--primary)' }}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
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
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  Update Record
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-px hover:shadow-md"
              style={{ background: 'var(--error)' }}
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
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
              Delete Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
