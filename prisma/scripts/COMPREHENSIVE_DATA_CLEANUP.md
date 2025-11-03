# Comprehensive Data Cleanup & Validation Strategy

## Issues Identified

### 1. Schema Type Mismatches

| Field               | Database Type                        | Prisma Expected            | Issue                 |
| ------------------- | ------------------------------------ | -------------------------- | --------------------- |
| `customer.postcode` | `smallint(4)`                        | `String @db.VarChar(10)`   | Type conversion fails |
| `animal.colour`     | `text NOT NULL`                      | `String? @db.VarChar(100)` | Nullability mismatch  |
| `animal.lastvisit`  | `date NOT NULL DEFAULT '0000-00-00'` | `DateTime?`                | Invalid default       |
| `animal.thisvisit`  | `date NOT NULL DEFAULT '0000-00-00'` | `DateTime?`                | Invalid default       |

### 2. Field Size Mismatches

| Field                | Database Size | Prisma Size   | Risk                 |
| -------------------- | ------------- | ------------- | -------------------- |
| `customer.surname`   | `varchar(20)` | `varchar(50)` | Truncation on insert |
| `customer.firstname` | `varchar(20)` | `varchar(50)` | Truncation on insert |
| `animal.animalname`  | `varchar(12)` | `varchar(50)` | Truncation on insert |

### 3. Data Quality Issues

- ✅ **FIXED**: Invalid dates (`0000-00-00`) converted to `1900-01-01`
- ⚠️ **PENDING**: Postcode data needs conversion from integer to string
- ⚠️ **PENDING**: Colour field needs proper NULL/empty handling

## Migration Strategy

### Phase 1: Data Type Conversions

1. Convert `postcode` from `smallint(4)` to `varchar(10)`
2. Convert `colour` from `text NOT NULL` to `varchar(100)` (nullable or with default)
3. Update date defaults to `NULL` instead of `0000-00-00`

### Phase 2: Data Cleanup

1. ✅ Fix invalid dates (COMPLETED)
2. Convert numeric postcodes to strings
3. Handle empty/NULL colour values

### Phase 3: Add Constraints

1. ✅ Add CHECK constraints for dates >= 1900-01-01 (COMPLETED)
2. Add validation for postcode format (optional)
3. Add proper defaults

### Phase 4: Update Application Layer

1. ✅ Add Zod validation for dates (COMPLETED)
2. Add Zod validation for all fields
3. Update Prisma schema to match reality

## Execution Order

1. **Backup database** (CRITICAL in production!)
2. **Run data conversions** (postcode, colour)
3. **Alter column types** (schema changes)
4. **Add constraints** (prevent future bad data)
5. **Update Prisma schema**
6. **Regenerate Prisma client**
7. **Test application**

## Notes

- This cleanup script is designed for the dev environment
- All fixes should be included in production migration
- Production will encounter similar dirty data
- Application-layer validation prevents new bad data
