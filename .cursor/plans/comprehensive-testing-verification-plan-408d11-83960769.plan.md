<!-- 83960761-beff-4711-83d8-3d9fe44c2893 bb685edc-f030-476f-93f2-7da2c137e27a -->

# Comprehensive Testing Verification Plan

## Objective

Verify via unit and integration testing that all items from `.cursor/plans/pp-1984b566.todos.md` have been completed by comparing the implemented Next.js application against `ROUTES_COMPONENTS.md` and `TODO_ROUTES_COMPONENTS.md`. Document all tests in `TESTING.md` with full test names, coverage details, and verification information.

## Current State Analysis

### Implemented (Based on codebase inspection):

- **Pages**: `/`, `/customer/[id]`, `/customers/add`, `/animals/[id]`, `/customers/history`, `/breeds`
- **APIs**: Animals (GET, POST, PUT), Customers (GET, POST, PUT, DELETE), Breeds (GET, POST, PUT, DELETE), Notes (GET, PUT, DELETE), Admin Backup (GET stub)
- **Components**: Header, Sidebar, AnimalCard, ResultsView, EmptyState, Customer components, Animal components, Breed components, CustomerHistory components, Breadcrumbs, Toast, ConfirmDialog, Pagination
- **Missing**: `/reports/daily-totals` page, `/api/reports/daily-totals` API, `/api/customers/history` API, DELETE `/api/animals/[id]`, POST `/api/animals/[id]/notes`

### Test Infrastructure:

- Jest configured with React Testing Library
- Playwright configured for E2E
- One sanity test exists (`src/__tests__/sanity.test.tsx`)
- One E2E test exists (`e2e/homepage.spec.ts`)

## Testing Approach & Conventions

### Testing Tools and Frameworks

**React Component Testing**:

- Use **React Testing Library** for all component tests
- Philosophy: Test components as users interact with them
- Focus on behavior, not implementation details
- Query elements by accessible roles, labels, and text content
- Avoid testing internal state or implementation

**Example Approach**:

```typescript
// Good: Test user-facing behavior
expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
fireEvent.click(screen.getByRole('button', { name: /save/i }))
expect(mockOnSave).toHaveBeenCalled()

// Avoid: Testing implementation details
expect(component.state.isOpen).toBe(true)
```

**End-to-End Testing**:

- Use **Playwright** for all E2E tests
- Test complete user journeys across pages
- Use actual browser environment (Chromium by default)
- Test responsive behavior at different viewports
- Capture screenshots/videos on failure for debugging

**User Interaction Simulation**:

- Use **@testing-library/user-event** for realistic user interactions
- Prefer `userEvent` over `fireEvent` for better simulation
- Examples: typing with delays, clicking with hover, tab navigation

### Database Testing Strategy

**Unit Tests - Mocked Prisma**:

- Mock all Prisma calls using Jest mocks
- Fast execution (no database I/O)
- Test business logic in isolation
- Test error handling paths
- Use fixtures for predictable mock data

**When to Use**:

- Testing API route handlers' logic
- Testing component data transformations
- Testing validation schemas
- Testing error responses

**Integration Tests - Real Test Database**:

- Use actual Prisma client with `DATABASE_URL_TESTING`
- Verify real database operations
- Test constraints, relations, transactions
- Slower but more comprehensive

**When to Use**:

- Testing complete API workflows
- Testing database constraints (foreign keys, unique constraints)
- Testing complex queries with joins
- Testing data integrity

**Critical Rule**: NEVER use production database for tests. Always use separate test database.

### Test Isolation and Repeatability

**Key Principles**:

1. **No Shared State Between Tests**:
   - Each test should run independently
   - Use `beforeEach` to set up clean state
   - Use `afterEach` to tear down/clean up
   - Don't rely on test execution order

2. **Reset Mocks Between Tests**:

   ```typescript
   beforeEach(() => {
     jest.clearAllMocks()
     // or for specific mocks:
     mockPrismaClient.animal.findMany.mockReset()
   })
   ```

3. **Clean Database State**:

   ```typescript
   beforeEach(async () => {
     await cleanupTestDB() // Truncate all tables
     await seedTestData() // Add baseline fixtures
   })
   ```

4. **Isolate Side Effects**:
   - Mock `fetch` calls to external APIs
   - Mock file system operations
   - Mock timers if testing time-dependent code
   - Clean up localStorage/sessionStorage

### Following Existing Patterns

**Reference Existing Tests**:

- Study `src/__tests__/sanity.test.tsx` for component test structure
- Study `e2e/homepage.spec.ts` for E2E test patterns
- Maintain consistent naming conventions
- Use similar assertion styles

**Test File Naming**:

- Component tests: `ComponentName.test.tsx`
- API tests: `route.test.ts`
- Store tests: `storeName.test.ts`
- E2E tests: `feature-name.spec.ts`

**Test Structure Pattern**:

```typescript
describe('ComponentName or Feature', () => {
  // Setup
  beforeEach(() => {
    // Common setup for all tests in this suite
  })

  afterEach(() => {
    // Cleanup
  })

  describe('specific functionality', () => {
    it('should behave in expected way when condition', () => {
      // Arrange: Set up test data
      // Act: Perform the action
      // Assert: Verify the outcome
    })
  })
})
```

### Meaningful Test Descriptions

**Best Practices**:

- Use descriptive test names that explain what is being tested
- Include the expected behavior in the test name
- Make tests self-documenting

**Examples**:

```typescript
// Good: Clear and specific
it('should display validation error when email is invalid')
it('should call onSave with updated customer data when save button is clicked')
it('should disable delete button when customer has associated animals')

// Avoid: Vague or unclear
it('should work')
it('test button')
it('handles click')
```

### Proper Cleanup

**Database Cleanup**:

- Truncate tables in correct order (respect foreign keys)
- Reset sequences/auto-increment counters
- Consider using transactions that roll back

**Mock Cleanup**:

- Clear mock call history between tests
- Reset mock implementations to defaults
- Restore original implementations after test suite

**Resource Cleanup**:

- Close database connections in `afterAll`
- Clear timers and intervals
- Cancel pending async operations

## Testing Strategy

### Phase 1: Analysis and Documentation

**Purpose**: Establish baseline understanding of what needs to be tested and create test infrastructure foundation.

1. **Inventory Existing Tests**:
   - Review `src/__tests__/sanity.test.tsx` (unit test)
   - Review `e2e/homepage.spec.ts` (E2E test)
   - Document existing test coverage in TESTING.md

2. **Map Requirements to Test Cases**:
   - Cross-reference `ROUTES_COMPONENTS.md` with implemented code
   - Cross-reference `TODO_ROUTES_COMPONENTS.md` checkboxes with test requirements
   - Create test matrix mapping each requirement to test cases
   - Document discrepancies between TODO status and actual implementation

3. **Create TESTING.md Structure**:
   - Document existing tests with full names, what they test, test type, status
   - Create sections for Unit Tests, Integration Tests, E2E Tests
   - Include Test Coverage Summary and Test Execution Instructions

### Phase 2: Test Infrastructure Setup

**Purpose**: Establish reliable test infrastructure that allows for both mocked unit tests and real integration tests without affecting production data.

#### 2.1 Test Database Configuration

**Implementation Details**:

1. Update `jest.config.mjs` to support test database connection:
   - Add environment variable support for `DATABASE_URL_TESTING`
   - Configure separate test database connection pool
   - Set appropriate timeouts for database operations

2. Create test database utilities in `src/__tests__/helpers/db.ts`:

   ```typescript
   // setupTestDB(): Connect to test database
   // - Initializes Prisma client with DATABASE_URL_TESTING
   // - Runs any necessary migrations
   // - Verifies connection before tests run

   // cleanupTestDB(): Clean test data
   // - Truncates all tables in correct order (respects foreign keys)
   // - Resets auto-increment counters
   // - Preserves schema structure

   // seedTestData(): Seed test fixtures
   // - Loads fixture data from fixtures directory
   // - Creates consistent baseline data for tests
   // - Returns references to created records for test assertions
   ```

3. Create test fixtures in `src/__tests__/fixtures/`:
   ```
   src/__tests__/fixtures/
   ├── animals.ts      # Sample animal data with various breeds, ages, sexes
   ├── customers.ts    # Sample customer data with various contact info
   ├── breeds.ts       # Sample breed data (common breeds + edge cases)
   ├── notes.ts        # Sample service note data
   └── index.ts        # Barrel export for all fixtures
   ```

**Fixture Data Guidelines**:

- Include edge cases (empty strings, special characters, max lengths)
- Include valid and invalid data for validation testing
- Use realistic data that matches production patterns
- Ensure referential integrity (customer IDs match, breed IDs exist)

#### 2.2 Mock Utilities

**Purpose**: Provide reusable mock implementations for Prisma client and API dependencies to speed up unit test development.

**Implementation Details**:

1. Create Prisma mock utilities in `src/__tests__/helpers/mocks.ts`:

   ```typescript
   // mockPrismaClient(): Returns mocked Prisma client
   // - Mocks all Prisma methods (findMany, findUnique, create, update, delete)
   // - Supports chaining (include, where, orderBy)
   // - Allows per-test customization of responses

   // mockPrismaError(type): Returns specific Prisma error types
   // - P2002: Unique constraint violation
   // - P2025: Record not found
   // - P2003: Foreign key constraint violation

   // resetPrismaMocks(): Clears all mock call history
   // - Run in beforeEach to ensure test isolation
   ```

2. Create API route test helpers in `src/__tests__/helpers/api.ts`:

   ```typescript
   // createMockRequest(options): Creates Next.js request mock
   // - Supports GET, POST, PUT, DELETE methods
   // - Handles query params, body, headers
   // - Returns properly typed NextRequest

   // createMockResponse(): Creates Next.js response mock
   // - Captures status code, body, headers
   // - Allows assertions on response properties

   // testApiRoute(handler, request): Helper for API route testing
   // - Executes route handler with mocked request
   // - Returns response for assertions
   // - Handles error cases automatically
   ```

#### 2.3 Test Environment Configuration

**Purpose**: Ensure tests run in a controlled, isolated environment with appropriate configurations.

**Implementation Details**:

1. Update `jest.setup.ts` with test environment setup:
   - Set `NODE_ENV=test`
   - Load `.env.test` file if it exists
   - Configure React Testing Library
   - Set up global mocks (fetch, localStorage, etc.)
   - Initialize test database connection before all tests
   - Clean up test database after all tests

2. Configure test environment variables:
   - Create `.env.test` or document required variables in `.env.example`
   - Required variables:
     - `DATABASE_URL_TESTING`: Connection string for test database
     - `NODE_ENV=test`
     - Any API keys or secrets needed for tests (use dummy values)

3. Document test environment setup in TESTING.md:
   - How to create test database
   - How to run migrations on test database
   - How to seed initial test data
   - How to reset test environment between test runs

**Why This Matters**:

- Tests are fast and reliable
- Tests are isolated and repeatable
- Easy to write new tests (reusable utilities)
- Safe separation from production data

### Phase 3: API Route Unit & Integration Tests

Test all API endpoints with:

- Success cases (200 responses, correct data shapes)
- Error cases (400, 404, 500)
- Validation (Zod schema compliance)
- Database operations (CRUD correctness)
- Edge cases (empty results, invalid IDs, missing data)

**Test Files to Create:**

- `src/__tests__/api/animals.test.ts` - Animals API routes
- `src/__tests__/api/customers.test.ts` - Customers API routes
- `src/__tests__/api/breeds.test.ts` - Breeds API routes
- `src/__tests__/api/notes.test.ts` - Notes API routes
- `src/__tests__/api/reports.test.ts` - Reports API routes (if implemented)
- `src/__tests__/api/admin.test.ts` - Admin API routes

### Phase 4: Component Unit Tests

**Test Type**: Unit Tests

Test React components with:

- Rendering (correct DOM structure)
- Props handling
- User interactions (clicks, form inputs)
- State changes
- Error states
- Loading states
- Accessibility (ARIA labels, keyboard navigation)

**Test Files to Create:**

- `src/__tests__/components/Header.test.tsx`
- `src/__tests__/components/Sidebar.test.tsx`
- `src/__tests__/components/AnimalCard.test.tsx`
- `src/__tests__/components/ResultsView.test.tsx`
- `src/__tests__/components/EmptyState.test.tsx`
- `src/__tests__/components/Breadcrumbs.test.tsx`
- `src/__tests__/components/Toast.test.tsx`
- `src/__tests__/components/ConfirmDialog.test.tsx`
- `src/__tests__/components/Pagination.test.tsx`
- `src/__tests__/components/customer/*.test.tsx` (all customer components)
- `src/__tests__/components/animals/*.test.tsx` (all animal components)
- `src/__tests__/components/breeds/*.test.tsx` (all breed components)
- `src/__tests__/components/customerHistory/*.test.tsx` (all history components)

### Phase 5: Page Integration Tests

**Test Type**: Integration Tests

Test Next.js pages with:

- Page rendering
- Data fetching
- Navigation
- Form submissions
- Error handling
- Route parameters

**Test Files to Create:**

- `src/__tests__/pages/home.test.tsx` - Landing/search page
- `src/__tests__/pages/customer-detail.test.tsx` - Customer detail page
- `src/__tests__/pages/customer-add.test.tsx` - Add customer page
- `src/__tests__/pages/customer-history.test.tsx` - Customer history page
- `src/__tests__/pages/animal-detail.test.tsx` - Animal detail page
- `src/__tests__/pages/breeds.test.tsx` - Breeds management page

### Phase 6: Zustand Store Tests

Test state management with:

- Initial state
- Actions (search, fetch, create, update, delete)
- State updates
- Persistence (localStorage)
- Error handling

**Test Files to Create:**

- `src/__tests__/store/animalsStore.test.ts`
- `src/__tests__/store/customersStore.test.ts`
- `src/__tests__/store/breedsStore.test.ts` (if exists)

### Phase 7: E2E Tests (Playwright)

Test critical user flows:

- Search flow (search → results → animal detail)
- Customer management (add → view → edit → delete)
- Animal management (view → edit → add note → delete note)
- Breed management (list → create → update → delete)
- Customer history (filter → view → stats)

**Test Files to Create:**

- `e2e/search-flow.spec.ts`
- `e2e/customer-management.spec.ts`
- `e2e/animal-management.spec.ts`
- `e2e/breed-management.spec.ts`
- `e2e/customer-history.spec.ts`

### Phase 8: Validation & Documentation

1. Run all tests and ensure they pass
2. Run `pnpm check` (type-check + lint + fmt:check + test)
3. Run `pnpm build` to ensure production build succeeds
4. Document all tests in `TESTING.md` with:
   - Test file path
   - Full test name/description
   - What it tests (component, route, page, API, etc.)
   - Test type (unit, integration, E2E)
   - Coverage details
   - Dependencies/mocks required
   - Any special setup needed

### Phase 9: Code Quality Verification

**Purpose**: Ensure all code (including tests) meets project standards for type safety, style, formatting, and that all tests pass consistently.

#### 9.1 Code Quality Validation

**Purpose**: Ensure all code (including tests) meets project standards for type safety, style, and formatting.

**Steps**:

1. **Type Checking**:

   ```bash
   pnpm type-check
   ```

   - Verify no TypeScript errors in test files
   - Ensure all test utilities are properly typed
   - Check that mock types match actual implementations
   - Verify test fixtures have correct types

**Common Issues to Watch For**:

- Missing type annotations on test helpers
- `any` types in test code (avoid these)
- Mock types not matching actual Prisma types
- Incorrect typing of Next.js Request/Response objects

2. **Linting**:

   ```bash
   pnpm lint
   ```

   - Fix any ESLint violations in test files
   - Ensure test code follows project conventions
   - Check for unused imports/variables in tests
   - Verify proper async/await usage

**Auto-fix Common Issues**:

```bash
pnpm lint:fix
```

3. **Formatting**:

   ```bash
   pnpm fmt
   ```

   - Format all test files with Prettier
   - Ensure consistent code style across test suite
   - Check formatting without changes:

   ```bash
   pnpm fmt:check
   ```

**Quality Gate**: All commands must pass with zero errors before proceeding.

#### 9.2 Test Execution Validation

**Purpose**: Verify all tests pass consistently and repeatably across multiple runs.

**Steps**:

1. **Unit Tests**:

   ```bash
   pnpm test
   ```

   - All tests should pass
   - No flaky tests (inconsistent pass/fail)
   - Reasonable execution time (< 30 seconds for unit tests)
   - No console warnings or errors

**What to Watch For**:

- Tests that pass individually but fail when run together (shared state issue)
- Intermittent failures (timing issues, async problems)
- Memory leaks (tests slow down over time)

2. **Test Coverage**:

   ```bash
   pnpm test:coverage
   ```

   - Generate HTML coverage report in `coverage/` directory
   - Review coverage percentages:
     - Statements: Target 80%+ for critical paths
     - Branches: Target 75%+ for decision points
     - Functions: Target 80%+ for public APIs
     - Lines: Target 80%+ overall

**Coverage Analysis**:

- Identify untested code paths
- Prioritize testing critical business logic
- Document intentionally untested code (if any)
- Review coverage report: `open coverage/index.html`

3. **End-to-End Tests**:

   ```bash
   pnpm test:e2e
   ```

   - All E2E tests should pass
   - Tests run in headless mode
   - Playwright reports generated
   - Screenshots/videos captured on failure

**Debugging E2E Failures**:

```bash
pnpm test:e2e:headed    # Run with visible browser
pnpm test:e2e:ui        # Open Playwright UI
```

4. **Repeatability Verification**:
   - Run full test suite 3 times consecutively
   - All runs should have identical results
   - No intermittent failures
   - Consistent execution times

**Command for Multiple Runs**:

```bash
pnpm test && pnpm test && pnpm test
```

**Quality Gate**: All tests must pass on every run. If any test is flaky, it must be fixed before proceeding.

#### 9.3 Documentation Verification

**Purpose**: Ensure TESTING.md accurately reflects all implemented tests and provides complete information.

**Verification Checklist**:

1. **Test Inventory Accuracy**:
   - [ ] Every test file is documented in TESTING.md
   - [ ] All test names match actual test descriptions
   - [ ] File paths are correct and current
   - [ ] No documented tests are missing from codebase

2. **Test Information Completeness**:

For each documented test, verify:

- [ ] Full test name/description is provided
- [ ] What it tests is clearly stated (component/route/page/API)
- [ ] Test type is specified (unit/integration/E2E)
- [ ] Key assertions or behavior verified are listed
- [ ] Dependencies/mocks are documented

3. **Coverage Information**:
   - [ ] Coverage summary statistics are included
   - [ ] Coverage targets are documented
   - [ ] Instructions for generating coverage reports are provided
   - [ ] Known gaps or limitations are documented

4. **Execution Instructions**:
   - [ ] Commands to run all tests are documented
   - [ ] Commands to run specific test suites are provided
   - [ ] Test environment setup steps are included
   - [ ] Troubleshooting guidance is available

5. **Test Organization**:
   - [ ] Tests are organized by category (API, Components, Pages, E2E)
   - [ ] Related tests are grouped logically
   - [ ] Document structure matches test file structure
   - [ ] Navigation/table of contents is provided (if needed)

**Documentation Review Process**:

1. Read through TESTING.md from a fresh perspective
2. Verify you could run all tests following only the documentation
3. Check that all test file paths are valid
4. Ensure test descriptions match actual test behavior
5. Validate that coverage numbers are current

**Quality Gate**: Documentation must be complete, accurate, and sufficient for another developer to understand and run all tests.

#### 9.4 Build Verification

**Purpose**: Ensure the application builds successfully for production with all tests in place.

**Steps**:

1. **Clean Build**:

   ```bash
   pnpm clean:next   # Remove build cache
   pnpm build        # Create production build
   ```

2. **Verify Build Output**:
   - Build completes without errors
   - No type errors during build
   - All pages compile successfully
   - Static and dynamic routes are generated
   - Build size is reasonable

3. **Build Artifacts**:
   - Check `.next` directory is created
   - Verify page manifests are generated
   - Ensure API routes are included
   - Review build summary output

**What to Watch For**:

- Build errors related to test utilities (ensure test files are excluded from build)
- Type errors that only appear during build (stricter checking)
- Missing dependencies for production
- Unexpectedly large bundle sizes

**Quality Gate**: Production build must succeed without errors or warnings.

#### 9.5 Complete Quality Check

**Purpose**: Run all quality checks in sequence to ensure complete validation.

**Single Command**:

```bash
pnpm check
```

This runs:

1. Type checking (`pnpm type-check`)
2. Linting (`pnpm lint`)
3. Format checking (`pnpm fmt:check`)
4. All unit tests (`pnpm test`)

**Additional Verification**:

```bash
pnpm build          # Production build
pnpm test:e2e       # E2E tests
```

**Quality Gate**: All commands must pass successfully.

## Test Documentation Format (TESTING.md)

For each test file, document:

```markdown
## Test File: [path]

### Test: [Full Test Name]

- **Type**: Unit/Integration/E2E
- **Target**: [Component/Route/Page/API/Store]
- **Description**: [What it verifies]
- **Coverage**: [What aspects are tested]
- **Dependencies**: [Required mocks/setup]
- **Status**: Passing/Failing/Not Implemented
```

## Verification Checklist

For each item in `TODO_ROUTES_COMPONENTS.md`, verify:

- [ ] Page exists and renders correctly
- [ ] API endpoints exist and return correct data
- [ ] Components render and handle interactions
- [ ] State management works correctly
- [ ] Error handling is present
- [ ] Validation works (Zod schemas)
- [ ] Tests pass (unit + integration + E2E where applicable)
- [ ] Code passes linting, formatting, type-checking
- [ ] Production build succeeds

## Implementation Steps

1. **Setup Test Utilities** (if needed):
   - Create test helpers for API mocking
   - Create test fixtures for common data
   - Setup database test utilities (if integration tests need DB)

2. **API Tests** (Priority: High):
   - Start with GET endpoints (read operations)
   - Then POST/PUT (write operations)
   - Finally DELETE operations
   - Test error cases for each

3. **Component Tests** (Priority: High):
   - Test core components first (Header, Sidebar)
   - Then feature components (AnimalCard, CustomerInfoCard)
   - Finally complex components (Forms, Tables)

4. **Page Tests** (Priority: Medium):
   - Test page rendering
   - Test data loading
   - Test navigation flows

5. **Store Tests** (Priority: Medium):
   - Test each store action
   - Test state persistence
   - Test error states

6. **E2E Tests** (Priority: Medium):
   - Test critical user journeys
   - Test cross-page navigation
   - Test form submissions end-to-end

7. **Documentation** (Priority: High):
   - Create `TESTING.md` with all test documentation
   - Update `.cursor/plans/pp-1984b566.todos.md` with test completion status
   - Update `CHANGELOG.md` and `FILETREE.md`

## Deliverables

This section provides a concrete checklist of all artifacts that should be produced during the testing implementation process:

1. **TESTING.md** - Complete test documentation
   - Comprehensive inventory of all tests
   - Full test names, descriptions, and purposes
   - Coverage information and gaps
   - Test execution instructions
   - Troubleshooting guidance

2. **Unit test files in `src/__tests__/`**
   - Component tests in `src/__tests__/components/`
   - Store tests in `src/__tests__/store/`
   - Utility/validation tests in `src/__tests__/lib/`
   - All organized by feature/module

3. **Integration test files in `src/__tests__/api/`**
   - API route tests with mocked Prisma
   - Organized by endpoint/resource
   - Test both success and error cases

4. **Integration test files in `src/__tests__/api/integration/`** (if using real test DB)
   - API route tests with real database
   - Database constraint and relationship testing
   - Transaction and data integrity testing

5. **E2E test files in `e2e/`**
   - User flow tests (search, customer management, etc.)
   - Cross-page navigation tests
   - Form submission and validation tests
   - Error handling tests

6. **Test helpers and fixtures**
   - `src/__tests__/helpers/db.ts` - Database utilities
   - `src/__tests__/helpers/mocks.ts` - Mock utilities
   - `src/__tests__/helpers/api.ts` - API test helpers
   - `src/__tests__/fixtures/` - Test data fixtures

7. **Updated test configuration files**
   - `jest.config.mjs` - Updated with test DB support
   - `jest.setup.ts` - Enhanced with environment setup
   - `.env.test` - Test environment variables (if applicable)
   - `playwright.config.ts` - Updated if needed

8. **All tests passing with acceptable coverage**
   - Test suite runs successfully
   - Coverage reports generated
   - Coverage meets target thresholds (80%+ for critical paths)
   - No flaky or intermittent test failures

## Success Criteria

- All implemented features have corresponding tests
- All tests pass consistently on every run (no flaky tests)
- `pnpm check` passes (type-check + lint + fmt:check + test)
- `pnpm build` succeeds without errors or warnings
- `TESTING.md` documents all tests comprehensively with full names, coverage, and verification details
- Test coverage meets minimum thresholds:
  - Statements: 80%+ for critical paths
  - Branches: 75%+ for decision points
  - Functions: 80%+ for public APIs
  - Lines: 80%+ overall
- Tests are repeatable and don't depend on external state
- Test infrastructure is properly configured (test database, mocks, fixtures)
- All quality gates pass (code quality, test execution, documentation, build verification)

## Notes

- Use Jest mocks for API calls in unit tests
- Use Playwright for E2E tests that require full browser
- Mock Prisma client for API tests (or use test database)
- Ensure tests are isolated (no shared state between tests)
- Use `@testing-library/react` for component tests
- Use `@testing-library/user-event` for user interaction simulation
