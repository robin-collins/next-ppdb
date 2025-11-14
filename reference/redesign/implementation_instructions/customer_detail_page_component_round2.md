# Customer Detail Page - Gap Analysis Round 2

**Document Version:** 2.0
**Date:** 2025-11-14
**Status:** Gap Analysis
**Reference Mockup:** `reference/redesign/customer-record-modern.html`
**Current Implementation:** `src/app/customer/[id]/page.tsx`

---

## Executive Summary

The current customer detail page implementation is a **minimal viable product** that displays basic customer information in a single-column layout. The mockup design represents a **complete modern application** with sophisticated UI patterns, comprehensive data display, and rich interactivity.

**Overall Completion:** ~5% of target design implemented

**Critical Gaps:**

- Missing persistent header with breadcrumb navigation
- No two-column grid layout (main content + sidebar)
- Missing customer header section with avatar, status badges, and meta grid
- No card-based component structure with glassmorphic styling
- Missing all sidebar functionality (contact details, statistics, quick actions)
- Animal display is plain text instead of rich interactive cards
- No form-based customer information editing
- Missing all icons and visual indicators
- No animations or transitions

---

## Visual Comparison

### Current Implementation

```
┌─────────────────────────────────────────────┐
│ [App Header - Existing]                     │
│ Search bar, nav, date/time                  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │ [A]  Adams                            │ │
│  │      Phone: 0428238623  Animals: 1   │ │
│  │      [Edit Customer] [View Animals]   │ │
│  │                                        │ │
│  │ Contact Information                    │ │
│  │ Email: -7655                          │ │
│  │ Phone 1: 0428238623                   │ │
│  │ Phone 2: Not provided                 │ │
│  │                                        │ │
│  │ Address                                │ │
│  │ Street Address: Not provided          │ │
│  │ Suburb: Not provided                  │ │
│  │                                        │ │
│  │ Animals (1)                            │ │
│  │ Tibby - Maltese - Female              │ │
│  └───────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

**Characteristics:**

- Single white card centered on gradient background
- Simple letter avatar (small, basic)
- Inline text display for all information
- No visual hierarchy or card structure
- Plain button styling
- Minimal spacing and padding

---

### Target Mockup Design

```
┌─────────────────────────────────────────────────────────────────┐
│ [☰] Pampered Pooch  Dashboard › Customers › James    [Date]    │
│     Professional    (breadcrumb navigation)                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌────┐  James              [LEGACY CUSTOMER]                  │
│  │    │  ────────────────────────────────────                  │
│  │ J  │  Customer Since: 2015    Primary Phone: 0428111261    │
│  │    │  Animals: 1 Pet          Last Visit: Sep 10, 2021     │
│  └────┘  [Edit Customer] [Add Animal] [Full History]          │
│  120px                                                          │
│                                                                 │
│  ┌────────────────────────────┐  ┌─────────────────────────┐  │
│  │ [👤] Customer Information  │  │ [📞] Contact Details    │  │
│  │      [Edit]                │  │      [Edit]             │  │
│  ├────────────────────────────┤  ├─────────────────────────┤  │
│  │ First Name  │  Surname     │  │ 📞 0428111261    [Call] │  │
│  │ Address (full width)       │  │ 📞 No secondary phone   │  │
│  │ Suburb      │  Postcode    │  │ 📍 No address provided  │  │
│  │ Phone 1     │  Phone 2     │  │ ✉️  No email provided   │  │
│  │ Phone 3     │  Email       │  └─────────────────────────┘  │
│  └────────────────────────────┘                                │
│                                   ┌─────────────────────────┐  │
│  ┌────────────────────────────┐  │ [📊] Customer Statistics│  │
│  │ [🐾] Associated Animals (1)│  ├─────────────────────────┤  │
│  │      [Add Animal]          │  │  10+    │    1          │  │
│  ├────────────────────────────┤  │  Years  │  Animals      │  │
│  │ ┌──────────────────────┐   │  │  ──────────────────────│  │
│  │ │ [C] Cody          [×]│   │  │  15+    │   $850+       │  │
│  │ │ Jack Russell LC      │   │  │  Visits │   Spent       │  │
│  │ ├──────────────────────┤   │  └─────────────────────────┘  │
│  │ │ Color: White & gold  │   │                                │
│  │ │ Sex: Male            │   │  ┌─────────────────────────┐  │
│  │ │ Last Visit: Sep 10   │   │  │ [⭐] Quick Actions      │  │
│  │ │ Service Cost: $60    │   │  ├─────────────────────────┤  │
│  │ └──────────────────────┘   │  │ [Update Record]         │  │
│  └────────────────────────────┘  │ [Add New Animal]        │  │
│                                   │ [View All Animals]      │  │
│                                   │ [Customer History]      │  │
│                                   │ [Delete Customer]       │  │
│                                   └─────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Characteristics:**

- Persistent sticky header with breadcrumbs
- Large 120px gradient avatar
- Status badge (Active/Legacy Customer)
- Four-column meta grid with key metrics
- Two-column layout (main content + 400px sidebar)
- Multiple card components with headers, icons, and actions
- Form-based customer information display
- Rich animal cards with avatars and detailed info
- Sidebar with three separate cards (contact, stats, actions)
- Glassmorphic effects and shadows throughout
- Color-coded action buttons
- Icons for visual clarity

---

## Detailed Gap Analysis

### 1. Page Layout Structure

#### Current State

- Single-column layout
- One card containing all content
- No layout grid system

#### Target State

```css
.content-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
```

#### Gap

- **Missing:** Two-column grid container
- **Missing:** Sidebar column (400px fixed width)
- **Missing:** Main column (flexible 1fr)
- **Missing:** Responsive collapse at 768px breakpoint

#### Resolution Steps

1. Wrap content in `.content-grid` container
2. Create `.main-column` and `.sidebar-column` divs
3. Implement grid with `grid-template-columns: 1fr 400px`
4. Add media query for mobile single-column layout

---

### 2. Persistent Header with Breadcrumbs

#### Current State

- Existing global `Header.tsx` component present
- No breadcrumb navigation visible on customer page

#### Target State

```html
<div class="breadcrumb">
  <a href="#" class="breadcrumb-link">Dashboard</a>
  <span class="breadcrumb-separator">›</span>
  <a href="#" class="breadcrumb-link">Customers</a>
  <span class="breadcrumb-separator">›</span>
  <span class="breadcrumb-current">James</span>
</div>
```

#### Gap

- **Missing:** Breadcrumb component or props support in Header
- **Missing:** Dynamic customer name in breadcrumb trail
- **Missing:** Clickable navigation path

#### Resolution Steps

1. Extend `Header.tsx` to accept `breadcrumbs` prop
2. Create `Breadcrumb` component or inline in Header
3. Pass customer name from page to Header
4. Implement breadcrumb styling per mockup (lines 314-342)

---

### 3. Customer Header Section

#### Current State

```html
<div>
  <div style="letter A avatar">A</div>
  <h1>Adams</h1>
  <p>Phone: 0428238623 Animals: 1</p>
  <button>Edit Customer</button>
  <button>View Animals</button>
</div>
```

**Issues:**

- Small basic avatar (not 120px gradient version)
- No status badge
- Inline text instead of structured meta grid
- Only 2 action buttons (need 3)
- No visual hierarchy or spacing

#### Target State

```html
<div class="customer-header">
  <!-- 120px gradient avatar -->
  <div class="customer-avatar-large">J</div>

  <div class="customer-info">
    <!-- Title row -->
    <div class="customer-title">
      <h1 class="customer-name">James</h1>
      <span class="status-badge status-legacy">Legacy Customer</span>
    </div>

    <!-- Meta grid (4 items) -->
    <div class="customer-meta">
      <div class="meta-item">
        <span class="meta-label">Customer Since</span>
        <span class="meta-value">2015</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Primary Phone</span>
        <span class="meta-value">0428111261</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Animals</span>
        <span class="meta-value">1 Pet</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Last Visit</span>
        <span class="meta-value">Sep 10, 2021</span>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="customer-actions">
      <button class="btn btn-primary">Edit Customer</button>
      <button class="btn btn-success">Add Animal</button>
      <button class="btn btn-secondary">Full History</button>
    </div>
  </div>
</div>
```

#### Gap

- **Missing:** Large 120px avatar with gradient background
- **Missing:** Status badge component (Active/Legacy logic)
- **Missing:** Meta grid with 4 responsive columns
- **Missing:** "Add Animal" button (only have 2 of 3 buttons)
- **Missing:** "Full History" button
- **Missing:** Proper spacing and border-bottom separator
- **Missing:** SVG icons in buttons

#### Resolution Steps

1. Create `CustomerHeader.tsx` component
2. Implement large avatar (120px, gradient background, line 387-400)
3. Add status badge logic:
   ```typescript
   const isLegacy = currentYear - customerSinceYear >= 5
   const badgeClass = isLegacy ? 'status-legacy' : 'status-active'
   ```
4. Build meta grid with 4 items using CSS Grid
5. Calculate meta values:
   - Customer Since: `customer.createdAt?.getFullYear()` or earliest visit
   - Primary Phone: `customer.phone1`
   - Animals: `customer._count.animals`
   - Last Visit: `Math.max(...animals.map(a => a.lastvisit))`
6. Add third action button "Full History"
7. Add icons to all buttons (SVG from mockup)
8. Style with proper spacing (mockup lines 377-470)

---

### 4. Customer Information Card (Main Column)

#### Current State

```html
<div>
  <h2>Contact Information</h2>
  <p>Email: -7655</p>
  <p>Phone 1: 0428238623</p>
  <p>Phone 2: Not provided</p>

  <h2>Address</h2>
  <p>Street Address: Not provided</p>
  <p>Suburb: Not provided</p>
</div>
```

**Issues:**

- Plain text display, not form fields
- No card container
- No card header with icon and Edit button
- Not organized in 2-column grid
- Missing Phone 3 and Email fields
- No empty state styling

#### Target State

```html
<div class="card">
  <div class="card-header">
    <h2 class="card-title">
      <svg class="card-icon">...</svg>
      Customer Information
    </h2>
    <button class="btn btn-secondary btn-small">
      <svg>...</svg>
      Edit
    </button>
  </div>

  <div class="card-content">
    <div class="form-grid">
      <div class="form-group">
        <label class="form-label">First Name</label>
        <input
          class="form-input empty-state"
          readonly
          placeholder="Not provided"
        />
      </div>
      <div class="form-group">
        <label class="form-label">Surname</label>
        <input class="form-input" readonly value="James" />
      </div>
      <div class="form-group full-width">
        <label class="form-label">Address</label>
        <textarea
          class="form-textarea empty-state"
          readonly
          placeholder="No address provided"
        ></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Suburb</label>
        <input
          class="form-input empty-state"
          readonly
          placeholder="Not provided"
        />
      </div>
      <div class="form-group">
        <label class="form-label">Postcode</label>
        <input
          class="form-input empty-state"
          readonly
          placeholder="Not provided"
        />
      </div>
      <div class="form-group">
        <label class="form-label">Phone 1</label>
        <input class="form-input" readonly value="0428111261" />
      </div>
      <div class="form-group">
        <label class="form-label">Phone 2</label>
        <input
          class="form-input empty-state"
          readonly
          placeholder="Not provided"
        />
      </div>
      <div class="form-group">
        <label class="form-label">Phone 3</label>
        <input
          class="form-input empty-state"
          readonly
          placeholder="Not provided"
        />
      </div>
      <div class="form-group full-width">
        <label class="form-label">Email</label>
        <input
          type="email"
          class="form-input empty-state"
          readonly
          placeholder="No email provided"
        />
      </div>
    </div>
  </div>
</div>
```

#### Gap

- **Missing:** Card container with header and content sections
- **Missing:** User icon in card title
- **Missing:** Edit button in card header
- **Missing:** Form grid (2-column layout)
- **Missing:** Form groups with labels
- **Missing:** Input fields (currently just text)
- **Missing:** Empty state styling (italic, gray placeholder)
- **Missing:** Full-width class for Address and Email
- **Missing:** Readonly attribute on inputs (edit mode toggle)
- **Missing:** Border, shadow, and border-radius styling
- **Missing:** Focus states for inputs

#### Resolution Steps

1. Create `CustomerInfoCard.tsx` component
2. Wrap in `.card` container with `.card-header` and `.card-content`
3. Add user icon SVG to title (mockup line 1161-1163)
4. Add Edit button with pencil icon (lines 1167-1182)
5. Implement `.form-grid` with 2-column layout (lines 535-539)
6. Create 9 form groups (forename, surname, address1, suburb, postcode, phone1, phone2, phone3, email)
7. Apply `.full-width` class to address and email (line 547-549)
8. Add empty state styling:
   ```css
   .empty-state {
     color: var(--gray-500);
     font-style: italic;
   }
   ```
9. Implement edit mode toggle:
   - Default: `readonly` attribute on all inputs
   - Edit mode: Remove `readonly`, show Save/Cancel buttons
10. Style inputs with border, padding, focus states (lines 557-580)

---

### 5. Associated Animals Card (Main Column)

#### Current State

```html
<div>
  <h2>Animals (1)</h2>
  <div>
    <h3>Tibby</h3>
    <p>Maltese</p>
    <p>Female</p>
  </div>
</div>
```

**Issues:**

- Plain text list, no card structure
- No animal detail cards
- Missing animal avatar
- Missing color, last visit, and service cost
- No delete button
- Not clickable
- No grid layout for multiple animals

#### Target State

```html
<div class="card">
  <div class="card-header">
    <h2 class="card-title">
      <svg class="card-icon">...</svg>
      Associated Animals (1)
    </h2>
    <button class="btn btn-success btn-small">
      <svg>...</svg>
      Add Animal
    </button>
  </div>

  <div class="card-content">
    <div class="animals-grid">
      <div class="animal-card" onclick="viewAnimal(1)">
        <div class="animal-card-header">
          <div class="animal-info">
            <div class="animal-avatar">C</div>
            <div class="animal-details">
              <h4>Cody</h4>
              <p>Jack Russell Long Coat</p>
            </div>
          </div>
          <button class="btn btn-danger btn-small" onclick="deleteAnimal(1)">
            <svg>...</svg>
          </button>
        </div>

        <div class="animal-card-content">
          <div class="info-item">
            <span class="info-label">Color</span>
            <span class="info-value">White and gold</span>
          </div>
          <div class="info-item">
            <span class="info-label">Sex</span>
            <span class="info-value">Male</span>
          </div>
          <div class="info-item">
            <span class="info-label">Last Visit</span>
            <span class="info-value">Sep 10, 2021</span>
          </div>
          <div class="info-item">
            <span class="info-label">Service Cost</span>
            <span class="info-value">$60</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

#### Gap

- **Missing:** Card container with header
- **Missing:** Paw icon in card title
- **Missing:** "Add Animal" button in header
- **Missing:** Animals grid container
- **Missing:** Individual animal cards
- **Missing:** Animal avatars (40px circular, gradient)
- **Missing:** Gradient top border on animal cards (3px)
- **Missing:** Delete button (danger/red, top-right)
- **Missing:** Info grid (2x2 layout for color, sex, last visit, cost)
- **Missing:** Click handler to view animal detail
- **Missing:** Hover effects (translateY, shadow)
- **Missing:** Service cost data (need to fetch from visits/notes)

#### Resolution Steps

1. Create `AssociatedAnimalsCard.tsx` component
2. Create `AnimalDetailCard.tsx` component
3. Wrap in `.card` with header containing paw icon and "Add Animal" button
4. Implement `.animals-grid`:
   ```css
   .animals-grid {
     display: grid;
     grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
     gap: 1rem;
   }
   ```
5. For each animal, create `.animal-card` with:
   - Gradient top border (::before pseudo-element, lines 604-613)
   - Animal avatar (40px, circular, gradient background, lines 634-649)
   - Animal name and breed
   - Delete button (top-right, danger styling)
   - 2x2 info grid for color, sex, last visit, cost
6. Add hover effect:
   ```css
   .animal-card:hover {
     transform: translateY(-2px);
     box-shadow: var(--shadow-md);
     border-color: var(--primary);
   }
   ```
7. Add click handler to navigate to animal detail page
8. Style info items with uppercase labels and values (lines 671-688)
9. Fetch service cost from latest visit/note

---

### 6. Contact Details Card (Sidebar)

#### Current State

**Missing entirely** - no sidebar implementation

#### Target State

```html
<div class="card">
  <div class="card-header">
    <h2 class="card-title">
      <svg class="card-icon">...</svg>
      Contact Details
    </h2>
    <button class="btn btn-secondary btn-small">
      <svg>...</svg>
      Edit
    </button>
  </div>

  <div class="card-content">
    <ul class="contact-list">
      <li class="contact-item">
        <svg class="contact-icon">📞</svg>
        <span class="contact-text">0428111261</span>
        <a href="tel:0428111261" class="contact-action">Call</a>
      </li>
      <li class="contact-item">
        <svg class="contact-icon">📞</svg>
        <span class="contact-text">No secondary phone</span>
        <span class="contact-action">Add</span>
      </li>
      <li class="contact-item">
        <svg class="contact-icon">📍</svg>
        <span class="contact-text">No address provided</span>
        <span class="contact-action">Add</span>
      </li>
      <li class="contact-item">
        <svg class="contact-icon">✉️</svg>
        <span class="contact-text">No email provided</span>
        <span class="contact-action">Add</span>
      </li>
    </ul>
  </div>
</div>
```

#### Gap

- **Missing:** Entire sidebar column
- **Missing:** Contact Details card component
- **Missing:** Phone icon in card title
- **Missing:** Contact list with 4 items
- **Missing:** Icons for each contact method
- **Missing:** Hover-to-reveal action links
- **Missing:** Click-to-call functionality
- **Missing:** Empty state indicators

#### Resolution Steps

1. Create `ContactDetailsCard.tsx` component
2. Place in sidebar column
3. Add phone icon to card title (lines 1365-1372)
4. Create `.contact-list` with 4 items (lines 790-833):
   - Primary phone (with "Call" link)
   - Secondary phone (empty state with "Add")
   - Address (empty state with "Add")
   - Email (empty state with "Add")
5. Add icons to each item (16px SVG)
6. Implement hover-to-reveal action:
   ```css
   .contact-action {
     opacity: 0;
     transition: opacity 0.2s ease;
   }
   .contact-item:hover .contact-action {
     opacity: 1;
   }
   ```
7. Add `tel:` and `mailto:` links for populated fields
8. Style empty states (gray, italic)

---

### 7. Customer Statistics Card (Sidebar)

#### Current State

**Missing entirely** - no statistics anywhere

#### Target State

```html
<div class="card">
  <div class="card-header">
    <h2 class="card-title">
      <svg class="card-icon">📊</svg>
      Customer Statistics
    </h2>
  </div>

  <div class="card-content">
    <div class="quick-stats">
      <div class="stat-item">
        <span class="stat-number">10+</span>
        <span class="stat-label">Years Active</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">1</span>
        <span class="stat-label">Animals</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">15+</span>
        <span class="stat-label">Total Visits</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">$850+</span>
        <span class="stat-label">Total Spent</span>
      </div>
    </div>
  </div>
</div>
```

#### Gap

- **Missing:** Entire statistics card
- **Missing:** Chart icon in card title
- **Missing:** 2x2 grid of stat items
- **Missing:** Data calculations for all 4 metrics
- **Missing:** Large number styling (1.5rem, 800 weight, primary color)
- **Missing:** Uppercase label styling

#### Resolution Steps

1. Create `CustomerStatsCard.tsx` component
2. Place in sidebar column below Contact Details
3. Add chart icon to card title (lines 1460-1468)
4. Implement `.quick-stats` grid:
   ```css
   .quick-stats {
     display: grid;
     grid-template-columns: repeat(2, 1fr);
     gap: 1rem;
   }
   ```
5. Create 4 stat items with proper styling (lines 760-787)
6. Calculate statistics:
   ```typescript
   const yearsActive = currentYear - customer.createdAt.getFullYear()
   const totalAnimals = customer._count.animals
   const totalVisits = customer.animals.reduce(
     (sum, a) => sum + (a._count?.visits || 0),
     0
   )
   const totalSpent = customer.animals.reduce(
     (sum, a) => sum + a.visits.reduce((s, v) => s + (v.cost || 0), 0),
     0
   )
   ```
7. Format numbers with "+" suffix for estimates
8. Style stat numbers (large, bold, primary color)
9. Style stat labels (small, uppercase, gray)

---

### 8. Quick Actions Card (Sidebar)

#### Current State

**Missing entirely** - actions are in main header only

#### Target State

```html
<div class="card">
  <div class="card-header">
    <h2 class="card-title">
      <svg class="card-icon">⭐</svg>
      Quick Actions
    </h2>
  </div>

  <div class="card-content">
    <div class="action-buttons">
      <button class="btn btn-primary">
        <svg>...</svg>
        Update Record
      </button>
      <button class="btn btn-success">
        <svg>...</svg>
        Add New Animal
      </button>
      <button class="btn btn-secondary">
        <svg>...</svg>
        View All Animals
      </button>
      <button class="btn btn-warning">
        <svg>...</svg>
        Customer History
      </button>
      <button class="btn btn-danger">
        <svg>...</svg>
        Delete Customer
      </button>
    </div>
  </div>
</div>
```

#### Gap

- **Missing:** Entire quick actions card
- **Missing:** Star icon in card title
- **Missing:** 5 action buttons in vertical stack
- **Missing:** Color-coded button styling (primary, success, secondary, warning, danger)
- **Missing:** Icons in each button
- **Missing:** Delete customer functionality

#### Resolution Steps

1. Create `QuickActionsCard.tsx` component
2. Place in sidebar column below Statistics
3. Add star icon to card title (lines 1498-1506)
4. Create vertical button stack:
   ```css
   .action-buttons {
     display: flex;
     flex-direction: column;
     gap: 0.75rem;
   }
   .action-buttons .btn {
     width: 100%;
   }
   ```
5. Add 5 buttons with appropriate styling:
   - Update Record (primary blue)
   - Add New Animal (success green)
   - View All Animals (secondary gray)
   - Customer History (warning orange)
   - Delete Customer (danger red)
6. Add icons to each button (16px SVG)
7. Implement click handlers for each action
8. Add confirmation dialog for delete action

---

### 9. Visual Design System

#### Current State

- Basic white card
- No shadows or depth
- Minimal border styling
- No glassmorphic effects
- Plain buttons
- No icons

#### Target State

- Glassmorphic cards with backdrop blur
- Multiple shadow levels
- Border radius system
- Gradient backgrounds on avatars
- Color-coded buttons
- SVG icons throughout

#### Gap - Colors

```css
/* Missing variables */
--primary: #6366f1 --primary-hover: #4f46e5 --primary-light: #e0e7ff
  --secondary: #06b6d4 --success: #10b981 --warning: #f59e0b --error: #ef4444
  --gray-50 through --gray-900;
```

#### Gap - Shadows

```css
/* Missing shadow system */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05) --shadow-md: 0 4px 6px -1px
  rgb(0 0 0 / 0.1) --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1) --shadow-xl: 0
  20px 25px -5px rgb(0 0 0 / 0.1);
```

#### Gap - Border Radius

```css
/* Missing radius scale */
--radius-sm: 0.375rem --radius-md: 0.5rem --radius-lg: 0.75rem --radius-xl: 1rem
  --radius-2xl: 1.5rem --radius-full: 9999px;
```

#### Gap - Typography

```css
/* Missing font weights and sizes */
h1 {
  font-size: 2.5rem;
  font-weight: 800;
}
h2 {
  font-size: 1.125rem;
  font-weight: 700;
}
.meta-label {
  font-size: 0.75rem;
  text-transform: uppercase;
}
.info-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

#### Resolution Steps

1. Ensure all CSS custom properties from mockup are in `globals.css`
2. Apply `.card` styling with:
   - Background: white
   - Border: 1px solid var(--gray-200)
   - Border-radius: var(--radius-xl)
   - Box-shadow: var(--shadow-sm)
   - Hover shadow: var(--shadow-md)
3. Style `.card-header`:
   - Background: var(--gray-50)
   - Border-bottom: 1px solid var(--gray-200)
   - Padding: var(--space-5) var(--space-6)
4. Implement button color classes:
   - `.btn-primary`: blue
   - `.btn-success`: green
   - `.btn-secondary`: gray
   - `.btn-warning`: orange
   - `.btn-danger`: red
5. Add hover effects (translateY, enhanced shadow)

---

### 10. Animations and Interactions

#### Current State

- No animations
- No transitions
- Static layout

#### Target State

```css
/* Card entrance animations */
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

.card:nth-child(2) {
  animation-delay: 0.1s;
}
.card:nth-child(3) {
  animation-delay: 0.2s;
}
.card:nth-child(4) {
  animation-delay: 0.3s;
}

/* Hover effects */
.animal-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary);
}

.btn:hover {
  transform: translateY(-1px);
}

.contact-action {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.contact-item:hover .contact-action {
  opacity: 1;
}
```

#### Gap

- **Missing:** slideInUp keyframe animation
- **Missing:** Staggered card entrance delays
- **Missing:** Animal card hover effects
- **Missing:** Button hover transformations
- **Missing:** Contact action hover-to-reveal
- **Missing:** Smooth transitions on all interactive elements

#### Resolution Steps

1. Add slideInUp keyframe to globals.css (lines 896-905)
2. Apply animation to all cards with staggered delays
3. Add hover transforms to animal cards
4. Add hover effects to buttons (translateY + shadow)
5. Implement hover-to-reveal for contact actions
6. Add transitions to all interactive elements

---

### 11. Data Requirements

#### Current Data

```typescript
{
  id: number
  surname: string
  phone1: string
  _count: {
    animals: number
  }
  animals: Array<{
    animalname: string
    breed: { breedname: string }
    SEX: 'Male' | 'Female'
  }>
}
```

#### Required Data

```typescript
{
  id: number
  surname: string
  forename?: string
  address1?: string
  suburb?: string
  postcode?: number
  phone1: string
  phone2?: string
  phone3?: string
  email?: string
  createdAt?: Date

  animals: Array<{
    id: number
    animalname: string
    colour: string
    SEX: 'Male' | 'Female'
    lastvisit?: Date
    breed: {
      breedname: string
    }
    visits?: Array<{
      cost?: number
      date?: Date
    }>
  }>

  _count: {
    animals: number
  }
}
```

#### Gap

- **Missing:** forename, address1, suburb, postcode
- **Missing:** phone2, phone3, email
- **Missing:** createdAt (for "Customer Since")
- **Missing:** animal.colour
- **Missing:** animal.lastvisit
- **Missing:** animal.visits (for service cost)
- **Missing:** visit history (for total visits and total spent)

#### Resolution Steps

1. Update API route `/api/customers/[id]/route.ts` to include all fields
2. Add Prisma include for visits:
   ```typescript
   include: {
     animals: {
       include: {
         breed: true,
         visits: {
           orderBy: { date: 'desc' },
           take: 1 // for last visit
         }
       }
     }
   }
   ```
3. Calculate derived values:
   - Customer Since: `customer.createdAt?.getFullYear()`
   - Last Visit: `Math.max(...animals.map(a => a.lastvisit))`
   - Total Visits: Sum of all visit counts
   - Total Spent: Sum of all visit costs
   - Service Cost: `animal.visits[0]?.cost`

---

### 12. Responsive Behavior

#### Current State

- Single column layout (naturally responsive)
- No specific breakpoints

#### Target State

```css
/* Mobile: < 768px */
@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .customer-header {
    flex-direction: column;
    text-align: center;
  }

  .customer-name {
    font-size: 2rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .quick-stats {
    grid-template-columns: 1fr;
  }
}
```

#### Gap

- **Missing:** Two-column to single-column collapse
- **Missing:** Customer header column to centered layout
- **Missing:** Form grid single column
- **Missing:** Stats grid single column
- **Missing:** Reduced font sizes for mobile

#### Resolution Steps

1. Add media query at 768px breakpoint
2. Collapse content grid to single column
3. Center customer header content
4. Reduce customer name font size on mobile
5. Collapse form grid to single column
6. Collapse stats grid to single column
7. Test on mobile devices

---

## Implementation Priority

### Phase 1: Foundation (Critical)

1. **Two-column layout structure**
   - Create content grid container
   - Add main column and sidebar column
   - Implement responsive collapse

2. **Customer header section**
   - Large 120px avatar with gradient
   - Status badge with logic
   - Meta grid with 4 items
   - Three action buttons with icons

3. **Card base component**
   - Card container styling
   - Card header with icon and title
   - Card content area
   - Hover effects and shadows

### Phase 2: Main Content (High Priority)

4. **Customer Information Card**
   - Form grid layout (2 columns)
   - 9 form fields with labels
   - Empty state styling
   - Edit mode toggle

5. **Associated Animals Card**
   - Animals grid container
   - Individual animal detail cards
   - Animal avatars
   - Info grid (color, sex, last visit, cost)
   - Delete button and click handlers

### Phase 3: Sidebar (High Priority)

6. **Contact Details Card**
   - Contact list with 4 items
   - Icons for each contact method
   - Hover-to-reveal actions
   - Click-to-call/email links

7. **Customer Statistics Card**
   - 2x2 stat grid
   - Calculate 4 metrics
   - Large number styling
   - Uppercase label styling

8. **Quick Actions Card**
   - Vertical button stack
   - 5 color-coded buttons
   - Icons for each action
   - Click handlers and confirmations

### Phase 4: Polish (Medium Priority)

9. **Visual design system**
   - Apply all CSS custom properties
   - Implement shadow system
   - Add gradient backgrounds
   - Style all buttons properly

10. **Animations**
    - Card entrance animations
    - Hover effects
    - Transitions
    - Hover-to-reveal interactions

### Phase 5: Data & Functionality (Medium Priority)

11. **Data fetching**
    - Update API endpoint
    - Fetch all required fields
    - Calculate derived values
    - Handle empty states

12. **Interactions**
    - Edit mode for customer info
    - Delete confirmations
    - Navigation to animal detail
    - Click-to-call/email

### Phase 6: Final Touches (Low Priority)

13. **Breadcrumbs**
    - Extend Header component
    - Pass customer name
    - Implement navigation

14. **Responsive refinement**
    - Test all breakpoints
    - Fine-tune mobile layout
    - Adjust font sizes

---

## Component File Checklist

### New Files to Create

- [ ] `src/components/customer/CustomerHeader.tsx`
- [ ] `src/components/customer/CustomerInfoCard.tsx`
- [ ] `src/components/customer/AssociatedAnimalsCard.tsx`
- [ ] `src/components/customer/AnimalDetailCard.tsx`
- [ ] `src/components/customer/ContactDetailsCard.tsx`
- [ ] `src/components/customer/CustomerStatsCard.tsx`
- [ ] `src/components/customer/QuickActionsCard.tsx`

### Files to Update

- [ ] `src/app/customer/[id]/page.tsx` - Complete refactor
- [ ] `src/components/Header.tsx` - Add breadcrumb support
- [ ] `src/app/globals.css` - Ensure all CSS variables present
- [ ] `src/app/api/customers/[id]/route.ts` - Expand data fetching
- [ ] `src/store/customersStore.ts` - Add new actions

---

## Success Criteria

### Visual Fidelity

- [ ] Two-column layout matches mockup exactly
- [ ] Customer header displays all 4 meta items
- [ ] Status badge shows correct Active/Legacy state
- [ ] All 3 customer action buttons present
- [ ] Customer info card uses 2-column form grid
- [ ] Animal cards show all 4 info items (color, sex, visit, cost)
- [ ] Sidebar contains all 3 cards (contact, stats, actions)
- [ ] All icons match mockup design
- [ ] Color-coded buttons match mockup

### Functionality

- [ ] Edit button enables form editing
- [ ] Delete animal shows confirmation
- [ ] Click animal card navigates to detail
- [ ] Contact actions work (call, email)
- [ ] All quick actions have handlers
- [ ] Statistics calculate correctly
- [ ] Breadcrumbs navigate properly
- [ ] Responsive layout works on mobile

### Design System

- [ ] All CSS custom properties defined
- [ ] Shadows applied correctly
- [ ] Border radius consistent throughout
- [ ] Typography hierarchy correct
- [ ] Spacing scale followed
- [ ] Color palette applied correctly

### Performance

- [ ] Cards animate in with stagger
- [ ] Hover effects smooth (60fps)
- [ ] No layout shifts on load
- [ ] Images/avatars load efficiently

---

## Conclusion

The current customer detail page is at approximately **5% completion** compared to the target mockup. The implementation requires:

1. **Complete layout restructure** - Two-column grid with sidebar
2. **7 new components** - Customer header, 4 cards in main, 3 cards in sidebar
3. **Comprehensive styling** - Design system, shadows, animations
4. **Enhanced data fetching** - Additional fields, relations, calculations
5. **Rich interactivity** - Edit modes, confirmations, click handlers

The mockup provides a complete specification with all styling (lines 12-931) and structure (lines 933-1591) clearly defined. Implementation should follow the phased approach outlined above, prioritizing the two-column layout and customer header before building out the individual card components.

**Next Steps:**

1. Create component directory structure
2. Implement two-column layout in page.tsx
3. Build CustomerHeader component
4. Implement card-based components one by one
5. Add data fetching and calculations
6. Polish with animations and interactions
7. Test responsive behavior

---

**Document End**
