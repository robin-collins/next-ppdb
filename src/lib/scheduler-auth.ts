/**
 * Scheduler API Authentication
 *
 * Validates API key for scheduler-triggered endpoints.
 */

import { log } from '@/lib/logger'

// Configuration
const schedulerConfig = {
  get apiKey(): string | undefined {
    return process.env.SCHEDULER_API_KEY
  },
  get isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length >= 32
  },
}

export { schedulerConfig }

/**
 * Validate scheduler authentication from request
 *
 * @param request - The incoming request
 * @returns true if authentication is valid, false otherwise
 */
export function validateSchedulerAuth(request: Request): boolean {
  if (!schedulerConfig.isConfigured) {
    log.warn('SchedulerAuth: API key not configured')
    return false
  }

  const authHeader = request.headers.get('Authorization')

  if (!authHeader) {
    log.warn('SchedulerAuth: No Authorization header')
    return false
  }

  // Support both "Bearer <token>" and raw token formats
  let token: string
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7)
  } else {
    token = authHeader
  }

  const isValid = token === schedulerConfig.apiKey

  if (!isValid) {
    log.warn('SchedulerAuth: Invalid API key')
  }

  return isValid
}

/**
 * Get scheduler authorization status
 */
export function getSchedulerAuthStatus(): {
  configured: boolean
  keyLength: number
} {
  return {
    configured: schedulerConfig.isConfigured,
    keyLength: schedulerConfig.apiKey?.length || 0,
  }
}

/**
 * Generate a new secure API key (utility function for setup)
 *
 * @returns A cryptographically secure 64-character hex string
 */
export function generateApiKey(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}
