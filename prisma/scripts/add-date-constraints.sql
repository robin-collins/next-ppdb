-- Add Date Validation Constraints to Animal Table
-- This script adds CHECK constraints to prevent invalid dates from being inserted

-- ==============================================================================
-- MySQL Date Constraints
-- ==============================================================================

-- Note: MySQL CHECK constraints are supported in MySQL 8.0.16+
-- These constraints will prevent invalid dates at the database level

-- Add CHECK constraint for thisvisit - must be >= 1900-01-01
ALTER TABLE animal
ADD CONSTRAINT chk_thisvisit_valid
CHECK (thisvisit IS NULL OR thisvisit >= '1900-01-01');

-- Add CHECK constraint for lastvisit - must be >= 1900-01-01
ALTER TABLE animal
ADD CONSTRAINT chk_lastvisit_valid
CHECK (lastvisit IS NULL OR lastvisit >= '1900-01-01');

-- ==============================================================================
-- Verify Constraints Were Added
-- ==============================================================================

-- Show all CHECK constraints on the animal table
SELECT
    CONSTRAINT_NAME,
    CHECK_CLAUSE
FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = DATABASE()
  AND TABLE_NAME = 'animal';

-- ==============================================================================
-- Test Constraints (Optional - uncomment to test)
-- ==============================================================================

-- This should FAIL with constraint violation:
-- INSERT INTO animal (animalname, breedID, customerID, sex, thisvisit)
-- VALUES ('TestDog', 1, 1, 'Male', '0000-00-00');

-- This should FAIL with constraint violation:
-- UPDATE animal SET thisvisit = '1899-12-31' WHERE animalID = 1;

-- This should SUCCEED:
-- UPDATE animal SET thisvisit = '1900-01-01' WHERE animalID = 1;

-- This should SUCCEED (NULL is allowed):
-- UPDATE animal SET thisvisit = NULL WHERE animalID = 1;
