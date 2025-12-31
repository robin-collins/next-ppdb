#!/bin/bash
# Startup Notification Script
# Sends a test email to the developer notification email on container startup

set -e

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Scheduler startup notification task started"

# Check if required variables are set
if [ -z "$DEVELOPER_NOTIFICATION_EMAIL" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: DEVELOPER_NOTIFICATION_EMAIL not set, skipping notification"
    exit 0
fi

if [ -z "$SMTP_HOST" ] || [ -z "$SMTP_USER" ] || [ -z "$SMTP_PASS" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] SMTP not configured, notification disabled"
    exit 0
fi

# Configure msmtp
cat > /tmp/msmtprc <<EOF
defaults
auth           on
tls            on
tls_trust_file /etc/ssl/certs/ca-certificates.crt
logfile        /var/log/scheduler/msmtp.log

account        default
host           $SMTP_HOST
port           ${SMTP_PORT:-587}
from           ${SMTP_FROM:-$SMTP_USER}
user           $SMTP_USER
password       $SMTP_PASS
EOF
chmod 600 /tmp/msmtprc

# Prepare email content
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
HOSTNAME=$(hostname)
VERSION=${SCHEDULER_VERSION:-unknown}

SUBJECT="[PPDB] Scheduler Started: $HOSTNAME"
BODY="PPDB Scheduler Startup Notification
========================================

Status: STARTED
Timestamp: $TIMESTAMP
Hostname: $HOSTNAME
Version: $VERSION

The scheduler container has successfully (re)started and confirmed its email sending capabilities.

---
PPDB Scheduler"

# Send email
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Sending startup notification to $DEVELOPER_NOTIFICATION_EMAIL..."

{
    echo "To: $DEVELOPER_NOTIFICATION_EMAIL"
    echo "From: ${SMTP_FROM:-$SMTP_USER}"
    echo "Subject: $SUBJECT"
    echo "Content-Type: text/plain; charset=UTF-8"
    echo ""
    echo "$BODY"
} | msmtp -C /tmp/msmtprc "$DEVELOPER_NOTIFICATION_EMAIL"

if [ $? -eq 0 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Startup notification sent successfully"
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Failed to send startup notification"
fi

exit 0
