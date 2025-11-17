#!/bin/bash
# Complete fix for all AUTO_INCREMENT issues in the database
# This script fixes customer, animal, and breed tables

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     FIX ALL AUTO_INCREMENT ISSUES (Complete Solution)          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Parse DATABASE_URL from .env
if [ ! -f .env ]; then
    echo "❌ ERROR: .env file not found"
    exit 1
fi

DATABASE_URL=$(grep "^DATABASE_URL=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")

if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL not found in .env"
    exit 1
fi

# Extract connection details
CONN_STRING=${DATABASE_URL#mysql://}
USER=$(echo "$CONN_STRING" | cut -d ':' -f1)
PASS=$(echo "$CONN_STRING" | cut -d ':' -f2 | cut -d '@' -f1)
HOST=$(echo "$CONN_STRING" | cut -d '@' -f2 | cut -d ':' -f1)
PORT=$(echo "$CONN_STRING" | cut -d ':' -f3 | cut -d '/' -f1)
DATABASE=$(echo "$CONN_STRING" | cut -d '/' -f2 | cut -d '?' -f1)

echo "Database: $DATABASE"
echo ""

# Create temporary SQL file
TMP_SQL=$(mktemp)
cat > "$TMP_SQL" << 'SQL_EOF'
-- Disable foreign key checks to allow column modifications
SET FOREIGN_KEY_CHECKS = 0;

-- Fix customer table
ALTER TABLE customer 
MODIFY COLUMN customerID MEDIUMINT NOT NULL AUTO_INCREMENT;

-- Fix animal table
ALTER TABLE animal 
MODIFY COLUMN animalID MEDIUMINT NOT NULL AUTO_INCREMENT;

-- Fix breed table
ALTER TABLE breed 
MODIFY COLUMN breedID MEDIUMINT NOT NULL AUTO_INCREMENT;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify all tables
SELECT 'customer table:' AS '';
SHOW CREATE TABLE customer;

SELECT 'animal table:' AS '';
SHOW CREATE TABLE animal;

SELECT 'breed table:' AS '';
SHOW CREATE TABLE breed;

SELECT 'notes table:' AS '';
SHOW CREATE TABLE notes;
SQL_EOF

echo "───────────────────────────────────────────────────────────────"
echo "APPLYING AUTO_INCREMENT FIX TO ALL TABLES"
echo "───────────────────────────────────────────────────────────────"
echo ""
echo "Tables to fix:"
echo "  ✓ customer (customerID)"
echo "  ✓ animal (animalID)"
echo "  ✓ breed (breedID)"
echo "  ✓ notes (noteID - already fixed)"
echo ""

# Use npx prisma db execute with the temporary file
cat "$TMP_SQL" | npx prisma db execute --schema=prisma/schema.prisma --stdin

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS: AUTO_INCREMENT added to all primary keys"
    echo ""
    echo "───────────────────────────────────────────────────────────────"
    echo "NEXT STEPS:"
    echo "───────────────────────────────────────────────────────────────"
    echo ""
    echo "Test your application:"
    echo ""
    echo "1. Add a customer:"
    echo "   curl -X POST http://localhost:3000/api/customers \\"
    echo "     -H 'Content-Type: application/json' \\"
    echo "     -d '{\"surname\": \"Test\", \"firstname\": \"User\"}'"
    echo ""
    echo "2. Add an animal:"
    echo "   curl -X POST http://localhost:3000/api/animals \\"
    echo "     -H 'Content-Type: application/json' \\"
    echo "     -d '{\"name\": \"Buddy\", \"breed\": \"Labrador\", \"customerId\": 1}'"
    echo ""
    echo "3. Add a breed:"
    echo "   curl -X POST http://localhost:3000/api/breeds \\"
    echo "     -H 'Content-Type: application/json' \\"
    echo "     -d '{\"breedname\": \"Test Breed\", \"avgtime\": \"60\", \"avgcost\": 40}'"
    echo ""
else
    echo "❌ FAILED: Could not apply fix"
    echo ""
    echo "Try running the SQL manually:"
    echo "  cat prisma/migrations/fix_all_autoincrement.sql | npx prisma db execute --schema=prisma/schema.prisma --stdin"
    rm -f "$TMP_SQL"
    exit 1
fi

# Cleanup
rm -f "$TMP_SQL"

echo "═══════════════════════════════════════════════════════════════"
echo "✅ ALL AUTO_INCREMENT ISSUES RESOLVED"
echo "═══════════════════════════════════════════════════════════════"
echo ""

