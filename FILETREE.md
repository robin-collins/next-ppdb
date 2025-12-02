     1|# File Tree Structure
     2|
     3|This document tracks the current file structure of the ppdb-ts project.
     4|
     5|```text
     6|ppdb-ts/
     7|├── .cursorindexingignore
     8|├── .gitignore
     9|├── .husky/
    10|├── .prettierignore
    11|├── .prettierrc
    12|├── .specstory/
    13|├── CHANGELOG.md                    # Project changelog (created)
    14|├── OPENAPI_IMPLEMENTATION.md       # ✅ Enhanced OpenAPI implementation guide with Context7 references (updated 2025-11-17)
    15|├── CHECK_DATABASE.sh               # Helper script to check notes table schema (created 2025-11-16)
    16|├── DATABASE_FIX_COMPLETE.md        # ✅ Complete database fix summary and verification (created 2025-11-16)
    17|├── DATABASE_FIXES.md               # Database schema issue tracking and resolutions (created 2025-11-16)
    18|├── DELETE_MODAL.md                 # Delete confirmation modal specification for breeds/animals/customers (created 2025-12-01)
    19|├── FAILURELOG.md                   # Failed attempts and lessons learned (created 2025-11-16)
    20|├── LEGACY_COMPARISON_REPORT.md     # ✅ Comprehensive legacy vs Next.js comparison analysis (created 2025-11-30)
    20|├── FIXES_COMPLETE.md               # ✅ Comprehensive summary of all fixes - database, API, and UX (created 2025-11-16)
    21|├── ROUTES.md                       # ✅ Authoritative RESTful routing specification - LOCKED (created 2025-11-16)
    22|├── ROUTING_ENFORCEMENT.md          # 🔒 Routing enforcement policy and code review requirements (created 2025-11-16)
    23|├── ROUTING_COMPLETE.md             # ✅ RESTful routing standardization completion summary (created 2025-11-16)
    24|├── LOGGING.md                      # ✅ Unified logging system documentation with examples (created 2025-11-16)
    25|├── hurl/                           # ✅ Hurl API testing directory (created 2025-11-16)
    26|│   ├── README.md                   #    Installation, usage, and examples
    27|│   ├── variables.env               #    Environment variables for tests
    28|│   ├── workflow-complete.hurl      #    End-to-end workflow test
    29|│   ├── animals/                    #    Animal API tests (search, get, create, update, delete)
    30|│   ├── customers/                  #    Customer API tests (search, get, create, update, delete)
    31|│   ├── breeds/                     #    Breed API tests (list, get, create, update, delete)
    32|│   └── notes/                      #    Service note API tests (create, get, update, delete)
    33|├── scripts/                        # Build and utility scripts
    34|│   ├── ai_image_generation.py      # AI image generation script with resume capability (updated 2025-11-30)
    35|│   ├── test-hurl.sh                # ✅ Hurl test runner script (created 2025-11-16)
    36|│   └── build-on-main.sh            # ✅ Conditional build script for main branch commits (created 2025-11-17)
    37|├── FIX_ALL_AUTOINCREMENT.sh        # Comprehensive AUTO_INCREMENT fix script (created 2025-11-16)
    38|├── FIX_DATABASE_NOW.sh             # Automated database fix script for notes (created 2025-11-16)
    39|├── FINISH_DATABASE_FIX.md          # Manual fix guide for remaining tables (created 2025-11-16)
    40|├── fix-database.mjs                # Node.js script using Prisma for DB fixes (created 2025-11-16)
    41|├── MIGRATION_GUIDE.md              # Database migration instructions (created)
    42|├── URGENT_DATABASE_FIX.md          # CRITICAL: Complete AUTO_INCREMENT fix guide (created 2025-11-16)
    43|├── PRODUCTION_DEPLOYMENT.md        # Production migration overview (created)
    44|├── SCORES.md                       # Search scoring algorithm documentation (created)
    45|├── TESTING.md                      # Comprehensive testing documentation (created 2025-11-16)
    46|├── test-logos.html                 # Logo overlay test viewer (updated 2025-11-30)
    47|├── SKILLS/                         # Skills directory (created)
    48|├── src/
    49|│   ├── hooks/                       # Custom React hooks
    50|│   │   └── useSidebarState.ts       # Persistent sidebar state hook with localStorage (created 2025-12-01)
    51|│   ├── components/breeds/           # Breed management components
    52|│   │   ├── BreedForm.tsx            # Add new breed form
    53|│   │   ├── BreedTable.tsx           # Breed listing table with edit/delete/pricing actions (updated 2025-12-02)
    54|│   │   └── PricingModifier.tsx      # Animated pricing adjustment panel for breeds (created 2025-12-02)
    55|│   ├── components/SetupGuard.tsx     # Server component: database health guard with verbose logging (created 2025-12-02)
    56|│   ├── components/setup/            # Setup/onboarding UI components (created 2025-12-02)
    57|│   │   ├── DiagnosticResults.tsx    # Health check results display with pass/fail cards
    57|│   │   ├── FileUploader.tsx         # Drag-drop file uploader for SQL/archives
    58|│   │   ├── ImportProgress.tsx       # Real-time import progress with SSE
    59|│   │   └── ImportLog.tsx            # Verbose color-coded import log viewer
    60|│   ├── lib/diagnostics/             # Startup diagnostic system (created 2025-12-02)
    61|│   │   ├── types.ts                 # TypeScript interfaces for health checks
    62|│   │   ├── checks.ts                # Individual diagnostic check functions
    63|│   │   └── index.ts                 # Main diagnostic runner with caching
    64|│   ├── lib/import/                  # Database import utilities (created 2025-12-02)
    65|│   │   ├── extractor.ts             # Archive extraction (zip, tar.gz)
    66|│   │   ├── remediation.ts           # Data repair and normalization functions
    67|│   │   ├── validator.ts             # Per-table record validation with remediation
    68|│   │   ├── importer.ts              # Prisma batch import with progress tracking
    69|│   │   ├── rawImporter.ts           # Raw SQL reader bypassing Prisma date parsing (created 2025-12-02)
    70|│   │   └── importLogger.ts          # File-based audit logging per table (created 2025-12-02)
    69|│   ├── lib/setup/                   # Setup utilities (created 2025-12-02)
    70|│   │   └── tempDb.ts                # Temporary database management
    71|│   ├── app/setup/                   # Setup/onboarding page (created 2025-12-02)
    72|│   │   └── page.tsx                 # Multi-step wizard: Diagnostics → Upload → Import → Complete
    73|│   ├── app/api/health/              # Health check API (created 2025-12-02)
    74|│   │   └── route.ts                 # GET: diagnostics, POST: clear cache
    75|│   ├── app/api/setup/               # Setup APIs (created 2025-12-02)
    76|│   │   ├── upload/route.ts          # POST: file upload and extraction
    77|│   │   └── import/route.ts          # GET: SSE stream for import progress
    78|│   ├── app/api/breeds/pricing/      # Bulk pricing update API
    79|│   │   └── route.ts                 # POST handler for breed/animal pricing updates (created 2025-12-02)
