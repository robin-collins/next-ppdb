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
  }
  lastVisit: Date
  cost: number
  relevanceScore?: number
}

interface AnimalCardProps {
  animal: Animal
  onClick: (id: number) => void
}

export default function AnimalCard({ animal, onClick }: AnimalCardProps) {
  const router = useRouter()
  const formattedDate = new Date(animal.lastVisit).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  })

  // Build phone numbers display
  const phones = [
    animal.customer.phone1,
    animal.customer.phone2,
    animal.customer.phone3,
  ]
    .filter(p => p && p.trim())
    .map((phone, idx, arr) => (
      <span key={idx}>
        <span className="font-semibold text-[#06b6d4] transition-colors group-hover:text-[#6366f1]">
          {phone}
        </span>
        {idx < arr.length - 1 && (
          <span className="mx-1 font-normal text-gray-300">|</span>
        )}
      </span>
    ))

  // Format postcode to 4 digits with leading zeros
  const formattedPostcode = animal.customer.postcode
    ? animal.customer.postcode.toString().padStart(4, '0')
    : null

  // Handle customer area click
  const handleCustomerClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/customer/${animal.customer.id}`)
  }

  return (
    <div
      onClick={() => onClick(animal.id)}
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white p-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#6366f1] hover:shadow-xl"
    >
      {/* Top accent bar - gradient from primary to secondary to accent */}
      <div className="h-1 bg-gradient-to-r from-[#6366f1] via-[#06b6d4] to-[#f59e0b] transition-all group-hover:h-1.5" />

      <div className="p-4 pt-5">
        {/* Customer Info Section with gradient background */}
        <div className="mb-3 flex items-start gap-4 rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 via-gray-50/80 to-white p-4 transition-all group-hover:border-[#6366f1]/20 group-hover:bg-gradient-to-br group-hover:from-[#6366f1]/5 group-hover:via-[#06b6d4]/5 group-hover:to-white group-hover:shadow-[0_2px_8px_rgba(99,102,241,0.1)]">
          {/* Animal Name & Breed - Left Side with Border */}
          <div className="flex shrink-0 items-center gap-3 border-r-2 border-gray-200 pr-4 transition-colors group-hover:border-[#6366f1]/30">
            <AnimalAvatar
              animalName={animal.name}
              breedName={animal.breed}
              size="md"
              className="transition-all group-hover:scale-110 group-hover:shadow-[0_4px_16px_rgba(99,102,241,0.3)]"
            />
            <div>
              <h3 className="text-lg leading-tight font-bold text-gray-800">
                {animal.name}
              </h3>
              <p className="text-sm text-gray-600">{animal.breed}</p>
            </div>
          </div>

          {/* Customer Details - Right Side - Clickable Area */}
          <div
            onClick={handleCustomerClick}
            className="customer-area -m-2 flex min-w-0 flex-1 cursor-pointer flex-col gap-2 rounded-md p-2 transition-all hover:bg-white/60"
            title="View customer details"
          >
            <div className="customer-area-hover:text-[#6366f1] text-sm leading-tight font-bold tracking-wide text-gray-800 transition-colors">
              {animal.customer.surname}
              {animal.customer.firstname && `, ${animal.customer.firstname}`}
            </div>
            <div className="flex flex-col gap-1">
              {animal.customer.address && (
                <span className="text-xs font-medium text-gray-600">
                  {animal.customer.address}
                </span>
              )}
              <div className="flex flex-wrap items-center gap-2">
                {animal.customer.suburb && (
                  <span className="rounded-md border border-[#e0e7ff] bg-white px-2.5 py-1 text-xs font-bold tracking-wide text-[#6366f1] transition-all group-hover:-translate-y-px group-hover:border-[#4f46e5] group-hover:bg-[#6366f1] group-hover:text-white">
                    {animal.customer.suburb}
                  </span>
                )}
                {formattedPostcode && (
                  <span className="rounded-md border border-[#e0e7ff] bg-white px-2.5 py-1 text-xs font-bold tracking-wide text-[#6366f1] transition-all group-hover:-translate-y-px group-hover:border-[#4f46e5] group-hover:bg-[#6366f1] group-hover:text-white">
                    {formattedPostcode}
                  </span>
                )}
              </div>
            </div>
            {phones.length > 0 && (
              <div className="flex flex-wrap items-center text-xs text-gray-700">
                {phones}
              </div>
            )}
          </div>
        </div>

        {/* Info Grid - Color & Last Visit */}
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div className="flex flex-col gap-1 rounded-md border border-gray-100 bg-gray-50 p-2 transition-all group-hover:border-[#6366f1]/10 group-hover:bg-white/80">
            <span className="text-[0.7rem] font-bold tracking-wider text-gray-500 uppercase">
              Color
            </span>
            <span className="leading-tight font-semibold text-gray-800">
              {animal.colour || 'N/A'}
            </span>
          </div>

          <div className="flex flex-col gap-1 rounded-md border border-gray-100 bg-gray-50 p-2 transition-all group-hover:border-[#6366f1]/10 group-hover:bg-white/80">
            <span className="text-[0.7rem] font-bold tracking-wider text-gray-500 uppercase">
              Last Visit
            </span>
            <span className="leading-tight font-semibold text-gray-800">
              {formattedDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
