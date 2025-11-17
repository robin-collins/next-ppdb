# Database Schema Fixes

This document tracks database schema issues discovered during testing and their resolutions.

## CRITICAL: Multiple Tables Missing AUTO_INCREMENT

**Update 2025-11-16**: The AUTO_INCREMENT issue affects **ALL primary key tables**, not just notes:

- ❌ `customer.customerID` - Missing AUTO_INCREMENT
- ❌ `animal.animalID` - Missing AUTO_INCREMENT
- ❌ `breed.breedID` - Missing AUTO_INCREMENT
- ✅ `notes.noteID` - FIXED

This causes "Null constraint violation" errors when creating any new records.

---

## Issue: Notes Table Auto-Increment Not Working

**Discovered**: 2025-11-16  
**Error**: `Null constraint violation on the fields: (noteID)`  
**Location**: `POST /api/animals/[id]/notes`

### Problem

The `notes` table's `noteID` column is missing the `AUTO_INCREMENT` attribute in the actual database, even though the Prisma schema correctly defines it as `@default(autoincrement())`.

This causes the following error when trying to create a note:

```
Invalid `prisma.notes.create()` invocation:
Null constraint violation on the fields: (`noteID`)
```

### Root Cause

The database table was likely created from the original PHP application's schema which may have been missing the AUTO_INCREMENT attribute, or it was lost during a migration.

### Solution

Three ways to fix this issue:

#### Option 1: Automated Fix Script (Recommended)

Run the provided helper script that automatically detects and fixes the issue:

```bash
./FIX_DATABASE_NOW.sh
```

This script will:

- Extract database credentials from your `.env` file
- Check current table structure
- Apply the AUTO_INCREMENT fix
- Verify the fix worked
- Provide next steps

#### Option 2: Check First, Then Fix

If you want to verify the problem before fixing:

```bash
# Step 1: Check if AUTO_INCREMENT is missing (safe, read-only)
./CHECK_DATABASE.sh

# Step 2: Apply the fix
./FIX_DATABASE_NOW.sh
```

#### Option 3: Manual SQL

Run the migration script manually:

```bash
# Using MySQL client directly
mysql -u YOUR_USERNAME -p YOUR_DATABASE_NAME < prisma/migrations/fix_notes_autoincrement.sql

# Or using connection details from .env
mysql -u ppdb_user -p ppdb < prisma/migrations/fix_notes_autoincrement.sql
```

### Manual Fix (Alternative)

If you prefer to run the fix manually:

```sql
-- Connect to your database
mysql -u YOUR_USERNAME -p YOUR_DATABASE_NAME

-- Run this command
ALTER TABLE notes
MODIFY COLUMN noteID MEDIUMINT NOT NULL AUTO_INCREMENT;

-- Verify the fix
SHOW CREATE TABLE notes;
-- Should show: `noteID` mediumint NOT NULL AUTO_INCREMENT
```

### Verification

After applying the fix, test that note creation works:

```bash
# Test the API endpoint
curl -X POST http://localhost:3000/api/animals/1/notes \
  -H "Content-Type: application/json" \
  -d '{"notes": "Test note", "serviceDate": "2024-01-15"}'

# Should return 201 with created note data
```

### Prevention

To prevent this issue in the future:

1. **Always use Prisma migrations** when modifying the schema
2. **Verify database matches schema** after manual SQL changes
3. **Run schema validation** before deployment:
   ```bash
   npx prisma db pull  # Pull current DB schema
   npx prisma format   # Format and compare with schema.prisma
   ```

### Related Issues

This issue affects:

- Creating service notes for animals
- Any code that relies on `prisma.notes.create()`

### Status

- ✅ **FULLY RESOLVED**: All primary key columns now have AUTO_INCREMENT (2025-11-16)
- ✅ **customer.customerID** - Fixed via Prisma script
- ✅ **breed.breedID** - Fixed via Prisma script
- ✅ **animal.animalID** - Fixed via mysql client (dropped FK, altered table, recreated FK)
- ✅ **notes.noteID** - Fixed via Prisma script
- ✅ **Application Code**: No changes needed - code is correct
- 🎉 **COMPLETE**: Application is now fully functional - can create all record types!

---

## Future Schema Issues

Document any additional schema discrepancies here following the same format:

1. Issue description
2. Root cause
3. Solution steps
4. Verification method
5. Prevention measures
