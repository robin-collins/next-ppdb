# Task Scheduler Integration Plan for Next-PPDB

## Overview

Integrate a robust task scheduler using a **sidecar cron container** architecture supporting:

1. **Nightly database backup** with email report
2. **Twice-daily container version check** against ghcr.io registry (6:00 AM & 12:00 PM)
3. **Staff approval workflow** for app updates before execution with **strict sequential version enforcement**

**This implementation uses:**

- Custom GHCR API integration for version detection
- Application-managed update queue with approval workflow
- Scheduler container executing approved updates via Docker commands
- Database-backed state management for update governance

## Key Requirements & Constraints

### Sequential Update Enforcement (CRITICAL)

1. **No Version Skipping**: Updates must proceed sequentially (0.1.2 → 0.1.3 → 0.1.4, never 0.1.2 → 0.1.5)
2. **Next Version Only**: Version check endpoint only detects the immediate next version
3. **Execution Validation**: Before executing, verify the update is still the next sequential version
4. **Single Approved Update**: Only one APPROVED update can exist at a time

### User Actions (STRICT)

**Only two actions are available to staff:**

- **Approve**: Schedules the update for execution at the next scheduled window
- **Cancel**: Removes the update from the queue (can be re-detected later if still next version)

**No other actions exist:**

- No "reject permanently"
- No "skip this version"
- No "approve multiple updates"
- No "force update to specific version"

### Update Execution Process

1. **Image Pull**: Authenticate with GHCR and pull the new image version
2. **Container Restart**: Update docker-compose configuration and restart the `next-ppdb` container
3. **Health Verification**: Wait for health check to pass before marking as EXECUTED
4. **Version Update**: Update `NEXT_PUBLIC_APP_VERSION` environment variable
5. **Automatic Re-check**: Next version check will detect the next sequential version

## Architecture

```
+------------------+     HTTP calls      +------------------+
|   Scheduler      | -----------------> |   Next.js App    |
|   (Alpine+Cron)  |                     |   (next-ppdb)    |
+------------------+                     +------------------+
        |                                         |
        |  SMTP                                   | MySQL
        v                                         v
+------------------+                     +------------------+
|   Email Server   |                     |   MySQL Database |
+------------------+                     +------------------+
```

**Why sidecar cron container:**

- Clean separation of concerns
- Independent scaling/restarts
- Standard cron syntax
- Survives app restarts without losing scheduled tasks
- Dedicated health monitoring

---

## 1. New API Endpoints

### 1.1 Scheduled Backup Endpoint

**File:** `src/app/api/admin/scheduled-backup/route.ts`

- Triggers existing backup functionality
- Generates backup report (JSON/text summary)
- Emails backup file and report to configured address
- Returns success/failure status

### 1.2 Version Check Endpoint

**File:** `src/app/api/admin/version-check/route.ts`

- Reads current version from `NEXT_PUBLIC_APP_VERSION`
- Queries ghcr.io API for available container tags
- **Enforces sequential updates**: Only detects the next immediate version (e.g., 0.1.2 → 0.1.3, not 0.1.2 → 0.1.5)
- Compares versions using semver
- **Validates no version skipping**: If current is 0.1.2 and registry has 0.1.5, only 0.1.3 is eligible
- Checks for existing pending updates (prevents duplicates)
- **Creates a pending update record** if next sequential version is available
- Sends notification email to staff
- Returns: `{ current: "0.1.2", nextVersion: "0.1.3", updateAvailable: true, pendingUpdateId: 123, skippedVersions: ["0.1.4", "0.1.5"] }`

### 1.3 Pending Updates Endpoints

**File:** `src/app/api/admin/updates/pending/route.ts`

- `GET`: List all pending updates awaiting approval
- Returns updates with status PENDING or APPROVED (awaiting execution)

**File:** `src/app/api/admin/updates/[id]/route.ts`

- `GET`: Get single pending update details
- `DELETE`: Cancel a pending update (remove from queue)

**File:** `src/app/api/admin/updates/[id]/approve/route.ts`

- `POST`: Approve an update for execution at next scheduled run
- Records approver name and timestamp
- Sends confirmation email

### 1.4 Update Execution Endpoint

**File:** `src/app/api/admin/updates/execute/route.ts`

- Called by scheduler at 8:00 PM daily (once per day)
- Processes **only the oldest APPROVED update** (ensures sequential execution)
- **Validates sequential order**: Verifies the update is the next version after current
- **Executes update process**:
  1. Authenticates with GHCR using PAT token
  2. Pulls new image: `docker pull ghcr.io/robin-collins/next-ppdb:{version}`
  3. Updates docker-compose.yml image tag (or uses environment variable)
  4. Restarts service: `docker compose up -d next-ppdb` (or equivalent)
  5. Waits for health check to pass
  6. Updates `NEXT_PUBLIC_APP_VERSION` environment variable
- **On success**: Marks update as EXECUTED with timestamp, sends success email with execution details
- **On failure**: Logs error, marks update as FAILED with error status, sends failure email with error details
- **Email notifications include**:
  - Update version information (from → to)
  - Execution timestamp
  - Execution duration
  - Success/failure status
  - Error details (if failed)
  - Health check results
  - Next steps (if applicable)

---

## 2. Staff Approval Workflow

### 2.1 Workflow Flow

```
┌─────────────────────┐
│  Twice-Daily Check  │
│  (6:00 AM, 12:00 PM)│
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐     No next sequential version
│  Check for Updates  │────────────────────► Done
│  (Sequential Only)  │
└─────────┬───────────┘
          │ Next sequential version found
          │ (e.g., 0.1.2 → 0.1.3 only)
          ▼
┌─────────────────────┐
│ Validate Sequential │
│ Order & Create      │
│ Pending Record      │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Notify Staff        │
│ (Email + In-App)    │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   Staff Reviews     │
│   in Admin Panel    │
└─────────┬───────────┘
          │
     ┌────┴────┐
     │         │
     ▼         ▼
┌─────────┐ ┌─────────┐
│ Approve │ │ Cancel │
│         │ │(Later) │
└────┬────┘ └────┬────┘
     │           │
     ▼           ▼
┌─────────────┐ ┌───────────┐
│ Scheduled   │ │ Record    │
│ for 8:00 PM │ │ Deleted   │
│ Daily Run   │ │           │
└─────────────┘ └───────────┘
     │
     ▼
┌─────────────────────┐
│ Execute Update      │
│ (8:00 PM Daily)     │
│ (Pull + Restart)    │
└─────────┬───────────┘
          │
     ┌────┴────┐
     │         │
     ▼         ▼
┌─────────┐ ┌─────────┐
│ Success │ │ Failure │
└────┬────┘ └────┬────┘
     │           │
     ▼           ▼
┌─────────────┐ ┌─────────────┐
│ Mark        │ │ Mark        │
│ EXECUTED    │ │ FAILED      │
│ + Email     │ │ + Email     │
│ Results     │ │ Error       │
└─────────────┘ └─────────────┘
```

### 2.2 Update Statuses

| Status     | Description                                            |
| ---------- | ------------------------------------------------------ |
| `PENDING`  | Detected, awaiting staff review                        |
| `APPROVED` | Staff approved, scheduled for next execution window    |
| `EXECUTED` | Update action completed successfully                   |
| `FAILED`   | Update execution failed (requires manual intervention) |

> **Note:** There is no "REJECTED" status. Staff can only:
>
> - **Approve** → Schedules for next execution window (only one APPROVED update at a time)
> - **Cancel** → Removes from queue (can be re-detected in next check if still next sequential version)

### 2.2.1 Sequential Update Enforcement

**Critical Rules:**

1. **Only the next immediate version is eligible** - If current is `0.1.2`, only `0.1.3` can be proposed (not `0.1.4` or `0.1.5`)
2. **Only one APPROVED update at a time** - System prevents multiple approved updates from queuing
3. **Version validation on execution** - Before executing, verify the update is still the next sequential version
4. **Automatic re-check after execution** - After successful update, next check will detect the next version in sequence

### 2.3 Database Schema

**File:** `prisma/schema.prisma` (addition)

```prisma
model PendingUpdate {
  id             Int           @id @default(autoincrement())
  currentVersion String        @db.VarChar(20)
  newVersion     String        @db.VarChar(20)  // Must be next sequential version
  releaseNotes   String?       @db.Text
  detectedAt     DateTime      @default(now())
  status         UpdateStatus  @default(PENDING)
  approvedBy     String?       @db.VarChar(50)
  approvedAt     DateTime?
  executedAt     DateTime?
  errorMessage   String?       @db.Text         // Error details if execution failed
  notes          String?       @db.Text

  @@index([status])
  @@index([detectedAt])
  @@index([status, detectedAt]) // For querying oldest APPROVED update
  @@unique([currentVersion, newVersion, status]) // Prevent duplicate pending updates
}

enum UpdateStatus {
  PENDING
  APPROVED
  EXECUTED
  FAILED
}
```

### 2.4 Admin UI Page

**File:** `src/app/(dashboard)/admin/updates/page.tsx`

- Display pending updates in a card/table format
- Show: current version, new version, detected time, status, error message (if failed)
- **Action buttons: Approve | Cancel** (only two actions available)
- **Sequential version warning**: Display alert if skipped versions exist (informational only)
- **Approval restriction**: Disable "Approve" if another update is already APPROVED
- Badge notification in sidebar when updates are pending
- **Update execution status**: Show execution progress and results

---

## 3. Email Service

### 3.1 Nodemailer Setup

**File:** `src/lib/email.ts`

- Configure SMTP from environment variables
- Provide `sendEmail()` function
- Support attachments (for backup files)
- HTML and plain text templates

### 3.2 Environment Variables

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=user@example.com
SMTP_PASSWORD=password
SMTP_FROM="PPDB Scheduler <noreply@example.com>"
BACKUP_EMAIL_TO=admin@example.com
UPDATE_NOTIFICATION_EMAIL=staff@example.com
```

### 3.3 Email Templates

**File:** `src/lib/email-templates.ts`

| Template                | Purpose                                                                                               |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| `backupSuccess`         | Backup completed successfully with summary                                                            |
| `backupFailure`         | Backup failed with error details                                                                      |
| `updateAvailable`       | New version detected, action required                                                                 |
| `updateApproved`        | Confirmation that update is scheduled                                                                 |
| `updateExecutedSuccess` | Update executed successfully with details (version, timestamp, duration, health check)                |
| `updateExecutedFailure` | Update execution failed with error details (version, timestamp, error message, troubleshooting steps) |

---

## 4. GitHub Container Registry Integration

### 4.1 GHCR Client

**File:** `src/lib/ghcr.ts`

- Authenticate with PAT token
- List available tags for next-ppdb image
- Parse semantic version tags (semver format: `MAJOR.MINOR.PATCH`)
- **Find next sequential version**: Given current version, return only the next immediate version
- **Validate sequential order**: Ensure no version skipping occurs
- Filter out pre-release tags (e.g., `-alpha`, `-beta`) unless explicitly configured

**API Endpoint:** `https://ghcr.io/v2/robin-collins/next-ppdb/tags/list`

**Key Functions:**

- `getNextSequentialVersion(currentVersion: string, availableTags: string[]): string | null`
  - Returns the next version in sequence (e.g., `0.1.2` → `0.1.3`)
  - Returns `null` if no next sequential version exists
  - Throws error if multiple sequential versions are skipped

### 4.2 Environment Variables

```env
GHCR_PAT=ghp_xxxxxxxxxxxx
GHCR_IMAGE=ghcr.io/robin-collins/next-ppdb
```

---

## 5. Scheduler Container

### 5.1 Dockerfile

**File:** `docker/scheduler/Dockerfile`

```dockerfile
FROM alpine:3.20

# Install required packages
RUN apk add --no-cache curl logrotate

# Create log directory
RUN mkdir -p /var/log/scheduler

# Copy configuration files
COPY crontab /etc/crontabs/root
COPY logrotate.conf /etc/logrotate.d/scheduler
COPY scripts/ /scripts/

# Set permissions
RUN chmod +x /scripts/*.sh

# Health check script
COPY healthcheck.sh /healthcheck.sh
RUN chmod +x /healthcheck.sh

# Set timezone
ENV TZ=Australia/Adelaide
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD /healthcheck.sh

CMD ["crond", "-f", "-l", "2"]
```

### 5.2 Health Check Script

**File:** `docker/scheduler/healthcheck.sh`

```bash
#!/bin/sh
# Check if crond is running
pgrep crond > /dev/null 2>&1 || exit 1

# Check if we can reach the app
curl -sf http://next-ppdb:3000/api/health > /dev/null 2>&1 || exit 1

# Check log file is writable
touch /var/log/scheduler/cron.log 2>/dev/null || exit 1

exit 0
```

### 5.3 Log Rotation Configuration

**File:** `docker/scheduler/logrotate.conf`

```
/var/log/scheduler/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 0644 root root
    dateext
    dateformat -%Y%m%d
}
```

### 5.4 Crontab

**File:** `docker/scheduler/crontab`

```cron
# Timezone: Australia/Adelaide

# Nightly backup at 2:00 AM
0 2 * * * /scripts/backup.sh >> /var/log/scheduler/cron.log 2>&1

# Version check at 6:00 AM
0 6 * * * /scripts/version-check.sh >> /var/log/scheduler/cron.log 2>&1

# Version check at 12:00 PM (noon)
0 12 * * * /scripts/version-check.sh >> /var/log/scheduler/cron.log 2>&1

# Execute approved updates at 8:00 PM (once daily)
0 20 * * * /scripts/execute-updates.sh >> /var/log/scheduler/cron.log 2>&1

# Log rotation at midnight
0 0 * * * /usr/sbin/logrotate /etc/logrotate.d/scheduler
```

### 5.5 Scripts

**File:** `docker/scheduler/scripts/backup.sh`

```bash
#!/bin/sh
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting scheduled backup..."
curl -X POST http://next-ppdb:3000/api/admin/scheduled-backup \
  -H "Authorization: Bearer $SCHEDULER_API_KEY" \
  -H "Content-Type: application/json"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup completed."
```

**File:** `docker/scheduler/scripts/version-check.sh`

```bash
#!/bin/sh
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting version check..."
curl -X POST http://next-ppdb:3000/api/admin/version-check \
  -H "Authorization: Bearer $SCHEDULER_API_KEY" \
  -H "Content-Type: application/json"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Version check completed."
```

**File:** `docker/scheduler/scripts/execute-updates.sh`

```bash
#!/bin/sh
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Checking for approved updates..."
curl -X POST http://next-ppdb:3000/api/admin/updates/execute \
  -H "Authorization: Bearer $SCHEDULER_API_KEY" \
  -H "Content-Type: application/json"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Update execution check completed."
```

**Note:** The actual Docker image pull and container restart are executed by the Next.js API endpoint, not the scheduler script. The scheduler only triggers the execution endpoint, which then:

1. Authenticates with GHCR
2. Executes `docker pull` for the new image
3. Updates docker-compose configuration
4. Restarts the container using Docker API or shell commands
5. Verifies health check passes
6. **Sends email notification** with execution results (success or failure) to configured staff email address

---

## 6. Security

### 6.1 API Key Authentication

**File:** `src/lib/scheduler-auth.ts`

```typescript
export function validateSchedulerAuth(request: Request): boolean {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  return token === process.env.SCHEDULER_API_KEY
}
```

### 6.2 Credentials Storage

- All sensitive values in `.env` (never committed)
- Passed to containers via docker-compose
- Optional: Docker secrets for production

---

## 7. Docker Compose Updates

Add to `docker-compose.yml`:

```yaml
scheduler:
  build:
    context: ./docker/scheduler
    dockerfile: Dockerfile
  container_name: ppdb-scheduler
  hostname: ppdb-scheduler
  restart: unless-stopped
  environment:
    - SCHEDULER_API_KEY=${SCHEDULER_API_KEY}
    - TZ=Australia/Adelaide
  volumes:
    - scheduler_logs:/var/log/scheduler
  depends_on:
    next-ppdb:
      condition: service_healthy
  healthcheck:
    test: ['CMD', '/healthcheck.sh']
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 10s
  networks:
    - web
  labels:
    - 'traefik.enable=false'
```

Add env vars to `next-ppdb` service:

```yaml
NEXT_PUBLIC_APP_VERSION: ${APP_VERSION:-0.1.2}
SCHEDULER_API_KEY: ${SCHEDULER_API_KEY}
SMTP_HOST: ${SMTP_HOST}
SMTP_PORT: ${SMTP_PORT:-587}
SMTP_USER: ${SMTP_USER}
SMTP_PASSWORD: ${SMTP_PASSWORD}
SMTP_FROM: ${SMTP_FROM}
BACKUP_EMAIL_TO: ${BACKUP_EMAIL_TO}
UPDATE_NOTIFICATION_EMAIL: ${UPDATE_NOTIFICATION_EMAIL}
GHCR_PAT: ${GHCR_PAT}
GHCR_IMAGE: ${GHCR_IMAGE:-ghcr.io/robin-collins/next-ppdb}
```

**Add Docker socket mount to `next-ppdb` service** (for update execution):

```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock:ro # Read-only access for Docker API
```

**Note:** This allows the Next.js application to execute Docker commands via the Docker API. Consider security implications and restrict access if needed.

Add volume:

```yaml
volumes:
  scheduler_logs:
    driver: local
```

---

## 8. Error Handling

### Backup Errors

- Retry: 3 attempts with exponential backoff
- On failure: Send alert email with error details
- Log all attempts with timestamps

### Version Check Errors

- Network failures: Retry up to 3 times
- Auth failures: Log and alert (PAT may have expired)
- Graceful degradation if check fails

### Email Errors

- Queue failed emails for retry
- Fallback to file logging if email unavailable

### Update Execution Errors

- Log detailed error information (Docker pull failures, restart failures, health check timeouts)
- Update status to `FAILED` with error message
- **Email notification on failure** with:
  - Error message and stack trace
  - Execution timestamp and duration
  - Version information (from → to)
  - Troubleshooting steps
  - Manual intervention requirements
- **Manual intervention required** - Failed updates must be manually resolved
- **Prevent automatic retry** - Failed updates remain in FAILED status until manually cancelled or fixed

### Update Execution Success

- **Email notification on success** with:
  - Version information (from → to)
  - Execution timestamp and duration
  - Health check verification status
  - Next version check schedule information
  - Confirmation that application is running on new version

---

## 9. Update Execution Implementation Details

### 9.1 Docker Image Pull and Restart Process

The update execution endpoint (`/api/admin/updates/execute`) must:

1. **Record execution start time** for duration calculation

2. **Authenticate with GHCR:**

   ```typescript
   // Use GHCR_PAT for authentication
   const authHeader = `Bearer ${process.env.GHCR_PAT}`
   ```

3. **Pull New Image:**

   ```bash
   docker pull ghcr.io/robin-collins/next-ppdb:{newVersion}
   ```

4. **Update Container Configuration:**
   - Option A: Update `docker-compose.yml` image tag (requires file write access)
   - Option B: Use environment variable override: `IMAGE_TAG={newVersion}`
   - Option C: Use Docker API to update container image directly

5. **Restart Container:**

   ```bash
   docker compose up -d next-ppdb
   # OR
   docker restart next-ppdb
   ```

6. **Verify Health:**
   - Poll `/api/health` endpoint until it returns 200
   - Timeout after 5 minutes
   - Record health check status and duration
   - If health check fails, rollback to previous image

7. **Update Application Version:**
   - Update `NEXT_PUBLIC_APP_VERSION` environment variable
   - May require container restart or environment reload

8. **Send Email Notification:**
   - **On Success**: Use `updateExecutedSuccess` template with:
     - Version transition (from → to)
     - Execution timestamp
     - Total execution duration
     - Health check verification status
     - Confirmation message
   - **On Failure**: Use `updateExecutedFailure` template with:
     - Version transition (from → to)
     - Execution timestamp
     - Duration until failure
     - Error message and details
     - Troubleshooting steps
     - Manual intervention requirements

### 9.2 Docker API Access

The Next.js application needs access to Docker daemon to execute updates. Options:

- **Option A: Docker Socket Mount** (Recommended for containerized execution)
  - Mount `/var/run/docker.sock` to the container
  - Use Docker SDK for Node.js (`dockerode` package)
  - Requires running container with appropriate permissions

- **Option B: External Script Execution**
  - Scheduler container executes update script with Docker access
  - Next.js API triggers script via secure API call
  - Script handles Docker commands directly

- **Option C: Docker Compose API**
  - Use Docker Compose CLI via child process execution
  - Requires docker-compose binary in container

**Recommended:** Option A with `dockerode` package for type-safe Docker API access.

### 9.3 Sequential Version Validation

Before executing any update, validate:

1. **Current version matches database record:**

   ```typescript
   const currentVersion = process.env.NEXT_PUBLIC_APP_VERSION
   if (update.currentVersion !== currentVersion) {
     throw new Error('Version mismatch - update may have been superseded')
   }
   ```

2. **Update is still next sequential version:**

   ```typescript
   const nextVersion = getNextSequentialVersion(currentVersion, availableTags)
   if (update.newVersion !== nextVersion) {
     throw new Error('Update is no longer next sequential version')
   }
   ```

3. **No other APPROVED updates exist:**
   ```typescript
   const otherApproved = await prisma.pendingUpdate.findFirst({
     where: { status: 'APPROVED', id: { not: update.id } },
   })
   if (otherApproved) {
     throw new Error('Another update is already approved')
   }
   ```

## 10. Files Summary

### Create (17 files)

| File                                              | Purpose                                              |
| ------------------------------------------------- | ---------------------------------------------------- |
| `src/app/api/admin/scheduled-backup/route.ts`     | Scheduled backup endpoint                            |
| `src/app/api/admin/version-check/route.ts`        | Version check endpoint                               |
| `src/app/api/admin/updates/pending/route.ts`      | List pending updates                                 |
| `src/app/api/admin/updates/[id]/route.ts`         | Get/Cancel single update                             |
| `src/app/api/admin/updates/[id]/approve/route.ts` | Approve update                                       |
| `src/app/api/admin/updates/execute/route.ts`      | Execute approved updates                             |
| `src/app/(dashboard)/admin/updates/page.tsx`      | Admin UI for updates                                 |
| `src/lib/email.ts`                                | Nodemailer service                                   |
| `src/lib/email-templates.ts`                      | Email templates                                      |
| `src/lib/ghcr.ts`                                 | GHCR registry client with sequential version logic   |
| `src/lib/scheduler-auth.ts`                       | Auth helper                                          |
| `src/lib/docker-client.ts`                        | Docker API client (dockerode) for image pull/restart |
| `docker/scheduler/Dockerfile`                     | Scheduler image                                      |
| `docker/scheduler/crontab`                        | Cron config                                          |
| `docker/scheduler/healthcheck.sh`                 | Health check script                                  |
| `docker/scheduler/logrotate.conf`                 | Log rotation config                                  |
| `docker/scheduler/scripts/backup.sh`              | Backup script                                        |
| `docker/scheduler/scripts/version-check.sh`       | Version script                                       |
| `docker/scheduler/scripts/execute-updates.sh`     | Update execution script                              |

### Modify (5 files)

| File                          | Changes                                       |
| ----------------------------- | --------------------------------------------- |
| `docker-compose.yml`          | Add scheduler service, env vars, log volume   |
| `.env.example`                | Add new env var templates                     |
| `prisma/schema.prisma`        | Add PendingUpdate model and UpdateStatus enum |
| `src/components/Sidebar.tsx`  | Add pending update badge notification         |
| `src/app/api/health/route.ts` | Add scheduler status                          |

### Dependencies

```bash
pnpm add nodemailer dockerode semver
pnpm add -D @types/nodemailer @types/dockerode
```

---

## 11. Implementation Order

1. **Database Schema** - Add PendingUpdate model with sequential version constraints, run migration
2. **Email Service** - Add nodemailer, create templates, test
3. **GHCR Client** - Registry API, sequential version detection logic
4. **Docker Client** - Add dockerode, implement image pull and restart functions
5. **API Endpoints** - Auth helper + all endpoints with sequential validation + tests
6. **Admin UI** - Updates management page with approve/cancel (only two actions)
7. **Scheduler Container** - Dockerfile, scripts, crontab, health check
8. **Integration** - Docker-compose updates, env vars, Docker socket mount
9. **Documentation** - CHANGELOG, FILETREE updates

---

## 12. Schedule Summary

| Task            | Time (Australia/Adelaide) | Frequency |
| --------------- | ------------------------- | --------- |
| Database Backup | 2:00 AM                   | Daily     |
| Version Check   | 6:00 AM                   | Daily     |
| Version Check   | 12:00 PM                  | Daily     |
| Execute Updates | 8:00 PM                   | Daily     |
| Log Rotation    | 12:00 AM                  | Daily     |
