#!/bin/sh
# Health check script for scheduler container

# Check if crond is running
if ! pgrep crond > /dev/null 2>&1; then
    echo "crond is not running"
    exit 1
fi

# Check if we can reach the Next.js app
if ! curl -sf http://next-ppdb:3000/api/health > /dev/null 2>&1; then
    echo "Cannot reach Next.js app health endpoint"
    exit 1
fi

# Check if log file is writable
if ! touch /var/log/scheduler/cron.log 2>/dev/null; then
    echo "Log file is not writable"
    exit 1
fi

# Check if Docker socket is accessible
if ! docker info > /dev/null 2>&1; then
    echo "Docker socket not accessible"
    exit 1
fi

exit 0
