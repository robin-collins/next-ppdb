/**
 * Environment Variable Validation
 *
 * Validates all required environment variables at startup using Zod.
 * This ensures the application fails fast with clear error messages
 * if configuration is invalid.
 */

import { z } from 'zod'

// Environment schema with validation rules
const envSchema = z
  .object({
    // Database - Required
    DATABASE_URL: z
      .string()
      .url()
      .refine(url => url.startsWith('mysql://'), {
        message: 'DATABASE_URL must start with mysql://',
      })
      .describe('MySQL database connection URL'),

    // Node Environment
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development')
      .describe('Node environment'),

    // Optional: Debug mode
    DEBUG: z
      .string()
      .optional()
      .transform(val => val === 'true')
      .describe('Enable debug logging'),

    // Optional: Valkey/Redis for rate limiting
    VALKEY_HOST: z
      .string()
      .optional()
      .describe(
        'Valkey host for rate limiting (defaults to valkey in Docker Compose)'
      ),

    VALKEY_PORT: z
      .string()
      .optional()
      .default('6379')
      .transform(Number)
      .pipe(z.number().int().positive())
      .describe('Valkey port'),

    // Optional: Server config
    PORT: z
      .string()
      .optional()
      .default('3000')
      .transform(Number)
      .pipe(z.number().int().positive())
      .describe('Server port'),

    HOSTNAME: z
      .string()
      .optional()
      .default('0.0.0.0')
      .describe('Server hostname'),
  })
  .refine(
    data => {
      // Validate DATABASE_URL format more strictly
      try {
        const url = new URL(data.DATABASE_URL)
        if (!url.hostname || !url.pathname.slice(1)) {
          return false
        }
        return true
      } catch {
        return false
      }
    },
    {
      message: 'DATABASE_URL must include host and database name',
      path: ['DATABASE_URL'],
    }
  )

// Type for the validated environment
export type Env = z.infer<typeof envSchema>

// Singleton for the validated environment
let validatedEnv: Env | null = null

/**
 * Parse and validate environment variables
 * Throws ZodError if validation fails
 */
export function parseEnv(): Env {
  if (validatedEnv) {
    return validatedEnv
  }

  validatedEnv = envSchema.parse(process.env)
  return validatedEnv
}

/**
 * Get the validated environment (call parseEnv first)
 * Throws if environment hasn't been validated yet
 */
export function getEnv(): Env {
  if (!validatedEnv) {
    throw new Error(
      'Environment not validated. Call parseEnv() or validateEnvironment() first.'
    )
  }
  return validatedEnv
}

/**
 * Check if environment has been validated
 */
export function isEnvValidated(): boolean {
  return validatedEnv !== null
}

/**
 * Validate environment and log errors if invalid
 * Returns true if valid, false otherwise
 */
export function validateEnvironment(): boolean {
  try {
    parseEnv()

    // Log success in development
    if (process.env.NODE_ENV === 'development') {
      console.log('✓ Environment validation successful')
    }

    return true
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('\n❌ Environment Configuration Errors:\n')
      error.issues.forEach(issue => {
        console.error(`  • ${issue.path.join('.')}: ${issue.message}`)
      })
      console.error('\n📝 Check your .env file and compare with .env.example\n')
    } else {
      console.error('Environment validation failed:', error)
    }

    return false
  }
}

/**
 * Validate environment and exit process if invalid
 * Use this for server startup
 */
export function validateEnvironmentOrExit(): void {
  if (!validateEnvironment()) {
    process.exit(1)
  }
}

// Export schema for testing
export { envSchema }
