# Database Migration Strategy for PPDB

## Core Principle: Drop-in Replacement

**CRITICAL**: This application must work as a drop-in replacement for the existing PHP application with **ZERO database modifications** required for initial deployment.

## Current Database State (Production)

Based on original SQL schemas in `reference/PPDB/*.sql`:

### Data Types (As-Is)

- `customer.postcode`: `smallint(4)` (INTEGER, not string!)
- `animal.colour`: `text NOT NULL` (never NULL, but can be empty string)
- `animal.lastvisit/thisvisit`: `date NOT NULL DEFAULT '0000-00-00'` (invalid dates exist)
- Field sizes: varchar(12), varchar(20), varchar(10) - SMALL!

### Data Quality Issues (Known "Dirty Data")

1. **Invalid Dates**: `'0000-00-00'` defaults exist in production
2. **Numeric Postcodes**: Australian postcodes stored as integers (e.g., 5159)
3. **Empty Colours**: Empty strings `''` for colour field
4. **Small Field Sizes**: Names truncated to 12/20 chars

## Phase 1: Initial Deployment (NOW)

### Goal

Deploy application that works with production database EXACTLY as-is.

### Implementation

#### 1. Prisma Schema (DONE)

- ✅ Match exact column types from original SQL
- ✅ `postcode` as `Int?` not `String?`
- ✅ `colour` as `String` not `String?`
- ✅ Date fields as `DateTime` with invalid defaults
- ✅ Match exact field sizes (varchar(12), varchar(20), etc.)

#### 2. Application Layer Data Conversion

Handle conversions in TypeScript/JavaScript:

```typescript
// Display postcode as string
const displayPostcode = animal.customer.postcode?.toString() || ''

// Handle invalid dates
const isValidDate = date => date && date > new Date('1900-01-01')
const displayDate = isValidDate(animal.lastvisit) ? animal.lastvisit : null

// Handle empty colour
const displayColour = animal.colour?.trim() || 'Not specified'
```

#### 3. API Transformation Layer

Transform data at API boundaries:

- **IN**: Accept modern formats (string postcode, proper dates)
- **OUT**: Return modern formats
- **Storage**: Convert to database format before Prisma operations

#### 4. Validation (Permissive)

Zod schemas should:

- ✅ Accept invalid dates for now (allow historical data)
- ✅ Convert string postcodes to integers
- ✅ Allow empty strings for colour
- ❌ Don't enforce strict validation yet

## Phase 2: Post-Deployment Cleanup (OPTIONAL)

**Only run AFTER successful deployment and testing!**

### Available Cleanup Scripts

Located in `prisma/scripts/`:

1. **`fix-invalid-dates.mjs`**
   - Converts `'0000-00-00'` dates to `'1900-01-01'`
   - Updates 2-3 records typically

2. **`add-date-constraints.mjs`**
   - Adds CHECK constraints: `date >= '1900-01-01'`
   - Prevents future invalid dates

3. **`comprehensive-cleanup.mjs`** ⚠️ **NOT FOR PRODUCTION YET**
   - Converts postcode to VARCHAR(10)
   - Makes colour nullable
   - Expands field sizes
   - **SKIP THIS - violates drop-in requirement**

### Recommended Post-Deployment Sequence

```bash
# 1. Backup database first!
mysqldump -u user -p dbname > backup-before-cleanup.sql

# 2. Fix invalid dates only
node prisma/scripts/fix-invalid-dates.mjs

# 3. Add date constraints
node prisma/scripts/add-date-constraints.mjs

# 4. Monitor for a week

# 5. LATER: Consider schema enhancements (new migrations)
```

## Phase 3: Future Enhancements (LATER)

After application is stable in production, create proper migrations for:

1. **Postcode Expansion**

   ```sql
   ALTER TABLE customer MODIFY COLUMN postcode VARCHAR(10) NULL;
   ```

2. **Field Size Increases**

   ```sql
   ALTER TABLE customer MODIFY COLUMN surname VARCHAR(50);
   ALTER TABLE animal MODIFY COLUMN animalname VARCHAR(50);
   ```

3. **Proper Defaults**
   ```sql
   ALTER TABLE animal MODIFY COLUMN lastvisit DATE NULL DEFAULT NULL;
   ALTER TABLE animal MODIFY COLUMN colour VARCHAR(100) NULL DEFAULT NULL;
   ```

These should be:

- Tested in dev
- Documented in migration scripts
- Applied with rollback plan
- Done during maintenance window

## Key Differences from Initial Approach

### ❌ What I Did Wrong

- Modified database schema immediately
- Assumed Prisma schema was source of truth
- Broke drop-in replacement requirement

### ✅ What We're Doing Now

- Prisma schema matches production EXACTLY
- Handle data quirks in application layer
- Cleanup scripts are OPTIONAL and LATER
- Application works with dirty data

## Testing Checklist

- [ ] Application starts without Prisma errors
- [ ] Search works with integer postcodes
- [ ] Displays work with invalid dates
- [ ] Create/update operations succeed
- [ ] No database modifications required
- [ ] Can swap with PHP app transparently

## Notes

- Original database is MyISAM (no foreign keys)
- Current database may be InnoDB (has foreign keys added)
- Engine difference is okay - constraint names may differ
- Focus on column types and data, not constraints
