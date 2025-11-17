-- Fix notes table auto-increment issue
-- This ensures noteID is properly set as auto-increment

-- Check current structure
SHOW CREATE TABLE notes;

-- Fix the noteID column to have AUTO_INCREMENT
ALTER TABLE notes 
MODIFY COLUMN noteID MEDIUMINT NOT NULL AUTO_INCREMENT;

-- Verify the fix
SHOW CREATE TABLE notes;

