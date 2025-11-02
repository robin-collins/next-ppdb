# Production Migration Guide

## Critical: Read This First

This guide is specifically for migrating a **production database** that currently has the legacy schema (`ppdb-original.sql`) to the modern normalized schema. This migration has been designed for zero data loss and includes comprehensive validation.

## Pre-Deployment Checklist

- [ ] Full database backup completed and verified
- [ ] Backup stored in secure, off-site location
- [ ] Staging environment tested with production data copy
- [ ] Application code updated for schema changes (see below)
- [ ] Maintenance window scheduled and communicated
- [ ] Rollback procedure reviewed and understood
- [ ] Database user has required privileges (ALTER, CREATE INDEX, DROP FOREIGN KEY)
- [ ] Sufficient disk space available (migration may temporarily double storage)
- [ ] MySQL version confirmed (8.0+ required)

## Expected Downtime

- **Small databases** (< 10,000 records): 2-5 minutes
- **Medium databases** (10,000 - 100,000 records): 5-15 minutes
- **Large databases** (> 100,000 records): 15-45 minutes

*Actual time depends on hardware, indexes, and data volume.*

## Step-by-Step Production Migration

### Step 1: Create Database Backup

```bash
# Create timestamped backup
BACKUP_FILE="ppdb_backup_$(date +%Y%m%d_%H%M%S).sql"
mysqldump -u root -p \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  ppdb-app > "$BACKUP_FILE"

# Verify backup was created
ls -lh "$BACKUP_FILE"

# Test backup integrity
mysql -u root -p -e "CREATE DATABASE ppdb_test;"
mysql -u root -p ppdb_test < "$BACKUP_FILE"
mysql -u root -p -e "DROP DATABASE ppdb_test;"

echo "✅ Backup verified and ready"
```

### Step 2: Run Pre-Migration Checks

```bash
cd /home/tech/projects/ppdb-ts

# Run validation script
mysql -u root -p ppdb-app < prisma/scripts/pre-migration-checks.sql > pre-migration-report.txt

# Review the report
cat pre-migration-report.txt
```

**Review the output carefully:**
- Check for orphaned records (animals with no breed/customer)
- Check for duplicate breed names
- Check for data that might be truncated
- Note any warnings about sentinel dates

**Action Items:**
- Fix any critical issues found
- Document any warnings for post-migration verification

### Step 3: Put Application in Maintenance Mode

```bash
# Stop the application
pm2 stop ppdb-app
# OR
systemctl stop ppdb-app
# OR
docker-compose stop app

# Verify application is stopped
curl http://localhost:3000  # Should fail or show maintenance page
```

### Step 4: Apply the Migration

**Using Prisma (Recommended):**

```bash
cd /home/tech/projects/ppdb-ts

# Set production database URL
export DATABASE_URL="mysql://user:password@localhost:3306/ppdb-app"

# Deploy migration
pnpm prisma migrate deploy

# Expected output:
# ✔ 1 migration found in prisma/migrations
# ✔ Applying migration `20251004154300_schema_normalization`
# ✔ Migration applied successfully
```

**Manual Application (Alternative):**

If Prisma migrate fails or you prefer direct control:

```bash
# Apply migration directly
mysql -u root -p ppdb-app < prisma/migrations/20251004154300_schema_normalization/migration.sql

# Expected: No errors, transaction commits successfully
```

### Step 5: Post-Migration Validation

```bash
# Run validation queries
mysql -u root -p ppdb-app < prisma/scripts/post-migration-validation.sql > post-migration-report.txt

# Review the report
cat post-migration-report.txt
```

**Verify:**
- [ ] All tables converted to InnoDB
- [ ] All tables using utf8mb4 charset
- [ ] Foreign keys exist and are named correctly
- [ ] Indexes created successfully
- [ ] Record counts match pre-migration
- [ ] No data truncation occurred
- [ ] Sentinel dates cleaned (now NULL)

### Step 6: Regenerate Prisma Client

```bash
# Generate new Prisma Client with updated schema
pnpm prisma generate

# Expected: Client generated successfully in node_modules/.prisma/client
```

### Step 7: Update Application Code

Before starting the application, ensure these code changes are deployed:

#### Required Code Updates:

**1. Column Name Changes:**

```typescript
// ❌ Before (will break)
const sex = animal.SEX
const noteText = note.notes
const noteDate = note.date

// ✅ After (correct)
const sex = animal.sex
const noteText = note.note_text
const noteDate = note.note_date
```

**2. Type Changes:**

```typescript
// ❌ Before
interface Customer {
  postcode: number | null
}

// ✅ After
interface Customer {
  postcode: string | null
}
```

**3. Remove Sentinel Date Handling:**

```typescript
// ❌ Before (no longer needed)
if (animal.lastvisit === '0000-00-00' || !animal.lastvisit) {
  // Handle no visit
}

// ✅ After (standard NULL check)
if (animal.lastvisit === null) {
  // Handle no visit
}
```

**4. Handle Foreign Key Restrictions:**

```typescript
// Delete operations must now handle dependencies

// ❌ Before (would cascade delete)
await prisma.customer.delete({ where: { customerID: id } })

// ✅ After (must check for dependencies)
const animalCount = await prisma.animal.count({ 
  where: { customerID: id } 
})

if (animalCount > 0) {
  throw new Error(`Cannot delete customer with ${animalCount} animals. 
    Please reassign or delete animals first.`)
}

await prisma.customer.delete({ where: { customerID: id } })
```

### Step 8: Test Application

```bash
# Start application in test mode (if available)
NODE_ENV=production pnpm start

# Run smoke tests
curl http://localhost:3000/api/health  # Health check
curl http://localhost:3000/api/animals?q=test  # Search test
curl http://localhost:3000/api/animals/1  # Detail view test
```

**Manual Testing Checklist:**
- [ ] Application starts without errors
- [ ] Home page loads
- [ ] Search functionality works
- [ ] Animal detail pages load
- [ ] Create new record works
- [ ] Update existing record works
- [ ] Delete operations handle foreign keys properly
- [ ] No console errors related to database fields
- [ ] Unicode characters display correctly

### Step 9: Bring Application Online

```bash
# Start the application
pm2 start ppdb-app
# OR
systemctl start ppdb-app
# OR
docker-compose up -d app

# Verify application is running
curl http://localhost:3000  # Should return 200 OK
pm2 status  # OR systemctl status ppdb-app
```

### Step 10: Monitor and Verify

```bash
# Monitor application logs
pm2 logs ppdb-app --lines 100
# OR
journalctl -u ppdb-app -f
# OR
docker-compose logs -f app

# Monitor database
mysql -u root -p ppdb-app -e "SHOW PROCESSLIST;"
mysql -u root -p ppdb-app -e "SHOW ENGINE INNODB STATUS\G"
```

**Watch for:**
- Database connection errors
- Foreign key constraint violations
- Missing column errors
- Type mismatch errors
- Character encoding issues

## Rollback Procedure

If critical issues occur:

### Quick Rollback (Restore from Backup)

```bash
# 1. Stop application
pm2 stop ppdb-app  # or systemctl stop / docker-compose stop

# 2. Drop current database
mysql -u root -p -e "DROP DATABASE \`ppdb-app\`;"
mysql -u root -p -e "CREATE DATABASE \`ppdb-app\`;"

# 3. Restore backup
mysql -u root -p ppdb-app < "$BACKUP_FILE"

# 4. Mark migration as rolled back
pnpm prisma migrate resolve --rolled-back 20251004154300_schema_normalization

# 5. Revert to previous schema.prisma
git checkout HEAD~1 prisma/schema.prisma

# 6. Regenerate old Prisma Client
pnpm prisma generate

# 7. Restart application with old code
git checkout HEAD~1  # If new code was deployed
pm2 start ppdb-app

# 8. Verify rollback successful
curl http://localhost:3000
```

### Partial Rollback (Reverse Migration)

If you need to keep some changes but reverse others:

```bash
# Use the rollback script
mysql -u root -p ppdb-app < prisma/scripts/rollback.sql
```

## Common Issues and Solutions

### Issue: Foreign Key Constraint Violation

**Symptoms:**
```
Error: Foreign key constraint fails (ppdb-app.animal, CONSTRAINT fk_animal_breed)
```

**Cause:** Orphaned records exist (animals referencing non-existent breeds/customers)

**Solution:**
```sql
-- Find orphaned animals
SELECT a.animalID, a.animalname, a.breedID, a.customerID
FROM animal a
LEFT JOIN breed b ON a.breedID = b.breedID
LEFT JOIN customer c ON a.customerID = c.customerID
WHERE b.breedID IS NULL OR c.customerID IS NULL;

-- Fix by creating placeholder records or reassigning
-- Then re-run migration
```

### Issue: Duplicate Breed Names

**Symptoms:**
```
Error: Duplicate entry 'Labrador' for key 'uq_breedname'
```

**Solution:**
```sql
-- Find duplicates
SELECT breedname, COUNT(*) as count
FROM breed
GROUP BY breedname
HAVING count > 1;

-- Merge duplicates before migration
-- Update animal records to use the kept breedID
-- Delete duplicate breeds
```

### Issue: Data Truncation

**Symptoms:**
```
Warning: Data truncated for column 'animalname' at row 123
```

**Cause:** Existing data exceeds new field limits (unlikely given we're expanding sizes)

**Solution:**
```sql
-- Find long values
SELECT animalID, animalname, LENGTH(animalname) as len
FROM animal
WHERE LENGTH(animalname) > 50;

-- Truncate or abbreviate as needed
```

### Issue: Character Encoding Problems

**Symptoms:** Special characters display as `�` or `?`

**Solution:**
```sql
-- Verify encoding conversion worked
SELECT * FROM breed WHERE breedname LIKE '%?%' OR breedname LIKE '%�%';

-- If issues found, may need to re-import with proper encoding
```

## Post-Migration Optimization

After successful migration, consider these optimizations:

```sql
-- Analyze tables for query optimizer
ANALYZE TABLE animal, breed, customer, notes;

-- Update statistics
OPTIMIZE TABLE animal, breed, customer, notes;

-- Check table sizes
SELECT 
  table_name,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS "Size (MB)"
FROM information_schema.TABLES
WHERE table_schema = 'ppdb-app'
ORDER BY (data_length + index_length) DESC;
```

## Documentation Updates

After successful production migration:

- [ ] Update `prisma/README.md` with migration date
- [ ] Document any issues encountered in `/FAILURELOG.md`
- [ ] Update `/CHANGELOG.md` with migration completion
- [ ] Update team documentation/wiki
- [ ] Archive backup file with retention policy
- [ ] Schedule follow-up monitoring

## Success Criteria

Migration is considered successful when:

- [ ] No errors in migration log
- [ ] All validation checks pass
- [ ] Application starts without errors
- [ ] All features work as expected
- [ ] No data loss confirmed
- [ ] Performance is acceptable
- [ ] No increase in error rates
- [ ] Team reports no issues

## Support

If you encounter issues not covered in this guide:

1. Check MySQL error log: `/var/log/mysql/error.log`
2. Check application logs for database errors
3. Review `pre-migration-report.txt` and `post-migration-report.txt`
4. Consult Prisma documentation: https://www.prisma.io/docs/guides/migrate
5. Consider rollback if issues are critical

## Timeline Summary

```
T-0:00  Create backup and verify
T-0:05  Run pre-migration checks
T-0:10  Put application in maintenance mode
T-0:12  Apply migration
T-0:15  Run post-migration validation
T-0:18  Regenerate Prisma Client
T-0:20  Deploy updated application code
T-0:25  Test application thoroughly
T-0:30  Bring application online
T-0:35  Monitor for issues
T-1:00  Declare success or initiate rollback
```

**Total estimated time: 1 hour (including contingency)**

