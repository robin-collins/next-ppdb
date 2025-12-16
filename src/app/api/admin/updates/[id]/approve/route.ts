/**
 * Approve Update Endpoint
 *
 * Approves a pending update for execution at the next scheduled window.
 */

import { NextResponse } from 'next/server'
import { log } from '@/lib/logger'
import { updateStore } from '@/lib/update-store'
import { notificationStore } from '@/lib/notification-store'
import { sendEmail } from '@/lib/email'
import { updateApprovedTemplate } from '@/lib/email-templates'
import { emailQueue } from '@/lib/email-queue'

interface Params {
  params: Promise<{ id: string }>
}

interface ApproveRequestBody {
  approvedBy: string
}

/**
 * POST - Approve an update for execution
 */
export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params

    // Parse request body
    let body: ApproveRequestBody
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const { approvedBy } = body

    if (!approvedBy || typeof approvedBy !== 'string') {
      return NextResponse.json(
        { error: 'approvedBy is required' },
        { status: 400 }
      )
    }

    // Get current update
    const current = await updateStore.getCurrentUpdate()

    if (!current) {
      return NextResponse.json(
        { error: 'No pending update to approve' },
        { status: 404 }
      )
    }

    if (current.id !== id) {
      return NextResponse.json(
        { error: 'Update ID does not match current pending update' },
        { status: 400 }
      )
    }

    // Only allow approving PENDING updates
    if (current.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Cannot approve update with status: ${current.status}` },
        { status: 400 }
      )
    }

    // Approve the update
    const approved = await updateStore.approveUpdate(approvedBy)

    if (!approved) {
      return NextResponse.json(
        { error: 'Failed to approve update' },
        { status: 500 }
      )
    }

    log.info('UpdateApprove: Update approved', {
      id,
      version: approved.newVersion,
      approvedBy,
    })

    // Create notification
    await notificationStore.create({
      type: 'info',
      title: 'Update Approved',
      message: `Update to version ${approved.newVersion} has been approved by ${approvedBy}. Scheduled for 8:00 PM execution.`,
      source: 'version_check',
      metadata: {
        updateId: approved.id,
        version: approved.newVersion,
        approvedBy,
      },
    })

    // Send confirmation email
    const emailTo = process.env.UPDATE_NOTIFICATION_EMAIL
    if (emailTo) {
      const template = updateApprovedTemplate(approved)

      const emailResult = await sendEmail({
        to: emailTo,
        subject: `[PPDB] Update Approved: v${approved.currentVersion} → v${approved.newVersion}`,
        html: template.html,
        text: template.text,
      })

      if (!emailResult.success) {
        await emailQueue.enqueue({
          to: emailTo,
          subject: `[PPDB] Update Approved: v${approved.currentVersion} → v${approved.newVersion}`,
          html: template.html,
          text: template.text,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Update approved for execution at 8:00 PM',
      update: approved,
    })
  } catch (err) {
    const error =
      err instanceof Error ? err.message : 'Failed to approve update'
    log.error('UpdateApprove: Failed', { error })

    return NextResponse.json({ error }, { status: 500 })
  }
}
