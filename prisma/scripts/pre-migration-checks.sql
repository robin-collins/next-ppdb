-- Pre-Migration Validation Checks
-- Run this script BEFORE applying the schema normalization migration
-- It identifies potential issues that could cause migration failures

SET @check_number = 0;

SELECT '========================================' AS '';
SELECT 'PRE-MIGRATION VALIDATION REPORT' AS '';
SELECT '========================================' AS '';
SELECT NOW() AS 'Report Generated';
SELECT DATABASE() AS 'Database';
SELECT '' AS '';

-- Check 1: Table existence
SET @check_number = @check_number + 1;
SELECT CONCAT('Check ', @check_number, ': Verify all required tables exist') AS '';
SELECT 
    CASE 
        WHEN COUNT(*) = 4 THEN '✅ PASS - All 4 tables found'
        ELSE '❌ FAIL - Missing tables'
    END AS 'Status',
    GROUP_CONCAT(table_name) AS 'Tables Found'
FROM information_schema.TABLES 
WHERE table_schema = DATABASE() 
AND table_name IN ('animal', 'breed', 'customer', 'notes');

-- Check 2: Record counts (baseline)
SET @check_number = @check_number + 1;
SELECT '' AS '';
SELECT CONCAT('Check ', @check_number, ': Current record counts (baseline)') AS '';
SELECT 'breed' AS 'Table', COUNT(*) AS 'Count' FROM breed
UNION ALL
SELECT 'customer', COUNT(*) FROM customer
UNION ALL
SELECT 'animal', COUNT(*) FROM animal
UNION ALL
SELECT 'notes', COUNT(*) FROM notes;

-- Check 3: Orphaned animal records (no matching breed)
SET @check_number = @check_number + 1;
SELECT '' AS '';
SELECT CONCAT('Check ', @check_number, ': Check for orphaned animals (invalid breedID)') AS '';
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS - No orphaned animals'
        ELSE CONCAT('⚠️  WARNING - ', COUNT(*), ' animals with invalid breedID')
    END AS 'Status',
    COUNT(*) AS 'Orphaned Count'
FROM animal a
LEFT JOIN breed b ON a.breedID = b.breedID
WHERE b.breedID IS NULL;

-- Show orphaned records if any
SELECT a.animalID, a.animalname, a.breedID AS 'Invalid_breedID'
FROM animal a
LEFT JOIN breed b ON a.breedID = b.breedID
WHERE b.breedID IS NULL
LIMIT 10;

-- Check 4: Orphaned animal records (no matching customer)
SET @check_number = @check_number + 1;
SELECT '' AS '';
SELECT CONCAT('Check ', @check_number, ': Check for orphaned animals (invalid customerID)') AS '';
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS - No orphaned animals'
        ELSE CONCAT('⚠️  WARNING - ', COUNT(*), ' animals with invalid customerID')
    END AS 'Status',
    COUNT(*) AS 'Orphaned Count'
FROM animal a
LEFT JOIN customer c ON a.customerID = c.customerID
WHERE c.customerID IS NULL;

-- Show orphaned records if any
SELECT a.animalID, a.animalname, a.customerID AS 'Invalid_customerID'
FROM animal a
LEFT JOIN customer c ON a.customerID = c.customerID
WHERE c.customerID IS NULL
LIMIT 10;

-- Check 5: Orphaned notes
SET @check_number = @check_number + 1;
SELECT '' AS '';
SELECT CONCAT('Check ', @check_number, ': Check for orphaned notes (invalid animalID)') AS '';
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS - No orphaned notes'
        ELSE CONCAT('⚠️  WARNING - ', COUNT(*), ' notes with invalid animalID')
    END AS 'Status',
    COUNT(*) AS 'Orphaned Count'
FROM notes n
LEFT JOIN animal a ON n.animalID = a.animalID
WHERE a.animalID IS NULL;

-- Check 6: Duplicate breed names
SET @check_number = @check_number + 1;
SELECT '' AS '';
SELECT CONCAT('Check ', @check_number, ': Check for duplicate breed names (will violate UNIQUE constraint)') AS '';
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS - No duplicate breed names'
        ELSE CONCAT('❌ FAIL - ', COUNT(*), ' duplicate breed names found')
    END AS 'Status'
FROM (
    SELECT breedname, COUNT(*) as cnt
    FROM breed
    GROUP BY breedname
    HAVING cnt > 1
) AS dupes;

-- Show duplicates if any
SELECT breedname, COUNT(*) AS 'Duplicate Count', GROUP_CONCAT(breedID) AS 'Affected breedIDs'
FROM breed
GROUP BY breedname
HAVING COUNT(*) > 1;

-- Check 7: Sentinel dates in animal table
SET @check_number = @check_number + 1;
SELECT '' AS '';
SELECT CONCAT('Check ', @check_number, ': Count sentinel dates (will be converted to NULL)') AS '';
SELECT 
    CONCAT('ℹ️  INFO - ', COUNT(*), ' lastvisit records with sentinel date') AS 'lastvisit Status',
    COUNT(*) AS 'Count'
FROM animal
WHERE lastvisit = '0000-00-00';

SELECT 
    CONCAT('ℹ️  INFO - ', COUNT(*), ' thisvisit records with sentinel date') AS 'thisvisit Status',
    COUNT(*) AS 'Count'
FROM animal
WHERE thisvisit = '0000-00-00';

-- Check 8: Sentinel dates in notes table
SET @check_number = @check_number + 1;
SELECT '' AS '';
SELECT CONCAT('Check ', @check_number, ': Count sentinel dates in notes (will be converted to NULL)') AS '';
SELECT 
    CONCAT('ℹ️  INFO - ', COUNT(*), ' note dates with sentinel date') AS 'Status',
    COUNT(*) AS 'Count'
FROM notes
WHERE `date` = '0000-00-00';

-- Check 9: Data that might be truncated (expanded fields should be fine)
SET @check_number = @check_number + 1;
SELECT '' AS '';
SELECT CONCAT('Check ', @check_number, ': Check for animalname > 12 chars (original limit)') AS '';
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS - All animal names within original limit'
        ELSE CONCAT('ℹ️  INFO - ', COUNT(*), ' names >12 chars (migration expands to 50)')
    END AS 'Status',
    COUNT(*) AS 'Count'
FROM animal
WHERE LENGTH(animalname) > 12;

-- Check 10: Verify postcode can convert to VARCHAR
SET @check_number = @check_number + 1;
SELECT '' AS '';
SELECT CONCAT('Check ', @check_number, ': Check postcode values (converting from SMALLINT to VARCHAR)') AS '';
SELECT 
    MIN(postcode) AS 'Min Postcode',
    MAX(postcode) AS 'Max Postcode',
    COUNT(DISTINCT postcode) AS 'Unique Values',
    COUNT(*) AS 'Total Records'
FROM customer
WHERE postcode IS NOT NULL AND postcode != 0;

-- Check 11: Current table engines
SET @check_number = @check_number + 1;
SELECT '' AS '';
SELECT CONCAT('Check ', @check_number, ': Current table engines (will convert to InnoDB)') AS '';
SELECT 
    table_name AS 'Table',
    engine AS 'Current Engine',
    CASE 
        WHEN engine = 'MyISAM' THEN 'Will convert to InnoDB'
        WHEN engine = 'InnoDB' THEN 'Already InnoDB'
        ELSE CONCAT('Unexpected engine: ', engine)
    END AS 'Migration Action'
FROM information_schema.TABLES
WHERE table_schema = DATABASE()
AND table_name IN ('animal', 'breed', 'customer', 'notes');

-- Check 12: Current character sets
SET @check_number = @check_number + 1;
SELECT '' AS '';
SELECT CONCAT('Check ', @check_number, ': Current character sets (will convert to utf8mb4)') AS '';
SELECT 
    table_name AS 'Table',
    table_collation AS 'Current Collation',
    CASE 
        WHEN table_collation LIKE 'utf8mb4%' THEN 'Already utf8mb4'
        ELSE 'Will convert to utf8mb4_0900_ai_ci'
    END AS 'Migration Action'
FROM information_schema.TABLES
WHERE table_schema = DATABASE()
AND table_name IN ('animal', 'breed', 'customer', 'notes');

-- Check 13: Existing indexes
SET @check_number = @check_number + 1;
SELECT '' AS '';
SELECT CONCAT('Check ', @check_number, ': Current indexes (new ones will be added)') AS '';
SELECT 
    table_name AS 'Table',
    index_name AS 'Index Name',
    column_name AS 'Column',
    CASE 
        WHEN non_unique = 0 THEN 'UNIQUE'
        ELSE 'INDEX'
    END AS 'Type'
FROM information_schema.STATISTICS
WHERE table_schema = DATABASE()
AND table_name IN ('animal', 'breed', 'customer', 'notes')
ORDER BY table_name, index_name, seq_in_index;

-- Check 14: Table sizes (for downtime estimation)
SET @check_number = @check_number + 1;
SELECT '' AS '';
SELECT CONCAT('Check ', @check_number, ': Current table sizes') AS '';
SELECT 
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)',
    table_rows AS 'Approx Rows'
FROM information_schema.TABLES
WHERE table_schema = DATABASE()
AND table_name IN ('animal', 'breed', 'customer', 'notes')
ORDER BY (data_length + index_length) DESC;

-- Summary
SELECT '' AS '';
SELECT '========================================' AS '';
SELECT 'SUMMARY' AS '';
SELECT '========================================' AS '';
SELECT 'Review the checks above. Address any FAIL or WARNING items before migration.' AS 'Action Required';
SELECT 'INFO items are informational only and do not require action.' AS 'Note';
SELECT '' AS '';
SELECT 'Next Steps:' AS '';
SELECT '1. Fix any FAIL items (especially orphaned records and duplicate breed names)' AS 'Step';
SELECT '2. Review WARNING items and decide if they need fixing' AS '';
SELECT '3. Create database backup: mysqldump -u user -p ppdb-app > backup.sql' AS '';
SELECT '4. Apply migration: pnpm prisma migrate deploy' AS '';
SELECT '5. Run post-migration validation: mysql < post-migration-validation.sql' AS '';

