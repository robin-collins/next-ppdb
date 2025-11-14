# Pampered Pooch Database - UI Style Guide

**Version:** 1.0
**Last Updated:** 2025-11-14
**Purpose:** Comprehensive design system and implementation guidelines for consistent UI across all pages

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Constant Elements](#constant-elements)
3. [Design Tokens](#design-tokens)
4. [Layout System](#layout-system)
5. [Component Library](#component-library)
6. [Typography](#typography)
7. [Color System](#color-system)
8. [Spacing & Sizing](#spacing--sizing)
9. [Shadows & Elevation](#shadows--elevation)
10. [Animations & Transitions](#animations--transitions)
11. [Responsive Behavior](#responsive-behavior)
12. [Glassmorphism Effects](#glassmorphism-effects)
13. [Interactive States](#interactive-states)
14. [Icons & Graphics](#icons--graphics)
15. [Forms & Inputs](#forms--inputs)
16. [Data Display Patterns](#data-display-patterns)
17. [Accessibility Guidelines](#accessibility-guidelines)
18. [Implementation Checklist](#implementation-checklist)

---

## Design Philosophy

### Core Principles

1. **Modern Glassmorphic Aesthetic**
   - Semi-transparent surfaces with backdrop blur
   - Layered depth through shadows and transparency
   - Vibrant animated gradient background

2. **Professional Yet Approachable**
   - Clean, spacious layouts
   - Friendly rounded corners throughout
   - Subtle animations that enhance UX without distraction

3. **Information Hierarchy**
   - Clear visual distinction between primary, secondary, and tertiary content
   - Consistent use of spacing to group related information
   - Strategic use of color to highlight important actions

4. **Consistency First**
   - Shared design tokens across all pages
   - Reusable component patterns
   - Predictable interaction behaviors

---

## Constant Elements

### Elements That MUST Remain Consistent Across All Pages

#### 1. Header Navigation Bar

**Structure:**

```html
<header class="app-header">
  <div class="header-content">
    <!-- Hamburger Menu -->
    <div class="hamburger-menu">...</div>

    <!-- Brand Logo -->
    <div class="brand-header">...</div>

    <!-- Breadcrumb (page-specific) -->
    <div class="breadcrumb">...</div>

    <!-- Header Actions -->
    <div class="header-actions">
      <div class="date-display" id="currentDate"></div>
    </div>
  </div>
</header>
```

**Styling:**

```css
.app-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: var(--space-4) var(--space-6);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-md);
}

.header-content {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  max-width: 1400px;
  margin: 0 auto;
}
```

**Components:**

- **Hamburger Button:** 3-line icon, 20px wide, 2px height per line, 4px gap
- **Brand Logo:** 40px × 40px gradient circle with dog icon, "Pampered Pooch" text beside
- **Breadcrumb:** Dynamic navigation path with `›` separators
- **Date Display:** Live updating date/time in pill shape with primary-light background

#### 2. Hamburger Menu & Sidebar

**Hamburger Animation:**

```css
.hamburger {
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  padding: var(--space-3);
  border-radius: var(--radius-lg);
  transition: all 0.2s ease;
  background: var(--gray-100);
}

.hamburger span {
  width: 20px;
  height: 2px;
  background: var(--gray-700);
  border-radius: 1px;
  transition: all 0.3s ease;
}

/* Active state (X icon) */
.hamburger.active span:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
}

.hamburger.active span:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}
```

**Sidebar Dropdown:**

```css
.nav-dropdown {
  position: absolute;
  top: calc(100% + var(--space-2));
  left: 0;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  min-width: 280px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 200;
}

.nav-dropdown.active {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}
```

**Navigation Links:**

- 6 standard menu items (Dashboard, Search Animals, Add Customer, Manage Breeds, Daily Analytics, Customer History)
- Active state: `background: var(--primary-light)`, `color: var(--primary)`, `font-weight: 600`
- Hover state: `background: var(--gray-100)`, `color: var(--gray-900)`
- Icon + text layout with 18px × 18px icons

#### 3. Background Gradient

**MUST be present on all pages:**

```css
body {
  font-family: var(--font-family);
  background: linear-gradient(
    135deg,
    #667eea 0%,
    #764ba2 25%,
    #6366f1 50%,
    #06b6d4 75%,
    #10b981 100%
  );
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  min-height: 100vh;
  color: var(--gray-800);
  overflow-x: hidden;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
```

**Background Pattern Overlay:**

```css
body::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='27' cy='7' r='1'/%3E%3Ccircle cx='47' cy='7' r='1'/%3E%3Ccircle cx='7' cy='27' r='1'/%3E%3Ccircle cx='27' cy='27' r='1'/%3E%3Ccircle cx='47' cy='27' r='1'/%3E%3Ccircle cx='7' cy='47' r='1'/%3E%3Ccircle cx='27' cy='47' r='1'/%3E%3Ccircle cx='47' cy='47' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
    repeat;
  pointer-events: none;
  z-index: 0;
}
```

---

## Design Tokens

### CSS Custom Properties

**MUST be included in `:root` of every page:**

```css
:root {
  /* Modern Color Palette */
  --primary: #6366f1;
  --primary-hover: #4f46e5;
  --primary-light: #e0e7ff;
  --primary-dark: #3730a3;
  --secondary: #06b6d4;
  --secondary-hover: #0891b2;
  --accent: #f59e0b;
  --accent-hover: #d97706;
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;

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

  /* Typography */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

  /* Spacing Scale */
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

  /* Border Radius */
  --radius-sm: 0.375rem; /* 6px */
  --radius-md: 0.5rem; /* 8px */
  --radius-lg: 0.75rem; /* 12px */
  --radius-xl: 1rem; /* 16px */
  --radius-2xl: 1.5rem; /* 24px */
  --radius-full: 9999px;

  /* Shadows */
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
}

.content-wrapper {
  padding: var(--space-8);
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

/* Responsive: Single column on mobile */
@media (max-width: 768px) {
  .results-grid {
    grid-template-columns: 1fr;
  }
}

/* Three-column for smaller items */
.animals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
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
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: var(--shadow-md);
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
  font-size: 1.125rem;
  font-weight: 700;
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

**Interactive Card (clickable):**

```css
.animal-card {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-xl);
  padding: 0;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

/* Accent bar on top */
.animal-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  border-radius: 0;
}

.animal-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary);
}

.animal-card:hover::before {
  height: 6px;
  background: linear-gradient(
    135deg,
    var(--primary) 0%,
    var(--secondary) 50%,
    var(--accent) 100%
  );
}
```

### 2. Button Component

**Base Button:**

```css
.btn {
  padding: var(--space-3) var(--space-5);
  border: none;
  border-radius: var(--radius-lg);
  font-family: var(--font-family);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  justify-content: center;
  text-decoration: none;
}
```

**Button Variants:**

```css
/* Primary */
.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

/* Secondary */
.btn-secondary {
  background: var(--gray-100);
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
}

.btn-secondary:hover {
  background: var(--gray-200);
}

/* Success */
.btn-success {
  background: var(--success);
  color: white;
}

.btn-success:hover {
  background: #059669;
}

/* Danger */
.btn-danger {
  background: var(--error);
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

/* Warning */
.btn-warning {
  background: var(--warning);
  color: white;
}

.btn-warning:hover {
  background: var(--accent-hover);
}
```

**Button Sizes:**

```css
.btn-small {
  padding: var(--space-2) var(--space-3);
  font-size: 0.75rem;
}

.btn-icon {
  padding: var(--space-2);
  width: auto;
  height: auto;
}
```

### 3. Avatar Component

**Circular Avatar:**

```css
.animal-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
  transition: all 0.3s ease;
  border: 2px solid white;
}

/* Large avatar (for headers) */
.animal-avatar-large {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, var(--primary-light), var(--secondary));
  border-radius: var(--radius-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  font-size: 3rem;
  font-weight: 800;
  box-shadow: var(--shadow-lg);
  flex-shrink: 0;
}
```

### 4. Badge Component

**Status Badge:**

```css
.status-badge {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-active {
  background: var(--success);
  color: white;
}

.status-inactive {
  background: var(--gray-200);
  color: var(--gray-700);
}

.status-legacy {
  background: var(--warning);
  color: white;
}
```

**Category Badge:**

```css
.breed-category {
  display: inline-block;
  padding: var(--space-1) var(--space-2);
  background: var(--secondary);
  color: white;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.breed-category.dogs {
  background: var(--primary);
}

.breed-category.cats {
  background: var(--accent);
}

.breed-category.other {
  background: var(--gray-500);
}
```

### 5. Search Component

**Search Bar:**

```css
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-xl);
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.search-bar:focus-within {
  border-color: var(--primary);
  box-shadow:
    0 0 0 4px rgba(99, 102, 241, 0.1),
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
  font-size: 1rem;
  font-weight: 500;
  background: transparent;
  color: var(--gray-800);
  font-family: var(--font-family);
}
```

**Enhanced Search (Landing Page):**

```css
.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.98);
  border: 3px solid transparent;
  border-radius: var(--radius-2xl);
  transition: all 0.3s ease;
  box-shadow: var(--shadow-xl);
  backdrop-filter: blur(10px);
}

.search-input-wrapper:focus-within {
  border-color: var(--primary);
  box-shadow:
    0 0 0 6px rgba(99, 102, 241, 0.15),
    var(--shadow-2xl);
  transform: translateY(-2px);
}

.smart-search-input {
  flex: 1;
  padding: var(--space-6) var(--space-5);
  border: none;
  outline: none;
  font-size: 1.375rem;
  font-weight: 500;
  background: transparent;
  color: var(--gray-800);
  font-family: var(--font-family);
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
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
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
  font-size: 1rem;
  font-family: var(--font-family);
  background: white;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}
```

**Form Grid:**

```css
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}

/* Mobile: Single column */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
```

### 7. Table Component

**Base Table:**

```css
.breed-table {
  width: 100%;
  border-collapse: collapse;
}

.breed-table th {
  background: var(--gray-50);
  padding: var(--space-4);
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--gray-700);
  border-bottom: 1px solid var(--gray-200);
  white-space: nowrap;
}

.breed-table td {
  padding: var(--space-4);
  border-bottom: 1px solid var(--gray-100);
  vertical-align: middle;
}

.breed-table tr:hover {
  background: var(--gray-50);
}
```

### 8. Empty State Component

**Empty State:**

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
  max-width: 500px;
}

.empty-icon {
  color: var(--gray-400);
  margin-bottom: var(--space-6);
  display: flex;
  justify-content: center;
}

.empty-state h2 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: var(--space-3);
}

.empty-state p {
  font-size: 1.125rem;
  color: var(--gray-600);
  margin-bottom: var(--space-8);
  line-height: 1.6;
}
```

### 9. Stat Display Component

**Stat Item:**

```css
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

### 10. Breadcrumb Component

**Breadcrumb Navigation:**

```css
.breadcrumb {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.875rem;
  color: var(--gray-600);
}

.breadcrumb-link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: var(--primary-hover);
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

## Typography

### Font Stack

**Primary Font:**

```css
--font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

**Load Inter Font:**

```html
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
  rel="stylesheet"
/>
```

### Type Scale

| Element       | Size            | Weight  | Line Height | Use Case                     |
| ------------- | --------------- | ------- | ----------- | ---------------------------- |
| Page Title    | 2.5rem (40px)   | 800     | 1.2         | Main page headers            |
| Large Title   | 2rem (32px)     | 700     | 1.3         | Section headers, large cards |
| Section Title | 1.5rem (24px)   | 700     | 1.4         | Card headers, subsections    |
| Subsection    | 1.25rem (20px)  | 700     | 1.4         | Card titles                  |
| Body Large    | 1.125rem (18px) | 500     | 1.6         | Important body text          |
| Body          | 1rem (16px)     | 400-500 | 1.6         | Standard body text           |
| Small         | 0.875rem (14px) | 500-600 | 1.5         | Labels, metadata             |
| Extra Small   | 0.75rem (12px)  | 600     | 1.4         | Tags, badges, captions       |

### Typography Patterns

**Page Headers:**

```css
.page-title-section h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--gray-900);
  margin: 0 0 var(--space-2) 0;
}

.page-subtitle {
  font-size: 1.125rem;
  color: var(--gray-600);
  margin: 0;
}
```

**Card Titles:**

```css
.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
}
```

**Meta Information:**

```css
.meta-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--gray-500);
}

.meta-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-800);
}
```

---

## Color System

### Primary Colors

| Variable          | Hex     | RGB                | Use Case                              |
| ----------------- | ------- | ------------------ | ------------------------------------- |
| `--primary`       | #6366f1 | rgb(99, 102, 241)  | Primary buttons, links, active states |
| `--primary-hover` | #4f46e5 | rgb(79, 70, 229)   | Hover states for primary elements     |
| `--primary-light` | #e0e7ff | rgb(224, 231, 255) | Backgrounds, subtle highlights        |
| `--primary-dark`  | #3730a3 | rgb(55, 48, 163)   | Dark mode, deep accents               |

### Secondary Colors

| Variable            | Hex     | RGB              | Use Case                   |
| ------------------- | ------- | ---------------- | -------------------------- |
| `--secondary`       | #06b6d4 | rgb(6, 182, 212) | Secondary actions, accents |
| `--secondary-hover` | #0891b2 | rgb(8, 145, 178) | Hover states               |

### Semantic Colors

| Variable    | Hex     | RGB               | Use Case                      |
| ----------- | ------- | ----------------- | ----------------------------- |
| `--success` | #10b981 | rgb(16, 185, 129) | Success states, active status |
| `--warning` | #f59e0b | rgb(245, 158, 11) | Warnings, pending states      |
| `--error`   | #ef4444 | rgb(239, 68, 68)  | Errors, delete actions        |
| `--accent`  | #f59e0b | rgb(245, 158, 11) | Highlights, special features  |

### Neutral Palette

| Variable     | Hex     | RGB                | Use Case                   |
| ------------ | ------- | ------------------ | -------------------------- |
| `--gray-50`  | #f8fafc | rgb(248, 250, 252) | Subtle backgrounds         |
| `--gray-100` | #f1f5f9 | rgb(241, 245, 249) | Card headers, secondary bg |
| `--gray-200` | #e2e8f0 | rgb(226, 232, 240) | Borders, dividers          |
| `--gray-300` | #cbd5e1 | rgb(203, 213, 225) | Disabled borders           |
| `--gray-400` | #94a3b8 | rgb(148, 163, 184) | Placeholder text, icons    |
| `--gray-500` | #64748b | rgb(100, 116, 139) | Labels, secondary text     |
| `--gray-600` | #475569 | rgb(71, 85, 105)   | Body text                  |
| `--gray-700` | #334155 | rgb(51, 65, 85)    | Primary text               |
| `--gray-800` | #1e293b | rgb(30, 41, 59)    | Headings, emphasis         |
| `--gray-900` | #0f172a | rgb(15, 23, 42)    | Strongest text             |

### Gradient Combinations

**Primary Gradient:**

```css
background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
```

**Accent Gradient:**

```css
background: linear-gradient(
  135deg,
  var(--primary) 0%,
  var(--secondary) 50%,
  var(--accent) 100%
);
```

**Light Gradient:**

```css
background: linear-gradient(135deg, var(--primary-light), var(--secondary));
```

---

## Spacing & Sizing

### Spacing Scale

| Token        | Value   | Pixels | Use Case                       |
| ------------ | ------- | ------ | ------------------------------ |
| `--space-1`  | 0.25rem | 4px    | Tight spacing, badges          |
| `--space-2`  | 0.5rem  | 8px    | Small gaps, compact layouts    |
| `--space-3`  | 0.75rem | 12px   | Button padding, small elements |
| `--space-4`  | 1rem    | 16px   | Standard padding, gaps         |
| `--space-5`  | 1.25rem | 20px   | Card padding                   |
| `--space-6`  | 1.5rem  | 24px   | Section spacing                |
| `--space-8`  | 2rem    | 32px   | Large sections                 |
| `--space-10` | 2.5rem  | 40px   | Page margins                   |
| `--space-12` | 3rem    | 48px   | Hero sections                  |
| `--space-16` | 4rem    | 64px   | Major sections                 |

### Border Radius Scale

| Token           | Value    | Pixels | Use Case               |
| --------------- | -------- | ------ | ---------------------- |
| `--radius-sm`   | 0.375rem | 6px    | Badges, small elements |
| `--radius-md`   | 0.5rem   | 8px    | Inputs, buttons        |
| `--radius-lg`   | 0.75rem  | 12px   | Cards, panels          |
| `--radius-xl`   | 1rem     | 16px   | Large cards            |
| `--radius-2xl`  | 1.5rem   | 24px   | Main content container |
| `--radius-full` | 9999px   | Full   | Avatars, pills, badges |

### Common Measurements

**Container Widths:**

- Max content width: `1400px`
- Sidebar width: `280px` (resizable 200-500px)
- Sidebar column (detail pages): `400px`

**Element Sizes:**

- Small avatar: `32px` × `32px`
- Medium avatar: `48px` × `48px`
- Large avatar: `120px` × `120px`
- Icon size: `16-24px` (typically 18px, 20px)
- Brand icon: `40px` × `40px`

---

## Shadows & Elevation

### Shadow Scale

**Purpose:** Create depth and hierarchy through layered shadows.

```css
/* Subtle shadow for cards at rest */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);

/* Medium shadow for hovered cards, dropdowns */
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);

/* Large shadow for elevated panels */
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);

/* Extra large shadow for modals, popovers */
--shadow-xl:
  0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

/* Maximum shadow for critical overlays */
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
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

**Default Transition:**

```css
transition: all 0.2s ease;
```

**Hover Effects:**

```css
transition: all 0.3s ease;
```

**Transform Transitions:**

```css
transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### Keyframe Animations

**Slide In Up (Entry Animation):**

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

/* Usage */
.card {
  animation: slideInUp 0.4s ease-out forwards;
}

/* Stagger delays */
.card:nth-child(2) {
  animation-delay: 0.1s;
}
.card:nth-child(3) {
  animation-delay: 0.2s;
}
```

**Fade In Down:**

```css
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
```

**Fade In Up:**

```css
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
```

**Gradient Shift (Background):**

```css
@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
```

**Shimmer Effect:**

```css
@keyframes shimmer {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  50% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
  100% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
}
```

**Spin (Loading):**

```css
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

### Animation Patterns

**Staggered Entry:**

```javascript
// Add delays dynamically
setTimeout(() => {
  const cards = document.querySelectorAll('.animal-card, .list-item')
  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.05}s`
  })
}, 50)
```

**Hover Lift:**

```css
.card:hover {
  transform: translateY(-4px);
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

**Header Simplification:**

```css
/* Desktop: Full branding */
.brand-text-header {
  display: block;
}

/* Mobile: Hide text, show icon only */
@media (max-width: 768px) {
  .brand-text-header {
    display: none;
  }
}
```

**Sidebar Behavior:**

```css
/* Desktop: Sidebar can be pinned */
.sidebar.pinned {
  position: relative;
  transform: translateX(0);
}

/* Mobile: Sidebar always overlays */
@media (max-width: 768px) {
  .sidebar {
    width: min(280px, 80vw);
  }

  .sidebar.pinned {
    position: fixed; /* Override pinning on mobile */
  }
}
```

---

## Glassmorphism Effects

### Core Glassmorphic Pattern

**Semi-transparent background with blur:**

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

**3. Search Input (Enhanced):**

```css
.search-input-wrapper {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-xl);
}
```

**4. Brand Icon:**

```css
.brand-icon {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 2px solid var(--glass-border);
  box-shadow: var(--shadow-2xl);
}
```

### Glass Variables (Optional)

```css
--glass-bg: rgba(255, 255, 255, 0.1);
--glass-border: rgba(255, 255, 255, 0.2);
--glass-blur: blur(20px);
```

---

## Interactive States

### Hover States

**Cards:**

```css
.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
```

**Buttons:**

```css
.btn:hover {
  transform: translateY(-1px);
}

.btn-primary:hover {
  background: var(--primary-hover);
}
```

**Links:**

```css
.nav-link:hover {
  background: var(--gray-100);
  color: var(--gray-900);
}
```

### Focus States

**Inputs:**

```css
.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
```

**Search Bar:**

```css
.search-bar:focus-within {
  border-color: var(--primary);
  box-shadow:
    0 0 0 4px rgba(99, 102, 241, 0.1),
    var(--shadow-md);
}
```

### Active States

**Navigation:**

```css
.nav-link.active {
  background: var(--primary-light);
  color: var(--primary);
  font-weight: 600;
}
```

**Buttons:**

```css
.btn:active {
  transform: translateY(0);
}
```

### Disabled States

**Buttons:**

```css
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Inputs:**

```css
.form-input:disabled {
  background: var(--gray-100);
  cursor: not-allowed;
}
```

### Loading States

```css
.loading {
  opacity: 0.7;
  pointer-events: none;
  position: relative;
}

.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
```

---

## Icons & Graphics

### Icon Sources

**Material Design Icons (via inline SVG):**

- All icons are embedded as inline SVG in HTML
- Size: 16px-24px (most commonly 18px, 20px)
- Color: Inherits from parent or uses CSS variables

### Common Icons

| Icon             | Use Case                    | Size      |
| ---------------- | --------------------------- | --------- |
| Dog              | Brand logo, animal records  | 20px-40px |
| Search           | Search bars, search actions | 16px-20px |
| Plus             | Add actions                 | 14px-16px |
| Edit/Pencil      | Edit actions                | 14px      |
| Delete/Trash     | Delete actions              | 14px      |
| Check            | Success, complete           | 14px-16px |
| Close/X          | Close actions, clear        | 12px-16px |
| Star             | Favorites, breeds           | 18px      |
| Chart            | Analytics, stats            | 18px      |
| History/Clock    | History, time-based         | 18px      |
| User             | Customer records            | 18px      |
| Menu (hamburger) | Navigation toggle           | 20px      |

### Icon Styling

**Standard Icon in Button:**

```css
.btn svg {
  width: 16px;
  height: 16px;
}
```

**Navigation Icons:**

```css
.nav-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}
```

**Card Header Icons:**

```css
.card-icon {
  width: 20px;
  height: 20px;
  color: var(--primary);
}
```

### Avatar Initials

**Instead of photos, use letter avatars:**

```html
<div class="animal-avatar">C</div>
```

---

## Forms & Inputs

### Input Types

**Text Input:**

```css
.form-input {
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-lg);
  font-size: 1rem;
  font-family: var(--font-family);
  background: white;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
```

**Select Dropdown:**

```css
.form-select {
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-lg);
  font-size: 1rem;
  font-family: var(--font-family);
  background: white;
  transition: all 0.2s ease;
  cursor: pointer;
}
```

**Textarea:**

```css
.form-textarea {
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-lg);
  font-size: 1rem;
  font-family: var(--font-family);
  background: white;
  transition: all 0.2s ease;
  resize: vertical;
  min-height: 100px;
}
```

### Validation States

**Error State:**

```css
.form-input.error {
  border-color: var(--error);
}

.form-input.error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-message {
  color: var(--error);
  font-size: 0.875rem;
  margin-top: var(--space-1);
}
```

**Success State:**

```css
.form-input.success {
  border-color: var(--success);
}
```

---

## Data Display Patterns

### Info Grid

**Two-column info display:**

```css
.card-content {
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
  letter-spacing: 0.1em;
  color: var(--gray-500);
}

.info-value {
  font-weight: 600;
  color: var(--gray-800);
}
```

### Meta Display

**Key-value pairs:**

```css
.meta-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.meta-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--gray-500);
}

.meta-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-800);
}
```

### List Display

**Service History:**

```css
.service-item {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--gray-50);
  border-radius: var(--radius-lg);
  border-left: 4px solid var(--primary);
  transition: all 0.2s ease;
}

.service-item:hover {
  background: var(--primary-light);
  border-left-color: var(--primary-hover);
}
```

---

## Accessibility Guidelines

### Focus Indicators

**Always provide visible focus states:**

```css
.btn:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### Color Contrast

**Ensure WCAG AA compliance:**

- Text on white: Use `--gray-700` or darker
- Small text: Use `--gray-800` or darker
- Links: `--primary` provides sufficient contrast

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

---

## Implementation Checklist

### New Page Checklist

When creating a new page, ensure:

- [ ] **Design Tokens**
  - [ ] Import Inter font from Google Fonts
  - [ ] Include all CSS custom properties in `:root`
  - [ ] Use design tokens instead of hardcoded values

- [ ] **Layout Structure**
  - [ ] Include standard header (`.app-header`)
  - [ ] Include hamburger menu and navigation dropdown
  - [ ] Include animated gradient background
  - [ ] Include background pattern overlay
  - [ ] Wrap content in `.main-content` container
  - [ ] Use `.content-wrapper` for padding

- [ ] **Components**
  - [ ] Use standard card structure (`.card`, `.card-header`, `.card-content`)
  - [ ] Use button variants (`.btn-primary`, `.btn-secondary`, etc.)
  - [ ] Use avatar component for user/animal initials
  - [ ] Use badge component for status indicators

- [ ] **Typography**
  - [ ] Follow type scale for headings and body text
  - [ ] Use proper font weights (400, 500, 600, 700, 800)
  - [ ] Set line heights appropriately

- [ ] **Spacing**
  - [ ] Use spacing scale variables (`--space-*`)
  - [ ] Consistent gaps in grids (typically `--space-4` to `--space-8`)
  - [ ] Appropriate padding in cards (`--space-6`)

- [ ] **Interactions**
  - [ ] Add hover states to interactive elements
  - [ ] Add focus states to form inputs
  - [ ] Include loading states where applicable
  - [ ] Add transition effects (`transition: all 0.2s ease`)

- [ ] **Animations**
  - [ ] Use `slideInUp` for entry animations
  - [ ] Add stagger delays for lists (0.05s per item)
  - [ ] Include gradient shift animation on background

- [ ] **Responsive**
  - [ ] Test at 480px (mobile)
  - [ ] Test at 768px (tablet)
  - [ ] Test at 1024px+ (desktop)
  - [ ] Grid collapses appropriately
  - [ ] Sidebar behavior correct on mobile

- [ ] **Accessibility**
  - [ ] Proper semantic HTML
  - [ ] ARIA labels where needed
  - [ ] Keyboard navigation works
  - [ ] Focus indicators visible
  - [ ] Color contrast meets WCAG AA

- [ ] **JavaScript**
  - [ ] Live date/time in header updates every second
  - [ ] Hamburger menu toggles sidebar
  - [ ] Navigation links update active state
  - [ ] Form validations work correctly

---

## Version History

| Version | Date       | Changes                                          |
| ------- | ---------- | ------------------------------------------------ |
| 1.0     | 2025-11-14 | Initial style guide created from mockui analysis |

---

## Notes

- This style guide is a living document and should be updated as the design system evolves
- When adding new patterns, update this document to maintain consistency
- Reference mockui files in `reference/redesign/` for complete implementation examples
- Prioritize reusable components over one-off solutions
