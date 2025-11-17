/**
 * API Test Helpers
 *
 * Utilities for testing Next.js API route handlers.
 * Provides helper functions to create mock requests and responses.
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * Options for creating a mock request
 */
interface MockRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: Record<string, unknown> | string
  headers?: Record<string, string>
  query?: Record<string, string>
  params?: Record<string, string>
}

/**
 * Create a mock Next.js request for testing API routes
 */
export function createMockRequest(
  url: string,
  options: MockRequestOptions = {}
): NextRequest {
  const {
    method = 'GET',
    body,
    headers = {},
    query = {},
    params = {},
  } = options

  // Build URL with query parameters
  const urlObj = new URL(url, 'http://localhost:3000')
  Object.entries(query).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value)
  })

  // Create request init object
  const requestInit: {
    method: string
    headers: Record<string, string>
    body?: string
  } = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  // Add body for POST/PUT/PATCH requests
  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    requestInit.body = typeof body === 'string' ? body : JSON.stringify(body)
  }

  // Create NextRequest (cast to avoid type mismatch between Node.js and Next.js RequestInit)
  const request = new NextRequest(
    urlObj.toString(),
    requestInit as unknown as RequestInit
  )

  // Add params to request (for dynamic routes)
  // @ts-expect-error - Adding params property for testing
  request.params = params

  return request
}

/**
 * Parse response and return JSON data
 */
export async function parseResponseJSON(response: Response) {
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

/**
 * Test an API route handler and return the response
 */
export async function testApiRoute(
  handler: (request: NextRequest) => Promise<Response>,
  request: NextRequest
): Promise<{
  response: Response
  status: number
  data: unknown
  text: string
}> {
  try {
    const response = await handler(request)
    const text = await response.text()
    let data: unknown = null

    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }

    return {
      response,
      status: response.status,
      data,
      text,
    }
  } catch (error) {
    throw error
  }
}

/**
 * Assert response is successful (2xx status)
 */
export function assertResponseSuccess(response: Response): void {
  expect(response.status).toBeGreaterThanOrEqual(200)
  expect(response.status).toBeLessThan(300)
}

/**
 * Assert response is an error (4xx or 5xx status)
 */
export function assertResponseError(
  response: Response,
  expectedStatus?: number
): void {
  if (expectedStatus) {
    expect(response.status).toBe(expectedStatus)
  } else {
    expect(response.status).toBeGreaterThanOrEqual(400)
  }
}

/**
 * Assert response has expected JSON structure
 */
export function assertResponseJSON(
  data: unknown,
  expectedShape: Record<string, unknown>
): void {
  expect(data).toMatchObject(expectedShape)
}

/**
 * Create a mock response for testing
 */
export function createMockResponse(
  data: unknown,
  status: number = 200,
  headers: Record<string, string> = {}
): Response {
  return NextResponse.json(data, {
    status,
    headers,
  })
}

/**
 * Create a mock error response
 */
export function createMockErrorResponse(
  message: string,
  status: number = 500,
  details?: Record<string, unknown>
): Response {
  return NextResponse.json(
    {
      error: message,
      ...details,
    },
    { status }
  )
}

/**
 * Extract route parameters from URL pattern
 * Example: extractParams('/api/animals/123', '/api/animals/[id]') => { id: '123' }
 */
export function extractParams(
  actualUrl: string,
  patternUrl: string
): Record<string, string> {
  const actualParts = actualUrl.split('/').filter(Boolean)
  const patternParts = patternUrl.split('/').filter(Boolean)
  const params: Record<string, string> = {}

  patternParts.forEach((part, index) => {
    if (part.startsWith('[') && part.endsWith(']')) {
      const paramName = part.slice(1, -1)
      params[paramName] = actualParts[index]
    }
  })

  return params
}

/**
 * Create a mock context for API route with params
 */
export function createMockContext(params: Record<string, string>): {
  params: Record<string, string>
} {
  return { params }
}
