#!/bin/bash
# Scheduled Backup Script
# Triggers the backup endpoint in the Next.js app

set -e

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting scheduled backup..."

# Check if API key is set
if [ -z "$SCHEDULER_API_KEY" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: SCHEDULER_API_KEY not set"
    exit 1
fi

# Call the scheduled backup endpoint
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Authorization: Bearer $SCHEDULER_API_KEY" \
    -H "Content-Type: application/json" \
    "http://next-ppdb:3000/api/admin/scheduled-backup")

# Extract status code from response
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup completed successfully"
    echo "$BODY" | head -c 500
    echo ""
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Backup failed with status $HTTP_CODE"
    echo "$BODY" | head -c 500
    echo ""
    exit 1
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup task finished"
