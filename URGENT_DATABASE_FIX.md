# URGENT: Complete Database AUTO_INCREMENT Fix

## Problem Summary

**ALL primary key tables** in the database are missing the `AUTO_INCREMENT` attribute:

- ❌ `customer.customerID`
- ❌ `animal.animalID`
- ❌ `breed.breedID`
- ✅ `notes.noteID` (FIXED)

### Current Errors

When trying to create records, you get:

```
Error: Null constraint violation on the fields: (`customerID`)
Error: Null constraint violation on the fields: (`animalID`)
Error: Null constraint violation on the fields: (`breedID`)
```

## Root Cause

The database was migrated from the original PHP application without properly setting AUTO_INCREMENT on primary keys. The Prisma schema correctly defines `@default(autoincrement())` but the actual MySQL database columns don't have the AUTO_INCREMENT attribute.

## Solution

Due to foreign key constraints, the tables must be fixed in a specific order.

### Option 1: Manual SQL (Recommended if mysql client available)

If you have `mysql` command-line client installed:

```bash
# Connect to database
mysql -u YOUR_USER -p YOUR_DATABASE

# Run these commands in order:
```

```sql
-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Fix all primary keys
ALTER TABLE customer MODIFY COLUMN customerID MEDIUMINT NOT NULL AUTO_INCREMENT;
ALTER TABLE breed MODIFY COLUMN breedID MEDIUMINT NOT NULL AUTO_INCREMENT;
ALTER TABLE animal MODIFY COLUMN animalID MEDIUMINT NOT NULL AUTO_INCREMENT;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify the fix
SHOW CREATE TABLE customer\G
SHOW CREATE TABLE animal\G
SHOW CREATE TABLE breed\G
```

### Option 2: Using DATABASE_URL

Extract your credentials from `.env` and run:

```bash
# Get connection details from your .env file
# DATABASE_URL=mysql://USER:PASS@HOST:PORT/DATABASE

mysql -h HOST -P PORT -u USER -pPASS DATABASE << 'EOF'
SET FOREIGN_KEY_CHECKS = 0;
ALTER TABLE customer MODIFY COLUMN customerID MEDIUMINT NOT NULL AUTO_INCREMENT;
ALTER TABLE breed MODIFY COLUMN breedID MEDIUMINT NOT NULL AUTO_INCREMENT;
ALTER TABLE animal MODIFY COLUMN animalID MEDIUMINT NOT NULL AUTO_INCREMENT;
SET FOREIGN_KEY_CHECKS = 1;
EOF
```

### Option 3: Via Database GUI

If using a database GUI (phpMyAdmin, MySQL Workbench, TablePlus, etc.):

1. Open SQL editor
2. Run this script:

```sql
SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE customer
MODIFY COLUMN customerID MEDIUMINT NOT NULL AUTO_INCREMENT;

ALTER TABLE breed
MODIFY COLUMN breedID MEDIUMINT NOT NULL AUTO_INCREMENT;

ALTER TABLE animal
MODIFY COLUMN animalID MEDIUMINT NOT NULL AUTO_INCREMENT;

SET FOREIGN_KEY_CHECKS = 1;
```

## Why Prisma db execute Doesn't Work

The `npx prisma db execute` command doesn't properly handle:

- `SET FOREIGN_KEY_CHECKS` statements
- Foreign key constraint conflicts
- Multi-statement transactions with ALTER TABLE

This is a known limitation. **You must use direct MySQL connection** for this fix.

## Verification

After applying the fix, verify each table:

```sql
SHOW CREATE TABLE customer;
-- Should show: `customerID` mediumint NOT NULL AUTO_INCREMENT

SHOW CREATE TABLE breed;
-- Should show: `breedID` mediumint NOT NULL AUTO_INCREMENT

SHOW CREATE TABLE animal;
-- Should show: `animalID` mediumint NOT NULL AUTO_INCREMENT
```

## Testing After Fix

Once fixed, test creating records:

### 1. Create a Customer

```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{"surname": "Smith", "firstname": "John", "phone1": "0400123456"}'
```

**Expected**: 201 Created with customer ID  
**Before Fix**: 500 "Null constraint violation on customerID"

### 2. Create a Breed

```bash
curl -X POST http://localhost:3000/api/breeds \
  -H "Content-Type: application/json" \
  -d '{"breedname": "Test Breed", "avgtime": "60", "avgcost": 40}'
```

**Expected**: 201 Created with breed ID  
**Before Fix**: 500 "Null constraint violation on breedID"

### 3. Create an Animal

```bash
curl -X POST http://localhost:3000/api/animals \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Buddy",
    "breed": "Labrador",
    "sex": "Male",
    "customerId": 1,
    "lastVisit": "2024-01-15T00:00:00.000Z",
    "thisVisit": "2024-01-20T00:00:00.000Z"
  }'
```

**Expected**: 201 Created with animal ID  
**Before Fix**: 500 "Null constraint violation on animalID"

## Status

- ✅ Issue identified
- ✅ SQL fix script created
- ⚠️ **REQUIRES MANUAL DATABASE ACCESS**
- ⚠️ Cannot be fixed via Prisma CLI alone

## Impact

**HIGH PRIORITY** - Blocks all record creation in the application:

- Cannot add customers
- Cannot add animals
- Cannot add breeds
- Cannot add service notes (partially fixed)

## Related Files

- `prisma/migrations/fix_notes_autoincrement.sql` - Notes fix (applied)
- `prisma/migrations/fix_all_autoincrement.sql` - Complete fix (needs manual run)
- `DATABASE_FIXES.md` - Complete documentation
- `FAILURELOG.md` - Other known issues

## Prevention

After this is fixed:

1. **Always use Prisma migrations** for schema changes
2. **Verify AUTO_INCREMENT** is set when creating tables
3. **Test record creation** after migrations
4. **Document manual SQL** if Prisma migrations don't work

---

**Last Updated**: 2025-11-16  
**Status**: Awaiting manual database fix
