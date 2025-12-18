#!/bin/bash
# Execute Updates Script
# Handles the actual Docker operations for updates (pull, restart, rollback)
#
# PRODUCTION USE: This script assumes docker-compose.yml uses GHCR images:
#   image: ghcr.io/robin-collins/next-ppdb:${APP_VERSION:-latest}
#
# For local testing, see: docker/scheduler/README.md

set -e

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Checking for approved updates..."

# Check if required variables are set
if [ -z "$SCHEDULER_API_KEY" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: SCHEDULER_API_KEY not set"
    exit 1
fi

if [ -z "$GHCR_TOKEN" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: GHCR_TOKEN not set"
    exit 1
fi

GHCR_IMAGE="${GHCR_IMAGE:-ghcr.io/robin-collins/next-ppdb}"
COMPOSE_FILE="${COMPOSE_FILE:-/docker-compose.yml}"
CONTAINER_NAME="${CONTAINER_NAME:-next-ppdb}"
ENV_FILE="${ENV_FILE:-/app/.env}"

# Configure msmtp for sending emails
# Generates config file from environment variables
configure_msmtp() {
    if [ -z "$SMTP_HOST" ] || [ -z "$SMTP_USER" ] || [ -z "$SMTP_PASS" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] SMTP not configured, email notifications disabled"
        return 1
    fi

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
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] SMTP configured for $SMTP_HOST"
    return 0
}

# Send email notification directly via msmtp
# Used as fallback when app is unhealthy and can't send emails
# Parameters: SUBJECT, BODY, RECIPIENT
send_fallback_email() {
    local SUBJECT=$1
    local BODY=$2
    local EMAIL_TO=$3

    if [ -z "$EMAIL_TO" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] No recipient specified, skipping fallback email"
        return 1
    fi

    if ! configure_msmtp; then
        return 1
    fi

    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Sending fallback email to $EMAIL_TO..."

    # Send email using msmtp
    {
        echo "To: $EMAIL_TO"
        echo "From: ${SMTP_FROM:-$SMTP_USER}"
        echo "Subject: $SUBJECT"
        echo "Content-Type: text/plain; charset=UTF-8"
        echo ""
        echo "$BODY"
    } | msmtp -C /tmp/msmtprc "$EMAIL_TO"

    if [ $? -eq 0 ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Fallback email sent successfully to $EMAIL_TO"
        return 0
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Failed to send fallback email to $EMAIL_TO"
        return 1
    fi
}

# Send fallback emails to appropriate recipients based on event type
# Success emails go to both users and developers
# Failure/rollback emails go only to developers
send_fallback_emails() {
    local SUCCESS=$1
    local SUBJECT=$2
    local BODY=$3
    local USER_EMAIL="${UPDATE_NOTIFICATION_EMAIL:-}"
    local DEV_EMAIL="${DEVELOPER_NOTIFICATION_EMAIL:-}"

    if [ "$SUCCESS" = "true" ]; then
        # Success notifications go to both users and developers
        if [ -n "$USER_EMAIL" ]; then
            send_fallback_email "$SUBJECT" "$BODY" "$USER_EMAIL"
        fi
        if [ -n "$DEV_EMAIL" ] && [ "$DEV_EMAIL" != "$USER_EMAIL" ]; then
            send_fallback_email "$SUBJECT" "$BODY" "$DEV_EMAIL"
        fi
        if [ -z "$USER_EMAIL" ] && [ -z "$DEV_EMAIL" ]; then
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] No notification emails configured, skipping fallback emails"
        fi
    else
        # Failure notifications go only to developers
        if [ -n "$DEV_EMAIL" ]; then
            send_fallback_email "$SUBJECT" "$BODY" "$DEV_EMAIL"
        else
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] No DEVELOPER_NOTIFICATION_EMAIL set, skipping failure notification"
        fi
    fi
}

# Function to report result back to the app
# Returns 0 if successful, 1 if failed (app may be down)
report_result() {
    local SUCCESS=$1
    local UPDATE_ID=$2
    local DURATION=$3
    local ERROR_MSG=$4
    local ROLLBACK_PERFORMED=$5
    local ROLLBACK_DETAILS=$6

    local HTTP_RESPONSE
    HTTP_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT \
        -H "Authorization: Bearer $SCHEDULER_API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"success\": $SUCCESS,
            \"updateId\": \"$UPDATE_ID\",
            \"duration\": $DURATION,
            \"error\": \"$ERROR_MSG\",
            \"rollbackPerformed\": $ROLLBACK_PERFORMED,
            \"rollbackDetails\": \"$ROLLBACK_DETAILS\"
        }" \
        "http://next-ppdb:3000/api/admin/updates/execute" 2>/dev/null)

    local HTTP_CODE
    HTTP_CODE=$(echo "$HTTP_RESPONSE" | tail -n 1)

    if [ "$HTTP_CODE" = "200" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Result reported to app successfully"
        return 0
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: Failed to report result to app (HTTP $HTTP_CODE)"
        return 1
    fi
}

# Report result and send fallback email if app is unreachable
# This ensures notifications are sent even when both containers fail
# Email recipients are segregated:
# - Success: Both UPDATE_NOTIFICATION_EMAIL and DEVELOPER_NOTIFICATION_EMAIL
# - Failure/Rollback: Only DEVELOPER_NOTIFICATION_EMAIL
report_and_notify() {
    local SUCCESS=$1
    local UPDATE_ID=$2
    local DURATION=$3
    local ERROR_MSG=$4
    local ROLLBACK_PERFORMED=$5
    local ROLLBACK_DETAILS=$6
    local FROM_VERSION=$7
    local TO_VERSION=$8

    # Try to report via API (which sends email if app is healthy)
    if report_result "$SUCCESS" "$UPDATE_ID" "$DURATION" "$ERROR_MSG" "$ROLLBACK_PERFORMED" "$ROLLBACK_DETAILS"; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] App received result, email should be sent by app"
        return 0
    fi

    # App is unreachable - send fallback email directly
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] App unreachable, sending fallback email notification..."

    local SUBJECT
    local BODY
    local TIMESTAMP
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

    if [ "$SUCCESS" = "true" ]; then
        SUBJECT="[PPDB] Update Completed: v${FROM_VERSION} → v${TO_VERSION}"
        BODY="PPDB Update Notification
========================================

Status: SUCCESS

Update Details:
- From Version: ${FROM_VERSION}
- To Version: ${TO_VERSION}
- Duration: ${DURATION}ms
- Timestamp: ${TIMESTAMP}

The application has been successfully updated.

Note: This email was sent directly by the scheduler because
the app was temporarily unreachable during result reporting.
The update itself was successful.

---
PPDB Scheduler"
    else
        SUBJECT="[PPDB] Update FAILED: v${FROM_VERSION} → v${TO_VERSION}"
        BODY="PPDB Update Notification - FAILURE
========================================

Status: FAILED

Update Details:
- From Version: ${FROM_VERSION}
- To Version: ${TO_VERSION}
- Duration: ${DURATION}ms
- Timestamp: ${TIMESTAMP}

Error: ${ERROR_MSG}

Rollback Performed: ${ROLLBACK_PERFORMED}
Rollback Details: ${ROLLBACK_DETAILS:-N/A}

IMPORTANT: The application may be in an unhealthy state.
Please check the server immediately.

This email was sent directly by the scheduler because
the app is unreachable (both update and rollback may have failed).

---
PPDB Scheduler"
    fi

    # Use segregated email sending based on success/failure
    send_fallback_emails "$SUCCESS" "$SUBJECT" "$BODY"
}

# Function to validate that required environment variables are present in env file
validate_env_file() {
    local REQUIRED_VARS="MYSQL_USER MYSQL_PASSWORD MYSQL_HOST MYSQL_PORT MYSQL_DATABASE"
    local MISSING_VARS=""

    for VAR in $REQUIRED_VARS; do
        if ! grep -q "^${VAR}=" "$ENV_FILE" 2>/dev/null; then
            MISSING_VARS="$MISSING_VARS $VAR"
        fi
    done

    if [ -n "$MISSING_VARS" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Missing required variables in $ENV_FILE:$MISSING_VARS"
        return 1
    fi

    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Environment file validation passed"
    return 0
}

# Function to recreate container with specified image version
recreate_container() {
    local VERSION=$1
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Recreating container with version: $VERSION"

    # Export APP_VERSION for docker-compose substitution
    export APP_VERSION="$VERSION"

    # Verify env file exists
    if [ ! -f "$ENV_FILE" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Environment file not found at $ENV_FILE"
        return 1
    fi

    # Validate required environment variables are present
    if ! validate_env_file; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Environment file validation failed"
        return 1
    fi

    # Use docker compose to recreate the container with the new image
    # CRITICAL: --env-file is required because the .env is at /app/.env but compose file is at /
    # Without this, Docker Compose cannot find environment variables for interpolation
    if [ -f "$COMPOSE_FILE" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Using env file: $ENV_FILE"
        docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --force-recreate "$CONTAINER_NAME"
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Compose file not found at $COMPOSE_FILE"
        return 1
    fi
}

# Function to perform rollback
perform_rollback() {
    local PREVIOUS_VERSION=$1
    local ROLLBACK_REASON=$2
    local PREVIOUS_IMAGE="$GHCR_IMAGE:$PREVIOUS_VERSION"

    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Performing rollback to $PREVIOUS_IMAGE..."

    # Pull the previous image (should already exist locally, but ensure it's available)
    docker pull "$PREVIOUS_IMAGE" 2>/dev/null || true

    # Recreate container with previous version
    recreate_container "$PREVIOUS_VERSION" || true

    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Rollback completed. Reason: $ROLLBACK_REASON"
}

# Function to update APP_VERSION in .env file
# This ensures manual restarts use the correct version
update_env_version() {
    local VERSION=$1

    if [ ! -f "$ENV_FILE" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: .env file not found at $ENV_FILE, skipping version update"
        return 1
    fi

    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Updating APP_VERSION in .env to $VERSION..."

    # NOTE: We can't use 'sed -i' because it creates a temp file and tries to
    # atomically rename it, which fails on Docker bind-mounted volumes with
    # "Resource busy" error. Instead, we read, modify, and write back directly.
    if grep -q "^APP_VERSION=" "$ENV_FILE"; then
        # Read, modify in memory, write back directly (no temp file rename)
        local CONTENT
        CONTENT=$(sed "s/^APP_VERSION=.*/APP_VERSION=$VERSION/" "$ENV_FILE")
        printf '%s\n' "$CONTENT" > "$ENV_FILE"
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] .env APP_VERSION updated to $VERSION"
        return 0
    else
        # APP_VERSION line doesn't exist, append it
        echo "APP_VERSION=$VERSION" >> "$ENV_FILE"
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] APP_VERSION=$VERSION appended to .env"
        return 0
    fi
}

# Function to wait for health check
wait_for_health() {
    local TIMEOUT=$1
    local START=$(date +%s)

    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Waiting for health check (timeout: ${TIMEOUT}s)..."

    while true; do
        CURRENT=$(date +%s)
        ELAPSED=$((CURRENT - START))

        if [ $ELAPSED -ge $TIMEOUT ]; then
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] Health check timed out after ${TIMEOUT}s"
            return 1
        fi

        if curl -sf http://next-ppdb:3000/api/health > /dev/null 2>&1; then
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] Health check passed after ${ELAPSED}s"
            return 0
        fi

        sleep 5
    done
}

# Call the execute endpoint to get update instructions
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Authorization: Bearer $SCHEDULER_API_KEY" \
    -H "Content-Type: application/json" \
    "http://next-ppdb:3000/api/admin/updates/execute")

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -ne 200 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Failed to get update instructions (status $HTTP_CODE)"
    echo "$BODY" | head -c 500
    exit 1
fi

# Check if there's an update to execute
EXECUTE_UPDATE=$(echo "$BODY" | grep -o '"executeUpdate":[^,}]*' | cut -d':' -f2)

if [ "$EXECUTE_UPDATE" != "true" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] No approved updates to execute"
    echo "$BODY" | head -c 500
    exit 0
fi

# Extract update details
UPDATE_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
CURRENT_VERSION=$(echo "$BODY" | grep -o '"currentVersion":"[^"]*"' | cut -d'"' -f4)
NEW_VERSION=$(echo "$BODY" | grep -o '"newVersion":"[^"]*"' | cut -d'"' -f4)

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Executing update: $CURRENT_VERSION -> $NEW_VERSION"

START_TIME=$(date +%s)
PREVIOUS_IMAGE="$GHCR_IMAGE:$CURRENT_VERSION"
NEW_IMAGE="$GHCR_IMAGE:$NEW_VERSION"

# Step 1: Authenticate with GHCR
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Authenticating with GHCR..."
echo "$GHCR_TOKEN" | docker login ghcr.io -u robin-collins --password-stdin

if [ $? -ne 0 ]; then
    END_TIME=$(date +%s)
    DURATION=$(( (END_TIME - START_TIME) * 1000 ))
    report_and_notify "false" "$UPDATE_ID" "$DURATION" "GHCR authentication failed" "false" "" "$CURRENT_VERSION" "$NEW_VERSION"
    exit 1
fi

# Step 2: Pull new image
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Pulling new image: $NEW_IMAGE..."
if ! docker pull "$NEW_IMAGE"; then
    END_TIME=$(date +%s)
    DURATION=$(( (END_TIME - START_TIME) * 1000 ))
    report_and_notify "false" "$UPDATE_ID" "$DURATION" "Failed to pull image $NEW_IMAGE" "false" "" "$CURRENT_VERSION" "$NEW_VERSION"
    exit 1
fi

# Step 3: Store current image for potential rollback
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Current image stored for rollback: $PREVIOUS_IMAGE"

# Step 4: Recreate container with new image
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Recreating container with new image..."

if ! recreate_container "$NEW_VERSION"; then
    END_TIME=$(date +%s)
    DURATION=$(( (END_TIME - START_TIME) * 1000 ))
    report_and_notify "false" "$UPDATE_ID" "$DURATION" "Failed to recreate container with new image" "false" "" "$CURRENT_VERSION" "$NEW_VERSION"
    exit 1
fi

# Step 5: Wait for health check (5 minute timeout)
if ! wait_for_health 300; then
    END_TIME=$(date +%s)
    DURATION=$(( (END_TIME - START_TIME) * 1000 ))

    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Health check failed, initiating rollback..."
    perform_rollback "$CURRENT_VERSION" "Health check failed after container restart"

    # Wait for rollback to be healthy
    if wait_for_health 120; then
        report_and_notify "false" "$UPDATE_ID" "$DURATION" "Health check failed after restart" "true" "Rolled back to $CURRENT_VERSION successfully" "$CURRENT_VERSION" "$NEW_VERSION"
    else
        # CRITICAL: Both update and rollback failed - app is likely down
        # This is the most important fallback email scenario
        report_and_notify "false" "$UPDATE_ID" "$DURATION" "Health check failed and rollback also failed" "true" "Rollback attempted but container still unhealthy" "$CURRENT_VERSION" "$NEW_VERSION"
    fi
    exit 1
fi

# Step 6: Update .env file with new version
# This ensures manual docker-compose restarts use the correct version
update_env_version "$NEW_VERSION"

# Step 7: Give the new container a moment to fully initialize Valkey connection
# This prevents race conditions where the success report arrives before the app is ready
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Waiting 3s for container initialization..."
sleep 3

# Step 8: Report success
END_TIME=$(date +%s)
DURATION=$(( (END_TIME - START_TIME) * 1000 ))

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Update completed successfully in ${DURATION}ms"
report_and_notify "true" "$UPDATE_ID" "$DURATION" "" "false" "" "$CURRENT_VERSION" "$NEW_VERSION"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Update execution task finished"
