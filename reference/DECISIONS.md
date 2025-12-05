# DECISIONS.md

**Consolidated Decision Record**  
**Last Updated:** 2025-12-04T22:45:00+10:30

This document consolidates all decisions from 47 project documentation files, organized into eight primary categories. For decisions that evolved over time, the final confirmed state is indicated.

---

## Table of Contents

1. [Database Strategy & Migration](#1-database-strategy--migration)
2. [Architecture & Code Organization](#2-architecture--code-organization)
3. [UI/UX & Design System](#3-uiux--design-system)
4. [Routing & Navigation](#4-routing--navigation)
5. [API & Business Logic](#5-api--business-logic)
6. [Infrastructure & Deployment](#6-infrastructure--deployment)
7. [Testing & Quality Assurance](#7-testing--quality-assurance)
8. [Workflows & Governance](#8-workflows--governance)

---

## 1. Database Strategy & Migration

### From AGENTS.md

#### Database & Prisma

- **Decision:** Model changes start in `prisma/schema.prisma`.
- **Decision:** Generated client mirrors schema changes in `src/generated/prisma`.
- **Source:** `AGENTS.md` (Lines 10)

#### Database Workflow

- **Decision:** Regenerate clients with `pnpm prisma generate` after schema changes.
- **Decision:** Review diff in `src/generated/prisma`.
- **Decision:** Apply pending migrations locally before review.
- **Source:** `AGENTS.md` (Lines 38)

#### Configuration

- **Decision:** Secrets are kept in `.env`.
- **Decision:** New keys must be documented.
- **Source:** `AGENTS.md` (Lines 38)

### From CHANGELOG.md

#### Database Configuration

- **Decision:** Changed default date values from `'0000-00-00'` to `'1900-01-01'` for MySQL 8.0 compatibility.
- **Decision:** Added `mariadb-client` to Dockerfile to provide `mysqldump`.
- **Decision:** Added `--skip-ssl` to mysql commands in Docker environment.
- **Decision:** Run `prisma migrate deploy` on container startup via `docker-entrypoint.sh`.
- **Source:** `CHANGELOG.md` (Lines 173-231)

#### Import System Strategy

- **Decision:** Use Raw SQL Import strategy to handle "dirty data" (e.g., invalid dates).
- **Decision:** Bypass Prisma for reading temp DB; use `mysql` CLI.
- **Decision:** Preserve original primary key IDs using raw SQL INSERTs.
- **Decision:** Implement file-based audit logging for imports.
- **Source:** `CHANGELOG.md` (Lines 237-251)

### From CLAUDE.md

#### Database Layer

- **Decision:** Generated Prisma Client lives in `src/generated/prisma/` (NOT `node_modules`).
- **Decision:** Singleton Prisma client provided by `src/lib/prisma.ts`.
- **Decision:** Prisma commands use wrapper script `scripts/prisma-env.js` for environment variable expansion.
- **Source:** `CLAUDE.md` (Lines 63, 81-82)

#### Migration Philosophy

- **Decision:** Application MUST work as a drop-in replacement for existing PHP app with ZERO database modifications.
- **Constraint:** Database schema defined by original SQL files in `reference/PPDB/*.sql` must remain unchanged.
- **Source:** `CLAUDE.md` (Lines 196-198)

#### Data Handling

- **Decision:** `customer.postcode` is `smallint(4)` (INTEGER), not string.
- **Decision:** Date fields use `'0000-00-00'` defaults (invalid but present). ⚠️ **See Conflict Log**
- **Decision:** Handle data conversions (e.g., int postcode -> string display) in the APPLICATION layer.
- **Source:** `CLAUDE.md` (Lines 200-211)

#### Phased Migration Strategy

- **Decision:** Phase 1: No DB mods, handle dirty data in app.
- **Decision:** Phase 2: Optional cleanup scripts (after backup).
- **Decision:** Phase 3: Schema improvements (future).
- **Source:** `CLAUDE.md` (Lines 215-231)

### From docs/MIGRATION_GUIDE.md

#### Migration Automation

- **Decision:** Migration process is fully automated via the application's `/setup` page.
- **Decision:** Manual execution of migration scripts is deprecated for standard deployments.
- **Source:** `docs/MIGRATION_GUIDE.md` (Lines 4)

#### Schema Normalization During Import

- **Decision:** Import raw SQL dump into a temporary staging area.
- **Decision:** Normalize schema during import:
  - Convert `MyISAM` tables to `InnoDB`.
  - Update character sets to `utf8mb4`.
  - Fix invalid dates (e.g., `0000-00-00` becomes `NULL`). ⚠️ **See Conflict Log**
  - Standardize column names (e.g., `SEX` -> `sex`).
- **Decision:** Run integrity checks after transformation.
- **Source:** `docs/MIGRATION_GUIDE.md` (Lines 18-24)

### From docs/PRODUCTION_DEPLOYMENT.md

#### Phase 1: Preparation (Legacy App)

- **Decision:** Perform full `mysqldump` of legacy database before migration.
- **Decision:** Stop legacy application services to prevent data inconsistency.
- **Source:** `docs/PRODUCTION_DEPLOYMENT.md` (Lines 18-32)

#### Phase 2: Installation (New App)

- **Decision:** Clone repository to production server.
- **Decision:** Create `.env` from `.env.example`.
- **Decision:** Required configuration: `MYSQL_ROOT_PASSWORD`, `MYSQL_PASSWORD`, `DOMAIN`.
- **Source:** `docs/PRODUCTION_DEPLOYMENT.md` (Lines 46-67)

#### Phase 3: Launch

- **Decision:** Use `docker-compose up -d` to start the application stack.
- **Source:** `docs/PRODUCTION_DEPLOYMENT.md` (Lines 76)

#### Phase 4: Onboarding & Data Migration

- **Decision:** Use built-in setup wizard accessible at `/setup`.
- **Decision:** Upload legacy SQL backup file via UI.
- **Decision:** Automated process handles import, schema normalization, and validation.
- **Source:** `docs/PRODUCTION_DEPLOYMENT.md` (Lines 89-100)

### From FAILURELOG.md

#### Database Schema Fixes

- **Decision:** `notes.noteID` column must have `AUTO_INCREMENT` attribute.
- **Decision:** Apply migration `prisma/migrations/fix_notes_autoincrement.sql` to fix missing auto-increment.
- **Source:** `FAILURELOG.md` (Lines 176-183)

#### Docker Database Configuration

- **Decision:** Use `1900-01-01` as the default value for date fields instead of `0000-00-00`.
- **Reason:** Compatibility with MySQL 8.0 strict mode.
- **Source:** `FAILURELOG.md` (Lines 240-248)

#### Deployment Strategy

- **Decision:** Use `prisma db push` for creating tables in fresh environments (Docker).
- **Source:** `FAILURELOG.md` (Lines 222)

### From prisma/README.md

#### Schema Evolution

- **Decision:** Migrate storage engine from MyISAM to InnoDB for ACID compliance and crash recovery.
- **Decision:** Migrate character set from latin1 to utf8mb4 for full Unicode support.
- **Decision:** Upgrade ID fields from MEDIUMINT to INT UNSIGNED.
- **Decision:** Change date handling from sentinel values ('0000-00-00') to standard SQL NULL.
- **Source:** `prisma/README.md` (Lines 20-24)

#### Table-Specific Changes: Breed

- **Decision:** Add UNIQUE constraint to `breedname`.
- **Decision:** Fix NULL handling for `avgtime`.
- **Source:** `prisma/README.md` (Lines 84-86)

#### Table-Specific Changes: Customer

- **Decision:** Increase VARCHAR sizes for name and address fields.
- **Decision:** Change `postcode` from SMALLINT to VARCHAR(10).
- **Source:** `prisma/README.md` (Lines 93-98)

#### Table-Specific Changes: Animal

- **Decision:** Rename `SEX` column to `sex` (lowercase).
- **Decision:** Change `colour` from TEXT to VARCHAR(100).
- **Decision:** Change `cost` from SMALLINT to INT.
- **Decision:** Add indexes: `ix_animalname`, `ix_breedID`, `ix_customerID`.
- **Source:** `prisma/README.md` (Lines 107-117)

#### Table-Specific Changes: Notes

- **Decision:** Rename `notes` column to `note_text`.
- **Decision:** Rename `date` column to `note_date`.
- **Source:** `prisma/README.md` (Lines 125-126)

#### Foreign Key Constraints

- **Decision:** Implement full referential integrity.
- **Decision:** Use `RESTRICT` constraint for both UPDATE and DELETE operations.
- **Constraint:** Application must handle deletion of records with dependencies (prevent, soft delete, or cascade).
- **Source:** `prisma/README.md` (Lines 22, 133-139)

#### Production Migration Workflow

- **Decision:** Sequence: Backup -> Pre-migration checks -> `prisma migrate deploy` -> Post-migration validation -> Regenerate Client.
- **Source:** `prisma/README.md` (Lines 61-76)

#### Rollback Strategy

- **Decision:** Restore from backup -> Mark migration rolled back -> Revert schema file -> Regenerate Client.
- **Source:** `prisma/README.md` (Lines 185-197)

### From prisma/PRODUCTION_MIGRATION.md

#### Pre-Deployment Requirements

- **Decision:** Requirements: Full backup, Staging test, App code update, Maintenance window, Rollback plan, DB user privileges, Disk space, MySQL 8.0+.
- **Source:** `prisma/PRODUCTION_MIGRATION.md` (Lines 9-17)

#### 10-Step Migration Process

- **Decision:** Step 1: Create timestamped backup using `mysqldump --single-transaction`.
- **Decision:** Step 2: Run pre-migration checks (`prisma/scripts/pre-migration-checks.sql`).
- **Decision:** Step 3: Put application in maintenance mode (stop service).
- **Decision:** Step 4: Apply migration using `pnpm prisma migrate deploy`.
- **Decision:** Step 5: Run post-migration validation (`prisma/scripts/post-migration-validation.sql`).
- **Decision:** Step 6: Regenerate Prisma Client (`pnpm prisma generate`).
- **Decision:** Step 7: Deploy updated application code.
- **Decision:** Step 8: Test application (smoke tests, manual checklist).
- **Decision:** Step 9: Bring application online.
- **Decision:** Step 10: Monitor logs and database performance.
- **Source:** `prisma/PRODUCTION_MIGRATION.md` (Lines 29-270)

#### Application Code Updates Required

- **Decision:** Update column references: `SEX` → `sex`, `notes` → `note_text`, `date` → `note_date`.
- **Decision:** Update types: `postcode` becomes `string | null`.
- **Decision:** Remove sentinel date handling (replace with standard NULL checks).
- **Decision:** Handle Foreign Key restrictions (check dependencies before delete).
- **Source:** `prisma/PRODUCTION_MIGRATION.md` (Lines 155-216)

#### Rollback Options

- **Decision:** Quick Rollback: Restore database from backup and revert application code.
- **Decision:** Partial Rollback: Use `prisma/scripts/rollback.sql` to reverse specific schema changes.
- **Source:** `prisma/PRODUCTION_MIGRATION.md` (Lines 284-321)

### From prisma/scripts/COMPREHENSIVE_DATA_CLEANUP.md

#### Schema Mismatches Identified

- **Decision:** Identified type mismatches: `postcode` (smallint vs String), `colour` (text vs String?), dates (sentinel vs DateTime?).
- **Decision:** Identified size mismatches: `surname`, `firstname`, `animalname` (DB size < Prisma size).
- **Source:** `prisma/scripts/COMPREHENSIVE_DATA_CLEANUP.md` (Lines 7-20)

#### 4-Phase Cleanup Strategy

- **Decision:** Phase 1: Data Type Conversions (postcode to varchar, colour to varchar, dates to NULL).
- **Decision:** Phase 2: Data Cleanup (Fix invalid dates, convert numeric postcodes, handle empty colours).
- **Decision:** Phase 3: Add Constraints (Date checks, Postcode format).
- **Decision:** Phase 4: Update Application Layer (Zod validation, Prisma schema).
- **Source:** `prisma/scripts/COMPREHENSIVE_DATA_CLEANUP.md` (Lines 30-52)

#### Cleanup Execution Order

- **Decision:** Sequence: Backup -> Data Conversions -> Alter Columns -> Add Constraints -> Update Schema -> Regenerate Client -> Test.
- **Source:** `prisma/scripts/COMPREHENSIVE_DATA_CLEANUP.md` (Lines 56-62)

### From prisma/scripts/MIGRATION_STRATEGY.md

#### Drop-in Replacement Philosophy

- **Decision:** Application must work as a drop-in replacement for the existing PHP application.
- **Constraint:** ZERO database modifications required for initial deployment.
- **Source:** `prisma/scripts/MIGRATION_STRATEGY.md` (Lines 3-5)

#### Phase 1: Initial Deployment Schema

- **Decision:** Prisma schema matches production database EXACTLY (as-is).
- **Decision:** Match exact column types (`postcode` as Int, `colour` as String).
- **Decision:** Match exact field sizes.
- **Source:** `prisma/scripts/MIGRATION_STRATEGY.md` (Lines 35-39)

#### Application Layer Data Handling

- **Decision:** Handle data conversions in TypeScript/JavaScript (e.g., postcode to string, invalid date handling).
- **Decision:** Transform data at API boundaries (accept/return modern formats, convert for storage).
- **Decision:** Use permissive Zod validation (allow historical data quirks).
- **Source:** `prisma/scripts/MIGRATION_STRATEGY.md` (Lines 43-72)

#### Phase 2: Post-Deployment Cleanup (Optional)

- **Decision:** Run cleanup scripts ONLY after successful deployment and testing.
- **Decision:** Sequence: Backup -> Fix invalid dates (`fix-invalid-dates.mjs`) -> Add date constraints (`add-date-constraints.mjs`).
- **Decision:** Skip `comprehensive-cleanup.mjs` initially as it violates the drop-in requirement.
- **Source:** `prisma/scripts/MIGRATION_STRATEGY.md` (Lines 76-106)

#### Phase 3: Future Schema Enhancements

- **Decision:** Create proper migrations for:
  - Postcode expansion (VARCHAR(10)).
  - Field size increases.
  - Proper defaults (NULL instead of sentinel values).
- **Source:** `prisma/scripts/MIGRATION_STRATEGY.md` (Lines 115-134)

### From prisma/scripts/QUICK_REFERENCE.md

#### Source of Truth

- **Decision:** Adopt a "Drop-in Replacement" strategy.
- **Constraint:** ZERO database modifications allowed for initial deployment.
- **Decision:** The production database (defined in `reference/PPDB/*.sql`) is the absolute source of truth.
- **Source:** `prisma/scripts/QUICK_REFERENCE.md` (Lines 7-20)

#### Type Mismatch Handling

- **Decision:** `postcode` is `smallint(4)` in DB -> Handled as `Int` in Prisma -> Converted to string in Application Layer.
- **Decision:** `colour` is `text NOT NULL` in DB -> Handled as `String` in Prisma.
- **Decision:** Dates can be `'0000-00-00'` -> Handled as `DateTime` in Prisma (accepting invalid defaults initially).
- **Source:** `prisma/scripts/QUICK_REFERENCE.md` (Lines 26-51)

#### Postcode Application Logic

- **Decision:** Display logic for postcode: `customer.postcode?.toString() || ''`.
- **Decision:** Input logic for postcode: `parseInt(inputPostcode) || 0`.
- **Source:** `prisma/scripts/QUICK_REFERENCE.md` (Lines 57-60)

#### Script Usage Guidelines

- **Decision:** Use `fix-invalid-dates.mjs` and `add-date-constraints.mjs` only AFTER successful deployment.
- **Decision:** Do NOT use `comprehensive-cleanup.mjs` for initial deployment as it violates the drop-in requirement.
- **Source:** `prisma/scripts/QUICK_REFERENCE.md` (Lines 69-89)

---

## 2. Architecture & Code Organization

### From AGENTS.md

#### Directory Structure

- **Decision:** Core Next.js routes and layouts are located in `src/app`.
- **Decision:** API handlers are nested under `src/app/api`.
- **Decision:** Reusable UI components are located in `src/components`.
- **Decision:** Domain utilities are located in `src/lib`.
- **Decision:** Zustand stores are located in `src/store`.
- **Decision:** Static assets are kept in `public`.
- **Decision:** Long-form notes or data drops are kept in `reference` and `reports`.
- **Source:** `AGENTS.md` (Lines 10)

#### Naming Conventions

- **Decision:** React components and stores use PascalCase filenames (e.g., `UserTable.tsx`).
- **Decision:** Helpers use camelCase modules.
- **Decision:** Prefer named exports unless a file exposes a single entry point.
- **Source:** `AGENTS.md` (Lines 18)

#### Formatting & Linting

- **Decision:** Prettier configuration: `tabWidth: 2`, `singleQuote: true`, `semi: false`.
- **Decision:** Tailwind classes are sorted via plugin.
- **Decision:** ESLint extends Next.js configuration; warnings must be fixed, not suppressed.
- **Source:** `AGENTS.md` (Lines 18)

### From CHANGELOG.md

#### Architecture Patterns

- **Decision:** Implemented Service Layer (`src/services/`) for business logic.
- **Decision:** Implemented Repository Pattern (`src/repositories/`) for data access.
- **Decision:** Centralized configuration in `src/lib/config.ts`.
- **Decision:** Shared API types in `src/types/api.ts`.
- **Source:** `CHANGELOG.md` (Lines 102-139)

#### Performance Optimization

- **Decision:** Implemented conditional pagination for animal search.
- **Decision:** Strategy: In-memory scoring for ≤1000 results, DB-level pagination for >1000.
- **Decision:** Converted `Breadcrumbs`, `CustomerStatsCard`, `StatsBar`, `DailyTotalsCard` to Server Components.
- **Decision:** Added database indexes: `ix_firstname`, `ix_phone1`, `ix_email`.
- **Decision:** Implemented request deduplication with short-term (5s TTL) caching.
- **Source:** `CHANGELOG.md` (Lines 77-121)

### From CLAUDE.md

#### State Management

- **Decision:** Zustand stores (`animalsStore.ts`, `customersStore.ts`) persist `searchParams` and `selectedAnimal` to `localStorage`.
- **Source:** `CLAUDE.md` (Lines 106, 166)

#### Development Constraints

- **Decision:** Do not import Prisma from `@prisma/client`.
- **Decision:** All interactive components need `'use client'`.
- **Source:** `CLAUDE.md` (Lines 297-298)

---

## 3. UI/UX & Design System

### From AGENTS.md

#### Button Styling Standards

- **Decision:** "Colored Pill Buttons" style for all primary/action buttons.
- **Decision:** Base state: `rounded-lg border-2 border-transparent transition-all duration-200`.
- **Decision:** Hover state: `hover:scale-110 hover:shadow-md`.
- **Decision:** Hover border: Darker shade of background color.
- **Decision:** Hover background: Slightly lighter/different shade.
- **Source:** `AGENTS.md` (Lines 22-26)

#### Notifications

- **Decision:** Use animated, temporary Toast notifications instead of browser alerts.
- **Decision:** Duration: 3s for standard, 15s for important info/success.
- **Decision:** Positioning: Top-center, floating over content.
- **Decision:** Animation: Smooth fade-in/fade-out.
- **Decision:** Layout: Must not shift page layout.
- **Source:** `AGENTS.md` (Lines 42-46)

### From CHANGELOG.md

#### UI Features

- **Decision:** Redesigned Search Result List View to compact single-line layout.
- **Decision:** Redesigned Search Result Cards to prioritize essential info.
- **Decision:** Implemented Dashboard Page (`/dashboard`) as main hub.
- **Decision:** Implemented persistent sidebar state using `localStorage`.
- **Source:** `CHANGELOG.md` (Lines 372-538)

#### Onboarding

- **Decision:** Implemented Intelligent Onboarding & Startup Diagnostics system.
- **Decision:** Automated health checks for DB connection, schema, etc.
- **Source:** `CHANGELOG.md` (Lines 276-279)

### From CLAUDE.md

#### Layout & Design

- **Decision:** Glassmorphic UI with animated gradients (15s cycle).
- **Decision:** Sidebar behavior: Pinned on desktop, overlay on mobile/tablet.
- **Decision:** Sidebar is resizable (200-500px) via drag handle, updating `--sidebar-width`.
- **Source:** `CLAUDE.md` (Lines 124, 171-173)

#### Notifications (CLAUDE.md)

- **Decision:** Use animated, temporary Toast notifications instead of browser alerts.
- **Decision:** Duration: 3s standard, 15s important.
- **Decision:** Position: Top-center.
- **Source:** `CLAUDE.md` (Lines 305-307)

#### Button Styling (CLAUDE.md)

- **Decision:** "Colored Pill Buttons" for primary actions.
- **Decision:** Hover state: Scale 1.1, shadow-md, darker border, lighter background.
- **Source:** `CLAUDE.md` (Lines 288-292)

---

## 4. Routing & Navigation

### From CLAUDE.md

#### Routing Standards

- **Decision:** All routing must follow standards in `ROUTING_ENFORCEMENT.md` and `ROUTES.md`.
- **Decision:** Navigation MUST use route helpers from `src/lib/routes.ts`.
- **Constraint:** No hardcoded route strings allowed.
- **Source:** `CLAUDE.md` (Lines 18-24)

---

## 5. API & Business Logic

### From CHANGELOG.md

#### Security & Logging

- **Decision:** Replaced `console.log` with structured `pino` logging in all API routes.
- **Decision:** Implemented automatic sensitive data redaction (phone numbers, emails).
- **Decision:** Debug logs gated behind `DEBUG` environment variable.
- **Source:** `CHANGELOG.md` (Lines 12-15)

#### Rate Limiting

- **Decision:** Implemented rate limiting using Valkey (Redis fork).
- **Decision:** Limits: API=30/min, Search=20/min, Mutation=10/min.
- **Decision:** Applied to all API routes (Animals, Customers, Breeds, Notes, Reports).
- **Decision:** Fallback to in-memory limiting when Valkey is unavailable.
- **Source:** `CHANGELOG.md` (Lines 19-32)

#### Validation

- **Decision:** Implemented Zod-based environment variable validation at startup.
- **Decision:** Application fails fast if configuration is invalid.
- **Source:** `CHANGELOG.md` (Lines 35-39)

### From CLAUDE.md

#### API Layer

- **Decision:** Animals API implements relevance-ranked search (Exact match=100, Starts with=80, Contains=50, Fuzzy=30).
- **Decision:** Phone number searches are normalized (strips formatting) before comparison.
- **Source:** `CLAUDE.md` (Lines 92-94, 152-160)

---

## 6. Infrastructure & Deployment

### From AGENTS.md

#### Build Commands

- **Decision:** Use `pnpm dev` for the Turbopack dev server on port 3000.
- **Decision:** Use `pnpm build` to produce optimized bundles.
- **Decision:** Use `pnpm start` to serve optimized bundles.
- **Decision:** Use `pnpm type-check`, `pnpm lint`, and `pnpm fmt:check` for validation.
- **Decision:** Use `pnpm check` to chain the validation trio.
- **Decision:** Use `pnpm lint:fix` or `pnpm fmt` for automated fixes.
- **Source:** `AGENTS.md` (Lines 14)

### From README.md

#### Technology Stack

- **Decision:** Use Next.js Framework for frontend and API.
- **Decision:** Use MySQL as the relational database.
- **Decision:** Use Traefik as Reverse Proxy for SSL and routing.
- **Decision:** Use Docker for containerization.
- **Decision:** Use phpMyAdmin for database management.
- **Source:** `README.md` (Lines 7-11)

#### Endpoints

- **Decision:** Main application accessible at `https://next-ppdb.yourdomain.com`.
- **Decision:** Traefik Dashboard accessible at `https://traefik.yourdomain.com`.
- **Decision:** phpMyAdmin accessible at `https://db.yourdomain.com`.
- **Source:** `README.md` (Lines 62-64)

### From docs/RELEASES.md

#### Versioning Strategy

- **Decision:** Follow Semantic Versioning (SemVer): `MAJOR.MINOR.PATCH`.
- **Source:** `docs/RELEASES.md` (Lines 12)

#### Release Preparation

- **Decision:** Update `CHANGELOG.md` by moving `[Unreleased]` changes to a new version section.
- **Decision:** Bump `version` field in `package.json`.
- **Decision:** Commit changes with message format `chore: release vX.Y.Z`.
- **Source:** `docs/RELEASES.md` (Lines 22-33)

#### GitHub Release Process

- **Decision:** Create a new tag matching the version (e.g., `v1.0.0`).
- **Decision:** Target `main` branch.
- **Decision:** Paste `CHANGELOG.md` content into release description.
- **Source:** `docs/RELEASES.md` (Lines 41-47)

#### CI/CD Automation

- **Decision:** Use GitHub Actions workflow (`.github/workflows/docker-publish.yml`) to automate build and publish.
- **Decision:** Trigger workflow automatically when a release is published.
- **Decision:** Publish Docker image to GitHub Container Registry (GHCR).
- **Source:** `docs/RELEASES.md` (Lines 54, 62)

#### Rollback Strategy

- **Decision:** Do not delete tags for broken releases.
- **Decision:** Fix issues in `main` and release a new patch version.
- **Source:** `docs/RELEASES.md` (Lines 78-80)

---

## 7. Testing & Quality Assurance

### From AGENTS.md

#### Testing Strategy

- **Decision:** No committed test runner yet; rely on `pnpm type-check`, linting, and manual verification.
- **Decision:** New automated coverage must be colocated with features using `.test.ts` or `.test.tsx` suffix.
- **Decision:** Tests should exercise user-visible behavior.
- **Decision:** New tooling (e.g., Playwright) must be flagged in PR and wired into `package.json`.
- **Source:** `AGENTS.md` (Lines 30)

### From FAILURELOG.md

#### Mocking Strategy

- **Decision:** Use `jest-mock-extended` for Prisma mocking to resolve type errors (Option B).
- **Decision:** Update `mockPrismaClient` helper to return properly typed mocks.
- **Source:** `FAILURELOG.md` (Lines 135-136)

#### Type Compatibility

- **Decision:** Wrap API route test params in `Promise.resolve()` for Next.js 15 compatibility.
- **Decision:** Use `as unknown as RequestInit` cast to resolve `RequestInit` type mismatch between Node.js and Next.js.
- **Source:** `FAILURELOG.md` (Lines 47-49, 137)

#### Data Types in Tests

- **Decision:** Use exact Prisma schema field names (e.g., `colour` instead of `color`).
- **Decision:** Use `Date` objects (not strings) for dates in Zustand stores.
- **Source:** `FAILURELOG.md` (Lines 146-147)

### From hurl/README.md

#### Hurl Testing Tool

- **Decision:** Use **Hurl** for integration, smoke, and API testing.
- **Reason:** Simple plain text format, fast execution, real HTTP requests.
- **Source:** `hurl/README.md` (Lines 3, 222-228)

#### Test Organization

- **Decision:** Tests organized by resource directory (`animals/`, `customers/`, `breeds/`, `notes/`).
- **Decision:** Environment variables stored in `hurl/variables.env`.
- **Source:** `hurl/README.md` (Lines 41-66)

#### Test Execution

- **Decision:** Use `pnpm test:hurl` to run all tests.
- **Decision:** Support running specific test suites or single files via `hurl` CLI.
- **Source:** `hurl/README.md` (Lines 74, 80)

#### Test Configuration

- **Decision:** Default `base_url` is `http://localhost:3000`.
- **Decision:** Default `api_base` is `/api`.
- **Decision:** Test data IDs (customer, animal, breed, note) must be configured in `variables.env` to match the local database.
- **Source:** `hurl/README.md` (Lines 110-117)

#### CI/CD Integration

- **Decision:** Hurl tests are integrated into the GitHub Actions workflow (`.github/workflows/test.yml`).
- **Decision:** Workflow installs Hurl binary and runs `pnpm test:hurl`.
- **Source:** `hurl/README.md` (Lines 208-218)

---

## 8. Workflows & Governance

### From AGENTS.md

#### Commit Messages

- **Decision:** Use short, sentence-case subjects (e.g., "Add admin filters").
- **Decision:** Present-tense summaries under 72 characters.
- **Source:** `AGENTS.md` (Lines 34)

#### PR Workflow

- **Decision:** Husky runs `pnpm lint-staged` on commit.
- **Decision:** PRs must explain changes, list validation steps, attach UI screenshots, and link to issues/specs.
- **Source:** `AGENTS.md` (Lines 34)

### From CLAUDE.md

#### Archon Task System

- **Decision:** Always check current task before coding.
- **Decision:** Update task status: `todo` → `doing` → `review`.
- **Source:** `CLAUDE.md` (Lines 247-250)

---

## Conflict Resolution Log

_This section tracks decisions that were revised, overridden, or reversed across documents. Each entry includes the original decision, the superseding decision, and confirmed final state._

### Conflict #1: Date Field Defaults

| Aspect                   | Detail                                                                                                                                                                                                          |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Source 1**             | CLAUDE.md (Lines 200-211)                                                                                                                                                                                       |
| **Original Decision**    | Date fields use `'0000-00-00'` defaults (invalid but present)                                                                                                                                                   |
| **Source 2**             | CHANGELOG.md (Lines 173-231), FAILURELOG.md (Lines 240-248)                                                                                                                                                     |
| **Superseding Decision** | Changed default date values from `'0000-00-00'` to `'1900-01-01'` for MySQL 8.0 compatibility                                                                                                                   |
| **Final State**          | ✅ **VERIFIED**: `prisma/schema.prisma` uses `@default(dbgenerated("'1900-01-01'"))` for all date fields (`lastvisit`, `thisvisit`, `date`). The `0000-00-00` reference in CLAUDE.md is outdated documentation. |

### Conflict #2: Invalid Date Transformation During Import

| Aspect                   | Detail                                                                                                                                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Source 1**             | docs/MIGRATION_GUIDE.md                                                                                                                                                                                       |
| **Original Decision**    | Fix invalid dates (e.g., `0000-00-00` becomes `NULL`)                                                                                                                                                         |
| **Source 2**             | prisma/README.md, FAILURELOG.md                                                                                                                                                                               |
| **Alternative Decision** | Use `1900-01-01` as default for MySQL 8.0 strict mode compatibility                                                                                                                                           |
| **Final State**          | ✅ **VERIFIED**: Prisma schema uses `1900-01-01`. The import process may convert `0000-00-00` to either `NULL` or `1900-01-01` depending on context - but the Prisma default is `1900-01-01` for new records. |

---

## Document Processing Status

| Document                                          | Status      |
| ------------------------------------------------- | ----------- |
| AGENTS.md                                         | ✅ Complete |
| CHANGELOG.md                                      | ✅ Complete |
| CLAUDE.md                                         | ✅ Complete |
| docs\_\_MIGRATION_GUIDE.md                        | ✅ Complete |
| docs\_\_PRODUCTION_DEPLOYMENT.md                  | ✅ Complete |
| docs\_\_RELEASES.md                               | ✅ Complete |
| FAILURELOG.md                                     | ✅ Complete |
| hurl\_\_README.md                                 | ✅ Complete |
| prisma\_\_PRODUCTION_MIGRATION.md                 | ✅ Complete |
| prisma\_\_README.md                               | ✅ Complete |
| prisma**scripts**COMPREHENSIVE_DATA_CLEANUP.md    | ✅ Complete |
| prisma**scripts**MIGRATION_STRATEGY.md            | ✅ Complete |
| prisma**scripts**QUICK_REFERENCE.md               | ✅ Complete |
| README.md                                         | ✅ Complete |
| reference**archive**CODE_REVIEW.md                | ✅ Complete |
| reference**archive**DATABASE_FIX_COMPLETE.md      | ✅ Complete |
| reference**archive**DATABASE_FIXES.md             | ✅ Complete |
| reference**archive**DT.md                         | ✅ Complete |
| reference**archive**FINISH_DATABASE_FIX.md        | ✅ Complete |
| reference**archive**FIXES_COMPLETE.md             | ✅ Complete |
| reference**archive**GENERIC_STYLING.md            | ✅ Complete |
| reference**archive**HURL_TESTING_SUMMARY.md       | ✅ Complete |
| reference**archive**IMPLEMENTATION_PLAN.md        | ✅ Complete |
| reference**archive**IMPLEMENTATION_TASKS.md       | ✅ Complete |
| reference**archive**LEGACY_COMPARISON_REPORT.md   | ✅ Complete |
| reference**archive**LOGGING.md                    | ✅ Complete |
| reference**archive**PR_DESCRIPTION.md             | ✅ Complete |
| reference**archive**STYLE_AUDIT_REPORT.md         | ✅ Complete |
| reference**archive**STYLE_ENHANCEMENT_SUMMARY.md  | ✅ Complete |
| reference**archive**test-phone-search.md          | ✅ Complete |
| reference**archive**TODO.md                       | ✅ Complete |
| reference**archive**URGENT_DATABASE_FIX.md        | ✅ Complete |
| reference\_\_CURRENT_PLAN.md                      | ✅ Complete |
| reference**reports**API_ENDPOINTS.md              | ✅ Complete |
| reference**styleguides**CARDS_REDESIGN.md         | ✅ Complete |
| reference**styleguides**COMPOSE-WALKTHROUGH.md    | ✅ Complete |
| reference**styleguides**DELETE_MODAL.md           | ✅ Complete |
| reference**styleguides**JSDOC_COUNT.md            | ✅ Complete |
| reference**styleguides**MOCKUI_ANALYSIS.md        | ✅ Complete |
| reference**styleguides**OPENAPI_IMPLEMENTATION.md | ✅ Complete |
| reference**styleguides**OPENAPI_SPEC.md           | ✅ Complete |
| reference**styleguides**PLAN_IMPROVEMENTS.md      | ✅ Complete |
| reference**styleguides**ROUTES.md                 | ✅ Complete |
| reference**styleguides**ROUTES_COMPONENTS.md      | ✅ Complete |
| reference**styleguides**ROUTING_COMPLETE.md       | ✅ Complete |
| reference**styleguides**ROUTING_ENFORCEMENT.md    | ✅ Complete |
| reference**styleguides**SCORES.md                 | ✅ Complete |
| reference**styleguides**SEARCH-RESULT-CARDS.md    | ✅ Complete |
| reference**styleguides**STYLE_GUIDE.md            | ✅ Complete |
| reference**styleguides**TESTING.md                | ✅ Complete |
| reference**styleguides**TODO_ROUTES_COMPONENTS.md | ✅ Complete |
