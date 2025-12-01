- Next.js Suspense requirement: Wrapped `src/app/page.tsx` content in `<Suspense fallback={null}>` to satisfy `useSearchParams()` prerendering requirement on the home page. (2025-11-16)

# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Fixed

- **Daily Totals Page Layout** (2025-12-01):
  - Reverted chart grid layout from horizontal (side-by-side) to vertical (stacked) layout
  - Changed `lg:grid-cols-2` back to `lg:grid-cols-1` for Revenue Trends and Animals & Breeds graphs
  - Graphs now display full content area width, vertically stacked

- **ESLint Errors in Reports Module** (2025-12-01):
  - Removed unused `Period` type from `src/app/api/reports/analytics/route.ts`
  - Removed incomplete/unused path element with `x` variable from `src/app/reports/daily-totals/page.tsx`
  - Removed unused `idx` parameter from breed breakdown map in `src/app/reports/daily-totals/page.tsx`

### Changed

- **Animal Avatar Enhancement** (2025-11-30):
  - Created new `AnimalAvatar` component that displays breed-specific avatar images
  - Avatar images located at `public/images/animal-avatars/{breed_snake_case}_avatar.png`
  - Displays animal's first initial overlaid on breed image with text-stroke for visibility
  - Falls back to gradient placeholder if breed avatar image doesn't exist
  - Updated 6 locations: `AnimalCard.tsx`, `AssociatedAnimalsCard.tsx`, `ResultsView.tsx`, `customers/history/page.tsx`, `animals/[id]/page.tsx`, `animals/[id]/notes/page.tsx`

- **Sidebar Navigation Update** (2025-11-30):
  - Added "Database Backup" link to sidebar navigation menu
  - Positioned after "Customer History" with cloud-upload icon
  - Routes to `/admin/backup` with active state highlighting

### Added

- **OpenAPI Documentation Update** (2025-12-01):
  - Added 3 missing count endpoints: `/api/customers/{id}/animals/count`, `/api/animals/{id}/notes/count`, `/api/breeds/{id}/animals/count`
  - Updated Customer schema with stats fields: `totalNotesCount`, `earliestNoteDate`, `latestNoteDate`
  - Updated `DELETE /api/customers/{id}` with request body (`migrateToCustomerId`, `animalIds`) and response (`migratedAnimals`, `deletedAnimals`)
  - Updated `DELETE /api/breeds/{id}` with request body (`migrateToBreedId`) and response (`migratedAnimals`)
  - Total documented endpoints increased from 20 to 23

- **Dashboard Page** (2025-12-01):
  - Created new `/dashboard` page with stylized pill button navigation
  - Displays links to all major app features: Search, Add Customer, Manage Breeds, Daily Analytics, Customer History, Database Backup, API Docs
  - Each button uses brand colors (primary/secondary/accent/warning/success) with hover effects
  - Includes mascot image (CARTOON_DOG_7) with floating animation
  - Quick tips section at bottom of page
  - Sidebar "Dashboard" link now routes to `/dashboard` instead of `/`
  - Added `dashboard()` route helper to `src/lib/routes.ts`

- **Persistent Sidebar State** (2025-12-01):
  - Created `useSidebarState` hook in `src/hooks/useSidebarState.ts`
  - Sidebar pinned state now persists across page loads and navigation using localStorage
  - When user pins sidebar, it remains pinned when clicking links or viewing different pages
  - All 11 page components updated to use the shared hook
  - Ensures consistent sidebar experience throughout the application
  - Added `skipTransition` flag to prevent animation on initial page load when pinned
  - Sidebar now appears instantly when navigating with pinned state (no expand animation)

- **Hamburger Menu Pin Icon** (2025-12-01):
  - When sidebar is pinned, hamburger menu icon changes to a filled pushpin icon
  - Visual indicator shows users the sidebar is currently pinned
  - Pin icon has primary color background for clear visibility
  - Returns to hamburger/X animation when sidebar is unpinned

### Fixed

- **Swagger UI Deprecation Warning** (2025-12-01):
  - Suppressed `UNSAFE_componentWillReceiveProps` warning from swagger-ui-react's `ModelCollapse` component
  - Added useEffect hook in `/api/docs/page.tsx` to filter this specific console.error
  - Warning is a known library issue that doesn't affect functionality

- **Precommit Type-Check Exclusion** (2025-12-01):
  - Excluded `scripts/**/*` from `tsconfig.precommit.json`
  - Scripts directory contains standalone utilities with external dependencies (`@google/genai`, `mime`)
  - These dependencies are intentionally not part of the main project
  - Fixes `pnpm lint-staged` failing due to missing type declarations

- **Customer Statistics Calculation** (2025-12-01):
  - Fixed incorrect "Years Active" and "Total Visits" stats on customer detail page
  - Previous: Hardcoded placeholder values (10+ years, 50+ visits)
  - Now calculates from actual service notes data:
    - **Years Active**: Difference between earliest and latest note dates across all customer's animals
    - **Total Visits**: Count of all notes recorded against the customer's animals
  - Updated `/api/customers/[id]` to include `totalNotesCount`, `earliestNoteDate`, `latestNoteDate`
  - Updated `CustomerStatsCard` component with proper calculations
  - Shows "New" for customers with no service notes
  - Format: "9y 10m" for years and months, or "3 Months" for shorter periods

- **Sidebar Pinned Content Visibility** (2025-12-01):
  - Fixed issue where main content area was blank/invisible when sidebar was pinned
  - Root cause: CSS `.main-content` class with `overflow: hidden` combined with CSS-based margin shifting
  - Solution: Standardized all pages to use inline Tailwind classes for sidebar-pinned state
  - Updated pages: admin/backup, customer/[id], animals/[id], animals/[id]/notes, breeds
  - All pages now use consistent pattern: `ml-[calc(var(--sidebar-width)+1.5rem)]` when pinned
  - Removed dependency on CSS class `sidebar-pinned` and nested `.main-content` structure

- **Content Shifting When Sidebar Pinned** (2025-12-01):
  - Fixed issue where main content didn't shift right when sidebar was pinned
  - Root cause: Tailwind arbitrary value `ml-[calc(var(--sidebar-width)+1.5rem)]` wasn't generating CSS
  - Solution: Changed to inline styles for margin-left using `style={{ marginLeft: ... }}`
  - Added conditional transition: only animate margin when `skipTransition` is false
  - Prevents animation on page load/navigation - content appears instantly in correct position
  - Animation only triggers when user actively pins/unpins the sidebar
  - Header remains full-width (no shifting) as intended
  - Updated all 11 page files with consistent pattern
  - Pages: page.tsx, admin/backup, breeds, customer/[id], customer/[id]/animals, customer/[id]/newAnimal, customers/add, customers/history, animals/[id], animals/[id]/notes, reports/daily-totals

- **Search Whitespace Handling** (2025-12-01):
  - Fixed issue where leading/trailing whitespace in search queries caused no results
  - Example: ` 0475795732` (with leading space) now correctly finds the customer
  - Applied fix to both `/api/animals` and `/api/customers` search endpoints
  - Query is now trimmed before phone number detection and search condition building

- **Customer Delete Confirmation Modal with Selective Animal Rehoming** (2025-12-01):
  - Added GitHub-style delete confirmation modal for customers
  - Shows customer full name in confirmation title
  - Lists all orphaned animals with individual checkboxes for selective rehoming
  - Animals are selected by default for rehoming; unchecked animals are deleted with customer
  - "Select all" / "Deselect all" quick actions for animal checkboxes
  - Type-ahead search input for finding target customer (replaces dropdown)
  - Search filters customers by surname or first name as user types
  - Shows up to 10 matching results with click-to-select
  - Clear button (X) to reset selection and search again
  - Click-outside behavior closes the search dropdown
  - Warning message displayed when animals will be permanently deleted
  - Requires typing exact customer name to enable delete button
  - Delete button text updates dynamically (e.g., "Delete Customer & Rehome 3 Animals")
  - Updated DELETE `/api/customers/[id]` to accept `animalIds` array for selective migration
  - API returns both `migratedAnimals` and `deletedAnimals` counts
  - Success toast shows rehomed and deleted animal counts as applicable
  - Redirects to home page after successful deletion

- **Animal Delete Confirmation Modal** (2025-12-01):
  - Added GitHub-style delete confirmation modal for animals (same pattern as breeds)
  - Shows animal name in confirmation title
  - Displays service notes count with warning about cascade deletion
  - Requires typing exact animal name to enable delete button
  - Created API endpoint `/api/animals/[id]/notes/count` for notes count
  - Updated DELETE API to return `deletedNotes` count in response
  - Success toast shows how many notes were deleted with the animal

- **Breed Error Toast Notifications** (2025-12-01):
  - Duplicate breed errors now show as red Toast notification (same style as success)
  - All breed operations (create, update, delete) now use Toast for both success and error feedback
  - Removed inline red text error display in favor of consistent Toast notifications

- **Breed Delete Confirmation Fix** (2025-12-01):
  - Fixed bug where delete confirmation was skipped for breeds without animals
  - Created new API endpoint `/api/breeds/[id]/animals/count` to check animal count
  - Confirmation modal now ALWAYS shows, regardless of animal count
  - Users must type breed name to confirm even when no animals exist

- **Breed Table Cleanup** (2025-11-30):
  - Removed unnecessary "Category" column from breed listing table
  - Removed "All/Dogs/Cats/Other" filter buttons (not functional without category data)
  - Fixed avgtime display showing full ISO date (`1970-01-01T01:00:00.000Z`) instead of just time
  - Now displays avgtime in `HH:MM:SS` format (e.g., `01:00:00`)

- **Breed Delete Confirmation UX** (2025-11-30):
  - Replaced inline confirmation with floating modal positioned near clicked row
  - Modal floats above the table with dark backdrop overlay
  - Shows breed name prominently in the warning message
  - Requires typing the exact breed name to enable delete button
  - Checks for associated animals before allowing delete
  - If animals exist, shows count and migration dropdown with all other breeds
  - User must select a migration target breed before delete is enabled
  - DELETE API updated to support `migrateToBreedId` parameter for animal migration
  - Added escape key and backdrop click to cancel deletion
  - Auto-focuses the confirmation input for immediate typing

- **Breed Duplicate Name Prevention** (2025-11-30):
  - Added unique breed name validation to POST `/api/breeds` endpoint
  - Returns 409 Conflict with clear error message when duplicate name attempted
  - Case-insensitive check using MySQL `LOWER()` function
  - Added default `avgtime` of `01:00:00` (1 hour) when not provided
  - Added default `avgcost` using lowest existing breed cost when not provided
  - Updated `BreedForm.tsx` with helper text showing default values

- **Backup SQL Portability Fix** (2025-11-30):
  - Removed `--databases` flag from mysqldump command
  - Backup SQL no longer includes `CREATE DATABASE` or `USE` statements
  - Allows restoring backups to any database name for test-restore scenarios

- **Test Logos HTML File Fix** (2025-11-30):
  - Updated `test-logos.html` to populate image list via hardcoded array instead of invalid `fs/promises` import
  - Allows the file to be opened directly in browser or served statically to view generated logo overlays
  - Populated with 74 generated image filenames from `scripts/generated-images-20251130-190231`

### Added

- **Full Database Backup Implementation** (2025-11-30):
  - Implemented complete database backup system replacing stub at `/admin/backup`
  - Uses `mysqldump` for SQL dump with all tables, structure, data, routines, triggers
  - Compresses to ZIP format (level 9), files named `YYYYMMDD-HHmmss-backup.zip`
  - Auto-cleanup keeps only 5 most recent backups
  - API: POST/GET `/api/admin/backup`, GET `/api/admin/backup/download/[filename]`
  - Full UI with progress indicator, status messages, backup list, re-download capability
  - Added `archiver` package, `/backups` to `.gitignore`

- **Legacy Comparison Analysis Report** (2025-11-30):
  - Created comprehensive `LEGACY_COMPARISON_REPORT.md` documenting feature parity between legacy PHP system and Next.js replacement
  - Verified 100% of core features implemented (search, CRUD on all 4 tables, navigation)
  - Confirmed full CRUD operations on Customer, Animal, Breed, and Notes tables via API
  - Documented 11 enhancements over legacy system (modern UI, analytics, filters, statistics)
  - Identified 1 missing feature: Backup system (currently stub only)
  - Provided step-by-step test replication instructions for every feature
  - Mapped all legacy URLs to new Next.js routes
  - Confirmed database compatibility with 3,953 animals, 3,190 customers, 200+ breeds

- **AI Image Generation Script Enhancements** (2025-11-30):
  - Added resume functionality to `scripts/ai_image_generation.py`
  - Script now tracks progress in `generation_state.json` (output dir and last completed breed)
  - On startup, prompts user to resume previous session or start fresh
  - Automatically skips already completed breeds in resume mode
  - Added graceful error handling for interruptions (Ctrl+C) and API errors

### Added

- **Animal Detail Page Implementation** (2025-11-18):
