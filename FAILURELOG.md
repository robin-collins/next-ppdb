# Failure Log

This document tracks attempted solutions that did not work as intended and lessons learned.

##

Build Errors During Testing Implementation

**Date**: 2025-11-16  
**Issue**: Type errors in test files after implementing comprehensive testing suite

### Problem Description

After implementing the comprehensive testing suite (134 passing tests), multiple TypeScript type errors appeared related to:

1. **Prisma Mock Type Assertions** (73 errors):
   - The `mockPrismaClient()` helper returns `jest.fn()` for each method
   - TypeScript doesn't automatically recognize these as `jest.Mock` types
   - Calling `.mockResolvedValue()` or `.mockRejectedValue()` fails type checking
   - Example error: `Property 'mockResolvedValue' does not exist on type...`

2. **NextRequest Params Type** (multiple files):
   - API route handlers expect `params: Promise<{ id: string }>` (Next.js 15)
   - Test code was passing `params: { id: string }` (plain object)
   - Required wrapping in `Promise.resolve()` for all dynamic route tests

3. **RequestInit Type Mismatch**:
   - Node.js `RequestInit` allows `signal: AbortSignal | null | undefined`
   - Next.js `RequestInit` only allows `signal: AbortSignal | undefined` (no null)
   - Caused incompatibility when creating `NextRequest` in test helpers

4. **Database Field Name Mismatches**:
   - Using `color` instead of `colour` (Prisma schema uses British spelling)
   - Date fields as strings instead of `Date` objects

### Attempted Solutions

#### Attempt 1: Individual Type Casts

- **What**: Cast each Prisma mock call to `jest.Mock` individually
- **Result**: Works but extremely tedious - requires changes in 73+ locations
- **Example**: `(mockPrisma.animal.findMany as jest.Mock).mockResolvedValue(...)`
- **Why Failed**: Not scalable - would require extensive changes across all test files

#### Attempt 2: Fix RequestInit Type

- **What**: Create custom type for request init to avoid Node.js/Next.js mismatch
- **Result**: Used `as unknown as RequestInit` double cast
- **Status**: ✅ Working solution

#### Attempt 3: Wrap Params in Promise

- **What**: Update all API route test calls to use `Promise.resolve({ id: string })`
- **Result**: Fixed some tests (notes.test.ts line 257)
- **Status**: ⚠️ Partial - needs to be applied to all API tests

### Root Cause

The `mockPrismaClient()` helper function in `src/__tests__/helpers/mocks.ts` returns an object with `jest.fn()` calls, but TypeScript infers the return type as the actual Prisma types, not as Jest mocks.

```typescript
// Current implementation
export function mockPrismaClient() {
  return {
    animal: {
      findMany: jest.fn(), // TypeScript sees this as Prisma's findMany type
      create: jest.fn(), // Not as jest.Mock
      //...
    },
  }
}
```

### Recommended Solutions

#### Option A: Type Assertion in Mock Helper (Preferred)

Update `mockPrismaClient()` to return properly typed mocks:

```typescript
export function mockPrismaClient() {
  return {
    animal: {
      findMany: jest.fn() as jest.MockedFunction<
        typeof PrismaClient.prototype.animal.findMany
      >,
      create: jest.fn() as jest.MockedFunction<
        typeof PrismaClient.prototype.animal.create
      >,
      // ... for all methods
    },
  } as jest.Mocked<PrismaClient>
}
```

#### Option B: Use Actual Jest Mock Utilities

Use `jest.mocked()` or create mock with proper types:

```typescript
import { PrismaClient } from '@/generated/prisma'
import { mockDeep, DeepMockProxy } from 'jest-mock-extended'

export function mockPrismaClient(): DeepMockProxy<PrismaClient> {
  return mockDeep<PrismaClient>()
}
```

Requires installing: `pnpm add -D jest-mock-extended`

#### Option C: Individual Casts (Current Workaround)

Continue casting each mock call individually:

```typescript
;(mockPrisma.animal.findMany as jest.Mock).mockResolvedValue(mockAnimals)
```

Pros: No changes to mock helper
Cons: Requires ~73 changes across all test files

### Impact

- ✅ **Tests**: All 134 tests pass when run with `pnpm test`
- ❌ **Type Check**: Fails with 73+ type errors
- ❌ **Build**: Cannot build with type errors present
- ✅ **Lint**: Passes after removing unused imports

### Status

**Current State**: Tests pass functionally but fail type checking

**Next Steps**:

1. Choose solution approach (recommend Option B - jest-mock-extended)
2. Update `mockPrismaClient()` helper
3. Update all API route test params to use `Promise.resolve()`
4. Verify all type checks pass
5. Verify all tests still pass

### Lessons Learned

1. **Type test helpers early**: Mock utilities should be type-checked before writing tests
2. **Next.js 15 async params**: All dynamic route params are now Promises
3. **RequestInit compatibility**: Node.js and Next.js types differ, need careful casting
4. **Database field naming**: Always use exact Prisma schema field names (colour not color)
5. **Date types**: Zustand store expects `Date` objects, not strings

### Prevention

- Add `pnpm type-check` to test script: `"test": "jest && tsc --noEmit"`
- Create typed mock factories early in development
- Document type requirements for test helpers
- Run type-check after creating each test file, not at the end

---

## Database Schema Issue: notes.noteID Missing AUTO_INCREMENT

**Date**: 2025-11-16  
**Issue**: POST `/api/animals/[id]/notes` fails with null constraint violation

### Problem Description

When creating service notes, the API returns:

```
Invalid `prisma.notes.create()` invocation:
Null constraint violation on the fields: (`noteID`)
```

### Root Cause

The `notes` table in the MySQL database is missing the `AUTO_INCREMENT` attribute on the `noteID` primary key column, even though the Prisma schema correctly defines it as `@default(autoincrement())`.

### Solution

Created migration script: `prisma/migrations/fix_notes_autoincrement.sql`

```sql
ALTER TABLE notes
MODIFY COLUMN noteID MEDIUMINT NOT NULL AUTO_INCREMENT;
```

### Documentation

Full details in: `DATABASE_FIXES.md`

### Status

⚠️ **Requires manual database fix** - Migration script ready but not yet applied

---

_End of Failure Log_
