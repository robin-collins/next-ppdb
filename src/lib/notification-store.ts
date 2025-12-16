/**
 * Notification Store
 *
 * Valkey-based storage for system notifications.
 * Supports unread/read/archived states with automatic cleanup.
 */

import Redis from 'ioredis'
import { v4 as uuidv4 } from 'uuid'
import { valkey as valkeyConfig } from '@/lib/config'
import { log } from '@/lib/logger'

const KEYS = {
  NOTIFICATIONS: 'ppdb:notifications:list',
  UNREAD_COUNT: 'ppdb:notifications:unread_count',
}

const TTL = {
  NOTIFICATIONS: 90 * 24 * 60 * 60, // 90 days
}

const MAX_NOTIFICATIONS = 100

export type NotificationType = 'success' | 'warning' | 'error' | 'info'
export type NotificationStatus = 'unread' | 'read' | 'archived'
export type NotificationSource =
  | 'backup'
  | 'version_check'
  | 'update_execution'
  | 'system'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  source: NotificationSource
  status: NotificationStatus
  createdAt: string
  readAt?: string
  archivedAt?: string
  metadata?: Record<string, unknown>
}

// Redis client singleton
let redis: Redis | null = null

function getRedis(): Redis | null {
  if (!valkeyConfig.isConfigured) {
    return null
  }

  if (!redis) {
    try {
      redis = new Redis({
        host: valkeyConfig.host,
        port: valkeyConfig.port,
        enableOfflineQueue: false,
        maxRetriesPerRequest: 3,
      })

      redis.on('connect', () => {
        log.info('NotificationStore: Connected to Valkey')
      })

      redis.on('error', err => {
        log.warn('NotificationStore: Valkey error', { error: err.message })
      })
    } catch (err) {
      log.warn('NotificationStore: Failed to initialize', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      return null
    }
  }

  return redis
}

/**
 * Notification Store class
 */
export class NotificationStore {
  private redis: Redis | null

  constructor() {
    this.redis = getRedis()
  }

  /**
   * Check if store is available
   */
  isAvailable(): boolean {
    return this.redis !== null && this.redis.status === 'ready'
  }

  /**
   * Create a new notification
   */
  async create(data: {
    type: NotificationType
    title: string
    message: string
    source: NotificationSource
    metadata?: Record<string, unknown>
  }): Promise<Notification | null> {
    if (!this.redis) return null

    try {
      const notification: Notification = {
        id: uuidv4(),
        type: data.type,
        title: data.title,
        message: data.message,
        source: data.source,
        status: 'unread',
        createdAt: new Date().toISOString(),
        metadata: data.metadata,
      }

      // Get existing notifications
      const notifications = await this.getAll()

      // Add new notification at the beginning
      notifications.unshift(notification)

      // Trim to max size
      const trimmed = notifications.slice(0, MAX_NOTIFICATIONS)

      // Save back
      await this.redis.set(
        KEYS.NOTIFICATIONS,
        JSON.stringify(trimmed),
        'EX',
        TTL.NOTIFICATIONS
      )

      // Increment unread count
      await this.redis.incr(KEYS.UNREAD_COUNT)

      log.info('NotificationStore: Created notification', {
        id: notification.id,
        type: notification.type,
        title: notification.title,
      })

      return notification
    } catch (err) {
      log.error('NotificationStore: Failed to create notification', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      return null
    }
  }

  /**
   * Get all notifications
   */
  async getAll(): Promise<Notification[]> {
    if (!this.redis) return []

    try {
      const data = await this.redis.get(KEYS.NOTIFICATIONS)
      if (!data) return []
      return JSON.parse(data) as Notification[]
    } catch (err) {
      log.error('NotificationStore: Failed to get notifications', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      return []
    }
  }

  /**
   * Get notifications by status
   */
  async getByStatus(status: NotificationStatus): Promise<Notification[]> {
    const all = await this.getAll()
    return all.filter(n => n.status === status)
  }

  /**
   * Get current notifications (unread + read, not archived)
   */
  async getCurrent(): Promise<Notification[]> {
    const all = await this.getAll()
    return all.filter(n => n.status === 'unread' || n.status === 'read')
  }

  /**
   * Get archived notifications
   */
  async getArchived(): Promise<Notification[]> {
    return this.getByStatus('archived')
  }

  /**
   * Get notification by ID
   */
  async getById(id: string): Promise<Notification | null> {
    const all = await this.getAll()
    return all.find(n => n.id === id) || null
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<Notification | null> {
    if (!this.redis) return null

    try {
      const notifications = await this.getAll()
      const index = notifications.findIndex(n => n.id === id)

      if (index === -1) return null

      const notification = notifications[index]

      if (notification.status === 'unread') {
        notification.status = 'read'
        notification.readAt = new Date().toISOString()

        await this.redis.set(
          KEYS.NOTIFICATIONS,
          JSON.stringify(notifications),
          'EX',
          TTL.NOTIFICATIONS
        )

        // Decrement unread count
        await this.redis.decr(KEYS.UNREAD_COUNT)

        log.info('NotificationStore: Marked as read', { id })
      }

      return notification
    } catch (err) {
      log.error('NotificationStore: Failed to mark as read', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      return null
    }
  }

  /**
   * Mark all unread as read
   */
  async markAllAsRead(): Promise<number> {
    if (!this.redis) return 0

    try {
      const notifications = await this.getAll()
      let count = 0
      const now = new Date().toISOString()

      for (const notification of notifications) {
        if (notification.status === 'unread') {
          notification.status = 'read'
          notification.readAt = now
          count++
        }
      }

      if (count > 0) {
        await this.redis.set(
          KEYS.NOTIFICATIONS,
          JSON.stringify(notifications),
          'EX',
          TTL.NOTIFICATIONS
        )
        await this.redis.set(KEYS.UNREAD_COUNT, '0')
        log.info('NotificationStore: Marked all as read', { count })
      }

      return count
    } catch (err) {
      log.error('NotificationStore: Failed to mark all as read', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      return 0
    }
  }

  /**
   * Archive notification
   */
  async archive(id: string): Promise<Notification | null> {
    if (!this.redis) return null

    try {
      const notifications = await this.getAll()
      const index = notifications.findIndex(n => n.id === id)

      if (index === -1) return null

      const notification = notifications[index]
      const wasUnread = notification.status === 'unread'

      notification.status = 'archived'
      notification.archivedAt = new Date().toISOString()

      await this.redis.set(
        KEYS.NOTIFICATIONS,
        JSON.stringify(notifications),
        'EX',
        TTL.NOTIFICATIONS
      )

      // Update unread count if was unread
      if (wasUnread) {
        await this.redis.decr(KEYS.UNREAD_COUNT)
      }

      log.info('NotificationStore: Archived notification', { id })

      return notification
    } catch (err) {
      log.error('NotificationStore: Failed to archive', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      return null
    }
  }

  /**
   * Delete notification
   */
  async delete(id: string): Promise<boolean> {
    if (!this.redis) return false

    try {
      const notifications = await this.getAll()
      const index = notifications.findIndex(n => n.id === id)

      if (index === -1) return false

      const notification = notifications[index]
      const wasUnread = notification.status === 'unread'

      notifications.splice(index, 1)

      await this.redis.set(
        KEYS.NOTIFICATIONS,
        JSON.stringify(notifications),
        'EX',
        TTL.NOTIFICATIONS
      )

      // Update unread count if was unread
      if (wasUnread) {
        await this.redis.decr(KEYS.UNREAD_COUNT)
      }

      log.info('NotificationStore: Deleted notification', { id })

      return true
    } catch (err) {
      log.error('NotificationStore: Failed to delete', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      return false
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<number> {
    if (!this.redis) return 0

    try {
      const count = await this.redis.get(KEYS.UNREAD_COUNT)
      return count ? parseInt(count, 10) : 0
    } catch (err) {
      log.error('NotificationStore: Failed to get unread count', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      return 0
    }
  }

  /**
   * Recalculate unread count (for consistency)
   */
  async recalculateUnreadCount(): Promise<number> {
    if (!this.redis) return 0

    try {
      const notifications = await this.getAll()
      const unreadCount = notifications.filter(
        n => n.status === 'unread'
      ).length

      await this.redis.set(KEYS.UNREAD_COUNT, unreadCount.toString())

      return unreadCount
    } catch (err) {
      log.error('NotificationStore: Failed to recalculate unread count', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      return 0
    }
  }

  /**
   * Clear all archived notifications
   */
  async clearArchived(): Promise<number> {
    if (!this.redis) return 0

    try {
      const notifications = await this.getAll()
      const filtered = notifications.filter(n => n.status !== 'archived')
      const removed = notifications.length - filtered.length

      await this.redis.set(
        KEYS.NOTIFICATIONS,
        JSON.stringify(filtered),
        'EX',
        TTL.NOTIFICATIONS
      )

      log.info('NotificationStore: Cleared archived notifications', {
        count: removed,
      })

      return removed
    } catch (err) {
      log.error('NotificationStore: Failed to clear archived', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      return 0
    }
  }

  /**
   * Get summary of notifications by priority
   */
  async getSummary(): Promise<{
    unread: number
    highestPriority: NotificationType | null
    byType: Record<NotificationType, number>
  }> {
    const unread = await this.getByStatus('unread')

    const byType: Record<NotificationType, number> = {
      error: 0,
      warning: 0,
      success: 0,
      info: 0,
    }

    for (const notification of unread) {
      byType[notification.type]++
    }

    // Determine highest priority
    let highestPriority: NotificationType | null = null
    if (byType.error > 0) highestPriority = 'error'
    else if (byType.warning > 0) highestPriority = 'warning'
    else if (byType.success > 0) highestPriority = 'success'
    else if (byType.info > 0) highestPriority = 'info'

    return {
      unread: unread.length,
      highestPriority,
      byType,
    }
  }
}

// Export singleton instance
export const notificationStore = new NotificationStore()
