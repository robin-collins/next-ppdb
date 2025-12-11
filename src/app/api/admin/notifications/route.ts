/**
 * Notifications Endpoint
 *
 * List and manage system notifications.
 */

import { NextResponse } from 'next/server'
import { log } from '@/lib/logger'
import { notificationStore } from '@/lib/notification-store'

/**
 * GET - List notifications
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const status = url.searchParams.get('status') // 'current', 'archived', or specific status
    const summary = url.searchParams.get('summary') === 'true'

    if (summary) {
      const summaryData = await notificationStore.getSummary()
      return NextResponse.json(summaryData)
    }

    let notifications

    if (status === 'current') {
      notifications = await notificationStore.getCurrent()
    } else if (status === 'archived') {
      notifications = await notificationStore.getArchived()
    } else if (status === 'unread' || status === 'read') {
      notifications = await notificationStore.getByStatus(status)
    } else {
      notifications = await notificationStore.getAll()
    }

    const unreadCount = await notificationStore.getUnreadCount()

    return NextResponse.json({
      notifications,
      unreadCount,
      total: notifications.length,
    })
  } catch (err) {
    const error =
      err instanceof Error ? err.message : 'Failed to get notifications'
    log.error('Notifications: Failed to get', { error })

    return NextResponse.json({ error }, { status: 500 })
  }
}

/**
 * POST - Mark all as read
 */
export async function POST(request: Request) {
  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')

    if (action === 'markAllRead') {
      const count = await notificationStore.markAllAsRead()
      return NextResponse.json({
        success: true,
        message: `Marked ${count} notifications as read`,
        count,
      })
    }

    if (action === 'clearArchived') {
      const count = await notificationStore.clearArchived()
      return NextResponse.json({
        success: true,
        message: `Cleared ${count} archived notifications`,
        count,
      })
    }

    if (action === 'recalculate') {
      const count = await notificationStore.recalculateUnreadCount()
      return NextResponse.json({
        success: true,
        message: 'Recalculated unread count',
        unreadCount: count,
      })
    }

    return NextResponse.json(
      {
        error:
          'Invalid action. Use: markAllRead, clearArchived, or recalculate',
      },
      { status: 400 }
    )
  } catch (err) {
    const error =
      err instanceof Error ? err.message : 'Failed to perform action'
    log.error('Notifications: Action failed', { error })

    return NextResponse.json({ error }, { status: 500 })
  }
}
