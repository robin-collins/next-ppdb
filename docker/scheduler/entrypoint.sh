#!/bin/bash
# Scheduler Entrypoint Script

set -e

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Scheduler container starting up..."

# Run startup notification in the background
if [ -f "/scripts/startup-notification.sh" ]; then
    /scripts/startup-notification.sh &
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: startup-notification.sh not found"
fi

# Run crond in foreground
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting crond..."
exec crond -f -l 2
