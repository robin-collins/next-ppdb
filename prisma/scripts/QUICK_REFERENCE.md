# Quick Reference: Production Migration

## Pre-Flight Checklist

```bash
# 1. Backup database
mysqldump -u root -p ppdb-app > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Test backup
mysql -u root -p -e "CREATE DATABASE ppdb_test;"
mysql -u root -p ppdb_test < backup_*.sql
mysql -u root -p -e "DROP DATABASE ppdb_test;"

# 3. Pre-migration checks
mysql -u root -p ppdb-app < prisma/scripts/pre-migration-checks.sql > pre-report.txt
cat pre-report.txt | grep -E '❌|⚠️'  # Check for issues

# 4. Stop application
pm2 stop ppdb-app
```

## Migration Commands

```bash
# Apply migration
cd /home/tech/projects/ppdb-ts
export DATABASE_URL="mysql://user:pass@host:3306/ppdb-app"
pnpm prisma migrate deploy

# Post-validation
mysql -u root -p ppdb-app < prisma/scripts/post-migration-validation.sql > post-report.txt
cat post-report.txt | grep -E '❌|⚠️'  # Check for issues

# Regenerate client
pnpm prisma generate

# Start application
pm2 start ppdb-app
```

## Rollback Commands

```bash
# Stop application
pm2 stop ppdb-app

# Restore backup
mysql -u root -p -e "DROP DATABASE \`ppdb-app\`;"
mysql -u root -p -e "CREATE DATABASE \`ppdb-app\`;"
mysql -u root -p ppdb-app < backup_*.sql

# Revert Prisma
pnpm prisma migrate resolve --rolled-back 20251004154300_schema_normalization
git checkout HEAD~1 prisma/schema.prisma
pnpm prisma generate

# Restart
pm2 start ppdb-app
```

## Code Changes Required

### Column Names
```typescript
// Change these:
animal.SEX → animal.sex
notes.notes → notes.note_text
notes.date → notes.note_date
```

### Types
```typescript
// Change this:
customer.postcode: number → string | null
```

### Date Handling
```typescript
// Change this:
if (lastvisit === '0000-00-00') → if (lastvisit === null)
```

### Foreign Key Handling
```typescript
// Add checks before delete:
const count = await prisma.animal.count({ where: { customerID: id } })
if (count > 0) throw new Error('Cannot delete - has dependent records')
await prisma.customer.delete({ where: { customerID: id } })
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Orphaned records | Run pre-checks, fix before migration |
| Duplicate breeds | Merge duplicates, update animal references |
| FK constraint fails | Check pre-migration report for orphans |
| Permission denied | Ensure user has ALTER, CREATE INDEX rights |
| Out of space | Free up disk space before migration |

## Timeline

```
00:00 - Backup and verify
00:05 - Pre-checks
00:10 - Stop app + Apply migration
00:15 - Post-validation
00:18 - Generate client
00:20 - Start app + Test
00:25 - Monitor
00:30 - Success or Rollback decision
```

## Emergency Contacts

- Database backup location: `./backups/`
- Full documentation: `prisma/PRODUCTION_MIGRATION.md`
- Migration file: `prisma/migrations/20251004154300_schema_normalization/migration.sql`
- Rollback script: `prisma/scripts/rollback.sql`

## Success Criteria

- ✅ All validation checks pass
- ✅ Record counts match baseline
- ✅ Application starts without errors
- ✅ Search and CRUD operations work
- ✅ No console errors
- ✅ Unicode displays correctly

