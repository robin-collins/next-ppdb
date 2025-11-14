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
}

export default function CustomerInfoCard({
  customer,
  onUpdate,
}: CustomerInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
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

  const handleSave = async () => {
    if (!onUpdate) return

    setIsSaving(true)
    try {
      await onUpdate(formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update customer:', error)
      alert('Failed to update customer. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
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
    setIsEditing(false)
  }

  return (
    <div className="card overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
        <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900">
          <svg
            className="h-5 w-5 text-indigo-600"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
          Customer Information
        </h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 rounded-lg bg-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-300"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--primary)' }}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* First Name */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              First Name
            </label>
            <input
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleInputChange}
              readOnly={!isEditing}
              placeholder="Not provided"
              className={`w-full rounded-lg border-2 px-4 py-3 text-base transition-all ${
                isEditing
                  ? 'border-gray-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 focus:outline-none'
                  : 'border-transparent bg-gray-50'
              } ${!formData.firstname && !isEditing ? 'text-gray-500 italic' : 'text-gray-900'}`}
            />
          </div>

          {/* Surname */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Surname
            </label>
            <input
              type="text"
              name="surname"
              value={formData.surname}
              onChange={handleInputChange}
              readOnly={!isEditing}
              placeholder="Not provided"
              className={`w-full rounded-lg border-2 px-4 py-3 text-base transition-all ${
                isEditing
                  ? 'border-gray-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 focus:outline-none'
                  : 'border-transparent bg-gray-50'
              } ${!formData.surname && !isEditing ? 'text-gray-500 italic' : 'text-gray-900'}`}
            />
          </div>

          {/* Address - Full Width */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              readOnly={!isEditing}
              placeholder="No address provided"
              rows={2}
              className={`w-full rounded-lg border-2 px-4 py-3 text-base transition-all ${
                isEditing
                  ? 'border-gray-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 focus:outline-none'
                  : 'border-transparent bg-gray-50'
              } ${!formData.address && !isEditing ? 'text-gray-500 italic' : 'text-gray-900'}`}
            />
          </div>

          {/* Suburb */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Suburb
            </label>
            <input
              type="text"
              name="suburb"
              value={formData.suburb}
              onChange={handleInputChange}
              readOnly={!isEditing}
              placeholder="Not provided"
              className={`w-full rounded-lg border-2 px-4 py-3 text-base transition-all ${
                isEditing
                  ? 'border-gray-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 focus:outline-none'
                  : 'border-transparent bg-gray-50'
              } ${!formData.suburb && !isEditing ? 'text-gray-500 italic' : 'text-gray-900'}`}
            />
          </div>

          {/* Postcode */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Postcode
            </label>
            <input
              type="text"
              name="postcode"
              value={formData.postcode}
              onChange={handleInputChange}
              readOnly={!isEditing}
              placeholder="Not provided"
              className={`w-full rounded-lg border-2 px-4 py-3 text-base transition-all ${
                isEditing
                  ? 'border-gray-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 focus:outline-none'
                  : 'border-transparent bg-gray-50'
              } ${!formData.postcode && !isEditing ? 'text-gray-500 italic' : 'text-gray-900'}`}
            />
          </div>

          {/* Phone 1 */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Phone 1
            </label>
            <input
              type="tel"
              name="phone1"
              value={formData.phone1}
              onChange={handleInputChange}
              readOnly={!isEditing}
              placeholder="Not provided"
              className={`w-full rounded-lg border-2 px-4 py-3 text-base transition-all ${
                isEditing
                  ? 'border-gray-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 focus:outline-none'
                  : 'border-transparent bg-gray-50'
              } ${!formData.phone1 && !isEditing ? 'text-gray-500 italic' : 'text-gray-900'}`}
            />
          </div>

          {/* Phone 2 */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Phone 2
            </label>
            <input
              type="tel"
              name="phone2"
              value={formData.phone2}
              onChange={handleInputChange}
              readOnly={!isEditing}
              placeholder="Not provided"
              className={`w-full rounded-lg border-2 px-4 py-3 text-base transition-all ${
                isEditing
                  ? 'border-gray-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 focus:outline-none'
                  : 'border-transparent bg-gray-50'
              } ${!formData.phone2 && !isEditing ? 'text-gray-500 italic' : 'text-gray-900'}`}
            />
          </div>

          {/* Phone 3 */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Phone 3
            </label>
            <input
              type="tel"
              name="phone3"
              value={formData.phone3}
              onChange={handleInputChange}
              readOnly={!isEditing}
              placeholder="Not provided"
              className={`w-full rounded-lg border-2 px-4 py-3 text-base transition-all ${
                isEditing
                  ? 'border-gray-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 focus:outline-none'
                  : 'border-transparent bg-gray-50'
              } ${!formData.phone3 && !isEditing ? 'text-gray-500 italic' : 'text-gray-900'}`}
            />
          </div>

          {/* Email - Full Width */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              readOnly={!isEditing}
              placeholder="No email provided"
              className={`w-full rounded-lg border-2 px-4 py-3 text-base transition-all ${
                isEditing
                  ? 'border-gray-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 focus:outline-none'
                  : 'border-transparent bg-gray-50'
              } ${!formData.email && !isEditing ? 'text-gray-500 italic' : 'text-gray-900'}`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
