# Extracted Project Decisions & Design Principles

## 1. Design System: "Soft Luxury"

**Core Aesthetic:** Warm, premium, and professional. Avoids generic "tech startup" purple/blue gradients.

### Color Palette

- **Primary:** Warm Golden Brown (`#d9944a`) - derived from the dog mascot.
- **Secondary:** Teal Green (`#1b9e7e`) - for trust and professional elements.
- **Accent:** Bright Teal (`#2db894`) - for CTAs and highlights.
- **Background:** Subtle warm gradient (Cream/Peach/Tan/Mint).
- **Shadows:** Colored shadows (`--shadow-primary`) for depth.

### Typography

- **Headings:** `Lora` (Serif) - Elegant, premium feel.
- **Body/UI:** `Rubik` (Sans-serif) - Clean, readable, friendly.
- **Sizes:**
  - Page Title: `2.5rem` (40px), weight 700.
  - Section Title: `1.5rem` (24px), weight 600.
  - Body: `1rem` (16px).

### UI Components

- **Cards:**
  - Rounded corners (`--radius-xl` / 24px).
  - Glassmorphism (`backdrop-blur-20px`, semi-transparent white bg).
  - Entrance animations (`slideInUp` with stagger).
  - Hover effects: Lift (`-translate-y-4px`) and enhanced shadow.
- **Buttons:**
  - Pill shape or rounded (`--radius-lg`).
  - Hover: Lift and shadow.
  - Bounce easing for interactions.

## 2. Architecture & Tech Stack

- **Framework:** Next.js 15 App Router.
- **Language:** TypeScript.
- **Styling:** Tailwind CSS + CSS Variables (Design Tokens in `globals.css`).
- **State Management:** Zustand (`useAnimalsStore`, `useCustomersStore`).
- **Database:** MySQL with Prisma ORM.
- **API:** Next.js Route Handlers (RESTful).
- **Validation:** Zod schemas.

## 3. Routing Strategy

**Status:** LOCKED & ENFORCED.

- **Helper:** Must use [src/lib/routes.ts](file:///home/tech/projects/ppdb-ts-oct/src/lib/routes.ts) for all navigation.
- **Principles:**
  - **Shallow Nesting:** Max 2 levels deep.
  - **Contextual Creation:** `/customer/[id]/newAnimal` (create animal for specific customer).
  - **Flat Access:** `/animals/[id]` (access by ID, not nested under customer).
  - **Naming:** Singular for details (`/customer/[id]`), Plural for lists (`/customers`).

## 4. API & Data Model

- **Endpoints:** RESTful structure matching pages.
- **OpenAPI:** Planned migration to auto-generation using `@omer-x/next-openapi-route-handler`.
- **Database Fixes:** All primary keys (`customerID`, `breedID`, `animalID`, `noteID`) are now `AUTO_INCREMENT`.
- **Validation Gaps:**
  - Missing P2025 error handling (Record not found) in some PUT/DELETE routes.
  - Missing negative value checks for breed costs.
  - Missing existence check for animal before creating notes.

## 5. Specific Page Requirements

### Search Results (`/`)

- **Layout:** Redesigned Card (Animal -> Breed -> Customer) or Compact List View.
- **Priority:** Animal Name > Breed > Customer Name > Phone.
- **Features:** Click-to-call/email, full address display.

### Customer Detail (`/customer/[id]`)

- **Layout:** Two-column grid (Main + Sidebar).
- **Components:**
  - Customer Info Card.
  - Associated Animals Card (Grid).
  - Contact Details Card.
  - Stats Card.
  - Quick Actions Card.
- **Gaps:** Missing CSS variables, entrance animations, and glassmorphic effects.

### Daily Totals (`/reports/daily-totals`)

- **Layout:** Stats Grid + Charts + Table.
- **Fixes:** Padding values corrected to match mockups.
- **Gaps:** Missing bounce easing, semantic class names (optional).

### New Animal (`/customer/[id]/newAnimal`)

- **Fixes:** Header logo text vs image, title size, phone formatting.

## 6. Testing Strategy

- **Unit/Component:** Jest + React Testing Library.
- **E2E:** Playwright.
- **API:** Hurl (for integration scenarios).
- **Coverage:** High for API/Stores, gaps in Page integration and negative test cases.
