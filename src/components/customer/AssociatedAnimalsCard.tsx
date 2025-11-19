'use client'

interface Animal {
  id: number
  name: string
  breed: string
  sex: 'Male' | 'Female'
  colour?: string
  lastVisit?: Date | string | null
  cost?: number | null
}

interface AssociatedAnimalsCardProps {
  animals: Animal[]
  onAddAnimal?: () => void
  onDeleteAnimal?: (id: number) => void
  onClickAnimal?: (id: number) => void
}

export default function AssociatedAnimalsCard({
  animals,
  onAddAnimal,
  onDeleteAnimal,
  onClickAnimal,
}: AssociatedAnimalsCardProps) {
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
              d="M4 6h16M4 10h16M4 14h16M4 18h16"
            ></path>
          </svg>
          Associated Animals
        </h2>
        <button
          onClick={onAddAnimal}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'var(--success)' }}
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
          Add
        </button>
      </div>
      <div className="card-content flex flex-col gap-4">
        {animals.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <p>No animals associated with this customer.</p>
          </div>
        ) : (
          animals.map((animal, index) => (
            <div
              key={animal.id}
              className="animal-mini-card group relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-primary)]"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => onClickAnimal?.(animal.id)}
            >
              {/* Top Border Gradient on Hover */}
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] opacity-0 transition-opacity group-hover:opacity-100" />

              {/* Avatar */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-lg font-bold text-white shadow-[var(--shadow-primary)] transition-transform group-hover:scale-110 group-hover:-rotate-6">
                {animal.name.charAt(0)}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <h3 className="mb-1 font-[family-name:var(--font-display)] text-base font-bold text-gray-900">
                  {animal.name}
                </h3>
                <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <svg
                      width="12"
                      height="12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      ></path>
                    </svg>
                    {animal.breed}
                  </span>
                  {animal.colour && (
                    <span className="flex items-center gap-1">
                      <svg
                        width="12"
                        height="12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                        ></path>
                      </svg>
                      {animal.colour}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <svg
                      width="12"
                      height="12"
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
                    {animal.sex}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="relative z-10 flex items-center gap-2">
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200"
                  title="View/Edit Animal"
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    onClickAnimal?.(animal.id)
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
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    ></path>
                  </svg>
                </button>
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-transparent bg-[var(--error)] text-white transition-all duration-200 hover:scale-110 hover:border-[#8a3c35] hover:bg-[#c86158] hover:shadow-md"
                  title="Delete Animal"
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    onDeleteAnimal?.(animal.id)
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
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
