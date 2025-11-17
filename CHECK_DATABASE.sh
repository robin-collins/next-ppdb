#!/bin/bash
# Check current database schema for notes table
# This shows whether AUTO_INCREMENT is present or not

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        CHECKING notes TABLE SCHEMA                             ║"
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

# Check if mysql command is available
if ! command -v mysql &> /dev/null; then
    echo "❌ ERROR: mysql command not found"
    echo "   Install: sudo apt-get install mysql-client"
    exit 1
fi

echo "Current notes table structure:"
echo "───────────────────────────────────────────────────────────────"
mysql -u"$USER" -p"$PASS" -h"$HOST" -P"${PORT:-3306}" "$DATABASE" -e "SHOW CREATE TABLE notes\G"

echo ""
echo "Checking for AUTO_INCREMENT on noteID:"
echo "───────────────────────────────────────────────────────────────"

HAS_AUTO_INCREMENT=$(mysql -u"$USER" -p"$PASS" -h"$HOST" -P"${PORT:-3306}" "$DATABASE" -e "SHOW CREATE TABLE notes" | grep -c "AUTO_INCREMENT" || true)

if [ "$HAS_AUTO_INCREMENT" -gt 0 ]; then
    echo "✅ AUTO_INCREMENT is present on noteID"
    echo ""
    echo "Database is correctly configured!"
else
    echo "❌ AUTO_INCREMENT is MISSING on noteID"
    echo ""
    echo "This will cause 'Null constraint violation' errors when creating notes."
    echo ""
    echo "To fix this, run: ./FIX_DATABASE_NOW.sh"
fi

echo ""

