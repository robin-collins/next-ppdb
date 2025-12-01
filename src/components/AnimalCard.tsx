'use client'

import { useRouter } from 'next/navigation'
import AnimalAvatar from './AnimalAvatar'

interface Animal {
  id: number
  name: string
  breed: string
  colour: string | null
  customer: {
    id: number
    surname: string
    firstname?: string | null
    address?: string | null
    suburb?: string | null
    postcode?: number | null
    phone1?: string | null
    phone2?: string | null
    phone3?: string | null
    email?: string | null
  }
  lastVisit: Date
  cost: number
  relevanceScore?: number
}

interface AnimalCardProps {
  animal: Animal
  onClick: (id: number) => void
}

// Format phone number with spaces for readability: 0412345678 -> 0412 345 678
function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
  }
  if (digits.length === 8) {
    return `${digits.slice(0, 4)} ${digits.slice(4)}`
  }
  return phone
}

export default function AnimalCard({ animal, onClick }: AnimalCardProps) {
  const router = useRouter()
  const formattedDate = new Date(animal.lastVisit).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  })

  // Get first available phone number (filter out "Unknown" and empty values)
  const isValidPhone = (phone: string | null | undefined): phone is string => {
    if (!phone) return false
    const trimmed = phone.trim().toLowerCase()
    return trimmed !== '' && trimmed !== 'unknown' && trimmed !== '0'
  }

  const primaryPhone = isValidPhone(animal.customer.phone1)
    ? animal.customer.phone1.trim()
    : isValidPhone(animal.customer.phone2)
      ? animal.customer.phone2.trim()
      : isValidPhone(animal.customer.phone3)
        ? animal.customer.phone3.trim()
        : null

  // Check if email looks valid (contains @)
  const validEmail =
    animal.customer.email && animal.customer.email.includes('@')
      ? animal.customer.email
      : null

  // Format postcode to 4 digits with leading zeros
  const formattedPostcode = animal.customer.postcode
    ? animal.customer.postcode.toString().padStart(4, '0')
    : null

  // Handle customer area click
  const handleCustomerClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/customer/${animal.customer.id}`)
  }

  // Handle phone click
  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  // Handle email click
  const handleEmailClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div
      onClick={() => onClick(animal.id)}
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)] hover:shadow-xl"
    >
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] transition-all group-hover:h-1.5" />

      {/* Last Visit - Top Right Corner */}
      <div className="absolute top-3 right-3 text-xs font-medium text-[var(--gray-500)]">
        {formattedDate}
      </div>

      <div className="p-5">
        {/* Animal Section - TOP */}
        <div className="mb-4 flex items-center gap-4">
          <AnimalAvatar
            animalName={animal.name}
            breedName={animal.breed}
            size="md"
            className="transition-all group-hover:scale-110 group-hover:shadow-[0_4px_16px_rgba(217,148,74,0.3)]"
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-2xl leading-tight font-bold text-[var(--gray-900)]">
              {animal.name}
            </h3>
            <p className="truncate text-base font-medium text-[var(--primary)]">
              {animal.breed}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="mb-4 h-px bg-[var(--gray-200)]" />

        {/* Customer Section - MIDDLE */}
        <div
          onClick={handleCustomerClick}
          className="-mx-2 mb-3 cursor-pointer rounded-lg p-2 transition-all hover:bg-[var(--primary-light)]"
          title="View customer details"
        >
          {/* Customer Name - Large & Bold */}
          <div className="text-lg font-bold tracking-wide text-[var(--gray-800)] uppercase">
            {animal.customer.surname}
            {animal.customer.firstname && (
              <span className="font-normal text-[var(--gray-600)] normal-case">
                , {animal.customer.firstname}
              </span>
            )}
          </div>

          {/* Location - Suburb + Postcode */}
          {(animal.customer.suburb || formattedPostcode) && (
            <div className="mt-1 text-base font-medium text-[var(--secondary)]">
              {animal.customer.suburb}
              {animal.customer.suburb && formattedPostcode && (
                <span className="mx-2 text-[var(--gray-300)]">|</span>
              )}
              {formattedPostcode}
            </div>
          )}
        </div>

        {/* Contact Section - BOTTOM */}
        <div className="space-y-2">
          {/* Phone - Large & Prominent */}
          {primaryPhone && (
            <a
              href={`tel:${primaryPhone.replace(/\s/g, '')}`}
              onClick={handlePhoneClick}
              className="flex items-center gap-2 text-lg font-semibold text-[var(--secondary)] transition-colors hover:text-[var(--secondary-hover)]"
            >
              <svg
                className="h-5 w-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span className="font-mono">{formatPhone(primaryPhone)}</span>
            </a>
          )}

          {/* Email - only show if it looks like a valid email */}
          {validEmail && (
            <a
              href={`mailto:${validEmail}`}
              onClick={handleEmailClick}
              className="flex items-center gap-2 truncate text-sm text-[var(--gray-600)] transition-colors hover:text-[var(--primary)]"
            >
              <svg
                className="h-4 w-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="truncate">{validEmail}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
