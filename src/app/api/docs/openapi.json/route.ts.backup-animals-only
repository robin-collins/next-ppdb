import { NextResponse } from 'next/server'

/**
 * OpenAPI JSON Specification Endpoint
 *
 * Returns the OpenAPI 3.0.3 specification as JSON.
 * This can be imported into tools like Postman, Insomnia, or used for code generation.
 */
export async function GET() {
  const spec = {
    openapi: '3.0.3',
    info: {
      title: 'Pampered Pooch Pet Grooming API',
      version: '1.0.0',
      description:
        'RESTful API for managing customers, animals, breeds, and service notes for a pet grooming business',
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
    tags: [
      {
        name: 'Animals',
        description: 'Animal management endpoints',
      },
      {
        name: 'Customers',
        description: 'Customer management endpoints',
      },
      {
        name: 'Breeds',
        description: 'Breed management endpoints',
      },
      {
        name: 'Notes',
        description: 'Service notes management endpoints',
      },
    ],
    paths: {
      '/api/animals': {
        get: {
          operationId: 'searchAnimals',
          summary: 'Search and list animals',
          description:
            'Search animals by name, breed, or customer information with relevance-based ranking. Supports multi-word queries and phone number search.',
          tags: ['Animals'],
          parameters: [
            {
              in: 'query',
              name: 'q',
              schema: { type: 'string' },
              description:
                'Search query - searches across animal name, breed, customer name, email, and phone numbers',
              required: false,
            },
            {
              in: 'query',
              name: 'page',
              schema: { type: 'integer', default: 1, minimum: 1 },
              description: 'Page number for pagination (1-indexed)',
              required: false,
            },
          ],
          responses: {
            200: {
              description: 'List of matching animals sorted by relevance',
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
            400: {
              description: 'Invalid query parameters',
            },
          },
        },
        post: {
          operationId: 'createAnimal',
          summary: 'Create a new animal',
          description: 'Register a new animal for an existing customer',
          tags: ['Animals'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateAnimal' },
              },
            },
          },
          responses: {
            201: {
              description: 'Animal created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Animal' },
                },
              },
            },
            400: {
              description:
                'Invalid request data (validation error or breed not found)',
            },
            404: {
              description: 'Customer not found',
            },
          },
        },
      },
      '/api/animals/{id}': {
        get: {
          operationId: 'getAnimal',
          summary: 'Get a single animal by ID',
          description:
            'Retrieve detailed information about a specific animal including customer details and service notes',
          tags: ['Animals'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string', pattern: '^\\d+$' },
              description: 'Animal ID',
            },
          ],
          responses: {
            200: {
              description: 'Animal details',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Animal' },
                },
              },
            },
            404: {
              description: 'Animal not found',
            },
          },
        },
        put: {
          operationId: 'updateAnimal',
          summary: 'Update an existing animal',
          description:
            'Update one or more fields of an existing animal. All fields are optional.',
          tags: ['Animals'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string', pattern: '^\\d+$' },
              description: 'Animal ID',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateAnimal' },
              },
            },
          },
          responses: {
            200: {
              description: 'Animal updated successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Animal' },
                },
              },
            },
            400: {
              description: 'Invalid request data or breed not found',
            },
            404: {
              description: 'Animal not found',
            },
          },
        },
        delete: {
          operationId: 'deleteAnimal',
          summary: 'Delete an animal',
          description:
            'Permanently delete an animal and its associated service notes',
          tags: ['Animals'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string', pattern: '^\\d+$' },
              description: 'Animal ID',
            },
          ],
          responses: {
            200: {
              description: 'Animal deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                    },
                  },
                },
              },
            },
            404: {
              description: 'Animal not found',
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Animal: {
          type: 'object',
          description:
            'Complete animal record with nested customer, breed, and service notes',
          required: [
            'id',
            'name',
            'breed',
            'breedID',
            'sex',
            'cost',
            'lastVisit',
            'thisVisit',
            'customer',
            'serviceNotes',
          ],
          properties: {
            id: {
              type: 'integer',
              description: 'Animal ID',
            },
            name: {
              type: 'string',
              maxLength: 50,
              description: 'Animal name',
            },
            breed: {
              type: 'string',
              description: 'Breed name',
            },
            breedID: {
              type: 'integer',
              description: 'Breed ID',
            },
            sex: {
              type: 'string',
              enum: ['Male', 'Female', 'Unknown'],
              description: 'Animal sex/gender',
            },
            colour: {
              type: 'string',
              nullable: true,
              description: 'Animal colour/coat color',
            },
            cost: {
              type: 'integer',
              minimum: 0,
              description: 'Service cost in cents or smallest currency unit',
            },
            lastVisit: {
              type: 'string',
              format: 'date-time',
              description: 'Last visit date (ISO 8601 format)',
            },
            thisVisit: {
              type: 'string',
              format: 'date-time',
              description: 'Current visit date (ISO 8601 format)',
            },
            comments: {
              type: 'string',
              nullable: true,
              description: 'Additional comments or notes',
            },
            customer: {
              $ref: '#/components/schemas/CustomerNested',
            },
            serviceNotes: {
              type: 'array',
              items: { $ref: '#/components/schemas/ServiceNote' },
              description: 'History of service notes for this animal',
            },
          },
        },
        CreateAnimal: {
          type: 'object',
          description: 'Data required to create a new animal',
          required: ['customerId', 'name', 'breed', 'sex'],
          properties: {
            customerId: {
              type: 'integer',
              minimum: 1,
              description: 'ID of the customer who owns this animal',
            },
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 50,
              description: 'Animal name',
            },
            breed: {
              type: 'string',
              minLength: 1,
              maxLength: 50,
              description: 'Breed name',
            },
            sex: {
              type: 'string',
              enum: ['Male', 'Female', 'Unknown'],
              description: 'Animal sex/gender',
            },
            colour: {
              type: 'string',
              maxLength: 30,
              description: 'Animal colour/coat color',
            },
            cost: {
              type: 'number',
              minimum: 0,
              description: 'Service cost',
            },
            lastVisit: {
              type: 'string',
              format: 'date-time',
              description: 'Last visit date (ISO 8601 format)',
            },
            thisVisit: {
              type: 'string',
              format: 'date-time',
              description: 'Current visit date (ISO 8601 format)',
            },
            comments: {
              type: 'string',
              maxLength: 1000,
              description: 'Additional comments or notes',
            },
          },
        },
        UpdateAnimal: {
          type: 'object',
          description: 'Partial animal data for updates. All fields optional.',
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 50,
              description: 'Animal name',
            },
            breed: {
              type: 'string',
              minLength: 1,
              maxLength: 50,
              description: 'Breed name',
            },
            sex: {
              type: 'string',
              enum: ['Male', 'Female', 'Unknown'],
              description: 'Animal sex/gender',
            },
            colour: {
              type: 'string',
              maxLength: 30,
              description: 'Animal colour/coat color',
            },
            cost: {
              type: 'number',
              minimum: 0,
              description: 'Service cost',
            },
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
            comments: {
              type: 'string',
              maxLength: 1000,
              description: 'Additional comments',
            },
          },
        },
        CustomerNested: {
          type: 'object',
          description: 'Customer information nested in animal responses',
          properties: {
            id: { type: 'integer', description: 'Customer ID' },
            firstname: {
              type: 'string',
              nullable: true,
              description: 'Customer first name',
            },
            surname: {
              type: 'string',
              description: 'Customer surname/last name',
            },
            email: {
              type: 'string',
              format: 'email',
              nullable: true,
              description: 'Customer email address',
            },
            phone1: {
              type: 'string',
              nullable: true,
              description: 'Primary phone number',
            },
            phone2: {
              type: 'string',
              nullable: true,
              description: 'Secondary phone number',
            },
            phone3: {
              type: 'string',
              nullable: true,
              description: 'Tertiary phone number',
            },
          },
        },
        ServiceNote: {
          type: 'object',
          description: 'Service note for an animal visit',
          properties: {
            noteID: { type: 'integer', description: 'Note ID' },
            notes: { type: 'string', description: 'Service note content' },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Note date (ISO 8601 format)',
            },
          },
        },
      },
    },
  }

  return NextResponse.json(spec)
}
