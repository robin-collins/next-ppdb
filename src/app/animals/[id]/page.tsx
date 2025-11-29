'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAnimalsStore } from '@/store/animalsStore'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { routes } from '@/lib/routes'

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

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarPinned, setSidebarPinned] = useState(false)
  const [searchQuery, _setSearchQuery] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sex: '',
    colour: '',
    cost: 0,
    lastVisit: '',
    thisVisit: '',
    comments: '',
  })

  // Notes state
  const [newNoteText, setNewNoteText] = useState('')

  useEffect(() => {
    const idNum = Number(params.id)
    if (Number.isFinite(idNum)) {
      fetchAnimal(idNum)
    }
  }, [params.id, fetchAnimal])

  useEffect(() => {
    if (selectedAnimal) {
      setFormData({
        name: selectedAnimal.name || '',
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

  const handleDeleteNote = async (noteId: number) => {
    if (selectedAnimal && confirm('Delete this note?')) {
      await deleteNote(noteId, selectedAnimal.id)
    }
  }

  const handleChangeDates = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const today = `${year}-${month}-${day}`

    setFormData(prev => ({
      ...prev,
      lastVisit: prev.thisVisit,
      thisVisit: today,
    }))
  }

  if (error) {
    return (
      <div className="app-layout">
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
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
          onTogglePin={() => setSidebarPinned(!sidebarPinned)}
          currentPath={`/animals/${params.id}`}
        />
        <main className={sidebarPinned ? 'sidebar-pinned' : ''}>
          <div className="main-content">
            <div className="content-wrapper">
              <div style={{ color: 'var(--error)' }}>{error}</div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (loading || !selectedAnimal) {
    return (
      <div className="app-layout">
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
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
          onTogglePin={() => setSidebarPinned(!sidebarPinned)}
          currentPath={`/animals/${params.id}`}
        />
        <main className={sidebarPinned ? 'sidebar-pinned' : ''}>
          <div className="main-content">
            <div className="content-wrapper">Loading...</div>
          </div>
        </main>
      </div>
    )
  }

  const customer = selectedAnimal.customer
  const breedName =
    typeof selectedAnimal.breed === 'string'
      ? selectedAnimal.breed
      : (selectedAnimal.breed as { name: string })?.name || 'Unknown Breed'

  return (
    <div className="app-layout">
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
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
        onTogglePin={() => setSidebarPinned(!sidebarPinned)}
        currentPath={`/animals/${params.id}`}
      />
      <main className={sidebarPinned ? 'sidebar-pinned' : ''}>
        <div className="main-content">
          <div className="content-wrapper">
            {/* Page Header */}
            <div className="page-header">
              <div className="page-title-section">
                <div className="title-with-avatar">
                  <div className="animal-avatar-large">
                    {selectedAnimal.name.charAt(0).toUpperCase()}
                  </div>
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
                        <input
                          type="text"
                          id="breed"
                          className="form-input"
                          value={breedName}
                          readOnly
                        />
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
                              cost: parseFloat(e.target.value),
                            })
                          }
                          step="0.01"
                          min="0"
                        />
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
                      className="service-list"
                      style={{ marginTop: 'var(--space-6)' }}
                    >
                      {selectedAnimal.serviceNotes &&
                      selectedAnimal.serviceNotes.length > 0 ? (
                        selectedAnimal.serviceNotes.map(note => (
                          <div key={note.id} className="service-item">
                            <div className="service-date">
                              {new Date(note.serviceDate).toLocaleDateString(
                                'en-AU',
                                {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                }
                              )}
                            </div>
                            <div className="service-details">{note.notes}</div>
                            <div className="service-actions">
                              <button
                                type="button"
                                className="delete-note-btn"
                                onClick={() => handleDeleteNote(note.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
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
        </div>
      </main>
    </div>
  )
}
