# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- **Add Customer Page**: Created modern glassmorphic Add Customer page at `/customers/add`
  - **File**: `src/app/customers/add/page.tsx` - Full-featured customer creation form
  - **Navigation**: Updated Sidebar component to link "Add Customer" menu item to `/customers/add`
  - **Spacing Improvements**: Significantly increased padding/margin throughout for generous breathing room
    - **Implementation**: Used inline styles due to Tailwind utility classes not being applied correctly
    - Main wrapper: 64px horizontal, 48px vertical padding
    - Page header: 48px bottom margin, 8px left padding, 16px title bottom margin
    - Alert messages: 32px horizontal, 24px vertical padding
    - Form grid: 32px gaps between fields, 40px bottom margin
    - Labels: 8px bottom margin for visual separation
    - Card header: 40px horizontal, 32px vertical padding
    - Card content: 40px horizontal, 32px vertical padding
    - Input fields: 24px horizontal, 20px vertical padding (comfortable for placeholder text)
    - Textarea: Same as inputs + 120px min-height
    - Buttons: 32px horizontal, 20px vertical padding (generous pill shape)
    - Button section: 40px top padding
    - Help text: 32px horizontal, 24px vertical padding
    - All elements now have substantial spacing from edges and between each other
    - Removed conflicting `<style jsx global>` block that was preventing Tailwind utilities from working
  - **Features**:
    - Form with all customer fields: Firstname, Surname, Address, Suburb, Postcode, Phone1-3, Email
    - Real-time validation using existing Zod schemas from `src/lib/validations/customer.ts`
    - Integration with POST `/api/customers` endpoint
    - Success/error messaging with animations
    - Auto-redirect to customer detail page after successful creation
    - Clear form functionality
    - Responsive design matching STYLE_GUIDE.md specifications
  - **Design Implementation**:
    - Follows glassmorphic design system with animated gradient background
    - Card-based layout with header icons
    - Two-column form grid (responsive to single column on mobile)
    - Primary action button: "Insert Record" with loading state
    - Secondary actions: "Clear Form" and "Cancel"
    - Inline validation errors with red borders and error messages
    - Help text section with usage tips
  - **Styling**: Adheres to STYLE_GUIDE.md color palette, spacing scale, typography, and component patterns
  - **Integrations**:
    - Header component with breadcrumb navigation
    - Sidebar component with pin/unpin functionality
    - Existing customer API validation and error handling
  - **Reference**: Based on original PPDB screenshot at `reference/PPDB/screenshots/after-add-customer-click.jpg`
  - **Purpose**: Replace legacy PHP `add_customer.php` with modern Next.js implementation

- **Mock UI Analysis Methodology**: Created systematic framework for comparing live pages against mockups
  - **Document**: `MOCKUI_ANALYSIS.md` (17 sections, ~1000 lines) - Rigorous methodology for future page implementations
  - **10-Phase Analysis Workflow**: Visual → Structural → Computed Styles → Layout → Typography → Colors → Spacing → Interactive → Responsive → Animations
  - **DevTools MCP Integration**: Leverages Chrome DevTools capabilities for precision:
    - `evaluate_script` for computed style extraction (window.getComputedStyle, getBoundingClientRect)
    - `take_snapshot` for accessibility tree and DOM structure analysis
    - `take_screenshot` for visual comparisons at multiple breakpoints
    - Automated viewport testing (desktop 1920px, tablet 768px, mobile 375px)
  - **6 Reusable DevTools Scripts** in appendix:
    1. Complete Style Extraction - Comprehensive computed styles for any selector
    2. Color Palette Extraction - All colors used with usage counts
    3. Typography Audit - Font specifications across all text elements
    4. Spacing Audit - Margin/padding/gap analysis for design system
    5. Interactive Elements Inventory - All clickable elements with states
    6. Layout Tree - Visual hierarchy showing display types and nesting
  - **Gap Analysis Framework**:
    - Severity classification (CRITICAL, HIGH, MEDIUM, LOW)
    - Effort estimation (Low, Medium, High)
    - Priority matrix (P0-P4) based on severity × effort
    - Standardized gap documentation template with resolution steps
  - **Comprehensive Reporting Template**:
    - Executive summary with completion percentage
    - Visual comparison with screenshots
    - Detailed analysis by category (layout, visual, typography, interactive, responsive, animations)
    - Implementation roadmap with phases
    - Component checklist (new components + files to update)
    - Risk assessment (High/Medium/Low with mitigations)
    - Estimated effort breakdown
    - Success criteria checklist
  - **Best Practices & Common Pitfalls**: 10 documented pitfalls with solutions
    - Trusting visual appearance vs extracting computed values
    - Missing pseudo-elements (::before, ::after)
    - Ignoring interactive states (hover, focus, active)
    - Viewport-specific issues
    - Hardcoded values vs design system variables
    - Animation timing precision
    - Font loading verification
    - Z-index stacking contexts
    - Content overflow scenarios
    - Sub-pixel rendering tolerance
  - **Time Estimates**: Complete analysis workflow: 2-3 hours per page
  - **Purpose**: Ensure consistency across all future page implementations, prevent design system drift
  - **Benefits**: Repeatable process, precise measurements, comprehensive documentation, automated where possible

- **Customer Detail Page Redesign Specification**: Created comprehensive redesign documentation
  - **Initial Analysis (Round 1)**: Compared current customer detail page implementation against modern UI mockup
    - **Browser Testing**: Used Chrome DevTools MCP to navigate localhost:3000, search for "Maltese", and view Adams customer record
    - **Visual Comparison**: Documented significant gaps between minimal current implementation and rich mockup design
    - **Specification Document**: Created detailed `reference/redesign/customer_detail_page_component.md` (15 sections, ~500 lines)
      - Component architecture and file structure (7 new components needed)
      - Complete layout specifications with two-column grid + 400px sidebar
      - Customer header with 120px avatar, status badges, meta grid, and action buttons
      - Main content cards: CustomerInfoCard (editable form grid), AssociatedAnimalsCard (animal grid with detailed cards)
      - Sidebar cards: ContactDetailsCard (with icons and hover actions), CustomerStatsCard (4-stat grid), QuickActionsCard (5 action buttons)
      - Design system tokens (colors, typography, spacing, border radius, shadows)
      - Component hierarchy and data requirements (Prisma queries with relations)
      - State management updates needed for Zustand stores
      - Responsive behavior specifications with breakpoints (mobile < 768px, tablet < 1024px)
      - Animation specifications (slideInUp for cards, staggered delays, hover effects)
      - Implementation checklist with 8 phases (structure, header, main content, sidebar, data, interactions, polish, testing)
    - **Key Findings**: Current implementation is minimal viable product; mockup adds glassmorphism, comprehensive data display, rich interactivity
    - **Gap Summary**: 15+ missing features including persistent header, breadcrumbs, sidebar, status badges, statistics, quick actions, animal detail cards
  - **Detailed Gap Analysis (Round 2)**: Fresh evaluation with actionable implementation roadmap
    - **Document**: Created `reference/redesign/customer_detail_page_component_round2.md` (14 sections, ~900 lines)
    - **Executive Summary**: Current implementation at ~5% completion vs target mockup
    - **Visual Comparison**: Side-by-side ASCII diagrams showing current (simple card) vs target (rich two-column layout)
    - **12 Detailed Gap Sections** with current state, target state, specific gaps, and resolution steps:
      1. Page Layout Structure - Two-column grid vs single column
      2. Persistent Header with Breadcrumbs - Navigation path missing
      3. Customer Header Section - Large avatar, status badge, meta grid (4 items), 3 action buttons
      4. Customer Information Card - Form grid (2-column, 9 fields) vs plain text list
      5. Associated Animals Card - Rich animal cards with avatars vs plain text
      6. Contact Details Card (Sidebar) - 4 contact items with hover actions (completely missing)
      7. Customer Statistics Card (Sidebar) - 2x2 grid with 4 metrics (completely missing)
      8. Quick Actions Card (Sidebar) - 5 color-coded action buttons (completely missing)
      9. Visual Design System - Shadows, gradients, colors, typography hierarchy
      10. Animations and Interactions - slideInUp entrance, hover effects, transitions
      11. Data Requirements - Additional fields needed (forename, phone2/3, email, visits, costs)
      12. Responsive Behavior - Breakpoint definitions and mobile layout changes
    - **Implementation Priority**: 6-phase roadmap (Foundation → Main Content → Sidebar → Polish → Data → Final Touches)
    - **Component File Checklist**: 7 new components to create, 5 files to update
    - **Success Criteria**: Visual fidelity, functionality, design system, performance metrics
    - **Estimated Effort**: 16-20 hours broken down by task
    - **Risk Assessment**: High (data availability, schema issues), Medium (edit mode, responsive), Low (CSS, icons)
    - **Completion Percentage**: Quantified current implementation at 5% vs target
    - **Next Steps**: Clear 7-step implementation path from layout to testing

- **Database Schema Migration System**: Comprehensive Prisma migration infrastructure for production deployment
  - **Migration File**: Created `20251004154300_schema_normalization` for database schema improvements
  - **Schema Updates**: Updated `prisma/schema.prisma` to reflect normalized schema with proper types and constraints
  - **ID Types**: Changed all ID columns from `MediumInt` to `UnsignedInt` for better range and consistency
  - **Column Renames**: `animal.SEX` → `animal.sex`, `notes.notes` → `notes.note_text`, `notes.date` → `notes.note_date`
  - **Type Changes**: `customer.postcode` from `Int` to `String` (VARCHAR(10)) for better data handling
  - **Storage**: Converted all tables to InnoDB with utf8mb4 character set for proper Unicode support
  - **Constraints**: Updated foreign key constraints from CASCADE to RESTRICT for data safety
  - **Indexes**: Added `uq_breedname` unique constraint and performance indexes (`ix_animalname`, `ix_breedID`, `ix_customerID`, `ix_animalID`)
  - **Field Sizes**: Expanded VARCHAR limits (customer fields 50-100 chars, animal.animalname to 50 chars)
  - **Data Types**: `animal.colour` TEXT → VARCHAR(100), `animal.comments` TinyText → TEXT
  - **Date Handling**: Made date fields properly nullable, sentinel '0000-00-00' values cleaned to NULL
  - **Documentation**: Created comprehensive migration documentation in `prisma/` folder
    - `MIGRATION_GUIDE.md` - General migration instructions and troubleshooting
    - `prisma/README.md` - Schema evolution, migration strategy, and rollback procedures
    - `prisma/PRODUCTION_MIGRATION.md` - Detailed production deployment guide with step-by-step process
    - `prisma/scripts/pre-migration-checks.sql` - 14 validation checks before migration
    - `prisma/scripts/post-migration-validation.sql` - 14 validation checks after migration
    - `prisma/scripts/rollback.sql` - Emergency rollback script (backup restoration preferred)
    - `prisma/scripts/QUICK_REFERENCE.md` - Quick reference card for production migration
  - **Zero Data Loss**: Migration designed for safe production deployment from legacy `ppdb-original.sql` schema

- **Search Score Debugging**: Added detailed scoring breakdown to API responses
  - Each search result now includes `scoreBreakdown` field with complete scoring details
  - Shows which fields were checked, what matched, and why
  - Displays match type (EXACT, STARTS WITH, CONTAINS, FUZZY) for each field
  - Includes diversity bonus calculation details
  - Temporary feature for debugging search relevance issues
  - Access via browser DevTools > Network > API response JSON

- **Search UX Enhancement**: Added Enter key support for search input
  - Pressing Enter in the search field now triggers search without requiring mouse click
  - Added `handleKeyDown` event handler to Header component
  - Improves keyboard accessibility and user workflow efficiency

- **Relevance Score Display**: Added visual relevance scores to search results
  - API now returns `relevanceScore` field with each animal result
  - Card view displays score to the left of the "Active" pill in plain text
  - List view displays score as a separate column
  - Score values range from 30 (single fuzzy match) to 325+ (three exact matches with diversity bonus)
  - Helps identify search match quality and debug search algorithm effectiveness

- **Search Scoring Algorithm Overhaul**: Fixed and improved relevance scoring for multi-word queries
  - **Single-word queries**: Check term against all 8 fields, return maximum score
  - **Multi-word queries**: Score each term individually across all fields, sum results
  - **Diversity bonus**: Added +25 points per additional field category matched (customer, contact, animal, breed)
  - **Field categories**: Organized fields into 4 types for better scoring granularity
  - **Example**: "magic collins" now correctly scores 225 (both exact matches + bonus) vs 100 (only one match)
  - Created comprehensive documentation in `SCORES.md` with 12+ Mermaid diagrams and detailed examples
  - Fixed issue where partial matches were incorrectly scored against full multi-word query
  - Documentation updated to v2.0 with all ASCII diagrams converted to interactive Mermaid visualizations

- **Unified Customer Search**: Comprehensive multi-field search functionality
  - **API Enhancement** (`src/app/api/animals/route.ts`): Implemented unified search with relevance scoring
    - Single `q` query parameter replaces separate `search`, `breed`, and `surname` parameters
    - Searches across 8 fields: customer surname, firstname, email, phone1, phone2, phone3, animal name, and breed name
    - Phone number normalization (strips spaces, dashes, parentheses) for better matching
    - Multi-term query support (e.g., "bobby maltese" searches both name and breed)
    - Relevance scoring algorithm with weighted matches:
      - Exact match: 100 points
      - Starts with: 80 points
      - Contains: 50 points
      - Fuzzy match: 30 points (70% character overlap)
      - Multi-field bonus: +20 points for matching multiple terms
    - Results sorted by relevance score (descending), then by customer surname
  - **Validation Schema** (`src/lib/validations/animal.ts`): Simplified to single query parameter
    - Changed from `search`, `breed`, `surname` to unified `q` parameter
  - **Store Integration** (`src/store/animalsStore.ts`): Updated API calls to use new endpoint
    - Modified `SearchParams` interface to accept single `q` parameter
    - Updated API query string construction
  - **UI Updates**: Enhanced user experience
    - `src/components/Header.tsx`: Updated placeholder text to "Search by customer name, phone, email, animal name, or breed..."
    - `src/app/page.tsx`: Updated search handler to pass unified query parameter
  - **Use Cases**: Enables staff to quickly find customers using any identifying information
    - Search "col" → finds Collins (surname), Collie (breed), etc.
    - Search "joh@gm" → finds john@gmail.com
    - Search "jon smith" → finds "John Smith" (fuzzy match)
    - Search "bobby maltese" → finds animals named Bobby that are Maltese breed
    - Search "0412 345 678" → finds customer with matching phone

### Fixed

- **Add Customer Page lint**: Replaced `any` with a typed `ValidationDetail` helper and escaped the apostrophe in the tips list so `/customers/add` passes ESLint.
- **Database Schema Alignment**: Fixed Prisma schema to allow NULL values in `animal.colour` field
  - Updated `prisma/schema.prisma` to define `colour` as `String?` (nullable) instead of `String`
  - Resolves Prisma error: "Error converting field 'colour' of expected non-nullable type 'String', found incompatible value of 'null'"
  - Database contains legacy NULL values in colour field despite schema definition indicating NOT NULL
  - Updated `src/app/api/animals/route.ts` to store NULL instead of empty string when colour is not provided
  - Aligns with "drop-in replacement philosophy" - handles dirty data in application layer without database modifications
  - Application now properly handles nullable colour values in all API responses and UI components
  - Regenerated Prisma client to update TypeScript types

- **Phone Number Search**: Fixed phone number matching to normalize both query and database values
  - Phone fields now strip spaces, dashes, and parentheses before comparison
  - Searching "1234567" now correctly matches "12 345 678", "(123) 456-78", etc.
  - Applied to all three phone fields (phone1, phone2, phone3)
  - Ensures partial phone number matches work correctly
  - Example: "0412345" will match "0412 345 678"

- **Unified Search**: Fixed MySQL compatibility and ESLint issues in search queries
  - Removed `mode: 'insensitive'` option from Prisma queries (PostgreSQL-only feature)
  - MySQL string comparisons are case-insensitive by default (collation: latin1_swedish_ci)
  - Resolved "Unknown argument `mode`" error when executing search queries
  - Fixed ESLint error: Modified `checkField` function to accept `searchTerm` parameter
  - Now properly uses individual terms in multi-word query matching (e.g., "bobby maltese")
  - Removed deprecated `SearchForm.tsx` component causing TypeScript build errors

- **UI Refinement**: Achieved visual parity with HTML/CSS prototype header navigation
  - **Header Background**: Switched to solid `bg-white` with `border-gray-200` to remove teal edge
  - **Brand Badge**: Uses CSS variables for gradient `from var(--primary) to var(--secondary)` for consistency
  - **Search Bar**: Dedicated primary "Search" and secondary "Clear" buttons visible inside the input group
    - Set input container and field to 53px height
    - Set Search/Clear buttons to 37px height for balance inside 92px header
    - **Search Input Padding**: Fixed horizontal spacing within search input area
      - Container: Uses `!px-6` (24px horizontal padding with `!important`) to override global CSS reset
      - Global reset `* { padding: 0; }` was preventing Tailwind utilities from applying
      - Search icon: Changed from `mx-2` to `mr-3` for proper 12px spacing from input text
      - Input field: Changed from `px-3` to `pr-3` (no left padding) to prevent text overlap with icon
      - Button container: Changed from `mx-2` to `ml-3` for cleaner button separation
      - Verified in browser: paddingLeft and paddingRight now correctly show 24px
  - **Date/Time Pill Padding**: Fixed padding override issue
    - Changed `px-6 py-2` to `!px-6 !py-2` to override global CSS reset
    - Verified: paddingLeft=24px, paddingRight=24px, paddingTop=8px, paddingBottom=8px
  - **Main Content Area Padding**: Fixed padding in landing page main content
    - Main container: Changed `p-6` to `!p-6` (24px padding now applies)
    - Empty state outer: Changed `p-10` to `!p-10` (40px padding now applies)
    - Suggestion box: Changed `p-8` to `!p-8` (32px padding now applies)
    - Suggestion buttons: Changed `px-4 py-2` to `!px-4 !py-2` (16px/8px padding now applies)
    - No results div: Changed `p-8` to `!p-8` (32px padding now applies)
    - All padding utilities now use `!important` to override global reset `* { padding: 0; }`
  - **Focus Ring**: Uses `focus-within:border-[var(--primary)]` and consistent shadow token
  - **Date/Time Display**: Removed border from pill to match prototype's clean design (was `border-2`, now borderless with solid `bg-primary-light`)
  - **Hamburger Menu**: Always-visible gray background (`bg-gray-100`) matching prototype
  - **Suggestion Pills**: Ghost-button style with thin border for cleaner appearance
  - **Empty State Heading**: Exact prototype sizing (`text-[2rem]` / 32px)
  - **Main Content**: Border radius adjusted to `rounded-2xl`
  - **Content Margin**: Added 24px outer margin (`m-6`) around rounded white content area
  - **Content Padding**: Added 24px inner padding (`p-6`) to reveal gradient background beyond the rounded corners
  - **All Spacing & Sizing**: Verified exact match with prototype specifications (40px logo, 1rem padding, 0.75rem spacing)
  - **Navbar Height**: Adjusted header height; finalized at 92px CSS per updated requirement
  - **Lint**: Removed unused form submit handler in `Header.tsx`
  - **Left Edge Offset**: Increased header and sidebar left padding to 32px (`pl-8`) for clear breathing room against the viewport edge

### Added

- **UI Redesign**: Complete modern redesign implementation following TODO.md plan
  - **Phase 1**: Updated `globals.css` with comprehensive design system
    - Added Inter font import
    - Defined CSS custom properties for colors, spacing, shadows, and layout
    - Implemented animated gradient background with keyframe animations
  - **Phase 2**: Created `Header` component with glassmorphic effect
    - Animated hamburger menu with state transitions
    - Integrated search bar with focus ring effects
    - Real-time date/time display with auto-updates
    - Brand logo with gradient background and SVG icon
  - **Phase 3**: Created `Sidebar` component with advanced features
    - Slide-in/out animation with overlay for non-pinned state
    - Resizable width functionality (200px-500px) with drag handle
    - Pin/unpin toggle to lock sidebar position
    - Navigation menu with active state highlighting
    - Date display in footer with auto-updates
  - **Phase 4**: Created `EmptyState` component
    - Centered empty state with search icon and messaging
    - Interactive suggestion tags that trigger searches
    - Modern card-based layout with hover effects
  - **Phase 5**: Created results display components
    - `AnimalCard` component with gradient accents and hover animations
    - Avatar with initials, status badge, and info grid
    - `ResultsView` component with grid/list view toggle
    - Staggered entrance animations for result items
    - Responsive grid layout (1-2 columns)
  - **Phase 6**: Updated core application files
    - Simplified `layout.tsx` with updated metadata
    - Completely refactored `page.tsx` to use new component architecture
    - Integrated Header, Sidebar, EmptyState, and ResultsView
    - Added view mode state management and search flow
  - **Phase 7**: Responsive design implementation
    - Mobile-first approach with Tailwind breakpoints
    - Hidden elements on smaller screens (brand text, date display)
    - Single-column layout for mobile devices
    - Touch-optimized interaction targets

- **Reports**: Created detailed visual comparison report (`reports/VISUAL_COMPARISON_REPORT.md`)
  - Comprehensive comparison between Next.js implementation and reference HTML prototype
  - Identified 4 minor visual discrepancies requiring refinement
  - Overall 95% visual parity achieved
  - Documented 2 improvements over reference design
  - Includes specific code fixes and testing recommendations

- **Documentation**: Created comprehensive `TODO.md` implementation plan for UI redesign
  - Complete design system tokens and CSS variables from design draft
  - Detailed component specifications with full code examples
  - Phase-by-phase implementation guide (8 phases, 6-7 hours estimated)
  - Component props interfaces and HTML structure for all new components
  - Responsive design breakpoints and mobile optimizations
  - Testing checklist with visual, interaction, and responsive tests
  - Troubleshooting guide and success criteria

- **Visual Parity**: Applied 4 refinement fixes to achieve 100% visual parity with reference design
  - Fixed search bar border radius from `rounded-2xl` (24px) to `rounded-xl` (16px)
  - Fixed header padding from uniform `p-4` to asymmetric `py-4 px-6` (1rem vertical, 1.5rem horizontal)
  - Fixed hamburger button background from always-visible to hover-only `bg-gray-100`
  - Added mobile sidebar width constraint using `min(280px, 80vw)` for small screens
  - Visual fidelity score improved from 95/100 to 100/100

- **Build System**: Resolved CSS import ordering and TypeScript linting errors
  - Fixed CSS `@import` ordering in `globals.css` - font imports must precede Tailwind
  - Removed unused `useEffect` import and `pagination` variable from `page.tsx`
  - Replaced `any` types with proper Prisma types in API routes
  - Used `Prisma.animalGetPayload` and `Prisma.notesGetPayload` for type safety
  - All files now pass ESLint validation and TypeScript type checking
  - Production build completes successfully with zero errors
  - Created missing `@/lib/prisma.ts` file with proper Prisma client setup
  - Fixed Next.js 15 async params issue in API routes (`/api/animals/[id]/route.ts`)
  - Updated Prisma schema to include `@default(autoincrement())` for all ID fields
  - Fixed type mismatches between Prisma schema fields and API interface
  - Updated API routes to properly map database schema to expected frontend interface
  - Fixed TypeScript type annotations for Prisma query results
  - Regenerated Prisma client with correct configuration

- **React**: Fixed duplicate key warning in Sidebar navigation
  - Changed navigation item key from `item.href` to `item.label` to ensure uniqueness
  - Resolved "Encountered two children with the same key" warning in dev mode
  - Dashboard and Search Results both had `/` as href, causing duplicate keys

- **Testing**: Enhanced Playwright e2e test stability for Next.js dev environment
  - Updated `e2e/homepage.spec.ts` to handle Next.js lazy compilation and hydration properly
  - Added comprehensive wait strategy for Next.js dev server compilation completion
  - Waits for Next.js build indicators to disappear and React hydration to complete
  - Enhanced DOM stabilization with filtered mutation observer (3-second stability requirement)
  - Extended timeouts to accommodate Next.js dev compilation (45-second max wait)
  - Prevents screenshot timing issues from lazy-loaded components and background compilation

- **ESLint**: Resolved all warnings and errors across the codebase
  - **src/app/page.tsx**: Removed unused imports (`useState`, `useEffect`), removed unused variable (`setLoading`), replaced `any` type with proper interface, escaped quotes in JSX
  - **src/components/ErrorBoundary.tsx**: Removed unused `useEffect` import
  - **src/store/animalsStore.ts**: Replaced `any` types with proper interfaces (`CreateAnimalData`, `UpdateAnimalData`), removed unused variable (`newAnimal`)
  - **src/store/customersStore.ts**: Replaced `any` types with proper interfaces (`CreateCustomerData`, `UpdateCustomerData`)

### Changed

- **Prisma Schema**: Updated generator configuration to use default output location
- **API Routes**: Enhanced to properly transform database fields to match frontend expectations
- **Type System**: Aligned interfaces between store, components, and API responses
