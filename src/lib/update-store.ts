/**
 * Valkey-based Update State Management
 *
 * Stores update state in Valkey (Redis) instead of database to avoid schema changes.
 * Supports pending updates, execution tracking, and rollback data.
 */

import Redis from 'ioredis'
import { v4 as uuidv4 } from 'uuid'
import { valkey as valkeyConfig } from '@/lib/config'
import { log } from '@/lib/logger'

// Key patterns for Valkey storage
const KEYS = {
  CURRENT_UPDATE: 'ppdb:update:current',
  UPDATE_HISTORY: 'ppdb:update:history',
  ROLLBACK_BACKUP: 'ppdb:update:rollback:backup',
  ROLLBACK_IMAGE: 'ppdb:update:rollback:image',
  LAST_CHECK: 'ppdb:update:last_check',
  APP_VERSION: 'ppdb:app:version',
}

// TTL values in seconds
const TTL = {
  ROLLBACK_DATA: 7 * 24 * 60 * 60, // 7 days
  UPDATE_HISTORY: 90 * 24 * 60 * 60, // 90 days
}

// Maximum history entries to keep
const MAX_HISTORY_ENTRIES = 50

export type UpdateStatus = 'PENDING' | 'APPROVED' | 'EXECUTED' | 'FAILED'

export interface PendingUpdate {
  id: string
  currentVersion: string
  newVersion: string
  releaseNotes?: string
  releaseTitle?: string
  releaseUrl?: string
  detectedAt: string
  status: UpdateStatus
  approvedBy?: string
  approvedAt?: string
  executedAt?: string
  executionDuration?: number
  errorMessage?: string
  rollbackPerformed?: boolean
  rollbackDetails?: string
}

export interface RollbackData {
  backupPath: string
  previousImage: string
  createdAt: string
}

// Redis client singleton
let redis: Redis | null = null

/**
 * Get or create Redis connection
 */
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
        retryStrategy: (times: number) => {
          if (times > 5) {
            log.warn('Valkey connection failed for update store')
            return null
          }
          return Math.min(times * 100, 2000)
        },
      })

      redis.on('connect', () => {
        log.info('UpdateStore: Connected to Valkey')
      })

      redis.on('error', err => {
        log.warn('UpdateStore: Valkey error', { error: err.message })
      })
    } catch (err) {
      log.warn('UpdateStore: Failed to initialize Valkey client', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      return null
    }
  }

  return redis
}

/**
 * Update Store class for managing update state in Valkey
 */
export class UpdateStore {
  private redis: Redis | null

  constructor() {
    this.redis = getRedis()
  }

  /**
   * Check if Valkey is available
   */
  isAvailable(): boolean {
    return this.redis !== null && this.redis.status === 'ready'
  }

  /**
   * Get current pending/approved update
   */
  async getCurrentUpdate(): Promise<PendingUpdate | null> {
    if (!this.redis) return null

    try {
      const data = await this.redis.get(KEYS.CURRENT_UPDATE)
      if (!data) return null
      return JSON.parse(data) as PendingUpdate
    } catch (err) {
      log.error('UpdateStore: Failed to get current update', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      return null
    }
  }

  /**
   * Create new pending update (fails if one already exists)
   */
  async createPendingUpdate(
    data: Omit<PendingUpdate, 'id' | 'status' | 'detectedAt'>
  ): Promise<PendingUpdate | null> {
    if (!this.redis) return null

    try {
      // Check if there's already an update pending
      const existing = await this.getCurrentUpdate()
      if (
        existing &&
        (existing.status === 'PENDING' || existing.status === 'APPROVED')
      ) {
        log.warn('UpdateStore: Cannot create new update, one already exists', {
          existingId: existing.id,
          existingStatus: existing.status,
        })
        return null
      }

      const update: PendingUpdate = {
        ...data,
        id: uuidv4(),
        status: 'PENDING',
        detectedAt: new Date().toISOString(),
      }

      await this.redis.set(KEYS.CURRENT_UPDATE, JSON.stringify(update))
      log.info('UpdateStore: Created pending update', {
        id: update.id,
        version: update.newVersion,
      })

      return update
    } catch (err) {
      log.error('UpdateStore: Failed to create pending update', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      return null
    }
  }

  /**
   * Approve current update
   */
  async approveUpdate(approvedBy: string): Promise<PendingUpdate | null> {
    if (!this.redis) return null

    try {
      const current = await this.getCurrentUpdate()
      if (!current) {
        log.warn('UpdateStore: No update to approve')
        return null
      }

      if (current.status !== 'PENDING') {
        log.warn('UpdateStore: Update is not in PENDING status', {
          status: current.status,
        })
        return null
      }

      const updated: PendingUpdate = {
        ...current,
        status: 'APPROVED',
        approvedBy,
        approvedAt: new Date().toISOString(),
      }

      await this.redis.set(KEYS.CURRENT_UPDATE, JSON.stringify(updated))
      log.info('UpdateStore: Update approved', {
        id: updated.id,
        approvedBy,
      })

      return updated
    } catch (err) {
      log.error('UpdateStore: Failed to approve update', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      return null
    }
  }

  /**
   * Cancel (delete) current update
   */
  async cancelUpdate(): Promise<boolean> {
    if (!this.redis) return false

    try {
      const current = await this.getCurrentUpdate()
      if (current) {
        log.info('UpdateStore: Cancelling update', {
          id: current.id,
          status: current.status,
        })
      }

      await this.redis.del(KEYS.CURRENT_UPDATE)
      return true
    } catch (err) {
      log.error('UpdateStore: Failed to cancel update', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      return false
    }
  }

  /**
   * Mark update as executed (moves to history)
   */
  async markExecuted(executionDuration?: number): Promise<boolean> {
    if (!this.redis) return false

    try {
      const current = await this.getCurrentUpdate()
      if (!current) {
        log.warn('UpdateStore: No update to mark as executed')
        return false
      }

      const executed: PendingUpdate = {
        ...current,
        status: 'EXECUTED',
        executedAt: new Date().toISOString(),
        executionDuration,
      }

      // Add to history
      await this.addToHistory(executed)

      // Clear current update
      await this.redis.del(KEYS.CURRENT_UPDATE)

      // Clear rollback data (no longer needed after successful execution)
      await this.clearRollbackData()

      log.info('UpdateStore: Update marked as executed', {
        id: executed.id,
        version: executed.newVersion,
        duration: executionDuration,
      })

      return true
    } catch (err) {
      log.error('UpdateStore: Failed to mark update as executed', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      return false
    }
  }

  /**
   * Mark update as failed with rollback info (moves to history)
   */
  async markFailed(
    error: string,
    rollbackPerformed: boolean,
    rollbackDetails?: string
  ): Promise<boolean> {
    if (!this.redis) return false

    try {
      const current = await this.getCurrentUpdate()
      if (!current) {
        log.warn('UpdateStore: No update to mark as failed')
        return false
      }

      const failed: PendingUpdate = {
        ...current,
        status: 'FAILED',
        executedAt: new Date().toISOString(),
        errorMessage: error,
        rollbackPerformed,
        rollbackDetails,
      }

      // Add to history
      await this.addToHistory(failed)

      // Clear current update
      await this.redis.del(KEYS.CURRENT_UPDATE)

      log.info('UpdateStore: Update marked as failed', {
        id: failed.id,
        error,
        rollbackPerformed,
      })

      return true
    } catch (err) {
      log.error('UpdateStore: Failed to mark update as failed', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      return false
    }
  }

  /**
   * Add update to history
   */
  private async addToHistory(update: PendingUpdate): Promise<void> {
    if (!this.redis) return

    try {
      // Push to history list
      await this.redis.lpush(KEYS.UPDATE_HISTORY, JSON.stringify(update))

      // Trim to max entries
      await this.redis.ltrim(KEYS.UPDATE_HISTORY, 0, MAX_HISTORY_ENTRIES - 1)

      // Set TTL on history list
      await this.redis.expire(KEYS.UPDATE_HISTORY, TTL.UPDATE_HISTORY)
    } catch (err) {
      log.error('UpdateStore: Failed to add to history', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  /**
   * Get update history
   */
  async getHistory(limit: number = 20): Promise<PendingUpdate[]> {
    if (!this.redis) return []

    try {
      const data = await this.redis.lrange(KEYS.UPDATE_HISTORY, 0, limit - 1)
      return data.map(item => JSON.parse(item) as PendingUpdate)
    } catch (err) {
      log.error('UpdateStore: Failed to get history', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      return []
    }
  }

  /**
   * Store rollback data before update
   */
  async storeRollbackData(
    backupPath: string,
    previousImage: string
  ): Promise<boolean> {
    if (!this.redis) return false

    try {
      const data: RollbackData = {
        backupPath,
        previousImage,
        createdAt: new Date().toISOString(),
      }

      await this.redis.set(
        KEYS.ROLLBACK_BACKUP,
        data.backupPath,
        'EX',
        TTL.ROLLBACK_DATA
      )
      await this.redis.set(
        KEYS.ROLLBACK_IMAGE,
        data.previousImage,
        'EX',
        TTL.ROLLBACK_DATA
      )

      log.info('UpdateStore: Stored rollback data', {
        backupPath,
        previousImage,
      })

      return true
    } catch (err) {
      log.error('UpdateStore: Failed to store rollback data', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      return false
    }
  }

  /**
   * Get rollback data
   */
  async getRollbackData(): Promise<RollbackData | null> {
    if (!this.redis) return null

    try {
      const [backupPath, previousImage] = await Promise.all([
        this.redis.get(KEYS.ROLLBACK_BACKUP),
        this.redis.get(KEYS.ROLLBACK_IMAGE),
      ])

      if (!backupPath || !previousImage) return null

      return {
        backupPath,
        previousImage,
        createdAt: '', // Not stored separately
      }
    } catch (err) {
      log.error('UpdateStore: Failed to get rollback data', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      return null
    }
  }

  /**
   * Clear rollback data after successful update
   */
  async clearRollbackData(): Promise<boolean> {
    if (!this.redis) return false

    try {
      await this.redis.del(KEYS.ROLLBACK_BACKUP)
      await this.redis.del(KEYS.ROLLBACK_IMAGE)
      return true
    } catch (err) {
      log.error('UpdateStore: Failed to clear rollback data', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      return false
    }
  }

  /**
   * Set last version check timestamp
   */
  async setLastCheckTime(): Promise<boolean> {
    if (!this.redis) return false

    try {
      await this.redis.set(KEYS.LAST_CHECK, new Date().toISOString())
      return true
    } catch (err) {
      log.error('UpdateStore: Failed to set last check time', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      return false
    }
  }

  /**
   * Get last version check timestamp
   */
  async getLastCheckTime(): Promise<string | null> {
    if (!this.redis) return null

    try {
      return await this.redis.get(KEYS.LAST_CHECK)
    } catch (err) {
      log.error('UpdateStore: Failed to get last check time', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      return null
    }
  }

  /**
   * Get current app version from Valkey (runtime version)
   */
  async getAppVersion(): Promise<string | null> {
    if (!this.redis) return null

    try {
      return await this.redis.get(KEYS.APP_VERSION)
    } catch (err) {
      log.error('UpdateStore: Failed to get app version', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      return null
    }
  }

  /**
   * Set current app version in Valkey (after successful update)
   */
  async setAppVersion(version: string): Promise<boolean> {
    if (!this.redis) return false

    try {
      await this.redis.set(KEYS.APP_VERSION, version)
      log.info('UpdateStore: App version updated', { version })
      return true
    } catch (err) {
      log.error('UpdateStore: Failed to set app version', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      return false
    }
  }
}

// Export singleton instance
export const updateStore = new UpdateStore()
