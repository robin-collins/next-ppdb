# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **GitHub Actions - Scheduler Container Build**
  - Updated `docker-publish.yml` to build both main application and scheduler containers
  - Both images tagged with consistent semantic versioning (`1.2.3`, `1.2`, `1`, `latest`)
  - Both images use matching commit SHA for SHA-based builds
  - Scheduler image published to `ghcr.io/<repo>-scheduler`
  - Added OCI-compliant labels (version, revision, created, title, description) to both images
  - Added build arguments for version info embedded in containers (`BUILD_VERSION`, `BUILD_COMMIT`, `BUILD_DATE`)
  - Both images signed with cosign for supply chain security
  - Added GitHub Actions workflow summary showing both images' tags and digests
  - Updated `release.yml` to include scheduler image pull command in release notes

- **Docker Compose Production Configuration**
  - Both `next-ppdb` and `scheduler` services now use production GHCR images by default
  - Image versions controlled via `APP_VERSION` environment variable
  - Local development build instructions commented with clear guidance
  - Updated `.env.example` with `APP_VERSION=0.9.4` matching current release

- **Automated .env Version Updates**
  - Scheduler now automatically updates `APP_VERSION` in `.env` after successful updates
  - Ensures manual `docker compose up` restarts use the correct (updated) version
  - Mounted `.env` file to scheduler container with read-write access
  - Added `update_env_version()` function to `execute-updates.sh`
  - Prevents accidental rollbacks when manually restarting containers

- **Scheduler Container Version Metadata**
  - Updated `docker/scheduler/Dockerfile` with build args for version info
  - Added OCI labels for container metadata
  - Added runtime environment variables: `SCHEDULER_VERSION`, `SCHEDULER_COMMIT`, `SCHEDULER_BUILD_DATE`

- **Main Application Container Version Metadata**
  - Updated `Dockerfile` with build args for version info in runner stage
  - Added OCI labels for container metadata
  - Added runtime environment variables: `APP_BUILD_VERSION`, `APP_BUILD_COMMIT`, `APP_BUILD_DATE`

- **Centralized MySQL/MariaDB SSL Compatibility**
  - Created `src/lib/mysql-utils.ts` with shared `getMysqlSslFlags()` helper
  - Provides `--skip-ssl` flag compatible with both MySQL and MariaDB clients
  - Used by backup routes, import system, and temp database management

### Fixed

- **Scheduled Backup MariaDB Compatibility**
  - Fixed `scheduled-backup/route.ts` using incompatible `--ssl-mode=DISABLED` flag
  - Now uses shared `getMysqlSslFlags()` helper returning `--skip-ssl`
  - MariaDB client (Debian default) doesn't support MySQL's `--ssl-mode` flag

### Changed

- **Docker Entrypoint - Enhanced Startup Pre-Checks**
  - Added comprehensive pre-requisite validation before starting Next.js server
  - Step 1: Validates DATABASE_URL environment variable (format and presence)
  - Step 2: Tests database connectivity with 30 retry attempts (1s between retries)
  - Step 3: Runs `prisma db push` for schema synchronization
  - Step 4: Logs final pre-flight status confirmation
  - Clear console output with timestamps and pass/fail indicators
  - Exits immediately (code 1) if any check fails with helpful troubleshooting tips
  - Uses `--skip-ssl` for MariaDB client compatibility

- **ARCHITECTURE.md - New Section 17: Startup & Setup Process**
  - Documented container startup pre-check sequence with flow diagram
  - Documented SetupGuard application-level checks with flow diagram
  - Added "Known Issues & Resolutions" section documenting SSL, cache, and bypass fixes
  - Documented Setup Wizard flow with import process steps

- **Local Docker Build Script**
  - Updated `build:docker` script in `package.json` to build both main app and scheduler containers
  - Now builds: `next-ppdb` (main app) and `next-ppdb-scheduler` (scheduler)

- **GitHub Actions Docker Workflow - Enhanced Version Tagging**
  - Added explicit semantic version tagging for container builds
  - Release `v1.2.3` now produces tags: `1.2.3`, `1.2`, `1`, and `latest`
  - Manual workflow dispatch produces SHA-based tags for traceability
  - Configured in `.github/workflows/docker-publish.yml`

- **Animal Details Page - Clickable Customer Card**
  - Made entire customer info card clickable to navigate to customer details page
  - Added hover effects (scale and shadow) for visual feedback
  - Added keyboard accessibility (Enter/Space to activate)
  - Button now visual-only; card handles navigation

- **Dashboard Page - Documentation Card Update**
  - Renamed "API Docs" card to "Application Docs"
  - Changed link from `/api/docs` to `/docs` (user documentation)
  - Updated icon to book icon for documentation
  - Updated description to "User guides and documentation"

- **SCHEDULED_TASKS.md Proposal - Major Revision (Round 2)**
  - **NO DATABASE SCHEMA CHANGES** - Critical MVP requirement enforced
  - Replaced Prisma `PendingUpdate` model with Valkey-based state storage (`src/lib/update-store.ts`)
  - All update state (pending, approved, executed, failed) stored in Valkey with TTLs
  - **Docker execution moved to scheduler container** - Next.js app no longer needs Docker socket access
  - Scheduler container has Docker socket for image pull, container restart, and rollback operations
  - **Automatic rollback strategy implemented**:
    - Pre-update database backup created before any changes
    - Previous image tag recorded for container rollback
    - On failure: container reverted to previous image, database restored if needed
    - Full rollback details documented in Section 13.8
  - **Email retry queue implemented** - Valkey-based queue with exponential backoff (Section 3.4)
  - Updated architecture diagram showing scheduler with Docker access
  - Removed `dockerode` dependency - scheduler uses Docker CLI directly
  - Added deployment steps (no database migration required)

- **SCHEDULED_TASKS.md Proposal - Enhancements (Round 3)**
  - **Valkey redundancy** - Added file-based fallback for critical state when Valkey unavailable (Section 2.3.1)
  - **GitHub release notes** - Added fetching from GitHub Releases API (Section 4.2)
  - **Sidebar update notification** - "Update Available" button placed above footer with version transition display
  - **Update approval modal** - Warning-colored modal showing release notes with markdown rendering, approve/cancel actions
  - **Testing methodology** - Comprehensive Section 14 added
  - New files: `UpdateApprovalModal.tsx`, `github-releases.ts`, `update-store-fallback.ts`, `e2e/scheduler.spec.ts`

- **SCHEDULED_TASKS.md Proposal - Notifications System (Round 4)**
  - **Notification storage in Valkey** - Status tracking (unread/read/archived) with 90-day archive TTL (Section 2.5.1)
  - **Header bell icon** - Dynamic colors based on notification type priority (error > warning > success > info)
  - **Notifications page** - Two collapsible sections: Current (expanded) and Archived (collapsed by default)
  - **Notification actions** - Mark as read, archive, delete
  - Updated Files Summary: 27 files to create, 6 files to modify
  - New files: `notification-store.ts`, `notifications/page.tsx`, notifications API routes

### Fixed

- **Database Import SSL Error - MariaDB Client Compatibility**
  - Changed `--ssl-mode=DISABLED` to `--skip-ssl` for MySQL client calls
  - MariaDB client (default on Debian Trixie) doesn't support MySQL's `--ssl-mode=DISABLED` flag
  - `--skip-ssl` works with both MySQL and MariaDB clients
  - **Affected Files:** `src/lib/setup/tempDb.ts`, `src/lib/import/rawImporter.ts`, `src/app/api/admin/backup/route.ts`

- **Setup Redirection Not Triggering**
  - Changed diagnostic cache TTL from infinite (for healthy status) to 60 seconds
  - Allows periodic re-evaluation when database state changes (e.g., tables emptied)
  - Removed referer-based bypass check that could cause incorrect guard bypass
  - Added debug logging to SetupGuard and diagnostics for troubleshooting

- **Scheduler Update Execution Script - Production Docker Compose Integration**
  - Fixed non-existent `/app` directory reference that caused silent update failures
  - Script now uses `docker compose -f /docker-compose.yml up -d --force-recreate` for proper container recreation
  - Added `recreate_container()` function for consistent update and rollback operations
  - Mount docker-compose.yml into scheduler container for compose access
  - Added `docker-cli-compose` package to scheduler Dockerfile

- **Sidebar Pending Update Notification - API Response Property Mismatch**
  - Fixed `fetchPendingUpdate` checking `data.currentUpdate` instead of `data.pending`
  - Pending update notification banner now displays correctly when updates are available

- **GHCR Environment Variable - Name Mismatch**
  - Fixed `ghcr.ts` reading `GHCR_PAT` while docker-compose provides `GHCR_TOKEN`
  - Library now accepts both `GHCR_TOKEN` (preferred) and `GHCR_PAT` (legacy) for compatibility
  - Version checks now properly authenticate with GHCR

- **Docker Compose - Production GHCR Image Configuration**
  - Updated `next-ppdb` service to use `ghcr.io/${GHCR_REPOSITORY}:${APP_VERSION}` image
  - Supports automated version updates via scheduler
  - Added comments documenting local development vs production configuration

- **GitHub Actions Release Workflow - Replaced Broken Action**
  - Replaced unavailable `justincy/github-action-npm-release@v2` with custom solution
  - Uses `softprops/action-gh-release@v2` (well-maintained action)
  - Detects version changes by comparing `package.json` version against latest git tag
  - Extracts changelog content for the release (from `[Unreleased]` or version section)
  - Collects commit messages since previous release
  - Added `force` input option for manual workflow dispatch
  - **Now chains Docker build** - release.yml calls docker-publish.yml via `workflow_call`
  - **Docker image reference in release notes** - Shows pull command and link to container registry
  - Configured in `.github/workflows/release.yml`

- **GitHub Actions Docker Workflow - Fixed Chained Trigger**
  - Added `workflow_call` trigger to allow release.yml to invoke it directly
  - This bypasses GitHub's limitation where GITHUB_TOKEN releases don't trigger other workflows
  - Added version input parameter for explicit tagging
  - Simplified tag generation using bash instead of complex expressions
  - Configured in `.github/workflows/docker-publish.yml`

## [0.9.0] - 2025-12-11

### Added

- **Documentation Page Styling Fixes**
  - Added comprehensive prose CSS customizations for documentation pages
  - Fixed vertical spacing between headings and paragraphs
  - Fixed list bullet/number indentation (now properly inside text body)
  - Fixed white text on white background for links and bold text
  - Added table styling with proper headers, borders, and hover effects
  - Added remark-gfm plugin to both docs page components for GFM table rendering
  - Styled blockquotes, code blocks, images, and horizontal rules

- **Sidebar Navigation Updates**
  - Added "Documentation" link to sidebar navigation with document icon

- **OpenAPI Documentation Updates**
  - OpenAPI spec version now dynamically reads from package.json (synchronized with app version)
  - Now includes 35 documented operations (up from 23)
  - Added missing endpoints: `/api/breeds/pricing`, `/api/reports/analytics`, `/api/reports/staff-summary`
  - Added admin endpoints: `/api/admin/backup` (GET list, POST create), `/api/admin/backup/download/{filename}`
  - Added health check endpoints: `/api/health` (GET, POST)
  - Added setup/import endpoints: `/api/setup/upload`, `/api/setup/import`
  - Added new tags: Health, Setup
  - Added HealthStatus schema for health check responses

- **Staff Workload Summary on Daily Totals Page**
  - New `extractStaffInitials()` function in `notes.service.ts` for extracting staff initials from notes
  - Supports price-before-initials pattern (e.g., `"short cut 7 $65 cc"` → `"CC"`)
  - Validates 2-3 alphabetic characters, returns uppercase, handles edge cases
  - New API endpoint `GET /api/reports/staff-summary?date=YYYY-MM-DD` returns daily staff work breakdown
  - Groups animals by staff initials with breed-level counts
  - Each animal counted once per staff member even with multiple notes
  - New `StaffWorkloadCard` component with color-coded staff cards
  - Integrated into daily-totals page with parallel data fetching
  - Staff summary included in printed report output

- **Improved Print Styles for Daily Totals Report**
  - Monochrome output (all text black, no colored backgrounds)
  - Compact layout with smaller fonts (7-10pt) and reduced padding
  - Tables without background colors for cleaner printing
  - Staff workload summary card styled for print
  - SVG icons hidden in print for cleaner output
  - Smaller page margins (10mm) for more content per page

### Changed

- **Animal Details Page Notes Display**
  - Staff initials extraction now uses centralized `extractStaffInitials()` function
  - Consistent behavior with daily totals staff summary

### Fixed

- Added `reference/**/*` to TypeScript and ESLint exclude lists to prevent checking non-codebase files

## [UNRELEASED] Production Hardening

### Security

- **Next.js Security Update (15.4.5 → 15.4.8)**
  - Updated Next.js to version 15.4.8 to address critical security vulnerability
  - Build verified successfully with no breaking changes

- **C1: Console.log Information Disclosure Fixed**
  - Replaced all `console.log` statements in API routes with structured pino logging
  - Added automatic sensitive data redaction (phone numbers, emails)
  - Debug logs now gated behind `DEBUG` environment variable
  - New files: `src/lib/logger.ts` (updated to use pino)
  - Files updated: All API routes in `src/app/api/`

- **C2: Rate Limiting Implemented**
  - Added rate limiting middleware using Valkey (Redis fork)
  - Created `src/lib/ratelimit.ts` with ioredis + rate-limiter-flexible
  - Created `src/lib/middleware/rateLimit.ts` with `withRateLimit()` wrapper
  - Rate limits: api=30/min, search=20/min, mutation=10/min
  - Applied to all API routes:
    - Animals routes (GET=search, POST=mutation)
    - Customers routes (GET=search, POST=mutation)
    - Breeds routes (GET=api, POST=mutation)
    - Notes routes (GET=api, POST/PUT/DELETE=mutation)
    - Reports routes (GET=api)
    - All [id] routes (animals, customers, breeds, notes)
  - Returns 429 with proper headers when limit exceeded
  - Falls back to in-memory limiting when Valkey unavailable
  - Dependencies added: `ioredis`, `rate-limiter-flexible`

- **C4: Environment Variable Validation**
  - Added Zod-based environment validation at startup
  - Created `src/lib/env.ts` with strict schema validation
  - Created `src/instrumentation.ts` for Next.js startup hook
  - Application now fails fast with clear error messages if config invalid

### Fixed

- **C3: Store Error Handling (both stores)**
  - Added `mutating` state flag to both `animalsStore.ts` and `customersStore.ts`
  - animalsStore mutations (updateAnimal, deleteAnimal, addNote, deleteNote) now:
    - Set `mutating: true` at start
    - Re-throw errors after setting error state
    - Use `finally` block to clear mutating flag
  - customersStore mutations (updateCustomer, deleteCustomer, deleteAnimal) now:
    - Set `mutating: true` at start
    - Re-throw errors after setting error state
    - Use `finally` block to clear mutating flag
  - Callers can now detect failures and handle appropriately
  - Updated `animals/[id]/page.tsx` with:
    - try/catch around all mutation calls
    - Toast notifications for success/error feedback
    - Buttons disabled during mutations with loading text
  - Verified `customer/[id]/page.tsx` already has comprehensive error handling:
    - try/catch around all mutation calls
    - Toast notifications for success/error feedback
    - Local loading states for button disabling

### Added

- New pino/pino-pretty logging dependencies for structured logging
- New ioredis and rate-limiter-flexible dependencies for rate limiting
- Valkey service added to docker-compose.yml (see v0.1.2-pre)

### Changed

- `src/lib/logger.ts` - Migrated from custom console-based to pino-based logging
- All API routes now use structured logging with automatic redaction
- Animals/Customers routes now have rate limiting protection

### Improved

- **I1: N+1 Query Pattern Optimization**
  - Optimized animal search API to use conditional pagination strategy
  - Small result sets (≤1000): fetch all, score in-memory for accurate relevance
  - Large result sets (>1000): use database-level pagination with skip/take
  - Added `search.inMemoryThreshold` config option (default: 1000)
  - Eliminates redundant count query for small datasets
  - Files: `src/app/api/animals/route.ts`, `src/lib/config.ts`

- **I2: Reduced Client-Side Rendering**
  - Converted 4 components from client to server components (smaller JS bundle):
    - `Breadcrumbs.tsx` - no hooks/handlers needed
    - `CustomerStatsCard.tsx` - pure data display
    - `StatsBar.tsx` - pure data display
    - `DailyTotalsCard.tsx` - pure data display
  - Verified `CustomerCard.tsx` already has no 'use client' directive
  - Assessed `AnimalCard.tsx` - kept as client (deeply interactive, minimal ROI to split)
  - Reduces JavaScript sent to browser for faster page loads

- **I3: Database Search Indexes**
  - Added indexes to customer table for faster search queries:
    - `ix_firstname` on firstname
    - `ix_phone1` on phone1
    - `ix_email` on email
  - Migration applied at deployment via `prisma migrate deploy`

- **I4: Service Layer (Completed)**
  - Created `src/services/animals.service.ts` - relevance scoring, phone normalization
  - Created `src/services/customers.service.ts` - name formatting, contact validation
  - Created `src/services/breeds.service.ts` - avgtime formatting, pricing calculations
  - Created `src/services/notes.service.ts` - note parsing, cost extraction
  - Created `src/services/index.ts` for centralized exports
  - All functions are pure and testable independently

- **I5: Repository Pattern (Completed)**
  - Created `src/repositories/types.ts` with interfaces (IAnimalRepository, etc.)
  - Created `src/repositories/animal.repository.ts` with search conditions builder
  - Created `src/repositories/customer.repository.ts` with search/CRUD operations
  - Created `src/repositories/breed.repository.ts` with animal count methods
  - Created `src/repositories/notes.repository.ts` with cascade delete support
  - All repositories export singleton instances for easy use

- **I8: Request Deduplication (Completed)**
  - Created `src/lib/requestCache.ts` with RequestCache class
  - In-flight request tracking prevents duplicate concurrent requests
  - Short-term caching (5s TTL) reduces redundant API calls
  - Cache key generators for type-safe key construction
  - Updated `animalsStore.ts` to use `animalCache.dedupe()` for search/fetch
  - Cache automatically invalidated on mutations (create, update, delete)

- **I6: Centralized Configuration**
  - Created `src/lib/config.ts` with typed, domain-grouped configuration
  - Exports: `database`, `server`, `valkey`, `logging`, `rateLimits`, `pagination`
  - Uses lazy-loaded getters for validated environment access
  - Updated `ratelimit.ts` to use centralized config

- **I9: Shared API Types**
  - Created `src/types/api.ts` with shared type definitions
  - Exports: `AnimalResponse`, `CustomerResponse`, `BreedResponse`, `NoteResponse`
  - Exports: `PaginationMeta`, `ApiError`, `ValidationError`
  - Exports: Request types (`CreateAnimalData`, `UpdateAnimalData`, etc.)
  - `animalsStore.ts` now imports types from shared module
  - Updated components to handle `Date | string` for JSON-serialized dates

- **I13: Dependency Updates**
  - Updated: zod 4.1.13, zustand 5.0.9, rimraf 6.1.2
  - Updated: @eslint/eslintrc 3.3.3, @types/react 19.2.7, lint-staged 16.2.7
  - Removed deprecated: @types/pino, @types/uuid (packages provide own types)

- **I14: Docker Configuration Refactor**
  - Replaced hardcoded credentials in `01-grant-privileges.sql` with dynamic `01-grant-privileges.sh` using environment variables
  - Created `quick-install.ps1` for one-line installation on Windows
  - Updated README.md with quick install instructions

### Fixed

- **Docker Build Failure with Environment Validation**
  - Environment validation was failing during Docker build (no DATABASE_URL during build phase)
  - Added build-phase detection via `NEXT_PHASE === 'phase-production-build'`
  - Schema now provides safe defaults during build, strict validation at runtime

## [Unreleased] - 2025-12-04

### Added

- Comprehensive ARCHITECTURE.md document with full system design documentation
  - 18 sections covering all template requirements
  - Mermaid diagrams: System Architecture, ERD, Deployment, API Contract, Request Lifecycle, Caching, Auth Flow, Security Layers, CI/CD Pipeline
  - Technology stack, data architecture, and design decisions
  - Based on DECISIONS.md source of truth
- Comprehensive DECISIONS.md document consolidating 47 documentation files into 8 categories
- Conflict resolution log tracking evolving decisions with codebase verification
- Date field default conflict verified: `1900-01-01` is the confirmed standard (MySQL 8.0 compatibility)

## [0.1.2] 2025-12-02

### Fixed

- **docker-entrypoint.sh**
  - Added `chmod +x` in the Dockerfile to make the script executable in the container.

## [0.1.1] 2025-12-02

### Fixed

- **Database Updates Cause Page Reload Flash** (2025-12-02):
  - Removed `loading: true` from all update/delete functions in both stores
  - Setting loading state caused pages to show "Loading..." which looked like a full reload
  - Updates are now seamless - API calls happen in the background
  - Data is silently refreshed without triggering the loading screen
  - Fixed functions in `src/store/animalsStore.ts`:
    - `updateAnimal`, `deleteAnimal`, `addNote`, `deleteNote`
  - Fixed functions in `src/store/customersStore.ts`:
    - `updateCustomer`, `deleteCustomer`, `deleteAnimal`

- **Prisma Schema Invalid Date Defaults** (2025-12-02):
  - Changed `@default(dbgenerated("'0000-00-00'"))` to `@default(dbgenerated("'1900-01-01'"))`
  - Affected fields: `animal.lastvisit`, `animal.thisvisit`, `notes.date`
  - MySQL 8.0 strict mode rejects `0000-00-00` as an invalid date
  - Using `1900-01-01` as sentinel value (obviously not a real grooming date)
  - Import process already handles dirty data from legacy database

- **Docker Missing Backups Directory** (2025-12-02):
  - Added `/app/backups` to `mkdir -p` command in Dockerfile
  - Same pattern as uploads/logs directories - must exist before app runs
  - Fixes "Directory nonexistent" error when creating backup files

- **Backup mysqldump SSL Error** (2025-12-02):
  - Added `--skip-ssl` to mysqldump command in `/api/admin/backup`
  - Same SSL issue as mysql CLI - internal Docker network doesn't need SSL
  - Improved error message to show actual error instead of generic "Is mysqldump installed?"
  - File: `src/app/api/admin/backup/route.ts`

- **Docker Missing mysqldump for Backups** (2025-12-02):
  - Added `mariadb-client` to Dockerfile apt-get install
  - `default-mysql-client` only provides `mysql` CLI, not `mysqldump`
  - `mariadb-client` includes full suite: mysql, mysqldump, mysqlcheck, etc.
  - Fixes "Database dump failed. Is mysqldump installed?" error in backup feature

- **Docker Build Missing PostCSS Config** (2025-12-02):
  - Added `COPY postcss.config.mjs .` to Dockerfile builder stage
  - Without this file, Tailwind CSS v4 utility classes were not generated during Docker build
  - Symptom: Deployed app had broken styling (oversized icons, missing layout CSS)
  - Root cause: `@tailwindcss/postcss` plugin requires `postcss.config.mjs` to process `@import 'tailwindcss'`

- **Docker Upload Permission Denied** (2025-12-02):
  - Added `mkdir -p /app/uploads /app/logs && chown -R nextjs:nodejs /app/uploads /app/logs` to Dockerfile
  - Creates writable directories before switching to non-root `nextjs` user
  - Fixes `EACCES: permission denied, mkdir '/app/uploads'` error during file upload

- **Docker Missing MySQL Client** (2025-12-02):
  - Added `default-mysql-client` to Dockerfile apt-get install
  - Required for raw SQL import process which uses `mysql` CLI to create temp databases and execute queries
  - Fixes `mysql: not found` error during database import

- **MySQL SSL Certificate Error in Docker** (2025-12-02):
  - Added `--skip-ssl` to all mysql CLI commands in:
    - `src/lib/setup/tempDb.ts` (4 commands)
    - `src/lib/import/rawImporter.ts` (2 commands)
  - Note: `--skip-ssl` works with both MySQL and MariaDB clients (Debian's `default-mysql-client` installs MariaDB client which doesn't support `--ssl-mode=DISABLED`)
  - Internal Docker network doesn't need SSL verification
  - Fixes SSL/TLS errors during import

- **MySQL User Missing CREATE DATABASE Privileges** (2025-12-02):
  - Added `docker/mysql-init/01-grant-privileges.sql` init script
  - Grants CREATE/DROP on `*.*` and ALL PRIVILEGES on `ppdb_import_%.*` to app user
  - Mounted via docker-compose.yml to `/docker-entrypoint-initdb.d`
  - Fixes `ERROR 1044 (42000): Access denied` when creating temp import databases

- **Database Tables Missing - Prisma Migrations Not Running** (2025-12-02):
  - Added Prisma CLI to production Docker image (`npm install -g prisma@6`)
  - Version pinned to v6.x to match project (v7.0 has breaking schema changes)
  - Copied prisma schema and migrations to runner stage
  - Created `docker/docker-entrypoint.sh` that runs `prisma migrate deploy` on startup
  - Tables are now automatically created when container starts
  - Fixes import failures due to missing breed/customer/animal/notes tables

### Added

- **Raw SQL Import with File-Based Audit Logging** (2025-12-02):
  - Replaced Prisma-based temp DB reading with raw SQL to handle dirty data (e.g., `0000-00-00` dates)
  - **Raw SQL Reader** (`src/lib/import/rawImporter.ts`):
    - Uses mysql CLI to read records from temp database as raw text
    - Bypasses Prisma's strict date parsing that fails on invalid MySQL dates
    - Validates and repairs data in memory before raw SQL writes to production
    - **CRITICAL**: Preserves original primary key IDs (breedID, customerID, animalID, noteID)
    - Uses raw SQL INSERT with explicit IDs instead of Prisma auto-increment
  - **File-Based Import Logging** (`src/lib/import/importLogger.ts`):
    - One log file per table (breed, customer, animal, notes)
    - Logs saved to `logs/import/[timestamp]/[table]_import_*.log`
    - Categories: IMPORTED (clean), REPAIRED (with changes), SKIPPED (reason), FAILED (error)
    - Every REPAIRED/SKIPPED/FAILED record shows original data values
    - Summary statistics at end of each log file
    - Log shows `ID: X → X` (same ID preserved, not changed)
  - **Real-time Progress Updates**:
    - Batch progress callback every 100 records during large imports
    - UI shows percentage and processed/total counts during import
    - Valid/Repaired/Skipped numbers display correctly after each table
  - **Improved Error Handling**:
    - Skipped records are NOT errors - import continues successfully
    - Only true failures (database errors) show as errors
    - Completion summary shows all table stats even with skipped records
    - Fixed SSE race condition: error banner no longer shows after successful import
    - Uses local closure variables to track completion state (avoids stale React state)
    - Error state cleared automatically on successful import completion
  - **Completion Summary Page**:
    - Displays import stats for all tables (imported, repaired, skipped)
    - Tables with skipped/repaired records show amber warning indicator
    - Clean imports show green checkmark
    - Links to log files for detailed audit trail
  - **Summary Report File** (`IMPORT_SUMMARY.txt`):
    - Quick-reference text file saved in logs folder after each import
    - Shows per-table stats: total, imported, repaired, orphaned
    - Orphaned records explained: animals with missing customerID, notes with missing animalID
    - Grand totals section for all tables
    - Import duration and timestamps
  - Import flow: Raw SQL → Temp DB → Raw SQL read → Validate → Raw SQL write → Production

- **Intelligent Onboarding & Startup Diagnostics System** (2025-12-02):
  - Comprehensive "fail fast, fail clearly" startup system for application initialization
  - **Diagnostic System** (`/api/health`):
    - 5 automated checks: DATABASE_URL validation, MySQL connection test, table existence, schema validation, data presence
    - Cached results (30s TTL) for performance
    - Clear pass/fail status with actionable error messages
  - **SetupGuard Server Component** (`src/components/SetupGuard.tsx`):
    - Server component wrapper in root layout enforces database health
    - Verbose console logging with emoji indicators (✅/❌) for each check
    - Automatic redirect to `/setup` when any check fails
    - Smart bypass for `/setup`, `/api/`, and static assets
  - **Middleware Enhancement** (`src/middleware.ts`):
    - Sets `x-pathname` header for SetupGuard route detection
    - Cookie-based setup completion tracking
  - **Setup Page** (`/setup`):
    - Multi-step wizard: Diagnostics → Upload → Import → Complete
    - Progress stepper UI with visual feedback
    - Welcoming, intuitive onboarding experience
  - **File Upload** (`/api/setup/upload`):
    - Accepts `.sql`, `.zip`, `.tar.gz`, `.tgz` files up to 100MB
    - Drag-and-drop with click fallback
    - Automatic archive extraction and SQL file detection
  - **Two-Stage Import System** (`/api/setup/import`):
    - Stage 1: Raw mysql client imports to temporary database (fast)
    - Stage 2: Raw SQL read → validation → Prisma write to production (thorough)
    - Server-Sent Events (SSE) for real-time progress streaming
  - **Comprehensive Data Remediation**:
    - Per-table, per-field documented repair strategies
    - Handles: truncation, invalid dates ('0000-00-00'), orphan records, invalid emails, duplicate breed names
    - "Unknown" breed auto-creation for unmapped breedIDs
    - Orphan animals/notes gracefully skipped with logging
  - **Verbose Progress Feedback**:
    - Real-time percentage, record counts per table
    - Color-coded log viewer (info, success, warning, error)
    - Statistics: valid/repaired/skipped counts
  - New files:
    - `src/lib/diagnostics/` - types.ts, checks.ts, index.ts
    - `src/lib/import/` - extractor.ts, remediation.ts, validator.ts, importer.ts, rawImporter.ts, importLogger.ts
    - `src/lib/setup/` - tempDb.ts
    - `src/app/api/health/route.ts`
    - `src/app/api/setup/upload/route.ts`
    - `src/app/api/setup/import/route.ts`
    - `src/app/setup/page.tsx`
    - `src/components/SetupGuard.tsx`
    - `src/components/setup/` - DiagnosticResults.tsx, FileUploader.tsx, ImportProgress.tsx, ImportLog.tsx
  - Dependencies added: `adm-zip`, `tar`, `uuid`

- **Breed Bulk Pricing Modification Feature** (2025-12-02):
  - New "Modify All Pricing" button in Breed Management page header
  - Animated expansion panel for configuring global pricing adjustments
  - Supports fixed amount (e.g., +$10) or percentage increase (e.g., +25%)
  - Individual breed pricing via "$" icon in Actions column for each breed
  - **Confirmation modal** requires typing to confirm:
    - Global updates: type "update all breed pricing"
    - Individual breed: type the breed name
  - Animal cost adjustment logic:
    - Animals with cost < breed avgcost: increased by same amount/percentage
    - Animals with cost = 0: unchanged (preserved)
    - Animals with cost > breed avgcost: difference preserved after breed increase
  - New API endpoint `POST /api/breeds/pricing` for bulk pricing updates
  - Returns detailed summary of all breeds and animals updated
  - Files: `src/app/api/breeds/pricing/route.ts`, `src/components/breeds/PricingModifier.tsx`, `src/components/breeds/BreedTable.tsx` (updated)

### Changed

- **Typography Update (v2.1):** Changed from Cormorant/DM Sans/Outfit to Lora/Rubik pairing
  - Display font: Cormorant → Lora (serif) for refined elegance
  - Body font: DM Sans → Rubik (sans-serif) for warm, friendly readability
  - UI/Accent font: Outfit → Rubik for consistency
  - Updated STYLE_GUIDE.md to reflect new typography system
  - Updated src/app/globals.css with new font imports and CSS variables
  - Applied new brand color palette (golden brown, teal green, aqua) from logo
  - Added paw print pattern overlay and updated background gradient
  - Enhanced animation keyframes (fadeInUp, fadeInDown, shimmer, spin, bounce, pulse, float)
- **Documentation Overhaul:** Completely rewrote README.md with comprehensive installation instructions for Bash and PowerShell, features list, and contributing guidelines.

### Added

- **Daily Totals Report Page** (2025-12-01):
  - New printable report page at `/reports/daily-totals` for end-of-day takings reconciliation
  - Date selector defaults to today, allows selecting any past date
  - Table displays: Animal name with owner name, Breed, and Cost
  - Summary footer shows total animals count and total income
  - Print button triggers browser print dialog with optimized print styles
  - Clean, minimal design focused on printability
  - Added to Sidebar navigation and Dashboard links
  - Enhanced API at `/api/reports/daily-totals` to accept date parameter and return detailed animal list
  - Files: `src/app/reports/daily-totals/page.tsx`, `src/app/api/reports/daily-totals/route.ts`, `src/app/globals.css` (print styles)

### Changed

- **Breed Management Save Icon** (2025-12-02):
  - Changed edit mode save button icon from circular reload arrow to floppy disk (save) icon
  - Updated button title/aria-label from "Update" to "Save" for better semantics
  - File: `src/components/breeds/BreedTable.tsx`

- **Search Result List View Redesign** (2025-12-02):
  - Complete redesign to compact single-line layout with maximum information density
  - **Two column layout**: Animal (2fr) | Customer & Contact (3fr)
  - **Animal column (clickable)**: `Avatar NAME Breed  color: XXX  cost: $XX  Last Visit: XXX YY` all on one line
    - NAME: Bold black
    - Breed: Primary orange color
    - Labeled format: "color: Red", "cost: $50", "Last Visit: Oct 21, 14"
    - Whitespace separation (no pipes)
    - Click navigates to animal details page
  - **Customer & Contact column (clickable)**: `SURNAME, firstname | Address | SUBURB | POSTCODE | PHONE1 | email | PHONE2 | PHONE3` all on one line
    - SURNAME: UPPERCASE bold black, firstname normal case gray
    - Address: Gray text
    - SUBURB: UPPERCASE teal/secondary color, bold
    - POSTCODE: Teal/secondary color, bold
    - PHONE1: Phone icon, teal (primary contact), click-to-call
    - email: Envelope icon, click-to-email
    - PHONE2/PHONE3: Phone icons, gray (secondary contacts), click-to-call
    - Pipe separators between elements
    - Click anywhere navigates to customer page
  - **Full row hover**: Hover effect fills entire row (no padding/gaps)
  - **Unified hover effects**: Both columns use same orange (`primary-light`) hover color while maintaining separate clickable areas
  - **Phone formatting**: Spaces for readability (0412 345 678) with icons
  - **Validation**: Filters "Unknown", empty, and "0" phone values
  - **Alternating row colors**: White/gray-100 for better contrast and scanability
  - **No "Unknown" placeholders**: Clean data display
  - Files: `src/components/ResultsView.tsx`

- **Search Result Card Redesign** (2025-12-01):
  - Prioritized essential information for staff efficiency based on user requirements
  - **Responsive horizontal layout**: Desktop shows 1/3 animal details | 2/3 customer details with vertical divider; mobile uses vertical stacking
  - **Animal name**: Increased from 18px to 24px (text-2xl), bold
  - **Breed**: Now displayed in primary brand color below animal name
  - **Color**: Shown in animal section (restored per user feedback)
  - **Customer name**: Increased to 18px, bold uppercase, with firstname in normal case
  - **Phone numbers**: All valid phones displayed; primary in teal, secondary/tertiary in dark grey
  - **Email**: Now displayed on cards with envelope icon, click-to-email enabled
  - **Location**: Suburb and postcode shown in teal (not tiny badges)
  - **Last visit**: Moved to subtle position in animal section
  - **Removed**: "Unknown" placeholders - fields now hidden when empty
  - Phone numbers formatted with spaces for readability (0412 345 678)
  - Click-to-call (`tel:`) and click-to-email (`mailto:`) links enabled
  - See `SEARCH-RESULT-CARDS.md` for full design specification
  - Files: `src/components/AnimalCard.tsx`

- **Dashboard Card Colors** (2025-12-01):
  - Changed card colors to checkerboard pattern (brown/teal alternating by row)
  - Row 1: Brown, Teal, Brown, Teal
  - Row 2: Teal, Brown, Teal, Brown

### Fixed

- **Customer Form Validation** (2025-12-01):
  - Improved email validation with robust regex pattern (requires domain with TLD, e.g., `name@example.com`)
  - Added client-side validation with real-time feedback on blur for email, surname, firstname, and phone fields
  - Phone validation now allows up to 11 digits (supporting international numbers) instead of 10
  - Form fields highlight with red border when validation fails
  - Error messages display below fields with clear instructions
  - Server returns field-level errors for better UX when validation fails
  - Added loading state to submit button during update
  - Files changed: `CustomerInfoCard.tsx`, `customer.ts` (validation), `customers/[id]/route.ts`, `customersStore.ts`

- **Customer History API** (2025-12-01):
  - Fixed TypeScript error: Changed `customer.town` to `customer.suburb` in address building logic

- **Breed avgcost validation** (2025-12-01):
  - Changed input step from "5" to "1" to allow any integer value for average cost
  - Fixed in both BreedForm (add) and BreedTable (edit) components

- **Customer delete with animal deletion option** (2025-12-01):
  - When deleting a customer with animals, users can now choose to delete animals instead of rehoming
  - Added checkbox to acknowledge animal deletion when no migration target is selected
  - Updated API to handle `deleteAnimals: true` flag for explicit animal deletion
  - Button text updates to show "Delete Customer & X Animal(s)" when acknowledging deletion

- **Delete note confirmation modal** (2025-12-01):
  - Replaced browser `confirm()` dialog with styled modal following DELETE_MODAL.md spec
  - Modal requires typing the note's date to confirm deletion
  - Red warning styling with icon, type-to-confirm input, and Cancel/Delete buttons
  - Delete button disabled until date is typed correctly

- **Service history note cards redesign** (2025-12-01):
  - Redesigned note display cards on animal details page
  - Date now at top left in italic primary color
  - Note text spans full width below date
  - Price ($XX) extracted and displayed in green
  - Technician code (2-3 uppercase letters at end) shown in pill badge with person icon
  - Trash icon for delete on the right side

- **Animal cost input and notes auto-cost** (2025-12-01):
  - Cost input on add/edit animal pages now only accepts integers (step=1 instead of 0.01)
  - When adding a note without a cost ($XX pattern), automatically adds the animal's cost
  - If note ends with uppercase word (like "CC"), cost is inserted before it
  - Otherwise cost is appended at the end
  - Example: "full clip 7 CC" becomes "full clip 7 $62 CC" if animal cost is 62

- **Customer form validation improvements** (2025-12-01):
  - Phone: Now accepts only digits (max 11 for international numbers)
  - Postcode: Must be exactly 4 digits (Australian format)
  - Email: Now uses `sane-email-validation` package with `isAsciiEmail()` for robust ASCII email validation
  - Applied to both Add Customer page and Customer Edit form
  - Input filtering prevents non-digit entry for phone/postcode fields
  - Real-time validation on blur

### Changed

- **Renamed Daily Totals to Analytics Dashboard** (2025-12-01):
  - Renamed page from `/reports/daily-totals` to `/reports/analytics`
  - Updated sidebar link text from "Daily Analytics" to "Analytics Dashboard"
  - Updated dashboard link and description
  - Updated route helpers in `src/lib/routes.ts`
  - Note: `/api/reports/daily-totals` API route preserved for future daily totals page

- **Daily Totals Page Layout** (2025-12-01):
  - Reverted chart grid layout from horizontal (side-by-side) to vertical (stacked) layout
  - Changed `lg:grid-cols-2` back to `lg:grid-cols-1` for Revenue Trends and Animals & Breeds graphs
  - Graphs now display full content area width, vertically stacked

- **ESLint Errors in Reports Module** (2025-12-01):
  - Removed unused `Period` type from `src/app/api/reports/analytics/route.ts`
  - Removed incomplete/unused path element with `x` variable from `src/app/reports/daily-totals/page.tsx`
  - Removed unused `idx` parameter from breed breakdown map in `src/app/reports/daily-totals/page.tsx`

- **Customer History Page** (2025-12-01):
  - Fixed: Page was using hardcoded mock data instead of fetching from API
  - Fixed: Inactive period logic now correctly filters customers whose animals haven't visited in 12/24/36+ months
  - Changed: One row per customer with multiple animals displayed horizontally (instead of one row per animal)
  - Added: Pagination with First/Prev/Next/Last buttons
  - Added: Records per page selection (10, 25, 50, 100)
  - Added: Stats showing total customers, total animals, and oldest visit date
  - Added: Click row to navigate to customer detail page, click animal to navigate to animal detail page
  - API updated at `/api/customers/history` to return customer-grouped data with pagination support

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
- Next.js Suspense requirement: Wrapped `src/app/page.tsx` content in `<Suspense fallback={null}>` to satisfy `useSearchParams()` prerendering requirement on the home page. (2025-11-16)
