/**
 * Rate Limit Middleware for Next.js API Routes
 *
 * Wraps API route handlers to add rate limiting based on client IP.
 * Returns 429 Too Many Requests when limit exceeded.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  checkRateLimit,
  getClientIdentifier,
  RateLimitType,
} from '@/lib/ratelimit'
import { log } from '@/lib/logger'

export interface RateLimitOptions {
  type?: RateLimitType
}

/**
 * Add rate limit headers to a response
 */
function addRateLimitHeaders(
  response: Response,
  limit: number,
  remaining: number,
  reset: number
): Response {
  const headers = new Headers(response.headers)
  headers.set('X-RateLimit-Limit', limit.toString())
  headers.set('X-RateLimit-Remaining', remaining.toString())
  headers.set('X-RateLimit-Reset', new Date(reset).toISOString())

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

/**
 * Create a 429 Too Many Requests response
 */
function createRateLimitResponse(limit: number, reset: number): NextResponse {
  const retryAfter = Math.ceil((reset - Date.now()) / 1000)

  return NextResponse.json(
    {
      error: 'Rate limit exceeded',
      message: `Too many requests. Please try again after ${new Date(reset).toISOString()}`,
      retryAfter,
    },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(reset).toISOString(),
        'Retry-After': retryAfter.toString(),
      },
    }
  )
}

/**
 * Wrap an API route handler with rate limiting
 *
 * @example
 * ```ts
 * export async function GET(request: NextRequest) {
 *   return withRateLimit(request, async () => {
 *     // Your handler logic
 *     return NextResponse.json({ data: 'example' })
 *   }, { type: 'search' })
 * }
 * ```
 */
export async function withRateLimit(
  request: NextRequest,
  handler: () => Promise<Response>,
  options: RateLimitOptions = {}
): Promise<Response> {
  const { type = 'api' } = options
  const identifier = getClientIdentifier(request)
  const path = request.nextUrl.pathname

  const { success, limit, remaining, reset } = await checkRateLimit(
    identifier,
    type
  )

  if (!success) {
    log.warn('Rate limit exceeded', {
      identifier,
      type,
      path,
      limit,
    })
    return createRateLimitResponse(limit, reset)
  }

  // Execute handler
  const response = await handler()

  // Add rate limit headers to successful response
  return addRateLimitHeaders(response, limit, remaining, reset)
}

/**
 * Higher-order function to create a rate-limited handler
 * Useful for cleaner exports
 *
 * @example
 * ```ts
 * const handler = async (request: NextRequest) => {
 *   // Your handler logic
 *   return NextResponse.json({ data: 'example' })
 * }
 *
 * export const GET = rateLimited(handler, { type: 'search' })
 * ```
 */
export function rateLimited(
  handler: (request: NextRequest) => Promise<Response>,
  options: RateLimitOptions = {}
): (request: NextRequest) => Promise<Response> {
  return async (request: NextRequest) => {
    return withRateLimit(request, () => handler(request), options)
  }
}
