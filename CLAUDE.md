# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Steering Files (Guidance Only)

The following files in `.project/steering/` provide **guidance and formatting instructions** - they are NOT files to be directly updated with changes:

- `.project/steering/CHANGELOG.md` - Instructions on HOW to write changelog entries (format, categories, conventions)
- `.project/steering/manageable-tasks.md` - Task management guidance
- `.project/steering/pnpm.md` - Package manager conventions
- `.project/steering/report-writing.md` - Report writing standards

## Actual Changelog Location

**IMPORTANT**: The actual project changelog that should be updated with code changes is:

- **`CHANGELOG.md`** (in repository root) - Update this file with all code changes, bug fixes, and features

When comparing a mock ui versus a live page, follow the following analysis insructions in the file `MOCKUI_ANALYSIS.md`

## Project Overview

This is a Next.js 15 pet grooming database application (PPDB) for "Pampered Pooch" that manages customer, animal, breed, and service records. The application features a modern glassmorphic UI with animated gradients, a searchable animal database with relevance-based ranking, and Prisma ORM connected to a MySQL database.

## Routing Standards

**IMPORTANT**: All routing in this application follows strict standards documented in:

- **@ROUTING_ENFORCEMENT.md** - Mandatory routing patterns and enforcement policy
- **@ROUTES.md** - Complete URL structure and navigation patterns
- **@reference/API_ROUTES.md** - Collated API endpoint reference

All navigation MUST use route helpers from `src/lib/routes.ts` - **no hardcoded route strings allowed**.

## API Documentation

Interactive OpenAPI documentation is available at:

- **Swagger UI**: http://localhost:3000/api/docs
- **OpenAPI JSON**: http://localhost:3000/api/docs/openapi.json

Currently documents 17 core endpoints across Animals, Customers, Breeds, and Notes APIs.

## Development Commands

### Core Development

- `pnpm dev` - Start development server with Turbopack on http://localhost:3000
- `pnpm build` - Create production build
- `pnpm start` - Run production server

### Code Quality

- `pnpm type-check` - Run TypeScript compiler checks (no emit)
- `pnpm lint` - Run ESLint checks
- `pnpm lint:fix` - Auto-fix ESLint issues
- `pnpm fmt` - Format code with Prettier
- `pnpm fmt:check` - Check formatting without changes
- `pnpm check` - Run all checks (type-check + lint + fmt:check + test)

### Testing

- `pnpm test` - Run Jest unit tests (sequential execution)
- `pnpm test:watch` - Run Jest in watch mode
- `pnpm test:coverage` - Generate coverage report
- `pnpm test:e2e` - Run Playwright E2E tests
- `pnpm test:e2e:headed` - Run E2E tests with visible browser
- `pnpm test:e2e:ui` - Open Playwright UI for debugging

### Database Operations

**Note**: Prisma commands use a wrapper script (`scripts/prisma-env.js`) that expands `.env` variable interpolation (e.g., `${MYSQL_HOST}`). Use `pnpm prisma` instead of `npx prisma` directly.

- `pnpm prisma generate` - Regenerate Prisma Client from schema (outputs to `src/generated/prisma/`)
- `pnpm prisma:migrate` - Run migrations in dev mode
- `pnpm prisma migrate deploy` - Apply pending migrations (production)
- `pnpm prisma migrate dev` - Create and apply new migration
- `pnpm prisma studio` - Open Prisma Studio GUI

### Cleanup

- `pnpm clean:tests` - Remove test artifacts (coverage, test-results)
- `pnpm clean:next` - Remove Next.js build cache

## Architecture

### Database Layer (Prisma + MySQL)

- **Schema**: `prisma/schema.prisma` defines four models: `animal`, `breed`, `customer`, `notes`
- **Generated Client**: Lives in `src/generated/prisma/` (NOT `node_modules/@prisma/client`)
- **Connection**: `src/lib/prisma.ts` provides singleton Prisma client
- **Key Relations**:
  - `animal` → `customer` (many-to-one)
  - `animal` → `breed` (many-to-one)
  - `animal` → `notes` (one-to-many)

### API Layer (Next.js Route Handlers)

- **Location**: `src/app/api/*/route.ts`
- **Animals API**: `src/app/api/animals/route.ts`
  - GET with query param `q` performs relevance-ranked search across animal names, breeds, customer names, emails, and phone numbers
  - Implements sophisticated scoring algorithm with fuzzy matching, multi-word search, and diversity bonuses
  - Phone number searches are normalized (strips spaces, dashes, parentheses)
  - POST creates new animal records
- **Animal Detail API**: `src/app/api/animals/[id]/route.ts`
  - GET fetches single animal with relations
  - PUT updates animal
  - DELETE removes animal
- **Validation**: All routes use Zod schemas from `src/lib/validations/`

### State Management (Zustand)

- **Animals Store**: `src/store/animalsStore.ts`
  - Manages animal search results, pagination, loading states
  - Persists `searchParams` and `selectedAnimal` to localStorage
  - Provides async actions: `searchAnimals()`, `fetchAnimal()`, `createAnimal()`, `updateAnimal()`, `deleteAnimal()`
- **Customers Store**: `src/store/customersStore.ts` (similar pattern)

### UI Components (React + Tailwind)

- **Layout**: `src/app/layout.tsx` - Root layout with metadata
- **Main Page**: `src/app/page.tsx` - Client component orchestrating search UI
- **Header**: `src/components/Header.tsx` - Sticky glassmorphic header with search bar, hamburger menu, live date/time
- **Sidebar**: `src/components/Sidebar.tsx` - Collapsible/pinnable navigation with resize handle (200-500px width)
- **Results**: `src/components/ResultsView.tsx` - Grid/list view toggle with staggered animations
- **Animal Card**: `src/components/AnimalCard.tsx` - Card component with hover effects and gradient accents
- **Empty State**: `src/components/EmptyState.tsx` - Shown before search with suggestion chips

### Design System

- **Global Styles**: `src/app/globals.css` defines CSS custom properties for colors, spacing, shadows, layout constants
- **Font**: Inter (Google Fonts)
- **Theme**: Animated gradient background (15s cycle), glassmorphic panels with backdrop-blur
- **Colors**: Primary (#6366f1), Secondary (#06b6d4), Success (#10b981), gradients throughout
- **Animations**: `slideInUp` for results, `gradientShift` for background
- **Responsive**: Mobile-first with breakpoints at 768px (tablet) and 1280px (desktop)

## Important Implementation Details

### Prisma Client Import Path

Always import from the generated client location:

```typescript
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@/generated/prisma'
```

### Database Field Name Mapping

The Prisma schema uses lowercase snake_case field names that differ from the API layer:

- DB: `animalname` → API: `name`
- DB: `SEX` → API: `sex` (enum: 'Male' | 'Female')
- DB: `lastvisit` → API: `lastVisit`
- DB: `thisvisit` → API: `thisVisit`
- DB: `customerID` → API: `customer.id`

### Search Relevance Algorithm

The search implementation in `src/app/api/animals/route.ts` calculates relevance scores:

- **Exact match**: 100 points
- **Starts with**: 80 points
- **Contains**: 50 points
- **Fuzzy match** (70%+ character overlap): 30 points
- **Multi-word queries**: Each term scored independently, diversity bonus applied
- **Phone normalization**: Strips formatting before comparison
- Results sorted by score descending, then surname ascending

### State Persistence

Zustand stores use middleware for:

- `persist`: Saves `searchParams` and `selectedAnimal` to `localStorage`
- `devtools`: Enables Redux DevTools integration

### Responsive Sidebar Behavior

- Desktop: Can be pinned (stays open, shifts content right)
- Tablet/Mobile: Never pins, always overlays with backdrop
- Resize handle: Drag to adjust width (200-500px), updates CSS variable `--sidebar-width`

## Date and Timezone Configuration

### Timezone

The application timezone is configured via the `TZ` environment variable in `.env`:

```bash
TZ=Australia/Adelaide
```

**CRITICAL**: All date/time operations MUST respect this timezone. The Docker container and application server should both use this timezone.

### Date Formatting Standards

All dates displayed in the application MUST use Australian format (DD-MM-YYYY). Use the centralized date utilities in `src/lib/date.ts`:

```typescript
import {
  formatDateAU, // DD-MM-YYYY format: "21-12-2025"
  formatDateShortAU, // DD MMM YYYY format: "21 Dec 2025"
  formatDateSidebar, // Day DD MMM format: "Sat 21 Dec"
  formatDateTimeHeader, // h:mm am/pm Day, DD MMM YYYY
  formatDateForInput, // YYYY-MM-DD for form inputs
  getTodayLocalDateString, // YYYY-MM-DD in local timezone
} from '@/lib/date'
```

### Timezone-Aware Date Creation

**NEVER** use `new Date().toISOString().split('T')[0]` to get today's date - this converts to UTC and can shift the date by a day for Australian timezones.

**ALWAYS** use `getTodayLocalDateString()` instead:

```typescript
// WRONG - Uses UTC, may be wrong date in Australia
const today = new Date().toISOString().split('T')[0]

// CORRECT - Uses local timezone
import { getTodayLocalDateString } from '@/lib/date'
const today = getTodayLocalDateString()
```

### Date Display Consistency

| Context             | Function                    | Example Output           |
| ------------------- | --------------------------- | ------------------------ |
| Animal cards, lists | `formatDateAU()`            | 21-12-2025               |
| Notes, reports      | `formatDateAU()`            | 21-12-2025               |
| Date ranges         | `formatDateShortAU()`       | 21 Dec 2025              |
| Header clock        | `formatDateTimeHeader()`    | 4:30 pm Sat, 21 Dec 2025 |
| Sidebar date        | `formatDateSidebar()`       | Sat 21 Dec               |
| Form inputs         | `formatDateForInput()`      | 2025-12-21               |
| Creating dates      | `getTodayLocalDateString()` | 2025-12-21               |

## Code Style & Conventions

- **Prettier Config**: 2-space indent, single quotes, no semicolons, Tailwind class sorting plugin
- **ESLint**: Extends Next.js config + Prettier integration
- **Component Naming**: PascalCase files for React components (`Header.tsx`)
- **Utilities**: camelCase files for helpers, types, validations
- **Exports**: Named exports preferred except for Next.js page/layout files
- **Client Components**: Mark with `'use client'` directive (all current components are client-side)
- **Husky + lint-staged**: Pre-commit hooks run ESLint and Prettier on staged files

## Testing Strategy

- **Unit Tests**: Jest + React Testing Library for component tests
- **E2E Tests**: Playwright configured for Chromium, runs dev server automatically
- **Test Location**: Unit tests in `src/__tests__/`, E2E tests in `e2e/`
- **Coverage**: Run `pnpm test:coverage` to generate HTML report in `coverage/`

## Database Migration Workflow

### CRITICAL: Drop-in Replacement Philosophy

**This application MUST work as a drop-in replacement for the existing PHP application with ZERO database modifications.**

The database schema is defined by the original SQL files in `reference/PPDB/*.sql` and must remain unchanged for initial deployment:

- `customer.postcode` is `smallint(4)` (INTEGER) - not a string
- `animal.colour` is `text NOT NULL` - empty strings exist, never NULL
- Date fields use `'0000-00-00'` defaults - invalid but present in production
- Field sizes are small (varchar(12), varchar(20)) - historical data may be truncated

### Development Workflow

1. **DO NOT modify the database schema** - Prisma schema matches production exactly
2. Edit `prisma/schema.prisma` only to reflect actual database structure
3. Run `pnpm prisma generate` to update TypeScript types
4. Handle data conversions in APPLICATION layer (TypeScript/JS)
5. Use transformation functions to display data properly (e.g., postcode as string)

### Data Cleanup Strategy

**Phase 1 (Initial Deployment - NOW)**:

- Application works with production database as-is
- No database modifications
- Handle "dirty data" in application layer

**Phase 2 (Post-Deployment - AFTER successful production deployment)**:

- Optional cleanup scripts in `prisma/scripts/`:
  - `fix-invalid-dates.mjs` - converts `'0000-00-00'` to `'1900-01-01'`
  - `add-date-constraints.mjs` - adds CHECK constraints for dates
- Run only after backup and during maintenance window
- See `prisma/scripts/MIGRATION_STRATEGY.md` for details

**Phase 3 (Future Enhancements - LATER)**:

- Schema improvements (expand field sizes, change types)
- Create proper Prisma migrations
- Test thoroughly in dev before production
- Apply during scheduled maintenance

### Important Notes

- Prisma schema reflects production database EXACTLY
- Original DB is MyISAM (reference SQL), current may be InnoDB
- Application handles data type conversions (int postcode → string display)
- Validation is permissive to accept historical "dirty data"

## Project-Specific Workflows

### Archon Task System

**IMPORTANT**: This project uses an Archon-based workflow (documented in ARCHON.md):

- Always check current task before coding
- Update task status: `todo` → `doing` → `review`
- Research documentation before implementing
- Never skip directly to `complete`

### Design Implementation

The codebase recently underwent a major UI redesign (plan in TODO.md):

- Old components removed: `SearchForm.tsx`, legacy `AnimalList.tsx`
- New design uses glassmorphic effects, animated gradients, card-based layouts
- Refer to `reference/redesign/plan.md` for complete design token reference

### Phone Number Handling

Phone searches require special handling:

- DB stores unformatted numbers (digits only)
- Search normalizes input with `normalizePhone()` helper
- Matches against `phone1`, `phone2`, `phone3` fields
- Displays formatted in UI but searches against raw data

## Environment Variables

Required in `.env`:

```
DATABASE_URL="mysql://user:pass@host:port/dbname"
```

## Git Workflow

- **Commit Style**: Sentence-case subjects, present tense, <72 chars
- **Example**: "Add phone number normalization to search"
- **Pre-commit**: Husky runs lint-staged (auto-fixes staged files)
- **Branches**: Feature branches merged to `main`

### Button Styling Standards

- **Colored Pill Buttons**: All primary/action buttons (colored backgrounds) must use the following interactive states:
  - **Base**: `rounded-lg border-2 border-transparent transition-all duration-200`
  - **Hover**: `hover:scale-110 hover:shadow-md`
  - **Border on Hover**: A darker shade of the background color for the border (e.g., `hover:border-[#8a3c35]` for red buttons).
  - **Background on Hover**: A slightly lighter/different shade (e.g., `hover:bg-[#c86158]`).
    (current branch: `claude`)

## Common Pitfalls

1. **Don't import Prisma from `@prisma/client`** - Use `@/generated/prisma` instead
2. **Don't forget client directive** - All interactive components need `'use client'`
3. **Don't skip `prisma generate`** - After schema changes, types won't update until you run this
4. **Phone search requires normalization** - Raw queries won't match formatted DB values
5. **Sidebar width uses CSS variable** - Update `--sidebar-width` when resizing, not inline styles

## UI/UX Standards

- **Notifications**: Use animated, temporary Toast notifications (info, warning, error, success) instead of browser alerts.
  - Duration: 3s for standard messages, 15s for important info/success confirmations.
  - Positioning: Top-center, unobtrusive, floating over content but below header.
  - Animation: Smooth fade-in/fade-out.
  - Layout: Must not shift page layout.
