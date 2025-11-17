#!/bin/bash
# Quick fix script for notes table AUTO_INCREMENT issue
# Run this to diagnose and fix the database schema problem

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     DATABASE FIX: notes.noteID AUTO_INCREMENT Missing          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Extract database connection info from .env
if [ ! -f .env ]; then
    echo "❌ ERROR: .env file not found"
    echo "   Please create .env with DATABASE_URL"
    exit 1
fi

# Parse DATABASE_URL
# Format: mysql://user:password@host:port/database
DATABASE_URL=$(grep "^DATABASE_URL=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")

if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL not found in .env"
    exit 1
fi

# Extract connection details
# Remove mysql:// prefix
CONN_STRING=${DATABASE_URL#mysql://}
# Extract user:password@host:port/database
USER=$(echo "$CONN_STRING" | cut -d ':' -f1)
PASS=$(echo "$CONN_STRING" | cut -d ':' -f2 | cut -d '@' -f1)
HOST=$(echo "$CONN_STRING" | cut -d '@' -f2 | cut -d ':' -f1)
PORT=$(echo "$CONN_STRING" | cut -d ':' -f3 | cut -d '/' -f1)
DATABASE=$(echo "$CONN_STRING" | cut -d '/' -f2 | cut -d '?' -f1)

echo "Connection Details:"
echo "  User: $USER"
echo "  Host: $HOST"
echo "  Port: ${PORT:-3306}"
echo "  Database: $DATABASE"
echo ""

# Check if mysql command is available
if ! command -v mysql &> /dev/null; then
    echo "❌ ERROR: mysql command not found"
    echo "   Install MySQL client: sudo apt-get install mysql-client"
    exit 1
fi

echo "───────────────────────────────────────────────────────────────"
echo "STEP 1: Checking current notes table structure"
echo "───────────────────────────────────────────────────────────────"
echo ""

mysql -u"$USER" -p"$PASS" -h"$HOST" -P"${PORT:-3306}" "$DATABASE" -e "SHOW CREATE TABLE notes\G" 2>&1 | grep -A 20 "Create Table"

echo ""
echo "───────────────────────────────────────────────────────────────"
echo "STEP 2: Applying AUTO_INCREMENT fix"
echo "───────────────────────────────────────────────────────────────"
echo ""
echo "Running: ALTER TABLE notes MODIFY COLUMN noteID MEDIUMINT NOT NULL AUTO_INCREMENT;"
echo ""

mysql -u"$USER" -p"$PASS" -h"$HOST" -P"${PORT:-3306}" "$DATABASE" << 'EOF'
ALTER TABLE notes 
MODIFY COLUMN noteID MEDIUMINT NOT NULL AUTO_INCREMENT;
EOF

if [ $? -eq 0 ]; then
    echo "✅ SUCCESS: AUTO_INCREMENT added to noteID"
else
    echo "❌ FAILED: Could not apply fix"
    exit 1
fi

echo ""
echo "───────────────────────────────────────────────────────────────"
echo "STEP 3: Verifying the fix"
echo "───────────────────────────────────────────────────────────────"
echo ""

mysql -u"$USER" -p"$PASS" -h"$HOST" -P"${PORT:-3306}" "$DATABASE" -e "SHOW CREATE TABLE notes\G" 2>&1 | grep -A 20 "Create Table"

echo ""
echo "───────────────────────────────────────────────────────────────"
echo "STEP 4: Testing note creation"
echo "───────────────────────────────────────────────────────────────"
echo ""
echo "You can now test the API endpoint:"
echo ""
echo "curl -X POST http://localhost:3000/api/animals/1/notes \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"notes\": \"Test note\", \"serviceDate\": \"2024-01-15\"}'"
echo ""
echo "✅ DATABASE FIX COMPLETE"
echo ""

