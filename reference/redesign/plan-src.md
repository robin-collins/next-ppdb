# Unified Development Plan: Refactoring the Pampered Pooch DB (`src/` Directory Version)

This plan modernizes the Pampered Pooch Database, leveraging a robust, type-safe stack, and using the correct Next.js 14+ layout with everything inside the `src/` folder.

This plan outlines the definitive strategy for modernizing the Pampered Pooch Database. It leverages a robust, type-safe stack designed for rapid development, data integrity, and maintainability.

## 🚀 Recommended MVP Stack

This stack provides end-to-end type safety, powerful data validation, and clean, scalable state management, making it ideal for the project's requirements.

- **Framework**: Next.js 14 + React + TypeScript (code inside `src/`)
- **Styling**: TailwindCSS
- **Backend**: Next.js API Routes (`src/pages/api/`)
- **Database**: MySQL (existing) + Prisma ORM
- **Validation**: Zod (API and forms)
- **State Management**: Zustand
- **Form Handling**: React Hook Form + `@hookform/resolvers`

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
// src/lib/schemas.ts - Central Business Rules & Validation
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
// src/lib/store.ts - Application State Management
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
// src/pages/api/animals.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { SearchSchema, AnimalSchema } from '@/lib/schemas'
import { z } from 'zod'

// GET /api/animals?search=...

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const {
        search = '',
        breed = '',
        surname = '',
        page = '1',
        limit = '20',
      } = req.query
      const params = SearchSchema.parse({
        animal: search || undefined,
        breed: breed || undefined,
        surname: surname || undefined,
        page: parseInt((page as string) || '1'),
        limit: parseInt((limit as string) || '20'),
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

      return res.status(200).json({
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
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({
            success: false,
            error: 'Invalid search parameters',
            details: error.errors,
          })
      }
      return res
        .status(500)
        .json({ success: false, error: 'An internal server error occurred' })
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body
      const validatedData = AnimalSchema.parse(body)

      const animal = await prisma.animal.create({
        data: {
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

      return res.status(201).json({ success: true, data: animal })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({
            success: false,
            error: 'Validation failed',
            details: error.errors,
          })
      }
      return res
        .status(500)
        .json({ success: false, error: 'Failed to create animal' })
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' })
}
```

---

## Phase 3: Frontend - UI Components (`src/components/SearchForm.tsx`)

```typescript
// src/components/SearchForm.tsx
'use client';
import { useSearchStore } from '@/lib/store';
import { useState } from 'react';

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
        throw new Error(result.error || 'Failed to fetch results');
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
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

**All file references below use the `src/` directory.**

- **Must Have (Week 1)**: Search (`SearchForm.tsx`), paginated view, detail view, service notes display.
- **Should Have (Week 2)**: Full CRUD (with Zod validation), breed management, CSV export.
- **Nice to Have (Later)**: Dashboard, mobile/responsive, authentication.

---

## 📦 Technical Appendix: Required Dependencies

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

**This is the complete, unabridged plan, with every code block and reference using the correct `src/` folder structure for Next.js 14+.**
