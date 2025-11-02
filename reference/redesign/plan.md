# Unified Development Plan: Refactoring the Pampered Pooch DB

This plan outlines the definitive strategy for modernizing the Pampered Pooch Database. It leverages a robust, type-safe stack designed for rapid development, data integrity, and maintainability.

## 🚀 Recommended MVP Stack

This stack provides end-to-end type safety, powerful data validation, and clean, scalable state management, making it ideal for the project's requirements.

- Framework: Next.js 14 + React + TypeScript
- Styling: TailwindCSS
- Backend: Next.js API Routes
- Database: MySQL (Keep Existing) + Prisma ORM
- Validation: Zod (For API and form validation)
- State Management: Zustand (For client-side state)
- Form Handling: React Hook Form + `@hookform/resolvers`

## 🎯 Why This Enhanced Stack is the Right Choice

### Core Framework (Next.js & Prisma)

- ✅ Full-stack in one: Reduces complexity and accelerates development by handling frontend and backend in a single framework.
- ✅ Zero data risk: Prisma's introspection works with the existing MySQL database, eliminating the need for a risky data migration.
- ✅ Type-safety out of the box: Next.js and Prisma provide first-class TypeScript support, ensuring type safety from the database to the UI.

### Zod Benefits for Business Integrity

- ✅ Data Integrity: Guarantees that the 3,953+ existing records and all new data conform to predefined business rules, preventing data corruption.
- ✅ Business Rules Engine: Validates specific formats like phone numbers (`/^[\d\s\-\+\(\)]{8,15}$/`) and postcodes (`/^\d{4}$/`), and enforces business constraints like cost limits.
- ✅ DRY Principle: Define a schema once and reuse it for database types, API validation, and form validation, eliminating redundant code.

### Zustand Benefits for Daily Operations

- ✅ Simple & Scalable State: Manages application state with minimal boilerplate, avoiding the complexity of Redux for an MVP.
- ✅ Persistent Search: Remembers the staff's last search filters and recently viewed items even after a page refresh, streamlining daily workflows.
- ✅ Clean Architecture: Decouples state logic from UI components, making the codebase easier to read, test, and maintain.

---

## Phase 1: Foundational Architecture (Schemas & State)

This phase establishes the application's backbone: the data structures and state management stores.

### Step 1.1: Data Validation Schemas with Zod

We will create a central file for all Zod schemas. This becomes the single source of truth for our data shapes and business rules.

```typescript
// lib/schemas.ts - Central Business Rules & Validation
import { z } from 'zod'

// Customer schema with business rules
export const CustomerSchema = z.object({
  id: z.number().optional(),
  firstName: z.string().min(1, 'First name is required').max(50),
  surname: z.string().min(1, 'Surname is required').max(50),
  address: z.string().max(200).optional(),
  suburb: z.string().max(50).optional(),
  postcode: z
    .string()
    .regex(/^\d{4}$/, 'Must be a 4-digit postcode')
    .optional()
    .or(z.literal('')),
  phone1: z
    .string()
    .regex(/^[\d\s\-\+\(\)]{8,15}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  phone2: z
    .string()
    .regex(/^[\d\s\-\+\(\)]{8,15}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  phone3: z
    .string()
    .regex(/^[\d\s\-\+\(\)]{8,15}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
})

// Animal schema with grooming-specific business rules
export const AnimalSchema = z.object({
  id: z.number().optional(),
  customerId: z.number().min(1, 'A customer must be selected'),
  name: z.string().min(1, 'Animal name is required').max(50),
  breed: z.string().min(1, 'Breed is required').max(50),
  sex: z.enum(['M', 'F', 'Male', 'Female', 'Unknown'], {
    errorMap: () => ({ message: 'Sex must be M, F, Male, Female, or Unknown' }),
  }),
  colour: z.string().max(50).optional(),
  cost: z.coerce
    .number()
    .min(0, 'Cost cannot be negative')
    .max(500, 'Cost seems too high for a single service')
    .optional(),
  lastVisit: z
    .string()
    .datetime({ message: 'Invalid date format' })
    .optional()
    .or(z.literal('')),
  thisVisit: z
    .string()
    .datetime({ message: 'Invalid date format' })
    .optional()
    .or(z.literal('')),
  comments: z.string().max(1000, 'Comments are too long').optional(),
})

// Search parameters validation
export const SearchSchema = z.object({
  animal: z.string().max(50).optional().default(''),
  breed: z.string().max(50).optional().default(''),
  surname: z.string().max(50).optional().default(''),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
})

// Infer TypeScript types from Zod schemas for use across the application
export type Customer = z.infer<typeof CustomerSchema>
export type Animal = z.infer<typeof AnimalSchema>
export type SearchParams = z.infer<typeof SearchSchema>
```

### Step 1.2: Global State Management with Zustand

We will create two separate stores to manage different concerns: searching/listing and form handling.

```typescript
// lib/store.ts - Application State Management
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Animal, Customer } from './schemas' // Import inferred types

// Store for managing search, results, and navigation state
interface SearchState {
  searchParams: { animal: string; breed: string; surname: string }
  animals: any[] // Use `any` for now, will be strongly typed from API response
  totalAnimals: number
  currentPage: number
  totalPages: number
  loading: boolean
  recentAnimals: Animal[]
  recentCustomers: Customer[]
  setSearchParams: (params: Partial<SearchState['searchParams']>) => void
  setResults: (data: {
    animals: any[]
    total: number
    page: number
    totalPages: number
  }) => void
  setLoading: (loading: boolean) => void
  addRecentAnimal: (animal: Animal) => void
  clearSearch: () => void
}

export const useSearchStore = create<SearchState>()(
  persist(
    set => ({
      // Initial state
      searchParams: { animal: '', breed: '', surname: '' },
      animals: [],
      totalAnimals: 0,
      currentPage: 1,
      totalPages: 0,
      loading: true,
      recentAnimals: [],
      recentCustomers: [],
      // Actions
      setSearchParams: params =>
        set(state => ({ searchParams: { ...state.searchParams, ...params } })),
      setResults: data =>
        set({
          animals: data.animals,
          totalAnimals: data.total,
          currentPage: data.page,
          totalPages: data.totalPages,
          loading: false,
        }),
      setLoading: loading => set({ loading }),
      addRecentAnimal: animal =>
        set(state => ({
          recentAnimals: [
            animal,
            ...state.recentAnimals.filter(a => a.id !== animal.id),
          ].slice(0, 10), // Keep last 10
        })),
      clearSearch: () =>
        set({
          searchParams: { animal: '', breed: '', surname: '' },
          animals: [],
          totalAnimals: 0,
          currentPage: 1,
          totalPages: 0,
        }),
    }),
    {
      name: 'ppdb-search-store', // localStorage key
      partialize: state => ({
        recentAnimals: state.recentAnimals,
        searchParams: state.searchParams,
      }), // Only persist these fields
    }
  )
)

// Store for managing form state (create/edit modals)
interface FormState {
  editingAnimal: Animal | null
  formMode: 'create' | 'edit' | null
  isSubmitting: boolean
  setEditingAnimal: (animal: Animal | null, mode: 'create' | 'edit') => void
  setSubmitting: (submitting: boolean) => void
  resetForm: () => void
}

export const useFormStore = create<FormState>(set => ({
  editingAnimal: null,
  formMode: null,
  isSubmitting: false,
  setEditingAnimal: (animal, mode) =>
    set({ editingAnimal: animal, formMode: mode }),
  setSubmitting: submitting => set({ isSubmitting: submitting }),
  resetForm: () =>
    set({ editingAnimal: null, formMode: null, isSubmitting: false }),
}))
```

---

## Phase 2: Backend - Secure & Validated API Routes

All API routes will be secured with Zod validation to ensure data integrity before it reaches the database.

### Example: Validated Animal Search & Creation API

```typescript
// app/api/animals/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SearchSchema, AnimalSchema } from '@/lib/schemas' // Import our Zod schemas
import { z } from 'zod'

// GET /api/animals?search=...
export async function GET(request: NextRequest) {
  try {
    // 1. Validate search parameters using Zod
    const { searchParams } = new URL(request.url)
    const params = SearchSchema.parse({
      animal: searchParams.get('search') || undefined,
      breed: searchParams.get('breed') || undefined,
      surname: searchParams.get('surname') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
    })

    const where = {
      AND: [
        params.animal ? { name: { contains: params.animal } } : {},
        params.breed ? { breed: { contains: params.breed } } : {},
        params.surname
          ? { customer: { surname: { contains: params.surname } } }
          : {},
      ].filter(condition => Object.keys(condition).length > 0),
    }

    // 2. Fetch data from database
    const [animals, total] = await Promise.all([
      prisma.animal.findMany({
        where,
        include: { customer: true },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { name: 'asc' },
      }),
      prisma.animal.count({ where }),
    ])

    // 3. Return a consistent success response
    return NextResponse.json({
      success: true,
      data: {
        animals,
        pagination: {
          page: params.page,
          limit: params.limit,
          total,
          totalPages: Math.ceil(total / params.limit),
        },
      },
    })
  } catch (error) {
    // 4. Return a structured error response
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid search parameters',
          details: error.errors,
        },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'An internal server error occurred' },
      { status: 500 }
    )
  }
}

// POST /api/animals
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // 1. Validate the incoming body against the Animal schema
    const validatedData = AnimalSchema.parse(body)

    // 2. Perform database operation
    const animal = await prisma.animal.create({
      data: {
        // Map validated data to Prisma's create method
        customerId: validatedData.customerId,
        name: validatedData.name,
        breed: validatedData.breed,
        sex: validatedData.sex,
        colour: validatedData.colour,
        cost: validatedData.cost,
        comments: validatedData.comments,
      },
      include: { customer: true },
    })

    return NextResponse.json({ success: true, data: animal }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create animal' },
      { status: 500 }
    )
  }
}
```

---

## Phase 3: Frontend - Intelligent UI Components

Components will be lean, deriving their state and logic from the Zustand stores, and using local state for UI-specific concerns like displaying validation errors.

### Example: Search Form with Integrated State & Validation

```typescript
// app/components/SearchForm.tsx
'use client'
import { useSearchStore } from '@/lib/store'
import { useState } from 'react'

export default function SearchForm() {
  const { searchParams, setSearchParams, setLoading, setResults, clearSearch } = useSearchStore();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const query = new URLSearchParams({
        search: searchParams.animal,
        breed: searchParams.breed,
        surname: searchParams.surname,
        page: '1',
      }).toString();

      const response = await fetch(`/api/animals?${query}`);
      const result = await response.json();

      if (result.success) {
        setResults({
          animals: result.data.animals,
          total: result.data.pagination.total,
          page: result.data.pagination.page,
          totalPages: result.data.pagination.totalPages,
        });
      } else {
        // Handle API errors (e.g., validation, server errors)
        throw new Error(result.error || 'Failed to fetch results');
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false); // Ensure loading is turned off on error
    }
  };

  return (
    <div className="bg-blue-600 p-4 rounded-lg shadow-md">
      {error && <div className="bg-red-500 text-white p-2 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-white mb-1 font-semibold">ANIMAL NAME</label>
            <input
              type="text"
              value={searchParams.animal}
              onChange={(e) => setSearchParams({ animal: e.target.value })}
              className="w-full px-3 py-2 rounded text-gray-800"
              maxLength={50}
            />
          </div>
          <div>
            <label className="block text-white mb-1 font-semibold">BREED</label>
            <input
              type="text"
              value={searchParams.breed}
              onChange={(e) => setSearchParams({ breed: e.target.value })}
              className="w-full px-3 py-2 rounded text-gray-800"
              maxLength={50}
            />
          </div>
          <div>
            <label className="block text-white mb-1 font-semibold">OWNER SURNAME</label>
            <input
              type="text"
              value={searchParams.surname}
              onChange={(e) => setSearchParams({ surname: e.target.value })}
              className="w-full px-3 py-2 rounded text-gray-800"
              maxLength={50}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900 transition-colors">
            Find Animal
          </button>
          <button type="button" onClick={clearSearch} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors">
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
```

---

## 📋 MVP Feature Priority Checklist

### Must Have (Week 1)

- ✅ Search functionality: By animal name, owner surname, and breed.
- ✅ Animal records view: Paginated list of search results.
- ✅ Customer & Animal Detail View: View full details of a single animal and its owner.
- ✅ Service notes display: View historical service notes for an animal.

### Should Have (Week 2)

- ✅ CRUD Operations: Forms to create, update, and delete Animals, Customers, and Service Notes, all using Zod validation.
- ✅ Breed management: Simple interface to manage breed-specific data.
- ✅ Data export: Basic CSV export for search results.

### Nice to Have (Later)

- ✅ Dashboard: With key metrics like daily totals.
- ✅ Advanced UI: Mobile responsive design, advanced filtering.
- ✅ Authentication: User login for staff members.

---

## ⚡ Estimated Timeline

- Week 1: MVP setup, database integration, and core search/view functionality.
- Week 2: Complete all CRUD operations with validated forms.
- Week 3: UI polishing, responsive design, and deployment.
- Week 4: Staff training, final testing, and go-live.

---

## 📦 Technical Appendix: Required Dependencies

This `package.json` reflects the dependencies required for this enhanced stack.

```json
{
  "name": "ppdb-ts",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.3.0",
    "@prisma/client": "^5.5.0",
    "next": "14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.45.0",
    "zod": "^3.22.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.8.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.50.0",
    "eslint-config-next": "14.0.0",
    "postcss": "^8.4.0",
    "prisma": "^5.5.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.2.0"
  }
}
```
