#!/bin/bash
# Startup Notification Script
# Sends a test email to the developer notification email on container startup

set -e

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Scheduler startup notification task started v${APP_VERSION}"

# Helper for masked logging
log_masked() {
    local key=$1
    local value=$2
    if [ -z "$value" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] DEBUG: $key is NOT SET"
    else
        # Mask all but first and last 2 chars if length > 5
        local len=${#value}
        if [ $len -gt 5 ]; then
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] DEBUG: $key is SET (${value:0:1}***${value: -2})"
        else
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] DEBUG: $key is SET (***)"
        fi
    fi
}

# Log configuration (masked)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Checking configuration..."
log_masked "DEVELOPER_NOTIFICATION_EMAIL" "$DEVELOPER_NOTIFICATION_EMAIL"
log_masked "SMTP_HOST" "$SMTP_HOST"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] DEBUG: SMTP_PORT is ${SMTP_PORT:-587}"
log_masked "SMTP_USER" "$SMTP_USER"
log_masked "SMTP_PASS" "$SMTP_PASS"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] DEBUG: SMTP_FROM is ${SMTP_FROM:-$SMTP_USER}"

# Check if required variables are set
if [ -z "$DEVELOPER_NOTIFICATION_EMAIL" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: DEVELOPER_NOTIFICATION_EMAIL not set, skipping notification"
    exit 0
fi

if [ -z "$SMTP_HOST" ] || [ -z "$SMTP_USER" ] || [ -z "$SMTP_PASS" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: SMTP not fully configured, notification disabled"
    exit 0
fi

# Check for msmtp
if ! command -v msmtp >/dev/null 2>&1; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: msmtp command not found"
    exit 1
fi

# Configure msmtp
MSMTP_CONF="/tmp/msmtprc"
MSMTP_LOG="/tmp/msmtp.log" # Fallback for host testing
SMTP_CUR_PORT=${SMTP_PORT:-587}

# msmtp settings for 465 vs 587
TLS_STARTTLS="on"
if [ "$SMTP_CUR_PORT" == "465" ]; then
    TLS_STARTTLS="off"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] DEBUG: Port 465 detected, disabling STARTTLS (Implicit TLS)"
fi

# Check for SSL certs on host vs container
# Unconditionally disabling cert check to handle hostname mismatches common on shared hosting
echo "[$(date '+%Y-%m-%d %H:%M:%S')] DEBUG: Disabling TLS certificate verification for maximum compatibility"
TLS_CHECK="off"
TLS_TRUST_FILE="/etc/ssl/certs/ca-certificates.crt"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Generating msmtp configuration at $MSMTP_CONF"
cat > "$MSMTP_CONF" <<EOF
defaults
auth           on
tls            on
tls_starttls   $TLS_STARTTLS
tls_certcheck  $TLS_CHECK
tls_trust_file $TLS_TRUST_FILE
logfile        $MSMTP_LOG
timeout        15

account        default
host           $SMTP_HOST
port           $SMTP_CUR_PORT
from           ${SMTP_FROM:-$SMTP_USER}
user           $SMTP_USER
password       $SMTP_PASS
EOF
chmod 600 "$MSMTP_CONF"

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

# Prepare envelope from address (strip friendly name if present for SMTP compatibility)
ENVELOPE_FROM="${SMTP_FROM:-$SMTP_USER}"
if [[ "$ENVELOPE_FROM" =~ \<([^>]+)\> ]]; then
    ENVELOPE_FROM="${BASH_REMATCH[1]}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] DEBUG: Extracted envelope from address: $ENVELOPE_FROM"
fi

# Send email
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Sending startup notification to $DEVELOPER_NOTIFICATION_EMAIL..."
echo "[$(date '+%Y-%m-%d %H:%M:%S')] DEBUG: Executing msmtp with verbose output"

# Run msmtp and capture output directly to see it in real-time
set +e
{
    echo "To: $DEVELOPER_NOTIFICATION_EMAIL"
    echo "From: ${SMTP_FROM:-$SMTP_USER}"
    echo "Subject: $SUBJECT"
    echo "Content-Type: text/plain; charset=UTF-8"
    echo ""
    echo "$BODY"
} | msmtp -v -C "$MSMTP_CONF" -f "$ENVELOPE_FROM" "$DEVELOPER_NOTIFICATION_EMAIL" 2>&1 | tee /tmp/msmtp_last_run.log

MSMTP_STATUS=${PIPESTATUS[0]}
set -e

if [ $MSMTP_STATUS -eq 0 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Startup notification sent successfully"
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Failed to send startup notification (exit code: $MSMTP_STATUS)"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Tip: Check the output above. If it timed out, verify SMTP_HOST and SMTP_PORT."
fi

exit 0
