# Pampered Pooch Database - UI Style Guide

**Version:** 2.0 (Option B: "Soft Luxury" Rebrand)
**Last Updated:** 2025-11-15
**Purpose:** Definitive design system and implementation guidelines for creating a warm, playful, premium pet care experience

---

## 🎨 Design Vision

### Brand Identity: "Premium Pet Spa Meets Playful Excellence"

The Pampered Pooch is not just a grooming database—it's a celebration of the joy, care, and love we have for our furry friends. Our design reflects:

- **Warmth & Care** - Like a cozy spa for beloved pets
- **Professionalism** - Trust and reliability for business operations
- **Playfulness** - Celebrating the joy pets bring to our lives
- **Premium Quality** - Reflecting the high-end grooming service experience

This design system escapes generic "tech startup" aesthetics and creates a memorable, contextually appropriate experience for a luxury pet care business.

---

## Table of Contents

1. [Brand Assets & Mascot](#brand-assets--mascot)
2. [Design Philosophy](#design-philosophy)
3. [**MANDATORY** Universal Elements](#mandatory-universal-elements)
4. [Design Tokens (Complete Reference)](#design-tokens-complete-reference)
5. [Typography System](#typography-system)
6. [Color System](#color-system)
7. [Layout System](#layout-system)
8. [Component Library](#component-library)
9. [Spacing & Sizing](#spacing--sizing)
10. [Shadows & Elevation](#shadows--elevation)
11. [Animations & Transitions](#animations--transitions)
12. [Responsive Behavior](#responsive-behavior)
13. [Glassmorphism Effects](#glassmorphism-effects)
14. [Interactive States](#interactive-states)
15. [Icons & Graphics](#icons--graphics)
16. [Forms & Inputs](#forms--inputs)
17. [Data Display Patterns](#data-display-patterns)
18. [Cartoon Dog Usage Guide](#cartoon-dog-usage-guide)
19. [Accessibility Guidelines](#accessibility-guidelines)
20. [Implementation Checklist](#implementation-checklist)

---

## Brand Assets & Mascot

### Primary Logo

**Location:** `/images/logo.png`

![Pampered Pooch Logo](/images/logo.png)

**Usage:**

- Header branding (display at 120px width on desktop, 100px on mobile)
- Marketing materials
- Loading screens
- Email signatures

**Color Extraction from Logo:**

- Golden brown dog: `#d9944a`, `#c97d3d`, `#8b5a2b`
- Teal green text: `#1b9e7e`, `#2db894`
- Light aqua bubbles: `#a8e6f0`, `#d4f4f8`
- Cream accents: `#f4d19b`, `#e8b876`

### Cartoon Dog Mascot

**Available Poses:** 7 unique poses in `/images/` folder

| Pose                       | Filename            | Emotion            | Use Case              |
| -------------------------- | ------------------- | ------------------ | --------------------- |
| Relaxed laying             | `CARTOON_DOG_1.png` | Calm, relaxed      | Empty states, waiting |
| Happy sitting (tongue out) | `CARTOON_DOG_2.png` | Joyful, friendly   | Welcome, success      |
| Excited sitting            | `CARTOON_DOG_3.png` | Eager, happy       | Confirmation, alerts  |
| Running/jumping            | `CARTOON_DOG_4.png` | Energetic, playful | Loading, processing   |
| Playful laying             | `CARTOON_DOG_5.png` | Content, resting   | Idle states           |
| Running fast               | `CARTOON_DOG_6.png` | Active, busy       | Background processes  |
| Standing happy             | `CARTOON_DOG_7.png` | Welcoming, ready   | CTAs, invitations     |

See [Cartoon Dog Usage Guide](#cartoon-dog-usage-guide) for detailed implementation patterns.

---

## Design Philosophy

### Core Principles

1. **Warm Luxury Aesthetic**
   - Soft, welcoming color palette derived from logo
   - Organic, rounded shapes (no harsh angles)
   - Gentle animations with bouncy easing
   - Generous spacing that feels premium

2. **Professional Yet Approachable**
   - Clean layouts with clear hierarchy
   - Trustworthy teal greens for business actions
   - Playful golden browns for delight moments
   - Typography that's elegant but readable

3. **Pet-Centric Design Language**
   - Cartoon dog mascot brings personality
   - Paw print patterns (subtle, tasteful)
   - Organic shapes reminiscent of bubbles (grooming theme)
   - Warm, nurturing color temperature

4. **Consistency Through Tokens**
   - All design values defined as CSS variables
   - Reusable component patterns
   - Mandatory elements on every page
   - Predictable interaction behaviors

### Design Differentiation

**What makes this NOT generic:**

- ✅ Distinctive typography (Lora + Rubik, NOT Inter or Roboto)
- ✅ Brand-authentic colors from actual logo
- ✅ Contextual mascot usage throughout
- ✅ Warm, organic aesthetic (not cold corporate)
- ✅ Playful micro-interactions
- ✅ Pet spa theme (bubbles, paws, warmth)

**What we avoid:**

- ❌ Overused tech fonts (Inter, Roboto, System UI)
- ❌ Purple-blue gradients (generic SaaS look)
- ❌ Cold, clinical layouts
- ❌ Cookie-cutter component libraries
- ❌ Predictable, boring interactions

---

## MANDATORY Universal Elements

### ⚠️ CRITICAL: Required on EVERY Page

The following elements MUST appear on every single page of the application. No exceptions.

#### 1. Header Navigation Bar

**Status:** MANDATORY - Must be included in every page layout
**Component:** `src/components/Header.tsx`

**Features:**

- Hamburger menu toggle (left side)
- Brand logo (clickable, returns to home)
- Search bar (contextual, may be read-only on some pages)
- Live date/time display (updates every second)
- Breadcrumb navigation (page-specific)

**Structure:**

```tsx
import Header from '@/components/Header'

export default function YourPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="flex min-h-screen flex-col">
      {/* MANDATORY: Header must be first */}
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        onSearch={handleSearch}
        searchValue={searchQuery}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Current Page', current: true },
        ]}
      />

      {/* Rest of page content */}
    </div>
  )
}
```

**Visual Requirements:**

- Height: `92px` (fixed, consistent across all pages)
- Background: White with `backdrop-filter: blur(20px)`
- Position: `sticky` to top, `z-index: 100`
- Border bottom: `1px solid var(--gray-200)`
- Box shadow: `var(--shadow-md)`

#### 2. Hamburger Menu Sidebar

**Status:** MANDATORY - Must be included in every page layout
**Component:** `src/components/Sidebar.tsx`

**Features:**

- Collapsible navigation menu
- Pinnable on desktop (shifts content)
- Overlay mode on mobile
- Resizable width (200px - 500px)
- 6 navigation items (Dashboard, Search, Add Customer, Breeds, Analytics, History)
- Active state highlighting
- Live date display at bottom

**Structure:**

```tsx
import Sidebar from '@/components/Sidebar'

export default function YourPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarPinned, setSidebarPinned] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <Header {...} />

      {/* MANDATORY: Sidebar must be after header */}
      <Sidebar
        isOpen={sidebarOpen}
        isPinned={sidebarPinned}
        onClose={() => setSidebarOpen(false)}
        onTogglePin={() => setSidebarPinned(!sidebarPinned)}
        currentPath="/your-page-path"
      />

      {/* Main content shifts when pinned */}
      <main className={sidebarPinned ? 'ml-[calc(var(--sidebar-width)+1.5rem)]' : ''}>
        {/* Page content */}
      </main>
    </div>
  )
}
```

**Visual Requirements:**

- Default width: `280px` (resizable)
- Background: White `rgba(255, 255, 255, 0.98)` with `backdrop-filter: blur(20px)`
- Border right: `1px solid var(--gray-200)`
- Shadow: `var(--shadow-xl)`
- Header matches main header height: `92px`

#### 3. Animated Gradient Background

**Status:** MANDATORY - Must be on body element of every page
**Location:** `src/app/globals.css`

**Implementation:**

```css
body {
  font-family: var(--font-body);
  background: linear-gradient(
    160deg,
    #fef9f5 0%,
    /* Warm cream */ #f8f2ec 25%,
    /* Peachy beige */ #f0ebe6 50%,
    /* Soft tan */ #e8f4f2 75%,
    /* Pale mint */ #f5fbfa 100% /* Light aqua */
  );
  background-size: 400% 400%;
  animation: gradientShift 20s ease infinite;
  min-height: 100vh;
  color: var(--gray-800);
  overflow-x: hidden;
}

@keyframes gradientShift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
```

**Pattern Overlay:**

```css
body::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231b9e7e' fill-opacity='0.02'%3E%3Cellipse cx='40' cy='45' rx='4' ry='5'/%3E%3Cellipse cx='30' cy='38' rx='2.5' ry='3.5'/%3E%3Cellipse cx='50' cy='38' rx='2.5' ry='3.5'/%3E%3Cellipse cx='34' cy='32' rx='2.5' ry='3.5'/%3E%3Cellipse cx='46' cy='32' rx='2.5' ry='3.5'/%3E%3C/g%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 0;
  opacity: 0.6;
}
```

_Note: The pattern overlay uses subtle paw prints in teal, matching brand identity._

---

## Design Tokens (Complete Reference)

### CSS Custom Properties

**Location:** `src/app/globals.css` (must be in `:root` selector)

```css
:root {
  /* === TYPOGRAPHY === */
  --font-display: 'Lora', Georgia, serif;
  --font-body: 'Rubik', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-accent: 'Rubik', -apple-system, sans-serif;
  --font-family: var(--font-body); /* Legacy fallback */

  /* === PRIMARY COLORS (From Logo - Golden Brown) === */
  --primary: #d9944a; /* Golden brown - main brand color */
  --primary-hover: #c97d3d; /* Darker brown on hover */
  --primary-light: #fef4e8; /* Very light peach for backgrounds */
  --primary-dark: #8b5a2b; /* Deep brown for contrast */

  /* === SECONDARY COLORS (From Logo - Teal Green) === */
  --secondary: #1b9e7e; /* Teal green - trust, nature */
  --secondary-hover: #178a6c; /* Darker teal on hover */
  --secondary-light: #e6f7f3; /* Pale mint for backgrounds */
  --secondary-dark: #0f6652; /* Deep teal for text */

  /* === ACCENT COLORS (From Logo - Light Aqua) === */
  --accent: #2db894; /* Bright teal - CTAs, highlights */
  --accent-hover: #24a382; /* Darker on hover */
  --accent-light: #d4f4f8; /* Pale aqua - subtle backgrounds */
  --accent-bubbles: #a8e6f0; /* Bubble effect color */

  /* === TERTIARY COLORS (From Logo - Cream/Tan) === */
  --cream: #f4d19b; /* Warm cream */
  --tan: #e8b876; /* Golden tan */
  --peach: #f9e5d0; /* Soft peach */

  /* === SEMANTIC COLORS === */
  --success: #2db894; /* Use accent teal for success */
  --warning: #e8b876; /* Use tan for warnings */
  --error: #d97066; /* Muted coral red */
  --info: #a8e6f0; /* Light aqua for info */

  /* === NEUTRAL COLORS (Warmer Grays) === */
  --white: #ffffff;
  --gray-50: #faf8f6; /* Warm white */
  --gray-100: #f2ebe5; /* Cream beige */
  --gray-200: #e8dfd7; /* Light tan */
  --gray-300: #d4c7bb; /* Medium tan */
  --gray-400: #a89b8f; /* Warm gray */
  --gray-500: #7d7169; /* Medium brown-gray */
  --gray-600: #5d544d; /* Dark brown-gray */
  --gray-700: #3d3935; /* Very dark brown */
  --gray-800: #2a2622; /* Almost black brown */
  --gray-900: #1a1614; /* Darkest brown */

  /* === SPACING SCALE === */
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
  --space-20: 5rem; /* 80px */
  --space-24: 6rem; /* 96px */

  /* === BORDER RADIUS (Softer, More Organic) === */
  --radius-sm: 0.5rem; /* 8px - was 6px */
  --radius-md: 0.75rem; /* 12px - was 8px */
  --radius-lg: 1rem; /* 16px - was 12px */
  --radius-xl: 1.5rem; /* 24px - was 16px */
  --radius-2xl: 2rem; /* 32px - was 24px */
  --radius-3xl: 2.5rem; /* 40px - new! */
  --radius-full: 9999px; /* Full pill shape */

  /* === SHADOWS & ELEVATION === */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg:
    0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl:
    0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);

  /* Brand-colored shadows for special elements */
  --shadow-primary: 0 10px 30px -5px rgba(217, 148, 74, 0.3);
  --shadow-secondary: 0 10px 30px -5px rgba(27, 158, 126, 0.3);
  --shadow-accent: 0 10px 30px -5px rgba(45, 184, 148, 0.3);

  /* === LAYOUT CONSTANTS === */
  --sidebar-width: 280px;
  --header-height: 92px;
  --max-content-width: 1400px;

  /* === ANIMATION DURATIONS === */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 350ms;
  --duration-slower: 500ms;

  /* === ANIMATION EASINGS === */
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.6, 1);

  /* === Z-INDEX SCALE === */
  --z-base: 0;
  --z-dropdown: 100;
  --z-sticky: 100;
  --z-overlay: 150;
  --z-sidebar: 200;
  --z-modal: 300;
  --z-toast: 400;
  --z-tooltip: 500;
}
```

---

## Typography System

### Font Stack

**Display Font (Headings):** Lora
**Body Font:** Rubik
**UI/Accent Font:** Rubik

**Import (in `src/app/globals.css`):**

```css
@import url('https://fonts.googleapis.com/css2?family=Lora:wght@500;600;700&family=Rubik:wght@400;500;600;700&display=swap');
```

### Typography Application

```css
/* Headings use elegant serif */
h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: var(--font-display);
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--gray-900);
  line-height: 1.2;
}

/* Body text uses warm sans-serif */
body,
p,
li,
td,
th {
  font-family: var(--font-body);
  font-weight: 400;
  color: var(--gray-700);
  line-height: 1.6;
}

/* UI elements (buttons, badges, labels) use geometric sans */
button,
.btn,
.badge,
label,
input,
select,
textarea {
  font-family: var(--font-accent);
  letter-spacing: 0.01em;
}
```

### Type Scale

| Element           | Font      | Size            | Weight | Line Height | Use Case                  |
| ----------------- | --------- | --------------- | ------ | ----------- | ------------------------- |
| **Page Title**    | Cormorant | 2.5rem (40px)   | 700    | 1.2         | Main page headers         |
| **Large Title**   | Cormorant | 2rem (32px)     | 600    | 1.3         | Section headers           |
| **Section Title** | Cormorant | 1.5rem (24px)   | 600    | 1.4         | Card headers, subsections |
| **Subsection**    | Cormorant | 1.25rem (20px)  | 600    | 1.4         | Card titles               |
| **Body Large**    | DM Sans   | 1.125rem (18px) | 500    | 1.6         | Important body text       |
| **Body**          | DM Sans   | 1rem (16px)     | 400    | 1.6         | Standard body text        |
| **Body Bold**     | DM Sans   | 1rem (16px)     | 600    | 1.6         | Emphasized text           |
| **Small**         | Outfit    | 0.875rem (14px) | 500    | 1.5         | Labels, metadata          |
| **Extra Small**   | Outfit    | 0.75rem (12px)  | 600    | 1.4         | Tags, badges, captions    |

### Typography Patterns

**Page Headers:**

```css
.page-title {
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0 0 var(--space-2) 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-family: var(--font-body);
  font-size: 1.125rem;
  font-weight: 400;
  color: var(--gray-600);
  margin: 0;
}
```

**Card Titles:**

```css
.card-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gray-900);
  margin: 0;
}
```

**Meta Information:**

```css
.meta-label {
  font-family: var(--font-accent);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--gray-500);
}

.meta-value {
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-800);
}
```

---

## Color System

### Primary Palette (Golden Brown - From Logo)

**Source:** Cartoon dog fur in logo

| Variable          | Hex     | RGB                | Use Case                                     |
| ----------------- | ------- | ------------------ | -------------------------------------------- |
| `--primary`       | #d9944a | rgb(217, 148, 74)  | Primary buttons, active states, warm accents |
| `--primary-hover` | #c97d3d | rgb(201, 125, 61)  | Hover states for primary elements            |
| `--primary-light` | #fef4e8 | rgb(254, 244, 232) | Subtle backgrounds, highlights               |
| `--primary-dark`  | #8b5a2b | rgb(139, 90, 43)   | Dark text on light backgrounds               |

**Usage:**

- Primary action buttons
- Active navigation items
- Decorative accents
- Loading indicators
- Success highlights (warm variant)

### Secondary Palette (Teal Green - From Logo)

**Source:** "The Pampered Pooch" text in logo

| Variable            | Hex     | RGB                | Use Case                          |
| ------------------- | ------- | ------------------ | --------------------------------- |
| `--secondary`       | #1b9e7e | rgb(27, 158, 126)  | Secondary buttons, trust elements |
| `--secondary-hover` | #178a6c | rgb(23, 138, 108)  | Hover states                      |
| `--secondary-light` | #e6f7f3 | rgb(230, 247, 243) | Pale mint backgrounds             |
| `--secondary-dark`  | #0f6652 | rgb(15, 102, 82)   | Dark text, borders                |

**Usage:**

- Secondary actions
- Data visualization
- Trust indicators (verified, secure)
- Professional elements
- Information badges

### Accent Palette (Bright Teal - From Logo)

**Source:** Bubbles and bright highlights in logo

| Variable           | Hex     | RGB                | Use Case                           |
| ------------------ | ------- | ------------------ | ---------------------------------- |
| `--accent`         | #2db894 | rgb(45, 184, 148)  | CTAs, highlights, playful elements |
| `--accent-hover`   | #24a382 | rgb(36, 163, 130)  | Hover states                       |
| `--accent-light`   | #d4f4f8 | rgb(212, 244, 248) | Pale aqua backgrounds              |
| `--accent-bubbles` | #a8e6f0 | rgb(168, 230, 240) | Bubble effects, overlays           |

**Usage:**

- Important CTAs ("Book Now", "Add New")
- Success messages
- Playful decorative elements
- Bubble effects (theme-appropriate)
- Links and interactive text

### Gradient Combinations

**Primary Gradient (Golden Warmth):**

```css
background: linear-gradient(
  135deg,
  var(--primary) 0%,
  var(--primary-dark) 100%
);
```

**Secondary Gradient (Teal Trust):**

```css
background: linear-gradient(135deg, var(--accent) 0%, var(--secondary) 100%);
```

**Accent Gradient (Aqua Sparkle):**

```css
background: linear-gradient(
  135deg,
  var(--accent-light) 0%,
  var(--accent-bubbles) 100%
);
```

**Brand Gradient (Logo-Inspired Multi-Color):**

```css
background: linear-gradient(
  135deg,
  var(--primary) 0%,
  var(--accent) 50%,
  var(--secondary) 100%
);
```

**Background Gradient (Subtle Warmth):**

```css
background: linear-gradient(
  160deg,
  #fef9f5 0%,
  /* Warm cream */ #f8f2ec 25%,
  /* Peachy beige */ #f0ebe6 50%,
  /* Soft tan */ #e8f4f2 75%,
  /* Pale mint */ #f5fbfa 100% /* Light aqua */
);
background-size: 400% 400%;
animation: gradientShift 20s ease infinite;
```

---

## Layout System

### Main Content Container

**Standard structure for all pages:**

```css
.main-content {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  margin: var(--space-6);
  margin-top: 0;
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  transition: margin-left var(--duration-normal) var(--ease-smooth);
}

/* When sidebar is pinned */
.main-content.sidebar-pinned {
  margin-left: calc(var(--sidebar-width) + var(--space-6));
}

.content-wrapper {
  padding: var(--space-8);
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    margin: var(--space-4);
    border-radius: var(--radius-xl);
  }

  .content-wrapper {
    padding: var(--space-6);
  }
}
```

### Two-Column Grid Layout

**Used for detail pages (Customer Detail, Animal Detail):**

```css
.content-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: var(--space-8);
}

.main-column {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.sidebar-column {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* Mobile: Single column */
@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
```

### Grid Layout for Cards

**Used for search results, animal lists:**

```css
/* Two-column grid */
.results-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}

/* Three-column for smaller items */
.animals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
}

/* Responsive: Single column on mobile */
@media (max-width: 768px) {
  .results-grid,
  .animals-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## Component Library

### 1. Card Component

**Base Card:**

```css
.card {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all var(--duration-normal) var(--ease-smooth);
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
```

**Card Header:**

```css
.card-header {
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--gray-200);
  background: var(--gray-50);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gray-900);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.card-icon {
  width: 20px;
  height: 20px;
  color: var(--primary);
}
```

**Card Content:**

```css
.card-content {
  padding: var(--space-6);
}
```

**Interactive Card (with brand accent):**

```css
.animal-card {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-xl);
  padding: 0;
  transition: all var(--duration-slow) var(--ease-bounce);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

/* Accent bar on top - using primary gradient */
.animal-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  border-radius: 0;
  transition: height var(--duration-normal) var(--ease-smooth);
}

.animal-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: var(--shadow-primary);
  border-color: var(--primary);
}

.animal-card:hover::before {
  height: 6px;
}

/* Playful avatar rotation on hover */
.animal-card:hover .animal-avatar {
  transform: rotate(-5deg) scale(1.1);
}
```

### 2. Button Component

**Base Button:**

```css
.btn {
  padding: var(--space-3) var(--space-5);
  border: none;
  border-radius: var(--radius-lg);
  font-family: var(--font-accent);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-smooth);
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  justify-content: center;
  text-decoration: none;
  white-space: nowrap;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(0);
}
```

**Button Variants:**

```css
/* Primary (Golden Brown) */
.btn-primary {
  background: var(--primary);
  color: white;
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background: var(--primary-hover);
  box-shadow: var(--shadow-md);
}

/* Secondary (Teal Green) */
.btn-secondary {
  background: var(--secondary);
  color: white;
  box-shadow: var(--shadow-sm);
}

.btn-secondary:hover {
  background: var(--secondary-hover);
  box-shadow: var(--shadow-md);
}

/* Accent (Bright Teal - CTAs) */
.btn-accent {
  background: var(--accent);
  color: white;
  box-shadow: var(--shadow-sm);
}

.btn-accent:hover {
  background: var(--accent-hover);
  box-shadow: var(--shadow-md);
}

/* Outline */
.btn-outline {
  background: transparent;
  color: var(--primary);
  border: 2px solid var(--primary);
}

.btn-outline:hover {
  background: var(--primary-light);
}

/* Ghost */
.btn-ghost {
  background: var(--gray-100);
  color: var(--gray-700);
}

.btn-ghost:hover {
  background: var(--gray-200);
}

/* Success */
.btn-success {
  background: var(--success);
  color: white;
}

/* Danger */
.btn-danger {
  background: var(--error);
  color: white;
}

/* Warning */
.btn-warning {
  background: var(--warning);
  color: white;
}
```

**Button Sizes:**

```css
.btn-small {
  padding: var(--space-2) var(--space-3);
  font-size: 0.75rem;
}

.btn-large {
  padding: var(--space-4) var(--space-6);
  font-size: 1rem;
}

.btn-icon {
  padding: var(--space-2);
  width: auto;
  height: auto;
  aspect-ratio: 1;
}
```

### 3. Avatar Component

**Letter Avatars (with brand gradient):**

```css
.animal-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: var(--font-accent);
  font-weight: 700;
  font-size: 1.25rem;
  box-shadow: var(--shadow-primary);
  transition: all var(--duration-normal) var(--ease-bounce);
  border: 2px solid white;
}

/* Large avatar for headers */
.animal-avatar-large {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, var(--primary-light), var(--accent));
  border-radius: var(--radius-2xl);
  font-size: 3rem;
  font-weight: 800;
  color: var(--primary-dark);
  box-shadow: var(--shadow-lg);
  flex-shrink: 0;
}

/* Mascot avatar - uses cartoon dog image */
.mascot-avatar {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  background: white;
  padding: var(--space-2);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mascot-avatar img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
```

### 4. Badge Component

**Status Badge:**

```css
.status-badge {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-family: var(--font-accent);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}

.status-active {
  background: var(--success);
  color: white;
}

.status-inactive {
  background: var(--gray-200);
  color: var(--gray-700);
}

.status-pending {
  background: var(--warning);
  color: white;
}

.status-error {
  background: var(--error);
  color: white;
}
```

**Category Badge:**

```css
.badge-primary {
  background: var(--primary-light);
  color: var(--primary-dark);
  border: 1px solid var(--primary);
}

.badge-secondary {
  background: var(--secondary-light);
  color: var(--secondary-dark);
  border: 1px solid var(--secondary);
}

.badge-accent {
  background: var(--accent-light);
  color: var(--secondary-dark);
  border: 1px solid var(--accent);
}
```

### 5. Search Component

**Enhanced Search Bar (Header Style):**

```css
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-xl);
  transition: all var(--duration-normal) var(--ease-smooth);
  box-shadow: var(--shadow-sm);
  height: 53px;
}

.search-bar:focus-within {
  border-color: var(--primary);
  box-shadow:
    0 0 0 4px rgba(217, 148, 74, 0.1),
    var(--shadow-md);
}

.search-icon {
  width: 20px;
  height: 20px;
  color: var(--gray-400);
  margin-left: var(--space-4);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  padding: var(--space-4);
  border: none;
  outline: none;
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 500;
  background: transparent;
  color: var(--gray-800);
}

.search-input::placeholder {
  color: var(--gray-400);
}
```

### 6. Form Component

**Form Group:**

```css
.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-family: var(--font-accent);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
}

.form-label.required::after {
  content: ' *';
  color: var(--error);
}
```

**Form Inputs:**

```css
.form-input,
.form-select,
.form-textarea {
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-lg);
  font-family: var(--font-body);
  font-size: 1rem;
  background: white;
  transition: all var(--duration-fast) var(--ease-smooth);
  color: var(--gray-800);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(217, 148, 74, 0.1);
}

.form-input.error,
.form-select.error,
.form-textarea.error {
  border-color: var(--error);
}

.form-input.error:focus,
.form-select.error:focus,
.form-textarea.error:focus {
  box-shadow: 0 0 0 3px rgba(217, 102, 102, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.error-message {
  color: var(--error);
  font-family: var(--font-accent);
  font-size: 0.875rem;
  margin-top: var(--space-1);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}
```

**Form Grid:**

```css
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
```

### 7. Table Component

```css
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-body);
}

.data-table th {
  background: var(--gray-50);
  padding: var(--space-4);
  text-align: left;
  font-family: var(--font-accent);
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--gray-700);
  border-bottom: 2px solid var(--gray-200);
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.data-table td {
  padding: var(--space-4);
  border-bottom: 1px solid var(--gray-100);
  vertical-align: middle;
  color: var(--gray-800);
}

.data-table tr:hover {
  background: var(--primary-light);
}

.data-table tr:last-child td {
  border-bottom: none;
}
```

### 8. Empty State Component

```css
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--header-height) - var(--space-12));
  padding: var(--space-8);
}

.empty-state-content {
  text-align: center;
  max-width: 560px;
}

.empty-icon {
  color: var(--gray-400);
  margin-bottom: var(--space-6);
  display: flex;
  justify-content: center;
}

/* Use cartoon dog for empty state */
.empty-icon img {
  width: 120px;
  height: auto;
  opacity: 0.6;
}

.empty-state h2 {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: var(--space-3);
}

.empty-state p {
  font-family: var(--font-body);
  font-size: 1.125rem;
  color: var(--gray-600);
  margin-bottom: var(--space-8);
  line-height: 1.6;
}
```

### 9. Loading State Component

```css
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: var(--space-6);
}

/* Use running dog cartoon for loading */
.loading-mascot {
  width: 100px;
  height: auto;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.loading-text {
  font-family: var(--font-accent);
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--primary);
}

/* Spinner alternative */
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--primary-light);
  border-top-color: var(--primary);
  border-radius: var(--radius-full);
  animation: spin 1s linear infinite;
}
```

### 10. Breadcrumb Component

```css
.breadcrumb {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--gray-600);
}

.breadcrumb-link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
  transition: color var(--duration-fast) var(--ease-smooth);
}

.breadcrumb-link:hover {
  color: var(--primary-hover);
  text-decoration: underline;
}

.breadcrumb-separator {
  color: var(--gray-400);
}

.breadcrumb-current {
  color: var(--gray-800);
  font-weight: 600;
}
```

---

## Spacing & Sizing

### Spacing Scale

| Token        | Value   | Pixels | Use Case                        |
| ------------ | ------- | ------ | ------------------------------- |
| `--space-1`  | 0.25rem | 4px    | Tight spacing, icon gaps        |
| `--space-2`  | 0.5rem  | 8px    | Small gaps, badge padding       |
| `--space-3`  | 0.75rem | 12px   | Button padding, compact layouts |
| `--space-4`  | 1rem    | 16px   | Standard padding, gaps          |
| `--space-5`  | 1.25rem | 20px   | Card padding                    |
| `--space-6`  | 1.5rem  | 24px   | Section spacing                 |
| `--space-8`  | 2rem    | 32px   | Large sections, content wrapper |
| `--space-10` | 2.5rem  | 40px   | Page margins                    |
| `--space-12` | 3rem    | 48px   | Hero sections                   |
| `--space-16` | 4rem    | 64px   | Major sections                  |
| `--space-20` | 5rem    | 80px   | Extra large spacing             |
| `--space-24` | 6rem    | 96px   | Maximum spacing                 |

### Border Radius Scale

| Token           | Value   | Pixels | Use Case               |
| --------------- | ------- | ------ | ---------------------- |
| `--radius-sm`   | 0.5rem  | 8px    | Badges, small elements |
| `--radius-md`   | 0.75rem | 12px   | Inputs, buttons        |
| `--radius-lg`   | 1rem    | 16px   | Cards, panels          |
| `--radius-xl`   | 1.5rem  | 24px   | Large cards            |
| `--radius-2xl`  | 2rem    | 32px   | Main content container |
| `--radius-3xl`  | 2.5rem  | 40px   | Extra large containers |
| `--radius-full` | 9999px  | Full   | Avatars, pills, badges |

---

## Shadows & Elevation

### Shadow Scale

```css
/* Subtle shadow for cards at rest */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);

/* Medium shadow for hovered cards */
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);

/* Large shadow for elevated panels */
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);

/* Extra large shadow for modals */
--shadow-xl:
  0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

/* Maximum shadow for critical overlays */
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);

/* Brand-colored shadows for special moments */
--shadow-primary: 0 10px 30px -5px rgba(217, 148, 74, 0.3);
--shadow-secondary: 0 10px 30px -5px rgba(27, 158, 126, 0.3);
--shadow-accent: 0 10px 30px -5px rgba(45, 184, 148, 0.3);
```

### Elevation Hierarchy

| Level | Shadow         | Use Case                         |
| ----- | -------------- | -------------------------------- |
| 0     | None           | Flat elements, backgrounds       |
| 1     | `--shadow-sm`  | Resting cards, subtle containers |
| 2     | `--shadow-md`  | Hovered cards, active states     |
| 3     | `--shadow-lg`  | Dropdowns, tooltips              |
| 4     | `--shadow-xl`  | Main content, sidebar            |
| 5     | `--shadow-2xl` | Modals, critical overlays        |

---

## Animations & Transitions

### Standard Transitions

```css
/* Default transition */
transition: all var(--duration-normal) var(--ease-smooth);

/* Hover effects */
transition: all var(--duration-slow) var(--ease-bounce);

/* Transform transitions */
transition: transform var(--duration-normal) var(--ease-smooth);

/* Fast color changes */
transition: background-color var(--duration-fast) var(--ease-smooth);
```

### Keyframe Animations

**Required animations in `globals.css`:**

```css
/* Slide in from below */
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

/* Fade in from below */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Fade in from above */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Background gradient shift */
@keyframes gradientShift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* Shimmer effect (for loading, highlights) */
@keyframes shimmer {
  0%,
  100% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  50% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}

/* Spin (loading indicators) */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Bounce (playful elements, mascot) */
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Gentle pulse (attention grabbers) */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

/* Float (decorative elements) */
@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}
```

### Animation Patterns

**Staggered Entry:**

```css
.card {
  animation: slideInUp 0.4s var(--ease-out) forwards;
  opacity: 0;
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
.card:nth-child(5) {
  animation-delay: 0.4s;
}
.card:nth-child(6) {
  animation-delay: 0.5s;
}
```

**Playful Hover (Cards):**

```css
.card:hover {
  transform: translateY(-8px) scale(1.02);
  transition: all var(--duration-slow) var(--ease-bounce);
}

.card:hover .avatar {
  transform: rotate(-5deg) scale(1.1);
  transition: transform var(--duration-normal) var(--ease-bounce);
}
```

**Mascot Animation:**

```css
.mascot {
  animation: float 3s ease-in-out infinite;
}
```

---

## Responsive Behavior

### Breakpoints

| Breakpoint    | Width               | Target Devices        |
| ------------- | ------------------- | --------------------- |
| Mobile        | `max-width: 480px`  | Small phones          |
| Tablet        | `max-width: 768px`  | Tablets, large phones |
| Desktop       | `min-width: 769px`  | Desktops, laptops     |
| Large Desktop | `min-width: 1280px` | Large monitors        |

### Responsive Patterns

**Grid Collapse:**

```css
/* Desktop: Two columns */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: var(--space-8);
}

/* Tablet/Mobile: Single column */
@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
```

**Typography Scaling:**

```css
/* Desktop */
.page-title {
  font-size: 2.5rem;
}

/* Tablet */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
}

/* Mobile */
@media (max-width: 480px) {
  .page-title {
    font-size: 1.75rem;
  }
}
```

**Spacing Reduction:**

```css
/* Desktop */
.content-wrapper {
  padding: var(--space-8);
}

/* Tablet */
@media (max-width: 768px) {
  .content-wrapper {
    padding: var(--space-6);
  }
}

/* Mobile */
@media (max-width: 480px) {
  .content-wrapper {
    padding: var(--space-4);
  }
}
```

---

## Glassmorphism Effects

### Core Glassmorphic Pattern

```css
background: rgba(255, 255, 255, 0.95);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.2);
box-shadow: var(--shadow-xl);
```

### Application Areas

**1. Header:**

```css
.app-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}
```

**2. Main Content:**

```css
.main-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
}
```

**3. Sidebar:**

```css
.sidebar {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: var(--shadow-xl);
}
```

---

## Interactive States

### Hover States

**Cards:**

```css
.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-4px);
}
```

**Buttons:**

```css
.btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
```

**Links:**

```css
.nav-link:hover {
  background: var(--primary-light);
  color: var(--primary-dark);
}
```

### Focus States

**Inputs:**

```css
.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(217, 148, 74, 0.1);
}
```

**Buttons:**

```css
.btn:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### Active States

**Navigation:**

```css
.nav-link.active {
  background: var(--primary-light);
  color: var(--primary-dark);
  font-weight: 600;
}
```

### Disabled States

**Buttons:**

```css
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
```

**Inputs:**

```css
.form-input:disabled {
  background: var(--gray-100);
  color: var(--gray-500);
  cursor: not-allowed;
}
```

---

## Icons & Graphics

### Icon Sources

- **Material Design Icons** (inline SVG)
- **Heroicons** (inline SVG)
- **Custom mascot illustrations** (`/images/`)

### Common Icons

| Icon          | Use Case                | Size      |
| ------------- | ----------------------- | --------- |
| Search        | Search bars             | 16px-20px |
| Plus          | Add actions             | 14px-16px |
| Edit/Pencil   | Edit actions            | 14px      |
| Delete/Trash  | Delete actions          | 14px      |
| Check         | Success, complete       | 14px-16px |
| Close/X       | Close actions           | 12px-16px |
| Star          | Favorites, breeds       | 18px      |
| Chart         | Analytics               | 18px      |
| History/Clock | Time-based              | 18px      |
| User          | Customer records        | 18px      |
| Menu          | Navigation toggle       | 20px      |
| **Paw**       | Brand icon, pet-related | 18px-24px |

### Icon Styling

```css
.icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: currentColor;
}

.icon-primary {
  color: var(--primary);
}

.icon-secondary {
  color: var(--secondary);
}

.icon-accent {
  color: var(--accent);
}
```

---

## Forms & Inputs

### Input Types

**Text Input:**

```html
<div class="form-group">
  <label class="form-label required" for="name">Name</label>
  <input type="text" id="name" class="form-input" placeholder="Enter name..." />
  <span class="error-message">This field is required</span>
</div>
```

**Select Dropdown:**

```html
<div class="form-group">
  <label class="form-label" for="breed">Breed</label>
  <select id="breed" class="form-select">
    <option value="">Select breed...</option>
    <option value="1">Labrador</option>
  </select>
</div>
```

**Textarea:**

```html
<div class="form-group full-width">
  <label class="form-label" for="notes">Notes</label>
  <textarea
    id="notes"
    class="form-textarea"
    placeholder="Enter notes..."
  ></textarea>
</div>
```

### Validation States

**Error State:**

```css
.form-input.error {
  border-color: var(--error);
}

.form-input.error:focus {
  box-shadow: 0 0 0 3px rgba(217, 102, 102, 0.1);
}

.error-message {
  color: var(--error);
  font-family: var(--font-accent);
  font-size: 0.875rem;
  margin-top: var(--space-1);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}
```

**Success State:**

```css
.form-input.success {
  border-color: var(--success);
}

.form-input.success:focus {
  box-shadow: 0 0 0 3px rgba(45, 184, 148, 0.1);
}
```

---

## Data Display Patterns

### Info Grid

```css
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
  font-family: var(--font-body);
  font-size: 0.875rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.info-label {
  font-family: var(--font-accent);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--gray-500);
}

.info-value {
  font-family: var(--font-body);
  font-weight: 600;
  color: var(--gray-800);
}
```

### List Display

```css
.list-item {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--gray-50);
  border-radius: var(--radius-lg);
  border-left: 4px solid var(--primary);
  transition: all var(--duration-normal) var(--ease-smooth);
}

.list-item:hover {
  background: var(--primary-light);
  border-left-color: var(--primary-hover);
  transform: translateX(4px);
}
```

---

## Cartoon Dog Usage Guide

### Available Poses & Strategic Usage

#### 1. CARTOON_DOG_1.png - Relaxed Laying

**Emotion:** Calm, content, resting
**Use Cases:**

- Empty states ("No results found - relax, try another search")
- Idle waiting screens
- "Nothing to do" states
- End of workflow confirmations

```tsx
<img
  src="/images/CARTOON_DOG_1.png"
  alt="Pampered Pooch mascot relaxing"
  className="mascot-empty"
/>
```

#### 2. CARTOON_DOG_2.png - Happy Sitting (Tongue Out)

**Emotion:** Joyful, friendly, welcoming
**Use Cases:**

- Success messages
- Welcome screens
- Confirmation dialogs ("Success! Your record has been added")
- Homepage greeting

```tsx
<img
  src="/images/CARTOON_DOG_2.png"
  alt="Happy Pampered Pooch"
  className="mascot-success"
/>
```

#### 3. CARTOON_DOG_3.png - Excited Sitting

**Emotion:** Eager, enthusiastic, happy
**Use Cases:**

- Call-to-action prompts
- Encouraging messages
- Feature highlights
- Onboarding steps

```tsx
<img
  src="/images/CARTOON_DOG_3.png"
  alt="Excited Pampered Pooch"
  className="mascot-cta"
/>
```

#### 4. CARTOON_DOG_4.png - Running/Jumping

**Emotion:** Energetic, active, playful
**Use Cases:**

- Loading states (short duration < 3 seconds)
- Active processing indicators
- "Working on it" messages
- Quick actions in progress

```tsx
<img
  src="/images/CARTOON_DOG_4.png"
  alt="Pampered Pooch working"
  className="mascot-loading"
/>
```

#### 5. CARTOON_DOG_5.png - Playful Laying

**Emotion:** Content, playful, at ease
**Use Cases:**

- Secondary empty states
- "Take a break" messages
- Maintenance mode screens
- Off-hours notices

```tsx
<img
  src="/images/CARTOON_DOG_5.png"
  alt="Pampered Pooch at rest"
  className="mascot-idle"
/>
```

#### 6. CARTOON_DOG_6.png - Running Fast

**Emotion:** Very active, urgent, busy
**Use Cases:**

- Loading states (longer duration > 3 seconds)
- Background processing
- Data imports/exports
- Batch operations

```tsx
<img
  src="/images/CARTOON_DOG_6.png"
  alt="Pampered Pooch processing"
  className="mascot-processing"
/>
```

#### 7. CARTOON_DOG_7.png - Standing Happy

**Emotion:** Ready, welcoming, available
**Use Cases:**

- "Get started" prompts
- Form introductions
- Available features
- Navigation highlights

```tsx
<img
  src="/images/CARTOON_DOG_7.png"
  alt="Pampered Pooch ready to help"
  className="mascot-ready"
/>
```

### Implementation Patterns

**Loading State with Mascot:**

```tsx
function LoadingState({ message = 'Fetching data...' }: { message?: string }) {
  return (
    <div className="loading-state">
      <img
        src="/images/CARTOON_DOG_6.png"
        alt="Loading"
        className="mascot-processing"
      />
      <p className="loading-text">{message}</p>
    </div>
  )
}
```

**Empty State with Mascot:**

```tsx
function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="empty-state">
      <img
        src="/images/CARTOON_DOG_1.png"
        alt="No results"
        className="mascot-empty"
      />
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  )
}
```

**Success Toast with Mascot:**

```tsx
function SuccessToast({ message }: { message: string }) {
  return (
    <div className="toast toast-success">
      <img
        src="/images/CARTOON_DOG_2.png"
        alt="Success"
        className="toast-icon"
      />
      <span>{message}</span>
    </div>
  )
}
```

### Mascot Styling

```css
/* Base mascot styles */
.mascot-empty,
.mascot-success,
.mascot-cta,
.mascot-loading,
.mascot-idle,
.mascot-processing,
.mascot-ready {
  width: 100px;
  height: auto;
  opacity: 0.9;
}

/* Animated mascots */
.mascot-loading,
.mascot-processing {
  animation: bounce 1s ease-in-out infinite;
}

.mascot-cta,
.mascot-ready {
  animation: float 3s ease-in-out infinite;
}

/* Sizes */
.mascot-small {
  width: 60px;
}

.mascot-medium {
  width: 100px;
}

.mascot-large {
  width: 150px;
}
```

### Best Practices

1. **Don't Overuse:** Mascot should appear at key moments, not everywhere
2. **Match Emotion:** Choose pose that matches the context (don't show excited dog for errors)
3. **Consistent Sizing:** Keep mascot size proportional to importance of message
4. **Accessibility:** Always include descriptive alt text
5. **Performance:** Optimize images (already done, but verify file sizes)
6. **Brand Consistency:** Mascot reinforces playful, caring brand identity

---

## Accessibility Guidelines

### Focus Indicators

**Always provide visible focus states:**

```css
.btn:focus-visible,
.form-input:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### Color Contrast

**Ensure WCAG AA compliance (4.5:1 for normal text, 3:1 for large text):**

- Text on white: Use `--gray-700` or darker
- Small text: Use `--gray-800` or `--gray-900`
- Links: `--primary` (#d9944a) provides sufficient contrast on white
- Buttons: White text on `--primary` / `--secondary` / `--accent` all pass

### Semantic HTML

**Use proper HTML elements:**

```html
<!-- Good -->
<button class="btn btn-primary">Submit</button>

<!-- Bad -->
<div onclick="submit()" class="btn btn-primary">Submit</div>
```

### ARIA Labels

**Provide labels for icon-only buttons:**

```html
<button class="btn btn-icon" aria-label="Close sidebar">
  <svg>...</svg>
</button>
```

### Keyboard Navigation

**Ensure all interactive elements are keyboard accessible:**

- Tab through navigation items
- Enter to activate buttons
- Escape to close modals/dropdowns
- Arrow keys for list navigation
- Space to toggle checkboxes

### Screen Reader Support

**Provide context for dynamic content:**

```html
<div role="alert" aria-live="polite">Record successfully added!</div>

<button aria-expanded="false" aria-controls="dropdown-menu">Options</button>
```

---

## Implementation Checklist

### New Page Checklist

When creating a new page, ensure:

**Required Elements:**

- [ ] Header component included (`.app-header`)
- [ ] Sidebar component included (`.sidebar`)
- [ ] Animated gradient background on body
- [ ] Paw print pattern overlay (body::after)
- [ ] Main content container (`.main-content`)
- [ ] Content wrapper with proper padding (`.content-wrapper`)

**Design Tokens:**

- [ ] Import all fonts (Cormorant, DM Sans, Outfit)
- [ ] Include all CSS custom properties in `:root`
- [ ] Use design tokens (not hardcoded values)
- [ ] Apply correct font families to elements

**Typography:**

- [ ] Page title uses Cormorant display font
- [ ] Body text uses DM Sans
- [ ] Buttons/UI use Outfit accent font
- [ ] Proper type scale (sizes, weights, line heights)
- [ ] Letter spacing applied correctly

**Colors:**

- [ ] Use brand colors from logo (golden, teal, aqua)
- [ ] Primary actions use `--primary` (golden brown)
- [ ] Secondary actions use `--secondary` (teal green)
- [ ] CTAs use `--accent` (bright teal)
- [ ] Semantic colors for status (success, error, warning)
- [ ] Consistent use of warm grays for neutrals

**Layout:**

- [ ] Uses standard card structure where appropriate
- [ ] Proper spacing scale (`--space-*` variables)
- [ ] Responsive grid layouts
- [ ] Glassmorphic effects applied
- [ ] Proper elevation/shadows

**Components:**

- [ ] Button variants used correctly
- [ ] Form inputs follow design system
- [ ] Badges for status indicators
- [ ] Avatars for user/animal representation
- [ ] Mascot cartoon dog for appropriate contexts

**Interactions:**

- [ ] Hover states on interactive elements
- [ ] Focus states on form inputs
- [ ] Loading states (with mascot if appropriate)
- [ ] Transitions use design system easings
- [ ] Bouncy easing for playful elements

**Animations:**

- [ ] Entry animations (`slideInUp` with stagger)
- [ ] Gradient background animation
- [ ] Mascot animations where used
- [ ] Smooth transitions throughout

**Responsive:**

- [ ] Test at 480px (mobile)
- [ ] Test at 768px (tablet)
- [ ] Test at 1024px+ (desktop)
- [ ] Grid collapses appropriately
- [ ] Typography scales down
- [ ] Spacing reduces on smaller screens
- [ ] Sidebar behavior correct (overlay on mobile)

**Accessibility:**

- [ ] Semantic HTML elements
- [ ] ARIA labels where needed
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader friendly
- [ ] Alt text for all images (including mascot)

**Mascot Usage (if applicable):**

- [ ] Correct pose for context
- [ ] Appropriate size
- [ ] Descriptive alt text
- [ ] Animation if needed
- [ ] Not overused

---

## Version History

| Version | Date       | Changes                                                                                                                                                                                                     |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2025-11-14 | Initial style guide based on generic design                                                                                                                                                                 |
| 2.0     | 2025-11-15 | **Option B Rebrand:** Logo-based colors, Cormorant/DM Sans/Outfit typography, cartoon dog mascot integration, mandatory navbar/sidebar specification, complete design token system, pet-themed enhancements |
| 2.1     | 2025-11-15 | **Typography Update:** Changed from Cormorant/DM Sans/Outfit to Lora/Rubik pairing for refined warmth — elegant serif headlines balanced with warm, rounded body text                                       |

---

## Notes

- **This is the definitive source of truth** for all design decisions
- All new pages **MUST** include Header and Sidebar components
- Use actual brand colors extracted from logo (not theoretical palettes)
- Cartoon dog mascot adds personality - use strategically
- Typography choices (Lora + Rubik) provide refined warmth - elegant yet friendly
- When in doubt, reference this guide before implementing
- Update this document when adding new patterns
- Maintain consistency above all else

---

## Quick Reference

**Primary Color:** `#d9944a` (Golden brown - from logo)
**Secondary Color:** `#1b9e7e` (Teal green - from logo)
**Accent Color:** `#2db894` (Bright teal - from logo)

**Display Font:** Lora (serif)
**Body Font:** Rubik (sans-serif)
**UI Font:** Rubik (sans-serif)

**Mandatory on Every Page:**

1. Header component (`src/components/Header.tsx`)
2. Sidebar component (`src/components/Sidebar.tsx`)
3. Animated gradient background
4. Paw print pattern overlay

**Mascot Location:** `/images/CARTOON_DOG_1.png` through `CARTOON_DOG_7.png`

**Logo Location:** `/images/logo.png`

---

**Style Guide v2.0 Complete** ✨
Ready for Option B implementation!
