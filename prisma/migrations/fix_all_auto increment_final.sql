-- ============================================================================
-- CRITICAL FIX: Add AUTO_INCREMENT to all primary key columns
-- ============================================================================
-- 
-- PROBLEM: All primary key tables are missing AUTO_INCREMENT attribute
-- IMPACT: Cannot create any new records (customers, animals, breeds, notes)
-- SOLUTION: Temporarily disable foreign key checks, fix all tables, re-enable
--
-- HOW TO RUN:
-- Option 1: mysql -u USER -p DATABASE < this_file.sql
-- Option 2: Copy/paste into MySQL client or GUI tool
-- Option 3: cat this_file.sql | npx prisma db execute --schema=prisma/schema.prisma --stdin
--          (Note: Option 3 may not work due to Prisma CLI limitations with FK checks)
--
-- ============================================================================

-- Disable foreign key checks to allow column modifications
SET FOREIGN_KEY_CHECKS = 0;

-- Fix customer table
ALTER TABLE customer 
MODIFY COLUMN customerID MEDIUMINT NOT NULL AUTO_INCREMENT;

-- Fix breed table
ALTER TABLE breed 
MODIFY COLUMN breedID MEDIUMINT NOT NULL AUTO_INCREMENT;

-- Fix animal table
ALTER TABLE animal 
MODIFY COLUMN animalID MEDIUMINT NOT NULL AUTO_INCREMENT;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- VERIFICATION QUERIES (Optional - comment out if causing issues)
-- ============================================================================

-- These queries show the table structure to verify AUTO_INCREMENT was added
-- You can run these manually after the ALTER TABLE commands if they cause issues

-- SHOW CREATE TABLE customer;
-- SHOW CREATE TABLE breed;
-- SHOW CREATE TABLE animal;

-- Expected output should include "AUTO_INCREMENT" for each primary key:
-- `customerID` mediumint NOT NULL AUTO_INCREMENT
-- `breedID` mediumint NOT NULL AUTO_INCREMENT
-- `animalID` mediumint NOT NULL AUTO_INCREMENT

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

