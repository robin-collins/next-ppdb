# Customer Detail Page Component - Redesign Specification

**Document Version:** 1.0
**Date:** 2025-11-14
**Status:** Specification
**Reference Mockup:** `reference/redesign/customer-record-modern.html`

---

## Table of Contents

1. [Overview](#overview)
2. [Current vs. Target State](#current-vs-target-state)
3. [Component Architecture](#component-architecture)
4. [Layout Structure](#layout-structure)
5. [Header Section](#header-section)
6. [Customer Header](#customer-header)
7. [Main Content Area](#main-content-area)
8. [Sidebar Content](#sidebar-content)
9. [Design System Tokens](#design-system-tokens)
10. [Component Hierarchy](#component-hierarchy)
11. [Data Requirements](#data-requirements)
12. [State Management](#state-management)
13. [Responsive Behavior](#responsive-behavior)
14. [Animations & Interactions](#animations--interactions)
15. [Implementation Checklist](#implementation-checklist)

---

## Overview

The customer detail page requires a complete redesign from a minimal single-column layout to a rich, modern two-column interface with glassmorphic effects, comprehensive customer information, and quick action capabilities.

### Goals

- **Enhanced Information Architecture**: Two-column layout with main content and sidebar
- **Professional Visual Design**: Glassmorphic cards, gradient backgrounds, proper shadows
- **Improved User Experience**: Breadcrumb navigation, status indicators, quick actions
- **Better Data Presentation**: Card-based sections with icons, grids, and proper hierarchy
- **Rich Interactivity**: Hover effects, animations, edit modes, quick actions

---

## Current vs. Target State

### Current Implementation Issues

1. **Layout**
   - Single column with no sidebar
   - Basic white card on gradient background
   - No persistent header or navigation

2. **Visual Design**
   - Minimal styling, no glassmorphic effects
   - No icons or visual hierarchy
   - Plain text lists instead of styled cards

3. **Information Display**
   - Limited customer metadata (only phone and animal count)
   - No status badges or customer statistics
   - Missing quick actions sidebar

4. **Animal Display**
   - Plain text list
   - No animal cards with detailed information
   - Missing visual indicators (color, last visit, cost)

### Target Implementation

- Two-column responsive grid (main + 400px sidebar)
- Glassmorphic cards throughout with backdrop blur
- Persistent sticky header with breadcrumbs
- Rich customer header with avatar, status badge, meta grid
- Card-based sections with icons and proper styling
- Animal cards with avatars, details, and actions
- Sidebar with contact details, statistics, and quick actions

---

## Component Architecture

### File Structure

```
src/
├── app/
│   └── customer/
│       └── [id]/
│           └── page.tsx                 # Main customer detail page (refactor)
├── components/
│   ├── customer/
│   │   ├── CustomerHeader.tsx           # NEW: Customer avatar, name, status, meta
│   │   ├── CustomerInfoCard.tsx         # NEW: Customer information form
│   │   ├── AssociatedAnimalsCard.tsx    # NEW: Animals grid with cards
│   │   ├── AnimalDetailCard.tsx         # NEW: Individual animal card
│   │   ├── ContactDetailsCard.tsx       # NEW: Sidebar contact info
│   │   ├── CustomerStatsCard.tsx        # NEW: Sidebar statistics
│   │   └── QuickActionsCard.tsx         # NEW: Sidebar quick actions
│   └── Header.tsx                       # EXISTING: Ensure breadcrumb support
```

### Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + CSS Custom Properties
- **State**: Zustand store (customers + animals)
- **Data Fetching**: Server Components + Client Components pattern
- **Validation**: Zod schemas

---

## Layout Structure

### Overall Page Layout

```tsx
<div className="app-layout">
  {/* Persistent Header - EXISTING COMPONENT */}
  <Header
    breadcrumbs={[
      { label: 'Dashboard', href: '/' },
      { label: 'Customers', href: '/customers' },
      { label: customer.surname, current: true },
    ]}
  />

  {/* Main Content with Glassmorphic Background */}
  <main className="main-content">
    <div className="content-wrapper">
      {/* Customer Header Section */}
      <CustomerHeader customer={customer} />

      {/* Two-Column Grid */}
      <div className="content-grid">
        {/* Main Column */}
        <div className="main-column">
          <CustomerInfoCard customer={customer} />
          <AssociatedAnimalsCard customerId={customer.id} />
        </div>

        {/* Sidebar Column */}
        <div className="sidebar-column">
          <ContactDetailsCard customer={customer} />
          <CustomerStatsCard customer={customer} />
          <QuickActionsCard customerId={customer.id} />
        </div>
      </div>
    </div>
  </main>
</div>
```

### CSS Grid Specification

```css
.content-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: var(--space-8); /* 2rem */
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## Header Section

### Breadcrumb Requirements

The existing `Header.tsx` component needs to support breadcrumbs:

**Props Extension:**

```typescript
interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface HeaderProps {
  breadcrumbs?: BreadcrumbItem[]
  // ... existing props
}
```

**Visual Spec (from mockup):**

```html
<div className="breadcrumb">
  <a href="#" className="breadcrumb-link">Dashboard</a>
  <span className="breadcrumb-separator">›</span>
  <a href="#" className="breadcrumb-link">Customers</a>
  <span className="breadcrumb-separator">›</span>
  <span className="breadcrumb-current">James</span>
</div>
```

**Styling:**

- Font size: 0.875rem
- Link color: `--primary` (#6366f1)
- Current color: `--gray-800`
- Separator color: `--gray-400`

---

## Customer Header

### Component: `CustomerHeader.tsx`

**Purpose:** Display customer avatar, name, status, metadata, and primary actions.

**Visual Layout:**

```
┌────────────────────────────────────────────────────────────┐
│  [Avatar]  Name              [Status Badge]                │
│   120px    2.5rem/800                                       │
│            ─────────────────────────────────                │
│            Meta Grid (4 columns, responsive):               │
│            • Customer Since  • Primary Phone                │
│            • Animals         • Last Visit                   │
│            ─────────────────────────────────                │
│            [Edit Customer] [Add Animal] [Full History]      │
└────────────────────────────────────────────────────────────┘
```

**Data Structure:**

```typescript
interface CustomerHeaderProps {
  customer: {
    id: number
    surname: string
    forename?: string
    phone1: string
    email?: string
    createdAt?: Date // or derive from first visit
    _count?: {
      animals: number
    }
    animals?: Array<{
      lastVisit?: Date
    }>
  }
}
```

**Avatar Specification:**

- Size: 120px × 120px
- Background: `linear-gradient(135deg, var(--secondary), var(--primary))`
- Border radius: `var(--radius-2xl)` (1.5rem)
- Text: First letter of surname, 3rem, weight 800, white
- Shadow: `var(--shadow-lg)`

**Status Badge Logic:**

```typescript
const getCustomerStatus = (customer: Customer) => {
  const firstVisitYear = customer.createdAt?.getFullYear()
  const currentYear = new Date().getFullYear()

  if (firstVisitYear && currentYear - firstVisitYear >= 5) {
    return {
      label: 'Legacy Customer',
      className: 'status-legacy', // background: warning color
    }
  }

  return {
    label: 'Active',
    className: 'status-active', // background: success color
  }
}
```

**Meta Grid Items:**

1. **Customer Since**
   - Label: "Customer Since" (0.75rem, uppercase, gray-500)
   - Value: Year (1rem, weight 600, gray-800)
   - Derive from: `createdAt` or earliest animal visit

2. **Primary Phone**
   - Label: "Primary Phone"
   - Value: `customer.phone1` formatted

3. **Animals**
   - Label: "Animals"
   - Value: `{count} Pet` or `{count} Pets`

4. **Last Visit**
   - Label: "Last Visit"
   - Value: Most recent `animal.lastVisit` formatted as "MMM DD, YYYY"

**Action Buttons:**

```tsx
<div className="customer-actions">
  <button className="btn btn-primary" onClick={handleEdit}>
    <PencilIcon /> Edit Customer
  </button>
  <button className="btn btn-success" onClick={handleAddAnimal}>
    <PlusIcon /> Add Animal
  </button>
  <button className="btn btn-secondary" onClick={handleHistory}>
    <ClockIcon /> Full History
  </button>
</div>
```

**Styling Classes:**

```css
.customer-header {
  display: flex;
  gap: var(--space-6);
  margin-bottom: var(--space-8);
  padding-bottom: var(--space-6);
  border-bottom: 1px solid var(--gray-200);
}

.customer-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.customer-actions {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}
```

---

## Main Content Area

### Component: `CustomerInfoCard.tsx`

**Purpose:** Display and edit customer contact and address information.

**Card Structure:**

```html
<div className="card">
  <div className="card-header">
    <h2 className="card-title">
      <UserIcon className="card-icon" />
      Customer Information
    </h2>
    <button className="btn btn-secondary btn-small"><PencilIcon /> Edit</button>
  </div>

  <div className="card-content">
    <div className="form-grid">
      <!-- 2-column grid of form fields -->
    </div>
  </div>
</div>
```

**Form Grid Fields:**

```typescript
const formFields = [
  {
    name: 'forename',
    label: 'First Name',
    placeholder: 'Not provided',
    fullWidth: false,
  },
  {
    name: 'surname',
    label: 'Surname',
    placeholder: 'Not provided',
    fullWidth: false,
  },
  {
    name: 'address1',
    label: 'Address',
    type: 'textarea',
    placeholder: 'No address provided',
    fullWidth: true,
  },
  {
    name: 'suburb',
    label: 'Suburb',
    placeholder: 'Not provided',
    fullWidth: false,
  },
  {
    name: 'postcode',
    label: 'Postcode',
    placeholder: 'Not provided',
    fullWidth: false,
  },
  {
    name: 'phone1',
    label: 'Phone 1',
    placeholder: 'Not provided',
    fullWidth: false,
  },
  {
    name: 'phone2',
    label: 'Phone 2',
    placeholder: 'Not provided',
    fullWidth: false,
  },
  {
    name: 'phone3',
    label: 'Phone 3',
    placeholder: 'Not provided',
    fullWidth: false,
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'No email provided',
    fullWidth: true,
  },
]
```

**Field Styling:**

```css
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-input,
.form-textarea {
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-lg);
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-input.empty-state {
  color: var(--gray-500);
  font-style: italic;
}
```

**Edit Mode Behavior:**

- Default: Read-only inputs with `readonly` attribute
- Edit button click: Remove `readonly`, enable editing
- Show "Save" and "Cancel" buttons in edit mode
- Validate on save using Zod schema from `src/lib/validations/`

---

### Component: `AssociatedAnimalsCard.tsx`

**Purpose:** Display all animals associated with the customer in a grid of cards.

**Card Structure:**

```html
<div className="card">
  <div className="card-header">
    <h2 className="card-title">
      <PawIcon className="card-icon" />
      Associated Animals (3)
    </h2>
    <button className="btn btn-success btn-small">
      <PlusIcon /> Add Animal
    </button>
  </div>

  <div className="card-content">
    <div className="animals-grid">
      <AnimalDetailCard animal="{animal1}" />
      <AnimalDetailCard animal="{animal2}" />
      <AnimalDetailCard animal="{animal3}" />
    </div>
  </div>
</div>
```

**Animals Grid:**

```css
.animals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
}
```

---

### Component: `AnimalDetailCard.tsx`

**Purpose:** Individual animal card with avatar, details, and actions.

**Visual Layout:**

```
┌─────────────────────────────────────┐ ← Gradient top border
│  [Avatar] Name                 [×]  │
│   40px    Breed                     │
│  ─────────────────────────────────  │
│  COLOR           SEX                │
│  White & Gold    Male               │
│  LAST VISIT      SERVICE COST       │
│  Sep 10, 2021    $60                │
└─────────────────────────────────────┘
```

**Props:**

```typescript
interface AnimalDetailCardProps {
  animal: {
    id: number
    animalname: string
    breed: {
      breedname: string
    }
    colour: string
    SEX: 'Male' | 'Female'
    lastvisit?: Date
    lastcost?: number
  }
  onDelete?: (id: number) => void
  onClick?: (id: number) => void
}
```

**Styling:**

```css
.animal-card {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.animal-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.animal-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary);
}
```

**Avatar:**

- Size: 40px × 40px
- Background: `linear-gradient(135deg, var(--primary-light), var(--secondary))`
- Border radius: `var(--radius-full)`
- Text: First letter of animal name, 1.125rem, weight 700

**Info Grid:**

```css
.animal-card-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
  font-size: 0.875rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.info-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gray-500);
}

.info-value {
  font-weight: 500;
  color: var(--gray-800);
}
```

---

## Sidebar Content

### Component: `ContactDetailsCard.tsx`

**Purpose:** Display contact methods with icons and quick actions.

**Card Structure:**

```html
<div className="card">
  <div className="card-header">
    <h2 className="card-title">
      <PhoneIcon className="card-icon" />
      Contact Details
    </h2>
    <button className="btn btn-secondary btn-small"><PencilIcon /> Edit</button>
  </div>

  <div className="card-content">
    <ul className="contact-list">
      <ContactItem
        icon="phone"
        value="0428111261"
        action="Call"
        href="tel:0428111261"
      />
      <ContactItem icon="phone" value="No secondary phone" action="Add" empty />
      <ContactItem
        icon="location"
        value="No address provided"
        action="Add"
        empty
      />
      <ContactItem icon="email" value="No email provided" action="Add" empty />
    </ul>
  </div>
</div>
```

**Contact Item Styling:**

```css
.contact-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.contact-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  transition: background 0.2s ease;
}

.contact-item:hover {
  background: var(--gray-50);
}

.contact-action {
  font-size: 0.75rem;
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.contact-item:hover .contact-action {
  opacity: 1;
}
```

---

### Component: `CustomerStatsCard.tsx`

**Purpose:** Display key customer statistics in a grid.

**Card Structure:**

```html
<div className="card">
  <div className="card-header">
    <h2 className="card-title">
      <ChartIcon className="card-icon" />
      Customer Statistics
    </h2>
  </div>

  <div className="card-content">
    <div className="quick-stats">
      <StatItem number="10+" label="Years Active" />
      <StatItem number="1" label="Animals" />
      <StatItem number="15+" label="Total Visits" />
      <StatItem number="$850+" label="Total Spent" />
    </div>
  </div>
</div>
```

**Stats Grid:**

```css
.quick-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}

.stat-item {
  text-align: center;
  padding: var(--space-4);
  background: var(--gray-50);
  border-radius: var(--radius-lg);
  border: 1px solid var(--gray-200);
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--primary);
  display: block;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--gray-600);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
}
```

**Data Calculation:**

```typescript
const calculateCustomerStats = (customer: Customer) => {
  const currentYear = new Date().getFullYear()
  const firstYear = customer.createdAt?.getFullYear() || currentYear
  const yearsActive = currentYear - firstYear

  const animalCount = customer._count?.animals || 0

  // Calculate from visit history
  const totalVisits =
    customer.animals?.reduce((sum, animal) => {
      return sum + (animal._count?.visits || 0)
    }, 0) || 0

  const totalSpent =
    customer.animals?.reduce((sum, animal) => {
      return sum + (animal.visits?.reduce((s, v) => s + (v.cost || 0), 0) || 0)
    }, 0) || 0

  return {
    yearsActive: yearsActive > 0 ? `${yearsActive}+` : '< 1',
    animals: animalCount,
    totalVisits: totalVisits > 0 ? `${totalVisits}+` : '0',
    totalSpent: totalSpent > 0 ? `$${totalSpent}+` : '$0',
  }
}
```

---

### Component: `QuickActionsCard.tsx`

**Purpose:** Provide quick access to common customer actions.

**Card Structure:**

```html
<div className="card">
  <div className="card-header">
    <h2 className="card-title">
      <StarIcon className="card-icon" />
      Quick Actions
    </h2>
  </div>

  <div className="card-content">
    <div className="action-buttons">
      <button className="btn btn-primary"><UpdateIcon /> Update Record</button>
      <button className="btn btn-success"><PlusIcon /> Add New Animal</button>
      <button className="btn btn-secondary">
        <PawIcon /> View All Animals
      </button>
      <button className="btn btn-warning">
        <ClockIcon /> Customer History
      </button>
      <button className="btn btn-danger"><TrashIcon /> Delete Customer</button>
    </div>
  </div>
</div>
```

**Button Stack Styling:**

```css
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.action-buttons .btn {
  width: 100%;
}
```

---

## Design System Tokens

### Colors

```css
:root {
  /* Primary Colors */
  --primary: #6366f1;
  --primary-hover: #4f46e5;
  --primary-light: #e0e7ff;

  /* Secondary Colors */
  --secondary: #06b6d4;
  --secondary-hover: #0891b2;

  /* Semantic Colors */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --accent: #f59e0b;
  --accent-hover: #d97706;

  /* Neutrals */
  --white: #ffffff;
  --gray-50: #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-300: #cbd5e1;
  --gray-400: #94a3b8;
  --gray-500: #64748b;
  --gray-600: #475569;
  --gray-700: #334155;
  --gray-800: #1e293b;
  --gray-900: #0f172a;
}
```

### Typography

```css
:root {
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Font Sizes */
h1 {
  font-size: 2.5rem;
  font-weight: 800;
} /* Customer name */
h2 {
  font-size: 1.125rem;
  font-weight: 700;
} /* Card titles */
h3 {
  font-size: 1.125rem;
  font-weight: 700;
} /* Animal names */
body {
  font-size: 1rem;
  line-height: 1.6;
}

.meta-label {
  font-size: 0.75rem;
  text-transform: uppercase;
}
.stat-label {
  font-size: 0.75rem;
  text-transform: uppercase;
}
```

### Spacing

```css
:root {
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem; /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem; /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem; /* 24px */
  --space-8: 2rem; /* 32px */
  --space-10: 2.5rem; /* 40px */
  --space-12: 3rem; /* 48px */
  --space-16: 4rem; /* 64px */
}
```

### Border Radius

```css
:root {
  --radius-sm: 0.375rem; /* 6px */
  --radius-md: 0.5rem; /* 8px */
  --radius-lg: 0.75rem; /* 12px */
  --radius-xl: 1rem; /* 16px */
  --radius-2xl: 1.5rem; /* 24px */
  --radius-full: 9999px; /* Circular */
}
```

### Shadows

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg:
    0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl:
    0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}
```

---

## Component Hierarchy

```
CustomerDetailPage (Server Component)
├── Header (Client Component) - EXISTING
│   └── Breadcrumbs
├── Main Content
│   ├── CustomerHeader (Client Component) - NEW
│   │   ├── Avatar
│   │   ├── Name & Status Badge
│   │   ├── Meta Grid (4 items)
│   │   └── Action Buttons (3)
│   └── ContentGrid
│       ├── MainColumn
│       │   ├── CustomerInfoCard (Client Component) - NEW
│       │   │   ├── Card Header with Edit button
│       │   │   └── Form Grid (9 fields)
│       │   └── AssociatedAnimalsCard (Client Component) - NEW
│       │       ├── Card Header with Add button
│       │       └── Animals Grid
│       │           └── AnimalDetailCard × N (Client Component) - NEW
│       └── SidebarColumn
│           ├── ContactDetailsCard (Client Component) - NEW
│           │   └── Contact List (4 items)
│           ├── CustomerStatsCard (Client Component) - NEW
│           │   └── Stats Grid (4 stats)
│           └── QuickActionsCard (Client Component) - NEW
│               └── Action Buttons (5)
```

---

## Data Requirements

### Customer Data Shape

```typescript
interface CustomerDetailData {
  id: number
  surname: string
  forename?: string | null
  address1?: string | null
  suburb?: string | null
  postcode?: number | null
  phone1: string
  phone2?: string | null
  phone3?: string | null
  email?: string | null
  createdAt?: Date

  // Relations
  animals: Array<{
    id: number
    animalname: string
    colour: string
    SEX: 'Male' | 'Female'
    lastvisit?: Date | null
    lastcost?: number | null
    breed: {
      breedname: string
    }
  }>

  // Counts
  _count?: {
    animals: number
  }
}
```

### API Endpoint

**GET `/api/customers/[id]`**

```typescript
// src/app/api/customers/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const customer = await prisma.customer.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      animals: {
        include: {
          breed: true,
        },
        orderBy: {
          animalname: 'asc',
        },
      },
      _count: {
        select: { animals: true },
      },
    },
  })

  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
  }

  return NextResponse.json(customer)
}
```

---

## State Management

### Zustand Store Updates

**File:** `src/store/customersStore.ts`

```typescript
interface CustomersState {
  // ... existing state
  selectedCustomer: CustomerDetailData | null
  isEditMode: boolean

  // Actions
  fetchCustomer: (id: number) => Promise<void>
  updateCustomer: (id: number, data: Partial<Customer>) => Promise<void>
  deleteCustomer: (id: number) => Promise<void>
  toggleEditMode: () => void
}
```

### Component State

**CustomerInfoCard:**

- Local edit mode state
- Form validation errors
- Loading state during save

**AssociatedAnimalsCard:**

- Loading state during fetch
- Delete confirmation modal state

**QuickActionsCard:**

- Delete confirmation dialog state
- Loading states for actions

---

## Responsive Behavior

### Breakpoints

```css
/* Mobile: < 768px */
@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr; /* Stack sidebar below */
  }

  .customer-header {
    flex-direction: column;
    text-align: center;
  }

  .customer-name {
    font-size: 2rem; /* Reduce from 2.5rem */
  }

  .form-grid {
    grid-template-columns: 1fr; /* Single column form */
  }

  .customer-actions {
    justify-content: center;
  }

  .quick-stats {
    grid-template-columns: 1fr; /* Stack stats */
  }

  .animals-grid {
    grid-template-columns: 1fr; /* Single column animals */
  }
}

/* Tablet: 768px - 1024px */
@media (min-width: 768px) and (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr; /* Stack on tablet too */
  }
}

/* Desktop: > 1024px */
@media (min-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr 400px; /* Two-column layout */
  }
}
```

---

## Animations & Interactions

### Card Animations

**Staggered Entry:**

```css
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  animation: slideInUp 0.4s ease-out forwards;
}

.card:nth-child(1) {
  animation-delay: 0s;
}
.card:nth-child(2) {
  animation-delay: 0.1s;
}
.card:nth-child(3) {
  animation-delay: 0.2s;
}
.card:nth-child(4) {
  animation-delay: 0.3s;
}
```

### Animal Card Animations

```css
.animal-card {
  animation: slideInUp 0.4s ease-out forwards;
}

.animal-card:nth-child(1) {
  animation-delay: 0s;
}
.animal-card:nth-child(2) {
  animation-delay: 0.1s;
}
.animal-card:nth-child(3) {
  animation-delay: 0.2s;
}
/* ... etc */
```

### Hover Effects

```css
.card:hover {
  box-shadow: var(--shadow-md);
}

.animal-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary);
}

.btn:hover {
  transform: translateY(-1px);
}
```

---

## Implementation Checklist

### Phase 1: Structure & Layout

- [ ] Create new component files in `src/components/customer/`
- [ ] Set up two-column grid layout in customer detail page
- [ ] Add breadcrumb support to existing Header component
- [ ] Implement glassmorphic card base styles

### Phase 2: Customer Header

- [ ] Build `CustomerHeader.tsx` component
- [ ] Implement avatar with gradient background
- [ ] Add status badge logic (Active vs. Legacy)
- [ ] Create meta grid with 4 data points
- [ ] Add action buttons row

### Phase 3: Main Content Cards

- [ ] Build `CustomerInfoCard.tsx`
  - [ ] Two-column form grid
  - [ ] Read-only mode by default
  - [ ] Edit mode toggle
  - [ ] Form validation with Zod
  - [ ] Save/cancel functionality
- [ ] Build `AssociatedAnimalsCard.tsx`
  - [ ] Animals grid layout
  - [ ] Add Animal button
- [ ] Build `AnimalDetailCard.tsx`
  - [ ] Avatar, name, breed display
  - [ ] Info grid (color, sex, last visit, cost)
  - [ ] Delete button with confirmation
  - [ ] Click to navigate to animal detail

### Phase 4: Sidebar Cards

- [ ] Build `ContactDetailsCard.tsx`
  - [ ] Contact list with icons
  - [ ] Hover-to-reveal actions
  - [ ] Click-to-call/email links
- [ ] Build `CustomerStatsCard.tsx`
  - [ ] Stats calculation logic
  - [ ] 2×2 grid layout
- [ ] Build `QuickActionsCard.tsx`
  - [ ] Vertical button stack
  - [ ] Delete customer with confirmation

### Phase 5: Data Integration

- [ ] Create/update customer API endpoint at `/api/customers/[id]`
- [ ] Update Zustand customersStore with new actions
- [ ] Implement data fetching in page component
- [ ] Add error handling and loading states

### Phase 6: Interactions

- [ ] Implement edit mode for customer info
- [ ] Add delete confirmation modals
- [ ] Implement navigation to animal detail
- [ ] Add keyboard shortcuts (Ctrl+E for edit, etc.)

### Phase 7: Polish

- [ ] Add card entry animations
- [ ] Implement hover effects
- [ ] Test responsive behavior at all breakpoints
- [ ] Add error states and empty states
- [ ] Test with real data from database

### Phase 8: Testing & Refinement

- [ ] Manual testing on desktop
- [ ] Manual testing on tablet
- [ ] Manual testing on mobile
- [ ] Cross-browser testing
- [ ] Accessibility review
- [ ] Performance optimization (image loading, etc.)

---

## Notes & Considerations

### Icons

The mockup uses inline SVG icons. Consider:

- Using a library like `lucide-react` or `heroicons`
- Creating a shared `Icon` component wrapper
- Ensuring consistent sizing (16px/18px/20px)

### Form Validation

Reuse existing Zod schemas from `src/lib/validations/customer.ts`:

```typescript
import { customerSchema } from '@/lib/validations/customer'

// In component:
const result = customerSchema.safeParse(formData)
if (!result.success) {
  // Handle validation errors
}
```

### Delete Confirmations

Implement a reusable confirmation dialog:

```typescript
const confirmDelete = async (entityType: string, entityName: string) => {
  return window.confirm(
    `Are you sure you want to delete ${entityType} "${entityName}"? This action cannot be undone.`
  )
}
```

Consider using a modal component for better UX.

### Performance

- Use React `memo` for animal cards if list is long
- Implement optimistic UI updates for delete/edit actions
- Consider pagination if customer has many animals (>20)

### Accessibility

- Ensure all interactive elements are keyboard accessible
- Add proper ARIA labels to buttons and form fields
- Ensure sufficient color contrast (WCAG AA)
- Test with screen reader

---

## Reference Files

- **Mockup HTML:** `reference/redesign/customer-record-modern.html`
- **Current Implementation:** `src/app/customer/[id]/page.tsx`
- **Existing Header:** `src/components/Header.tsx`
- **Design System:** `src/app/globals.css`
- **Prisma Schema:** `prisma/schema.prisma`
- **Customer Validation:** `src/lib/validations/customer.ts`

---

**End of Specification**
