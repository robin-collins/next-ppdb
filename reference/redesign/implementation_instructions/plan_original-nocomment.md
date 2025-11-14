## 🚀 **Recommended MVP Stack**

### **Best Choice: Next.js + Prisma + MySQL**

**Why**: Single framework handles both frontend/backend, excellent TypeScript support, rapid development

```typescript
// Stack Overview
Frontend: Next.js 14 + React + TypeScript + TailwindCSS
Backend: Next.js API Routes + TypeScript
Database: MySQL (keep existing) + Prisma ORM
Auth: NextAuth.js (if needed)
Deployment: Vercel/Railway (instant deploy)
```

## 📋 **MVP Development Plan**

### **Phase 1: Database Migration (Day 1-2)**

```bash
# 1. Initialize Next.js project
npx create-next-app@latest ppdb-ts --typescript --tailwind --app

# 2. Add Prisma
npm install prisma @prisma/client
npx prisma init
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
// app/api/animals/route.ts - Search & List
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/animals?search=cody&breed=corgi&page=1
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const breed = searchParams.get('breed') || ''
  const surname = searchParams.get('surname') || ''
  const page = parseInt(searchParams.get('page') || '1')
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
  const data = await request.json()

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
// app/api/animals/[id]/route.ts - Individual Animal CRUD
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
  const data = await request.json()

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
// app/components/SearchForm.tsx
'use client'
import { useState } from 'react'

interface SearchFormProps {
  onSearch: (params: SearchParams) => void
}

interface SearchParams {
  animal: string
  breed: string
  surname: string
}

export default function SearchForm({ onSearch }: SearchFormProps) {
  const [params, setParams] = useState<SearchParams>({
    animal: '',
    breed: '',
    surname: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(params)
  }

  const handleClear = () => {
    const cleared = { animal: '', breed: '', surname: '' }
    setParams(cleared)
    onSearch(cleared)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-blue-600 p-4 rounded-lg">
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-white mb-1">ANIMAL NAME</label>
          <input
            type="text"
            value={params.animal}
            onChange={(e) => setParams({...params, animal: e.target.value})}
            className="px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-white mb-1">BREED</label>
          <input
            type="text"
            value={params.breed}
            onChange={(e) => setParams({...params, breed: e.target.value})}
            className="px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-white mb-1">SURNAME</label>
          <input
            type="text"
            value={params.surname}
            onChange={(e) => setParams({...params, surname: e.target.value})}
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
// app/components/AnimalList.tsx
import Link from 'next/link'

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
                  <Link href={`/animals/${animal.id}`} className="text-blue-600 hover:underline">
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
// app/page.tsx - Main Dashboard
'use client'
import { useState, useEffect } from 'react'
import SearchForm from './components/SearchForm'
import AnimalList from './components/AnimalList'

export default function HomePage() {
  const [animals, setAnimals] = useState([])
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(false)

  const handleSearch = async (params: any) => {
    setLoading(true)
    try {
      const query = new URLSearchParams({
        search: params.animal,
        breed: params.breed,
        surname: params.surname,
        page: '1'
      }).toString()

      const response = await fetch(`/api/animals?${query}`)
      const data = await response.json()

      setAnimals(data.animals)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
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
            <AnimalList animals={animals} {...pagination} />
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
# 1. Create project
npx create-next-app@latest ppdb-ts --typescript --tailwind --app

# 2. Install dependencies
npm install prisma @prisma/client
npm install -D @types/node

# 3. Database setup
npx prisma init
# Configure DATABASE_URL in .env
npx prisma db pull  # Import existing schema
npx prisma generate
```

### **Day 2-3: Core APIs**

- Implement search API (`/api/animals`)
- Animal CRUD APIs (`/api/animals/[id]`)
- Customer APIs (`/api/customers`)
- Breed management APIs (`/api/breeds`)

### **Day 4-5: Essential UI**

- Main search interface
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

## ⚡ **Estimated Timeline**

- **Week 1**: MVP with core search/view functionality
- **Week 2**: Complete CRUD operations
- **Week 3**: Polish and deployment
- **Week 4**: Staff training and migration

This approach maintains **100% feature parity** while modernizing the tech stack with minimal risk and maximum speed.
