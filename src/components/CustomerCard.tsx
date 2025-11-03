interface Customer {
  id: number
  surname: string
  firstname: string | null
  phone1: string | null
  phone2: string | null
  email: string | null
  suburb: string | null
  animalCount: number
}

interface CustomerCardProps {
  customer: Customer
  onClick: (id: number) => void
}

export default function CustomerCard({ customer, onClick }: CustomerCardProps) {
  const fullName =
    [customer.firstname, customer.surname].filter(Boolean).join(' ') ||
    customer.surname
  const initials = fullName
    .split(' ')
    .map(n => n.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)

  return (
    <div
      onClick={() => onClick(customer.id)}
      className="group hover:border-primary relative cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Top accent bar */}
      <div className="from-secondary to-primary group-hover:from-secondary group-hover:via-primary group-hover:to-accent h-1 bg-gradient-to-r transition-all group-hover:h-1.5" />

      <div className="p-4 pt-5">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="from-secondary to-primary flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br text-lg font-bold text-white shadow-[0_2px_8px_rgba(6,182,212,0.2)] transition-all group-hover:scale-110 group-hover:shadow-[0_4px_16px_rgba(6,182,212,0.3)]">
              {initials}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{fullName}</h3>
              <p className="text-sm text-gray-600">
                {customer.animalCount}{' '}
                {customer.animalCount === 1 ? 'animal' : 'animals'}
              </p>
            </div>
          </div>
          <span className="from-primary rounded-full border border-indigo-300 bg-gradient-to-br to-[#4f46e5] px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase shadow-sm transition-all group-hover:shadow-[0_2px_8px_rgba(99,102,241,0.3)]">
            Customer
          </span>
        </div>

        {/* Info Grid */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="group-hover:border-primary/10 rounded-lg border border-gray-100 bg-gray-50 p-2 transition-all group-hover:bg-white/80">
            <span className="mb-1 block text-[0.7rem] font-bold tracking-wider text-gray-500 uppercase">
              Phone
            </span>
            <span className="font-semibold text-gray-800">
              {customer.phone1 || customer.phone2 || 'N/A'}
            </span>
          </div>

          <div className="group-hover:border-primary/10 rounded-lg border border-gray-100 bg-gray-50 p-2 transition-all group-hover:bg-white/80">
            <span className="mb-1 block text-[0.7rem] font-bold tracking-wider text-gray-500 uppercase">
              Suburb
            </span>
            <span className="font-semibold text-gray-800">
              {customer.suburb || 'N/A'}
            </span>
          </div>

          {customer.email && (
            <div className="group-hover:border-primary/10 col-span-2 rounded-lg border border-gray-100 bg-gray-50 p-2 transition-all group-hover:bg-white/80">
              <span className="mb-1 block text-[0.7rem] font-bold tracking-wider text-gray-500 uppercase">
                Email
              </span>
              <span className="block truncate font-semibold text-gray-800">
                {customer.email}
              </span>
            </div>
          )}
        </div>

        {/* View button */}
        <div className="mt-4 flex items-center justify-end gap-2 text-sm">
          <span className="from-primary to-secondary bg-gradient-to-r bg-clip-text font-semibold text-transparent transition-all group-hover:tracking-wide">
            View Details →
          </span>
        </div>
      </div>
    </div>
  )
}
