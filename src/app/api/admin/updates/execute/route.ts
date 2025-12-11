/**
 * Execute Update Endpoint
 *
 * Called by scheduler at 8:00 PM daily to execute approved updates.
 * This endpoint signals the scheduler container to perform the actual
 * Docker operations (pull, restart, rollback).
 */

import { NextResponse } from 'next/server'
import { log } from '@/lib/logger'
import { validateSchedulerAuth } from '@/lib/scheduler-auth'
import { updateStore } from '@/lib/update-store'
import { notificationStore } from '@/lib/notification-store'
import { sendEmail } from '@/lib/email'
import {
  updateExecutedSuccessTemplate,
  updateExecutedFailureTemplate,
} from '@/lib/email-templates'
import { emailQueue } from '@/lib/email-queue'
import { verifyVersionExists } from '@/lib/ghcr'

/**
 * Get current app version
 */
async function getCurrentVersion(): Promise<string> {
  const runtimeVersion = await updateStore.getAppVersion()
  if (runtimeVersion) {
    return runtimeVersion
  }
  return process.env.NEXT_PUBLIC_APP_VERSION || '0.0.0'
}

/**
 * POST - Execute approved update
 *
 * This endpoint is called by the scheduler container.
 * It validates the update and returns execution instructions.
 * The actual Docker operations are performed by the scheduler.
 */
export async function POST(request: Request) {
  // Validate scheduler authentication
  if (!validateSchedulerAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const _startTime = Date.now()
  const _emailTo = process.env.UPDATE_NOTIFICATION_EMAIL

  try {
    // Get current approved update
    const update = await updateStore.getCurrentUpdate()

    if (!update) {
      log.info('ExecuteUpdate: No pending update')
      return NextResponse.json({
        executed: false,
        message: 'No pending update',
      })
    }

    if (update.status !== 'APPROVED') {
      log.info('ExecuteUpdate: Update not approved', {
        id: update.id,
        status: update.status,
      })
      return NextResponse.json({
        executed: false,
        message: `Update not in APPROVED status (current: ${update.status})`,
      })
    }

    log.info('ExecuteUpdate: Starting update execution', {
      id: update.id,
      from: update.currentVersion,
      to: update.newVersion,
    })

    // Validate current version hasn't changed
    const currentVersion = await getCurrentVersion()
    if (currentVersion !== update.currentVersion) {
      log.warn('ExecuteUpdate: Version mismatch', {
        expected: update.currentVersion,
        actual: currentVersion,
      })
      return NextResponse.json({
        executed: false,
        error: 'Version mismatch - update may have been superseded',
        expected: update.currentVersion,
        actual: currentVersion,
      })
    }

    // Verify target version still exists in registry
    const versionExists = await verifyVersionExists(update.newVersion)
    if (!versionExists) {
      const error = `Target version ${update.newVersion} no longer exists in registry`
      log.error('ExecuteUpdate: Version not found', {
        version: update.newVersion,
      })

      await updateStore.markFailed(error, false)

      await notificationStore.create({
        type: 'error',
        title: 'Update Failed',
        message: error,
        source: 'update_execution',
      })

      return NextResponse.json({
        executed: false,
        error,
      })
    }

    // Return execution instructions for the scheduler container
    // The scheduler will perform the actual Docker operations and report back
    return NextResponse.json({
      executeUpdate: true,
      update: {
        id: update.id,
        currentVersion: update.currentVersion,
        newVersion: update.newVersion,
      },
      instructions: {
        // Pre-execution: create backup (already done by scheduler before calling this)
        // Step 1: Pull new image
        pullCommand: `docker pull ghcr.io/robin-collins/next-ppdb:${update.newVersion}`,
        // Step 2: Update and restart container
        restartCommand: `docker compose up -d next-ppdb`,
        // Step 3: Health check URL
        healthCheckUrl: '/api/health',
        healthCheckTimeout: 5 * 60 * 1000, // 5 minutes
        // Rollback info
        rollbackImage: `ghcr.io/robin-collins/next-ppdb:${update.currentVersion}`,
      },
      // Callback endpoints for scheduler to report results
      callbacks: {
        success: '/api/admin/updates/execute/complete',
        failure: '/api/admin/updates/execute/failed',
      },
    })
  } catch (err) {
    const error =
      err instanceof Error ? err.message : 'Failed to prepare update execution'
    log.error('ExecuteUpdate: Failed', { error })

    return NextResponse.json({ error }, { status: 500 })
  }
}

/**
 * PUT - Report update completion (success or failure)
 *
 * Called by the scheduler after executing the update.
 */
export async function PUT(request: Request) {
  // Validate scheduler authentication
  if (!validateSchedulerAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      success,
      updateId,
      duration,
      error: errorMessage,
      rollbackPerformed,
      rollbackDetails,
    } = body as {
      success: boolean
      updateId: string
      duration?: number
      error?: string
      rollbackPerformed?: boolean
      rollbackDetails?: string
    }

    const update = await updateStore.getCurrentUpdate()

    if (!update || update.id !== updateId) {
      return NextResponse.json(
        { error: 'Update not found or ID mismatch' },
        { status: 404 }
      )
    }

    const emailTo = process.env.UPDATE_NOTIFICATION_EMAIL

    if (success) {
      // Mark as executed
      await updateStore.markExecuted(duration)

      // Update runtime version in Valkey
      await updateStore.setAppVersion(update.newVersion)

      log.info('ExecuteUpdate: Update completed successfully', {
        id: update.id,
        version: update.newVersion,
        duration,
      })

      // Create success notification
      await notificationStore.create({
        type: 'success',
        title: 'Update Completed',
        message: `Successfully updated to version ${update.newVersion}`,
        source: 'update_execution',
        metadata: {
          updateId: update.id,
          from: update.currentVersion,
          to: update.newVersion,
          duration,
        },
      })

      // Send success email
      if (emailTo) {
        const updatedRecord = {
          ...update,
          status: 'EXECUTED' as const,
          executedAt: new Date().toISOString(),
          executionDuration: duration,
        }
        const template = updateExecutedSuccessTemplate(updatedRecord)

        const emailResult = await sendEmail({
          to: emailTo,
          subject: `[PPDB] Update Completed: v${update.currentVersion} → v${update.newVersion}`,
          html: template.html,
          text: template.text,
        })

        if (!emailResult.success) {
          await emailQueue.enqueue({
            to: emailTo,
            subject: `[PPDB] Update Completed: v${update.currentVersion} → v${update.newVersion}`,
            html: template.html,
            text: template.text,
          })
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Update marked as completed',
      })
    } else {
      // Mark as failed
      await updateStore.markFailed(
        errorMessage || 'Unknown error',
        rollbackPerformed || false,
        rollbackDetails
      )

      log.error('ExecuteUpdate: Update failed', {
        id: update.id,
        version: update.newVersion,
        error: errorMessage,
        rollbackPerformed,
      })

      // Create failure notification
      await notificationStore.create({
        type: 'error',
        title: 'Update Failed',
        message: `Failed to update to version ${update.newVersion}: ${errorMessage}`,
        source: 'update_execution',
        metadata: {
          updateId: update.id,
          error: errorMessage,
          rollbackPerformed,
          rollbackDetails,
        },
      })

      // Send failure email
      if (emailTo) {
        const failedRecord = {
          ...update,
          status: 'FAILED' as const,
          executedAt: new Date().toISOString(),
          errorMessage,
          rollbackPerformed: rollbackPerformed || false,
          rollbackDetails,
        }
        const template = updateExecutedFailureTemplate(failedRecord)

        const emailResult = await sendEmail({
          to: emailTo,
          subject: `[PPDB] Update FAILED: v${update.currentVersion} → v${update.newVersion}`,
          html: template.html,
          text: template.text,
        })

        if (!emailResult.success) {
          await emailQueue.enqueue({
            to: emailTo,
            subject: `[PPDB] Update FAILED: v${update.currentVersion} → v${update.newVersion}`,
            html: template.html,
            text: template.text,
          })
        }
      }

      return NextResponse.json({
        success: false,
        message: 'Update marked as failed',
      })
    }
  } catch (err) {
    const error =
      err instanceof Error ? err.message : 'Failed to report update result'
    log.error('ExecuteUpdate: Failed to process result', { error })

    return NextResponse.json({ error }, { status: 500 })
  }
}
