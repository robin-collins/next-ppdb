'use client'

/**
 * OpenAPI Documentation Page
 *
 * This page provides interactive API documentation using Swagger UI.
 * It generates the OpenAPI spec from our Zod schemas and route definitions.
 */

import dynamic from 'next/dynamic'
import 'swagger-ui-react/swagger-ui.css'

// Dynamically import Swagger UI (client-side only)
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })

// Inline OpenAPI spec for testing
const spec = {
  openapi: '3.0.3',
  info: {
    title: 'Pampered Pooch Pet Grooming API',
    version: '1.0.0',
    description:
      'RESTful API for managing customers, animals, breeds, and service notes',
    contact: {
      name: 'Tech Team',
      email: 'tech@pamperedpooch.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
    {
      url: 'https://api.pamperedpooch.com',
      description: 'Production server',
    },
  ],
  paths: {
    '/api/animals': {
      get: {
        operationId: 'searchAnimals',
        summary: 'Search and list animals',
        description:
          'Search animals by name, breed, or customer information with relevance-based ranking',
        tags: ['Animals'],
        parameters: [
          {
            in: 'query',
            name: 'q',
            schema: { type: 'string' },
            description: 'Search query',
          },
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', default: 1 },
            description: 'Page number',
          },
        ],
        responses: {
          200: {
            description: 'List of matching animals',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    animals: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Animal' },
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        page: { type: 'integer' },
                        limit: { type: 'integer' },
                        total: { type: 'integer' },
                        totalPages: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Animal: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Animal ID' },
          name: { type: 'string', description: 'Animal name' },
          breed: { type: 'string', description: 'Breed name' },
          sex: {
            type: 'string',
            enum: ['Male', 'Female', 'Unknown'],
            description: 'Animal sex',
          },
          colour: { type: 'string', nullable: true, description: 'Colour' },
          cost: { type: 'integer', description: 'Service cost' },
          lastVisit: {
            type: 'string',
            format: 'date-time',
            description: 'Last visit date',
          },
          thisVisit: {
            type: 'string',
            format: 'date-time',
            description: 'Current visit date',
          },
          comments: { type: 'string', nullable: true },
          customer: { $ref: '#/components/schemas/CustomerNested' },
        },
      },
      CustomerNested: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          firstname: { type: 'string', nullable: true },
          surname: { type: 'string' },
          email: { type: 'string', format: 'email', nullable: true },
        },
      },
    },
  },
}

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <SwaggerUI spec={spec} />
    </div>
  )
}
