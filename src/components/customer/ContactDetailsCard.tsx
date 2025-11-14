'use client'

interface ContactDetailsCardProps {
  customer: {
    phone1: string | null
    phone2: string | null
    phone3: string | null
    address: string | null
    suburb: string | null
    postcode: string | null
    email: string | null
  }
  onEdit?: () => void
}

export default function ContactDetailsCard({
  customer,
  onEdit,
}: ContactDetailsCardProps) {
  const fullAddress =
    [customer.address, customer.suburb, customer.postcode]
      .filter(Boolean)
      .join(', ') || null

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
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
          </svg>
          Contact Details
        </h2>
        <button
          onClick={onEdit}
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
      </div>

      {/* Card Content */}
      <div className="p-6">
        <ul className="flex flex-col gap-3">
          {/* Phone 1 */}
          <li className="group flex items-center gap-3 rounded-lg p-3 transition-all hover:bg-gray-50">
            <svg
              className="h-5 w-5 flex-shrink-0 text-indigo-600"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </svg>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                {customer.phone1 || (
                  <span className="text-gray-500 italic">No primary phone</span>
                )}
              </div>
            </div>
            {customer.phone1 && (
              <a
                href={`tel:${customer.phone1}`}
                className="text-xs font-semibold text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100"
              >
                Call
              </a>
            )}
          </li>

          {/* Phone 2 */}
          <li className="group flex items-center gap-3 rounded-lg p-3 transition-all hover:bg-gray-50">
            <svg
              className="h-5 w-5 flex-shrink-0 text-indigo-600"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </svg>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                {customer.phone2 || (
                  <span className="text-gray-500 italic">
                    No secondary phone
                  </span>
                )}
              </div>
            </div>
            {customer.phone2 && (
              <a
                href={`tel:${customer.phone2}`}
                className="text-xs font-semibold text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100"
              >
                Call
              </a>
            )}
          </li>

          {/* Address */}
          <li className="group flex items-start gap-3 rounded-lg p-3 transition-all hover:bg-gray-50">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-600"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                {fullAddress || (
                  <span className="text-gray-500 italic">
                    No address provided
                  </span>
                )}
              </div>
            </div>
          </li>

          {/* Email */}
          <li className="group flex items-center gap-3 rounded-lg p-3 transition-all hover:bg-gray-50">
            <svg
              className="h-5 w-5 flex-shrink-0 text-indigo-600"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                {customer.email || (
                  <span className="text-gray-500 italic">
                    No email provided
                  </span>
                )}
              </div>
            </div>
            {customer.email && (
              <a
                href={`mailto:${customer.email}`}
                className="text-xs font-semibold text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100"
              >
                Email
              </a>
            )}
          </li>
        </ul>
      </div>
    </div>
  )
}
