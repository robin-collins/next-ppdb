'use client'

import { useState } from 'react'

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (onUpdate) {
      await onUpdate(formData)
      alert('Customer record updated successfully!')
    }
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
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-base transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[rgba(217,148,74,0.1)] focus:outline-none"
                placeholder="Enter first name"
                value={formData.firstname}
                onChange={handleInputChange}
              />
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
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-base transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[rgba(217,148,74,0.1)] focus:outline-none"
                placeholder="Enter surname"
                value={formData.surname}
                onChange={handleInputChange}
                required
              />
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
                placeholder="Enter postcode"
                value={formData.postcode}
                onChange={handleInputChange}
              />
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
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-base transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[rgba(217,148,74,0.1)] focus:outline-none"
                placeholder="Enter primary phone"
                value={formData.phone1}
                onChange={handleInputChange}
              />
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
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-base transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[rgba(217,148,74,0.1)] focus:outline-none"
                placeholder="Enter secondary phone"
                value={formData.phone2}
                onChange={handleInputChange}
              />
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
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-base transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[rgba(217,148,74,0.1)] focus:outline-none"
                placeholder="Enter tertiary phone"
                value={formData.phone3}
                onChange={handleInputChange}
              />
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
                type="email"
                id="email"
                name="email"
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-base transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[rgba(217,148,74,0.1)] focus:outline-none"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3 border-t border-gray-200 pt-6">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-px hover:shadow-md"
              style={{ background: 'var(--primary)' }}
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
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              Update Record
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
