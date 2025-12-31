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
├── ARCHITECTURE.md                 # Comprehensive system architecture documentation (created 2025-12-04)
├── CHANGELOG.md                    # Project changelog (created)
├── OPENAPI_IMPLEMENTATION.md       # ✅ Enhanced OpenAPI implementation guide with Context7 references (updated 2025-11-17)
├── CHECK_DATABASE.sh               # Helper script to check notes table schema (created 2025-11-16)
├── DATABASE_FIX_COMPLETE.md        # ✅ Complete database fix summary and verification (created 2025-11-16)
├── DATABASE_FIXES.md               # Database schema issue tracking and resolutions (created 2025-11-16)
├── DELETE_MODAL.md                 # Delete confirmation modal specification for breeds/animals/customers (created 2025-12-01)
├── FAILURELOG.md                   # Failed attempts and lessons learned (created 2025-11-16)
├── LEGACY_COMPARISON_REPORT.md     # ✅ Comprehensive legacy vs Next.js comparison analysis (created 2025-11-30)
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
│   ├── ai_image_generation.py      # AI image generation script with resume capability (updated 2025-11-30)
│   ├── test-hurl.sh                # ✅ Hurl test runner script (created 2025-11-16)
│   ├── build-on-main.sh            # ✅ Conditional build script for main branch commits (created 2025-11-17)
│   └── prisma-env.js               # Prisma CLI wrapper with dotenv-expand (created 2025-12-03)
├── FIX_ALL_AUTOINCREMENT.sh        # Comprehensive AUTO_INCREMENT fix script (created 2025-11-16)
├── FIX_DATABASE_NOW.sh             # Automated database fix script for notes (created 2025-11-16)
├── FINISH_DATABASE_FIX.md          # Manual fix guide for remaining tables (created 2025-11-16)
├── fix-database.mjs                # Node.js script using Prisma for DB fixes (created 2025-11-16)
├── MIGRATION_GUIDE.md              # Database migration instructions (created)
├── URGENT_DATABASE_FIX.md          # CRITICAL: Complete AUTO_INCREMENT fix guide (created 2025-11-16)
├── PRODUCTION_DEPLOYMENT.md        # Production migration overview (created)
├── SCORES.md                       # Search scoring algorithm documentation (created)
├── TESTING.md                      # Comprehensive testing documentation (created 2025-11-16)
├── test-logos.html                 # Logo overlay test viewer (updated 2025-11-30)
├── SKILLS/                         # Skills directory (created)
├── src/
│   ├── hooks/                       # Custom React hooks
│   │   └── useSidebarState.ts       # Persistent sidebar state hook with localStorage (created 2025-12-01)
│   ├── components/breeds/           # Breed management components
│   │   ├── BreedForm.tsx            # Add new breed form
│   │   ├── BreedTable.tsx           # Breed listing table with edit/delete/pricing actions (updated 2025-12-02)
│   │   └── PricingModifier.tsx      # Animated pricing adjustment panel for breeds (created 2025-12-02)
│   ├── components/SetupGuard.tsx     # Server component: database health guard with verbose logging (created 2025-12-02)
│   ├── components/setup/            # Setup/onboarding UI components (created 2025-12-02)
│   │   ├── DiagnosticResults.tsx    # Health check results display with pass/fail cards
│   │   ├── FileUploader.tsx         # Drag-drop file uploader for SQL/archives
│   │   ├── ImportProgress.tsx       # Real-time import progress with SSE
│   │   └── ImportLog.tsx            # Verbose color-coded import log viewer
│   ├── lib/diagnostics/             # Startup diagnostic system (created 2025-12-02)
│   │   ├── types.ts                 # TypeScript interfaces for health checks
│   │   ├── checks.ts                # Individual diagnostic check functions
│   │   └── index.ts                 # Main diagnostic runner with caching
│   ├── lib/import/                  # Database import utilities (created 2025-12-02)
│   │   ├── extractor.ts             # Archive extraction (zip, tar.gz)
│   │   ├── remediation.ts           # Data repair and normalization functions
│   │   ├── validator.ts             # Per-table record validation with remediation
│   │   ├── importer.ts              # Prisma batch import with progress tracking
│   │   ├── rawImporter.ts           # Raw SQL reader bypassing Prisma date parsing (created 2025-12-02)
│   │   └── importLogger.ts          # File-based audit logging per table (created 2025-12-02)
│   ├── lib/setup/                   # Setup utilities (created 2025-12-02)
│   │   └── tempDb.ts                # Temporary database management
│   ├── app/setup/                   # Setup/onboarding page (created 2025-12-02)
│   │   └── page.tsx                 # Multi-step wizard: Diagnostics → Upload → Import → Complete
│   ├── app/api/health/              # Health check API (created 2025-12-02)
│   │   └── route.ts                 # GET: diagnostics, POST: clear cache
│   ├── app/api/setup/               # Setup APIs (created 2025-12-02)
│   │   ├── upload/route.ts          # POST: file upload and extraction
│   │   └── import/route.ts          # GET: SSE stream for import progress
│   ├── app/api/breeds/pricing/      # Bulk pricing update API
│   │   └── route.ts                 # POST handler for breed/animal pricing updates (created 2025-12-02)
│   ├── lib/env.ts                   # Zod-based environment variable validation (created 2025-12-03)
│   ├── lib/config.ts                # Centralized typed configuration (created 2025-12-03)
│   ├── lib/logger.ts                # Pino-based structured logging with redaction (updated 2025-12-03)
│   ├── lib/ratelimit.ts             # Rate limiting utility using Valkey/Redis with memory fallback (created 2025-12-03)
│   ├── lib/middleware/              # API middleware utilities (created 2025-12-03)
│   │   └── rateLimit.ts             # withRateLimit() wrapper for API routes
│   ├── services/                    # Business logic services (created 2025-12-03, expanded 2025-12-04)
│   │   ├── index.ts                 # Service exports
│   │   ├── animals.service.ts       # Animal search scoring and helpers
│   │   ├── customers.service.ts     # Customer formatting, validation helpers
│   │   ├── breeds.service.ts        # Breed avgtime, pricing calculations
│   │   └── notes.service.ts         # Note parsing, cost extraction
│   ├── repositories/                # Repository pattern for data access (created 2025-12-04)
│   │   ├── index.ts                 # Repository exports
│   │   ├── types.ts                 # Repository interfaces (IAnimalRepository, etc.)
│   │   ├── animal.repository.ts     # Prisma animal repository
│   │   ├── customer.repository.ts   # Prisma customer repository
│   │   ├── breed.repository.ts      # Prisma breed repository
│   │   └── notes.repository.ts      # Prisma notes repository
│   ├── lib/requestCache.ts          # Request deduplication with TTL caching (created 2025-12-04)
│   ├── types/                       # Shared TypeScript types (created 2025-12-03)
│   │   └── api.ts                   # API response/request type definitions
│   ├── instrumentation.ts           # Next.js startup hook for environment validation (created 2025-12-03)
│   └── store/                       # Zustand state management stores
│       ├── animalsStore.ts          # Animals store with request caching (updated 2025-12-04)
│       └── customersStore.ts        # Customers store with mutating flag (updated 2025-12-03)
```

**Last Updated**: 2026-01-01
