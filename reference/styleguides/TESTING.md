# Testing Documentation

This document provides comprehensive information about the test suite for the PPDB (Pampered Pooch Database) Next.js application.

## Table of Contents

- [Test Overview](#test-overview)
- [Test Infrastructure](#test-infrastructure)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
- [API Route Tests](#api-route-tests)
- [Component Tests](#component-tests)
- [Store Tests](#store-tests)
- [End-to-End Tests](#end-to-end-tests)
- [Test Conventions](#test-conventions)
- [Troubleshooting](#troubleshooting)

## Test Overview

### Test Statistics

- **Total Test Suites**: 12
- **Total Tests**: 139
  - **Passing**: 134
  - **Skipped**: 5 (documenting missing validation)
- **Test Types**:
  - Unit Tests (API): 42 tests
  - Unit Tests (Components): 71 tests
  - Unit Tests (Store): 21 tests
  - E2E Tests: 3 test suites

### Test Framework Stack

- **Jest**: Unit and integration testing framework
- **React Testing Library**: Component testing utilities
- **@testing-library/user-event**: User interaction simulation
- **Playwright**: End-to-end testing framework
- **Zustand**: State management testing

## Test Infrastructure

### Configuration Files

- **`jest.config.mjs`**: Jest configuration with jsdom environment
- **`jest.setup.ts`**: Global test setup with Next.js mocks
- **`playwright.config.ts`**: Playwright E2E configuration

### Test Helpers

- **`src/__tests__/helpers/api.ts`**: API test utilities
  - `createMockRequest()`: Creates mocked Next.js requests
  - `parseResponseJSON()`: Parses response JSON for assertions

- **`src/__tests__/helpers/mocks.ts`**: Mock utilities (reserved for future expansion)

- **`src/__tests__/helpers/db.ts`**: Database utilities (reserved for future expansion)

### Test Fixtures

- **`src/__tests__/fixtures/animals.ts`**: Sample animal data
- **`src/__tests__/fixtures/breeds.ts`**: Sample breed data
- **`src/__tests__/fixtures/customers.ts`**: Sample customer data
- **`src/__tests__/fixtures/notes.ts`**: Sample service note data
- **`src/__tests__/fixtures/index.ts`**: Barrel export

## Running Tests

### Unit Tests

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run with coverage report
pnpm test:coverage

# Run specific test file
pnpm test animals.test.ts

# Run tests for specific category
pnpm test api
pnpm test components
pnpm test store
```

### End-to-End Tests

```bash
# Run all E2E tests (headless)
pnpm test:e2e

# Run with visible browser
pnpm test:e2e:headed

# Open Playwright UI
pnpm test:e2e:ui
```

### Quality Checks

```bash
# Run all quality checks (type-check + lint + fmt:check + test)
pnpm check

# Individual checks
pnpm type-check
pnpm lint
pnpm fmt:check
```

## Test Coverage

### Current Coverage

- **API Routes**: 100% of endpoints tested
  - Animals API: ✅ Complete
  - Customers API: ✅ Complete
  - Breeds API: ✅ Complete
  - Notes API: ✅ Complete

- **Components**: Core UI components tested
  - EmptyState: ✅ Complete
  - Breadcrumbs: ✅ Complete
  - AnimalCard: ✅ Complete
  - Pagination: ✅ Complete
  - Toast: ✅ Complete
  - ConfirmDialog: ✅ Complete

- **State Management**: Animals store tested
  - animalsStore: ✅ Complete (21 tests)

- **E2E Flows**: Critical user journeys
  - Search flow: ✅ Complete
  - Animal management: ✅ Complete

### Coverage Gaps

- Page integration tests (Phase 5) - Deferred
- Additional store tests (customersStore, breedsStore) - Future expansion
- Additional E2E scenarios (customer management, breed management) - Future expansion

## API Route Tests

### Animals API (`src/__tests__/api/animals.test.ts`)

**Test Count**: 14 tests (12 passing, 2 skipped)

#### GET /api/animals

- ✅ `should return empty results for empty query`
- ✅ `should return animals matching search query`
- ✅ `should calculate relevance scores correctly`
- ✅ `should search by phone number with normalization`
- ✅ `should handle pagination correctly`

#### POST /api/animals

- ✅ `should create a new animal with valid data`
- ✅ `should return 400 for missing required fields`

#### GET /api/animals/[id]

- ✅ `should return animal details by ID`
- ✅ `should return 404 for non-existent animal`
- ✅ `should return 404 for invalid ID format`

#### PUT /api/animals/[id]

- ✅ `should update animal details`
- ⏭️ `should return 404 for non-existent animal` (SKIPPED - missing P2025 error handling)

#### DELETE /api/animals/[id]

- ✅ `should delete animal successfully`
- ⏭️ `should return 404 for non-existent animal` (SKIPPED - missing P2025 error handling)

### Customers API (`src/__tests__/api/customers.test.ts`)

**Test Count**: 12 tests (all passing)

#### GET /api/customers

- ✅ `should return empty results for empty query`
- ✅ `should return customers matching search query`
- ✅ `should search by phone number`
- ✅ `should handle pagination correctly`

#### POST /api/customers

- ✅ `should create a new customer with valid data`
- ✅ `should return 400 for missing required fields`
- ✅ `should normalize phone numbers on creation`

#### GET /api/customers/[id]

- ✅ `should return customer details by ID`
- ✅ `should return 404 for non-existent customer`

#### PUT /api/customers/[id]

- ✅ `should update customer details`

#### DELETE /api/customers/[id]

- ✅ `should delete customer when no animals exist`
- ✅ `should return 400 when customer has associated animals`

### Breeds API (`src/__tests__/api/breeds.test.ts`)

**Test Count**: 8 tests (6 passing, 2 skipped)

#### GET /api/breeds

- ✅ `should return list of all breeds sorted by name`
- ✅ `should return empty array when no breeds exist`

#### POST /api/breeds

- ✅ `should create a new breed with valid data`
- ✅ `should return 400 for missing required fields`
- ⏭️ `should return 400 for invalid avgtime (negative)` (SKIPPED - missing validation)
- ⏭️ `should return 400 for invalid avgcost (negative)` (SKIPPED - missing validation)

#### PUT /api/breeds/[id]

- ✅ `should update breed details`
- ✅ `should allow partial updates`

#### DELETE /api/breeds/[id]

- ✅ `should delete breed when no animals reference it`
- ✅ `should return 400 when breed is referenced by animals`

### Notes API (`src/__tests__/api/notes.test.ts`)

**Test Count**: 8 tests (7 passing, 1 skipped)

#### POST /api/animals/[id]/notes

- ✅ `should create a new note for an animal`
- ⏭️ `should return 404 when animal does not exist` (SKIPPED - missing validation)
- ✅ `should return 400 for missing required fields`

#### GET /api/notes/[noteId]

- ✅ `should return note details by ID`
- ✅ `should return 404 for non-existent note`

#### PUT /api/notes/[noteId]

- ✅ `should update note content`
- ✅ `should allow partial updates`

#### DELETE /api/notes/[noteId]

- ✅ `should delete note by ID`

## Component Tests

### EmptyState (`src/__tests__/components/EmptyState.test.tsx`)

**Test Count**: 7 tests (all passing)

- ✅ `should render the main heading`
- ✅ `should render the search icon`
- ✅ `should render the instruction text`
- ✅ `should render all suggestion buttons`
- ✅ `should call onSuggestionClick when a suggestion button is clicked`
- ✅ `should call onSuggestionClick with correct suggestion for each button`
- ✅ `should render the "Try searching for" section heading`

**Coverage**: Rendering, user interactions, callbacks

### Breadcrumbs (`src/__tests__/components/Breadcrumbs.test.tsx`)

**Test Count**: 7 tests (all passing)

- ✅ `should render a single breadcrumb item`
- ✅ `should render multiple breadcrumb items with separators`
- ✅ `should render links for non-current items with href`
- ✅ `should not render a link for the last item`
- ✅ `should apply breadcrumb-current class to last item`
- ✅ `should render with aria-label for accessibility`
- ✅ `should handle items without href`

**Coverage**: Rendering, navigation, accessibility (ARIA labels)

### AnimalCard (`src/__tests__/components/AnimalCard.test.tsx`)

**Test Count**: 20 tests (all passing)

- ✅ `should render animal name and breed`
- ✅ `should render animal initials in avatar`
- ✅ `should render customer name`
- ✅ `should render customer address`
- ✅ `should render customer suburb and postcode`
- ✅ `should format postcode with leading zeros`
- ✅ `should render phone numbers`
- ✅ `should render phone separator between multiple phones`
- ✅ `should render animal colour`
- ✅ `should render formatted last visit date`
- ✅ `should call onClick when card is clicked`
- ✅ `should navigate to customer page when customer area is clicked`
- ✅ `should handle customer without firstname`
- ✅ `should handle missing customer address`
- ✅ `should handle missing suburb and postcode`
- ✅ `should handle missing phone numbers`
- ✅ `should display N/A for missing colour`
- ✅ `should render Color and Last Visit labels`

**Coverage**: Rendering, data formatting, user interactions, navigation, edge cases

### Pagination (`src/__tests__/components/Pagination.test.tsx`)

**Test Count**: 11 tests (all passing)

- ✅ `should not render when totalPages is 1`
- ✅ `should not render when totalPages is less than 1`
- ✅ `should render pagination controls when totalPages > 1`
- ✅ `should disable Prev button on first page`
- ✅ `should enable Prev button when not on first page`
- ✅ `should disable Next button on last page`
- ✅ `should enable Next button when not on last page`
- ✅ `should call onChange with previous page when Prev is clicked`
- ✅ `should call onChange with next page when Next is clicked`
- ✅ `should display correct current page and total pages`
- ✅ `should handle navigation through multiple pages`

**Coverage**: Conditional rendering, button states, user interactions, page navigation

### Toast (`src/__tests__/components/Toast.test.tsx`)

**Test Count**: 13 tests (all passing)

- ✅ `should render the toast with message`
- ✅ `should render close button`
- ✅ `should call onClose when close button is clicked`
- ✅ `should automatically close after default duration (3000ms)`
- ✅ `should automatically close after custom duration`
- ✅ `should not close before duration elapses`
- ✅ `should render with success styling`
- ✅ `should render with error styling`
- ✅ `should render with info styling by default`
- ✅ `should render with info styling when type is explicitly info`
- ✅ `should be positioned at bottom-right`
- ✅ `should have high z-index for visibility`
- ✅ `should cleanup timer on unmount`

**Coverage**: Rendering, auto-close timing, styling variants, positioning, cleanup

### ConfirmDialog (`src/__tests__/components/ConfirmDialog.test.tsx`)

**Test Count**: 13 tests (all passing)

- ✅ `should not render when open is false`
- ✅ `should render when open is true`
- ✅ `should render default title`
- ✅ `should render custom title`
- ✅ `should render the message`
- ✅ `should render default confirm and cancel button text`
- ✅ `should render custom confirm and cancel button text`
- ✅ `should call onConfirm when confirm button is clicked`
- ✅ `should call onCancel when cancel button is clicked`
- ✅ `should call onCancel when Escape key is pressed`
- ✅ `should not call onCancel on Escape when dialog is closed`
- ✅ `should have backdrop overlay`
- ✅ `should be positioned in center of screen`
- ✅ `should have high z-index`
- ✅ `should cleanup event listener on unmount`

**Coverage**: Conditional rendering, user interactions, keyboard events, positioning, cleanup

## Store Tests

### animalsStore (`src/__tests__/store/animalsStore.test.ts`)

**Test Count**: 21 tests (all passing)

#### Initial State

- ✅ `should have correct initial state`

#### Basic Setters

- ✅ `should set animals`
- ✅ `should set selected animal`
- ✅ `should set pagination`
- ✅ `should set search params`
- ✅ `should set loading state`
- ✅ `should set error`
- ✅ `should clear search`

#### Search Animals

- ✅ `should search animals successfully`
- ✅ `should set loading state during search`
- ✅ `should handle search error`

#### Fetch Animal

- ✅ `should fetch single animal successfully`
- ✅ `should handle fetch animal error`

#### Create Animal

- ✅ `should create animal successfully`
- ✅ `should handle create animal error`
- ✅ `should refresh search after creating animal`

#### Update Animal

- ✅ `should update animal successfully`
- ✅ `should update selected animal if it matches`
- ✅ `should handle update animal error`

#### Delete Animal

- ✅ `should delete animal successfully`
- ✅ `should handle delete animal error`

**Coverage**: State management, async actions, error handling, API integration

## End-to-End Tests

### Search Flow (`e2e/search-flow.spec.ts`)

**Test Count**: 5 tests

- ✅ `should search for an animal and view details`
- ✅ `should use suggestion chips to search`
- ✅ `should show empty state when no search is performed`
- ✅ `should clear search and return to empty state`
- ✅ `should navigate to customer page from animal card`

**Coverage**: Complete search workflow, navigation, empty states

### Animal Management (`e2e/animal-management.spec.ts`)

**Test Count**: 5 tests + 1 navigation test

- ✅ `should view animal details with customer information`
- ✅ `should navigate back to search results`
- ✅ `should display service notes if available`
- ✅ `should show breed details on animal page`
- ✅ `should display last visit and this visit dates`
- ✅ `should navigate to customer page from animal details`

**Coverage**: Animal detail viewing, navigation, data display

### Homepage (`e2e/homepage.spec.ts`)

**Test Count**: 1 test (legacy smoke test)

- ✅ `loads the Next.js homepage and captures a screenshot`

**Coverage**: Basic page loading, Next.js hydration

## Test Conventions

### File Naming

- **Component tests**: `ComponentName.test.tsx`
- **API tests**: `route.test.ts` or `feature.test.ts`
- **Store tests**: `storeName.test.ts`
- **E2E tests**: `feature-name.spec.ts`

### Test Structure

```typescript
describe('Feature or Component', () => {
  beforeEach(() => {
    // Setup for each test
  })

  afterEach(() => {
    // Cleanup after each test
  })

  it('should behave in expected way when condition', () => {
    // Arrange: Set up test data
    // Act: Perform the action
    // Assert: Verify the outcome
  })
})
```

### Naming Conventions

- Test names should be descriptive and explain the expected behavior
- Use "should" prefix: `should render the header correctly`
- Include the condition: `should display error when validation fails`

### Mocking Strategy

- **API Routes**: Mock Prisma client for unit tests
- **Components**: Mock Next.js router and hooks
- **Stores**: Mock global `fetch` for API calls
- **E2E**: No mocking - test against real application

## Troubleshooting

### Tests Fail with "Request is not defined"

**Cause**: Test is running in jsdom environment but needs Node.js APIs.

**Solution**: Add `/** @jest-environment node */` comment at top of test file.

### Component Tests Fail with Router Errors

**Cause**: Next.js `useRouter` not mocked.

**Solution**: Mocks are in `jest.setup.ts`. Verify test runs with jest-dom environment.

### E2E Tests Timeout

**Cause**: Page not fully loaded before assertions.

**Solution**: Use `await page.waitForLoadState('networkidle')` and increase timeouts.

### Store Tests Fail with Fetch Errors

**Cause**: Global `fetch` not mocked.

**Solution**: Add `global.fetch = jest.fn()` and mock responses for each test.

### Tests Pass Locally but Fail in CI

**Cause**: Timing issues or environment differences.

**Solution**: Use `act()` wrapper for state updates, avoid hard-coded timeouts.

## Future Enhancements

### Planned Test Additions

- [ ] **Page Integration Tests** (Phase 5): Test Next.js pages with data fetching
- [ ] **Additional Store Tests**: customersStore, breedsStore
- [ ] **Additional E2E Tests**: Customer management, breed management flows
- [ ] **Integration Tests with Real DB**: Test against actual database for schema validation
- [ ] **Performance Tests**: Test search relevance algorithm performance
- [ ] **Accessibility Tests**: Automated a11y testing with axe-core

### Test Infrastructure Improvements

- [ ] Test database setup scripts
- [ ] Automated test data seeding
- [ ] Visual regression testing with Playwright
- [ ] API contract testing
- [ ] Mutation testing for code quality

## Validation Gaps (Skipped Tests)

The following tests are skipped and document missing validation in the API:

1. **Animals API**: PUT and DELETE endpoints lack P2025 error handling for non-existent records
2. **Breeds API**: POST endpoint doesn't validate negative values for avgtime and avgcost
3. **Notes API**: POST endpoint doesn't validate if animal exists before creating note

These gaps should be addressed in future API improvements.

---

**Last Updated**: 2025-11-16  
**Test Suite Version**: 1.0.0  
**Maintained By**: Development Team
