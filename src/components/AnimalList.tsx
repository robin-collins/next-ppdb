// src/components/AnimalList.tsx
import Link from 'next/link'
import { useAnimalsStore } from '@/store/animalsStore'

// Use the same Animal interface as the store
interface Animal {
  id: number
  name: string
  breed: string
  colour: string | null
  sex: 'Male' | 'Female'
  cost: number
  lastVisit: Date
  thisVisit: Date
  comments: string | null
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
    email?: string | null
  }
  serviceNotes?: {
    id: number
    animalId: number
    notes: string
    serviceDate: Date
  }[]
}

interface AnimalListProps {
  animals: Animal[]
  total: number
  page: number
  totalPages: number
}

export default function AnimalList({
  animals,
  total,
  page,
  totalPages,
}: AnimalListProps) {
  const { setSelectedAnimal } = useAnimalsStore()

  return (
    <div className="rounded-lg bg-white shadow">
      <div className="flex justify-between bg-gray-800 p-3 text-white">
        <span>
          Dogs {(page - 1) * 20 + 1} - {Math.min(page * 20, total)} of {total}{' '}
          TOTAL
        </span>
        <div className="flex gap-2">
          {page > 1 && (
            <Link
              href={`?page=${page - 1}`}
              className="text-blue-300 hover:underline"
            >
              ←Prev 20
            </Link>
          )}
          {page < totalPages && (
            <Link
              href={`?page=${page + 1}`}
              className="text-blue-300 hover:underline"
            >
              Next 20→
            </Link>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-600 text-white">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Colour</th>
              <th className="p-2 text-left">Breed</th>
              <th className="p-2 text-left">Owner</th>
            </tr>
          </thead>
          <tbody>
            {animals.map((animal, index) => (
              <tr
                key={animal.id}
                className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}
              >
                <td className="p-2">
                  <Link
                    href={`/animals/${animal.id}`}
                    className="text-blue-600 hover:underline"
                    onClick={() => setSelectedAnimal(animal)}
                  >
                    {animal.name}
                  </Link>
                </td>
                <td className="p-2">{animal.colour}</td>
                <td className="p-2">{animal.breed}</td>
                <td className="p-2">
                  <Link
                    href={`/customers/${animal.customer.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {animal.customer.surname}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
