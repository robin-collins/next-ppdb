# Task Scheduler Integration Plan for Next-PPDB

## Overview

Integrate a robust task scheduler using a **sidecar cron container** architecture supporting:

1. **Nightly database backup** with email report
2. **Twice-daily container version check** against ghcr.io registry (6:00 AM & 12:00 PM)
3. **Staff approval workflow** for app updates before execution

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
- Queries ghcr.io API for latest container tags
- Compares versions using semver
- **Creates a pending update record** if new version is available
- Sends notification email to staff
- Returns: `{ current: "0.1.2", latest: "0.1.5", updateAvailable: true, pendingUpdateId: 123 }`

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

- Called by scheduler at next scheduled run time
- Processes all APPROVED updates
- Triggers deployment webhook/notification
- Marks updates as EXECUTED

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
┌─────────────────────┐     No new version
│  Check for Updates  │────────────────────► Done
└─────────┬───────────┘
          │ New version found
          ▼
┌─────────────────────┐
│ Create Pending      │
│ Update Record       │
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
│ Approve │ │ Cancel  │
│         │ │(Later)  │
└────┬────┘ └────┬────┘
     │           │
     ▼           ▼
┌─────────────┐ ┌───────────┐
│ Scheduled   │ │ Record    │
│ for Next    │ │ Deleted   │
│ Cron Run    │ │           │
└─────────────┘ └───────────┘
```

### 2.2 Update Statuses

| Status     | Description                                         |
| ---------- | --------------------------------------------------- |
| `PENDING`  | Detected, awaiting staff review                     |
| `APPROVED` | Staff approved, scheduled for next execution window |
| `EXECUTED` | Update action completed                             |

> **Note:** There is no "REJECTED" status. Staff can either:
>
> - **Approve** → Schedules for next run
> - **Cancel** → Removes from queue (can be re-detected in next check)

### 2.3 Database Schema

**File:** `prisma/schema.prisma` (addition)

```prisma
model PendingUpdate {
  id             Int           @id @default(autoincrement())
  currentVersion String        @db.VarChar(20)
  newVersion     String        @db.VarChar(20)
  releaseNotes   String?       @db.Text
  detectedAt     DateTime      @default(now())
  status         UpdateStatus  @default(PENDING)
  approvedBy     String?       @db.VarChar(50)
  approvedAt     DateTime?
  executedAt     DateTime?
  notes          String?       @db.Text

  @@index([status])
  @@index([detectedAt])
}

enum UpdateStatus {
  PENDING
  APPROVED
  EXECUTED
}
```

### 2.4 Admin UI Page

**File:** `src/app/(dashboard)/admin/updates/page.tsx`

- Display pending updates in a card/table format
- Show: current version, new version, detected time, status
- Action buttons: **Approve** | **Cancel**
- Badge notification in sidebar when updates are pending

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

| Template          | Purpose                                    |
| ----------------- | ------------------------------------------ |
| `backupSuccess`   | Backup completed successfully with summary |
| `backupFailure`   | Backup failed with error details           |
| `updateAvailable` | New version detected, action required      |
| `updateApproved`  | Confirmation that update is scheduled      |
| `updateExecuted`  | Update has been executed                   |

---

## 4. GitHub Container Registry Integration

### 4.1 GHCR Client

**File:** `src/lib/ghcr.ts`

- Authenticate with PAT token
- List available tags for next-ppdb image
- Parse semantic version tags
- Find latest version

**API Endpoint:** `https://ghcr.io/v2/robin-collins/next-ppdb/tags/list`

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

# Execute approved updates at 6:05 AM and 12:05 PM (5 mins after check)
5 6 * * * /scripts/execute-updates.sh >> /var/log/scheduler/cron.log 2>&1
5 12 * * * /scripts/execute-updates.sh >> /var/log/scheduler/cron.log 2>&1

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

- Log detailed error information
- Update status with error notes
- Notification email on failure

---

## 9. Files Summary

### Create (16 files)

| File                                              | Purpose                   |
| ------------------------------------------------- | ------------------------- |
| `src/app/api/admin/scheduled-backup/route.ts`     | Scheduled backup endpoint |
| `src/app/api/admin/version-check/route.ts`        | Version check endpoint    |
| `src/app/api/admin/updates/pending/route.ts`      | List pending updates      |
| `src/app/api/admin/updates/[id]/route.ts`         | Get/Cancel single update  |
| `src/app/api/admin/updates/[id]/approve/route.ts` | Approve update            |
| `src/app/api/admin/updates/execute/route.ts`      | Execute approved updates  |
| `src/app/(dashboard)/admin/updates/page.tsx`      | Admin UI for updates      |
| `src/lib/email.ts`                                | Nodemailer service        |
| `src/lib/email-templates.ts`                      | Email templates           |
| `src/lib/ghcr.ts`                                 | GHCR registry client      |
| `src/lib/scheduler-auth.ts`                       | Auth helper               |
| `docker/scheduler/Dockerfile`                     | Scheduler image           |
| `docker/scheduler/crontab`                        | Cron config               |
| `docker/scheduler/healthcheck.sh`                 | Health check script       |
| `docker/scheduler/logrotate.conf`                 | Log rotation config       |
| `docker/scheduler/scripts/backup.sh`              | Backup script             |
| `docker/scheduler/scripts/version-check.sh`       | Version script            |
| `docker/scheduler/scripts/execute-updates.sh`     | Update execution script   |

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
pnpm add nodemailer
pnpm add -D @types/nodemailer
```

---

## 10. Implementation Order

1. **Database Schema** - Add PendingUpdate model, run migration
2. **Email Service** - Add nodemailer, create templates, test
3. **GHCR Client** - Registry API, version comparison
4. **API Endpoints** - Auth helper + all endpoints + tests
5. **Admin UI** - Updates management page with approve/cancel
6. **Scheduler Container** - Dockerfile, scripts, crontab, health check
7. **Integration** - Docker-compose updates, env vars
8. **Documentation** - CHANGELOG, FILETREE updates

---

## 11. Schedule Summary

| Task            | Time (Australia/Adelaide) | Frequency |
| --------------- | ------------------------- | --------- |
| Database Backup | 2:00 AM                   | Daily     |
| Version Check   | 6:00 AM                   | Daily     |
| Version Check   | 12:00 PM                  | Daily     |
| Execute Updates | 6:05 AM                   | Daily     |
| Execute Updates | 12:05 PM                  | Daily     |
| Log Rotation    | 12:00 AM                  | Daily     |
