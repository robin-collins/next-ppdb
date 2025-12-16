/**
 * Single Notification Endpoint
 *
 * Get, update, or delete a specific notification.
 */

import { NextResponse } from 'next/server'
import { log } from '@/lib/logger'
import { notificationStore } from '@/lib/notification-store'

interface Params {
  params: Promise<{ id: string }>
}

/**
 * GET - Get single notification
 */
export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params
    const notification = await notificationStore.getById(id)

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ notification })
  } catch (err) {
    const error =
      err instanceof Error ? err.message : 'Failed to get notification'
    log.error('NotificationById: Failed to get', { error })

    return NextResponse.json({ error }, { status: 500 })
  }
}

/**
 * PATCH - Update notification status (mark as read or archive)
 */
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params

    let body: { action?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const { action } = body

    if (action === 'read') {
      const notification = await notificationStore.markAsRead(id)
      if (!notification) {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({
        success: true,
        notification,
      })
    }

    if (action === 'archive') {
      const notification = await notificationStore.archive(id)
      if (!notification) {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({
        success: true,
        notification,
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use: read or archive' },
      { status: 400 }
    )
  } catch (err) {
    const error =
      err instanceof Error ? err.message : 'Failed to update notification'
    log.error('NotificationById: Failed to update', { error })

    return NextResponse.json({ error }, { status: 500 })
  }
}

/**
 * DELETE - Delete notification (only archived notifications)
 */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params

    // First check if notification exists and is archived
    const notification = await notificationStore.getById(id)

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    if (notification.status !== 'archived') {
      return NextResponse.json(
        {
          error:
            'Only archived notifications can be deleted. Archive it first.',
        },
        { status: 400 }
      )
    }

    const success = await notificationStore.delete(id)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Notification deleted',
    })
  } catch (err) {
    const error =
      err instanceof Error ? err.message : 'Failed to delete notification'
    log.error('NotificationById: Failed to delete', { error })

    return NextResponse.json({ error }, { status: 500 })
  }
}
