-- Post-Migration Validation Checks
-- Run this script AFTER applying the schema normalization migration
-- It verifies the migration completed successfully and no data was lost

SET @check_number = 0;

SELECT '========================================' AS '';
SELECT 'POST-MIGRATION VALIDATION REPORT' AS '';
SELECT '========================================' AS '';
SELECT NOW() AS 'Report Generated';
SELECT DATABASE() AS 'Database';
SELECT '' AS '';

-- Check 1: Verify table engines converted to InnoDB
SET @check_number = @check_number + 1;
SELECT CONCAT('Check ', @check_number, ': Verify all tables converted to InnoDB') AS '';
SELECT 
    CASE 
        WHEN COUNT(*) = 4 THEN '✅ PASS - All tables using InnoDB'
        ELSE '❌ FAIL - Some tables not using InnoDB'
    END AS 'Status'
FROM information_schema.TABLES
WHERE table_schema = DATABASE()
AND table_name IN ('animal', 'breed', 'customer', 'notes')
AND engine = 'InnoDB';

-- Show engine status for all tables
SELECT 
    table_name AS 'Table',
    engine AS 'Engine',
    CASE 
        WHEN engine = 'InnoDB' THEN '✅'
        ELSE '❌'
    END AS 'OK'
FROM information_schema.TABLES
WHERE table_schema = DATABASE()
AND table_name IN ('animal', 'breed', 'customer', 'notes');

-- Check 2: Verify character set conversion to utf8mb4
SET @check_number = @check_number + 1;
SELECT '' AS '';
SELECT CONCAT('Check ', @check_number, ': Verify all tables using utf8mb4') AS '';
SELECT 
    CASE 
        WHEN COUNT(*) = 4 THEN '✅ PASS - All tables using utf8mb4'
        ELSE '❌ FAIL - Some tables not using utf8mb4'
    END AS 'Status'
FROM information_schema.TABLES
WHERE table_schema = DATABASE()
AND table_name IN ('animal', 'breed', 'customer', 'notes')
AND table_collation LIKE 'utf8mb4%';

-- Show collation for all tables
SELECT 
    table_name AS 'Table',
    table_collation AS 'Collation',
    CASE 
        WHEN table_collation LIKE 'utf8mb4%' THEN '✅'
        ELSE '❌'
    END AS 'OK'
FROM information_schema.TABLES
WHERE table_schema = DATABASE()
AND table_name IN ('animal', 'breed', 'customer', 'notes');

-- Check 3: Verify record counts match baseline
SET @check_number = @check_number + 1;
SELECT '' AS '';
SELECT CONCAT('Check ', @check_number, ': Current record counts (compare to baseline)') AS '';
SELECT 'breed' AS 'Table', COUNT(*) AS 'Count After Migration' FROM breed
UNION ALL
SELECT 'customer', COUNT(*) FROM customer
UNION ALL
SELECT 'animal', COUNT(*) FROM animal
UNION ALL
SELECT 'notes', COUNT(*) FROM notes;

SELECT 'Compare these counts to the pre-migration baseline.' AS 'Action';
SELECT 'If counts differ, investigate data loss.' AS 'Warning';

-- Check 4: Verify column renames
SET @check_number = @check_number + 1;
SELECT '' AS '';
SELECT CONCAT('Check ', @check_number, ': Verify animal.SEX renamed to animal.sex') AS '';
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS - Column sex exists'
        ELSE '❌ FAIL - Column sex not found'
    END AS 'Status'
FROM information_schema.COLUMNS
WHERE table_schema = DATABASE()
AND table_name = 'animal'
AND column_name = 'sex';

SET @check_number = @check_number + 1;
SELECT '' AS '';
SELECT CONCAT('Check ', @check_number, ': Verify notes.notes renamed to notes.note_text') AS '';
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS - Column note_text exists'
        ELSE '❌ FAIL - Column note_text not found'
    END AS 'Status'
FROM information_schema.COLUMNS
WHERE table_schema = DATABASE()
AND table_name = 'notes'
AND column_name = 'note_text';

SET @check_number = @check_number + 1;
SELECT '' AS '';
SELECT CONCAT('Check ', @check_number, ': Verify notes.date renamed to notes.note_date') AS '';
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS - Column note_date exists'
        ELSE '❌ FAIL - Column note_date not found'
    END AS 'Status'
FROM information_schema.COLUMNS
WHERE table_schema = DATABASE()
AND table_name = 'notes'
AND column_name = 'note_date';

-- Check 5: Verify column type changes
SET @check_number = @check_number + 1;
SELECT '' AS '';
SELECT CONCAT('Check ', @check_number, ': Verify column type changes') AS '';

-- Check ID columns are INT UNSIGNED
SELECT 
    table_name AS 'Table',
    column_name AS 'Column',
    column_type AS 'Type',
    CASE 
        WHEN column_type = 'int unsigned' THEN '✅'
        ELSE '❌'
    END AS 'OK'
FROM information_schema.COLUMNS
WHERE table_schema = DATABASE()
AND (
    (table_name = 'breed' AND column_name = 'breedID') OR
    (table_name = 'customer' AND column_name = 'customerID') OR
    (table_name = 'animal' AND column_name = 'animalID') OR
    (table_name = 'animal' AND column_name = 'breedID') OR
    (table_name = 'animal' AND column_name = 'customerID') OR
    (table_name = 'notes' AND column_name = 'noteID') OR
    (table_name = 'notes' AND column_name = 'animalID')
);

-- Check 6: Verify foreign keys exist
SET @check_number = @check_number + 1;
SELECT '' AS '';
SELECT CONCAT('Check ', @check_number, ': Verify foreign key constraints created') AS '';
SELECT 
    CASE 
        WHEN COUNT(*) = 3 THEN '✅ PASS - All 3 foreign keys exist'
        ELSE CONCAT('❌ FAIL - Expected 3 foreign keys, found ', COUNT(*))
    END AS 'Status'
FROM information_schema.TABLE_CONSTRAINTS
WHERE table_schema = DATABASE()
AND constraint_type = 'FOREIGN KEY'
AND constraint_name IN ('fk_animal_breed', 'fk_animal_customer', 'fk_notes_animal');

-- Show foreign key details
SELECT 
    constraint_name AS 'FK Name',
    table_name AS 'Table',
    referenced_table_name AS 'References',
    CASE 
        WHEN constraint_name IN ('fk_animal_breed', 'fk_animal_customer', 'fk_notes_animal') THEN '✅'
        ELSE '❓'
    END AS 'OK'
FROM information_schema.REFERENTIAL_CONSTRAINTS
WHERE constraint_schema = DATABASE()
AND constraint_name IN ('fk_animal_breed', 'fk_animal_customer', 'fk_notes_animal');

-- Check 7: Verify foreign key constraints are RESTRICT
SET @check_number = @check_number + 1;
SELECT '' AS '';
SELECT CONCAT('Check ', @check_number, ': Verify foreign keys use RESTRICT (not CASCADE)') AS '';
SELECT 
    constraint_name AS 'FK Name',
    update_rule AS 'On Update',
    delete_rule AS 'On Delete',
    CASE 
        WHEN update_rule = 'RESTRICT' AND delete_rule = 'RESTRICT' THEN '✅'
        ELSE '❌'
    END AS 'OK'
FROM information_schema.REFERENTIAL_CONSTRAINTS
WHERE constraint_schema = DATABASE()
AND constraint_name IN ('fk_animal_breed', 'fk_animal_customer', 'fk_notes_animal');

-- Check 8: Verify unique constraint on breed.breedname
SET @check_number = @check_number + 1;
SELECT '' AS '';
SELECT CONCAT('Check ', @check_number, ': Verify unique constraint on breed.breedname') AS '';
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS - Unique constraint exists'
        ELSE '❌ FAIL - Unique constraint missing'
    END AS 'Status'
FROM information_schema.TABLE_CONSTRAINTS
WHERE table_schema = DATABASE()
AND table_name = 'breed'
AND constraint_name = 'uq_breedname'
AND constraint_type = 'UNIQUE';

-- Check 9: Verify new indexes created
SET @check_number = @check_number + 1;
SELECT '' AS '';
SELECT CONCAT('Check ', @check_number, ': Verify new performance indexes created') AS '';

-- Check for expected indexes
SELECT 
    'ix_animalname' AS 'Index Name',
    CASE WHEN COUNT(*) > 0 THEN '✅ EXISTS' ELSE '❌ MISSING' END AS 'Status'
FROM information_schema.STATISTICS
WHERE table_schema = DATABASE()
AND table_name = 'animal'
AND index_name = 'ix_animalname'
UNION ALL
SELECT 
    'ix_breedID',
    CASE WHEN COUNT(*) > 0 THEN '✅ EXISTS' ELSE '❌ MISSING' END
FROM information_schema.STATISTICS
WHERE table_schema = DATABASE()
AND table_name = 'animal'
AND index_name = 'ix_breedID'
UNION ALL
SELECT 
    'ix_customerID',
    CASE WHEN COUNT(*) > 0 THEN '✅ EXISTS' ELSE '❌ MISSING' END
FROM information_schema.STATISTICS
WHERE table_schema = DATABASE()
AND table_name = 'animal'
AND index_name = 'ix_customerID'
UNION ALL
SELECT 
    'ix_animalID',
    CASE WHEN COUNT(*) > 0 THEN '✅ EXISTS' ELSE '❌ MISSING' END
FROM information_schema.STATISTICS
WHERE table_schema = DATABASE()
AND table_name = 'notes'
AND index_name = 'ix_animalID';

-- Check 10: Verify sentinel dates cleaned
SET @check_number = @check_number + 1;
SELECT '' AS '';
SELECT CONCAT('Check ', @check_number, ': Verify sentinel dates cleaned (now NULL)') AS '';
SELECT 
    'animal.lastvisit' AS 'Column',
    COUNT(*) AS 'Sentinel Date Count',
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS - All sentinel dates cleaned'
        ELSE '❌ FAIL - Sentinel dates still exist'
    END AS 'Status'
FROM animal
WHERE lastvisit = '0000-00-00'
UNION ALL
SELECT 
    'animal.thisvisit',
    COUNT(*),
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS - All sentinel dates cleaned'
        ELSE '❌ FAIL - Sentinel dates still exist'
    END
FROM animal
WHERE thisvisit = '0000-00-00'
UNION ALL
SELECT 
    'notes.note_date',
    COUNT(*),
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS - All sentinel dates cleaned'
        ELSE '❌ FAIL - Sentinel dates still exist'
    END
FROM notes
WHERE note_date = '0000-00-00';

-- Check 11: Verify NULL values where sentinel dates were cleaned
SET @check_number = @check_number + 1;
SELECT '' AS '';
SELECT CONCAT('Check ', @check_number, ': Count NULL date values (replaced sentinel dates)') AS '';
SELECT 
    'animal.lastvisit' AS 'Column',
    COUNT(*) AS 'NULL Count'
FROM animal
WHERE lastvisit IS NULL
UNION ALL
SELECT 
    'animal.thisvisit',
    COUNT(*)
FROM animal
WHERE thisvisit IS NULL;

-- Check 12: Verify no data truncation occurred
SET @check_number = @check_number + 1;
SELECT '' AS '';
SELECT CONCAT('Check ', @check_number, ': Check for potential data truncation issues') AS '';

-- Check animal names
SELECT 
    'animal.animalname' AS 'Column',
    MAX(LENGTH(animalname)) AS 'Max Length',
    'VARCHAR(50)' AS 'New Limit',
    CASE 
        WHEN MAX(LENGTH(animalname)) <= 50 THEN '✅ PASS'
        ELSE '⚠️  WARNING - Data may be truncated'
    END AS 'Status'
FROM animal
UNION ALL
-- Check breed names
SELECT 
    'breed.breedname',
    MAX(LENGTH(breedname)),
    'VARCHAR(30)',
    CASE 
        WHEN MAX(LENGTH(breedname)) <= 30 THEN '✅ PASS'
        ELSE '⚠️  WARNING - Data may be truncated'
    END
FROM breed
UNION ALL
-- Check customer surnames
SELECT 
    'customer.surname',
    MAX(LENGTH(surname)),
    'VARCHAR(50)',
    CASE 
        WHEN MAX(LENGTH(surname)) <= 50 THEN '✅ PASS'
        ELSE '⚠️  WARNING - Data may be truncated'
    END
FROM customer;

-- Check 13: Sample data verification
SET @check_number = @check_number + 1;
SELECT '' AS '';
SELECT CONCAT('Check ', @check_number, ': Sample data verification') AS '';
SELECT 'Showing first 5 animals to verify data integrity' AS 'Info';

SELECT 
    animalID,
    animalname,
    sex,
    colour,
    lastvisit,
    thisvisit
FROM animal
LIMIT 5;

SELECT 'Showing first 5 notes to verify column renames' AS 'Info';

SELECT 
    noteID,
    animalID,
    LEFT(note_text, 50) AS 'note_text_preview',
    note_date
FROM notes
LIMIT 5;

-- Check 14: Table sizes after migration
SET @check_number = @check_number + 1;
SELECT '' AS '';
SELECT CONCAT('Check ', @check_number, ': Table sizes after migration') AS '';
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

-- Count checks passed
SELECT 
    'Review all checks above. All should show ✅ PASS.' AS 'Status',
    'If any checks show ❌ FAIL, investigate immediately.' AS 'Action Required',
    'If any checks show ⚠️  WARNING, review and determine if acceptable.' AS 'Action Recommended';

SELECT '' AS '';
SELECT 'Next Steps:' AS '';
SELECT '1. Review this report for any failures or warnings' AS 'Step';
SELECT '2. Compare record counts to pre-migration baseline' AS '';
SELECT '3. Test application with migrated database' AS '';
SELECT '4. If issues found, consider rollback procedure' AS '';
SELECT '5. If all good, regenerate Prisma Client: pnpm prisma generate' AS '';
SELECT '6. Deploy updated application code with schema changes' AS '';
SELECT '7. Monitor application logs for database-related errors' AS '';

