import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js Middleware - Runs before every request
 *
 * This middleware:
 * 1. Checks if setup is needed and redirects to /setup
 * 2. Logs all API requests automatically (in debug mode)
 */

// Routes that should bypass health check redirect
const SETUP_BYPASS_PATHS = [
  '/setup',
  '/api/setup',
  '/api/health',
  '/_next',
  '/favicon',
  '/images',
  '/api/docs',
]

const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  GET: '\x1b[32m',
  POST: '\x1b[33m',
  PUT: '\x1b[34m',
  DELETE: '\x1b[31m',
  PATCH: '\x1b[35m',
  success: '\x1b[32m',
  clientError: '\x1b[33m',
  serverError: '\x1b[31m',
} as const

function isDebugEnabled(): boolean {
  return process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development'
}

function getTimestamp(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19)
}

function getMethodColor(method: string): string {
  return COLORS[method as keyof typeof COLORS] || COLORS.reset
}

function _getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return COLORS.success
  if (status >= 400 && status < 500) return COLORS.clientError
  if (status >= 500) return COLORS.serverError
  return COLORS.reset
}

/**
 * Check if the current path should bypass setup checks
 */
function shouldBypassSetupCheck(pathname: string): boolean {
  return SETUP_BYPASS_PATHS.some(path => pathname.startsWith(path))
}

/**
 * Quick check if DATABASE_URL is configured
 * This is a fast check that runs in Edge middleware
 */
function isDatabaseConfigured(): boolean {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) return false

  // Basic format validation
  return dbUrl.startsWith('mysql://')
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // === SETUP CHECK ===
  // Skip setup check for allowed paths
  if (!shouldBypassSetupCheck(path)) {
    // Check if setup is needed based on cookie or env
    const setupComplete = request.cookies.get('ppdb_setup_complete')?.value

    // If no setup cookie and database not configured, redirect to setup
    if (!setupComplete && !isDatabaseConfigured()) {
      return NextResponse.redirect(new URL('/setup', request.url))
    }

    // For paths that need full health check, client will verify via /api/health
    // This allows us to avoid blocking requests while still enforcing setup
  }

  // === API LOGGING ===
  // Only log API routes
  if (path.startsWith('/api/') && isDebugEnabled()) {
    const method = request.method
    const query = request.nextUrl.search
    const methodColor = getMethodColor(method)

    // Log request
    console.log(
      `${COLORS.dim}[${getTimestamp()}]${COLORS.reset} ` +
        `${methodColor}${method.padEnd(6)}${COLORS.reset} ` +
        `${path}${query}`
    )
  }

  // Continue with the request
  return NextResponse.next()
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
