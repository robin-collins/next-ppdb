interface Animal {
  id: number
  name: string
  breed: string
  colour: string | null
  customer: {
    surname: string
    phone1?: string | null
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
  const initials = animal.name.charAt(0).toUpperCase()
  const formattedDate = new Date(animal.lastVisit).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  })

  return (
    <div
      onClick={() => onClick(animal.id)}
      className="group hover:border-primary relative cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Top accent bar */}
      <div className="from-primary to-secondary group-hover:from-primary group-hover:via-secondary group-hover:to-accent h-1 bg-gradient-to-r transition-all group-hover:h-1.5" />

      <div className="p-4 pt-5">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="from-primary to-secondary flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br text-xl font-bold text-white shadow-[0_2px_8px_rgba(99,102,241,0.2)] transition-all group-hover:scale-110 group-hover:shadow-[0_4px_16px_rgba(99,102,241,0.3)]">
              {initials}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{animal.name}</h3>
              <p className="text-sm text-gray-600">{animal.breed}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {animal.relevanceScore !== undefined && (
              <span className="text-sm font-medium text-gray-600">
                Score: {animal.relevanceScore}
              </span>
            )}
            <span className="from-success rounded-full border border-green-300 bg-gradient-to-br to-[#059669] px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase shadow-sm transition-all group-hover:shadow-[0_2px_8px_rgba(16,185,129,0.3)]">
              Active
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="group-hover:border-primary/10 rounded-lg border border-gray-100 bg-gray-50 p-2 transition-all group-hover:bg-white/80">
            <span className="mb-1 block text-[0.7rem] font-bold tracking-wider text-gray-500 uppercase">
              Owner
            </span>
            <span className="font-semibold text-gray-800">
              {animal.customer.surname}
            </span>
          </div>

          <div className="group-hover:border-primary/10 rounded-lg border border-gray-100 bg-gray-50 p-2 transition-all group-hover:bg-white/80">
            <span className="mb-1 block text-[0.7rem] font-bold tracking-wider text-gray-500 uppercase">
              Color
            </span>
            <span className="font-semibold text-gray-800">
              {animal.colour || 'N/A'}
            </span>
          </div>

          <div className="group-hover:border-primary/10 rounded-lg border border-gray-100 bg-gray-50 p-2 transition-all group-hover:bg-white/80">
            <span className="mb-1 block text-[0.7rem] font-bold tracking-wider text-gray-500 uppercase">
              Phone
            </span>
            <span className="font-semibold text-gray-800">
              {animal.customer.phone1 || 'N/A'}
            </span>
          </div>

          <div className="group-hover:border-primary/10 rounded-lg border border-gray-100 bg-gray-50 p-2 transition-all group-hover:bg-white/80">
            <span className="mb-1 block text-[0.7rem] font-bold tracking-wider text-gray-500 uppercase">
              Last Visit
            </span>
            <span className="font-semibold text-gray-800">{formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
