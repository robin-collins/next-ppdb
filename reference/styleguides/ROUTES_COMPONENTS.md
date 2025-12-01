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
| `/customers/history`    | Historical/inactive customers    | To implement                 |
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
| `/api/customers/history`    | GET    | List inactive customers by period  | To implement |
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
- Customer History (`/customers/history`)
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

## Potential / MVP Considerations (from mock UI analysis)

These items are visible or implied in mockups under `reference/redesign/mockui-*.html`. They may extend beyond strict legacy parity but improve usability and visual fidelity. Treat as optional unless promoted to “Confirmed”.

- Search & Results (`mockui-search_results.html`)
  - Sort controls (e.g., by relevance, surname, last visit) | Component | src/components/SortMenu.tsx
  - Filter chips (sex, breed, has notes) | Component | src/components/FilterChips.tsx
  - Pagination control UI (next/prev, page numbers) | Component | src/components/Pagination.tsx
  - Relevance badge/toggle visibility | Component | src/components/Badge.tsx
  - Result skeleton loaders | Component | src/components/LoadingState.tsx

- Customer Detail (`mockui-customer-detail.html`, `mockui-customer-record-modern.html`)
  - Breadcrumbs header (Dashboard > Customers > Name) | Component | src/components/Breadcrumbs.tsx
  - Customer avatar/initials | Component | src/components/Avatar.tsx
  - Status badges (Active/Inactive) | Component | src/components/Badge.tsx
  - Toast/notification for save/update | Component | src/components/Toast.tsx
  - Confirm dialog for delete | Component | src/components/ConfirmDialog.tsx
  - Customer history page (tab/route) | Page | src/app/customers/[id]/history/page.tsx
  - Click-to-call and mailto actions | Enhancement | src/components/customer/ContactDetailsCard.tsx

- Animal Detail (`mockui-animal-detail.html`, `mockui-cody-animal-record-complete.html`, `mockui-service-history.html`)
  - Owner summary strip with quick contact actions | Component | src/components/animals/AnimalHeader.tsx (confirmed as new)
  - Breed select with async search | Enhancement | src/components/animals/AnimalInfoCard.tsx
  - Date pickers for visits | Component | src/components/DatePicker.tsx
  - Rich notes timeline (icons, compact rows) | Enhancement | src/components/animals/ServiceNotesCard.tsx
  - All notes full-page view | Page | src/app/animals/[id]/history/page.tsx
  - Technician code helper (chips/autocomplete) | Component | src/components/NoteTags.tsx

- Add Customer / Add Animal (`mockui-add-customer.html`, `mockui-add-animal.html`)
  - Inline field validation hints/tooltips | Enhancement | existing form components
  - Success redirect with toast | Enhancement | page components

- Breeds Management (`mockui-breed_management_modern.html`)
  - Table column sorting and search inputs | Enhancement | src/app/breeds/page.tsx
  - Inline validation for time/cost formats | Enhancement | src/components/breeds/BreedTable.tsx
  - Bulk actions (optional) | Enhancement | src/components/breeds/BreedTable.tsx
  - Keyboard shortcuts (search/new/pagination) | Enhancement | src/app/breeds/page.tsx

- Daily Totals (`mockui-daily-totals.html`)
  - Date selector (view past day totals) | Component | src/components/reports/DateSelector.tsx
  - Export/print actions | Component | src/components/reports/ReportActions.tsx

- Global/Shared
  - Breadcrumbs | Component | src/components/Breadcrumbs.tsx
  - Avatar | Component | src/components/Avatar.tsx
  - Badge | Component | src/components/Badge.tsx
  - Toast/Notification | Component | src/components/Toast.tsx
  - ConfirmDialog | Component | src/components/ConfirmDialog.tsx
  - Pagination | Component | src/components/Pagination.tsx
  - DatePicker | Component | src/components/DatePicker.tsx
  - Loading/Skeleton | Component | src/components/LoadingState.tsx
  - Empty-state variations with mascot | Enhancement | src/components/EmptyState.tsx

- Add Animal (`mockui-add-animal.html`)
  - Customer context strip (avatar, name, phone) | Component | src/components/animals/CustomerContext.tsx
  - Breed-based pricing auto-fill | Enhancement | src/components/animals/AnimalInfoCard.tsx (breed → cost mapping)
  - Calendar button integration for native date input | Enhancement | src/components/DatePicker.tsx

- Animal Detail (`mockui-cody-animal-record-complete.html`)
  - Back to Search CTA | Enhancement | src/app/animals/[id]/page.tsx
  - View Customer CTA | Enhancement | src/app/animals/[id]/page.tsx
  - Change Dates specialized action | Enhancement | src/components/animals/AnimalInfoCard.tsx

- Breeds Management (`mockui-breed_management_modern.html`)
  - Breed search box | Component | src/components/breeds/BreedSearch.tsx
  - Category filter buttons (All/Dogs/Cats/Other) | Component | src/components/breeds/BreedFilters.tsx
  - Paginated table with info footer | Component | src/components/breeds/BreedTable.tsx (pagination area)
  - Keyboard shortcuts (Ctrl/Cmd+F search, +N new) | Enhancement | page-level handlers

- Daily Totals / Analytics (`mockui-daily-totals.html`)
  - Stats cards (Report Generated, Total Animals, Total Revenue) | Component | src/components/reports/StatsCard.tsx
  - Period toggle (Daily/Weekly/Monthly) | Component | src/components/reports/PeriodToggle.tsx
  - Chart cards (revenue line, animals bar) | Component | src/components/reports/ChartCard.tsx
  - Trends table (last 7 days) | Component | src/components/reports/TrendsTable.tsx

## Confirmed Additions From Mock UI (Required for Parity)

Based on `mockui-customer-history.html` (maps to legacy “Old Customers”):

- Page: `/customers/history`
  - File: `src/app/customers/history/page.tsx`
  - Purpose: List inactive customers with filters for 12+/24+/36+ months, search, stats
  - Rendering: CSR
  - Components:
    - `HistoryFilters` (period select + search)
    - `CustomerHistoryTable` (sticky header table with last visit badges)
    - `StatsBar` (total/displayed/oldest visit)
- API: GET `/api/customers/history?months=&q=`
  - Returns filtered, searchable list with pagination-ready shape
  - Implementation detail: derive inactivity from max(animal.thisvisit,lastvisit) per customer
