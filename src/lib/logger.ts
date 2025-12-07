/**
 * Unified Logging System for API and Database Operations
 *
 * Uses pino for structured logging with:
 * - Automatic sensitive data redaction (phone numbers, emails)
 * - Pretty printing in development
 * - JSON output in production
 * - Debug gating via DEBUG environment variable
 *
 * Provides consistent, formatted logging for:
 * - API requests (method, path, query params)
 * - API responses (status, duration)
 * - SQL queries (via Prisma)
 * - Errors and warnings
 */

import pino from 'pino'

const isDevelopment = process.env.NODE_ENV === 'development'
const isDebugEnabled = process.env.DEBUG === 'true' || isDevelopment

// Configure pino logger
// Redaction configuration
const redactOptions = {
  paths: [
    // Direct fields
    'phone1',
    'phone2',
    'phone3',
    'email',
    'password',
    // Nested customer fields
    'customer.phone1',
    'customer.phone2',
    'customer.phone3',
    'customer.email',
    // Wildcard patterns for arrays
    '*.phone1',
    '*.phone2',
    '*.phone3',
    '*.email',
    // Body content
    'body.phone1',
    'body.phone2',
    'body.phone3',
    'body.email',
  ],
  censor: '[REDACTED]',
}

// Configure pino logger
// In development, we use pino-pretty directly as a stream to avoid worker thread issues
// that can occur with the transport option in Next.js/pnpm environments
export const logger = isDevelopment
  ? pino(
      {
        level: isDebugEnabled ? 'debug' : 'info',
        redact: redactOptions,
      },
      require('pino-pretty')({
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      })
    )
  : pino({
      level: isDebugEnabled ? 'debug' : 'info',
      redact: redactOptions,
    })

// Convenience methods with proper typing
export const log = {
  debug: (msg: string, data?: object) => {
    if (isDebugEnabled) logger.debug(data, msg)
  },
  info: (msg: string, data?: object) => logger.info(data, msg),
  warn: (msg: string, data?: object) => logger.warn(data, msg),
  error: (msg: string, error?: Error | unknown, data?: object) => {
    if (error instanceof Error) {
      logger.error({ ...data, err: error }, msg)
    } else {
      logger.error({ ...data, error }, msg)
    }
  },
}

// --- Legacy API compatibility layer ---
// These functions maintain backward compatibility with existing code

interface ApiLogOptions {
  method: string
  path: string
  query?: Record<string, string | string[]>
  body?: unknown
  duration?: number
  status?: number
}

/**
 * Log API request
 */
export function logApiRequest(options: ApiLogOptions): void {
  if (!isDebugEnabled) return

  const { method, path, query, body } = options
  logger.debug(
    {
      type: 'api_request',
      method,
      path,
      query,
      body,
    },
    `${method} ${path}`
  )
}

/**
 * Log API response
 */
export function logApiResponse(options: ApiLogOptions): void {
  if (!isDebugEnabled) return

  const { method, path, status = 200, duration } = options
  logger.debug(
    {
      type: 'api_response',
      method,
      path,
      status,
      duration,
    },
    `${method} ${path} ${status}${duration !== undefined ? ` (${duration}ms)` : ''}`
  )
}

/**
 * Log SQL query
 */
export function logSql(
  query: string,
  params?: unknown[],
  duration?: number
): void {
  if (!isDebugEnabled) return

  logger.debug(
    {
      type: 'sql',
      query,
      params,
      duration,
    },
    `SQL: ${query.substring(0, 100)}${query.length > 100 ? '...' : ''}`
  )
}

/**
 * Log error
 */
export function logError(message: string, error?: Error | unknown): void {
  if (error instanceof Error) {
    logger.error({ err: error }, message)
  } else if (error) {
    logger.error({ error }, message)
  } else {
    logger.error(message)
  }
}

/**
 * Log warning
 */
export function logWarn(message: string, data?: object): void {
  logger.warn(data, message)
}

/**
 * Log info
 */
export function logInfo(message: string, data?: object): void {
  logger.info(data, message)
}

/**
 * API Route Logger Middleware
 * Wraps API route handlers to automatically log requests and responses
 */
export function withApiLogger(
  handler: (req: Request, ...args: unknown[]) => Promise<Response>,
  options?: { routeName?: string }
): (req: Request, ...args: unknown[]) => Promise<Response> {
  return async (req: Request, ...args: unknown[]) => {
    const startTime = Date.now()
    const url = new URL(req.url)
    const path = options?.routeName || url.pathname
    const method = req.method

    // Parse query params
    const query: Record<string, string | string[]> = {}
    url.searchParams.forEach((value, key) => {
      if (query[key]) {
        if (Array.isArray(query[key])) {
          ;(query[key] as string[]).push(value)
        } else {
          query[key] = [query[key] as string, value]
        }
      } else {
        query[key] = value
      }
    })

    // Parse body for POST/PUT/PATCH
    let body: unknown
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        const clonedReq = req.clone()
        body = await clonedReq.json().catch(() => null)
      } catch {
        // Body might not be JSON or already consumed
      }
    }

    // Log request
    logApiRequest({ method, path, query, body })

    try {
      // Execute handler
      const response = await handler(req, ...args)
      const duration = Date.now() - startTime

      // Log response
      logApiResponse({ method, path, status: response.status, duration })

      return response
    } catch (error) {
      const duration = Date.now() - startTime
      logError(`${method} ${path} failed after ${duration}ms`, error)
      throw error
    }
  }
}

export default logger
