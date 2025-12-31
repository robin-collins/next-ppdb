/**
 * Email Templates
 *
 * HTML and plain text templates for scheduler notifications.
 */

import type { PendingUpdate } from './update-store'
import { marked } from 'marked'

// Common styles for HTML emails
const styles = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .header { background: linear-gradient(135deg, #6366f1, #06b6d4); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
  .header h1 { margin: 0; font-size: 24px; }
  .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
  .footer { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; font-size: 12px; color: #6b7280; }
  .success { background: #10b981; }
  .warning { background: #f59e0b; }
  .error { background: #ef4444; }
  .info { background: #3b82f6; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
  .badge-success { background: #d1fae5; color: #065f46; }
  .badge-warning { background: #fef3c7; color: #92400e; }
  .badge-error { background: #fee2e2; color: #991b1b; }
  .badge-info { background: #dbeafe; color: #1e40af; }
  .details { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0; }
  .details dt { font-weight: 600; color: #4b5563; margin-top: 10px; }
  .details dt:first-child { margin-top: 0; }
  .details dd { margin: 4px 0 0 0; }
  .button { display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
  .alert { padding: 15px; border-radius: 8px; margin: 15px 0; }
  .alert-warning { background: #fef3c7; border: 1px solid #f59e0b; color: #92400e; }
  .alert-error { background: #fee2e2; border: 1px solid #ef4444; color: #991b1b; }
  .alert-success { background: #d1fae5; border: 1px solid #10b981; color: #065f46; }
  pre { background: #1f2937; color: #f3f4f6; padding: 15px; border-radius: 8px; overflow-x: auto; font-size: 13px; }
`

function formatDate(isoDate?: string): string {
  if (!isoDate) return 'N/A'
  return new Date(isoDate).toLocaleString('en-AU', {
    timeZone: 'Australia/Adelaide',
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function formatDuration(ms?: number): string {
  if (!ms) return 'N/A'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${Math.round(ms / 1000)}s`
  return `${Math.round(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`
}

// ============================================
// Backup Templates
// ============================================

export interface BackupSuccessData {
  filename: string
  timestamp: string
  sqlSize: number
  zipSize: number
  downloadUrl: string
}

export function backupSuccessTemplate(data: BackupSuccessData): {
  html: string
  text: string
} {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><style>${styles}</style></head>
    <body>
      <div class="container">
        <div class="header success">
          <h1>Backup Completed Successfully</h1>
        </div>
        <div class="content">
          <p>The scheduled database backup has been completed successfully.</p>

          <div class="details">
            <dl>
              <dt>Filename</dt>
              <dd>${data.filename}</dd>
              <dt>Timestamp</dt>
              <dd>${formatDate(data.timestamp)}</dd>
              <dt>SQL Size</dt>
              <dd>${(data.sqlSize / 1024 / 1024).toFixed(2)} MB</dd>
              <dt>ZIP Size</dt>
              <dd>${(data.zipSize / 1024 / 1024).toFixed(2)} MB</dd>
            </dl>
          </div>

          <div class="alert alert-success">
            <strong>Backup stored successfully.</strong> The backup file is attached to this email.
          </div>
        </div>
        <div class="footer">
          <p>This is an automated message from PPDB Scheduler.</p>
          <p>Timestamp: ${formatDate(new Date().toISOString())}</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
BACKUP COMPLETED SUCCESSFULLY
=============================

The scheduled database backup has been completed successfully.

Details:
- Filename: ${data.filename}
- Timestamp: ${formatDate(data.timestamp)}
- SQL Size: ${(data.sqlSize / 1024 / 1024).toFixed(2)} MB
- ZIP Size: ${(data.zipSize / 1024 / 1024).toFixed(2)} MB

The backup file is attached to this email.

---
This is an automated message from PPDB Scheduler.
  `.trim()

  return { html, text }
}

export interface BackupFailureData {
  error: string
  timestamp: string
  details?: string
}

export function backupFailureTemplate(data: BackupFailureData): {
  html: string
  text: string
} {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><style>${styles}</style></head>
    <body>
      <div class="container">
        <div class="header error">
          <h1>Backup Failed</h1>
        </div>
        <div class="content">
          <p>The scheduled database backup has failed and requires attention.</p>

          <div class="alert alert-error">
            <strong>Error:</strong> ${data.error}
          </div>

          ${data.details ? `<pre>${data.details}</pre>` : ''}

          <div class="details">
            <dl>
              <dt>Timestamp</dt>
              <dd>${formatDate(data.timestamp)}</dd>
            </dl>
          </div>

          <p>Please check the scheduler logs for more information and resolve the issue manually.</p>
        </div>
        <div class="footer">
          <p>This is an automated message from PPDB Scheduler.</p>
          <p>Timestamp: ${formatDate(new Date().toISOString())}</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
BACKUP FAILED
=============

The scheduled database backup has failed and requires attention.

Error: ${data.error}

${data.details ? `Details:\n${data.details}` : ''}

Timestamp: ${formatDate(data.timestamp)}

Please check the scheduler logs for more information and resolve the issue manually.

---
This is an automated message from PPDB Scheduler.
  `.trim()

  return { html, text }
}

// ============================================
// Update Available Templates
// ============================================

export function updateAvailableTemplate(update: PendingUpdate): {
  html: string
  text: string
} {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><style>${styles}</style></head>
    <body>
      <div class="container">
        <div class="header warning">
          <h1>New Update Available</h1>
        </div>
        <div class="content">
          <p>A new version of PPDB is available and awaiting your approval.</p>

          <div class="alert alert-warning">
            <strong>Version ${update.currentVersion} → ${update.newVersion}</strong>
          </div>

          ${update.releaseTitle ? `<h3>${update.releaseTitle}</h3>` : ''}

          ${
            update.releaseNotes
              ? `<div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0;" class="markdown-body">
                  ${marked.parse(update.releaseNotes)}
                 </div>`
              : '<p><em>No release notes available.</em></p>'
          }

          ${update.releaseUrl ? `<p><a href="${update.releaseUrl}" class="button">View on GitHub</a></p>` : ''}

          <div class="details">
            <dl>
              <dt>Detected At</dt>
              <dd>${formatDate(update.detectedAt)}</dd>
              <dt>Status</dt>
              <dd><span class="badge badge-warning">Pending Approval</span></dd>
            </dl>
          </div>

          <p><strong>Action Required:</strong> Please log in to the admin panel to approve or cancel this update.</p>
          <p>Approved updates will execute at 8:00 PM (Australia/Adelaide).</p>
        </div>
        <div class="footer">
          <p>This is an automated message from PPDB Scheduler.</p>
          <p>Timestamp: ${formatDate(new Date().toISOString())}</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
NEW UPDATE AVAILABLE
====================

A new version of PPDB is available and awaiting your approval.

Version: ${update.currentVersion} → ${update.newVersion}

${update.releaseTitle ? `Title: ${update.releaseTitle}` : ''}

Release Notes:
${update.releaseNotes || 'No release notes available.'}

${update.releaseUrl ? `View on GitHub: ${update.releaseUrl}` : ''}

Details:
- Detected At: ${formatDate(update.detectedAt)}
- Status: Pending Approval

ACTION REQUIRED: Please log in to the admin panel to approve or cancel this update.
Approved updates will execute at 8:00 PM (Australia/Adelaide).

---
This is an automated message from PPDB Scheduler.
  `.trim()

  return { html, text }
}

// ============================================
// Update Approved Template
// ============================================

export function updateApprovedTemplate(update: PendingUpdate): {
  html: string
  text: string
} {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><style>${styles}</style></head>
    <body>
      <div class="container">
        <div class="header info">
          <h1>Update Approved</h1>
        </div>
        <div class="content">
          <p>The update to version ${update.newVersion} has been approved and is scheduled for execution.</p>

          <div class="details">
            <dl>
              <dt>Version</dt>
              <dd>${update.currentVersion} → ${update.newVersion}</dd>
              <dt>Approved By</dt>
              <dd>${update.approvedBy || 'Unknown'}</dd>
              <dt>Approved At</dt>
              <dd>${formatDate(update.approvedAt)}</dd>
              <dt>Scheduled Execution</dt>
              <dd>8:00 PM (Australia/Adelaide)</dd>
            </dl>
          </div>

          <div class="alert alert-warning">
            <strong>Note:</strong> The update will be executed at the next 8:00 PM window.
            You will receive another email when the update completes.
          </div>
        </div>
        <div class="footer">
          <p>This is an automated message from PPDB Scheduler.</p>
          <p>Timestamp: ${formatDate(new Date().toISOString())}</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
UPDATE APPROVED
===============

The update to version ${update.newVersion} has been approved and is scheduled for execution.

Details:
- Version: ${update.currentVersion} → ${update.newVersion}
- Approved By: ${update.approvedBy || 'Unknown'}
- Approved At: ${formatDate(update.approvedAt)}
- Scheduled Execution: 8:00 PM (Australia/Adelaide)

Note: The update will be executed at the next 8:00 PM window.
You will receive another email when the update completes.

---
This is an automated message from PPDB Scheduler.
  `.trim()

  return { html, text }
}

// ============================================
// Update Executed Success Template
// ============================================

export function updateExecutedSuccessTemplate(update: PendingUpdate): {
  html: string
  text: string
} {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><style>${styles}</style></head>
    <body>
      <div class="container">
        <div class="header success">
          <h1>Update Completed Successfully</h1>
        </div>
        <div class="content">
          <p>The update to version ${update.newVersion} has been completed successfully!</p>

          <div class="alert alert-success">
            <strong>PPDB is now running version ${update.newVersion}</strong>
          </div>

          <div class="details">
            <dl>
              <dt>Previous Version</dt>
              <dd>${update.currentVersion}</dd>
              <dt>New Version</dt>
              <dd>${update.newVersion}</dd>
              <dt>Executed At</dt>
              <dd>${formatDate(update.executedAt)}</dd>
              <dt>Duration</dt>
              <dd>${formatDuration(update.executionDuration)}</dd>
              <dt>Health Check</dt>
              <dd><span class="badge badge-success">Passed</span></dd>
            </dl>
          </div>

          <p>The application is now running on the new version. No further action is required.</p>

          <p>The next version check will occur at the scheduled time (6:00 AM or 12:00 PM).</p>
        </div>
        <div class="footer">
          <p>This is an automated message from PPDB Scheduler.</p>
          <p>Timestamp: ${formatDate(new Date().toISOString())}</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
UPDATE COMPLETED SUCCESSFULLY
=============================

The update to version ${update.newVersion} has been completed successfully!

PPDB is now running version ${update.newVersion}

Details:
- Previous Version: ${update.currentVersion}
- New Version: ${update.newVersion}
- Executed At: ${formatDate(update.executedAt)}
- Duration: ${formatDuration(update.executionDuration)}
- Health Check: Passed

The application is now running on the new version. No further action is required.

The next version check will occur at the scheduled time (6:00 AM or 12:00 PM).

---
This is an automated message from PPDB Scheduler.
  `.trim()

  return { html, text }
}

// ============================================
// Update Executed Failure Template
// ============================================

export function updateExecutedFailureTemplate(update: PendingUpdate): {
  html: string
  text: string
} {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><style>${styles}</style></head>
    <body>
      <div class="container">
        <div class="header error">
          <h1>Update Failed</h1>
        </div>
        <div class="content">
          <p>The update to version ${update.newVersion} has <strong>failed</strong> and requires manual intervention.</p>

          <div class="alert alert-error">
            <strong>Error:</strong> ${update.errorMessage || 'Unknown error'}
          </div>

          ${
            update.rollbackPerformed
              ? `
          <div class="alert alert-warning">
            <strong>Automatic Rollback:</strong> The system has automatically rolled back to version ${update.currentVersion}.
            ${update.rollbackDetails ? `<br><br>${update.rollbackDetails}` : ''}
          </div>
          `
              : `
          <div class="alert alert-error">
            <strong>Warning:</strong> Automatic rollback was NOT performed. Manual intervention may be required.
          </div>
          `
          }

          <div class="details">
            <dl>
              <dt>Target Version</dt>
              <dd>${update.newVersion}</dd>
              <dt>Current Version</dt>
              <dd>${update.currentVersion}</dd>
              <dt>Failed At</dt>
              <dd>${formatDate(update.executedAt)}</dd>
              <dt>Rollback Performed</dt>
              <dd>${update.rollbackPerformed ? '<span class="badge badge-success">Yes</span>' : '<span class="badge badge-error">No</span>'}</dd>
            </dl>
          </div>

          <h3>Troubleshooting Steps:</h3>
          <ol>
            <li>Check the scheduler container logs for detailed error information</li>
            <li>Verify Docker daemon is accessible and running</li>
            <li>Check GHCR authentication (PAT token may have expired)</li>
            <li>Verify network connectivity to ghcr.io</li>
            <li>Check disk space for Docker images</li>
            <li>If rollback was not performed, manually restore from the pre-update backup</li>
          </ol>

          <p><strong>Manual Intervention Required:</strong> Please investigate and resolve the issue before the next update attempt.</p>
        </div>
        <div class="footer">
          <p>This is an automated message from PPDB Scheduler.</p>
          <p>Timestamp: ${formatDate(new Date().toISOString())}</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
UPDATE FAILED
=============

The update to version ${update.newVersion} has FAILED and requires manual intervention.

Error: ${update.errorMessage || 'Unknown error'}

${
  update.rollbackPerformed
    ? `
AUTOMATIC ROLLBACK: The system has automatically rolled back to version ${update.currentVersion}.
${update.rollbackDetails ? update.rollbackDetails : ''}
`
    : `
WARNING: Automatic rollback was NOT performed. Manual intervention may be required.
`
}

Details:
- Target Version: ${update.newVersion}
- Current Version: ${update.currentVersion}
- Failed At: ${formatDate(update.executedAt)}
- Rollback Performed: ${update.rollbackPerformed ? 'Yes' : 'No'}

Troubleshooting Steps:
1. Check the scheduler container logs for detailed error information
2. Verify Docker daemon is accessible and running
3. Check GHCR authentication (PAT token may have expired)
4. Verify network connectivity to ghcr.io
5. Check disk space for Docker images
6. If rollback was not performed, manually restore from the pre-update backup

MANUAL INTERVENTION REQUIRED: Please investigate and resolve the issue before the next update attempt.

---
This is an automated message from PPDB Scheduler.
  `.trim()

  return { html, text }
}
