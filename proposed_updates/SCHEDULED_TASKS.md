# Task Scheduler Integration Plan for Next-PPDB

## Overview

Integrate a robust task scheduler using a **sidecar cron container** architecture supporting:

1. **Nightly database backup** with email report
2. **Twice-daily container version check** against ghcr.io registry (6:00 AM & 12:00 PM)
3. **Staff approval workflow** for app updates before execution with **strict sequential version enforcement**

**This implementation uses:**

- Custom GHCR API integration for version detection
- Application-managed update queue with approval workflow
- **Scheduler container executing Docker commands** (image pull, container restart, rollback)
- **Valkey-backed state management** for update governance (NO database schema changes)
- **Automatic rollback** on failed updates (database restore + container image revert)

## Key Requirements & Constraints

### No Database Schema Changes (CRITICAL - MVP REQUIREMENT)

**For MVP / v1.0.0, NO modifications to the MySQL database schema are permitted.**

- Update state management uses **Valkey (Redis)** instead of database tables
- Existing backup functionality is reused without schema additions
- All new data storage uses Valkey keys with appropriate TTLs
- This maintains the "drop-in replacement" philosophy of the application

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

> **Note:** All Docker commands are executed by the **scheduler container**, which has Docker socket access. The Next.js app only manages state and triggers execution via API calls.

1. **Pre-Update Backup**: Create database backup before any changes (for rollback)
2. **Record Previous Image**: Store current image tag for potential rollback
3. **Image Pull**: Authenticate with GHCR and pull the new image version
4. **Container Restart**: Update docker-compose configuration and restart the `next-ppdb` container
5. **Health Verification**: Wait for health check to pass (5-minute timeout)
6. **On Success**: Mark as EXECUTED, update version tracking, send success email
7. **On Failure**: Execute automatic rollback (see Rollback Strategy below)
8. **Automatic Re-check**: Next version check will detect the next sequential version

### Rollback Strategy (AUTOMATIC)

If update execution fails at any step after image pull:

1. **Stop Failed Container**: Stop the unhealthy/failed new container
2. **Restore Previous Image**: Re-tag and restart with the previous image version
3. **Verify Rollback Health**: Confirm the rolled-back container is healthy
4. **Database Restore** (if needed): If failure occurred after container started, restore pre-update backup
5. **Notification**: Send failure email with rollback details
6. **Status Update**: Mark update as FAILED with rollback notes in Valkey

**Rollback Data Preserved:**

- Pre-update database backup (created in step 1)
- Previous container image tag (recorded in step 2)
- Execution logs for debugging

## Architecture

```
+------------------+     HTTP calls      +------------------+
|   Scheduler      | -----------------> |   Next.js App    |
|   (Alpine+Cron)  |                     |   (next-ppdb)    |
+------------------+                     +------------------+
        |                                         |
        | Docker Socket                           | MySQL (read/write)
        | (pull, restart,                         |
        |  rollback)                              | Valkey (state mgmt)
        |                                         |
        v                                         v
+------------------+                     +------------------+
|   Docker Engine  |                     |   Data Layer     |
|   (host)         |                     | MySQL + Valkey   |
+------------------+                     +------------------+
        |
        | SMTP (via scheduler)
        v
+------------------+
|   Email Server   |
+------------------+
```

**Key Architecture Changes from Original:**

1. **Scheduler has Docker access**: Can execute `docker pull`, `docker compose up`, rollback operations
2. **No Next.js Docker access**: App container does NOT mount Docker socket (security improvement)
3. **Valkey for state**: Update queue, status, and history stored in Valkey (not MySQL)
4. **Scheduler sends emails**: Email operations moved to scheduler for reliability during app restarts

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

### 2.3 Valkey-Based State Storage (NO DATABASE CHANGES)

> **CRITICAL**: No Prisma schema changes. All update state is stored in Valkey (Redis).

**File:** `src/lib/update-store.ts`

**Valkey Key Structure:**

```typescript
// Key patterns
const KEYS = {
  // Current pending/approved update (only one at a time)
  CURRENT_UPDATE: 'ppdb:update:current',

  // Update history (last 50 updates)
  UPDATE_HISTORY: 'ppdb:update:history',

  // Pre-update backup reference (for rollback)
  ROLLBACK_BACKUP: 'ppdb:update:rollback:backup',

  // Previous image tag (for rollback)
  ROLLBACK_IMAGE: 'ppdb:update:rollback:image',

  // Email retry queue
  EMAIL_QUEUE: 'ppdb:email:queue',

  // Last version check timestamp
  LAST_CHECK: 'ppdb:update:last_check',
}
```

**Update Record Structure (JSON in Valkey):**

```typescript
interface PendingUpdate {
  id: string // UUID
  currentVersion: string // e.g., "0.1.2"
  newVersion: string // e.g., "0.1.3"
  releaseNotes?: string
  detectedAt: string // ISO timestamp
  status: 'PENDING' | 'APPROVED' | 'EXECUTED' | 'FAILED'
  approvedBy?: string
  approvedAt?: string // ISO timestamp
  executedAt?: string // ISO timestamp
  errorMessage?: string
  rollbackPerformed?: boolean
  rollbackDetails?: string
}
```

**TTL Strategy:**

| Key               | TTL               | Rationale                           |
| ----------------- | ----------------- | ----------------------------------- |
| `CURRENT_UPDATE`  | None (persistent) | Active update must survive restarts |
| `UPDATE_HISTORY`  | 90 days           | Keep audit trail                    |
| `ROLLBACK_BACKUP` | 7 days            | Only needed for recent rollbacks    |
| `ROLLBACK_IMAGE`  | 7 days            | Only needed for recent rollbacks    |
| `EMAIL_QUEUE`     | 24 hours          | Retry window                        |
| `LAST_CHECK`      | None              | Track last check time               |

**Key Operations:**

```typescript
// src/lib/update-store.ts

import Redis from 'ioredis'
import { v4 as uuidv4 } from 'uuid'

export class UpdateStore {
  constructor(private redis: Redis) {}

  // Get current pending/approved update
  async getCurrentUpdate(): Promise<PendingUpdate | null>

  // Create new pending update (fails if one exists)
  async createPendingUpdate(
    data: Omit<PendingUpdate, 'id' | 'status' | 'detectedAt'>
  ): Promise<PendingUpdate>

  // Approve current update
  async approveUpdate(approvedBy: string): Promise<PendingUpdate>

  // Cancel (delete) current update
  async cancelUpdate(): Promise<void>

  // Mark as executed (moves to history)
  async markExecuted(): Promise<void>

  // Mark as failed with rollback info (moves to history)
  async markFailed(
    error: string,
    rollbackPerformed: boolean,
    rollbackDetails?: string
  ): Promise<void>

  // Get update history
  async getHistory(limit?: number): Promise<PendingUpdate[]>

  // Store rollback data before update
  async storeRollbackData(
    backupPath: string,
    previousImage: string
  ): Promise<void>

  // Get rollback data
  async getRollbackData(): Promise<{
    backupPath: string
    previousImage: string
  } | null>

  // Clear rollback data after successful update
  async clearRollbackData(): Promise<void>
}
```

**Advantages over Database Storage:**

1. **No migration required** - Works immediately with existing setup
2. **Already configured** - Valkey is already in docker-compose
3. **Fast operations** - In-memory with persistence
4. **Atomic operations** - Redis transactions for consistency
5. **Built-in TTL** - Automatic cleanup of old data

### 2.3.1 File-Based Fallback (Valkey Redundancy)

**File:** `src/lib/update-store-fallback.ts`

If Valkey is unavailable, critical state falls back to file-based storage:

```typescript
// Fallback file location
const FALLBACK_DIR = path.join(process.cwd(), 'data', 'update-state')
const FALLBACK_FILES = {
  currentUpdate: 'current-update.json',
  rollbackData: 'rollback-data.json',
}
```

**Fallback Strategy:**

```typescript
export class UpdateStoreWithFallback {
  private redis: Redis | null
  private fallbackEnabled: boolean = false

  async initialize(): Promise<void> {
    try {
      await this.redis?.ping()
      this.fallbackEnabled = false
      log.info('UpdateStore: Using Valkey')
    } catch {
      this.fallbackEnabled = true
      log.warn('UpdateStore: Valkey unavailable, using file fallback')
      await this.ensureFallbackDir()
    }
  }

  async getCurrentUpdate(): Promise<PendingUpdate | null> {
    if (this.fallbackEnabled) {
      return this.readFallbackFile(FALLBACK_FILES.currentUpdate)
    }
    return this.getFromValkey()
  }

  // On Valkey recovery, sync file state back to Valkey
  async syncFromFallback(): Promise<void>
}
```

**Critical State Preserved in Fallback:**

| Data                               | Fallback File         | Priority               |
| ---------------------------------- | --------------------- | ---------------------- |
| Current pending/approved update    | `current-update.json` | ✅ Critical            |
| Rollback data (backup path, image) | `rollback-data.json`  | ✅ Critical            |
| Email queue                        | Not preserved         | ⚠️ Retry on next check |
| Update history                     | Not preserved         | ℹ️ Audit only          |

**File Location:** `data/update-state/` (git-ignored, Docker volume mounted)

**Recovery Behavior:**

- On Valkey recovery, file state is synced back to Valkey
- File state always takes precedence if newer (based on timestamp)
- Prevents split-brain scenarios during failover

### 2.4 Admin UI Components

#### 2.4.1 Updates Management Page

**File:** `src/app/admin/updates/page.tsx`

> **Note:** The current codebase uses flat routes (`src/app/admin/...`) without route groups. This follows the existing pattern of `src/app/admin/backup/page.tsx`.

- Display pending updates in a card/table format
- Show: current version, new version, detected time, status, error message (if failed)
- **Show release notes** with markdown rendering
- **Action buttons: Approve | Cancel** (only two actions available)
- **Sequential version warning**: Display alert if skipped versions exist (informational only)
- **Approval restriction**: Disable "Approve" if another update is already APPROVED
- **Update execution status**: Show execution progress and results
- **Follow existing patterns**: Use `useSidebarState` hook, `Header`, and `Sidebar` components as in `src/app/admin/backup/page.tsx`

#### 2.4.2 Sidebar Update Notification

**File:** `src/components/Sidebar.tsx` (modification)

**Placement:** Above the sidebar footer section (which displays version number)

```tsx
{
  /* Update Available Notification - Above Footer */
}
{
  pendingUpdate && (
    <div className="mx-4 mb-2">
      <button
        onClick={() => setShowUpdateModal(true)}
        className="w-full rounded-lg border-2 border-amber-400 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 transition-all hover:border-amber-500 hover:bg-amber-100"
      >
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>Update Available</span>
        </div>
        <div className="mt-1 text-xs text-amber-600">
          v{pendingUpdate.currentVersion} → v{pendingUpdate.newVersion}
        </div>
      </button>
    </div>
  )
}

{
  /* Existing Sidebar Footer */
}
;<div className="border-t border-gray-200 bg-gray-50 p-4">...</div>
```

**State Management:**

```tsx
// In Sidebar.tsx
const [pendingUpdate, setPendingUpdate] = useState<PendingUpdate | null>(null)
const [showUpdateModal, setShowUpdateModal] = useState(false)

// Fetch pending updates periodically
useEffect(() => {
  const checkForUpdates = async () => {
    try {
      const res = await fetch('/api/admin/updates/pending')
      if (res.ok) {
        const data = await res.json()
        setPendingUpdate(data.pending || null)
      }
    } catch {
      // Silently fail - non-critical
    }
  }

  checkForUpdates()
  const interval = setInterval(checkForUpdates, 5 * 60 * 1000) // Every 5 minutes
  return () => clearInterval(interval)
}, [])
```

#### 2.4.3 Update Approval Modal

**File:** `src/components/UpdateApprovalModal.tsx` (new)

A warning-colored modal that appears when clicking "Update Available":

```tsx
interface UpdateApprovalModalProps {
  update: PendingUpdate
  onClose: () => void
  onApprove: () => void
  onCancel: () => void
}

export default function UpdateApprovalModal({
  update,
  onClose,
  onApprove,
  onCancel,
}: UpdateApprovalModalProps) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 mx-4 max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-xl border-2 border-amber-400 bg-white shadow-2xl">
        {/* Header - Warning colored */}
        <div className="border-b border-amber-200 bg-amber-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <svg
                className="h-6 w-6 text-amber-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-amber-900">
                Update Available
              </h2>
              <p className="text-sm text-amber-700">
                v{update.currentVersion} → v{update.newVersion}
              </p>
            </div>
          </div>
        </div>

        {/* Release Notes - Scrollable */}
        <div className="max-h-[40vh] overflow-y-auto px-6 py-4">
          <h3 className="mb-2 font-semibold text-gray-900">
            {update.releaseTitle || `Release v${update.newVersion}`}
          </h3>

          {/* Render markdown release notes */}
          <div className="prose prose-sm max-w-none text-gray-700">
            <ReactMarkdown>
              {update.releaseNotes || 'No release notes available.'}
            </ReactMarkdown>
          </div>

          {update.releaseUrl && (
            <a
              href={update.releaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center text-sm text-blue-600 hover:underline"
            >
              View on GitHub →
            </a>
          )}
        </div>

        {/* Footer with Actions */}
        <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancel Update
          </button>
          <button
            onClick={onApprove}
            className="rounded-lg bg-amber-500 px-4 py-2 font-medium text-white transition-colors hover:bg-amber-600"
          >
            Approve for 8:00 PM
          </button>
        </div>

        {/* Execution time notice */}
        <div className="px-6 pb-4 text-center text-xs text-gray-500">
          Approved updates execute at 8:00 PM (Australia/Adelaide)
        </div>
      </div>
    </div>
  )
}
```

**Modal Features:**

- Warning-colored header (amber/yellow)
- Version transition clearly displayed
- Scrollable release notes section with markdown rendering
- Link to GitHub release page
- Clear Approve/Cancel actions
- Execution time reminder

### 2.5 Notifications System

#### 2.5.1 Notification Storage (Valkey)

**File:** `src/lib/notification-store.ts`

```typescript
type NotificationType = 'success' | 'warning' | 'error' | 'info'
type NotificationStatus = 'unread' | 'read' | 'archived'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  source: 'backup' | 'version_check' | 'update_execution' | 'system'
  status: NotificationStatus
  createdAt: string
  readAt?: string
  archivedAt?: string
  metadata?: Record<string, unknown>
}
```

**Valkey Keys:**

- `ppdb:notifications:current` - List of current (unread/read) notifications
- `ppdb:notifications:archived` - List of archived notifications
- `ppdb:notifications:unread_count` - Counter for badge

**TTL:** Archived notifications expire after 90 days.

#### 2.5.2 Header Bell Icon

**File:** `src/components/Header.tsx` (modification)

**Placement:** Top navigation bar, right side

**Visual States:**

| State          | Color            | Icon Style              |
| -------------- | ---------------- | ----------------------- |
| No unread      | `text-gray-400`  | Muted/monotone          |
| Info unread    | `text-blue-500`  | Filled, subtle pulse    |
| Success unread | `text-green-500` | Filled                  |
| Warning unread | `text-amber-500` | Filled, pulse animation |
| Error unread   | `text-red-500`   | Filled, stronger pulse  |

**Badge:** Shows unread count (max "9+")

```tsx
// Color determined by highest priority unread notification
const priorityOrder = ['error', 'warning', 'success', 'info']
const bellColor = getHighestPriorityColor(unreadNotifications)
```

#### 2.5.3 Notifications Page

**File:** `src/app/admin/notifications/page.tsx`

**Layout:** Two collapsible sections

1. **Current Notifications** (expanded by default)
   - Shows unread and read notifications
   - Actions: Mark as Read, Archive
   - Sorted by date (newest first)

2. **Archived Notifications** (collapsed by default)
   - Shows archived notifications
   - Action: Delete permanently
   - Sorted by archived date

**API Endpoints:**

- `GET /api/admin/notifications` - List notifications
- `PATCH /api/admin/notifications/[id]` - Update status (read/archive)
- `DELETE /api/admin/notifications/[id]` - Delete archived

---

## 3. Email Service

### 3.1 Nodemailer Setup

**File:** `src/lib/email.ts`

- Configure SMTP from environment variables
- Provide `sendEmail()` function
- Support attachments (for backup files)
- HTML and plain text templates
- **Email retry queue integration** (see 3.4)

### 3.4 Email Retry Queue (Valkey-Based)

**File:** `src/lib/email-queue.ts`

Emails that fail to send are queued in Valkey for automatic retry:

```typescript
interface QueuedEmail {
  id: string
  template: string
  to: string
  subject: string
  data: Record<string, unknown>
  attachments?: Array<{ filename: string; path: string }>
  attempts: number
  maxAttempts: number
  lastAttempt?: string
  error?: string
  createdAt: string
}

export class EmailQueue {
  // Add email to retry queue
  async enqueue(
    email: Omit<QueuedEmail, 'id' | 'attempts' | 'createdAt'>
  ): Promise<void>

  // Process queued emails (called by scheduler)
  async processQueue(): Promise<{ sent: number; failed: number }>

  // Get queue status
  async getQueueStatus(): Promise<{ pending: number; failed: number }>
}
```

**Retry Strategy:**

- Max 3 retry attempts per email
- Exponential backoff: 5 min, 30 min, 2 hours
- Failed emails after 3 attempts are logged and removed
- Queue processed every 15 minutes by scheduler

**Valkey Key:** `ppdb:email:queue` (Redis List)
**TTL:** 24 hours (automatic cleanup)

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

### 4.2 GitHub Release Notes Fetching

**File:** `src/lib/github-releases.ts`

Fetches release notes from GitHub Releases API for staff review before approving updates:

```typescript
interface GitHubRelease {
  tag_name: string // e.g., "v0.1.3"
  name: string // Release title
  body: string // Markdown release notes
  published_at: string // ISO timestamp
  html_url: string // Link to release page
  prerelease: boolean
  draft: boolean
}

export async function getReleaseNotes(
  version: string
): Promise<GitHubRelease | null> {
  // GitHub API: GET /repos/{owner}/{repo}/releases/tags/{tag}
  const response = await fetch(
    `https://api.github.com/repos/robin-collins/next-ppdb/releases/tags/v${version}`,
    {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, // Optional for public repos
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  )

  if (!response.ok) {
    if (response.status === 404) return null // No release notes for this version
    throw new Error(`GitHub API error: ${response.status}`)
  }

  return response.json()
}
```

**Integration with Version Check:**

When a new version is detected, release notes are fetched and stored with the pending update:

```typescript
// In version-check endpoint
const releaseInfo = await getReleaseNotes(nextVersion)
await updateStore.createPendingUpdate({
  currentVersion,
  newVersion: nextVersion,
  releaseNotes: releaseInfo?.body || 'No release notes available',
  releaseUrl: releaseInfo?.html_url,
  releaseTitle: releaseInfo?.name,
})
```

**Note:** GitHub API rate limit is 60 requests/hour for unauthenticated requests (sufficient for twice-daily checks). Add `GITHUB_TOKEN` for higher limits if needed.

### 4.3 Environment Variables

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
    # SMTP config for direct email sending
    - SMTP_HOST=${SMTP_HOST}
    - SMTP_PORT=${SMTP_PORT:-587}
    - SMTP_USER=${SMTP_USER}
    - SMTP_PASSWORD=${SMTP_PASSWORD}
    - SMTP_FROM=${SMTP_FROM}
    - BACKUP_EMAIL_TO=${BACKUP_EMAIL_TO}
    - UPDATE_NOTIFICATION_EMAIL=${UPDATE_NOTIFICATION_EMAIL}
    # GHCR credentials for image pull
    - GHCR_PAT=${GHCR_PAT}
    - GHCR_IMAGE=${GHCR_IMAGE:-ghcr.io/robin-collins/next-ppdb}
  volumes:
    - scheduler_logs:/var/log/scheduler
    # Docker socket for container management (pull, restart, rollback)
    - /var/run/docker.sock:/var/run/docker.sock
    # Shared backup directory for rollback
    - ./backups:/backups:ro
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

> **Security Note:** The scheduler container has Docker socket access for executing updates. This is preferred over giving the app container Docker access because:
>
> 1. Scheduler runs on a fixed schedule (not exposed to user requests)
> 2. Scheduler is a simple Alpine container with minimal attack surface
> 3. App container remains unprivileged (better security posture)

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

> **Note:** SMTP, GHCR, and SCHEDULER_API_KEY are needed by both containers. The Next.js app validates and stores state; the scheduler executes Docker operations and sends emails directly.

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

### Create (27 files)

| File                                              | Purpose                                                   |
| ------------------------------------------------- | --------------------------------------------------------- |
| `src/app/api/admin/scheduled-backup/route.ts`     | Scheduled backup endpoint                                 |
| `src/app/api/admin/version-check/route.ts`        | Version check endpoint                                    |
| `src/app/api/admin/updates/pending/route.ts`      | List pending updates                                      |
| `src/app/api/admin/updates/[id]/route.ts`         | Get/Cancel single update                                  |
| `src/app/api/admin/updates/[id]/approve/route.ts` | Approve update                                            |
| `src/app/api/admin/updates/execute/route.ts`      | Trigger update execution (called by scheduler)            |
| `src/app/admin/updates/page.tsx`                  | Admin UI for update history/management                    |
| `src/components/UpdateApprovalModal.tsx`          | Warning-colored modal with release notes & approve/cancel |
| `src/lib/email.ts`                                | Nodemailer service                                        |
| `src/lib/email-templates.ts`                      | Email templates                                           |
| `src/lib/email-queue.ts`                          | Valkey-based email retry queue                            |
| `src/lib/ghcr.ts`                                 | GHCR registry client with sequential version logic        |
| `src/lib/github-releases.ts`                      | GitHub Releases API client for fetching release notes     |
| `src/lib/scheduler-auth.ts`                       | API key authentication helper                             |
| `src/lib/update-store.ts`                         | Valkey-based update state management                      |
| `src/lib/update-store-fallback.ts`                | File-based fallback when Valkey unavailable               |
| `docker/scheduler/Dockerfile`                     | Scheduler image with Docker CLI                           |
| `docker/scheduler/crontab`                        | Cron config                                               |
| `docker/scheduler/healthcheck.sh`                 | Health check script                                       |
| `docker/scheduler/logrotate.conf`                 | Log rotation config                                       |
| `docker/scheduler/scripts/backup.sh`              | Backup trigger script                                     |
| `docker/scheduler/scripts/version-check.sh`       | Version check trigger script                              |
| `docker/scheduler/scripts/execute-updates.sh`     | Update execution script (Docker pull, restart, rollback)  |
| `docker/scheduler/scripts/process-email-queue.sh` | Email queue processor script                              |
| `e2e/scheduler.spec.ts`                           | Playwright E2E tests for scheduler workflow               |
| `src/lib/notification-store.ts`                   | Valkey-based notification storage                         |
| `src/app/admin/notifications/page.tsx`            | Notifications management page                             |
| `src/app/api/admin/notifications/route.ts`        | List notifications endpoint                               |
| `src/app/api/admin/notifications/[id]/route.ts`   | Update/delete notification endpoint                       |

### Modify (6 files)

| File                          | Changes                                               |
| ----------------------------- | ----------------------------------------------------- |
| `docker-compose.yml`          | Add scheduler service, env vars, shared backup volume |
| `.env.example`                | Add SMTP, GHCR, SCHEDULER_API_KEY env var templates   |
| `src/components/Sidebar.tsx`  | Add pending update notification above footer          |
| `src/components/Header.tsx`   | Add bell icon with dynamic colors for notifications   |
| `src/app/api/health/route.ts` | Add scheduler connectivity and update status          |

> **Note:** NO changes to `prisma/schema.prisma` - all state stored in Valkey.

### Dependencies

```bash
pnpm add nodemailer semver
pnpm add -D @types/nodemailer @types/semver
```

> **Note:**
>
> - `dockerode` is NOT needed - scheduler container uses Docker CLI directly
> - The codebase already includes `ioredis` for Valkey, `pino` for logging, `uuid` for ID generation, and `zod` for validation

---

## 11. Implementation Order

1. **Valkey State Store** - Create `update-store.ts` for Valkey-based state management (no DB migration needed)
2. **Email Service** - Add nodemailer, create templates, email queue with retry logic
3. **GHCR Client** - Registry API, sequential version detection logic
4. **Scheduler Auth** - API key validation helper for scheduler endpoints
5. **API Endpoints** - All endpoints with sequential validation + Valkey integration + tests
6. **Admin UI** - Updates management page with approve/cancel (only two actions)
7. **Scheduler Container** - Dockerfile with Docker CLI, scripts, crontab, health check, rollback logic
8. **Integration** - Docker-compose updates, env vars, shared volumes
9. **Documentation** - CHANGELOG, FILETREE updates

> **Key Change from Original:** No database migration step. Valkey is already running and configured.

---

## 12. Schedule Summary

| Task            | Time (Australia/Adelaide) | Frequency |
| --------------- | ------------------------- | --------- |
| Database Backup | 2:00 AM                   | Daily     |
| Version Check   | 6:00 AM                   | Daily     |
| Version Check   | 12:00 PM                  | Daily     |
| Execute Updates | 8:00 PM                   | Daily     |
| Log Rotation    | 12:00 AM                  | Daily     |

---

## 13. Implementation Notes & Codebase Alignment

> These notes document alignment with the existing codebase patterns discovered during analysis.

### 13.1 Existing Patterns to Follow

**Logger Usage**: Use existing `@/lib/logger` with `log.info()`, `log.error()`, `logError()`:

```typescript
import { log, logError } from '@/lib/logger'
```

**Prisma Client Import**: Always use generated client path:

```typescript
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@/generated/prisma'
```

**Config Pattern**: Follow `@/lib/config.ts` pattern for new configuration:

```typescript
export const scheduler = {
  get apiKey(): string | undefined {
    return process.env.SCHEDULER_API_KEY
  },
}
```

**Environment Validation**: Extend `@/lib/env.ts` schema for new env vars.

**Rate Limiting**: Consider using existing `@/lib/ratelimit.ts` for scheduler endpoints.

### 13.2 Security Considerations

**Docker Socket Access** (RESOLVED):

- The `next-ppdb` container does NOT have Docker socket access (runs as non-root UID 1001)
- The `scheduler` container has Docker socket access for updates and rollback
- This is safer because scheduler is a minimal Alpine container with cron, not exposed to user requests
- Scheduler container can run privileged operations without affecting app security

**API Key Authentication**:

- The `SCHEDULER_API_KEY` should be cryptographically random (min 32 characters)
- Generate with: `openssl rand -hex 32`
- Consider also checking `x-forwarded-for` header to restrict to internal network

### 13.3 Existing Backup Integration

The codebase already has a backup implementation at `src/app/api/admin/backup/route.ts` that:

- Uses `mysqldump` with `--single-transaction`
- Creates ZIP archives
- Maintains MAX_BACKUPS (5) limit
- Has download functionality

The scheduled backup endpoint can reuse this logic or call it internally.

### 13.4 Sidebar Badge Implementation

Current `Sidebar.tsx` has `navItems` array. To add badge:

1. Add state to track pending update count
2. Fetch from `/api/admin/updates/pending` periodically
3. Display badge next to "System Updates" nav item

### 13.5 Health Endpoint Extension

Current health endpoint uses `@/lib/diagnostics` (via import). Extend diagnostics to include:

- Scheduler connectivity status
- Last version check timestamp
- Pending update count

### 13.6 Deployment Steps

**No database migration required.** Simply deploy the updated code:

```bash
# 1. Install new dependencies
pnpm add nodemailer semver
pnpm add -D @types/nodemailer @types/semver

# 2. Build the application
pnpm build

# 3. Build the scheduler container
docker build -t ppdb-scheduler ./docker/scheduler

# 4. Update docker-compose.yml with scheduler service

# 5. Deploy
docker compose up -d
```

### 13.7 Known Limitations (RESOLVED)

1. **Email Queue**: ✅ RESOLVED - Valkey-based email queue with retry logic implemented (see Section 3.4)

2. **NEXT_PUBLIC_APP_VERSION**: ✅ RESOLVED - Runtime version stored in Valkey (`ppdb:app:version`) and updated by scheduler after successful deployment. Build-time variable used as initial value only.

3. **Rollback Strategy**: ✅ RESOLVED - Automatic rollback implemented:
   - Pre-update database backup created
   - Previous image tag recorded
   - On failure: container reverted, database restored if needed
   - See "Rollback Strategy (AUTOMATIC)" section above

### 13.8 Rollback Capabilities

The system supports full rollback including:

**Container Rollback:**

- Previous image tag stored in Valkey before update
- On failure, scheduler pulls and restarts with previous image
- Health check verified before marking rollback complete

**Database Rollback:**

- Pre-update mysqldump backup created before image pull
- If failure occurs after new container started (potential DB changes), backup is restored
- Backup stored for 7 days (configurable)

**When Rollback Occurs:**

- Health check fails after 5 minutes
- Container fails to start
- Any error during update execution

**What Gets Restored:**

- Container image → Previous version
- Database → Pre-update backup (only if container had started)
- Valkey state → Update marked as FAILED with rollback notes

---

## 14. Testing Methodology

> **Goal:** Test the complete update workflow without creating multiple GitHub releases.

### 14.1 Mock Registry for Local Testing

**File:** `docker/scheduler/scripts/mock-registry.sh` (development only)

Create a mock GHCR response that simulates available versions:

```bash
# Start mock registry server on localhost:5050
# Returns configurable version tags

# Mock API endpoint: GET /v2/robin-collins/next-ppdb/tags/list
# Returns: { "tags": ["0.1.0", "0.1.1", "0.1.2", "0.1.3", "0.1.4"] }
```

**Environment Variable Override:**

```env
# In .env.development
GHCR_API_URL=http://localhost:5050  # Override for testing (default: https://ghcr.io)
MOCK_VERSIONS=0.1.0,0.1.1,0.1.2,0.1.3,0.1.4
```

### 14.2 Test Scenarios Without Real Releases

| Scenario                   | How to Test                                                          |
| -------------------------- | -------------------------------------------------------------------- |
| **Version detection**      | Set `MOCK_VERSIONS` with next version, trigger version check         |
| **Sequential enforcement** | Set current to 0.1.2, mock has 0.1.5 only → should NOT detect update |
| **Release notes**          | Mock GitHub API response with test release notes                     |
| **Approval workflow**      | Use real UI with mock pending update in Valkey                       |
| **Update execution**       | Use local Docker images tagged as version numbers                    |
| **Rollback**               | Intentionally fail health check to trigger rollback                  |

### 14.3 Local Docker Image Testing

Instead of pulling from GHCR, test with locally tagged images:

```bash
# Build current version
docker build -t ghcr.io/robin-collins/next-ppdb:0.1.2 .

# Create "new version" with a small change (e.g., add test file)
echo "test" > /tmp/version-marker.txt
docker build -t ghcr.io/robin-collins/next-ppdb:0.1.3 .

# Test update from 0.1.2 → 0.1.3 using local images
# Scheduler will "pull" but image already exists locally
```

**Test Mode Flag:**

```env
# In .env.development
SCHEDULER_TEST_MODE=true
SCHEDULER_SKIP_PULL=true  # Use local images only
```

### 14.4 Integration Test Suite

**File:** `e2e/scheduler.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Scheduler Update Workflow', () => {
  test.beforeAll(async () => {
    // Seed Valkey with mock pending update
    await seedMockPendingUpdate({
      currentVersion: '0.1.2',
      newVersion: '0.1.3',
      releaseNotes: '## Test Release\n- Feature 1\n- Bug fix 2',
      status: 'PENDING',
    })
  })

  test('shows update available in sidebar', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-testid="update-available"]')).toBeVisible()
    await expect(
      page.locator('[data-testid="update-available"]')
    ).toContainText('v0.1.2 → v0.1.3')
  })

  test('opens approval modal with release notes', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-testid="update-available"]')

    const modal = page.locator('[data-testid="update-modal"]')
    await expect(modal).toBeVisible()
    await expect(modal).toContainText('Test Release')
    await expect(modal).toContainText('Feature 1')
  })

  test('approves update', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-testid="update-available"]')
    await page.click('[data-testid="approve-update"]')

    // Check status changed to APPROVED
    const response = await page.request.get('/api/admin/updates/pending')
    const data = await response.json()
    expect(data.pending.status).toBe('APPROVED')
  })

  test('cancels update', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-testid="update-available"]')
    await page.click('[data-testid="cancel-update"]')

    // Check update removed
    const response = await page.request.get('/api/admin/updates/pending')
    const data = await response.json()
    expect(data.pending).toBeNull()
  })
})
```

### 14.5 Manual Test Checklist

```markdown
## Pre-Deployment Testing Checklist

### Version Detection

- [ ] Mock version check detects next sequential version
- [ ] Mock version check ignores non-sequential versions
- [ ] Release notes fetched and stored correctly
- [ ] Email notification sent on new version detection

### UI Components

- [ ] "Update Available" appears in sidebar above footer
- [ ] Clicking opens approval modal
- [ ] Release notes render correctly (markdown)
- [ ] Approve button schedules update
- [ ] Cancel button removes pending update
- [ ] Admin page shows update history

### Update Execution (with local images)

- [ ] Pre-update backup created
- [ ] Previous image tag recorded
- [ ] Container restarted with new image
- [ ] Health check passes → marked EXECUTED
- [ ] Success email sent

### Rollback Testing

- [ ] Create image that fails health check
- [ ] Trigger update with failing image
- [ ] Verify container rolled back to previous
- [ ] Verify database restored (if applicable)
- [ ] Failure email sent with rollback details

### Valkey Fallback

- [ ] Stop Valkey, verify file fallback activates
- [ ] Create pending update while in fallback mode
- [ ] Restart Valkey, verify state synced back
```

### 14.6 CI/CD Test Integration

Add to GitHub Actions workflow:

```yaml
# .github/workflows/test-scheduler.yml
name: Test Scheduler

on:
  push:
    paths:
      - 'src/lib/update-store*.ts'
      - 'src/lib/ghcr.ts'
      - 'src/lib/github-releases.ts'
      - 'src/app/api/admin/updates/**'
      - 'docker/scheduler/**'

jobs:
  test-scheduler:
    runs-on: ubuntu-latest
    services:
      valkey:
        image: valkey/valkey-bundle:9.0-trixie
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: pnpm install

      - name: Run scheduler unit tests
        run: pnpm test -- --grep "scheduler|update-store|ghcr"
        env:
          VALKEY_HOST: localhost
          SCHEDULER_TEST_MODE: true

      - name: Run E2E scheduler tests
        run: pnpm test:e2e -- scheduler.spec.ts
        env:
          VALKEY_HOST: localhost
          SCHEDULER_TEST_MODE: true
```

### 14.7 Production Smoke Test

After deploying to production, verify with one real release:

1. Create GitHub release `v{current+0.0.1}` with test notes
2. Wait for 6:00 AM or 12:00 PM version check (or trigger manually)
3. Verify "Update Available" appears in sidebar
4. Approve the update
5. Verify 8:00 PM execution succeeds
6. Confirm new version running

This single release validates the entire pipeline end-to-end.
