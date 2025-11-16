## ROUTES AND COMPONENTS BLUEPRINT (MVP PARITY WITH LEGACY PPDB)

This document defines the complete set of Next.js routes, API endpoints, page structures, and React components required to deliver the MVP with 100% functional parity to the legacy PPDB system. It is derived from an in-depth review of `reference/PPDB/*` and aligned with the current codebase architecture.

### Data Model Overview (from production schema)

- Tables: `animal`, `breed`, `customer`, `notes`
- Relations:
  - `breed (1) → (∞) animal`
  - `customer (1) → (∞) animal`
  - `animal (1) → (∞) notes`
- Key fields (DB → API mapping):
  - animal: `animalID(id)`, `animalname(name)`, `SEX(sex)`, `lastvisit(lastVisit)`, `thisvisit(thisVisit)`
  - customer: `customerID(id)`, `surname`, `firstname`, `postcode (int) → string padded`
  - notes: `noteID(id)`, `notes`, `date`
  - breed: `breedID(id)`, `breedname`, `avgtime`, `avgcost`

Reference: `prisma/schema.prisma`, `reference/PPDB/database.md`, `reference/PPDB/10-individual-animal-records.md`, `reference/PPDB/12-individual-customer-records.md`, `reference/PPDB/05-add-breed-management.md`, `reference/PPDB/06-daily-totals.md`.

### MVP Features Parity Checklist (legacy → Next.js)

- Search unified across animal name, breed, customer (name/email/phones) with ranked results
- Customer detail (view/update/delete), with associated animals list and add-animal entry point
- Animal detail (view/update/delete), service notes timeline (list/create/delete)
- Add customer form
- Breed management CRUD (list, create, update, delete) with time and cost
- Daily totals report (count and revenue for current date)
- Search results pagination
- Backup data (stub/placeholder endpoint for MVP, optional UI entry)

## Pages (App Router)

All routes are under `src/app`. Route ownership and rendering strategy are annotated below.

### 1) Landing + Search

- Path: `/`
- File: `src/app/page.tsx` (client component)
- Purpose: App shell with Header + Sidebar, unified search, results grid/list
- Data Flow:
  - Header triggers `useAnimalsStore().searchAnimals({ q, page })` → GET `/api/animals`
  - Results click navigates to `/animals/[id]`

Component hierarchy (high-level):

- `Header` (search input, Enter support, date/time)
- `Sidebar` (nav + pinned behavior)
- `EmptyState` (before first search)
- `ResultsView` → `AnimalCard` (grid/list, relevanceScore display)

### 2) Customers

- Path: `/customer/[id]`
  - File: `src/app/customer/[id]/page.tsx` (client)
  - Purpose: Detailed customer record with editable info and associated animals
  - Data:
    - Load: `useCustomersStore().fetchCustomer(id)` → GET `/api/customers/[id]`
    - Update: `useCustomersStore().updateCustomer(id, data)` → PUT `/api/customers/[id]`
    - Delete: `useCustomersStore().deleteCustomer(id)` → DELETE `/api/customers/[id]`
  - Navigation:
    - Add Animal: route to `/animals/new?customerId=...`
    - Animal click: `/animals/[id]`
  - Rendering: CSR (Zustand store-driven)

- Path: `/customers/add`
  - File: `src/app/customers/add/page.tsx` (client)
  - Purpose: Add Customer form (validates via Zod schemas)
  - Data:
    - POST `/api/customers` on submit
    - Redirect to `/customers/[id]` on success
  - Rendering: CSR

### 3) Animals

- Path: `/animals/[id]` (to implement)
  - File: `src/app/animals/[id]/page.tsx` (client)
  - Purpose: Legacy `show_animal.php` parity: animal details + service notes timeline and creation
  - Data:
    - GET `/api/animals/[id]` (includes customer, breed, notes ordered desc by date)
    - PUT `/api/animals/[id]` for animal updates
    - Notes:
      - POST `/api/animals/[id]/notes` to insert new service note (MVP adds new route)
      - DELETE `/api/notes/[noteId]` to remove a service note (MVP adds new route)
  - Rendering: CSR (Zustand or local state + fetch)
  - Required Components (new):
    - `AnimalHeader` (owner name/phone, links to customer page)
    - `AnimalInfoCard` (name, breed selector, sex, colour, cost, last/this visit, comments; Save/Update)
    - `ServiceNotesCard` (note editor + timeline list, per-item delete)

- Path: `/animals/new` (optional MVP path if used from customer page)
  - File: `src/app/animals/new/page.tsx` (client)
  - Purpose: Add animal for existing customer (customerId passed via query string)
  - Data:
    - POST `/api/animals`
  - Rendering: CSR

### 4) Breeds Management

- Path: `/breeds` (to implement)
  - File: `src/app/breeds/page.tsx` (client)
  - Purpose: List all breeds; inline edit time/cost; delete; new breed form
  - Data:
    - GET `/api/breeds`
    - POST `/api/breeds`
    - PUT `/api/breeds/[id]`
    - DELETE `/api/breeds/[id]`
  - Rendering: CSR
  - Required Components (new):
    - `BreedForm` (add new breed)
    - `BreedTable` (editable rows for name, avgtime, avgcost; per-row update/delete)

### 5) Daily Totals

- Path: `/reports/daily-totals` (to implement)
  - File: `src/app/reports/daily-totals/page.tsx` (server or client; simple fetch)
  - Purpose: Show current day animal count and revenue total
  - Data:
    - GET `/api/reports/daily-totals` (MVP endpoint)
  - Rendering: SSG/SSR or CSR (low complexity)
  - Required Components (new):
    - `DailyTotalsCard` (date/time stamp, totals)

### 6) Backup (optional UI for MVP; endpoint stub is sufficient)

- Path: `/admin/backup` (optional view)
  - File: `src/app/admin/backup/page.tsx` (client)
  - Purpose: Trigger/download backup bundle
  - Data:
    - GET `/api/admin/backup` (stream/download tar.gz; MVP stub ok)
  - Rendering: CSR

## API Endpoints (Route Handlers)

Location: `src/app/api`

### Animals

- GET `/api/animals?q=&page=`
  - Search across surname/firstname/email/phones/animalname/breedname with relevance scoring
  - Implemented: `src/app/api/animals/route.ts`
- POST `/api/animals`
  - Create animal (maps API payload to DB fields)
  - Implemented: `src/app/api/animals/route.ts`

- GET `/api/animals/[id]`
  - Get animal with `customer`, `breed`, `notes` (ordered by date desc)
  - Implemented: `src/app/api/animals/[id]/route.ts`
- PUT `/api/animals/[id]`
  - Update animal core fields
  - Implemented: `src/app/api/animals/[id]/route.ts`
- DELETE `/api/animals/[id]` (to implement for parity)
  - Remove animal (legacy supports deletion from customer table)

Notes (new for MVP parity):

- POST `/api/animals/[id]/notes` (to implement)
  - Create new service note for animal
- DELETE `/api/notes/[noteId]` (to implement)
  - Delete a specific note

### Customers

- GET `/api/customers?q=&page=&limit=`
  - Search + list with relevance; includes animals
  - Implemented: `src/app/api/customers/route.ts`
- POST `/api/customers`
  - Create customer (Zod validated, phone normalization)
  - Implemented: `src/app/api/customers/route.ts`
- GET `/api/customers/[id]`
  - Single customer with animals (includes breed)
  - Implemented: `src/app/api/customers/[id]/route.ts`
- PUT `/api/customers/[id]`
  - Update customer
  - Implemented: `src/app/api/customers/[id]/route.ts`
- DELETE `/api/customers/[id]`
  - Delete customer (blocked if animals exist)
  - Implemented: `src/app/api/customers/[id]/route.ts`

### Breeds (to implement)

- GET `/api/breeds` (list all, sort by name)
- POST `/api/breeds` (create)
- PUT `/api/breeds/[id]` (update name/avgtime/avgcost)
- DELETE `/api/breeds/[id]` (delete; respect FK constraints)

### Reports (to implement)

- GET `/api/reports/daily-totals`
  - Returns { dateTime, totalAnimalsToday, totalRevenueToday }
  - Query logic: count animals where `thisvisit` equals today; sum `cost` for today’s visits

### Admin (optional MVP)

- GET `/api/admin/backup` (tar.gz stream, stub acceptable for MVP)

## Required Components (new and existing)

Existing (used by `/` and customer page):

- `Header` (props: onToggleSidebar, sidebarOpen, onSearch, searchValue, breadcrumbs?)
- `Sidebar` (props: isOpen, isPinned, onClose, onTogglePin, currentPath)
- `EmptyState` (props: onSuggestionClick)
- `ResultsView` (props: animals, query, viewMode, onViewModeChange, onAnimalClick)
- `AnimalCard` (props: animal with customer fields; shows relevanceScore)
- Customer detail components in `src/components/customer/*`:
  - `CustomerHeader` (props: customer, onAddAnimal, onViewHistory)
  - `CustomerInfoCard` (props: customer, onUpdate)
  - `AssociatedAnimalsCard` (props: animals, onAddAnimal, onDeleteAnimal, onClickAnimal)
  - `ContactDetailsCard` (props: customer)
  - `CustomerStatsCard` (props: customer)
  - `QuickActionsCard` (props: customerId, on\* callbacks)

New (Animals):

- `AnimalHeader`
  - Props: { customer: { id, surname, firstname, phone1 }, animalName: string, onEditCustomer: () => void }
- `AnimalInfoCard`
  - Props: {
    animal: {
    id, name, sex, colour, cost, lastVisit, thisVisit, comments, breedId?, breedName
    },
    breeds: Array<{ id, name }>,
    onUpdate: (partial) => Promise<void>
    }
- `ServiceNotesCard`
  - Props: {
    notes: Array<{ id, serviceDate, notes }>,
    onAddNote: (text: string, serviceDate?: string) => Promise<void>,
    onDeleteNote: (id: number) => Promise<void>
    }

New (Breeds):

- `BreedForm`
  - Props: { onCreate: ({ name, avgtime, avgcost }) => Promise<void> }
- `BreedTable`
  - Props: { breeds: Array<{ id, name, avgtime, avgcost }>, onUpdate: (id, partial) => Promise<void>, onDelete: (id) => Promise<void> }

New (Reports):

- `DailyTotalsCard`
  - Props: { dateTime: string, totalAnimals: number, totalRevenue: number }

## Rendering and State

- Pages render on client (CSR) using Zustand stores for search, customers, and animals.
- Stores:
  - `useAnimalsStore`: search, fetchById, create, update, delete (extend to handle notes endpoints)
  - `useCustomersStore`: search, fetchById, create, update, delete
- Validation: Zod schemas in `src/lib/validations/*`
- Prisma client import: `import { prisma } from '@/lib/prisma'` and `import type { Prisma } from '@/generated/prisma'`

## Route and Endpoint Tables

Pages:

| Route                   | Purpose                          | Status                       |
| ----------------------- | -------------------------------- | ---------------------------- |
| `/`                     | Unified search and results       | Implemented                  |
| `/customer/[id]`        | Customer detail with animals     | Implemented                  |
| `/customers/add`        | New customer form                | Implemented                  |
| `/animals/[id]`         | Animal detail + service notes    | To implement                 |
| `/animals/new`          | New animal for existing customer | To implement (optional flow) |
| `/breeds`               | Breed management CRUD            | To implement                 |
| `/reports/daily-totals` | Daily totals dashboard           | To implement                 |
| `/admin/backup`         | Backup (optional UI)             | Optional                     |

APIs:

| Endpoint                    | Method | Purpose                            | Status       |
| --------------------------- | ------ | ---------------------------------- | ------------ |
| `/api/animals`              | GET    | Unified search                     | Implemented  |
| `/api/animals`              | POST   | Create animal                      | Implemented  |
| `/api/animals/[id]`         | GET    | Animal with customer, breed, notes | Implemented  |
| `/api/animals/[id]`         | PUT    | Update animal                      | Implemented  |
| `/api/animals/[id]`         | DELETE | Delete animal                      | To implement |
| `/api/animals/[id]/notes`   | POST   | Add service note                   | To implement |
| `/api/notes/[noteId]`       | DELETE | Delete note                        | To implement |
| `/api/customers`            | GET    | Search/list customers              | Implemented  |
| `/api/customers`            | POST   | Create customer                    | Implemented  |
| `/api/customers/[id]`       | GET    | Customer with animals              | Implemented  |
| `/api/customers/[id]`       | PUT    | Update customer                    | Implemented  |
| `/api/customers/[id]`       | DELETE | Delete customer                    | Implemented  |
| `/api/breeds`               | GET    | List breeds                        | To implement |
| `/api/breeds`               | POST   | Create breed                       | To implement |
| `/api/breeds/[id]`          | PUT    | Update breed                       | To implement |
| `/api/breeds/[id]`          | DELETE | Delete breed                       | To implement |
| `/api/reports/daily-totals` | GET    | Daily totals                       | To implement |
| `/api/admin/backup`         | GET    | Backup archive                     | Optional     |

## Navigation and Sidebar

Suggested sidebar items (ensure active highlighting via `currentPath`):

- Dashboard/Search (`/`)
- Add Customer (`/customers/add`)
- Breeds (`/breeds`)
- Daily Totals (`/reports/daily-totals`)
- Backup (optional) (`/admin/backup`)

## Notes on Legacy Parity

- Customer delete is blocked when animals exist (implemented).
- Animal page must support service notes entry and deletion, reflecting the right-side panel in legacy.
- Breed management mirrors `edit_breed.php` (inline row edits + create/delete).
- Daily totals shows current date/time stamp, TOTAL Animals and TOTAL $ for today.
- Phone normalization is enforced for searches and storage.

## Testing Guidance (dev at `http://localhost:3000`)

- Inspect `Network` requests for `/api/animals` and `/api/customers` searches.
- Validate customer detail editing and deletion rules.
- After adding `/animals/[id]`, verify notes add/delete and updates propagate to list.
- Once breeds/report endpoints are added, validate CRUD and totals accuracy against seed data.
