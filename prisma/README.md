# Prisma Database Migration Documentation

## Overview

This directory contains all database schema definitions and migration files for the Pampered Pooch Database application. The migration system is designed to safely transform a production database from the legacy schema (`ppdb-original.sql`) to the modern, normalized schema without any data loss.

## Schema Evolution

### Original Schema (Legacy Production)
- **Engine**: MyISAM
- **Character Set**: latin1 (latin1_swedish_ci)
- **Foreign Keys**: None
- **ID Types**: MEDIUMINT with manual sizes
- **Date Handling**: Sentinel '0000-00-00' values
- **Issues**: No referential integrity, poor Unicode support, suboptimal field sizes

### Target Schema (Modern)
- **Engine**: InnoDB (ACID compliance, better crash recovery)
- **Character Set**: utf8mb4 (full Unicode support including emoji)
- **Foreign Keys**: Full referential integrity with RESTRICT constraints
- **ID Types**: INT UNSIGNED (better range, standard sizing)
- **Date Handling**: NULL for unknown dates (SQL standard)
- **Improvements**: Indexed queries, unique constraints, normalized column names

## Migration Files

```
prisma/
├── README.md                          # This file
├── schema.prisma                      # Current schema definition
├── migrations/
│   └── 20251004154300_schema_normalization/
│       └── migration.sql              # Main migration script
├── scripts/
│   ├── pre-migration-checks.sql      # Validation before migration
│   ├── post-migration-validation.sql # Validation after migration
│   └── rollback.sql                  # Emergency rollback script
└── PRODUCTION_MIGRATION.md           # Production deployment guide
```

## Migration Strategy

### For Development (Existing Database)

If you're working with an existing development database that already has some schema changes:

```bash
# Mark the migration as already applied
pnpm prisma migrate resolve --applied 20251004154300_schema_normalization

# Regenerate Prisma Client
pnpm prisma generate
```

### For Production (Fresh Deployment)

If you're deploying to production with the original `ppdb-original.sql` schema:

```bash
# 1. Backup the database
mysqldump -u user -p ppdb-app > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Run pre-migration checks
mysql -u user -p ppdb-app < prisma/scripts/pre-migration-checks.sql

# 3. Apply the migration
pnpm prisma migrate deploy

# 4. Run post-migration validation
mysql -u user -p ppdb-app < prisma/scripts/post-migration-validation.sql

# 5. Regenerate Prisma Client
pnpm prisma generate
```

See `PRODUCTION_MIGRATION.md` for detailed production deployment instructions.

## Key Schema Changes

### Table: `breed`
- `breedID`: MEDIUMINT → INT UNSIGNED
- `breedname`: Added UNIQUE constraint
- `avgtime`: NULL handling fixed (was '00:00:00')
- `avgcost`: SMALLINT → SMALLINT (unchanged, but NULL-capable)
- Engine: MyISAM → InnoDB
- Charset: latin1 → utf8mb4

### Table: `customer`
- `customerID`: MEDIUMINT → INT UNSIGNED
- `surname`: VARCHAR(20) → VARCHAR(50)
- `firstname`: VARCHAR(20) → VARCHAR(50)
- `address`: VARCHAR(50) → VARCHAR(100)
- `suburb`: VARCHAR(20) → VARCHAR(50)
- `postcode`: SMALLINT → VARCHAR(10)
- `phone1`: VARCHAR(10) → VARCHAR(20)
- `phone2`: VARCHAR(10) → VARCHAR(20)
- `phone3`: VARCHAR(10) → VARCHAR(20)
- Engine: MyISAM → InnoDB
- Charset: latin1 → utf8mb4

### Table: `animal`
- `animalID`: MEDIUMINT → INT UNSIGNED
- `animalname`: VARCHAR(12) → VARCHAR(50)
- `breedID`: MEDIUMINT → INT UNSIGNED (with FK constraint)
- `customerID`: MEDIUMINT → INT UNSIGNED (with FK constraint)
- `SEX` → `sex`: Column renamed to lowercase
- `colour`: TEXT → VARCHAR(100)
- `cost`: SMALLINT → INT
- `lastvisit`: DATE with '0000-00-00' → DATE NULL
- `thisvisit`: DATE with '0000-00-00' → DATE NULL
- `comments`: TINYTEXT → TEXT
- Added indexes: ix_animalname, ix_breedID, ix_customerID
- Engine: MyISAM → InnoDB
- Charset: latin1 → utf8mb4

### Table: `notes`
- `noteID`: MEDIUMINT → INT UNSIGNED
- `animalID`: MEDIUMINT → INT UNSIGNED (with FK constraint)
- `notes` → `note_text`: Column renamed for clarity
- `date` → `note_date`: Column renamed for clarity
- Added index: ix_animalID
- Engine: MyISAM → InnoDB
- Charset: latin1 → utf8mb4

## Foreign Key Constraints

All foreign keys use `RESTRICT` for both UPDATE and DELETE operations:

- `animal.breedID` → `breed.breedID`
- `animal.customerID` → `customer.customerID`
- `notes.animalID` → `animal.animalID`

**Important**: This means you cannot delete a breed, customer, or animal that has dependent records. Your application must handle this by either:
1. Preventing deletion with appropriate error messages
2. Implementing a "soft delete" pattern (adding an `is_active` flag)
3. Cascading deletes at the application layer after user confirmation

## Data Type Mapping Changes

### In Your Application Code

After migration, update references to:

**Column Name Changes:**
```typescript
// Before
animal.SEX
notes.notes
notes.date

// After
animal.sex
notes.note_text
notes.note_date
```

**Type Changes:**
```typescript
// Before
customer.postcode: number

// After
customer.postcode: string | null

// Before - handling sentinel dates
if (animal.lastvisit !== '0000-00-00')

// After - standard NULL checking
if (animal.lastvisit !== null)
```

## Rollback Procedure

If migration fails or causes issues:

```bash
# 1. Restore from backup
mysql -u user -p ppdb-app < backup_YYYYMMDD_HHMMSS.sql

# 2. Mark migration as rolled back
pnpm prisma migrate resolve --rolled-back 20251004154300_schema_normalization

# 3. Revert schema.prisma (if needed)
git checkout HEAD~1 prisma/schema.prisma

# 4. Regenerate Prisma Client
pnpm prisma generate
```

See `scripts/rollback.sql` for alternative rollback approach.

## Testing the Migration

Before production deployment:

1. **Create a staging environment** with a copy of production data
2. **Run pre-migration checks** to identify potential issues
3. **Execute migration** in staging
4. **Run post-migration validation** to verify data integrity
5. **Test application** thoroughly in staging
6. **Document any issues** and update rollback procedures
7. **Plan production maintenance window**

## Support and Troubleshooting

Common issues and solutions are documented in:
- `/MIGRATION_GUIDE.md` - General migration guidance
- `PRODUCTION_MIGRATION.md` - Production-specific procedures
- `scripts/` - Validation and diagnostic queries

## Migration History

| Migration | Date | Description |
|-----------|------|-------------|
| 20251004154300_schema_normalization | 2025-10-04 | Initial migration from legacy schema to normalized InnoDB schema with proper constraints |

## Future Migrations

When adding new migrations:

1. Use descriptive names: `pnpm prisma migrate dev --name descriptive_name`
2. Review generated SQL before applying
3. Test with production data copy first
4. Update this README with migration details
5. Document any application code changes required

