-- ppdb-app → target schema migration
-- Assumes MySQL 8.0+ (InnoDB). Execute as a privileged user.

SET time_zone = '+00:00';
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

-- 0) Clean sentinel dates that would violate strict mode / NOT NULL assumptions
--    (Safe even if already NULL-capable.)
UPDATE animal SET lastvisit = NULL WHERE lastvisit = '0000-00-00';
UPDATE animal SET thisvisit = NULL WHERE thisvisit = '0000-00-00';
UPDATE notes  SET `date`     = NULL WHERE `date`     = '0000-00-00';

-- 1) Normalize storage & collation (InnoDB + utf8mb4) up front
ALTER TABLE breed    ENGINE=InnoDB, CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
ALTER TABLE customer ENGINE=InnoDB, CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
ALTER TABLE animal   ENGINE=InnoDB, CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
ALTER TABLE notes    ENGINE=InnoDB, CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- 2) Drop existing foreign keys that use CASCADE (names from ppdb-app.sql)
--    If your server uses different FK names, adjust these three lines accordingly.
ALTER TABLE animal DROP FOREIGN KEY fk_animal_breed;
ALTER TABLE animal DROP FOREIGN KEY fk_animal_customer;
ALTER TABLE notes  DROP FOREIGN KEY fk_notes_animal;

-- 3) Primary keys → AUTO_INCREMENT + correct integer types

ALTER TABLE breed
  MODIFY breedID INT UNSIGNED NOT NULL AUTO_INCREMENT,
  MODIFY breedname VARCHAR(30) NOT NULL,
  MODIFY avgtime TIME NULL,
  MODIFY avgcost SMALLINT NULL,
  ADD UNIQUE KEY uq_breedname (breedname);

ALTER TABLE customer
  MODIFY customerID INT UNSIGNED NOT NULL AUTO_INCREMENT,
  MODIFY surname    VARCHAR(50) NOT NULL,
  MODIFY firstname  VARCHAR(50) NULL,
  MODIFY address    VARCHAR(100) NULL,
  MODIFY suburb     VARCHAR(50) NULL,
  MODIFY postcode   VARCHAR(10) NULL,
  MODIFY phone1     VARCHAR(20) NULL,
  MODIFY phone2     VARCHAR(20) NULL,
  MODIFY phone3     VARCHAR(20) NULL,
  MODIFY email      VARCHAR(200) NULL;

ALTER TABLE animal
  MODIFY animalID   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  MODIFY animalname VARCHAR(50) NOT NULL,
  MODIFY breedID    INT UNSIGNED NOT NULL,
  MODIFY customerID INT UNSIGNED NOT NULL,
  CHANGE `SEX` sex  ENUM('Male','Female') NOT NULL,
  -- Use shorter, index-friendly text types for frequently filtered columns
  MODIFY colour     VARCHAR(100) NULL,
  MODIFY cost       INT NULL,
  MODIFY lastvisit  DATE NULL,
  MODIFY thisvisit  DATE NULL,
  MODIFY comments   TEXT NULL;

-- 3b) Ensure helpful secondary indexes exist
CREATE INDEX ix_animalname  ON animal (animalname);
CREATE INDEX ix_breedID     ON animal (breedID);
CREATE INDEX ix_customerID  ON animal (customerID);

-- 4) Notes table: PK, types, and column renames
ALTER TABLE notes
  MODIFY noteID   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  MODIFY animalID INT UNSIGNED NOT NULL,
  CHANGE `notes`    note_text MEDIUMTEXT NOT NULL,
  CHANGE `date`     note_date DATE NOT NULL;

CREATE INDEX ix_animalID ON notes (animalID);

-- 5) Recreate foreign keys with RESTRICT/NO ACTION to BLOCK parent edits/deletes

ALTER TABLE animal
  ADD CONSTRAINT fk_animal_breed
    FOREIGN KEY (breedID) REFERENCES breed(breedID)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  ADD CONSTRAINT fk_animal_customer
    FOREIGN KEY (customerID) REFERENCES customer(customerID)
    ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE notes
  ADD CONSTRAINT fk_notes_animal
    FOREIGN KEY (animalID) REFERENCES animal(animalID)
    ON UPDATE RESTRICT ON DELETE RESTRICT;

COMMIT;

SET FOREIGN_KEY_CHECKS = 1;

-- Optional hardening (enable in strict environments):
-- SET SESSION sql_mode = CONCAT(@@sql_mode, ',STRICT_TRANS_TABLES');

