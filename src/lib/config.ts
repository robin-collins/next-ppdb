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
 * Scheduler configuration
 */
export const scheduler = {
  get apiKey(): string | undefined {
    return process.env.SCHEDULER_API_KEY
  },
  get appVersion(): string {
    return (
      process.env.APP_VERSION || process.env.NEXT_PUBLIC_APP_VERSION || '0.0.0'
    )
  },
  get isConfigured(): boolean {
    return !!process.env.SCHEDULER_API_KEY
  },
}

/**
 * SMTP / Email configuration
 */
export const smtp = {
  get host(): string | undefined {
    return process.env.SMTP_HOST
  },
  get port(): number {
    return parseInt(process.env.SMTP_PORT || '587', 10)
  },
  get user(): string | undefined {
    return process.env.SMTP_USER
  },
  get password(): string | undefined {
    return process.env.SMTP_PASS
  },
  get from(): string | undefined {
    return process.env.SMTP_FROM
  },
  get isConfigured(): boolean {
    return !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    )
  },
  get updateNotificationEmail(): string | undefined {
    return process.env.UPDATE_NOTIFICATION_EMAIL
  },
  get backupNotificationEmail(): string | undefined {
    return process.env.BACKUP_NOTIFICATION_EMAIL
  },
}

/**
 * GitHub Container Registry configuration
 */
export const ghcr = {
  get token(): string | undefined {
    return process.env.GHCR_TOKEN
  },
  get repository(): string {
    return process.env.GHCR_REPOSITORY || 'robin-collins/next-ppdb'
  },
  get image(): string {
    return `ghcr.io/${this.repository}`
  },
  get isConfigured(): boolean {
    return !!process.env.GHCR_TOKEN
  },
}

/**
 * GitHub API configuration (for release notes)
 */
export const github = {
  get token(): string | undefined {
    return process.env.GITHUB_TOKEN
  },
  get isConfigured(): boolean {
    return !!process.env.GITHUB_TOKEN
  },
}

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
  scheduler,
  smtp,
  ghcr,
  github,
} as const

export default config
