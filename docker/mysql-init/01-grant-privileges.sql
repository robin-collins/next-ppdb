-- Grant additional privileges to the application user for import operations
-- This allows creating/dropping temporary databases during data import

-- Grant ability to create and drop databases (needed for temp import databases)
GRANT CREATE, DROP ON *.* TO 'ppdb-user'@'%';

-- Ensure the user can also work with any ppdb_import_* databases
GRANT ALL PRIVILEGES ON `ppdb_import_%`.* TO 'ppdb-user'@'%';

FLUSH PRIVILEGES;
