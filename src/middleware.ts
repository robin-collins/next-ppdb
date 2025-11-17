import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js Middleware - Runs before every request
 *
 * This middleware logs all API requests automatically without
 * needing to wrap individual route handlers.
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

export function middleware(request: NextRequest) {
  // Only log API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  if (!isDebugEnabled()) {
    return NextResponse.next()
  }

  const _startTime = Date.now()
  const method = request.method
  const path = request.nextUrl.pathname
  const query = request.nextUrl.search
  const methodColor = getMethodColor(method)

  // Log request
  console.log(
    `${COLORS.dim}[${getTimestamp()}]${COLORS.reset} ` +
      `${methodColor}${method.padEnd(6)}${COLORS.reset} ` +
      `${path}${query}`
  )

  // Continue with the request
  const response = NextResponse.next()

  // Note: We can't easily log the response here because Next.js
  // middleware doesn't have access to the final response status.
  // SQL queries are logged via Prisma's event system in prisma.ts

  return response
}

// Configure which routes use this middleware
export const config = {
  matcher: '/api/:path*',
}
