# Final Unified Development Plan: Refactoring the Pampered Pooch DB (v2)

This document is the definitive and complete blueprint for modernizing the Pampered Pooch Database. It synthesizes the best strategic and technical elements from all prior plans into a single, actionable guide.

## 1. Strategic Overview & Goals

### Project Mission

To refactor the legacy database application into a modern, type-safe, and maintainable full-stack TypeScript application. The primary goals are to improve data integrity, streamline staff workflows, and create a scalable foundation for future features, all while ensuring zero data loss or operational downtime.

### Risk Mitigation Strategy

A core principle of this plan is to minimize risk at every stage:

- Database Safety: We will keep the existing MySQL database. Prisma's introspection feature will generate a type-safe client based on the current schema. This eliminates the #1 risk: data migration errors.
- Data Integrity: Zod schemas will be enforced at the API level. No invalid data can enter the database, protecting the existing 3,953+ records from corruption.
- Phased Rollout: The application will be developed to achieve 100% feature parity with the existing system before being deployed. Staff can be trained on the new system while the old one remains active.
- Technology Choice: The stack (Next.js, Prisma, Zod, Zustand) is mature, well-documented, and highly synergistic, reducing development and maintenance risks.

## 🚀 Recommended MVP Stack

This stack provides end-to-end type safety, powerful data validation, and clean, scalable state management, making it ideal for the project's requirements.

- Framework: Next.js 14 + React + TypeScript
- Styling: TailwindCSS
- Backend: Next.js API Routes
- Database: MySQL (Keep Existing) + Prisma ORM
- Validation: Zod
- State Management: Zustand
- Form Handling: React Hook Form + `@hookform/resolvers`
  _(The full `package.json` is provided in the Appendix)_

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

## 3. Phase 1: Foundational Architecture (Schemas & State)

This phase establishes the application's robust and type-safe backbone.

### Step 3.1: Central Validation Schemas with Zod

This file is the single source of truth for all data shapes and business rules, ensuring consistency across the entire application.

```typescript
// lib/schemas.ts - Central Business Rules & Validation
import { z } from 'zod'

// Customer schema with practical business rules
export const CustomerSchema = z.object({
  id: z.number().optional(),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name is too long'),
  surname: z
    .string()
    .min(1, 'Surname is required')
    .max(50, 'Surname is too long'),
  address: z.string().max(200, 'Address is too long').optional(),
  suburb: z.string().max(50, 'Suburb is too long').optional(),
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
  name: z
    .string()
    .min(1, 'Animal name is required')
    .max(50, 'Name is too long'),
  breed: z.string().min(1, 'Breed is required').max(50, 'Breed is too long'),
  sex: z.enum(['M', 'F', 'Male', 'Female', 'Unknown'], {
    errorMap: () => ({ message: 'Sex must be M, F, Male, Female, or Unknown' }),
  }),
  colour: z.string().max(50, 'Colour is too long').optional(),
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

// TypeScript types are inferred automatically, ensuring perfect sync with validation rules
export type Customer = z.infer<typeof CustomerSchema>
export type Animal = z.infer<typeof AnimalSchema>
export type SearchParams = z.infer<typeof SearchSchema>
```

### Step 3.2: Global State Management with Zustand

A dual-store architecture cleanly separates concerns for search/navigation and form editing.

```typescript
// lib/store.ts - Application State Management
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Animal, Customer } from './schemas'

// --- Interface Definitions ---
interface SearchState {
  searchParams: { animal: string; breed: string; surname: string }
  animals: any[] // API response type
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
  addRecentCustomer: (customer: Customer) => void
  clearSearch: () => void
}

interface FormState {
  editingAnimal: Animal | null
  editingCustomer: Customer | null
  formMode: 'create' | 'edit' | null
  isSubmitting: boolean
  setEditingAnimal: (animal: Animal | null, mode: 'create' | 'edit') => void
  setEditingCustomer: (
    customer: Customer | null,
    mode: 'create' | 'edit'
  ) => void
  setSubmitting: (submitting: boolean) => void
  resetForm: () => void
}

// --- Store Implementations ---

// Store #1: Manages search, results, and persisted user context
export const useSearchStore = create<SearchState>()(
  persist(
    set => ({
      searchParams: { animal: '', breed: '', surname: '' },
      animals: [],
      totalAnimals: 0,
      currentPage: 1,
      totalPages: 0,
      loading: true,
      recentAnimals: [],
      recentCustomers: [],
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
          ].slice(0, 10),
        })),
      addRecentCustomer: customer =>
        set(state => ({
          recentCustomers: [
            customer,
            ...state.recentCustomers.filter(c => c.id !== customer.id),
          ].slice(0, 10),
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
      name: 'ppdb-search-store', // Key for localStorage
      partialize: state => ({
        recentAnimals: state.recentAnimals,
        recentCustomers: state.recentCustomers,
        searchParams: state.searchParams,
      }),
    }
  )
)

// Store #2: Manages the state of forms (e.g., which record is being edited)
export const useFormStore = create<FormState>(set => ({
  editingAnimal: null,
  editingCustomer: null,
  formMode: null,
  isSubmitting: false,
  setEditingAnimal: (animal, mode) =>
    set({ editingAnimal: animal, formMode: mode }),
  setEditingCustomer: (customer, mode) =>
    set({ editingCustomer: customer, formMode: mode }),
  setSubmitting: submitting => set({ isSubmitting: submitting }),
  resetForm: () =>
    set({
      editingAnimal: null,
      editingCustomer: null,
      formMode: null,
      isSubmitting: false,
    }),
}))
```

## 4. Phase 2: Backend - Secure & Validated API Routes

API routes will follow a consistent pattern of validation, processing, and structured responses.

```typescript
// app/api/animals/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SearchSchema, AnimalSchema } from '@/lib/schemas'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = SearchSchema.parse({
      animal: searchParams.get('search') || undefined,
      breed: searchParams.get('breed') || undefined,
      surname: searchParams.get('surname') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
    })

    const where = {
      AND: [
        params.animal
          ? { name: { contains: params.animal, mode: 'insensitive' } }
          : {},
        params.breed
          ? { breed: { contains: params.breed, mode: 'insensitive' } }
          : {},
        params.surname
          ? {
              customer: {
                surname: { contains: params.surname, mode: 'insensitive' },
              },
            }
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
    console.error(error) // Log unexpected errors
    return NextResponse.json(
      { success: false, error: 'An internal server error occurred' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
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
        // Dates should be handled carefully; Prisma expects Date objects or ISO strings
        lastVisit: validatedData.lastVisit
          ? new Date(validatedData.lastVisit)
          : null,
        thisVisit: validatedData.thisVisit
          ? new Date(validatedData.thisVisit)
          : null,
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
    console.error(error)
    return NextResponse.json(
      { success: false, error: 'Failed to create animal' },
      { status: 500 }
    )
  }
}
```

## 5. Phase 3: Frontend - Validated Forms & Intelligent UI

### Step 5.1: Connecting Zod to React with `react-hook-form`

This is the critical link for creating a great user experience. `react-hook-form` handles form state, while `@hookform/resolvers` allows Zod to be its validation engine.

```typescript
// app/components/AnimalForm.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimalSchema, Animal } from '@/lib/schemas';
import { useFormStore } from '@/lib/store';

export default function AnimalForm() {
  const { editingAnimal, formMode, resetForm } = useFormStore();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Animal>({
    resolver: zodResolver(AnimalSchema),
    defaultValues: editingAnimal || {
      name: '',
      breed: '',
      sex: 'Unknown',
      colour: '',
      comments: '',
    },
  });

  const onSubmit = async (data: Animal) => {
    // This 'data' is guaranteed by Zod to be correctly shaped and typed.
    const url = formMode === 'edit' ? `/api/animals/${editingAnimal?.id}` : '/api/animals';
    const method = formMode === 'edit' ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save animal data.');
      }

      // On success, close the form/modal and refetch data
      resetForm();
      // Potentially trigger a refetch of the search results list
    } catch (error) {
      console.error(error);
      // Display a user-friendly error message
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-2xl font-bold">{formMode === 'edit' ? 'Edit Animal' : 'Create New Animal'}</h2>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Animal Name</label>
        <input id="name" {...register('name')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="breed" className="block text-sm font-medium text-gray-700">Breed</label>
        <input id="breed" {...register('breed')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        {errors.breed && <p className="mt-2 text-sm text-red-600">{errors.breed.message}</p>}
      </div>

      <div>
        <label htmlFor="sex" className="block text-sm font-medium text-gray-700">Sex</label>
        <select id="sex" {...register('sex')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
          <option>Unknown</option>
          <option>Male</option>
          <option>Female</option>
        </select>
        {errors.sex && <p className="mt-2 text-sm text-red-600">{errors.sex.message}</p>}
      </div>

      <div>
        <label htmlFor="comments" className="block text-sm font-medium text-gray-700">Comments</label>
        <textarea id="comments" {...register('comments')} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        {errors.comments && <p className="mt-2 text-sm text-red-600">{errors.comments.message}</p>}
      </div>

      <div className="flex justify-end gap-4">
        <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md disabled:bg-blue-300">
          {isSubmitting ? 'Saving...' : 'Save Animal'}
        </button>
      </div>
    </form>
  );
}
```

## 6. MVP Feature & Timeline

### Feature Priority Checklist

- Must Have (Week 1): Search by name, surname, breed. Paginated list view of results. Click-through to a read-only Detail View.
- Should Have (Week 2): Full, validated CRUD forms for Animals and Customers using the `react-hook-form` pattern. Simple interface for Breed management.
- Nice to Have (Later): A Dashboard with key metrics (e.g., daily totals), advanced filtering options, print functionality, and staff user authentication.

### Estimated Timeline

- Week 1: MVP setup, database introspection via Prisma, and implementation of core search/view functionality.
- Week 2: Complete all validated CRUD operations for all entities (Animals, Customers, Service Notes).
- Week 3: UI polishing, ensuring mobile/tablet responsiveness, and deployment preparation.
- Week 4: Staff training, final end-to-end testing, and go-live migration.

## 7. Appendix: `package.json`

```json
{
  "name": "ppdb-ts-refactor",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "postinstall": "prisma generate"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.3.4",
    "@prisma/client": "^5.10.2",
    "next": "14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.51.0",
    "zod": "^3.22.4",
    "zustand": "^4.5.2"
  },
  "devDependencies": {
    "@types/node": "^20.11.24",
    "@types/react": "^18.2.61",
    "@types/react-dom": "^18.2.19",
    "autoprefixer": "^10.4.18",
    "eslint": "^8.57.0",
    "eslint-config-next": "14.1.0",
    "postcss": "^8.4.35",
    "prisma": "^5.10.2",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3"
  }
}
```
