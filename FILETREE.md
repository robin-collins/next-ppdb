# File Tree Structure

This document tracks the current file structure of the ppdb-ts project.

```text
ppdb-ts/
├── .cursorindexingignore
├── .gitignore
├── .husky/
├── .prettierignore
├── .prettierrc
├── .specstory/
├── CHANGELOG.md                    # Project changelog (created)
├── OPENAPI_IMPLEMENTATION.md       # ✅ Enhanced OpenAPI implementation guide with Context7 references (updated 2025-11-17)
├── CHECK_DATABASE.sh               # Helper script to check notes table schema (created 2025-11-16)
├── DATABASE_FIX_COMPLETE.md        # ✅ Complete database fix summary and verification (created 2025-11-16)
├── DATABASE_FIXES.md               # Database schema issue tracking and resolutions (created 2025-11-16)
├── FAILURELOG.md                   # Failed attempts and lessons learned (created 2025-11-16)
├── FIXES_COMPLETE.md               # ✅ Comprehensive summary of all fixes - database, API, and UX (created 2025-11-16)
├── ROUTES.md                       # ✅ Authoritative RESTful routing specification - LOCKED (created 2025-11-16)
├── ROUTING_ENFORCEMENT.md          # 🔒 Routing enforcement policy and code review requirements (created 2025-11-16)
├── ROUTING_COMPLETE.md             # ✅ RESTful routing standardization completion summary (created 2025-11-16)
├── LOGGING.md                      # ✅ Unified logging system documentation with examples (created 2025-11-16)
├── hurl/                           # ✅ Hurl API testing directory (created 2025-11-16)
│   ├── README.md                   #    Installation, usage, and examples
│   ├── variables.env               #    Environment variables for tests
│   ├── workflow-complete.hurl      #    End-to-end workflow test
│   ├── animals/                    #    Animal API tests (search, get, create, update, delete)
│   ├── customers/                  #    Customer API tests (search, get, create, update, delete)
│   ├── breeds/                     #    Breed API tests (list, get, create, update, delete)
│   └── notes/                      #    Service note API tests (create, get, update, delete)
├── scripts/                        # Build and utility scripts
│   ├── test-hurl.sh                # ✅ Hurl test runner script (created 2025-11-16)
│   └── build-on-main.sh            # ✅ Conditional build script for main branch commits (created 2025-11-17)
├── FIX_ALL_AUTOINCREMENT.sh        # Comprehensive AUTO_INCREMENT fix script (created 2025-11-16)
├── FIX_DATABASE_NOW.sh             # Automated database fix script for notes (created 2025-11-16)
├── FINISH_DATABASE_FIX.md          # Manual fix guide for remaining tables (created 2025-11-16)
├── fix-database.mjs                # Node.js script using Prisma for DB fixes (created 2025-11-16)
├── MIGRATION_GUIDE.md              # Database migration instructions (created)
├── URGENT_DATABASE_FIX.md          # CRITICAL: Complete AUTO_INCREMENT fix guide (created 2025-11-16)
├── PRODUCTION_DEPLOYMENT.md        # Production migration overview (created)
├── SCORES.md                       # Search scoring algorithm documentation (created)
├── TESTING.md                      # Comprehensive testing documentation (created 2025-11-16)
├── SKILLS/                         # Skills directory (created)
│   ├── changelog/                  # Changelog management skill package
│   │   └── SKILL.md                # Documentation standards and changelog format guidelines
│   └── report-writing/             # Report writing skill package
│       ├── SKILL.md                # Skill definition with frontmatter and instructions
│       └── references/
│           └── report-template.md  # Comprehensive report template with all sections
├── e2e/
│   ├── homepage.spec.ts            # Legacy smoke test with Next.js compilation handling
│   ├── search-flow.spec.ts         # E2E tests for complete search workflow (5 tests)
│   └── animal-management.spec.ts   # E2E tests for animal detail viewing (6 tests)
├── eslint.config.mjs
├── FILETREE.md                     # This file (created)
├── FAILURELOG.md                   # Failed attempt log (created)
├── TODO.md                         # Redesign implementation plan (created)
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── postcss.config.mjs
├── prisma/
│   ├── README.md                       # Schema evolution and migration documentation (created)
│   ├── PRODUCTION_MIGRATION.md         # Production deployment guide (created)
│   ├── migrations/
│   │   ├── 20251004154300_schema_normalization/
│   │   │   └── migration.sql           # Schema normalization migration (created)
│   │   ├── fix_notes_autoincrement.sql # Fix for notes.noteID AUTO_INCREMENT issue (created 2025-11-16)
│   │   ├── fix_all_autoincrement.sql   # Initial complete AUTO_INCREMENT fix (created 2025-11-16)
│   │   ├── fix_all_autoincrement_comprehensive.sql # With FK handling (created 2025-11-16)
│   │   └── fix_all_autoincrement_final.sql # READY TO RUN: Complete fix with instructions (created 2025-11-16)
│   ├── scripts/                        # Migration utility scripts (created)
│   │   ├── pre-migration-checks.sql    # Pre-migration validation (14 checks)
│   │   ├── post-migration-validation.sql # Post-migration validation (14 checks)
│   │   ├── rollback.sql                # Emergency rollback script
│   │   └── QUICK_REFERENCE.md          # Quick reference card for migration
│   └── schema.prisma                   # Updated with normalized schema
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── README.md
├── update_mockui_prompts.md         # Prompt templates for redesign updates (created)
├── reference/
│   └── redesign/
│       ├── ppdb_search_results.html        # Reference HTML prototype
│       ├── customer-record-modern.html     # Customer detail page mockup
│       ├── cody-animal-record-complete.html # Animal detail page mockup
│       ├── breed_management_modern.html    # Breed management mockup
│       ├── mockui-customer-history.html    # Customer history mock UI (form removed, table retained)
│       ├── mockui-service-history.html     # Service history mock UI with unified stats header and divider-separated notes
│       └── landing_page.html               # Landing page mockup
├── .project/
│   ├── steering/
│   │   ├── CHANGELOG.md                    # Project changelog
│   │   ├── manageable-tasks.md             # Task management guide
│   │   ├── pnpm.md                         # pnpm usage guide
│   │   └── report-writing.md               # Report writing standards
│   └── reports/
│       ├── VISUAL_COMPARISON_REPORT.md     # Visual comparison analysis (created)
│       └── customer-detail-page-gap-analysis.md # Customer page gap analysis (created)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── animals/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   ├── breeds/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   ├── notes/
│   │   │   │   └── [noteId]/
│   │   │   │       └── route.ts
│   │   │   ├── admin/
│   │   │   │   └── backup/
│   │   │   │       └── route.ts
│   │   │   └── customers/
│   │   │       ├── [id]/
│   │   │       │   └── route.ts
│   │   │       └── history/
│   │   │           └── route.ts
│   │   │       └── route.ts              # GET (search/list), POST (create)
│   │   ├── animals/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── customers/
│   │   │   └── add/
│   │   │       └── page.tsx              # Add Customer page (created)
│   │   │   └── history/
│   │   │       └── page.tsx              # Customers History page (created)
│   │   ├── breeds/
│   │   │   └── page.tsx                  # Breeds Management page (created)
│   │   ├── reports/
│   │   │   └── daily-totals/
│   │   │       └── page.tsx              # Daily Totals report page (created)
│   │   ├── admin/
│   │   │   └── backup/
│   │   │       └── page.tsx              # Admin backup stub page (created)
│   │   ├── favicon.ico
│   │   ├── globals.css              # Updated with design system and tokens
│   │   ├── layout.tsx               # Simplified with new metadata
│   │   └── page.tsx                 # Refactored with new components
│   ├── components/
│   │   ├── AnimalCard.tsx           # New: Card view component (created)
│   │   ├── AnimalList.tsx           # Legacy: To be deprecated
│   │   ├── EmptyState.tsx           # New: Empty state component (created)
│   │   ├── ErrorBoundary.tsx        # Fixed linting issues
│   │   ├── Header.tsx               # Header with search buttons, date pill, solid bg
│   │   ├── Breadcrumbs.tsx          # Shared breadcrumbs component (created)
│   │   ├── ConfirmDialog.tsx        # Shared confirmation dialog (created)
│   │   ├── Pagination.tsx           # Shared pagination (created)
│   │   ├── Toast.tsx                # Shared toast notification (created)
│   │   ├── ResultsView.tsx          # New: Results container (created)
│   │   └── Sidebar.tsx              # New: Navigation sidebar (created)
│   │   ├── breeds/
│   │   │   ├── BreedForm.tsx        # Breed creation form (created)
│   │   │   └── BreedTable.tsx       # Breed list with inline edit/delete (created)
│   │   ├── animals/
│   │   │   ├── AnimalHeader.tsx
│   │   │   └── AnimalInfoCard.tsx
│   │   ├── customerHistory/
│   │   │   ├── HistoryFilters.tsx
│   │   │   ├── CustomerHistoryTable.tsx
│   │   │   └── StatsBar.tsx
│   │   ├── reports/
│   │   │   └── DailyTotalsCard.tsx  # Daily totals summary card (created)
│   ├── generated/
│   │   └── prisma/                 # Prisma generated types
│   ├── middleware.ts                    # ✅ Next.js middleware for API request logging (created 2025-11-16)
│   ├── lib/
│   │   ├── logger.ts                    # ✅ Unified logging utilities - API and SQL logging (created 2025-11-16)
│   │   ├── prisma.ts                    # Prisma client configuration with SQL logging (created)
│   │   ├── routes.ts                    # ✅ Type-safe route helper utilities - enforces RESTful patterns (created 2025-11-16)
│   │   └── validations/
│   │       ├── animal.ts
│   │       ├── customer.ts
│   │       └── serviceNote.ts
│   ├── store/
│   │   ├── animalsStore.ts         # Fixed linting issues, added types
│   │   └── customersStore.ts       # Fixed linting issues, added types
│   └── __tests__/                  # Test directory (created 2025-11-16)
│       ├── api/                    # API route tests (42 tests total)
│       │   ├── animals.test.ts    # Animals API comprehensive tests (14 tests: 12 passing, 2 skipped)
│       │   ├── customers.test.ts  # Customers API tests (12 passing)
│       │   ├── breeds.test.ts     # Breeds API tests (8 tests: 6 passing, 2 skipped)
│       │   └── notes.test.ts      # Notes API tests (8 tests: 7 passing, 1 skipped)
│       ├── components/             # Component tests (71 tests, all passing)
│       │   ├── AnimalCard.test.tsx     # AnimalCard component tests (20 tests)
│       │   ├── Breadcrumbs.test.tsx    # Breadcrumbs navigation tests (7 tests)
│       │   ├── ConfirmDialog.test.tsx  # Modal dialog tests (13 tests)
│       │   ├── EmptyState.test.tsx     # Empty state tests (7 tests)
│       │   ├── Pagination.test.tsx     # Pagination controls tests (11 tests)
│       │   └── Toast.test.tsx          # Toast notification tests (13 tests)
│       ├── store/                  # Zustand store tests (21 tests)
│       │   └── animalsStore.test.ts    # Animals store state management (21 passing)
│       ├── sanity.test.tsx         # Basic React rendering smoke test
│       ├── helpers/                # Test utilities
│       │   ├── api.ts              # API test helpers (createMockRequest, parseResponseJSON, etc.)
│       │   ├── db.ts               # Database test utilities (setupTestDB, cleanupTestDB, seedTestData)
│       │   └── mocks.ts            # Mock utilities (mockPrismaClient, mockFetch, mockNextRouter, etc.)
│       ├── fixtures/               # Test data fixtures
│       │   ├── animals.ts          # Sample animal data with edge cases
│       │   ├── breeds.ts           # Sample breed data
│       │   ├── customers.ts        # Sample customer data
│       │   ├── notes.ts            # Sample service note data
│       │   └── index.ts            # Barrel export for all fixtures
│       └── sanity.test.tsx         # Basic React Testing Library smoke test
├── jest.config.mjs                 # Updated with testMatch pattern for test files only
├── jest.setup.ts                   # Enhanced with conditional browser API mocks
├── TESTING.md                      # Comprehensive testing documentation (created 2025-11-16)
├── ROUTES_COMPONENTS.md            # MVP routes/components blueprint (updated)
├── TODO_ROUTES_COMPONENTS.md       # MVP task checklist (updated)
└── reference/
    └── CURRENT_PLAN.md             # MVP development plan (updated priorities)
└── reference/current/
    └── mockui-validation-customers-history.md  # Validation artifact (created)
└── tsconfig.json
```

## Recent Changes

- 2025-11-16: Baseline verification complete. No structural file changes; formatted reference HTML under `reference/redesign/` with Prettier to satisfy formatting checks.

### Database Schema Migration

Complete production-ready migration infrastructure for safely upgrading from legacy `ppdb-original.sql` schema:

**Core Migration Files:**

- **prisma/migrations/20251004154300_schema_normalization/migration.sql**: Main migration script
  - Cleans sentinel '0000-00-00' dates to NULL
  - Converts tables to InnoDB with utf8mb4 character set
  - Updates all ID columns to INT UNSIGNED
  - Renames columns for clarity (SEX→sex, notes.notes→note_text, notes.date→note_date)
  - Changes postcode from SMALLINT to VARCHAR(10)
  - Updates foreign key constraints from CASCADE to RESTRICT (prevents accidental deletions)
  - Adds unique constraint on breed.breedname
  - Adds performance indexes: ix_animalname, ix_breedID, ix_customerID, ix_animalID
  - Expands VARCHAR limits for better data storage
- **prisma/schema.prisma**: Updated to reflect final normalized schema with proper types, constraints, and indexes

**Documentation:**

- **MIGRATION_GUIDE.md**: General migration guide with step-by-step instructions, rollback procedures, and troubleshooting
- **prisma/README.md**: Schema evolution documentation, migration strategy, data type mapping, and future migration guidelines
- **prisma/PRODUCTION_MIGRATION.md**: Detailed production deployment guide with 30+ minute timeline, pre-flight checklist, code changes required, common issues, and success criteria

**Validation Scripts:**

- **prisma/scripts/pre-migration-checks.sql**: 14 comprehensive checks before migration
  - Verifies table existence and record counts (baseline)
  - Detects orphaned records (animals without breed/customer, notes without animal)
  - Identifies duplicate breed names that would violate unique constraint
  - Counts sentinel dates to be cleaned
  - Checks data that might be truncated
  - Reports current table engines, character sets, and indexes
  - Estimates table sizes for downtime calculation
- **prisma/scripts/post-migration-validation.sql**: 14 comprehensive checks after migration
  - Verifies InnoDB conversion and utf8mb4 character set
  - Confirms record counts match baseline (no data loss)
  - Validates column renames (sex, note_text, note_date)
  - Checks column type changes (INT UNSIGNED, VARCHAR changes)
  - Verifies foreign key constraints exist with RESTRICT rules
  - Confirms unique constraints and performance indexes created
  - Validates sentinel dates cleaned (now NULL)
  - Checks for data truncation issues
  - Samples data to verify integrity

**Utility Scripts:**

- **prisma/scripts/rollback.sql**: Emergency rollback script (restoring from backup strongly preferred)
  - Reverts column renames
  - Removes foreign keys and new indexes
  - Changes column types back to original
  - Optionally converts back to MyISAM and latin1 (not recommended)
- **prisma/scripts/QUICK_REFERENCE.md**: One-page quick reference with commands, timeline, code changes, and common issues

### Testing Improvements

- **e2e/homepage.spec.ts**: Comprehensive Next.js dev environment handling
  - Added Next.js compilation indicator detection and waiting
  - Implemented React hydration completion checks
  - Enhanced DOM stabilization with filtered mutation observer
  - Extended timeouts for lazy compilation (45s max wait, 3s stability)
  - Ensures reliable screenshot capture after full Next.js dev compilation

### Build System Fixes

- **src/lib/prisma.ts**: Created Prisma client configuration file
- **prisma/schema.prisma**: Updated with auto-increment ID fields and default output location
- **API Routes**: Fixed Next.js 15 async params compatibility and type mappings
- **API Routes**: Corrected `src/app/api/customers/[id]/route.ts` handler signatures to rely on inferred `RouteContext` for the second argument, fixing Next.js 15 type check failure
- **Type System**: Aligned interfaces between database schema and frontend components

### Linting Fixes Applied

- **src/app/page.tsx**: Removed unused imports and variables, added proper types
- **src/components/ErrorBoundary.tsx**: Removed unused imports
- **src/store/animalsStore.ts**: Added proper TypeScript interfaces, removed unused variables
- **src/store/customersStore.ts**: Added proper TypeScript interfaces
- **src/app/customers/add/page.tsx**: Added typed validation error handling and escaped apostrophe in JSX tips list to satisfy ESLint

### New Files Created

- `CHANGELOG.md`: Project changelog tracking all changes
- `FILETREE.md`: This file structure documentation
- `TODO.md`: Comprehensive UI redesign implementation plan with design system, components, and testing
- `SCORES.md`: Comprehensive search scoring algorithm documentation with diagrams and examples
- `ROUTES_COMPONENTS.md`: Routes, endpoints, pages, and components blueprint for MVP parity
- `TODO_ROUTES_COMPONENTS.md`: Executable checklist of MVP tasks with statuses
- `src/lib/prisma.ts`: Prisma client configuration and initialization

### UI Redesign Implementation (Completed)

The following components were created during the redesign implementation:

- `src/components/Header.tsx`: ✅ Persistent header with glassmorphic effect, hamburger menu, integrated search bar, and live date/time display
- `src/components/Sidebar.tsx`: ✅ Collapsible/resizable sidebar with pin functionality, navigation menu with active states, and drag-to-resize handle
- `src/components/EmptyState.tsx`: ✅ Empty state with search icon, messaging, and interactive suggestion tags
- `src/components/AnimalCard.tsx`: ✅ Modern card component with gradient accents, avatar initials, status badge, and hover animations
- `src/components/ResultsView.tsx`: ✅ Results container with grid/list view toggle and staggered animations

Files updated during redesign:

- `src/app/globals.css`: ✅ Complete design system with CSS variables, animated gradient background, and custom keyframes
- `src/app/layout.tsx`: ✅ Simplified layout with updated metadata
- `src/app/page.tsx`: ✅ Complete refactor to use new component architecture; Updated main content border radius; Fixed padding overrides; Updated to use unified search
- `src/components/Header.tsx`: ✅ Achieved visual parity with prototype; Fixed hamburger menu background; Removed border from date/time pill; Fixed search input padding and icon spacing; Fixed date/time pill padding; Updated placeholder for unified search
- `src/components/EmptyState.tsx`: ✅ Refined with ghost-style suggestion buttons, adjusted heading size to match prototype exactly; Fixed all padding overrides

Files updated for unified search:

- `src/app/api/animals/route.ts`: ✅ Implemented comprehensive unified search with relevance scoring across 8 fields; Added relevance score to API response
- `src/lib/validations/animal.ts`: ✅ Simplified validation schema to single query parameter
- `src/store/animalsStore.ts`: ✅ Updated to use new unified search endpoint; Added relevanceScore field to Animal interface
- `src/components/AnimalCard.tsx`: ✅ Added relevance score display to card view
- `src/components/ResultsView.tsx`: ✅ Added relevance score display to list view; Updated Animal interface
- `src/components/Header.tsx`: ✅ Added Enter key support for search submission

Legacy components:

- `src/components/SearchForm.tsx`: ✅ Removed (functionality integrated into Header component)
- `src/components/AnimalList.tsx`: To be deprecated (replaced by ResultsView component)
