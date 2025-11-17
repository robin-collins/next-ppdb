-- Comprehensive AUTO_INCREMENT fix for all tables
-- This script handles foreign key constraints properly

-- Step 1: Drop foreign key constraints
ALTER TABLE animal DROP FOREIGN KEY fk_animal_customer;
ALTER TABLE animal DROP FOREIGN KEY fk_animal_breed;

-- Step 2: Modify customer table
ALTER TABLE customer 
MODIFY COLUMN customerID MEDIUMINT NOT NULL AUTO_INCREMENT;

-- Step 3: Modify breed table
ALTER TABLE breed 
MODIFY COLUMN breedID MEDIUMINT NOT NULL AUTO_INCREMENT;

-- Step 4: Modify animal table
ALTER TABLE animal 
MODIFY COLUMN animalID MEDIUMINT NOT NULL AUTO_INCREMENT;

-- Step 5: Recreate foreign key constraints
ALTER TABLE animal 
ADD CONSTRAINT fk_animal_customer 
FOREIGN KEY (customerID) REFERENCES customer(customerID) 
ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE animal 
ADD CONSTRAINT fk_animal_breed 
FOREIGN KEY (breedID) REFERENCES breed(breedID) 
ON UPDATE RESTRICT ON DELETE RESTRICT;

