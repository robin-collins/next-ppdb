'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCustomersStore } from '@/store/customersStore'
import { useAnimalsStore } from '@/store/animalsStore'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

interface Breed {
  id: number
  name: string
  avgtime: string | null
  avgcost: number | null
}

export default function NewAnimalPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const customerId = parseInt(params.id)
  const { selectedCustomer, fetchCustomer } = useCustomersStore()
  const { createAnimal } = useAnimalsStore()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarPinned, setSidebarPinned] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [breeds, setBreeds] = useState<Breed[]>([])
  const [loadingBreeds, setLoadingBreeds] = useState(true)

  // Load customer data
  useEffect(() => {
    if (!selectedCustomer || selectedCustomer.id !== customerId) {
      fetchCustomer(customerId)
    }
  }, [customerId, selectedCustomer, fetchCustomer])

  // Load breeds
  useEffect(() => {
    async function loadBreeds() {
      try {
        const response = await fetch('/api/breeds')
        if (response.ok) {
          const data = await response.json()
          setBreeds(data)
        }
      } catch (err) {
        console.error('Failed to load breeds:', err)
      } finally {
        setLoadingBreeds(false)
      }
    }
    loadBreeds()
  }, [])

  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    sex: 'Male' as 'Male' | 'Female',
    colour: '',
    cost: '',
    lastVisit: new Date().toISOString().split('T')[0],
    thisVisit: new Date().toISOString().split('T')[0],
    comments: '',
  })

  // Update cost when breed changes
  useEffect(() => {
    if (formData.breed && breeds.length > 0) {
      const selectedBreed = breeds.find(b => b.name === formData.breed)
      if (
        selectedBreed?.avgcost !== null &&
        selectedBreed?.avgcost !== undefined
      ) {
        setFormData(prev => ({
          ...prev,
          cost: selectedBreed.avgcost!.toString(),
        }))
      }
    }
  }, [formData.breed, breeds])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await createAnimal({
        name: formData.name,
        breed: formData.breed,
        sex: formData.sex,
        customerId,
        colour: formData.colour || undefined,
        cost: formData.cost ? parseInt(formData.cost) : undefined,
        comments: formData.comments || undefined,
        lastVisit: formData.lastVisit
          ? new Date(formData.lastVisit).toISOString()
          : new Date().toISOString(),
        thisVisit: formData.thisVisit
          ? new Date(formData.thisVisit).toISOString()
          : new Date().toISOString(),
      })

      // Navigate back to customer detail page (better UX - shows the animal was added to this customer)
      router.push(`/customer/${customerId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create animal')
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const customerName = selectedCustomer
    ? `${selectedCustomer.firstname || ''} ${selectedCustomer.surname}`.trim()
    : 'Customer'

  const customerInitial =
    selectedCustomer?.firstname?.charAt(0)?.toUpperCase() || 'C'
  const customerPhone = selectedCustomer?.phone1 || ''
  const customerSuburb = selectedCustomer?.suburb || ''

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        onSearch={() => {}}
        searchValue=""
      />

      <Sidebar
        isOpen={sidebarOpen}
        isPinned={sidebarPinned}
        onClose={() => setSidebarOpen(false)}
        onTogglePin={() => setSidebarPinned(!sidebarPinned)}
        currentPath={`/customer/${customerId}/newAnimal`}
      />

      <main
        style={{
          borderRadius: 'var(--radius-2xl)',
          boxShadow: 'var(--shadow-xl)',
          margin: 'var(--space-6)',
          transition: 'margin-left 0.3s ease',
        }}
        className={`flex-1 overflow-hidden bg-white/95 backdrop-blur-[20px] ${
          sidebarPinned ? 'ml-[calc(var(--sidebar-width)+var(--space-6))]' : ''
        }`}
      >
        <div style={{ padding: 'var(--space-8)' }} className="relative z-10">
          {/* Page Header */}
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                margin: '0 0 var(--space-2) 0',
                letterSpacing: '-0.02em',
              }}
              className="text-[2.5rem] leading-tight font-bold text-[var(--gray-900)]"
            >
              Add New Animal
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1.125rem',
                fontWeight: '400',
                margin: '0',
              }}
              className="text-[var(--gray-600)]"
            >
              Register a new pet for this customer
            </p>
          </div>

          {/* Customer Context Card */}
          <div
            style={{
              background:
                'linear-gradient(135deg, var(--primary-light), var(--secondary-light))',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
              marginBottom: 'var(--space-6)',
              animation: 'slideInUp 0.4s ease-out 0.1s forwards',
              opacity: 0,
              gap: 'var(--space-4)',
            }}
            className="flex items-center border-2 border-[var(--primary)] shadow-[var(--shadow-md)]"
          >
            <div
              style={{
                background:
                  'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                borderRadius: 'var(--radius-full)',
                boxShadow: 'var(--shadow-primary)',
              }}
              className="flex h-16 w-16 flex-shrink-0 items-center justify-center border-[3px] border-white text-2xl font-bold text-white"
            >
              {customerInitial}
            </div>
            <div className="flex-1">
              <div
                style={{
                  fontFamily: 'var(--font-accent)',
                  fontSize: '0.75rem',
                  marginBottom: 'var(--space-1)',
                }}
                className="font-semibold tracking-wider text-[var(--primary)] uppercase"
              >
                Adding animal for
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.5rem',
                  marginBottom: 'var(--space-1)',
                }}
                className="font-bold text-[var(--gray-900)]"
              >
                {customerName}
              </div>
              <div
                style={{ fontFamily: 'var(--font-body)', fontSize: '1rem' }}
                className="font-medium text-[var(--gray-600)]"
              >
                {customerPhone && `"${customerPhone}"`}
                {customerPhone && customerSuburb && ' • '}
                {customerSuburb}
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div
            style={{
              borderRadius: 'var(--radius-xl)',
              animation: 'slideInUp 0.4s ease-out 0.2s forwards',
              opacity: 0,
            }}
            className="overflow-hidden border border-[var(--gray-200)] bg-white shadow-[var(--shadow-sm)]"
          >
            {/* Card Header */}
            <div
              style={{
                padding: 'var(--space-5) var(--space-6)',
                gap: 'var(--space-2)',
              }}
              className="flex items-center border-b border-[var(--gray-200)] bg-[var(--gray-50)]"
            >
              <svg
                className="h-5 w-5 text-[var(--primary)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
                />
              </svg>
              <h2
                style={{ fontFamily: 'var(--font-display)' }}
                className="text-xl font-semibold text-[var(--gray-900)]"
              >
                Animal Information
              </h2>
            </div>

            {/* Card Content */}
            <div style={{ padding: 'var(--space-6)' }}>
              <form onSubmit={handleSubmit}>
                {error && (
                  <div
                    style={{
                      marginBottom: 'var(--space-6)',
                      borderRadius: 'var(--radius-lg)',
                    }}
                    className="bg-red-50 p-4 text-red-800"
                  >
                    {error}
                  </div>
                )}

                <div
                  style={{ gap: 'var(--space-4)' }}
                  className="grid grid-cols-1 md:grid-cols-2"
                >
                  {/* Animal Name */}
                  <div
                    style={{ gap: 'var(--space-2)' }}
                    className="flex flex-col"
                  >
                    <label
                      htmlFor="name"
                      style={{
                        fontFamily: 'var(--font-accent)',
                        fontSize: '0.875rem',
                        gap: 'var(--space-1)',
                      }}
                      className="flex items-center font-semibold text-[var(--gray-700)]"
                    >
                      Animal Name
                      <span className="text-[var(--error)]">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      maxLength={12}
                      placeholder="Enter pet's name"
                      style={{
                        fontFamily: 'var(--font-body)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--space-3) var(--space-4)',
                        fontSize: '1rem',
                      }}
                      className="border-2 border-[var(--gray-200)] bg-white text-[var(--gray-800)] transition-all duration-150 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[rgba(217,148,74,0.1)] focus:outline-none"
                    />
                  </div>

                  {/* Sex */}
                  <div
                    style={{ gap: 'var(--space-2)' }}
                    className="flex flex-col"
                  >
                    <label
                      htmlFor="sex"
                      style={{
                        fontFamily: 'var(--font-accent)',
                        fontSize: '0.875rem',
                        gap: 'var(--space-1)',
                      }}
                      className="flex items-center font-semibold text-[var(--gray-700)]"
                    >
                      Sex
                      <span className="text-[var(--error)]">*</span>
                    </label>
                    <select
                      id="sex"
                      name="sex"
                      value={formData.sex}
                      onChange={handleChange}
                      required
                      style={{
                        fontFamily: 'var(--font-body)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--space-3) var(--space-4)',
                        fontSize: '1rem',
                      }}
                      className="cursor-pointer border-2 border-[var(--gray-200)] bg-white text-[var(--gray-800)] transition-all duration-150 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[rgba(217,148,74,0.1)] focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  {/* Breed */}
                  <div
                    style={{ gap: 'var(--space-2)' }}
                    className="flex flex-col"
                  >
                    <label
                      htmlFor="breed"
                      style={{
                        fontFamily: 'var(--font-accent)',
                        fontSize: '0.875rem',
                        gap: 'var(--space-1)',
                      }}
                      className="flex items-center font-semibold text-[var(--gray-700)]"
                    >
                      Breed
                      <span className="text-[var(--error)]">*</span>
                    </label>
                    <select
                      id="breed"
                      name="breed"
                      value={formData.breed}
                      onChange={handleChange}
                      required
                      disabled={loadingBreeds}
                      style={{
                        fontFamily: 'var(--font-body)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--space-3) var(--space-4)',
                        fontSize: '1rem',
                      }}
                      className="cursor-pointer border-2 border-[var(--gray-200)] bg-white text-base text-[var(--gray-800)] transition-all duration-150 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[rgba(217,148,74,0.1)] focus:outline-none disabled:opacity-50"
                    >
                      <option value="">
                        {loadingBreeds ? 'Loading breeds...' : 'Select a breed'}
                      </option>
                      {breeds.map(breed => (
                        <option key={breed.id} value={breed.name}>
                          {breed.name}
                        </option>
                      ))}
                    </select>
                    {formData.breed && (
                      <p
                        style={{ fontFamily: 'var(--font-accent)' }}
                        className="text-xs text-[var(--gray-500)]"
                      >
                        Select the pet&apos;s breed - pricing will adjust
                        automatically
                      </p>
                    )}
                  </div>

                  {/* Colour */}
                  <div
                    style={{ gap: 'var(--space-2)' }}
                    className="flex flex-col"
                  >
                    <label
                      htmlFor="colour"
                      style={{
                        fontFamily: 'var(--font-accent)',
                        fontSize: '0.875rem',
                      }}
                      className="font-semibold text-[var(--gray-700)]"
                    >
                      Colour
                    </label>
                    <input
                      type="text"
                      id="colour"
                      name="colour"
                      value={formData.colour}
                      onChange={handleChange}
                      placeholder="e.g., Golden, Black & White"
                      style={{
                        fontFamily: 'var(--font-body)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--space-3) var(--space-4)',
                        fontSize: '1rem',
                      }}
                      className="border-2 border-[var(--gray-200)] bg-white text-base text-[var(--gray-800)] transition-all duration-150 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[rgba(217,148,74,0.1)] focus:outline-none"
                    />
                  </div>

                  {/* Cost */}
                  <div
                    style={{ gap: 'var(--space-2)' }}
                    className="flex flex-col"
                  >
                    <label
                      htmlFor="cost"
                      style={{
                        fontFamily: 'var(--font-accent)',
                        fontSize: '0.875rem',
                        gap: 'var(--space-1)',
                      }}
                      className="flex items-center font-semibold text-[var(--gray-700)]"
                    >
                      Cost ($)
                      <span className="text-[var(--error)]">*</span>
                    </label>
                    <input
                      type="number"
                      id="cost"
                      name="cost"
                      value={formData.cost}
                      onChange={handleChange}
                      required
                      min="0"
                      max="999"
                      style={{
                        fontFamily: 'var(--font-body)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--space-3) var(--space-4)',
                        fontSize: '1rem',
                      }}
                      className="border-2 border-[var(--gray-200)] bg-white text-base text-[var(--gray-800)] transition-all duration-150 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[rgba(217,148,74,0.1)] focus:outline-none"
                    />
                    {formData.cost &&
                      formData.breed &&
                      (() => {
                        const selectedBreed = breeds.find(
                          b => b.name === formData.breed
                        )
                        const currentCost = parseInt(formData.cost)
                        const breedCost = selectedBreed?.avgcost

                        if (breedCost === null || breedCost === undefined)
                          return null

                        let color, text
                        if (currentCost === breedCost) {
                          color = 'var(--success)'
                          text = 'Breed-based pricing'
                        } else if (currentCost < breedCost) {
                          color = 'var(--error)'
                          text = 'Discounted pricing'
                        } else {
                          color = 'var(--warning)'
                          text = 'Custom pricing'
                        }

                        return (
                          <span
                            style={{
                              fontFamily: 'var(--font-accent)',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: color,
                              fontSize: '0.75rem',
                            }}
                            className="inline-block px-4 py-2 font-semibold tracking-wider text-white uppercase"
                          >
                            {text}
                          </span>
                        )
                      })()}
                  </div>

                  {/* Last Visit */}
                  <div
                    style={{ gap: 'var(--space-2)' }}
                    className="flex flex-col"
                  >
                    <label
                      htmlFor="lastVisit"
                      style={{
                        fontFamily: 'var(--font-accent)',
                        fontSize: '0.875rem',
                      }}
                      className="font-semibold text-[var(--gray-700)]"
                    >
                      Last Visit
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        id="lastVisit"
                        name="lastVisit"
                        value={formData.lastVisit}
                        onChange={handleChange}
                        style={{
                          fontFamily: 'var(--font-body)',
                          borderRadius: 'var(--radius-lg)',
                          padding: 'var(--space-3) var(--space-4)',
                          fontSize: '1rem',
                        }}
                        className="flex-1 border-2 border-[var(--gray-200)] bg-white text-base text-[var(--gray-800)] transition-all duration-150 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[rgba(217,148,74,0.1)] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* This Visit */}
                  <div
                    style={{ gap: 'var(--space-2)' }}
                    className="flex flex-col"
                  >
                    <label
                      htmlFor="thisVisit"
                      style={{
                        fontFamily: 'var(--font-accent)',
                        fontSize: '0.875rem',
                      }}
                      className="font-semibold text-[var(--gray-700)]"
                    >
                      This Visit
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        id="thisVisit"
                        name="thisVisit"
                        value={formData.thisVisit}
                        onChange={handleChange}
                        style={{
                          fontFamily: 'var(--font-body)',
                          borderRadius: 'var(--radius-lg)',
                          padding: 'var(--space-3) var(--space-4)',
                          fontSize: '1rem',
                        }}
                        className="flex-1 border-2 border-[var(--gray-200)] bg-white text-base text-[var(--gray-800)] transition-all duration-150 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[rgba(217,148,74,0.1)] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Comments */}
                  <div
                    style={{ gap: 'var(--space-2)', gridColumn: '1 / -1' }}
                    className="flex flex-col"
                  >
                    <label
                      htmlFor="comments"
                      style={{
                        fontFamily: 'var(--font-accent)',
                        fontSize: '0.875rem',
                      }}
                      className="font-semibold text-[var(--gray-700)]"
                    >
                      Comments
                    </label>
                    <textarea
                      id="comments"
                      name="comments"
                      value={formData.comments}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Initial service notes, special instructions, or health information..."
                      style={{
                        fontFamily: 'var(--font-body)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--space-3) var(--space-4)',
                        fontSize: '1rem',
                      }}
                      className="min-h-[100px] resize-y border-2 border-[var(--gray-200)] bg-white text-base text-[var(--gray-800)] transition-all duration-150 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[rgba(217,148,74,0.1)] focus:outline-none"
                    />
                  </div>

                  {/* Form Actions */}
                  <div
                    style={{
                      gridColumn: '1 / -1',
                      marginTop: 'var(--space-4)',
                      gap: 'var(--space-3)',
                    }}
                    className="flex justify-end"
                  >
                    <button
                      type="button"
                      onClick={() => router.push(`/customer/${customerId}`)}
                      style={{
                        fontFamily: 'var(--font-accent)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--space-3) var(--space-5)',
                        fontSize: '0.875rem',
                        gap: 'var(--space-2)',
                      }}
                      className="inline-flex items-center bg-[var(--gray-100)] font-semibold text-[var(--gray-700)] shadow-[var(--shadow-sm)] transition-all duration-250 hover:-translate-y-[1px] hover:bg-[var(--gray-200)] active:translate-y-0"
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
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !formData.name || !formData.breed}
                      style={{
                        fontFamily: 'var(--font-accent)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--space-4) var(--space-8)',
                        fontSize: '1rem',
                        gap: 'var(--space-2)',
                      }}
                      className="inline-flex items-center bg-[var(--primary)] font-semibold text-white shadow-[var(--shadow-sm)] transition-all duration-250 hover:-translate-y-[1px] hover:bg-[var(--primary-hover)] hover:shadow-[var(--shadow-md)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      {loading ? (
                        <svg
                          className="h-4 w-4 animate-spin"
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
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                      Insert Record
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
