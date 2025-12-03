/**
 * Rate Limiting Utility for API Routes
 *
 * Uses Valkey (Redis fork) for distributed rate limiting in production.
 * Falls back to in-memory rate limiting when Valkey is not configured.
 *
 * Configuration:
 * - VALKEY_HOST: Valkey host (default: 'valkey' for Docker Compose)
 * - VALKEY_PORT: Valkey port (default: 6379)
 */

import Redis from 'ioredis'
import { RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible'
import { log } from '@/lib/logger'

// Valkey client (uses Docker Compose service or environment variables)
let redis: Redis | null = null

// Initialize Redis connection if configured
if (process.env.VALKEY_HOST) {
  try {
    redis = new Redis({
      host: process.env.VALKEY_HOST || 'valkey',
      port: parseInt(process.env.VALKEY_PORT || '6379'),
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      retryStrategy: (times: number) => {
        if (times > 3) {
          log.warn(
            'Valkey connection failed, falling back to in-memory rate limiting'
          )
          return null // Stop retrying
        }
        return Math.min(times * 100, 1000)
      },
    })

    redis.on('connect', () => {
      log.info('Connected to Valkey for rate limiting')
    })

    redis.on('error', err => {
      log.warn('Valkey connection error, using in-memory fallback', {
        error: err.message,
      })
    })
  } catch (err) {
    log.warn('Failed to initialize Valkey client', {
      error: err instanceof Error ? err.message : 'Unknown error',
    })
    redis = null
  }
}

// Rate limit configurations by endpoint type
const RATE_LIMITS = {
  // Standard API routes: 30 requests per minute
  api: { points: 30, duration: 60 },
  // Search endpoints: 20 requests per minute (more expensive)
  search: { points: 20, duration: 60 },
  // Mutation endpoints: 10 requests per minute (POST/PUT/DELETE)
  mutation: { points: 10, duration: 60 },
} as const

export type RateLimitType = keyof typeof RATE_LIMITS

// Create rate limiters (Redis-backed or in-memory fallback)
function createRateLimiter(type: RateLimitType) {
  const config = RATE_LIMITS[type]

  if (redis) {
    return new RateLimiterRedis({
      storeClient: redis,
      keyPrefix: `rl:${type}`,
      points: config.points,
      duration: config.duration,
    })
  }

  // Fallback to in-memory rate limiting
  return new RateLimiterMemory({
    points: config.points,
    duration: config.duration,
  })
}

// Lazy-initialized rate limiters
let rateLimiters: Record<
  RateLimitType,
  RateLimiterRedis | RateLimiterMemory
> | null = null

function getRateLimiters() {
  if (!rateLimiters) {
    rateLimiters = {
      api: createRateLimiter('api'),
      search: createRateLimiter('search'),
      mutation: createRateLimiter('mutation'),
    }
  }
  return rateLimiters
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Check rate limit for an identifier (usually IP address)
 */
export async function checkRateLimit(
  identifier: string,
  type: RateLimitType = 'api'
): Promise<RateLimitResult> {
  const limiters = getRateLimiters()
  const limiter = limiters[type]
  const config = RATE_LIMITS[type]

  try {
    const result = await limiter.consume(identifier)
    return {
      success: true,
      limit: config.points,
      remaining: result.remainingPoints,
      reset: Date.now() + result.msBeforeNext,
    }
  } catch (error: unknown) {
    // Rate limit exceeded
    const rateLimitError = error as { msBeforeNext?: number }
    return {
      success: false,
      limit: config.points,
      remaining: 0,
      reset: Date.now() + (rateLimitError.msBeforeNext || 60000),
    }
  }
}

/**
 * Get client identifier from request (IP address)
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from headers (Traefik, nginx, etc.)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  // Return first IP from x-forwarded-for, or other headers, or fallback
  return (
    forwarded?.split(',')[0].trim() || realIp || cfConnectingIp || 'anonymous'
  )
}

/**
 * Get rate limit configuration for reference
 */
export function getRateLimitConfig() {
  return RATE_LIMITS
}
