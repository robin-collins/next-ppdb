'use client'
import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAnimalsStore } from '@/store/animalsStore'
import AnimalHeader from '@/components/animals/AnimalHeader'
import AnimalInfoCard from '@/components/animals/AnimalInfoCard'
import ServiceNotesCard from '@/components/animals/ServiceNotesCard'

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

  useEffect(() => {
    const idNum = Number(params.id)
    if (Number.isFinite(idNum)) {
      fetchAnimal(idNum)
    }
  }, [params.id, fetchAnimal])

  if (error) {
    return (
      <div className="main-content">
        <div className="content-wrapper">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    )
  }

  if (loading || !selectedAnimal) {
    return (
      <div className="main-content">
        <div className="content-wrapper">Loading...</div>
      </div>
    )
  }

  const onAddNote = async (text: string, serviceDate?: string) => {
    await addNote(selectedAnimal.id, { notes: text, serviceDate })
  }
  const onDeleteNote = async (noteId: number) => {
    await deleteNote(noteId, selectedAnimal.id)
  }

  return (
    <div className="main-content">
      <div className="content-wrapper content-grid">
        <div className="main-column">
          <AnimalHeader
            customer={selectedAnimal.customer}
            animalName={selectedAnimal.name}
          />
          <AnimalInfoCard
            animal={selectedAnimal}
            onUpdate={partial => updateAnimal(selectedAnimal.id, partial)}
          />
          <ServiceNotesCard
            notes={selectedAnimal.serviceNotes || []}
            onAddNote={onAddNote}
            onDeleteNote={onDeleteNote}
          />
        </div>
        <div className="sidebar-column">
          <button className="btn btn-outline" onClick={() => router.push('/')}>
            Back to Search
          </button>
        </div>
      </div>
    </div>
  )
}
