# RESTful URL Structure - Pampered Pooch Database

**Status**: ✅ **LOCKED** - This is the authoritative routing specification for the application.

**Last Updated**: 2025-11-16

## Design Philosophy

This application follows **shallow nesting** RESTful principles:

1. **Nest URLs for context** - When you need parent context to create or list resources
2. **Flatten URLs for identity** - When you have a resource ID, access it directly
3. **Maximum 2 levels of nesting** - Keep URLs simple and maintainable
4. **Resource independence** - Access resources directly by ID without needing parent IDs

## Complete URL Map

### 🏠 Home / Search

| Path | Method | Purpose                             | Page/API |
| ---- | ------ | ----------------------------------- | -------- |
| `/`  | GET    | Home page - animal search interface | Page     |

### 👥 Customers

#### Pages

| Path                       | Method | Purpose                 | Navigation Pattern   |
| -------------------------- | ------ | ----------------------- | -------------------- |
| `/customers`               | GET    | List all customers      | Top-level collection |
| `/customers/add`           | GET    | Add new customer form   | Create new resource  |
| `/customer/[id]`           | GET    | View customer details   | Direct access by ID  |
| `/customer/[id]/edit`      | GET    | Edit customer form      | Direct access by ID  |
| `/customer/[id]/animals`   | GET    | List customer's animals | Contextual listing   |
| `/customer/[id]/newAnimal` | GET    | Add animal to customer  | Contextual creation  |

#### APIs

| Path                  | Method | Purpose               | Response            |
| --------------------- | ------ | --------------------- | ------------------- |
| `/api/customers`      | GET    | Search/list customers | `Customer[]`        |
| `/api/customers`      | POST   | Create new customer   | `Customer`          |
| `/api/customers/[id]` | GET    | Get customer by ID    | `Customer`          |
| `/api/customers/[id]` | PUT    | Update customer       | `Customer`          |
| `/api/customers/[id]` | DELETE | Delete customer       | `{ success: true }` |

### 🐕 Animals

#### Pages

| Path                 | Method | Purpose                           | Navigation Pattern   |
| -------------------- | ------ | --------------------------------- | -------------------- |
| `/animals`           | GET    | List all animals (search results) | Top-level collection |
| `/animals/[id]`      | GET    | View animal details               | Direct access by ID  |
| `/animals/[id]/edit` | GET    | Edit animal form                  | Direct access by ID  |

#### APIs

| Path                | Method | Purpose             | Response            |
| ------------------- | ------ | ------------------- | ------------------- |
| `/api/animals`      | GET    | Search/list animals | `Animal[]`          |
| `/api/animals`      | POST   | Create new animal   | `Animal`            |
| `/api/animals/[id]` | GET    | Get animal by ID    | `Animal`            |
| `/api/animals/[id]` | PUT    | Update animal       | `Animal`            |
| `/api/animals/[id]` | DELETE | Delete animal       | `{ success: true }` |

### 🐾 Breeds

#### Pages

| Path                | Method | Purpose                | Navigation Pattern   |
| ------------------- | ------ | ---------------------- | -------------------- |
| `/breeds`           | GET    | List/manage all breeds | Top-level collection |
| `/breeds/add`       | GET    | Add new breed form     | Create new resource  |
| `/breeds/[id]`      | GET    | View breed details     | Direct access by ID  |
| `/breeds/[id]/edit` | GET    | Edit breed form        | Direct access by ID  |

#### APIs

| Path               | Method | Purpose          | Response            |
| ------------------ | ------ | ---------------- | ------------------- |
| `/api/breeds`      | GET    | List all breeds  | `Breed[]`           |
| `/api/breeds`      | POST   | Create new breed | `Breed`             |
| `/api/breeds/[id]` | GET    | Get breed by ID  | `Breed`             |
| `/api/breeds/[id]` | PUT    | Update breed     | `Breed`             |
| `/api/breeds/[id]` | DELETE | Delete breed     | `{ success: true }` |

### 📝 Service Notes

#### Pages

| Path                      | Method | Purpose                     | Navigation Pattern  |
| ------------------------- | ------ | --------------------------- | ------------------- |
| `/animals/[id]/notes`     | GET    | List animal's service notes | Contextual listing  |
| `/animals/[id]/notes/new` | GET    | Add note to animal          | Contextual creation |
| `/notes/[id]`             | GET    | View note details           | Direct access by ID |
| `/notes/[id]/edit`        | GET    | Edit note form              | Direct access by ID |

#### APIs

| Path                      | Method | Purpose                | Response            |
| ------------------------- | ------ | ---------------------- | ------------------- |
| `/api/animals/[id]/notes` | GET    | List animal's notes    | `Note[]`            |
| `/api/animals/[id]/notes` | POST   | Create note for animal | `Note`              |
| `/api/notes/[id]`         | GET    | Get note by ID         | `Note`              |
| `/api/notes/[id]`         | PUT    | Update note            | `Note`              |
| `/api/notes/[id]`         | DELETE | Delete note            | `{ success: true }` |

### 📊 Reports & History

#### Pages

| Path                    | Method | Purpose                | Navigation Pattern |
| ----------------------- | ------ | ---------------------- | ------------------ |
| `/customers/history`    | GET    | Customer visit history | Top-level feature  |
| `/reports/daily-totals` | GET    | Daily totals report    | Top-level feature  |

#### APIs

| Path                        | Method | Purpose               | Response    |
| --------------------------- | ------ | --------------------- | ----------- |
| `/api/customers/history`    | GET    | Customer history data | `History[]` |
| `/api/reports/daily-totals` | GET    | Daily totals data     | `Report`    |

### 🔧 Admin

#### APIs

| Path                | Method | Purpose         | Response |
| ------------------- | ------ | --------------- | -------- |
| `/api/admin/backup` | GET    | Database backup | `Backup` |

## Navigation Patterns

### ✅ Correct Patterns

```typescript
// List customer's animals (contextual)
router.push(`/customer/${customerId}/animals`)

// Create animal for customer (contextual)
router.push(`/customer/${customerId}/newAnimal`)

// View specific animal (direct by ID)
router.push(`/animals/${animalId}`)

// Edit specific animal (direct by ID)
router.push(`/animals/${animalId}/edit`)

// List animal's notes (contextual)
router.push(`/animals/${animalId}/notes`)

// View specific note (direct by ID)
router.push(`/notes/${noteId}`)

// After creating animal, show it
router.push(`/animals/${createdAnimal.id}`)

// After creating animal, return to customer
router.push(`/customer/${customerId}`)
```

### ❌ Incorrect Patterns to Avoid

```typescript
// TOO DEEP - Don't nest beyond 2 levels
router.push(`/customer/${cid}/animal/${aid}/note/${nid}`) ❌

// INCONSISTENT - Use flat access when you have ID
router.push(`/customer/${cid}/animal/${aid}`) ❌

// WRONG - Should use flat access
router.push(`/customer/${cid}/animals/${aid}`) ❌

// WRONG - Query params for resource creation
router.push(`/animals/new?customerId=${cid}`) ❌
```

## Type Definitions

```typescript
// Route Parameter Types
type CustomerRouteParams = { id: string }
type AnimalRouteParams = { id: string }
type BreedRouteParams = { id: string }
type NoteRouteParams = { noteId: string }

// Navigation Helpers
const routes = {
  home: () => '/',

  // Customers
  customers: () => '/customers',
  customersAdd: () => '/customers/add',
  customerDetail: (id: number) => `/customer/${id}`,
  customerEdit: (id: number) => `/customer/${id}/edit`,
  customerAnimals: (id: number) => `/customer/${id}/animals`,
  customerNewAnimal: (id: number) => `/customer/${id}/newAnimal`,

  // Animals
  animals: () => '/animals',
  animalDetail: (id: number) => `/animals/${id}`,
  animalEdit: (id: number) => `/animals/${id}/edit`,
  animalNotes: (id: number) => `/animals/${id}/notes`,
  animalNewNote: (id: number) => `/animals/${id}/notes/new`,

  // Breeds
  breeds: () => '/breeds',
  breedAdd: () => '/breeds/add',
  breedDetail: (id: number) => `/breeds/${id}`,
  breedEdit: (id: number) => `/breeds/${id}/edit`,

  // Notes
  noteDetail: (id: number) => `/notes/${id}`,
  noteEdit: (id: number) => `/notes/${id}/edit`,

  // Reports
  customersHistory: () => '/customers/history',
  dailyTotals: () => '/reports/daily-totals',
}
```

## Migration Guide

### From Old Pattern to New Pattern

| Old (Wrong)                 | New (Correct)           | Reason                               |
| --------------------------- | ----------------------- | ------------------------------------ |
| `/animals/new?customerId=X` | `/customer/X/newAnimal` | Contextual creation, no query params |
| `/customer/X/animal/Y`      | `/animals/Y`            | Direct access by ID (flatten)        |
| `/animal/X`                 | `/animals/X`            | Plural collection names              |
| `/animals/X/note/Y`         | `/notes/Y`              | Direct access by ID (flatten)        |

## Related Documentation

- **TESTING.md** - Test coverage for all routes
- **CHANGELOG.md** - Route changes and updates
- **.project/steering/CHANGELOG.md** - Project-level routing decisions
- **FILETREE.md** - File structure for pages and API routes

## Validation Checklist

Before deploying or merging route changes:

- [ ] All navigation uses correct patterns (contextual nesting vs. flat access)
- [ ] No URLs exceed 2 levels of nesting
- [ ] No query parameters for resource creation (use nested routes)
- [ ] All `router.push()` calls follow this specification
- [ ] All `<Link href="">` components follow this specification
- [ ] All API endpoints match this structure
- [ ] Page files exist at correct paths in `src/app/`
- [ ] API routes exist at correct paths in `src/app/api/`
- [ ] Tests updated to reflect route changes
- [ ] Documentation updated (TESTING.md, CHANGELOG.md)

## Notes

- **Singular vs. Plural**: Use singular for detail pages (`/customer/[id]`), plural for collections (`/customers`)
- **Query Parameters**: Only use for filtering/pagination, never for resource identification
- **File Structure**: Next.js 15 App Router uses folder structure to define routes
- **Dynamic Segments**: Use `[id]` or `[noteId]` folder names for dynamic routes
- **Route Handlers**: API routes use `route.ts` files in `src/app/api/`

---

**⚠️ IMPORTANT**: This document is the single source of truth for routing. All navigation throughout the application MUST follow these patterns. Deviations require updating this document first.
