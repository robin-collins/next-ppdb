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
GHCR_SCHEDULER_IMAGE="${GHCR_IMAGE}-scheduler"
COMPOSE_FILE="${COMPOSE_FILE:-/docker-compose.yml}"
CONTAINER_NAME="${CONTAINER_NAME:-next-ppdb}"
SCHEDULER_CONTAINER_NAME="${SCHEDULER_CONTAINER_NAME:-ppdb-scheduler}"
# Service name in docker-compose.yml (different from container_name)
SCHEDULER_SERVICE_NAME="${SCHEDULER_SERVICE_NAME:-scheduler}"
ENV_FILE="${ENV_FILE:-/app/.env}"

# Configure msmtp for sending emails
# Generates config file from environment variables
configure_msmtp() {
    if [ -z "$SMTP_HOST" ] || [ -z "$SMTP_USER" ] || [ -z "$SMTP_PASS" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] SMTP not configured, email notifications disabled"
        return 1
    fi

    local MSMTP_CONF="/tmp/msmtprc"
    local MSMTP_LOG="/var/log/scheduler/msmtp.log"
    local SMTP_CUR_PORT=${SMTP_PORT:-587}

    # Ensure log directory exists
    local LOG_DIR=$(dirname "$MSMTP_LOG")
    if [ ! -d "$LOG_DIR" ]; then
        mkdir -p "$LOG_DIR" 2>/dev/null || MSMTP_LOG="/tmp/msmtp.log"
    fi

    # msmtp settings for 465 vs 587
    local TLS_STARTTLS="on"
    if [ "$SMTP_CUR_PORT" == "465" ]; then
        TLS_STARTTLS="off"
    fi

    # Check for SSL certs
    # Unconditionally disabling cert check to handle hostname mismatches common on shared hosting
    local TLS_TRUST_FILE="/etc/ssl/certs/ca-certificates.crt"
    local TLS_CHECK="off"

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
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] SMTP configured (Port: $SMTP_CUR_PORT, StartTLS: $TLS_STARTTLS)"
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

    # Prepare envelope from address (strip friendly name if present for SMTP compatibility)
    local ENVELOPE_FROM="${SMTP_FROM:-$SMTP_USER}"
    if [[ "$ENVELOPE_FROM" =~ \<([^>]+)\> ]]; then
        ENVELOPE_FROM="${BASH_REMATCH[1]}"
    fi

    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Sending fallback email to $EMAIL_TO (from $ENVELOPE_FROM)..."

    # Send email using msmtp (verbose output captured in logs)
    set +e
    {
        echo "To: $EMAIL_TO"
        echo "From: ${SMTP_FROM:-$SMTP_USER}"
        echo "Subject: $SUBJECT"
        echo "Content-Type: text/plain; charset=UTF-8"
        echo ""
        echo "$BODY"
    } | msmtp -v -C /tmp/msmtprc -f "$ENVELOPE_FROM" "$EMAIL_TO" 2>&1 | while read -r line; do
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [msmtp] $line"
    done
    
    local MSMTP_STATUS=${PIPESTATUS[0]}
    set -e

    if [ $MSMTP_STATUS -eq 0 ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Fallback email sent successfully to $EMAIL_TO"
        return 0
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Failed to send fallback email to $EMAIL_TO (exit code: $MSMTP_STATUS)"
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

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Main app update execution task finished"

# Step 9: Update scheduler container to match the new version
# This is the final step - the scheduler restarts itself to stay in sync with the app
# By this point all critical work is done (app healthy, success reported, emails sent)
# so even if this script gets killed during the restart, the update is complete
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Updating scheduler to version $NEW_VERSION..."

# Pull the new scheduler image first
NEW_SCHEDULER_IMAGE="$GHCR_SCHEDULER_IMAGE:$NEW_VERSION"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Pulling new scheduler image: $NEW_SCHEDULER_IMAGE"
if docker pull "$NEW_SCHEDULER_IMAGE"; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Scheduler image pulled successfully"

    # Now restart the scheduler container
    # IMPORTANT: We cannot run docker compose from inside this container because:
    # - When Docker stops this container to recreate it, ALL processes inside are killed
    # - nohup/background doesn't help - the entire cgroup is destroyed
    # - This leaves the recreation incomplete with orphaned/renamed containers
    #
    # SOLUTION: Spawn a separate "updater" container that:
    # - Runs independently from the scheduler being updated
    # - Survives when the scheduler container is stopped
    # - Executes docker-compose to recreate the scheduler
    # - Auto-removes itself when done (--rm)
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Spawning updater container to recreate scheduler..."

    # Discover HOST paths for bind-mounted files
    # When using Docker socket from inside a container, volume paths must be HOST paths
    # We use docker inspect to find where our bind mounts actually point on the host
    COMPOSE_FILE_HOST=$(docker inspect "$SCHEDULER_CONTAINER_NAME" --format '{{range .Mounts}}{{if eq .Destination "/docker-compose.yml"}}{{.Source}}{{end}}{{end}}')
    ENV_FILE_HOST=$(docker inspect "$SCHEDULER_CONTAINER_NAME" --format '{{range .Mounts}}{{if eq .Destination "/app/.env"}}{{.Source}}{{end}}{{end}}')

    # Get the compose project name from the container's labels
    # This ensures the updater uses the same project context
    COMPOSE_PROJECT=$(docker inspect "$SCHEDULER_CONTAINER_NAME" --format '{{index .Config.Labels "com.docker.compose.project"}}')
    COMPOSE_PROJECT=${COMPOSE_PROJECT:-ppdb-app}

    # Get the Docker Compose project working directory from labels
    # This is needed for relative path resolution in compose file
    PROJECT_WORKING_DIR=$(docker inspect "$SCHEDULER_CONTAINER_NAME" --format '{{index .Config.Labels "com.docker.compose.project.working_dir"}}')

    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Host paths discovered:"
    echo "  Compose file: $COMPOSE_FILE_HOST"
    echo "  Env file: $ENV_FILE_HOST"
    echo "  Project name: $COMPOSE_PROJECT"
    echo "  Project dir: $PROJECT_WORKING_DIR"

    if [ -z "$COMPOSE_FILE_HOST" ] || [ -z "$ENV_FILE_HOST" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Could not discover host paths for bind mounts"
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Scheduler self-update skipped. Manual update required."
    else
        # NOTE: docker compose requires SERVICE name ('scheduler'), not CONTAINER name ('ppdb-scheduler')
        # The updater container needs:
        # - Docker socket to talk to Docker daemon
        # - Access to compose file and env file (bind mounts - use discovered HOST paths)
        # - Access to scheduler_logs volume (named volume - mount by name)
        # - Project working directory for relative path resolution
        #
        # IMPORTANT: Must use 'docker compose' (v2, Go-based CLI plugin) NOT 'docker-compose' (v1, Python standalone)
        # The compose file uses top-level 'name:' which is only supported in Compose v2
        # Using 'docker:27-cli' which includes the compose plugin (v2.x)
        docker run -d --rm \
            --name ppdb-scheduler-updater \
            -v /var/run/docker.sock:/var/run/docker.sock \
            -v "$COMPOSE_FILE_HOST":/docker-compose.yml:ro \
            -v "$ENV_FILE_HOST":/app/.env:ro \
            -v ppdb-app_scheduler_logs:/var/log/scheduler \
            -e COMPOSE_PROJECT_NAME="$COMPOSE_PROJECT" \
            --workdir / \
            docker:27-cli \
            sh -c "echo 'Updater started, waiting 3s...' >> /var/log/scheduler/self-update.log 2>&1; sleep 3; echo 'Checking docker compose version...' >> /var/log/scheduler/self-update.log 2>&1; docker compose version >> /var/log/scheduler/self-update.log 2>&1; echo 'Running docker compose up...' >> /var/log/scheduler/self-update.log 2>&1; docker compose -f /docker-compose.yml --env-file /app/.env up -d --force-recreate $SCHEDULER_SERVICE_NAME >> /var/log/scheduler/self-update.log 2>&1; echo 'Scheduler self-update complete' >> /var/log/scheduler/self-update.log 2>&1"

        UPDATER_EXIT=$?
        if [ $UPDATER_EXIT -eq 0 ]; then
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] Updater container spawned successfully"
        else
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: Failed to spawn updater container (exit code: $UPDATER_EXIT)"
        fi
    fi
else
    # If scheduler image pull fails, log it but don't fail the overall update
    # The main app is already updated successfully
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: Failed to pull scheduler image $NEW_SCHEDULER_IMAGE"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Scheduler remains on previous version. Manual update may be required."
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Update execution complete"
