/**
 * Unified Logging System for API and Database Operations
 *
 * Provides consistent, formatted logging for:
 * - API requests (method, path, query params)
 * - API responses (status, duration)
 * - SQL queries (via Prisma)
 * - Errors and warnings
 *
 * Enable/disable via DEBUG environment variable
 */

type _LogLevel = 'info' | 'warn' | 'error' | 'sql' | 'api'

interface ApiLogOptions {
  method: string
  path: string
  query?: Record<string, string | string[]>
  body?: unknown
  duration?: number
  status?: number
}

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  // Methods
  GET: '\x1b[32m', // Green
  POST: '\x1b[33m', // Yellow
  PUT: '\x1b[34m', // Blue
  DELETE: '\x1b[31m', // Red
  PATCH: '\x1b[35m', // Magenta

  // Status codes
  success: '\x1b[32m', // 2xx - Green
  redirect: '\x1b[36m', // 3xx - Cyan
  clientError: '\x1b[33m', // 4xx - Yellow
  serverError: '\x1b[31m', // 5xx - Red

  // Log types
  sql: '\x1b[36m', // Cyan
  info: '\x1b[37m', // White
  warn: '\x1b[33m', // Yellow
  error: '\x1b[31m', // Red
} as const

/**
 * Check if debug logging is enabled
 */
function isDebugEnabled(): boolean {
  return process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development'
}

/**
 * Get color for HTTP method
 */
function getMethodColor(method: string): string {
  return COLORS[method as keyof typeof COLORS] || COLORS.info
}

/**
 * Get color for HTTP status code
 */
function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return COLORS.success
  if (status >= 300 && status < 400) return COLORS.redirect
  if (status >= 400 && status < 500) return COLORS.clientError
  if (status >= 500) return COLORS.serverError
  return COLORS.info
}

/**
 * Format timestamp
 */
function getTimestamp(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19)
}

/**
 * Format query parameters for display
 */
function formatQuery(query?: Record<string, string | string[]>): string {
  if (!query || Object.keys(query).length === 0) return ''

  const params = Object.entries(query)
    .map(
      ([key, value]) =>
        `${key}=${Array.isArray(value) ? value.join(',') : value}`
    )
    .join('&')

  return `?${params}`
}

/**
 * Format request body for display
 */
function formatBody(body: unknown): string {
  if (!body) return ''

  try {
    const str = JSON.stringify(body)
    // Truncate long bodies
    if (str.length > 200) {
      return str.substring(0, 197) + '...'
    }
    return str
  } catch {
    return '[Unable to stringify body]'
  }
}

/**
 * Log API request
 */
export function logApiRequest(options: ApiLogOptions): void {
  if (!isDebugEnabled()) return

  const { method, path, query, body } = options
  const methodColor = getMethodColor(method)
  const queryStr = formatQuery(query)
  const bodyStr = body
    ? ` ${COLORS.dim}Body: ${formatBody(body)}${COLORS.reset}`
    : ''

  console.log(
    `${COLORS.dim}[${getTimestamp()}]${COLORS.reset} ` +
      `${methodColor}${method.padEnd(6)}${COLORS.reset} ` +
      `${path}${queryStr}${bodyStr}`
  )
}

/**
 * Log API response
 */
export function logApiResponse(options: ApiLogOptions): void {
  if (!isDebugEnabled()) return

  const { method, path, status = 200, duration } = options
  const methodColor = getMethodColor(method)
  const statusColor = getStatusColor(status)
  const durationStr =
    duration !== undefined ? ` ${COLORS.dim}(${duration}ms)${COLORS.reset}` : ''

  console.log(
    `${COLORS.dim}[${getTimestamp()}]${COLORS.reset} ` +
      `${methodColor}${method.padEnd(6)}${COLORS.reset} ` +
      `${path} ` +
      `${statusColor}${status}${COLORS.reset}${durationStr}`
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
  if (!isDebugEnabled()) return

  const durationStr =
    duration !== undefined ? ` ${COLORS.dim}(${duration}ms)${COLORS.reset}` : ''
  const paramsStr =
    params && params.length > 0
      ? `\n${COLORS.dim}   Params: ${JSON.stringify(params)}${COLORS.reset}`
      : ''

  console.log(
    `${COLORS.dim}[${getTimestamp()}]${COLORS.reset} ` +
      `${COLORS.sql}SQL${COLORS.reset}    ` +
      `${query}${paramsStr}${durationStr}`
  )
}

/**
 * Log error
 */
export function logError(message: string, error?: Error | unknown): void {
  if (!isDebugEnabled()) return

  console.error(
    `${COLORS.dim}[${getTimestamp()}]${COLORS.reset} ` +
      `${COLORS.error}ERROR${COLORS.reset}  ` +
      `${message}`
  )

  if (error) {
    if (error instanceof Error) {
      console.error(`${COLORS.dim}   ${error.message}${COLORS.reset}`)
      if (error.stack) {
        console.error(
          `${COLORS.dim}   ${error.stack.split('\n').slice(1, 4).join('\n   ')}${COLORS.reset}`
        )
      }
    } else {
      console.error(`${COLORS.dim}   ${JSON.stringify(error)}${COLORS.reset}`)
    }
  }
}

/**
 * Log warning
 */
export function logWarn(message: string): void {
  if (!isDebugEnabled()) return

  console.warn(
    `${COLORS.dim}[${getTimestamp()}]${COLORS.reset} ` +
      `${COLORS.warn}WARN${COLORS.reset}   ` +
      `${message}`
  )
}

/**
 * Log info
 */
export function logInfo(message: string): void {
  if (!isDebugEnabled()) return

  console.log(
    `${COLORS.dim}[${getTimestamp()}]${COLORS.reset} ` +
      `${COLORS.info}INFO${COLORS.reset}   ` +
      `${message}`
  )
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

/**
 * Example usage in API routes:
 *
 * ```typescript
 * import { withApiLogger } from '@/lib/logger'
 *
 * async function handler(request: NextRequest) {
 *   // Your route logic
 * }
 *
 * export const GET = withApiLogger(handler)
 * export const POST = withApiLogger(handler)
 * ```
 */
