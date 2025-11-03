-- Fix Invalid Dates Script
-- This script identifies and fixes invalid datetime values in the animal table
-- Run this script against your MySQL database

-- ==============================================================================
-- STEP 1: IDENTIFY INVALID DATES (Run this first to see what will be changed)
-- ==============================================================================

SELECT
    'Animals with invalid thisvisit dates' as issue_type,
    COUNT(*) as count
FROM animal
WHERE thisvisit = '0000-00-00'
   OR thisvisit = '0000-00-00 00:00:00'
   OR YEAR(thisvisit) = 0
   OR MONTH(thisvisit) = 0
   OR DAY(thisvisit) = 0

UNION ALL

SELECT
    'Animals with invalid lastvisit dates' as issue_type,
    COUNT(*) as count
FROM animal
WHERE lastvisit = '0000-00-00'
   OR lastvisit = '0000-00-00 00:00:00'
   OR YEAR(lastvisit) = 0
   OR MONTH(lastvisit) = 0
   OR DAY(lastvisit) = 0;

-- View sample records with invalid dates
SELECT
    animalID,
    animalname,
    thisvisit,
    lastvisit,
    CASE
        WHEN thisvisit = '0000-00-00' OR YEAR(thisvisit) = 0 OR MONTH(thisvisit) = 0 OR DAY(thisvisit) = 0
        THEN 'Invalid thisvisit'
        ELSE 'Valid thisvisit'
    END as thisvisit_status,
    CASE
        WHEN lastvisit = '0000-00-00' OR YEAR(lastvisit) = 0 OR MONTH(lastvisit) = 0 OR DAY(lastvisit) = 0
        THEN 'Invalid lastvisit'
        ELSE 'Valid lastvisit'
    END as lastvisit_status
FROM animal
WHERE (thisvisit = '0000-00-00' OR YEAR(thisvisit) = 0 OR MONTH(thisvisit) = 0 OR DAY(thisvisit) = 0)
   OR (lastvisit = '0000-00-00' OR YEAR(lastvisit) = 0 OR MONTH(lastvisit) = 0 OR DAY(lastvisit) = 0)
LIMIT 10;

-- ==============================================================================
-- STEP 2: BACKUP (RECOMMENDED - Create backup before making changes)
-- ==============================================================================

-- Create a backup table (uncomment to use)
-- CREATE TABLE animal_backup_before_date_fix AS SELECT * FROM animal;

-- ==============================================================================
-- STEP 3: FIX INVALID DATES
-- ==============================================================================

-- Fix invalid thisvisit dates
UPDATE animal
SET thisvisit = '1900-01-01 00:00:00'
WHERE thisvisit = '0000-00-00'
   OR thisvisit = '0000-00-00 00:00:00'
   OR YEAR(thisvisit) = 0
   OR MONTH(thisvisit) = 0
   OR DAY(thisvisit) = 0;

-- Fix invalid lastvisit dates
UPDATE animal
SET lastvisit = '1900-01-01 00:00:00'
WHERE lastvisit = '0000-00-00'
   OR lastvisit = '0000-00-00 00:00:00'
   OR YEAR(lastvisit) = 0
   OR MONTH(lastvisit) = 0
   OR DAY(lastvisit) = 0;

-- ==============================================================================
-- STEP 4: VERIFY FIX
-- ==============================================================================

-- This should return 0 for both counts
SELECT
    'Animals with invalid thisvisit dates AFTER fix' as issue_type,
    COUNT(*) as count
FROM animal
WHERE thisvisit = '0000-00-00'
   OR thisvisit = '0000-00-00 00:00:00'
   OR YEAR(thisvisit) = 0
   OR MONTH(thisvisit) = 0
   OR DAY(thisvisit) = 0

UNION ALL

SELECT
    'Animals with invalid lastvisit dates AFTER fix' as issue_type,
    COUNT(*) as count
FROM animal
WHERE lastvisit = '0000-00-00'
   OR lastvisit = '0000-00-00 00:00:00'
   OR YEAR(lastvisit) = 0
   OR MONTH(lastvisit) = 0
   OR DAY(lastvisit) = 0;

-- Show sample of fixed records
SELECT
    animalID,
    animalname,
    thisvisit,
    lastvisit
FROM animal
WHERE thisvisit = '1900-01-01 00:00:00'
   OR lastvisit = '1900-01-01 00:00:00'
LIMIT 10;
