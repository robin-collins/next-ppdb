# Database Migration Guide

## Overview

This guide explains how to safely apply the schema normalization migration to your database using Prisma's migration system.

## What This Migration Does

The migration performs the following changes:

1. **Data Cleanup**: Removes invalid '0000-00-00' sentinel dates
2. **Storage Optimization**: Converts all tables to InnoDB with utf8mb4 character set
3. **Type Corrections**: Changes IDs to `INT UNSIGNED` for better range
4. **Column Renames**:
   - `animal.SEX` → `animal.sex`
   - `notes.notes` → `notes.note_text`
   - `notes.date` → `notes.note_date`
5. **Field Size Updates**: Increases VARCHAR limits for better data storage
6. **Foreign Key Changes**: Updates constraints from CASCADE to RESTRICT for data safety
7. **Index Additions**: Adds performance indexes on commonly queried fields
8. **Unique Constraints**: Adds unique constraint on `breed.breedname`

## Prerequisites

Before running the migration:

1. **BACKUP YOUR DATABASE** - This is critical:

   ```bash
   mysqldump -u your_user -p ppdb-app > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. Ensure you have database privileges to:
   - ALTER tables
   - DROP and CREATE foreign keys
   - CREATE indexes

## Step-by-Step Application Process

### Step 1: Mark Migration as Applied (Baseline)

Since this is the first Prisma migration on an existing database, you need to establish a baseline:

```bash
# This tells Prisma the migration has been applied without actually running it
pnpm prisma migrate resolve --applied 20251004154300_schema_normalization
```

### Step 2: Apply the Migration to Your Database

**Option A: Using Prisma (Recommended)**

```bash
# Apply the migration
pnpm prisma migrate deploy
```

**Option B: Manual SQL Application (if you prefer direct control)**

```bash
# Connect to your MySQL database
mysql -u your_user -p ppdb-app < prisma/migrations/20251004154300_schema_normalization/migration.sql
```

### Step 3: Verify the Migration

```bash
# Check that Prisma sees the database as in sync
pnpm prisma migrate status
```

Expected output: "Database schema is up to date!"

### Step 4: Regenerate Prisma Client

```bash
# Generate the new TypeScript types
pnpm prisma generate
```

### Step 5: Update Application Code

The following changes may be needed in your application code:

1. **Column Name Changes:**
   - Replace all references to `SEX` with `sex`
   - Replace `notes.notes` with `notes.note_text`
   - Replace `notes.date` with `notes.note_date`

2. **Type Changes:**
   - `customer.postcode` is now a `String` (was `Int`)
   - Remove any code handling '0000-00-00' dates (they're now NULL)

3. **Foreign Key Behavior:**
   - DELETE operations on parent records (breed, customer, animal) will now be RESTRICTED
   - Your application must handle these cases explicitly

### Step 6: Test Thoroughly

Run your application and test:

- [ ] All existing records are accessible
- [ ] Search functionality works
- [ ] Create/Update/Delete operations work
- [ ] Foreign key restrictions are properly handled

## Rollback Plan

If something goes wrong:

1. **Restore from backup:**

   ```bash
   mysql -u your_user -p ppdb-app < backup_YYYYMMDD_HHMMSS.sql
   ```

2. **Revert schema.prisma:**

   ```bash
   git checkout HEAD~1 prisma/schema.prisma
   pnpm prisma generate
   ```

3. **Remove migration record:**
   ```bash
   pnpm prisma migrate resolve --rolled-back 20251004154300_schema_normalization
   ```

## Troubleshooting

### Error: "Duplicate key name 'ix_animalname'"

The index already exists. Remove these lines from the migration:

```sql
CREATE INDEX ix_animalname  ON animal (animalname);
CREATE INDEX ix_breedID     ON animal (breedID);
CREATE INDEX ix_customerID  ON animal (customerID);
CREATE INDEX ix_animalID ON notes (animalID);
```

### Error: "Foreign key constraint fails"

Some animal records may reference non-existent breed or customer IDs. Find and fix orphaned records:

```sql
-- Find orphaned animals
SELECT * FROM animal a
LEFT JOIN breed b ON a.breedID = b.breedID
WHERE b.breedID IS NULL;

SELECT * FROM animal a
LEFT JOIN customer c ON a.customerID = c.customerID
WHERE c.customerID IS NULL;
```

### Error: "Duplicate entry for key 'uq_breedname'"

Some breeds may have duplicate names. Find and merge them:

```sql
SELECT breedname, COUNT(*) as count
FROM breed
GROUP BY breedname
HAVING count > 1;
```

## Post-Migration Checklist

- [ ] Database backup created
- [ ] Migration applied successfully
- [ ] Prisma client regenerated
- [ ] Application code updated for column renames
- [ ] All tests passing
- [ ] Production deployment planned
- [ ] Team notified of changes

## Questions or Issues?

If you encounter problems:

1. Check the Prisma migration logs
2. Review the MySQL error log
3. Verify database user permissions
4. Ensure DATABASE_URL in `.env` is correct
