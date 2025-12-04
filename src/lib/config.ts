/**
 * Centralized Configuration
 *
 * Provides typed access to all configuration values grouped by domain.
 * Uses validated environment from env.ts.
 */

import { parseEnv, type Env } from './env'

// Lazy-loaded validated environment
let _env: Env | null = null

function getValidatedEnv(): Env {
  if (!_env) {
    _env = parseEnv()
  }
  return _env
}

/**
 * Database configuration
 */
export const database = {
  get url(): string {
    return getValidatedEnv().DATABASE_URL
  },
}

/**
 * Server configuration
 */
export const server = {
  get port(): number {
    return getValidatedEnv().PORT
  },
  get hostname(): string {
    return getValidatedEnv().HOSTNAME
  },
  get isDevelopment(): boolean {
    return getValidatedEnv().NODE_ENV === 'development'
  },
  get isProduction(): boolean {
    return getValidatedEnv().NODE_ENV === 'production'
  },
  get isTest(): boolean {
    return getValidatedEnv().NODE_ENV === 'test'
  },
}

/**
 * Rate limiting / Valkey configuration
 */
export const valkey = {
  get host(): string | undefined {
    return getValidatedEnv().VALKEY_HOST
  },
  get port(): number {
    return getValidatedEnv().VALKEY_PORT
  },
  get isConfigured(): boolean {
    return !!getValidatedEnv().VALKEY_HOST
  },
}

/**
 * Logging configuration
 */
export const logging = {
  get debug(): boolean {
    return getValidatedEnv().DEBUG ?? false
  },
}

/**
 * Rate limit configuration (requests per minute)
 */
export const rateLimits = {
  api: 30,
  search: 20,
  mutation: 10,
} as const

/**
 * Pagination defaults
 */
export const pagination = {
  defaultLimit: 20,
  maxLimit: 100,
} as const

/**
 * Search optimization configuration
 */
export const search = {
  /** Threshold for switching from in-memory to database pagination */
  inMemoryThreshold: 1000,
} as const

/**
 * Full config object for convenience
 */
export const config = {
  database,
  server,
  valkey,
  logging,
  rateLimits,
  pagination,
  search,
} as const

export default config
