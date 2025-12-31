/**
 * Email Service
 *
 * Provides email sending functionality using Nodemailer.
 * Supports HTML and plain text emails with attachments.
 */

import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import type SMTPTransport from 'nodemailer/lib/smtp-transport'
import { log } from '@/lib/logger'

// Email configuration from environment
const smtpConfig = {
  get host(): string | undefined {
    return process.env.SMTP_HOST
  },
  get port(): number {
    return parseInt(process.env.SMTP_PORT || '587', 10)
  },
  get secure(): boolean {
    // Port 465 is always secure (Implicit TLS)
    if (this.port === 465) return true
    return process.env.SMTP_SECURE === 'true'
  },
  get user(): string | undefined {
    return process.env.SMTP_USER
  },
  get password(): string | undefined {
    return process.env.SMTP_PASS
  },
  get from(): string {
    return process.env.SMTP_FROM || 'PPDB Scheduler <noreply@example.com>'
  },
  get isConfigured(): boolean {
    return !!(this.host && this.user && this.password)
  },
}

// Export config for external use
export { smtpConfig }

export interface EmailAttachment {
  filename: string
  path?: string
  content?: Buffer | string
  contentType?: string
}

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  text?: string
  html?: string
  attachments?: EmailAttachment[]
}

export interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

// Transporter singleton
let transporter: Transporter<SMTPTransport.SentMessageInfo> | null = null

/**
 * Get or create email transporter
 */
function getTransporter(): Transporter<SMTPTransport.SentMessageInfo> | null {
  if (!smtpConfig.isConfigured) {
    log.warn('Email: SMTP not configured')
    return null
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.password,
      },
    })

    // Verify connection on first use
    transporter.verify().then(
      () => {
        log.info('Email: SMTP connection verified')
      },
      err => {
        log.error('Email: SMTP connection failed', {
          error: err.message,
        })
      }
    )
  }

  return transporter
}

/**
 * Send an email
 */
export async function sendEmail(
  options: SendEmailOptions
): Promise<SendEmailResult> {
  const transport = getTransporter()

  if (!transport) {
    return {
      success: false,
      error: 'SMTP not configured',
    }
  }

  try {
    const result = await transport.sendMail({
      from: smtpConfig.from,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    })

    log.info('Email: Sent successfully', {
      to: options.to,
      subject: options.subject,
      messageId: result.messageId,
    })

    return {
      success: true,
      messageId: result.messageId,
    }
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    log.error('Email: Failed to send', {
      to: options.to,
      subject: options.subject,
      error,
    })

    return {
      success: false,
      error,
    }
  }
}

/**
 * Check if email is configured and working
 */
export async function verifyEmailConnection(): Promise<boolean> {
  const transport = getTransporter()

  if (!transport) {
    return false
  }

  try {
    await transport.verify()
    return true
  } catch {
    return false
  }
}

/**
 * Get email configuration status
 */
export function getEmailStatus(): {
  configured: boolean
  host?: string
  port?: number
} {
  return {
    configured: smtpConfig.isConfigured,
    host: smtpConfig.host,
    port: smtpConfig.port,
  }
}

/**
 * Update notification event types for email recipient segregation
 */
export type UpdateNotificationEvent =
  | 'update_available' // USER only
  | 'update_approved' // BOTH
  | 'update_success' // BOTH
  | 'update_failed' // DEVELOPER only
  | 'update_rollback' // DEVELOPER only

/**
 * Get email recipients for update notification events
 *
 * Segregates notifications between end users and developers:
 * - UPDATE_NOTIFICATION_EMAIL: Users who care about availability and success
 * - DEVELOPER_NOTIFICATION_EMAIL: Developers who need to know about failures/rollbacks
 *
 * @param event - The type of update event
 * @returns Array of email addresses to notify (may be empty if no recipients configured)
 */
export function getUpdateNotificationRecipients(
  event: UpdateNotificationEvent
): string[] {
  const userEmail = process.env.UPDATE_NOTIFICATION_EMAIL
  const devEmail = process.env.DEVELOPER_NOTIFICATION_EMAIL
  const recipients: string[] = []

  switch (event) {
    case 'update_available':
      // Only end users care about new updates being available
      if (userEmail) recipients.push(userEmail)
      break

    case 'update_approved':
    case 'update_success':
      // Both users and developers want to know about approvals and successes
      if (userEmail) recipients.push(userEmail)
      if (devEmail && devEmail !== userEmail) recipients.push(devEmail)
      break

    case 'update_failed':
    case 'update_rollback':
      // Only developers need to know about failures and rollbacks
      if (devEmail) recipients.push(devEmail)
      break
  }

  return recipients
}
