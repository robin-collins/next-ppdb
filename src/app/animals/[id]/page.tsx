'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAnimalsStore } from '@/store/animalsStore'
import { useSidebarState } from '@/hooks/useSidebarState'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import AnimalAvatar from '@/components/AnimalAvatar'
import { routes } from '@/lib/routes'

interface Breed {
  id: number
  name: string
  avgtime: string | null
  avgcost: number | null
}

export default function AnimalPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const {
    selectedAnimal,
    fetchAnimal,
    updateAnimal,
    addNote,
    deleteNote,
    loading,
    error,
  } = useAnimalsStore()

  const {
    sidebarOpen,
    sidebarPinned,
    skipTransition,
    setSidebarOpen,
    toggleSidebar,
    togglePin,
  } = useSidebarState()
  const [searchQuery, _setSearchQuery] = useState('')

  // Breeds state
  const [breeds, setBreeds] = useState<Breed[]>([])
  const [selectedBreed, setSelectedBreed] = useState<Breed | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    sex: '',
    colour: '',
    cost: 0,
    lastVisit: '',
    thisVisit: '',
    comments: '',
  })

  // Notes state
  const [newNoteText, setNewNoteText] = useState('')

  // Delete note confirmation state
  const [deleteNoteConfirm, setDeleteNoteConfirm] = useState<{
    id: number
    date: string
    typedDate: string
  } | null>(null)

  useEffect(() => {
    const idNum = Number(params.id)
    if (Number.isFinite(idNum)) {
      fetchAnimal(idNum)
    }
    // Fetch breeds
    fetch('/api/breeds')
      .then(res => res.json())
      .then(data => setBreeds(data))
      .catch(err => console.error('Failed to fetch breeds', err))
  }, [params.id, fetchAnimal])

  useEffect(() => {
    if (selectedAnimal) {
      const breedName =
        typeof selectedAnimal.breed === 'string'
          ? selectedAnimal.breed
          : (selectedAnimal.breed as { name: string })?.name || ''

      setFormData({
        name: selectedAnimal.name || '',
        breed: breedName,
        sex: selectedAnimal.sex || '',
        colour: selectedAnimal.colour || '',
        cost: selectedAnimal.cost || 0,
        lastVisit: selectedAnimal.lastVisit
          ? new Date(selectedAnimal.lastVisit).toISOString().split('T')[0]
          : '',
        thisVisit: selectedAnimal.thisVisit
          ? new Date(selectedAnimal.thisVisit).toISOString().split('T')[0]
          : '',
        comments: selectedAnimal.comments || '',
      })
    }
  }, [selectedAnimal])

  // Update selected breed object when breeds load or form breed changes
  useEffect(() => {
    if (formData.breed && breeds.length > 0) {
      const found = breeds.find(b => b.name === formData.breed)
      setSelectedBreed(found || null)
    }
  }, [formData.breed, breeds])

  const getPricingStatus = () => {
    if (!selectedBreed || selectedBreed.avgcost === null) return null

    const currentCost = formData.cost
    const standardCost = selectedBreed.avgcost

    if (currentCost === standardCost) {
      return {
        label: 'Breed-based pricing',
        color: 'bg-blue-100 text-blue-800',
      }
    } else if (currentCost < standardCost) {
      return {
        label: 'Discounted pricing',
        color: 'bg-green-100 text-green-800',
      }
    } else {
      return { label: 'Custom Pricing', color: 'bg-purple-100 text-purple-800' }
    }
  }

  const pricingStatus = getPricingStatus()

  const handleSearch = (query: string) => {
    router.push(query ? `/?q=${encodeURIComponent(query)}` : '/')
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedAnimal) {
      await updateAnimal(selectedAnimal.id, {
        ...formData,
        sex: formData.sex as 'Male' | 'Female' | 'Unknown',
      })
    }
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedAnimal && newNoteText.trim()) {
      await addNote(selectedAnimal.id, {
        notes: newNoteText,
        serviceDate: new Date().toISOString().split('T')[0],
      })
      setNewNoteText('')
    }
  }

  const initiateDeleteNote = (noteId: number, noteDate: Date | string) => {
    const formattedDate = new Date(noteDate).toLocaleDateString('en-AU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    setDeleteNoteConfirm({
      id: noteId,
      date: formattedDate,
      typedDate: '',
    })
  }

  const handleDeleteNote = async () => {
    if (selectedAnimal && deleteNoteConfirm) {
      await deleteNote(deleteNoteConfirm.id, selectedAnimal.id)
      setDeleteNoteConfirm(null)
    }
  }

  const canDeleteNote =
    deleteNoteConfirm && deleteNoteConfirm.typedDate === deleteNoteConfirm.date

  const handleChangeDates = async () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const today = `${year}-${month}-${day}`

    const updatedFormData = {
      ...formData,
      lastVisit: formData.thisVisit,
      thisVisit: today,
    }

    setFormData(updatedFormData)

    if (selectedAnimal) {
      await updateAnimal(selectedAnimal.id, {
        ...updatedFormData,
        sex: updatedFormData.sex as 'Male' | 'Female' | 'Unknown',
      })
    }
  }

  if (error) {
    return (
      <div className="app-layout">
        <Header
          onToggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
          sidebarPinned={sidebarPinned}
          onSearch={handleSearch}
          searchValue={searchQuery}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Animal Detail', current: true },
          ]}
        />
        <Sidebar
          isOpen={sidebarOpen}
          isPinned={sidebarPinned}
          onClose={() => setSidebarOpen(false)}
          onTogglePin={togglePin}
          currentPath={`/animals/${params.id}`}
          skipTransition={skipTransition}
        />
        <main
          className={`mt-6 mr-6 mb-6 flex-1 overflow-hidden rounded-2xl bg-white/95 p-6 shadow-xl backdrop-blur-[20px] ${
            skipTransition ? '' : 'transition-[margin-left] duration-[250ms]'
          }`}
          style={{
            marginLeft: sidebarPinned
              ? 'calc(var(--sidebar-width) + 1.5rem)'
              : '1.5rem',
          }}
        >
          <div style={{ color: 'var(--error)' }}>{error}</div>
        </main>
      </div>
    )
  }

  if (loading || !selectedAnimal) {
    return (
      <div className="app-layout">
        <Header
          onToggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
          sidebarPinned={sidebarPinned}
          onSearch={handleSearch}
          searchValue={searchQuery}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Animal Detail', current: true },
          ]}
        />
        <Sidebar
          isOpen={sidebarOpen}
          isPinned={sidebarPinned}
          onClose={() => setSidebarOpen(false)}
          onTogglePin={togglePin}
          currentPath={`/animals/${params.id}`}
          skipTransition={skipTransition}
        />
        <main
          className={`mt-6 mr-6 mb-6 flex-1 overflow-hidden rounded-2xl bg-white/95 p-6 shadow-xl backdrop-blur-[20px] ${
            skipTransition ? '' : 'transition-[margin-left] duration-[250ms]'
          }`}
          style={{
            marginLeft: sidebarPinned
              ? 'calc(var(--sidebar-width) + 1.5rem)'
              : '1.5rem',
          }}
        >
          <div>Loading...</div>
        </main>
      </div>
    )
  }

  const customer = selectedAnimal.customer
  const breedName = formData.breed || 'Unknown Breed'

  return (
    <div className="app-layout">
      <Header
        onToggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        sidebarPinned={sidebarPinned}
        onSearch={handleSearch}
        searchValue={searchQuery}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Animals', href: '/' },
          { label: selectedAnimal.name, current: true },
        ]}
      />
      <Sidebar
        isOpen={sidebarOpen}
        isPinned={sidebarPinned}
        onClose={() => setSidebarOpen(false)}
        onTogglePin={togglePin}
        currentPath={`/animals/${params.id}`}
        skipTransition={skipTransition}
      />
      <main
        className={`mt-6 mr-6 mb-6 flex-1 overflow-hidden rounded-2xl bg-white/95 p-6 shadow-xl backdrop-blur-[20px] ${
          skipTransition ? '' : 'transition-[margin-left] duration-[250ms]'
        }`}
        style={{
          marginLeft: sidebarPinned
            ? 'calc(var(--sidebar-width) + 1.5rem)'
            : '1.5rem',
        }}
      >
        <div>
          {/* Page Header */}
          <div className="page-header">
            <div className="page-title-section">
              <div className="title-with-avatar">
                <AnimalAvatar
                  animalName={selectedAnimal.name}
                  breedName={breedName}
                  size="2xl"
                />
                <div className="title-content">
                  <h1>{selectedAnimal.name}</h1>
                  <p className="page-subtitle">
                    {breedName} • {selectedAnimal.sex}
                  </p>
                </div>
              </div>
              <div className="form-actions">
                <button
                  onClick={() => router.push('/')}
                  className="btn btn-outline btn-large"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back to Search
                </button>
              </div>
            </div>

            {/* Customer Info Card */}
            <div className="customer-info-card">
              <div className="customer-details">
                <div className="customer-avatar">
                  {customer.surname.charAt(0).toUpperCase()}
                </div>
                <div className="customer-text">
                  <h3>
                    {customer.firstname} {customer.surname}
                  </h3>
                  <div className="customer-phone">
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {customer.phone1}
                  </div>
                </div>
              </div>
              <button
                onClick={() => router.push(`/customer/${customer.id}`)}
                className="btn btn-primary btn-large"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                View Customer
              </button>
            </div>
          </div>

          {/* Two-Column Grid */}
          <div className="content-grid">
            {/* Main Column: Animal Details Form */}
            <div className="main-column">
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Animal Details
                  </h2>
                </div>
                <div className="card-content">
                  <form className="form-grid" onSubmit={handleUpdate}>
                    {/* Animal Name */}
                    <div className="form-group">
                      <label className="form-label" htmlFor="animalName">
                        Animal Name
                      </label>
                      <input
                        type="text"
                        id="animalName"
                        className="form-input"
                        value={formData.name}
                        onChange={e =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>

                    {/* Breed */}
                    <div className="form-group">
                      <label className="form-label" htmlFor="breed">
                        Breed
                      </label>
                      <select
                        id="breed"
                        className="form-select"
                        value={formData.breed}
                        onChange={e =>
                          setFormData({ ...formData, breed: e.target.value })
                        }
                      >
                        <option value="">Select Breed...</option>
                        {breeds.map(breed => (
                          <option key={breed.id} value={breed.name}>
                            {breed.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sex */}
                    <div className="form-group">
                      <label className="form-label" htmlFor="sex">
                        Sex
                      </label>
                      <select
                        id="sex"
                        className="form-select"
                        value={formData.sex}
                        onChange={e =>
                          setFormData({ ...formData, sex: e.target.value })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>

                    {/* Colour */}
                    <div className="form-group">
                      <label className="form-label" htmlFor="colour">
                        Colour
                      </label>
                      <input
                        type="text"
                        id="colour"
                        className="form-input"
                        value={formData.colour}
                        onChange={e =>
                          setFormData({ ...formData, colour: e.target.value })
                        }
                      />
                    </div>

                    {/* Cost */}
                    <div className="form-group">
                      <label className="form-label" htmlFor="cost">
                        Cost ($)
                      </label>
                      <input
                        type="number"
                        id="cost"
                        className="form-input"
                        value={formData.cost}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            cost: parseInt(e.target.value, 10) || 0,
                          })
                        }
                        step="1"
                        min="0"
                      />
                      {pricingStatus && (
                        <div
                          className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${pricingStatus.color}`}
                        >
                          {pricingStatus.label}
                        </div>
                      )}
                    </div>

                    {/* Last Visit */}
                    <div className="form-group">
                      <label className="form-label" htmlFor="lastVisit">
                        Last Visit
                      </label>
                      <div className="date-input-wrapper">
                        <input
                          type="date"
                          id="lastVisit"
                          className="form-input"
                          value={formData.lastVisit}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              lastVisit: e.target.value,
                            })
                          }
                        />
                        <button
                          type="button"
                          className="calendar-btn"
                          aria-label="Open calendar"
                        >
                          <svg
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* This Visit */}
                    <div className="form-group">
                      <label className="form-label" htmlFor="thisVisit">
                        This Visit
                      </label>
                      <div className="date-input-wrapper">
                        <input
                          type="date"
                          id="thisVisit"
                          className="form-input"
                          value={formData.thisVisit}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              thisVisit: e.target.value,
                            })
                          }
                        />
                        <button
                          type="button"
                          className="calendar-btn"
                          aria-label="Open calendar"
                        >
                          <svg
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Comments */}
                    <div className="form-group full-width">
                      <label className="form-label" htmlFor="comments">
                        Comments
                      </label>
                      <textarea
                        id="comments"
                        className="form-textarea"
                        placeholder="Enter any comments or special instructions..."
                        value={formData.comments}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            comments: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Form Actions */}
                    <div className="form-group full-width">
                      <div className="form-actions">
                        <button
                          type="submit"
                          className="btn btn-success btn-large border-2 border-transparent transition-all duration-200 hover:scale-110 hover:border-[#047857] hover:bg-[#059669] hover:shadow-md"
                        >
                          <svg
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Update Record
                        </button>
                        <button
                          type="button"
                          onClick={handleChangeDates}
                          className="btn btn-warning btn-large border-2 border-transparent transition-all duration-200 hover:scale-110 hover:border-[#b45309] hover:bg-[#d97706] hover:shadow-md"
                        >
                          <svg
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          Change Dates
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Sidebar Column: Service History */}
            <div className="sidebar-column">
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Service History
                  </h2>
                </div>
                <div className="card-content">
                  {/* Add Note Section */}
                  <form className="add-note-section" onSubmit={handleAddNote}>
                    <label className="form-label" htmlFor="newNote">
                      Add Service Note
                    </label>
                    <textarea
                      id="newNote"
                      className="form-textarea"
                      placeholder="Enter service details (e.g., full clip 3 legs 7 short ears & face leave top knot CC $60)"
                      value={newNoteText}
                      onChange={e => setNewNoteText(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary btn-large border-2 border-transparent transition-all duration-200 hover:scale-110 hover:border-[var(--primary-dark)] hover:bg-[var(--primary-hover)] hover:shadow-md"
                    >
                      <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Insert NOTE
                    </button>
                  </form>

                  {/* Service History List */}
                  <div
                    className="service-list flex flex-col gap-4"
                    style={{ marginTop: 'var(--space-6)' }}
                  >
                    {selectedAnimal.serviceNotes &&
                    selectedAnimal.serviceNotes.length > 0 ? (
                      selectedAnimal.serviceNotes.map(note => {
                        // Extract price from note text
                        const priceMatch = note.notes.match(/\$(\d+)/)
                        const price = priceMatch ? `$${priceMatch[1]}` : null

                        // Extract technician code (2-3 letters at end, or any 2-char word at end)
                        const techMatch = note.notes.match(
                          /\b([A-Za-z]{2,3})\b\s*\.?\s*$/
                        )
                        const tech = techMatch
                          ? techMatch[1].toUpperCase()
                          : null

                        return (
                          <div
                            key={note.id}
                            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                            style={{ borderLeft: '4px solid var(--primary)' }}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                {/* Date at top */}
                                <div
                                  className="mb-2 text-lg font-semibold italic"
                                  style={{ color: 'var(--primary)' }}
                                >
                                  {new Date(
                                    note.serviceDate
                                  ).toLocaleDateString('en-AU', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                  })}
                                </div>
                                {/* Note text */}
                                <div className="mb-3 text-sm text-gray-700">
                                  {note.notes}
                                </div>
                                {/* Price and Tech badges */}
                                <div className="flex items-center gap-3">
                                  {tech && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
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
                                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                      </svg>
                                      {tech}
                                    </span>
                                  )}
                                  {price && (
                                    <span
                                      className="text-lg font-bold"
                                      style={{ color: 'var(--success)' }}
                                    >
                                      {price}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() =>
                                  initiateDeleteNote(note.id, note.serviceDate)
                                }
                                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-red-200 text-red-500 transition-colors hover:bg-red-50"
                                title="Delete note"
                              >
                                <svg
                                  className="h-5 w-5"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-gray-500">No service notes yet.</p>
                    )}
                  </div>

                  {/* View All Link */}
                  {selectedAnimal.serviceNotes &&
                    selectedAnimal.serviceNotes.length > 0 && (
                      <Link
                        href={routes.animals.notes(selectedAnimal.id)}
                        className="view-all-link"
                      >
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        All Animal Notes
                      </Link>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Note Confirmation Modal */}
      {deleteNoteConfirm && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[400] bg-black/40"
            onClick={() => setDeleteNoteConfirm(null)}
          />
          {/* Modal */}
          <div className="fixed inset-0 z-[401] flex items-center justify-center p-4">
            <div
              className="w-full max-w-lg animate-[slideInUp_0.2s_ease-out] rounded-xl border-2 border-red-500 bg-white shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start gap-4 border-b border-gray-200 p-6">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-red-600">
                    Delete this note?
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This action cannot be undone.
                  </p>
                </div>
                <button
                  onClick={() => setDeleteNoteConfirm(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                <p className="mb-4 text-sm text-gray-700">
                  To confirm deletion, type the note date below:
                </p>
                <div className="mb-4 rounded-lg bg-red-50 px-4 py-2">
                  <code className="font-mono text-lg font-bold text-red-600">
                    {deleteNoteConfirm.date}
                  </code>
                </div>
                <input
                  type="text"
                  value={deleteNoteConfirm.typedDate}
                  onChange={e =>
                    setDeleteNoteConfirm({
                      ...deleteNoteConfirm,
                      typedDate: e.target.value,
                    })
                  }
                  placeholder={deleteNoteConfirm.date}
                  className="w-full rounded-lg border-2 border-red-300 px-4 py-3 text-center font-mono text-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:outline-none"
                  autoFocus
                />
              </div>

              {/* Footer */}
              <div className="flex gap-3 border-t border-gray-200 p-6">
                <button
                  onClick={() => setDeleteNoteConfirm(null)}
                  className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteNote}
                  disabled={!canDeleteNote}
                  className={`flex-1 rounded-lg px-6 py-3 font-semibold text-white transition-colors ${
                    canDeleteNote
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'cursor-not-allowed bg-gray-300 text-gray-500'
                  }`}
                >
                  Delete Note
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
