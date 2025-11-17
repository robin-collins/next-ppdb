-- Fix AUTO_INCREMENT for all primary key columns
-- This addresses the root cause: the database was migrated from the old PHP app
-- without properly setting AUTO_INCREMENT on primary keys

-- Fix customer table
ALTER TABLE customer 
MODIFY COLUMN customerID MEDIUMINT NOT NULL AUTO_INCREMENT;

-- Fix animal table  
ALTER TABLE animal 
MODIFY COLUMN animalID MEDIUMINT NOT NULL AUTO_INCREMENT;

-- Fix breed table
ALTER TABLE breed 
MODIFY COLUMN breedID MEDIUMINT NOT NULL AUTO_INCREMENT;

-- Fix notes table (if not already fixed)
ALTER TABLE notes 
MODIFY COLUMN noteID MEDIUMINT NOT NULL AUTO_INCREMENT;

-- Verify all tables
SHOW CREATE TABLE customer;
SHOW CREATE TABLE animal;
SHOW CREATE TABLE breed;
SHOW CREATE TABLE notes;

