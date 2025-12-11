/**
 * Version Check Endpoint
 *
 * Triggered by the scheduler to check for new container versions.
 * Enforces sequential updates and creates pending update records.
 */

import { NextResponse } from 'next/server'
import { log } from '@/lib/logger'
import { validateSchedulerAuth } from '@/lib/scheduler-auth'
import { checkForUpdate } from '@/lib/ghcr'
import { getReleaseNotes } from '@/lib/github-releases'
import { updateStore } from '@/lib/update-store'
import { notificationStore } from '@/lib/notification-store'
import { sendEmail } from '@/lib/email'
import { updateAvailableTemplate } from '@/lib/email-templates'
import { emailQueue } from '@/lib/email-queue'

/**
 * Get current app version
 */
async function getCurrentVersion(): Promise<string> {
  // First check Valkey for runtime version (updated after successful deployment)
  const runtimeVersion = await updateStore.getAppVersion()
  if (runtimeVersion) {
    return runtimeVersion
  }

  // Fall back to build-time environment variable
  return process.env.NEXT_PUBLIC_APP_VERSION || '0.0.0'
}

export async function POST(request: Request) {
  // Validate scheduler authentication
  if (!validateSchedulerAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const currentVersion = await getCurrentVersion()

    log.info('VersionCheck: Starting version check', { currentVersion })

    // Update last check timestamp
    await updateStore.setLastCheckTime()

    // Check for existing pending/approved update
    const existingUpdate = await updateStore.getCurrentUpdate()
    if (existingUpdate) {
      if (
        existingUpdate.status === 'PENDING' ||
        existingUpdate.status === 'APPROVED'
      ) {
        log.info('VersionCheck: Update already pending/approved', {
          id: existingUpdate.id,
          status: existingUpdate.status,
          version: existingUpdate.newVersion,
        })
        return NextResponse.json({
          updateAvailable: false,
          message: 'Update already pending approval',
          existingUpdate: {
            id: existingUpdate.id,
            status: existingUpdate.status,
            newVersion: existingUpdate.newVersion,
          },
        })
      }
    }

    // Check GHCR for next sequential version
    const updateCheck = await checkForUpdate(currentVersion)

    if (!updateCheck) {
      return NextResponse.json(
        {
          error: 'Failed to check for updates',
        },
        { status: 500 }
      )
    }

    if (!updateCheck.hasUpdate || !updateCheck.nextVersion) {
      log.info('VersionCheck: No update available', { currentVersion })
      return NextResponse.json({
        updateAvailable: false,
        current: currentVersion,
        message: 'No update available',
      })
    }

    // Fetch release notes from GitHub
    const releaseInfo = await getReleaseNotes(updateCheck.nextVersion)

    // Create pending update record
    const pendingUpdate = await updateStore.createPendingUpdate({
      currentVersion,
      newVersion: updateCheck.nextVersion,
      releaseNotes: releaseInfo?.body,
      releaseTitle: releaseInfo?.title,
      releaseUrl: releaseInfo?.url,
    })

    if (!pendingUpdate) {
      return NextResponse.json(
        {
          error: 'Failed to create pending update record',
        },
        { status: 500 }
      )
    }

    log.info('VersionCheck: New update available', {
      current: currentVersion,
      next: updateCheck.nextVersion,
      pendingId: pendingUpdate.id,
    })

    // Create notification
    await notificationStore.create({
      type: 'warning',
      title: 'Update Available',
      message: `Version ${updateCheck.nextVersion} is available. Please review and approve the update.`,
      source: 'version_check',
      metadata: {
        currentVersion,
        newVersion: updateCheck.nextVersion,
        pendingUpdateId: pendingUpdate.id,
      },
    })

    // Send email notification
    const emailTo = process.env.UPDATE_NOTIFICATION_EMAIL
    if (emailTo) {
      const template = updateAvailableTemplate(pendingUpdate)

      const emailResult = await sendEmail({
        to: emailTo,
        subject: `[PPDB] Update Available: v${pendingUpdate.currentVersion} → v${pendingUpdate.newVersion}`,
        html: template.html,
        text: template.text,
      })

      if (!emailResult.success) {
        await emailQueue.enqueue({
          to: emailTo,
          subject: `[PPDB] Update Available: v${pendingUpdate.currentVersion} → v${pendingUpdate.newVersion}`,
          html: template.html,
          text: template.text,
        })
      }
    }

    return NextResponse.json({
      updateAvailable: true,
      current: currentVersion,
      nextVersion: updateCheck.nextVersion,
      pendingUpdateId: pendingUpdate.id,
      skippedVersions: updateCheck.skippedVersions,
      releaseTitle: releaseInfo?.title,
      releaseUrl: releaseInfo?.url,
    })
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Version check failed'
    log.error('VersionCheck: Failed', { error })

    return NextResponse.json({ error }, { status: 500 })
  }
}

/**
 * GET - Get version check status (for UI polling)
 */
export async function GET() {
  try {
    const currentVersion = await getCurrentVersion()
    const lastCheck = await updateStore.getLastCheckTime()
    const pendingUpdate = await updateStore.getCurrentUpdate()

    return NextResponse.json({
      currentVersion,
      lastCheck,
      pendingUpdate: pendingUpdate
        ? {
            id: pendingUpdate.id,
            status: pendingUpdate.status,
            newVersion: pendingUpdate.newVersion,
            detectedAt: pendingUpdate.detectedAt,
            approvedAt: pendingUpdate.approvedAt,
            approvedBy: pendingUpdate.approvedBy,
          }
        : null,
    })
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Failed to get status'
    return NextResponse.json({ error }, { status: 500 })
  }
}
