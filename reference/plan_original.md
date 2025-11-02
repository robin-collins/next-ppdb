## 📋 **MVP Development Plan**

### **Phase 1: Database Migration (Day 1-2)**

```bash
# 1. Initialize Next.js project with src directory
pnpm create next-app@latest ppdb-ts --typescript --tailwind --src-dir --app

# 2. Add Prisma, Zod validation, and Zustand state management
pnpm add prisma @prisma/client zod zustand
pnpm add -D @types/node
pnpm dlx prisma init
```

```typescript
// prisma/schema.prisma - MVP Schema
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Customer {
  id        Int      @id @default(autoincrement())
  firstName String?  @map("firstname")
  surname   String
  address   String?
  suburb    String?
  postcode  String?
  phone1    String?
  phone2    String?
  phone3    String?
  email     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  animals   Animal[]

  @@map("customers")
}

model Animal {
  id          Int      @id @default(autoincrement())
  customerId  Int      @map("customer_id")
  name        String   @map("animal_name")
  breed       String
  sex         String
  colour      String?
  cost        Decimal? @db.Decimal(8,2)
  lastVisit   DateTime? @map("last_visit")
  thisVisit   DateTime? @map("this_visit")
  comments    String?  @db.Text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  customer    Customer @relation(fields: [customerId], references: [id])
  serviceNotes ServiceNote[]

  @@map("animals")
}

model ServiceNote {
  id           Int      @id @default(autoincrement())
  animalId     Int      @map("animal_id")
  serviceDate  DateTime @map("service_date")
  serviceDetails String @map("service_details") @db.Text
  cost         Decimal? @db.Decimal(8,2)
  technicianCode String? @map("technician_code")
  createdAt    DateTime @default(now())

  animal       Animal   @relation(fields: [animalId], references: [id])

  @@map("service_notes")
}

model Breed {
  id       Int     @id @default(autoincrement())
  name     String  @unique
  avgTime  String? @map("avg_time")
  avgCost  Decimal? @map("avg_cost") @db.Decimal(8,2)

  @@map("breeds")
}
```

### **Phase 2: Core API Routes (Day 2-3)**

```typescript
// src/app/api/animals/route.ts - Search & List
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  searchAnimalsSchema,
  createAnimalSchema,
} from '@/lib/validations/animal'

// GET /api/animals?search=cody&breed=corgi&page=1
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // Validate query parameters with Zod
  const validationResult = searchAnimalsSchema.safeParse({
    search: searchParams.get('search') || '',
    breed: searchParams.get('breed') || '',
    surname: searchParams.get('surname') || '',
    page: parseInt(searchParams.get('page') || '1'),
  })

  if (!validationResult.success) {
    return NextResponse.json(
      {
        error: 'Invalid query parameters',
        details: validationResult.error.issues,
      },
      { status: 400 }
    )
  }

  const { search, breed, surname, page } = validationResult.data
  const limit = 20

  const where = {
    AND: [
      search ? { name: { contains: search } } : {},
      breed ? { breed: { contains: breed } } : {},
      surname ? { customer: { surname: { contains: surname } } } : {},
    ].filter(condition => Object.keys(condition).length > 0),
  }

  const [animals, total] = await Promise.all([
    prisma.animal.findMany({
      where,
      include: { customer: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: 'asc' },
    }),
    prisma.animal.count({ where }),
  ])

  return NextResponse.json({
    animals,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}

// POST /api/animals - Create new animal
export async function POST(request: NextRequest) {
  const body = await request.json()

  // Validate request body with Zod
  const validationResult = createAnimalSchema.safeParse(body)

  if (!validationResult.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: validationResult.error.issues },
      { status: 400 }
    )
  }

  const data = validationResult.data

  const animal = await prisma.animal.create({
    data: {
      customerId: data.customerId,
      name: data.name,
      breed: data.breed,
      sex: data.sex,
      colour: data.colour,
      cost: data.cost,
      lastVisit: data.lastVisit ? new Date(data.lastVisit) : null,
      thisVisit: data.thisVisit ? new Date(data.thisVisit) : null,
      comments: data.comments,
    },
    include: { customer: true },
  })

  return NextResponse.json(animal, { status: 201 })
}
```

```typescript
// src/app/api/animals/[id]/route.ts - Individual Animal CRUD
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateAnimalSchema } from '@/lib/validations/animal'
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const animal = await prisma.animal.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      customer: true,
      serviceNotes: {
        orderBy: { serviceDate: 'desc' },
      },
    },
  })

  if (!animal) {
    return NextResponse.json({ error: 'Animal not found' }, { status: 404 })
  }

  return NextResponse.json(animal)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()

  // Validate request body with Zod
  const validationResult = updateAnimalSchema.safeParse(body)

  if (!validationResult.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: validationResult.error.issues },
      { status: 400 }
    )
  }

  const data = validationResult.data

  const animal = await prisma.animal.update({
    where: { id: parseInt(params.id) },
    data: {
      name: data.name,
      breed: data.breed,
      sex: data.sex,
      colour: data.colour,
      cost: data.cost,
      lastVisit: data.lastVisit ? new Date(data.lastVisit) : null,
      thisVisit: data.thisVisit ? new Date(data.thisVisit) : null,
      comments: data.comments,
    },
    include: { customer: true, serviceNotes: true },
  })

  return NextResponse.json(animal)
}
```

### **Phase 3: Essential Frontend Components (Day 3-4)**

```typescript
// src/components/SearchForm.tsx
'use client'
import { useState } from 'react'
import { useAnimalsStore } from '@/store/animalsStore'

interface SearchFormProps {
  onSearch: (params: SearchParams) => void
}

interface SearchParams {
  animal: string
  breed: string
  surname: string
}

export default function SearchForm({ onSearch }: SearchFormProps) {
  const { searchParams, setSearchParams, clearSearch } = useAnimalsStore()

  const [localParams, setLocalParams] = useState<SearchParams>({
    animal: searchParams.animal || '',
    breed: searchParams.breed || '',
    surname: searchParams.surname || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams(localParams)
    onSearch(localParams)
  }

  const handleClear = () => {
    const cleared = { animal: '', breed: '', surname: '' }
    setLocalParams(cleared)
    clearSearch()
    onSearch(cleared)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-blue-600 p-4 rounded-lg">
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-white mb-1">ANIMAL NAME</label>
          <input
            type="text"
            value={localParams.animal}
            onChange={(e) => setLocalParams({...localParams, animal: e.target.value})}
            className="px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-white mb-1">BREED</label>
          <input
            type="text"
            value={localParams.breed}
            onChange={(e) => setLocalParams({...localParams, breed: e.target.value})}
            className="px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-white mb-1">SURNAME</label>
          <input
            type="text"
            value={localParams.surname}
            onChange={(e) => setLocalParams({...localParams, surname: e.target.value})}
            className="px-3 py-2 rounded"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="bg-blue-800 text-white px-4 py-2 rounded">
          Find Animal
        </button>
        <button type="button" onClick={handleClear} className="bg-gray-600 text-white px-4 py-2 rounded">
          CLEAR
        </button>
      </div>
    </form>
  )
}
```

```typescript
// src/components/AnimalList.tsx
import Link from 'next/link'
import { useAnimalsStore } from '@/store/animalsStore'

interface Animal {
  id: number
  name: string
  breed: string
  colour: string | null
  customer: {
    id: number
    surname: string
  }
}

interface AnimalListProps {
  animals: Animal[]
  total: number
  page: number
  totalPages: number
}

export default function AnimalList({ animals, total, page, totalPages }: AnimalListProps) {
  const { setSelectedAnimal } = useAnimalsStore()

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="bg-gray-800 text-white p-3 flex justify-between">
        <span>Dogs {((page-1) * 20) + 1} - {Math.min(page * 20, total)} of {total} TOTAL</span>
        <div className="flex gap-2">
          {page > 1 && (
            <Link href={`?page=${page-1}`} className="text-blue-300 hover:underline">
              ←Prev 20
            </Link>
          )}
          {page < totalPages && (
            <Link href={`?page=${page+1}`} className="text-blue-300 hover:underline">
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
              <tr key={animal.id} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
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
                  <Link href={`/customers/${animal.customer.id}`} className="text-blue-600 hover:underline">
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
```

### **Phase 4: Key Pages (Day 4-5)**

```typescript
// src/app/page.tsx - Main Dashboard
'use client'
import { useState, useEffect } from 'react'
import SearchForm from '@/components/SearchForm'
import AnimalList from '@/components/AnimalList'
import { useAnimalsStore } from '@/store/animalsStore'

export default function HomePage() {
  const {
    animals,
    pagination,
    loading,
    searchAnimals,
    setLoading
  } = useAnimalsStore()

  const handleSearch = async (params: any) => {
    await searchAnimals({
      search: params.animal,
      breed: params.breed,
      surname: params.surname,
      page: 1
    })
  }

  return (
    <div className="min-h-screen bg-blue-500 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-white text-3xl text-center mb-6">
          THE PAMPERED POOCH<br />
          CUSTOMER RECORD DB
        </h1>

        <SearchForm onSearch={handleSearch} />

        {loading ? (
          <div className="text-white text-center mt-8">Searching...</div>
        ) : animals.length > 0 ? (
          <div className="mt-6">
            <AnimalList
              animals={animals}
              total={pagination.total}
              page={pagination.page}
              totalPages={pagination.totalPages}
            />
          </div>
        ) : (
          <div className="text-white text-center mt-8">
            Enter search criteria and click "Find Animal"
          </div>
        )}
      </div>
    </div>
  )
}
```

## 🚀 **Fast Implementation Steps**

### **Day 1: Setup & Database**

```bash
# 1. Create project with src directory
pnpm create next-app@latest ppdb-ts --typescript --tailwind --src-dir --app

# 2. Install dependencies
pnpm add prisma @prisma/client zod zustand
pnpm add -D @types/node

# 3. Database setup
pnpm dlx prisma init
# Configure DATABASE_URL in .env
pnpm dlx prisma db pull  # Import existing schema
pnpm dlx prisma generate
```

### **Day 2-3: Core APIs**

- Create Zod validation schemas (`src/lib/validations/`)
- Implement search API (`src/app/api/animals`)
- Animal CRUD APIs (`src/app/api/animals/[id]`)
- Customer APIs (`src/app/api/customers`)
- Breed management APIs (`src/app/api/breeds`)

### **Day 4-5: Essential UI**

- Create Zustand stores (`src/store/`)
- Main search interface (`src/components/`)
- Animal list with pagination
- Individual animal view
- Basic CRUD forms

## 🎯 **MVP Feature Priority**

### **Must Have (Week 1)**

1. ✅ **Search functionality** - Core business need
2. ✅ **Animal records view** - Daily operations
3. ✅ **Customer lookup** - Essential workflow
4. ✅ **Service notes display** - Historical data
5. ✅ **Basic CRUD operations** - Data management

### **Should Have (Week 2)**

6. **Add/Edit forms** - Data entry
7. **Breed management** - Pricing reference
8. **Daily totals** - Business reporting
9. **Data export** - Backup functionality

### **Nice to Have (Later)**

10. Mobile responsive design
11. Advanced filtering
12. Print functionality
13. User authentication

## 🔧 **Why This Stack for MVP**

### **Next.js Advantages**

- ✅ **Full-stack in one framework** - Faster development
- ✅ **TypeScript built-in** - Type safety from day 1
- ✅ **API routes** - No separate backend needed
- ✅ **File-based routing** - Intuitive organization
- ✅ **Built-in optimization** - Performance out of the box

### **Prisma Benefits**

- ✅ **Auto-generated types** - Perfect TypeScript integration
- ✅ **Database introspection** - Import existing schema easily
- ✅ **Query builder** - Type-safe database queries
- ✅ **Migration system** - Safe schema changes

### **Keep MySQL**

- ✅ **Zero data risk** - Don't migrate 6+ years of data
- ✅ **Proven performance** - Handles 3,953+ records well
- ✅ **Existing backups** - Current backup system works

### **PNPM Package Manager**

- ✅ **Faster installs** - Up to 2x faster than npm
- ✅ **Disk space efficient** - Shared node_modules across projects
- ✅ **Strict dependency resolution** - Prevents phantom dependencies
- ✅ **Better monorepo support** - Built-in workspace management
- ✅ **Drop-in replacement** - Compatible with npm scripts and commands

## ⚡ **Estimated Timeline**

- **Week 1**: MVP with core search/view functionality
- **Week 2**: Complete CRUD operations
- **Week 3**: Polish and deployment
- **Week 4**: Staff training and migration

This approach maintains **100% feature parity** while modernizing the tech stack with minimal risk and maximum speed.

---

## 🔧 **Zod & Zustand Integration Addendum**

### **Zod Validation Schema Setup**

```typescript
// src/lib/validations/animal.ts
import { z } from 'zod'

export const searchAnimalsSchema = z.object({
  search: z.string().optional().default(''),
  breed: z.string().optional().default(''),
  surname: z.string().optional().default(''),
  page: z.number().int().positive().default(1),
})

export const createAnimalSchema = z.object({
  customerId: z.number().int().positive(),
  name: z.string().min(1, 'Animal name is required').max(50),
  breed: z.string().min(1, 'Breed is required').max(50),
  sex: z.enum(['Male', 'Female', 'Unknown']),
  colour: z.string().max(30).optional(),
  cost: z.number().decimal().positive().optional(),
  lastVisit: z.string().datetime().optional(),
  thisVisit: z.string().datetime().optional(),
  comments: z.string().max(1000).optional(),
})

export const updateAnimalSchema = createAnimalSchema
  .partial()
  .omit({ customerId: true })

export type SearchAnimalsInput = z.infer<typeof searchAnimalsSchema>
export type CreateAnimalInput = z.infer<typeof createAnimalSchema>
export type UpdateAnimalInput = z.infer<typeof updateAnimalSchema>
```

```typescript
// src/lib/validations/customer.ts
import { z } from 'zod'

export const createCustomerSchema = z.object({
  firstName: z.string().max(50).optional(),
  surname: z.string().min(1, 'Surname is required').max(50),
  address: z.string().max(100).optional(),
  suburb: z.string().max(50).optional(),
  postcode: z.string().max(10).optional(),
  phone1: z.string().max(20).optional(),
  phone2: z.string().max(20).optional(),
  phone3: z.string().max(20).optional(),
  email: z.string().email('Invalid email format').optional(),
})

export const updateCustomerSchema = createCustomerSchema.partial()

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
```

```typescript
// src/lib/validations/serviceNote.ts
import { z } from 'zod'

export const createServiceNoteSchema = z.object({
  animalId: z.number().int().positive(),
  serviceDate: z.string().datetime(),
  serviceDetails: z.string().min(1, 'Service details are required').max(2000),
  cost: z.number().decimal().positive().optional(),
  technicianCode: z.string().max(10).optional(),
})

export const updateServiceNoteSchema = createServiceNoteSchema
  .partial()
  .omit({ animalId: true })

export type CreateServiceNoteInput = z.infer<typeof createServiceNoteSchema>
export type UpdateServiceNoteInput = z.infer<typeof updateServiceNoteSchema>
```

### **Zustand Store Implementation**

```typescript
// src/store/animalsStore.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Animal, Customer } from '@prisma/client'

interface SearchParams {
  search?: string
  breed?: string
  surname?: string
  page?: number
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface AnimalsState {
  // Data
  animals: (Animal & { customer: Customer })[]
  selectedAnimal: (Animal & { customer: Customer }) | null
  pagination: PaginationData
  searchParams: SearchParams
  loading: boolean
  error: string | null

  // Actions
  setAnimals: (animals: (Animal & { customer: Customer })[]) => void
  setSelectedAnimal: (animal: (Animal & { customer: Customer }) | null) => void
  setPagination: (pagination: PaginationData) => void
  setSearchParams: (params: SearchParams) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearSearch: () => void

  // API Actions
  searchAnimals: (params: SearchParams) => Promise<void>
  fetchAnimal: (id: number) => Promise<void>
  createAnimal: (data: any) => Promise<void>
  updateAnimal: (id: number, data: any) => Promise<void>
  deleteAnimal: (id: number) => Promise<void>
}

export const useAnimalsStore = create<AnimalsState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        animals: [],
        selectedAnimal: null,
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        searchParams: {},
        loading: false,
        error: null,

        // Basic setters
        setAnimals: animals => set({ animals }),
        setSelectedAnimal: animal => set({ selectedAnimal: animal }),
        setPagination: pagination => set({ pagination }),
        setSearchParams: params => set({ searchParams: params }),
        setLoading: loading => set({ loading }),
        setError: error => set({ error }),
        clearSearch: () =>
          set({
            searchParams: {},
            animals: [],
            pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
          }),

        // API Actions
        searchAnimals: async params => {
          set({ loading: true, error: null })
          try {
            const query = new URLSearchParams({
              search: params.search || '',
              breed: params.breed || '',
              surname: params.surname || '',
              page: (params.page || 1).toString(),
            }).toString()

            const response = await fetch(`/api/animals?${query}`)

            if (!response.ok) {
              throw new Error('Failed to search animals')
            }

            const data = await response.json()

            set({
              animals: data.animals,
              pagination: data.pagination,
              searchParams: params,
            })
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Search failed',
            })
          } finally {
            set({ loading: false })
          }
        },

        fetchAnimal: async id => {
          set({ loading: true, error: null })
          try {
            const response = await fetch(`/api/animals/${id}`)

            if (!response.ok) {
              throw new Error('Failed to fetch animal')
            }

            const animal = await response.json()
            set({ selectedAnimal: animal })
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to fetch animal',
            })
          } finally {
            set({ loading: false })
          }
        },

        createAnimal: async data => {
          set({ loading: true, error: null })
          try {
            const response = await fetch('/api/animals', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            })

            if (!response.ok) {
              const errorData = await response.json()
              throw new Error(errorData.error || 'Failed to create animal')
            }

            const newAnimal = await response.json()

            // Refresh the current search
            const { searchParams } = get()
            if (Object.keys(searchParams).length > 0) {
              await get().searchAnimals(searchParams)
            }
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to create animal',
            })
          } finally {
            set({ loading: false })
          }
        },

        updateAnimal: async (id, data) => {
          set({ loading: true, error: null })
          try {
            const response = await fetch(`/api/animals/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            })

            if (!response.ok) {
              const errorData = await response.json()
              throw new Error(errorData.error || 'Failed to update animal')
            }

            const updatedAnimal = await response.json()

            // Update selected animal if it's the one being updated
            const { selectedAnimal } = get()
            if (selectedAnimal && selectedAnimal.id === id) {
              set({ selectedAnimal: updatedAnimal })
            }

            // Refresh the current search
            const { searchParams } = get()
            if (Object.keys(searchParams).length > 0) {
              await get().searchAnimals(searchParams)
            }
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to update animal',
            })
          } finally {
            set({ loading: false })
          }
        },

        deleteAnimal: async id => {
          set({ loading: true, error: null })
          try {
            const response = await fetch(`/api/animals/${id}`, {
              method: 'DELETE',
            })

            if (!response.ok) {
              throw new Error('Failed to delete animal')
            }

            // Clear selected animal if it's the one being deleted
            const { selectedAnimal } = get()
            if (selectedAnimal && selectedAnimal.id === id) {
              set({ selectedAnimal: null })
            }

            // Refresh the current search
            const { searchParams } = get()
            if (Object.keys(searchParams).length > 0) {
              await get().searchAnimals(searchParams)
            }
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to delete animal',
            })
          } finally {
            set({ loading: false })
          }
        },
      }),
      {
        name: 'animals-storage',
        partialize: state => ({
          searchParams: state.searchParams,
          selectedAnimal: state.selectedAnimal,
        }),
      }
    ),
    {
      name: 'animals-store',
    }
  )
)
```

```typescript
// src/store/customersStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Customer, Animal } from '@prisma/client'

interface CustomersState {
  customers: Customer[]
  selectedCustomer: (Customer & { animals: Animal[] }) | null
  loading: boolean
  error: string | null

  // Actions
  setCustomers: (customers: Customer[]) => void
  setSelectedCustomer: (
    customer: (Customer & { animals: Animal[] }) | null
  ) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // API Actions
  searchCustomers: (surname: string) => Promise<void>
  fetchCustomer: (id: number) => Promise<void>
  createCustomer: (data: any) => Promise<void>
  updateCustomer: (id: number, data: any) => Promise<void>
}

export const useCustomersStore = create<CustomersState>()(
  devtools(
    (set, get) => ({
      customers: [],
      selectedCustomer: null,
      loading: false,
      error: null,

      setCustomers: customers => set({ customers }),
      setSelectedCustomer: customer => set({ selectedCustomer: customer }),
      setLoading: loading => set({ loading }),
      setError: error => set({ error }),

      searchCustomers: async surname => {
        set({ loading: true, error: null })
        try {
          const response = await fetch(
            `/api/customers?surname=${encodeURIComponent(surname)}`
          )

          if (!response.ok) {
            throw new Error('Failed to search customers')
          }

          const customers = await response.json()
          set({ customers })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Search failed',
          })
        } finally {
          set({ loading: false })
        }
      },

      fetchCustomer: async id => {
        set({ loading: true, error: null })
        try {
          const response = await fetch(`/api/customers/${id}`)

          if (!response.ok) {
            throw new Error('Failed to fetch customer')
          }

          const customer = await response.json()
          set({ selectedCustomer: customer })
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch customer',
          })
        } finally {
          set({ loading: false })
        }
      },

      createCustomer: async data => {
        set({ loading: true, error: null })
        try {
          const response = await fetch('/api/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to create customer')
          }

          // Optionally refresh customers list
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to create customer',
          })
        } finally {
          set({ loading: false })
        }
      },

      updateCustomer: async (id, data) => {
        set({ loading: true, error: null })
        try {
          const response = await fetch(`/api/customers/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to update customer')
          }

          const updatedCustomer = await response.json()

          // Update selected customer if it's the one being updated
          const { selectedCustomer } = get()
          if (selectedCustomer && selectedCustomer.id === id) {
            set({ selectedCustomer: updatedCustomer })
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to update customer',
          })
        } finally {
          set({ loading: false })
        }
      },
    }),
    {
      name: 'customers-store',
    }
  )
)
```

### **Enhanced Error Handling Component**

```typescript
// src/components/ErrorBoundary.tsx
'use client'
import { useEffect } from 'react'
import { useAnimalsStore } from '@/store/animalsStore'

interface ErrorDisplayProps {
  error?: string | null
  onClear?: () => void
}

export function ErrorDisplay({ error, onClear }: ErrorDisplayProps) {
  if (!error) return null

  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <div className="flex justify-between items-center">
        <span>{error}</span>
        {onClear && (
          <button
            onClick={onClear}
            className="text-red-500 hover:text-red-700 font-bold"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}

// Usage in components
export function SearchFormWithErrorHandling() {
  const { error, setError } = useAnimalsStore()

  return (
    <>
      <ErrorDisplay error={error} onClear={() => setError(null)} />
      {/* Rest of component */}
    </>
  )
}
```

### **Integration Benefits**

#### **Zod Validation Advantages**

- ✅ **Runtime type safety** - Catch invalid data before it reaches the database
- ✅ **Automatic TypeScript types** - Generated types from schemas
- ✅ **Consistent validation** - Same rules for frontend and backend
- ✅ **Detailed error messages** - User-friendly validation feedback
- ✅ **Schema composition** - Reuse validation logic across endpoints

#### **Zustand State Management Benefits**

- ✅ **Minimal boilerplate** - Less code than Redux or Context API
- ✅ **TypeScript first** - Excellent TypeScript support out of the box
- ✅ **DevTools integration** - Debug state changes easily
- ✅ **Persistence support** - Automatically save/restore state
- ✅ **No providers needed** - Direct hook usage in components
- ✅ **Optimized re-renders** - Only components using changed state re-render

### **File Structure with Zod & Zustand**

```
src/
├── app/
│   ├── api/
│   │   ├── animals/
│   │   ├── customers/
│   │   └── breeds/
│   ├── animals/
│   ├── customers/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── SearchForm.tsx
│   ├── AnimalList.tsx
│   ├── ErrorBoundary.tsx
│   └── ui/
├── lib/
│   ├── prisma.ts
│   └── validations/
│       ├── animal.ts
│       ├── customer.ts
│       └── serviceNote.ts
└── store/
    ├── animalsStore.ts
    ├── customersStore.ts
    └── index.ts
```

This integration provides **type-safe, validated, and centrally managed state** while maintaining the original design principles and feature parity of the MVP.
