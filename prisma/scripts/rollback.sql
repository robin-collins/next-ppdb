-- Emergency Rollback Script
-- WARNING: This attempts to reverse the schema normalization migration
-- It is STRONGLY RECOMMENDED to restore from backup instead of using this script
-- Use this only if backup restoration is not possible

-- This script does NOT restore:
-- - Sentinel date values (0000-00-00) - these become NULL and cannot be reversed
-- - Exact MyISAM table characteristics
-- - Original index names in all cases

SET FOREIGN_KEY_CHECKS = 0;
SET time_zone = '+00:00';

START TRANSACTION;

-- Print warning
SELECT '⚠️  WARNING: Attempting rollback of schema normalization migration' AS '';
SELECT '⚠️  Restoring from backup is preferred over using this script' AS '';
SELECT '⚠️  Some data characteristics cannot be fully restored' AS '';
SELECT '' AS '';

-- 1) Drop the new foreign keys
ALTER TABLE notes DROP FOREIGN KEY IF EXISTS fk_notes_animal;
ALTER TABLE animal DROP FOREIGN KEY IF EXISTS fk_animal_customer;
ALTER TABLE animal DROP FOREIGN KEY IF EXISTS fk_animal_breed;

-- 2) Drop the new indexes
DROP INDEX IF EXISTS ix_animalID ON notes;
DROP INDEX IF EXISTS ix_customerID ON animal;
DROP INDEX IF EXISTS ix_breedID ON animal;
DROP INDEX IF EXISTS ix_animalname ON animal;

-- 3) Revert column renames in notes table
ALTER TABLE notes
  CHANGE note_text `notes` MEDIUMTEXT NOT NULL,
  CHANGE note_date `date` DATE NOT NULL;

-- 4) Revert animal table changes
ALTER TABLE animal
  CHANGE sex `SEX` ENUM('Male','Female') NOT NULL,
  MODIFY animalID MEDIUMINT(4) NOT NULL AUTO_INCREMENT,
  MODIFY animalname VARCHAR(12) NOT NULL DEFAULT '',
  MODIFY breedID MEDIUMINT(4) NOT NULL DEFAULT 0,
  MODIFY customerID MEDIUMINT(6) NOT NULL DEFAULT 0,
  MODIFY colour TEXT NOT NULL,
  MODIFY cost SMALLINT(6) NOT NULL DEFAULT 0,
  MODIFY lastvisit DATE NOT NULL DEFAULT '0000-00-00',
  MODIFY thisvisit DATE NOT NULL DEFAULT '0000-00-00',
  MODIFY comments TINYTEXT DEFAULT NULL;

-- 5) Revert customer table changes
ALTER TABLE customer
  MODIFY customerID MEDIUMINT(6) NOT NULL AUTO_INCREMENT,
  MODIFY surname VARCHAR(20) NOT NULL DEFAULT '',
  MODIFY firstname VARCHAR(20) DEFAULT NULL,
  MODIFY address VARCHAR(50) DEFAULT NULL,
  MODIFY suburb VARCHAR(20) DEFAULT NULL,
  MODIFY postcode SMALLINT(4) DEFAULT 0,
  MODIFY phone1 VARCHAR(10) DEFAULT '0',
  MODIFY phone2 VARCHAR(10) DEFAULT NULL,
  MODIFY phone3 VARCHAR(10) DEFAULT NULL,
  MODIFY email VARCHAR(200) DEFAULT NULL;

-- 6) Revert breed table changes
-- Remove unique constraint if it exists
ALTER TABLE breed DROP KEY IF EXISTS uq_breedname;

ALTER TABLE breed
  MODIFY breedID MEDIUMINT(4) NOT NULL AUTO_INCREMENT,
  MODIFY breedname VARCHAR(30) NOT NULL DEFAULT '',
  MODIFY avgtime TIME DEFAULT '00:00:00',
  MODIFY avgcost SMALLINT(5) DEFAULT 0;

-- 7) Revert notes table ID changes
ALTER TABLE notes
  MODIFY noteID MEDIUMINT(4) NOT NULL AUTO_INCREMENT,
  MODIFY animalID MEDIUMINT(4) NOT NULL DEFAULT 0;

-- 8) Convert back to MyISAM (if needed - optional)
-- Note: This may cause issues in InnoDB-only MySQL configurations
-- Comment out these lines if you want to keep InnoDB
/*
ALTER TABLE notes ENGINE=MyISAM;
ALTER TABLE animal ENGINE=MyISAM;
ALTER TABLE customer ENGINE=MyISAM;
ALTER TABLE breed ENGINE=MyISAM;
*/

-- 9) Convert back to latin1 (NOT RECOMMENDED - will lose Unicode data)
-- Comment out these lines if you want to keep utf8mb4
/*
ALTER TABLE notes CONVERT TO CHARACTER SET latin1 COLLATE latin1_swedish_ci;
ALTER TABLE animal CONVERT TO CHARACTER SET latin1 COLLATE latin1_swedish_ci;
ALTER TABLE customer CONVERT TO CHARACTER SET latin1 COLLATE latin1_swedish_ci;
ALTER TABLE breed CONVERT TO CHARACTER SET latin1 COLLATE latin1_swedish_ci;
*/

-- 10) Recreate original indexes
ALTER TABLE animal
  ADD KEY `animalname` (`animalname`),
  ADD KEY `breedID` (`breedID`),
  ADD KEY `customerID` (`customerID`);

ALTER TABLE breed
  ADD UNIQUE KEY `breedID` (`breedID`),
  ADD UNIQUE KEY `breedname` (`breedname`);

ALTER TABLE customer
  ADD UNIQUE KEY `customerID` (`customerID`),
  ADD KEY `surname` (`surname`);

ALTER TABLE notes
  ADD UNIQUE KEY `noteID` (`noteID`),
  ADD KEY `animalID` (`animalID`);

COMMIT;

SET FOREIGN_KEY_CHECKS = 1;

-- Verify rollback
SELECT '' AS '';
SELECT '========================================' AS '';
SELECT 'ROLLBACK VERIFICATION' AS '';
SELECT '========================================' AS '';

-- Check column names reverted
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ animal.SEX restored (uppercase)'
        ELSE '❌ animal.SEX not found'
    END AS 'Status'
FROM information_schema.COLUMNS
WHERE table_schema = DATABASE()
AND table_name = 'animal'
AND column_name = 'SEX';

SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ notes.notes restored'
        ELSE '❌ notes.notes not found'
    END AS 'Status'
FROM information_schema.COLUMNS
WHERE table_schema = DATABASE()
AND table_name = 'notes'
AND column_name = 'notes';

SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ notes.date restored'
        ELSE '❌ notes.date not found'
    END AS 'Status'
FROM information_schema.COLUMNS
WHERE table_schema = DATABASE()
AND table_name = 'notes'
AND column_name = 'date';

-- Check foreign keys removed
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Foreign keys removed'
        ELSE CONCAT('⚠️  ', COUNT(*), ' foreign keys still exist')
    END AS 'Status'
FROM information_schema.TABLE_CONSTRAINTS
WHERE table_schema = DATABASE()
AND constraint_type = 'FOREIGN KEY'
AND constraint_name IN ('fk_animal_breed', 'fk_animal_customer', 'fk_notes_animal');

-- Important warnings
SELECT '' AS '';
SELECT '⚠️  IMPORTANT: Cannot restore these items:' AS '';
SELECT '  - Sentinel date values (0000-00-00) remain as NULL or have DEFAULT constraint' AS '';
SELECT '  - Any Unicode data entered after migration may be lost if converted to latin1' AS '';
SELECT '  - MyISAM-specific optimizations and characteristics' AS '';
SELECT '' AS '';
SELECT 'Next steps after rollback:' AS '';
SELECT '  1. Verify application works with reverted schema' AS '';
SELECT '  2. Run: pnpm prisma db pull' AS '';
SELECT '  3. Run: pnpm prisma generate' AS '';
SELECT '  4. Test application thoroughly' AS '';
SELECT '  5. Mark migration as rolled back: pnpm prisma migrate resolve --rolled-back 20251004154300_schema_normalization' AS '';

