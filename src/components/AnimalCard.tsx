'use client'

import { useRouter } from 'next/navigation'
import AnimalAvatar from './AnimalAvatar'
import { formatDateAU } from '@/lib/date'

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
  lastVisit: Date | string
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
  const formattedDate = formatDateAU(animal.lastVisit)

  // Get all valid phone numbers (filter out "Unknown" and empty values)
  const isValidPhone = (phone: string | null | undefined): phone is string => {
    if (!phone) return false
    const trimmed = phone.trim().toLowerCase()
    return trimmed !== '' && trimmed !== 'unknown' && trimmed !== '0'
  }

  const allPhones = [
    animal.customer.phone1,
    animal.customer.phone2,
    animal.customer.phone3,
  ].filter(isValidPhone)

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

      {/* Desktop: Horizontal layout (md and up) */}
      {/* Mobile: Vertical layout (below md) */}
      <div className="flex flex-col p-4 md:flex-row md:p-0">
        {/* LEFT SECTION - Animal Details (1/3 on desktop) */}
        <div className="flex items-start gap-3 rounded-lg transition-all hover:bg-[var(--primary-light)] md:w-1/3 md:flex-shrink-0 md:border-r md:border-[var(--gray-200)] md:p-4">
          <AnimalAvatar
            animalName={animal.name}
            breedName={animal.breed}
            size="md"
            className="flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-xl leading-tight font-bold text-[var(--gray-900)] md:text-2xl">
              {animal.name}
            </h3>
            <p className="truncate text-sm font-medium text-[var(--primary)] md:text-base">
              {animal.breed}
            </p>
            {/* Color - shown in animal section */}
            {animal.colour && (
              <p className="mt-1 truncate text-xs text-[var(--gray-500)]">
                {animal.colour}
              </p>
            )}
            {/* Last visit date */}
            <p className="mt-1 text-xs text-[var(--gray-400)]">
              Last Visit: <span className="font-bold">{formattedDate}</span>
            </p>
          </div>
        </div>

        {/* Horizontal Divider - Mobile only */}
        <div className="my-3 h-px bg-[var(--gray-200)] md:hidden" />

        {/* RIGHT SECTION - Customer Details (2/3 on desktop) */}
        <div
          onClick={handleCustomerClick}
          className="flex min-w-0 flex-1 cursor-pointer flex-col justify-center gap-2 rounded-lg transition-all hover:bg-[var(--primary-light)] md:gap-1 md:p-4"
          title="View customer details"
        >
          {/* Customer Name - Large & Bold (matching animal name size) */}
          <div className="text-xl font-bold tracking-wide text-[var(--gray-800)] uppercase md:text-2xl">
            {animal.customer.surname}
            {animal.customer.firstname && (
              <span className="font-normal text-[var(--gray-600)] normal-case">
                , {animal.customer.firstname}
              </span>
            )}
          </div>

          {/* Location - Address | Suburb | Postcode */}
          {(animal.customer.address ||
            animal.customer.suburb ||
            formattedPostcode) && (
            <div className="flex flex-wrap items-center gap-x-1 text-base">
              {animal.customer.address && (
                <>
                  <span className="text-sm text-[var(--gray-500)]">
                    {animal.customer.address}
                  </span>
                  {(animal.customer.suburb || formattedPostcode) && (
                    <span className="text-[var(--gray-300)]">|</span>
                  )}
                </>
              )}
              {animal.customer.suburb && (
                <span className="font-medium text-[var(--secondary)]">
                  {animal.customer.suburb}
                </span>
              )}
              {animal.customer.suburb && formattedPostcode && (
                <span className="text-[var(--gray-300)]">|</span>
              )}
              {formattedPostcode && (
                <span className="font-medium text-[var(--secondary)]">
                  {formattedPostcode}
                </span>
              )}
            </div>
          )}

          {/* Contact Section - All Phones */}
          {/* Primary phone in teal, secondary/tertiary in dark grey */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {allPhones.map((phone, idx) => {
              const isPrimary = idx === 0
              return (
                <a
                  key={idx}
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  onClick={handlePhoneClick}
                  className={`flex items-center gap-1.5 text-base font-semibold transition-colors md:text-lg ${
                    isPrimary
                      ? 'text-[var(--secondary)] hover:text-[var(--secondary-hover)]'
                      : 'text-[var(--gray-600)] hover:text-[var(--gray-800)]'
                  }`}
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span className="font-mono">{formatPhone(phone)}</span>
                </a>
              )
            })}
          </div>

          {/* Email */}
          {validEmail && (
            <a
              href={`mailto:${validEmail}`}
              onClick={handleEmailClick}
              className="flex items-center gap-1.5 truncate text-sm text-[var(--gray-600)] transition-colors hover:text-[var(--primary)]"
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
