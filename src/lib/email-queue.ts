/**
 * Email Retry Queue
 *
 * Valkey-based queue for email retry logic.
 * Emails that fail to send are queued for automatic retry.
 */

import Redis from 'ioredis'
import { v4 as uuidv4 } from 'uuid'
import { valkey as valkeyConfig } from '@/lib/config'
import { sendEmail, type EmailAttachment } from '@/lib/email'
import { log } from '@/lib/logger'

const KEYS = {
  EMAIL_QUEUE: 'ppdb:email:queue',
  FAILED_EMAILS: 'ppdb:email:failed',
}

const TTL = {
  QUEUE: 24 * 60 * 60, // 24 hours
  FAILED: 7 * 24 * 60 * 60, // 7 days
}

const MAX_ATTEMPTS = 3
const RETRY_DELAYS = [5 * 60, 30 * 60, 2 * 60 * 60] // 5 min, 30 min, 2 hours (in seconds)

export interface QueuedEmail {
  id: string
  to: string | string[]
  subject: string
  html?: string
  text?: string
  attachments?: EmailAttachment[]
  attempts: number
  maxAttempts: number
  lastAttempt?: string
  nextRetry?: string
  error?: string
  createdAt: string
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
        log.info('EmailQueue: Connected to Valkey')
      })

      redis.on('error', err => {
        log.warn('EmailQueue: Valkey error', { error: err.message })
      })
    } catch (err) {
      log.warn('EmailQueue: Failed to initialize', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      return null
    }
  }

  return redis
}

/**
 * Email Queue class for managing email retry logic
 */
export class EmailQueue {
  private redis: Redis | null

  constructor() {
    this.redis = getRedis()
  }

  /**
   * Check if queue is available
   */
  isAvailable(): boolean {
    return this.redis !== null && this.redis.status === 'ready'
  }

  /**
   * Add email to retry queue
   */
  async enqueue(email: {
    to: string | string[]
    subject: string
    html?: string
    text?: string
    attachments?: EmailAttachment[]
  }): Promise<string | null> {
    if (!this.redis) {
      log.warn('EmailQueue: Queue not available, email will not be queued')
      return null
    }

    try {
      const queuedEmail: QueuedEmail = {
        id: uuidv4(),
        ...email,
        attempts: 0,
        maxAttempts: MAX_ATTEMPTS,
        createdAt: new Date().toISOString(),
        nextRetry: new Date().toISOString(), // Retry immediately first time
      }

      await this.redis.rpush(KEYS.EMAIL_QUEUE, JSON.stringify(queuedEmail))
      await this.redis.expire(KEYS.EMAIL_QUEUE, TTL.QUEUE)

      log.info('EmailQueue: Email queued', {
        id: queuedEmail.id,
        to: email.to,
        subject: email.subject,
      })

      return queuedEmail.id
    } catch (err) {
      log.error('EmailQueue: Failed to queue email', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      return null
    }
  }

  /**
   * Process queued emails
   */
  async processQueue(): Promise<{
    sent: number
    failed: number
    skipped: number
  }> {
    if (!this.redis) {
      return { sent: 0, failed: 0, skipped: 0 }
    }

    const result = { sent: 0, failed: 0, skipped: 0 }
    const now = new Date()

    try {
      // Get all queued emails
      const items = await this.redis.lrange(KEYS.EMAIL_QUEUE, 0, -1)

      if (items.length === 0) {
        return result
      }

      log.info('EmailQueue: Processing queue', { count: items.length })

      // Clear the queue (we'll re-add failures)
      await this.redis.del(KEYS.EMAIL_QUEUE)

      for (const item of items) {
        const email: QueuedEmail = JSON.parse(item)

        // Check if it's time to retry
        if (email.nextRetry && new Date(email.nextRetry) > now) {
          // Not time yet, re-queue
          await this.redis.rpush(KEYS.EMAIL_QUEUE, item)
          result.skipped++
          continue
        }

        // Attempt to send
        email.attempts++
        email.lastAttempt = now.toISOString()

        const sendResult = await sendEmail({
          to: email.to,
          subject: email.subject,
          html: email.html,
          text: email.text,
          attachments: email.attachments,
        })

        if (sendResult.success) {
          log.info('EmailQueue: Email sent successfully', {
            id: email.id,
            attempts: email.attempts,
          })
          result.sent++
        } else {
          email.error = sendResult.error

          if (email.attempts >= email.maxAttempts) {
            // Max attempts reached, move to failed
            log.error('EmailQueue: Email failed permanently', {
              id: email.id,
              attempts: email.attempts,
              error: email.error,
            })
            await this.addToFailed(email)
            result.failed++
          } else {
            // Calculate next retry time
            const delaySeconds =
              RETRY_DELAYS[email.attempts - 1] ||
              RETRY_DELAYS[RETRY_DELAYS.length - 1]
            email.nextRetry = new Date(
              now.getTime() + delaySeconds * 1000
            ).toISOString()

            log.warn('EmailQueue: Email failed, scheduling retry', {
              id: email.id,
              attempts: email.attempts,
              nextRetry: email.nextRetry,
              error: email.error,
            })

            // Re-queue for retry
            await this.redis.rpush(KEYS.EMAIL_QUEUE, JSON.stringify(email))
          }
        }
      }

      // Set TTL on queue if there are items
      const queueLength = await this.redis.llen(KEYS.EMAIL_QUEUE)
      if (queueLength > 0) {
        await this.redis.expire(KEYS.EMAIL_QUEUE, TTL.QUEUE)
      }

      return result
    } catch (err) {
      log.error('EmailQueue: Failed to process queue', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      return result
    }
  }

  /**
   * Add email to failed list
   */
  private async addToFailed(email: QueuedEmail): Promise<void> {
    if (!this.redis) return

    try {
      await this.redis.rpush(KEYS.FAILED_EMAILS, JSON.stringify(email))
      await this.redis.expire(KEYS.FAILED_EMAILS, TTL.FAILED)
    } catch (err) {
      log.error('EmailQueue: Failed to add to failed list', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  /**
   * Get queue status
   */
  async getQueueStatus(): Promise<{
    pending: number
    failed: number
  }> {
    if (!this.redis) {
      return { pending: 0, failed: 0 }
    }

    try {
      const [pending, failed] = await Promise.all([
        this.redis.llen(KEYS.EMAIL_QUEUE),
        this.redis.llen(KEYS.FAILED_EMAILS),
      ])

      return { pending, failed }
    } catch (err) {
      log.error('EmailQueue: Failed to get status', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      return { pending: 0, failed: 0 }
    }
  }

  /**
   * Get failed emails
   */
  async getFailedEmails(limit: number = 20): Promise<QueuedEmail[]> {
    if (!this.redis) return []

    try {
      const items = await this.redis.lrange(KEYS.FAILED_EMAILS, 0, limit - 1)
      return items.map(item => JSON.parse(item) as QueuedEmail)
    } catch (err) {
      log.error('EmailQueue: Failed to get failed emails', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      return []
    }
  }

  /**
   * Clear failed emails
   */
  async clearFailed(): Promise<boolean> {
    if (!this.redis) return false

    try {
      await this.redis.del(KEYS.FAILED_EMAILS)
      return true
    } catch (err) {
      log.error('EmailQueue: Failed to clear failed emails', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      return false
    }
  }
}

// Export singleton instance
export const emailQueue = new EmailQueue()
