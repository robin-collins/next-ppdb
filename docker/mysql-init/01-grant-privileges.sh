#!/bin/sh

# Grant additional privileges to the application user for import operations
# This allows creating/dropping temporary databases during data import

echo "Granting privileges to ${MYSQL_USER}..."

# Wait for MySQL to be ready (env vars are available in this context)
# The docker-entrypoint-initdb.d scripts run after the database is initialized but before it's ready for connections in the standard way?
# actually, the official mysql image runs these scripts against the started server.

mysql -u root -p"${MYSQL_ROOT_PASSWORD}" <<-EOSQL
    -- Grant ability to create and drop databases (needed for temp import databases)
    GRANT CREATE, DROP ON *.* TO '${MYSQL_USER}'@'%';

    -- Ensure the user can also work with any ppdb_import_* databases
    GRANT ALL PRIVILEGES ON \`ppdb_import_%\`.* TO '${MYSQL_USER}'@'%';

    FLUSH PRIVILEGES;
EOSQL
