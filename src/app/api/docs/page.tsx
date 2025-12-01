'use client'

/**
 * OpenAPI Documentation Page
 *
 * This page provides interactive API documentation using Swagger UI.
 * Loads the OpenAPI spec from /api/docs/openapi.json endpoint.
 *
 * Note: swagger-ui-react uses deprecated lifecycle methods (UNSAFE_componentWillReceiveProps)
 * in its ModelCollapse component. This is a known library issue that doesn't affect functionality.
 * The warning is suppressed at module level to catch it before React strict mode warnings fire.
 */

import dynamic from 'next/dynamic'
import 'swagger-ui-react/swagger-ui.css'

// Suppress swagger-ui-react deprecation warnings at module level (before component mounts)
// This must run before SwaggerUI loads to catch React strict mode warnings
if (typeof window !== 'undefined') {
  const originalError = console.error
  console.error = (...args: unknown[]) => {
    const message = args[0]
    if (
      typeof message === 'string' &&
      message.includes('UNSAFE_componentWillReceiveProps') &&
      message.includes('ModelCollapse')
    ) {
      return // Suppress this specific swagger-ui warning
    }
    originalError.apply(console, args)
  }
}

// Dynamically import Swagger UI (client-side only)
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <SwaggerUI url="/api/docs/openapi.json" />
    </div>
  )
}
