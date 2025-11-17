'use client'

/**
 * OpenAPI Documentation Page
 *
 * This page provides interactive API documentation using Swagger UI.
 * Loads the OpenAPI spec from /api/docs/openapi.json endpoint.
 */

import dynamic from 'next/dynamic'
import 'swagger-ui-react/swagger-ui.css'

// Dynamically import Swagger UI (client-side only)
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <SwaggerUI url="/api/docs/openapi.json" />
    </div>
  )
}
