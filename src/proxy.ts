import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js Middleware - Runs before every request
 *
 * This middleware:
 * 1. Sets x-pathname header for server components (SetupGuard)
 * 2. Logs all API requests automatically (in debug mode)
 *
 * Note: Database health checks are handled by SetupGuard component
 * which runs as a server component wrapper in the root layout.
 */

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

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Create response with pathname header for SetupGuard
  const response = NextResponse.next()
  response.headers.set('x-pathname', path)

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

  return response
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
