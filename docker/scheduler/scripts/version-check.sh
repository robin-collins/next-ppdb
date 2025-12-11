#!/bin/bash
# Version Check Script
# Checks for new container versions in GHCR

set -e

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting version check..."

# Check if API key is set
if [ -z "$SCHEDULER_API_KEY" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: SCHEDULER_API_KEY not set"
    exit 1
fi

# Call the version check endpoint
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Authorization: Bearer $SCHEDULER_API_KEY" \
    -H "Content-Type: application/json" \
    "http://next-ppdb:3000/api/admin/version-check")

# Extract status code from response
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Version check completed"
    echo "$BODY" | head -c 500
    echo ""
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Version check failed with status $HTTP_CODE"
    echo "$BODY" | head -c 500
    echo ""
    exit 1
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Version check task finished"
