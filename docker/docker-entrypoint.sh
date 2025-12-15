#!/bin/sh
set -e

# ============================================================
# PPDB Docker Entrypoint Script
#
# Performs strict pre-requisite checks before starting the app:
# 1. Validates required environment variables
# 2. Verifies database connectivity
# 3. Synchronizes database schema with Prisma
# 4. Starts the Next.js server
#
# Fails immediately if any check fails with clear error messages.
# ============================================================

echo ""
echo "========================================"
echo " PPDB Startup Pre-Check"
echo " $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"
echo ""

# ============================================================
# Check 1: Validate Required Environment Variables
# ============================================================
echo "[1/4] Checking environment variables..."

MISSING_VARS=""

# Check DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  MISSING_VARS="$MISSING_VARS DATABASE_URL"
fi

# Report missing variables
if [ -n "$MISSING_VARS" ]; then
  echo ""
  echo "ERROR: Missing required environment variables:$MISSING_VARS"
  echo ""
  echo "Please ensure these variables are set in your docker-compose.yml"
  echo "or passed via environment to the container."
  echo ""
  exit 1
fi

# Validate DATABASE_URL format (mysql://user:pass@host:port/database)
if ! echo "$DATABASE_URL" | grep -qE '^mysql://[^:]+:[^@]+@[^:]+:[0-9]+/.+'; then
  echo ""
  echo "ERROR: DATABASE_URL format is invalid"
  echo "Expected: mysql://user:password@host:port/database"
  echo "Received: $(echo "$DATABASE_URL" | sed 's/:.*@/:***@/')"
  echo ""
  exit 1
fi

# Extract database connection details for subsequent checks
DB_HOST=$(echo "$DATABASE_URL" | sed -E 's|mysql://[^:]+:[^@]+@([^:]+):[0-9]+/.+|\1|')
DB_PORT=$(echo "$DATABASE_URL" | sed -E 's|mysql://[^:]+:[^@]+@[^:]+:([0-9]+)/.+|\1|')
DB_NAME=$(echo "$DATABASE_URL" | sed -E 's|mysql://[^:]+:[^@]+@[^:]+:[0-9]+/(.+)|\1|')
DB_USER=$(echo "$DATABASE_URL" | sed -E 's|mysql://([^:]+):[^@]+@[^:]+:[0-9]+/.+|\1|')
DB_PASS=$(echo "$DATABASE_URL" | sed -E 's|mysql://[^:]+:([^@]+)@[^:]+:[0-9]+/.+|\1|')

echo "  - DATABASE_URL: mysql://${DB_USER}:***@${DB_HOST}:${DB_PORT}/${DB_NAME}"
echo "  - NODE_ENV: ${NODE_ENV:-production}"
echo "  - DEBUG: ${DEBUG:-false}"
echo "[1/4] PASS - Environment variables validated"
echo ""

# ============================================================
# Check 2: Verify Database Connectivity
# ============================================================
echo "[2/4] Checking database connectivity..."

# Wait for database to be ready (max 30 seconds)
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  # Use mysql client with --skip-ssl for MariaDB compatibility (Debian trixie default)
  if mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" --skip-ssl -e "SELECT 1" >/dev/null 2>&1; then
    echo "  - Connection: SUCCESS"
    echo "  - Server: ${DB_HOST}:${DB_PORT}"
    echo "[2/4] PASS - Database is accessible"
    break
  fi

  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
    echo "  - Waiting for database... (attempt $RETRY_COUNT/$MAX_RETRIES)"
    sleep 1
  fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo ""
  echo "ERROR: Could not connect to database after $MAX_RETRIES attempts"
  echo ""
  echo "Troubleshooting:"
  echo "  - Verify MySQL/MariaDB server is running"
  echo "  - Check host '${DB_HOST}' is reachable"
  echo "  - Verify port ${DB_PORT} is correct"
  echo "  - Confirm user '${DB_USER}' has access"
  echo ""
  exit 1
fi
echo ""

# ============================================================
# Check 3: Synchronize Database Schema (Prisma)
# ============================================================
echo "[3/4] Synchronizing database schema..."

# Use db push instead of migrate deploy - creates tables from schema
# migrate deploy assumes migrations were designed for empty DB, but this project's
# migration is a "normalization" migration that expects existing tables
if prisma db push --schema=/app/prisma/schema.prisma --skip-generate --accept-data-loss; then
  echo "[3/4] PASS - Database schema synchronized"
else
  echo ""
  echo "ERROR: Failed to synchronize database schema"
  echo ""
  echo "This could be due to:"
  echo "  - Schema incompatibility with existing database"
  echo "  - Database permission issues"
  echo "  - Corrupted database state"
  echo ""
  exit 1
fi
echo ""

# ============================================================
# Check 4: Final Status
# ============================================================
echo "[4/4] Final pre-flight check..."
echo "  - All checks passed"
echo "[4/4] PASS - Ready to start application"
echo ""

echo "========================================"
echo " Pre-Check Complete - All Systems Go"
echo "========================================"
echo ""

# ============================================================
# Start Application
# ============================================================
echo "Starting Next.js server..."
exec node server.js
