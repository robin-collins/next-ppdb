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

# Function to report result back to the app
report_result() {
    local SUCCESS=$1
    local UPDATE_ID=$2
    local DURATION=$3
    local ERROR_MSG=$4
    local ROLLBACK_PERFORMED=$5
    local ROLLBACK_DETAILS=$6

    curl -s -X PUT \
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
        "http://next-ppdb:3000/api/admin/updates/execute"
}

# Function to recreate container with specified image version
recreate_container() {
    local VERSION=$1
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Recreating container with version: $VERSION"

    # Export APP_VERSION for docker-compose substitution
    export APP_VERSION="$VERSION"

    # Use docker compose to recreate the container with the new image
    if [ -f "$COMPOSE_FILE" ]; then
        docker compose -f "$COMPOSE_FILE" up -d --force-recreate "$CONTAINER_NAME"
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

    # Use sed to update the APP_VERSION line
    # Handles both APP_VERSION=x.x.x and APP_VERSION="x.x.x" formats
    if grep -q "^APP_VERSION=" "$ENV_FILE"; then
        sed -i "s/^APP_VERSION=.*/APP_VERSION=$VERSION/" "$ENV_FILE"
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
    report_result "false" "$UPDATE_ID" "$DURATION" "GHCR authentication failed" "false" ""
    exit 1
fi

# Step 2: Pull new image
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Pulling new image: $NEW_IMAGE..."
if ! docker pull "$NEW_IMAGE"; then
    END_TIME=$(date +%s)
    DURATION=$(( (END_TIME - START_TIME) * 1000 ))
    report_result "false" "$UPDATE_ID" "$DURATION" "Failed to pull image $NEW_IMAGE" "false" ""
    exit 1
fi

# Step 3: Store current image for potential rollback
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Current image stored for rollback: $PREVIOUS_IMAGE"

# Step 4: Recreate container with new image
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Recreating container with new image..."

if ! recreate_container "$NEW_VERSION"; then
    END_TIME=$(date +%s)
    DURATION=$(( (END_TIME - START_TIME) * 1000 ))
    report_result "false" "$UPDATE_ID" "$DURATION" "Failed to recreate container with new image" "false" ""
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
        report_result "false" "$UPDATE_ID" "$DURATION" "Health check failed after restart" "true" "Rolled back to $CURRENT_VERSION successfully"
    else
        report_result "false" "$UPDATE_ID" "$DURATION" "Health check failed and rollback also failed" "true" "Rollback attempted but container still unhealthy"
    fi
    exit 1
fi

# Step 6: Update .env file with new version
# This ensures manual docker-compose restarts use the correct version
update_env_version "$NEW_VERSION"

# Step 7: Report success
END_TIME=$(date +%s)
DURATION=$(( (END_TIME - START_TIME) * 1000 ))

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Update completed successfully in ${DURATION}ms"
report_result "true" "$UPDATE_ID" "$DURATION" "" "false" ""

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Update execution task finished"
