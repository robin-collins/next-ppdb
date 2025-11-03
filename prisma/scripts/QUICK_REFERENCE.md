# Quick Reference: Database & Validation Strategy

## Current Status

✅ **Prisma Schema**: Updated to match production database EXACTLY
✅ **Documentation**: CLAUDE.md updated with migration strategy
✅ **Strategy**: Drop-in replacement approach documented

## Key Understanding

### The Database is the Source of Truth

Production database schema is defined in `reference/PPDB/*.sql`:

- `customer.sql` - Customer records
- `animal.sql` - Animal records
- `breed.sql` - Breed definitions
- `notes.sql` - Service notes

**DO NOT modify this database structure for initial deployment!**

## Known Data Quirks

| Issue       | Database Reality                   | Application Handling                 |
| ----------- | ---------------------------------- | ------------------------------------ |
| Postcode    | `smallint(4)` integer              | Display as string, convert on input  |
| Colour      | `text NOT NULL`, can be empty `''` | Show "Not specified" if empty        |
| Dates       | Can be `'0000-00-00'`              | Check validity, show null if invalid |
| Field Sizes | Small (varchar(12), varchar(20))   | Accept as-is, may truncate           |

## Search Error Resolution

### Problem

```
Error converting field postcode of expected non-nullable type String,
found incompatible value of 5159
```

### Root Cause

- Database has `postcode` as `smallint(4)` (integer)
- Application expected `String`

### Solution

✅ Updated Prisma schema:

```prisma
postcode Int? @default(0) @db.SmallInt  // NOT String!
```

### Application Layer Conversion

```typescript
// Display
const displayPostcode = customer.postcode?.toString() || ''

// Input (API/forms)
const dbPostcode = parseInt(inputPostcode) || 0
```

## Available Scripts

### Ready to Use (Post-Deployment Only)

Located in `prisma/scripts/`:

1. **`fix-invalid-dates.mjs`**
   - Fixes `'0000-00-00'` dates → `'1900-01-01'`
   - Safe to run after deployment
   - Minimal changes (2-3 records typically)

2. **`add-date-constraints.mjs`**
   - Adds CHECK constraints for date validation
   - Prevents future invalid dates
   - Run after fixing existing dates

3. **`test-date-validation.mjs`**
   - Tests that date constraints work
   - Use to verify cleanup

### NOT for Initial Deployment

4. **`comprehensive-cleanup.mjs`** ⚠️
   - Converts postcode to string
   - Expands field sizes
   - **Violates drop-in replacement requirement**
   - Save for Phase 3 (future enhancements)

5. **`audit-schema.mjs`**
   - Diagnostic tool
   - Shows actual vs expected schema
   - Use when debugging type mismatches

## Testing Checklist

Before considering deployment ready:

- [ ] `pnpm prisma generate` succeeds without errors
- [ ] Application starts (`pnpm dev`)
- [ ] Search works (test with "Maltese")
- [ ] Animals display with postcodes shown as strings
- [ ] No Prisma type conversion errors in console
- [ ] Can create/update records

## Next Steps

### 1. NOW: Test the Application

```bash
pnpm prisma generate
pnpm dev
# Test search functionality
```

### 2. After Testing: Deploy to Production

- No database changes needed
- Application works with existing DB as-is

### 3. Post-Deployment (Optional)

```bash
# Backup first!
mysqldump -u user -p dbname > backup.sql

# Then run cleanup scripts
node prisma/scripts/fix-invalid-dates.mjs
node prisma/scripts/add-date-constraints.mjs
```

### 4. Future (Much Later)

- Consider schema enhancements
- Create proper migrations
- Test in dev environment first

## Common Pitfalls to Avoid

❌ Don't modify database schema before deployment
❌ Don't run comprehensive-cleanup.mjs yet
❌ Don't expect strict validation of historical data
❌ Don't try to "fix" the production database structure

✅ Do handle conversions in application layer
✅ Do test with actual production-like data
✅ Do keep cleanup scripts for post-deployment
✅ Do document all data transformation logic

## Getting Help

- **Migration Strategy**: See `MIGRATION_STRATEGY.md`
- **Data Cleanup**: See `COMPREHENSIVE_DATA_CLEANUP.md`
- **Project Instructions**: See `../../CLAUDE.md`
- **Prisma Docs**: https://www.prisma.io/docs
