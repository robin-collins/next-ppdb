#!/bin/sh
set -e

echo "Syncing database schema..."
# Use db push instead of migrate deploy - creates tables from schema
# migrate deploy assumes migrations were designed for empty DB, but this project's
# migration is a "normalization" migration that expects existing tables
prisma db push --schema=/app/prisma/schema.prisma --skip-generate --accept-data-loss

echo "Starting Next.js server..."
exec node server.js
