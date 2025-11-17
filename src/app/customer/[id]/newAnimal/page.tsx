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
    comments: '',
  })

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
        lastVisit: new Date().toISOString(),
        thisVisit: new Date().toISOString(),
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
        className={`m-6 flex-1 transition-all duration-300 ${
          sidebarPinned ? 'ml-[calc(var(--sidebar-width)+1.5rem)]' : ''
        }`}
      >
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Page Header */}
          <div className="overflow-hidden rounded-2xl bg-white/95 p-6 shadow-xl backdrop-blur-[20px]">
            <button
              onClick={() => router.push(`/customer/${customerId}`)}
              className="text-primary mb-2 text-sm hover:underline"
            >
              ← Back to {customerName}
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Add New Animal for {customerName}
            </h1>
            <p className="mt-1 text-gray-600">
              Register a new pet for this customer
            </p>
          </div>

          {/* Form */}
          <div className="overflow-hidden rounded-2xl bg-white/95 p-6 shadow-xl backdrop-blur-[20px]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-lg bg-red-50 p-4 text-red-800">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Animal Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    maxLength={12}
                    className="focus:border-primary focus:ring-primary mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                </div>

                {/* Breed */}
                <div>
                  <label
                    htmlFor="breed"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Breed *
                  </label>
                  <select
                    id="breed"
                    name="breed"
                    value={formData.breed}
                    onChange={handleChange}
                    required
                    disabled={loadingBreeds}
                    className="focus:border-primary focus:ring-primary mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 disabled:opacity-50"
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
                  {!loadingBreeds && breeds.length === 0 && (
                    <p className="mt-1 text-sm text-gray-500">
                      No breeds available. Add breeds in the Breeds page first.
                    </p>
                  )}
                </div>

                {/* Sex */}
                <div>
                  <label
                    htmlFor="sex"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Sex *
                  </label>
                  <select
                    id="sex"
                    name="sex"
                    value={formData.sex}
                    onChange={handleChange}
                    required
                    className="focus:border-primary focus:ring-primary mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                {/* Colour */}
                <div>
                  <label
                    htmlFor="colour"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Colour
                  </label>
                  <input
                    type="text"
                    id="colour"
                    name="colour"
                    value={formData.colour}
                    onChange={handleChange}
                    className="focus:border-primary focus:ring-primary mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                </div>

                {/* Cost */}
                <div>
                  <label
                    htmlFor="cost"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Default Service Cost ($)
                  </label>
                  <input
                    type="number"
                    id="cost"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    min="0"
                    max="999"
                    className="focus:border-primary focus:ring-primary mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                </div>
              </div>

              {/* Comments */}
              <div>
                <label
                  htmlFor="comments"
                  className="block text-sm font-medium text-gray-700"
                >
                  Comments
                </label>
                <textarea
                  id="comments"
                  name="comments"
                  value={formData.comments}
                  onChange={handleChange}
                  rows={3}
                  className="focus:border-primary focus:ring-primary mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-6">
                <button
                  type="button"
                  onClick={() => router.push(`/customer/${customerId}`)}
                  className="rounded-lg border-2 border-gray-300 px-8 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || loadingBreeds}
                  className="rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 px-10 py-4 text-xl font-bold text-white shadow-2xl transition-all hover:from-indigo-700 hover:to-blue-700 hover:shadow-[0_8px_30px_rgb(79,70,229,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    boxShadow: '0 10px 40px -10px rgba(79, 70, 229, 0.6)',
                  }}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Saving Animal...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Save Animal
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
