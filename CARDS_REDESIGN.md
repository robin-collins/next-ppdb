# Search Result Card Redesign - Complete Roadmap

**Date:** 2025-12-02
**Purpose:** Document all changes made to AnimalCard component for reference when updating list view

---

## Objective

Prioritize essential information for staff efficiency: **Animal → Breed → Customer → Contact → Location**. Remove non-essential data (color was later restored), improve scanability, and utilize horizontal whitespace on desktop.

---

## Phase 1: Information Hierarchy Redesign (Vertical)

### 1. Data Priority Changes

| Priority | Element       | Change                                                 | Rationale                                     |
| -------- | ------------- | ------------------------------------------------------ | --------------------------------------------- |
| 1        | Animal Name   | `text-lg` → `text-xl md:text-2xl`, bold                | Primary identifier, needs instant recognition |
| 2        | Breed         | Grey → `text-[var(--primary)]`, `text-sm md:text-base` | Important context, brand color association    |
| 3        | Customer Name | `text-sm` → `text-xl md:text-2xl`, bold uppercase      | Staff lookup by surname                       |
| 4        | Phone Numbers | Small → `text-base md:text-lg`, with icons             | Primary contact method                        |
| 5        | Location      | Badge pills → inline text                              | Easier to read                                |
| 6        | Email         | Not shown → Added with icon                            | Secondary contact                             |
| 7        | Color         | Removed → Later restored                               | User feedback                                 |
| 8        | Last Visit    | Prominent → Subtle                                     | Reference only                                |

### 2. Data Validation & Filtering

```typescript
// Phone validation - filters bad data
const isValidPhone = (phone: string | null | undefined): phone is string => {
  if (!phone) return false
  const trimmed = phone.trim().toLowerCase()
  return trimmed !== '' && trimmed !== 'unknown' && trimmed !== '0'
}

// Email validation - must contain @
const validEmail = animal.customer.email?.includes('@')
  ? animal.customer.email
  : null

// Postcode formatting - pad to 4 digits
const formattedPostcode = animal.customer.postcode
  ? animal.customer.postcode.toString().padStart(4, '0')
  : null
```

### 3. Phone Number Formatting

```typescript
function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10)
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
  if (digits.length === 8) return `${digits.slice(0, 4)} ${digits.slice(4)}`
  return phone
}
```

### 4. Click Actions

- **Phone**: `<a href="tel:...">` - click-to-call
- **Email**: `<a href="mailto:...">` - click-to-email
- **Customer section**: Navigate to customer detail page
- **Card**: Navigate to animal detail page

---

## Phase 2: Responsive Horizontal Layout

### 1. Layout Structure

```
Desktop (md+):
┌─────────────────────────────────────────────────────────────┐
│ ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ │  ← Gradient accent bar
│ LEFT (1/3)              │ RIGHT (2/3)                       │
│ [Avatar] Animal Name    │ CUSTOMER SURNAME, Firstname       │
│          Breed          │ Street Address | Suburb | Postcode│
│          Color          │ 📞 Primary  📞 Secondary  📞 Third │
│          Last Visit: XX │ ✉️ email@example.com               │
└─────────────────────────────────────────────────────────────┘

Mobile (< md):
┌─────────────────────────────────────────────────────────────┐
│ ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ │
│ [Avatar] Animal Name                                        │
│          Breed                                              │
│          Color                                              │
│          Last Visit: XX                                     │
│ ───────────────────────────────────────────────────────── │  ← Horizontal divider
│ CUSTOMER SURNAME, Firstname                                │
│ Street Address | Suburb | Postcode                         │
│ 📞 Primary  📞 Secondary  📞 Third                          │
│ ✉️ email@example.com                                        │
└─────────────────────────────────────────────────────────────┘
```

### 2. CSS Classes Summary

**Container:**

```jsx
<div className="flex flex-col p-4 md:flex-row md:p-0">
```

**Left Section (Animal):**

```jsx
<div className="flex items-start gap-3 rounded-lg transition-all
  hover:bg-[var(--primary-light)]
  md:w-1/3 md:flex-shrink-0 md:border-r md:border-[var(--gray-200)] md:p-4">
```

**Divider (Mobile only):**

```jsx
<div className="my-3 h-px bg-[var(--gray-200)] md:hidden" />
```

**Right Section (Customer):**

```jsx
<div className="flex min-w-0 flex-1 cursor-pointer flex-col justify-center gap-2
  rounded-lg transition-all hover:bg-[var(--primary-light)]
  md:gap-1 md:p-4">
```

---

## Phase 3: Styling Details

### 1. Typography

| Element            | Classes                                                          |
| ------------------ | ---------------------------------------------------------------- |
| Animal Name        | `text-xl md:text-2xl font-bold text-[var(--gray-900)]`           |
| Breed              | `text-sm md:text-base font-medium text-[var(--primary)]`         |
| Color              | `text-xs text-[var(--gray-500)]`                                 |
| Last Visit Label   | `text-xs text-[var(--gray-400)]`                                 |
| Last Visit Date    | `font-bold` (within label)                                       |
| Customer Name      | `text-xl md:text-2xl font-bold uppercase text-[var(--gray-800)]` |
| Customer Firstname | `font-normal normal-case text-[var(--gray-600)]`                 |
| Street Address     | `text-sm text-[var(--gray-500)]`                                 |
| Suburb/Postcode    | `font-medium text-[var(--secondary)]`                            |
| Primary Phone      | `text-base md:text-lg font-semibold text-[var(--secondary)]`     |
| Secondary Phones   | `text-base md:text-lg font-semibold text-[var(--gray-600)]`      |
| Email              | `text-sm text-[var(--gray-600)]`                                 |

### 2. Color Usage

| Color Variable    | Usage                              |
| ----------------- | ---------------------------------- |
| `--primary`       | Breed text                         |
| `--primary-light` | Hover background (both sections)   |
| `--secondary`     | Suburb, postcode, primary phone    |
| `--gray-400`      | Last visit label                   |
| `--gray-500`      | Color, street address              |
| `--gray-600`      | Firstname, secondary phones, email |
| `--gray-800`      | Customer surname                   |
| `--gray-900`      | Animal name                        |

### 3. Interactive States

| Element          | Hover Effect                                                         |
| ---------------- | -------------------------------------------------------------------- |
| Animal Section   | `hover:bg-[var(--primary-light)]`                                    |
| Customer Section | `hover:bg-[var(--primary-light)]`                                    |
| Primary Phone    | `hover:text-[var(--secondary-hover)]`                                |
| Secondary Phones | `hover:text-[var(--gray-800)]`                                       |
| Email            | `hover:text-[var(--primary)]`                                        |
| Whole Card       | `hover:-translate-y-1 hover:border-[var(--primary)] hover:shadow-xl` |

### 4. Address Display Logic

```jsx
{
  /* Format: Address | Suburb | Postcode */
}
{
  animal.customer.address && (
    <>
      <span className="text-sm text-[var(--gray-500)]">{address}</span>
      {(suburb || postcode) && (
        <span className="text-[var(--gray-300)]">|</span>
      )}
    </>
  )
}
{
  suburb && (
    <span className="font-medium text-[var(--secondary)]">{suburb}</span>
  )
}
{
  suburb && postcode && <span className="text-[var(--gray-300)]">|</span>
}
{
  postcode && (
    <span className="font-medium text-[var(--secondary)]">{postcode}</span>
  )
}
```

### 5. Phone Display with Color Differentiation

```jsx
{
  allPhones.map((phone, idx) => {
    const isPrimary = idx === 0
    return (
      <a
        className={
          isPrimary
            ? 'text-[var(--secondary)] hover:text-[var(--secondary-hover)]'
            : 'text-[var(--gray-600)] hover:text-[var(--gray-800)]'
        }
      >
        <PhoneIcon />
        <span className="font-mono">{formatPhone(phone)}</span>
      </a>
    )
  })
}
```

---

## Key Decisions Summary

1. **Removed "Unknown" placeholders** - No value, adds noise
2. **Added email validation** - Bad data exists (numbers as emails)
3. **Restored color field** - User feedback, moved to animal section
4. **Primary phone in teal, others grey** - Visual hierarchy
5. **Full address display** - Street | Suburb | Postcode format
6. **Consistent hover effects** - Both sections fill with `--primary-light`
7. **Responsive breakpoint at `md`** - Horizontal on desktop, vertical on mobile
8. **Font-mono for phones** - Better number readability

---

## Files Modified

- `src/components/AnimalCard.tsx` - Main card component with all changes

---

## Application to List View (Implemented 2025-12-02)

The list view has been redesigned as a **compact single-line layout** for maximum information density:

### Layout Structure

**Two clickable columns**: `Animal (2fr) | Customer & Contact (3fr)`

### Animal Column (Click → Animal Details)

Single line format: `Avatar NAME Breed  color: XXX  cost: $XX  Last Visit: XXX YY`

| Element   | Styling                       | Example                |
| --------- | ----------------------------- | ---------------------- |
| Avatar    | Small (sm), breed-specific    | 🐕                     |
| NAME      | Bold black                    | **Phoebe**             |
| Breed     | Primary orange, medium        | **Cavoodle**           |
| Color     | Gray, labeled format          | color: Red             |
| Cost      | Primary orange, bold, labeled | **cost: $50**          |
| LastVisit | Gray, labeled format          | Last Visit: Oct 21, 14 |

**Note**: Whitespace separation between elements (no pipe characters).

### Customer & Contact Column (Click → Customer Details)

Single line format: `SURNAME, firstname | Address | SUBURB | POSTCODE | PHONE1 | email | PHONE2 | PHONE3`

| Element   | Styling                       | Example                 |
| --------- | ----------------------------- | ----------------------- |
| SURNAME   | UPPERCASE bold black          | **SMITH**               |
| firstname | Normal case gray              | , Monica                |
| Address   | Gray text, truncatable        | 10a Chapman Ave         |
| SUBURB    | UPPERCASE teal, bold          | **MC LAREN VALE**       |
| POSTCODE  | Teal, bold                    | **5171**                |
| PHONE1    | 📞 Icon, teal, click-to-call  | 📞 0448 279 115         |
| email     | ✉️ Icon, gray, click-to-email | ✉️ mpsmith@senet.com.au |
| PHONE2/3  | 📞 Icon, gray, click-to-call  | 📞 0412 683 714         |

All elements separated by light gray `|` pipe characters.

### Shared Helper Functions

```typescript
// Same phone formatting from AnimalCard
function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10)
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
  if (digits.length === 8) return `${digits.slice(0, 4)} ${digits.slice(4)}`
  return phone
}

// Same phone validation from AnimalCard
function isValidPhone(phone: string | null | undefined): phone is string {
  if (!phone) return false
  const trimmed = phone.trim().toLowerCase()
  return trimmed !== '' && trimmed !== 'unknown' && trimmed !== '0'
}
```

### Interactive States

**Alternating Rows**:

- Even rows: `bg-white`
- Odd rows: `bg-gray-100` (improved contrast from initial `bg-gray-50/30`)

**Hover Effects** (Unified color, separate click areas):

- **Both columns**: `hover:bg-[var(--primary-light)]` (orange/coral)
- **Animal column**:
  - Extends to full row height using negative margins: `-ml-4 -my-3 pl-4 py-3 md:-ml-6 md:pl-6`
  - Click navigates to animal details page
- **Customer column**:
  - Extends to full row height using negative margins: `-mr-4 -my-3 pr-4 py-3 md:-mr-6 md:pr-6`
  - Click navigates to customer details page

### Card vs List Comparison

| Aspect       | Card View                         | List View (New)                  |
| ------------ | --------------------------------- | -------------------------------- |
| Layout       | Horizontal 2-section split        | Single-line compact              |
| Density      | Spacious, 2-4 lines per card      | Maximum, 1 line per row          |
| Size         | Larger text (md:text-2xl)         | Compact text (text-sm)           |
| Phones       | Up to 3 phones vertically         | All 3 phones horizontally        |
| Email        | Below phones                      | Inline with phones               |
| Avatar       | Medium (md)                       | Small (sm)                       |
| Last Visit   | In animal section subtitle        | In animal section inline         |
| Cost         | Not shown                         | In animal section inline         |
| Animation    | 0.05s stagger                     | 0.03s stagger                    |
| Navigation   | Both sections hover independently | Separate column click areas      |
| Hover Colors | Both use primary-light            | Both use primary-light (unified) |
| Row Contrast | N/A                               | White/gray-100 alternating       |

### Files Modified

- `src/components/ResultsView.tsx` - Compact single-line list view
- `src/components/AnimalCard.tsx` - Card view (reference implementation)
