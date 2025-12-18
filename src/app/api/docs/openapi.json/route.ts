import { NextResponse } from 'next/server'
import packageJson from '../../../../../package.json'

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
      version: packageJson.version,
      description:
        'RESTful API for managing customers, animals, breeds, service notes, reports, and administrative operations for a pet grooming business. Includes 35 fully documented operations across CRUD endpoints, count utilities, business intelligence features, health monitoring, and database setup/import capabilities.',
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
      {
        name: 'Reports',
        description: 'Reporting and analytics endpoints',
      },
      {
        name: 'Admin',
        description: 'Administrative operations',
      },
      {
        name: 'Health',
        description: 'Application health and diagnostics',
      },
      {
        name: 'Setup',
        description: 'Database setup and import operations',
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
      '/api/customers': {
        get: {
          operationId: 'searchCustomers',
          summary: 'Search and list customers',
          description:
            'Search customers by name, phone, email, or suburb with relevance-based ranking',
          tags: ['Customers'],
          parameters: [
            {
              in: 'query',
              name: 'q',
              schema: { type: 'string' },
              description: 'Search query',
              required: false,
            },
            {
              in: 'query',
              name: 'page',
              schema: { type: 'integer', default: 1, minimum: 1 },
              description: 'Page number',
              required: false,
            },
            {
              in: 'query',
              name: 'limit',
              schema: {
                type: 'integer',
                default: 20,
                minimum: 1,
                maximum: 100,
              },
              description: 'Items per page',
              required: false,
            },
          ],
          responses: {
            200: {
              description: 'List of matching customers',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      customers: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Customer' },
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
          operationId: 'createCustomer',
          summary: 'Create a new customer',
          description: 'Register a new customer in the system',
          tags: ['Customers'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateCustomer' },
              },
            },
          },
          responses: {
            201: {
              description: 'Customer created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Customer' },
                },
              },
            },
            400: {
              description: 'Invalid request data',
            },
          },
        },
      },
      '/api/customers/{id}': {
        get: {
          operationId: 'getCustomer',
          summary: 'Get a single customer by ID',
          description:
            'Retrieve detailed information about a specific customer including their animals',
          tags: ['Customers'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string', pattern: '^\\d+$' },
              description: 'Customer ID',
            },
          ],
          responses: {
            200: {
              description: 'Customer details',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Customer' },
                },
              },
            },
            404: {
              description: 'Customer not found',
            },
          },
        },
        put: {
          operationId: 'updateCustomer',
          summary: 'Update an existing customer',
          description: 'Update one or more fields of an existing customer',
          tags: ['Customers'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string', pattern: '^\\d+$' },
              description: 'Customer ID',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateCustomer' },
              },
            },
          },
          responses: {
            200: {
              description: 'Customer updated successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Customer' },
                },
              },
            },
            400: {
              description: 'Invalid request data',
            },
            404: {
              description: 'Customer not found',
            },
          },
        },
        delete: {
          operationId: 'deleteCustomer',
          summary: 'Delete a customer',
          description:
            'Permanently delete a customer with options to migrate or delete associated animals. Animals can be selectively migrated to another customer.',
          tags: ['Customers'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string', pattern: '^\\d+$' },
              description: 'Customer ID',
            },
          ],
          requestBody: {
            required: false,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    migrateToCustomerId: {
                      type: 'integer',
                      description:
                        'Target customer ID to migrate selected animals to',
                    },
                    animalIds: {
                      type: 'array',
                      items: { type: 'integer' },
                      description:
                        'Array of animal IDs to migrate (others will be deleted)',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Customer deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      migratedAnimals: {
                        type: 'integer',
                        description:
                          'Number of animals migrated to target customer',
                      },
                      deletedAnimals: {
                        type: 'integer',
                        description:
                          'Number of animals deleted with the customer',
                      },
                    },
                  },
                },
              },
            },
            404: {
              description: 'Customer not found',
            },
          },
        },
      },
      '/api/breeds': {
        get: {
          operationId: 'listBreeds',
          summary: 'List all breeds',
          description:
            'Get a complete list of all animal breeds, sorted alphabetically',
          tags: ['Breeds'],
          responses: {
            200: {
              description: 'List of all breeds',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Breed' },
                  },
                },
              },
            },
          },
        },
        post: {
          operationId: 'createBreed',
          summary: 'Create a new breed',
          description: 'Add a new animal breed to the system',
          tags: ['Breeds'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateBreed' },
              },
            },
          },
          responses: {
            201: {
              description: 'Breed created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Breed' },
                },
              },
            },
            400: {
              description: 'Invalid request data',
            },
          },
        },
      },
      '/api/breeds/{id}': {
        get: {
          operationId: 'getBreed',
          summary: 'Get a single breed by ID',
          description: 'Retrieve detailed information about a specific breed',
          tags: ['Breeds'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string', pattern: '^\\d+$' },
              description: 'Breed ID',
            },
          ],
          responses: {
            200: {
              description: 'Breed details',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Breed' },
                },
              },
            },
            404: {
              description: 'Breed not found',
            },
          },
        },
        put: {
          operationId: 'updateBreed',
          summary: 'Update an existing breed',
          description: 'Update one or more fields of an existing breed',
          tags: ['Breeds'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string', pattern: '^\\d+$' },
              description: 'Breed ID',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateBreed' },
              },
            },
          },
          responses: {
            200: {
              description: 'Breed updated successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Breed' },
                },
              },
            },
            400: {
              description: 'Invalid request data',
            },
            404: {
              description: 'Breed not found',
            },
          },
        },
        delete: {
          operationId: 'deleteBreed',
          summary: 'Delete a breed',
          description:
            'Permanently delete a breed. Animals can be migrated to another breed, otherwise deletion fails if animals are associated.',
          tags: ['Breeds'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string', pattern: '^\\d+$' },
              description: 'Breed ID',
            },
          ],
          requestBody: {
            required: false,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    migrateToBreedId: {
                      type: 'integer',
                      description:
                        'Target breed ID to migrate animals to before deletion',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Breed deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      migratedAnimals: {
                        type: 'integer',
                        description:
                          'Number of animals migrated to target breed',
                      },
                    },
                  },
                },
              },
            },
            400: {
              description:
                'Cannot delete breed with associated animals (without migration)',
            },
            404: {
              description: 'Breed not found',
            },
          },
        },
      },
      '/api/customers/{id}/animals/count': {
        get: {
          operationId: 'getCustomerAnimalsCount',
          summary: 'Get count of animals for a customer',
          description:
            'Returns the number of animals owned by a specific customer',
          tags: ['Customers'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string', pattern: '^\\d+$' },
              description: 'Customer ID',
            },
          ],
          responses: {
            200: {
              description: 'Animal count',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      count: {
                        type: 'integer',
                        description: 'Number of animals',
                      },
                    },
                  },
                },
              },
            },
            400: { description: 'Invalid customer ID' },
          },
        },
      },
      '/api/animals/{id}/notes/count': {
        get: {
          operationId: 'getAnimalNotesCount',
          summary: 'Get count of notes for an animal',
          description:
            'Returns the number of service notes for a specific animal',
          tags: ['Notes'],
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
              description: 'Note count',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      count: {
                        type: 'integer',
                        description: 'Number of notes',
                      },
                    },
                  },
                },
              },
            },
            400: { description: 'Invalid animal ID' },
          },
        },
      },
      '/api/breeds/{id}/animals/count': {
        get: {
          operationId: 'getBreedAnimalsCount',
          summary: 'Get count of animals using a breed',
          description:
            'Returns the number of animals assigned to a specific breed',
          tags: ['Breeds'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string', pattern: '^\\d+$' },
              description: 'Breed ID',
            },
          ],
          responses: {
            200: {
              description: 'Animal count',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      count: {
                        type: 'integer',
                        description: 'Number of animals using this breed',
                      },
                    },
                  },
                },
              },
            },
            400: { description: 'Invalid breed ID' },
          },
        },
      },
      '/api/animals/{id}/notes': {
        get: {
          operationId: 'listAnimalNotes',
          summary: "List an animal's service notes",
          description:
            'Retrieve all service notes for a specific animal, ordered by date descending',
          tags: ['Notes'],
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
              description: "List of animal's service notes",
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Note' },
                  },
                },
              },
            },
            404: {
              description: 'Animal not found',
            },
          },
        },
        post: {
          operationId: 'createAnimalNote',
          summary: 'Create a service note for an animal',
          description: 'Add a new service note to an animal',
          tags: ['Notes'],
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
                schema: {
                  type: 'object',
                  required: ['notes'],
                  properties: {
                    notes: {
                      type: 'string',
                      description: 'Service note content',
                    },
                    serviceDate: {
                      type: 'string',
                      format: 'date-time',
                      description:
                        'Date of service (defaults to current date if not provided)',
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Note created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Note' },
                },
              },
            },
            400: {
              description: 'Invalid request data',
            },
            404: {
              description: 'Animal not found',
            },
          },
        },
      },
      '/api/notes/{noteId}': {
        get: {
          operationId: 'getNote',
          summary: 'Get a single service note by ID',
          description: 'Retrieve a specific service note',
          tags: ['Notes'],
          parameters: [
            {
              in: 'path',
              name: 'noteId',
              required: true,
              schema: { type: 'string', pattern: '^\\d+$' },
              description: 'Note ID',
            },
          ],
          responses: {
            200: {
              description: 'Note details',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Note' },
                },
              },
            },
            404: {
              description: 'Note not found',
            },
          },
        },
        put: {
          operationId: 'updateNote',
          summary: 'Update an existing service note',
          description: 'Update the content or date of a service note',
          tags: ['Notes'],
          parameters: [
            {
              in: 'path',
              name: 'noteId',
              required: true,
              schema: { type: 'string', pattern: '^\\d+$' },
              description: 'Note ID',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateNote' },
              },
            },
          },
          responses: {
            200: {
              description: 'Note updated successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Note' },
                },
              },
            },
            400: {
              description: 'Invalid request data',
            },
            404: {
              description: 'Note not found',
            },
          },
        },
        delete: {
          operationId: 'deleteNote',
          summary: 'Delete a service note',
          description: 'Permanently delete a service note',
          tags: ['Notes'],
          parameters: [
            {
              in: 'path',
              name: 'noteId',
              required: true,
              schema: { type: 'string', pattern: '^\\d+$' },
              description: 'Note ID',
            },
          ],
          responses: {
            200: {
              description: 'Note deleted successfully',
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
              description: 'Note not found',
            },
          },
        },
      },
      '/api/customers/history': {
        get: {
          operationId: 'getCustomerHistory',
          summary: 'Get customer visit history',
          description:
            'Retrieve historical visit data for all customers with aggregated statistics',
          tags: ['Customers'],
          responses: {
            200: {
              description: 'Customer history data',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        customerID: {
                          type: 'integer',
                          description: 'Customer ID',
                        },
                        surname: {
                          type: 'string',
                          description: 'Customer surname',
                        },
                        firstname: {
                          type: 'string',
                          nullable: true,
                          description: 'Customer first name',
                        },
                        totalVisits: {
                          type: 'integer',
                          description: 'Total number of visits',
                        },
                        totalSpent: {
                          type: 'number',
                          description: 'Total amount spent',
                        },
                        lastVisitDate: {
                          type: 'string',
                          format: 'date-time',
                          description: 'Date of last visit',
                        },
                        animals: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              animalID: {
                                type: 'integer',
                                description: 'Animal ID',
                              },
                              name: {
                                type: 'string',
                                description: 'Animal name',
                              },
                              breed: {
                                type: 'string',
                                description: 'Breed name',
                              },
                            },
                          },
                          description: 'List of customer animals',
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
      '/api/reports/daily-totals': {
        get: {
          operationId: 'getDailyTotals',
          summary: 'Get daily totals report',
          description:
            'Retrieve aggregated daily service totals including revenue and visit counts',
          tags: ['Reports'],
          parameters: [
            {
              in: 'query',
              name: 'startDate',
              schema: { type: 'string', format: 'date' },
              description: 'Start date for report range (YYYY-MM-DD)',
              required: false,
            },
            {
              in: 'query',
              name: 'endDate',
              schema: { type: 'string', format: 'date' },
              description: 'End date for report range (YYYY-MM-DD)',
              required: false,
            },
          ],
          responses: {
            200: {
              description: 'Daily totals report data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      dateRange: {
                        type: 'object',
                        properties: {
                          start: {
                            type: 'string',
                            format: 'date',
                            description: 'Report start date',
                          },
                          end: {
                            type: 'string',
                            format: 'date',
                            description: 'Report end date',
                          },
                        },
                      },
                      dailyTotals: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            date: {
                              type: 'string',
                              format: 'date',
                              description: 'Date',
                            },
                            totalVisits: {
                              type: 'integer',
                              description: 'Number of visits on this date',
                            },
                            totalRevenue: {
                              type: 'number',
                              description: 'Total revenue for this date',
                            },
                            averageServiceCost: {
                              type: 'number',
                              description: 'Average cost per service',
                            },
                          },
                        },
                        description: 'Daily breakdown of totals',
                      },
                      summary: {
                        type: 'object',
                        properties: {
                          totalVisits: {
                            type: 'integer',
                            description: 'Total visits in date range',
                          },
                          totalRevenue: {
                            type: 'number',
                            description: 'Total revenue in date range',
                          },
                          averageDailyRevenue: {
                            type: 'number',
                            description: 'Average daily revenue',
                          },
                        },
                        description: 'Summary statistics for the date range',
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Invalid date parameters',
            },
          },
        },
      },
      '/api/admin/backup': {
        get: {
          operationId: 'listBackups',
          summary: 'List available backups',
          description:
            'Get a list of all available database backups with metadata',
          tags: ['Admin'],
          responses: {
            200: {
              description: 'List of available backups',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      backups: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            filename: { type: 'string' },
                            timestamp: { type: 'string' },
                            size: { type: 'integer' },
                            createdAt: {
                              type: 'string',
                              format: 'date-time',
                            },
                            downloadUrl: { type: 'string' },
                          },
                        },
                      },
                      maxBackups: { type: 'integer' },
                      backupDir: { type: 'string' },
                    },
                  },
                },
              },
            },
            500: {
              description: 'Failed to list backups',
            },
          },
        },
        post: {
          operationId: 'createBackup',
          summary: 'Create a new database backup',
          description:
            'Create a new database backup using mysqldump, compress to ZIP, and store. Old backups are automatically cleaned up (max 5 kept).',
          tags: ['Admin'],
          responses: {
            200: {
              description: 'Backup created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      filename: { type: 'string' },
                      timestamp: { type: 'string' },
                      sqlSize: {
                        type: 'integer',
                        description: 'Uncompressed SQL size in bytes',
                      },
                      zipSize: {
                        type: 'integer',
                        description: 'Compressed ZIP size in bytes',
                      },
                      downloadUrl: { type: 'string' },
                    },
                  },
                },
              },
            },
            500: {
              description: 'Backup creation failed',
            },
          },
        },
      },
      '/api/admin/backup/download/{filename}': {
        get: {
          operationId: 'downloadBackupFile',
          summary: 'Download a specific backup file',
          description:
            'Download a previously created backup file by filename. Filename must match pattern: YYYYMMDD-HHMMSS-backup.zip',
          tags: ['Admin'],
          parameters: [
            {
              in: 'path',
              name: 'filename',
              required: true,
              schema: {
                type: 'string',
                pattern: '^\\d{8}-\\d{6}-backup\\.zip$',
              },
              description:
                'Backup filename (format: YYYYMMDD-HHMMSS-backup.zip)',
            },
          ],
          responses: {
            200: {
              description: 'Backup ZIP file',
              content: {
                'application/zip': {
                  schema: {
                    type: 'string',
                    format: 'binary',
                    description: 'ZIP backup file',
                  },
                },
              },
            },
            400: {
              description: 'Invalid filename format',
            },
            404: {
              description: 'Backup file not found',
            },
            500: {
              description: 'Download failed',
            },
          },
        },
      },
      '/api/breeds/pricing': {
        post: {
          operationId: 'updateBreedPricing',
          summary: 'Bulk update breed and animal pricing',
          description:
            'Apply a fixed or percentage price adjustment to breed average costs and associated animal costs. Can target a single breed or all breeds.',
          tags: ['Breeds'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['adjustmentType', 'adjustmentValue'],
                  properties: {
                    breedId: {
                      type: 'integer',
                      description:
                        'Optional breed ID to target. If omitted, applies to all breeds.',
                    },
                    adjustmentType: {
                      type: 'string',
                      enum: ['fixed', 'percentage'],
                      description:
                        'Type of price adjustment: fixed dollar amount or percentage',
                    },
                    adjustmentValue: {
                      type: 'number',
                      minimum: 0,
                      description:
                        'Adjustment value (dollar amount for fixed, percentage for percentage)',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Pricing updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      summary: {
                        type: 'object',
                        properties: {
                          breedsUpdated: { type: 'integer' },
                          animalsUpdated: { type: 'integer' },
                          breedDetails: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                id: { type: 'integer' },
                                name: { type: 'string' },
                                oldAvgcost: {
                                  type: 'number',
                                  nullable: true,
                                },
                                newAvgcost: { type: 'number' },
                                animalsUpdated: { type: 'integer' },
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
            400: {
              description: 'Invalid request parameters',
            },
            404: {
              description: 'Breed not found',
            },
            500: {
              description: 'Pricing update failed',
            },
          },
        },
      },
      '/api/reports/analytics': {
        get: {
          operationId: 'getAnalyticsReport',
          summary: 'Get analytics report data',
          description:
            'Retrieve analytics data aggregated by period (daily, weekly, monthly, yearly) with breed breakdowns and revenue summaries',
          tags: ['Reports'],
          parameters: [
            {
              in: 'query',
              name: 'period',
              required: true,
              schema: {
                type: 'string',
                enum: ['daily', 'weekly', 'monthly', 'yearly'],
              },
              description:
                'Aggregation period: daily (7 days), weekly (8 weeks), monthly (6 months), yearly (3 years)',
            },
            {
              in: 'query',
              name: 'endDate',
              required: true,
              schema: { type: 'string', format: 'date' },
              description: 'End date for the report range (YYYY-MM-DD)',
            },
          ],
          responses: {
            200: {
              description: 'Analytics data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            label: {
                              type: 'string',
                              description: 'Human-readable period label',
                            },
                            dateKey: {
                              type: 'string',
                              description: 'Sortable date key',
                            },
                            count: {
                              type: 'integer',
                              description: 'Number of animals serviced',
                            },
                            revenue: {
                              type: 'number',
                              description: 'Total revenue for period',
                            },
                            breedBreakdown: {
                              type: 'object',
                              additionalProperties: { type: 'integer' },
                              description: 'Count by breed name',
                            },
                          },
                        },
                      },
                      summary: {
                        type: 'object',
                        properties: {
                          totalRevenue: { type: 'number' },
                          totalAnimals: { type: 'integer' },
                          avgPrice: { type: 'number' },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Invalid parameters',
            },
          },
        },
      },
      '/api/reports/staff-summary': {
        get: {
          operationId: 'getStaffSummary',
          summary: 'Get daily staff work summary',
          description:
            'Retrieve breakdown of animals worked on by each staff member for a specific date, with breed-level details',
          tags: ['Reports'],
          parameters: [
            {
              in: 'query',
              name: 'date',
              required: false,
              schema: { type: 'string', format: 'date' },
              description:
                'Target date (YYYY-MM-DD). Defaults to today if not provided.',
            },
          ],
          responses: {
            200: {
              description: 'Staff work summary',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      date: {
                        type: 'string',
                        format: 'date',
                        description: 'Report date',
                      },
                      staff: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            initials: {
                              type: 'string',
                              description:
                                'Staff member initials (2-3 characters)',
                            },
                            breeds: {
                              type: 'object',
                              additionalProperties: { type: 'integer' },
                              description: 'Animal count by breed name',
                            },
                            totalAnimals: {
                              type: 'integer',
                              description:
                                'Total unique animals worked on by this staff',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Invalid date format',
            },
          },
        },
      },
      '/api/health': {
        get: {
          operationId: 'getHealthStatus',
          summary: 'Get application health status',
          description:
            'Run diagnostics and return application health status including database connectivity, schema validation, and data presence',
          tags: ['Health'],
          responses: {
            200: {
              description: 'Application is healthy',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/HealthStatus' },
                },
              },
            },
            500: {
              description: 'Application is unhealthy',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/HealthStatus' },
                },
              },
            },
            503: {
              description: 'Application needs setup',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/HealthStatus' },
                },
              },
            },
          },
        },
        post: {
          operationId: 'refreshHealthStatus',
          summary: 'Refresh health status',
          description:
            'Clear diagnostic cache and re-run health checks. Useful after setup completes.',
          tags: ['Health'],
          responses: {
            200: {
              description: 'Diagnostics refreshed',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
                      result: { $ref: '#/components/schemas/HealthStatus' },
                    },
                  },
                },
              },
            },
            500: {
              description: 'Failed to refresh diagnostics',
            },
          },
        },
      },
      '/api/setup/upload': {
        post: {
          operationId: 'uploadBackupFile',
          summary: 'Upload database backup for import',
          description:
            'Upload a database backup file (.sql, .zip, .tar.gz, .tgz) for import. Returns upload ID and detected SQL files.',
          tags: ['Setup'],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['file'],
                  properties: {
                    file: {
                      type: 'string',
                      format: 'binary',
                      description:
                        'Backup file (.sql, .zip, .tar.gz, .tgz). Max 100MB.',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'File uploaded successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      uploadId: {
                        type: 'string',
                        description: 'Unique ID for this upload session',
                      },
                      filename: { type: 'string' },
                      fileType: { type: 'string' },
                      size: { type: 'integer' },
                      sqlFiles: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            table: { type: 'string' },
                            path: { type: 'string' },
                            filename: { type: 'string' },
                          },
                        },
                      },
                      backupPath: { type: 'string', nullable: true },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Invalid file type or size',
            },
            500: {
              description: 'Upload failed',
            },
          },
        },
      },
      '/api/setup/import': {
        get: {
          operationId: 'importDatabase',
          summary: 'Import database from uploaded backup',
          description:
            'Stream database import progress via Server-Sent Events. Requires uploadId from /api/setup/upload.',
          tags: ['Setup'],
          parameters: [
            {
              in: 'query',
              name: 'uploadId',
              required: true,
              schema: { type: 'string' },
              description: 'Upload ID from /api/setup/upload response',
            },
          ],
          responses: {
            200: {
              description: 'Server-Sent Events stream with import progress',
              content: {
                'text/event-stream': {
                  schema: {
                    type: 'string',
                    description:
                      'SSE stream with events: progress, log, batch, table_complete, complete, error',
                  },
                },
              },
            },
            400: {
              description: 'Missing uploadId',
            },
            404: {
              description: 'Upload not found or no SQL files found',
            },
          },
        },
      },
      '/api/admin/notifications': {
        get: {
          operationId: 'listNotifications',
          summary: 'List system notifications',
          description:
            'Retrieve a list of system notifications with optional filtering by status',
          tags: ['Admin'],
          parameters: [
            {
              in: 'query',
              name: 'status',
              schema: {
                type: 'string',
                enum: ['current', 'archived', 'unread', 'read'],
              },
              description: 'Filter by notification status',
              required: false,
            },
            {
              in: 'query',
              name: 'summary',
              schema: { type: 'boolean' },
              description: 'Return only summary counts if true',
              required: false,
            },
          ],
          responses: {
            200: {
              description: 'List of notifications',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      notifications: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Notification' },
                      },
                      unreadCount: { type: 'integer' },
                      total: { type: 'integer' },
                    },
                  },
                },
              },
            },
            500: {
              description: 'Server error',
            },
          },
        },
        post: {
          operationId: 'manageNotifications',
          summary: 'Manage notifications',
          description:
            'Perform bulk actions on notifications (mark all read, clear archived)',
          tags: ['Admin'],
          parameters: [
            {
              in: 'query',
              name: 'action',
              schema: {
                type: 'string',
                enum: ['markAllRead', 'clearArchived', 'recalculate'],
              },
              description: 'Action to perform',
              required: true,
            },
          ],
          responses: {
            200: {
              description: 'Action completed successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      count: { type: 'integer' },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Invalid action',
            },
            500: {
              description: 'Server error',
            },
          },
        },
      },
      '/api/admin/notifications/{id}': {
        get: {
          operationId: 'getNotification',
          summary: 'Get single notification',
          description: 'Retrieve details of a specific notification',
          tags: ['Admin'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
              description: 'Notification ID',
            },
          ],
          responses: {
            200: {
              description: 'Notification details',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      notification: {
                        $ref: '#/components/schemas/Notification',
                      },
                    },
                  },
                },
              },
            },
            404: {
              description: 'Notification not found',
            },
            500: {
              description: 'Server error',
            },
          },
        },
        patch: {
          operationId: 'updateNotification',
          summary: 'Update notification',
          description: 'Update notification status (mark as read or archive)',
          tags: ['Admin'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
              description: 'Notification ID',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['action'],
                  properties: {
                    action: {
                      type: 'string',
                      enum: ['read', 'archive'],
                      description: 'Action to perform',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Notification updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      notification: {
                        $ref: '#/components/schemas/Notification',
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Invalid action',
            },
            404: {
              description: 'Notification not found',
            },
          },
        },
        delete: {
          operationId: 'deleteNotification',
          summary: 'Delete notification',
          description: 'Permanently delete an archived notification',
          tags: ['Admin'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
              description: 'Notification ID',
            },
          ],
          responses: {
            200: {
              description: 'Notification deleted',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Notification must be archived before deletion',
            },
            404: {
              description: 'Notification not found',
            },
          },
        },
      },
      '/api/admin/updates/pending': {
        get: {
          operationId: 'getPendingUpdates',
          summary: 'Get pending updates',
          description:
            'Retrieve information about pending updates and update history',
          tags: ['Admin'],
          parameters: [
            {
              in: 'query',
              name: 'history',
              schema: { type: 'boolean' },
              description: 'Include update history',
              required: false,
            },
            {
              in: 'query',
              name: 'limit',
              schema: { type: 'integer', default: 20 },
              description: 'Limit history items',
              required: false,
            },
          ],
          responses: {
            200: {
              description: 'Pending update info',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      pending: {
                        nullable: true,
                        allOf: [{ $ref: '#/components/schemas/Update' }],
                      },
                      lastCheck: {
                        type: 'string',
                        format: 'date-time',
                        nullable: true,
                      },
                      history: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Update' },
                      },
                    },
                  },
                },
              },
            },
            500: {
              description: 'Server error',
            },
          },
        },
      },
      '/api/admin/updates/{id}': {
        get: {
          operationId: 'getUpdate',
          summary: 'Get update details',
          description: 'Retrieve details for a specific update',
          tags: ['Admin'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
              description: 'Update ID',
            },
          ],
          responses: {
            200: {
              description: 'Update details',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      update: { $ref: '#/components/schemas/Update' },
                      source: {
                        type: 'string',
                        enum: ['current', 'history'],
                      },
                    },
                  },
                },
              },
            },
            404: {
              description: 'Update not found',
            },
            500: {
              description: 'Server error',
            },
          },
        },
        delete: {
          operationId: 'cancelUpdate',
          summary: 'Cancel update',
          description: 'Cancel a pending or approved update',
          tags: ['Admin'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
              description: 'Update ID',
            },
          ],
          responses: {
            200: {
              description: 'Update cancelled',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      cancelledUpdate: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          version: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Cannot cancel update in current status',
            },
            404: {
              description: 'Update not found',
            },
            500: {
              description: 'Server error',
            },
          },
        },
      },
      '/api/admin/updates/{id}/approve': {
        post: {
          operationId: 'approveUpdate',
          summary: 'Approve update',
          description: 'Approve a pending update for execution',
          tags: ['Admin'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
              description: 'Update ID',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['approvedBy'],
                  properties: {
                    approvedBy: {
                      type: 'string',
                      description: 'Username of approver',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Update approved',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      update: { $ref: '#/components/schemas/Update' },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Invalid status or request',
            },
            404: {
              description: 'Update not found',
            },
            500: {
              description: 'Server error',
            },
          },
        },
      },
      '/api/admin/updates/execute': {
        post: {
          operationId: 'executeUpdate',
          summary: 'Execute update (Internal)',
          description:
            'Signal scheduler to execute approved update. Internal endpoint used by scheduler.',
          tags: ['Admin'],
          responses: {
            200: {
              description: 'Execution instructions',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      executeUpdate: { type: 'boolean' },
                      update: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          currentVersion: { type: 'string' },
                          newVersion: { type: 'string' },
                        },
                      },
                      instructions: {
                        type: 'object',
                        properties: {
                          pullCommand: { type: 'string' },
                          restartCommand: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized (Scheduler auth required)',
            },
            500: {
              description: 'Server error',
            },
          },
        },
        put: {
          operationId: 'reportUpdateResult',
          summary: 'Report update result (Internal)',
          description:
            'Callback for scheduler to report execution success or failure.',
          tags: ['Admin'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['success', 'updateId'],
                  properties: {
                    success: { type: 'boolean' },
                    updateId: { type: 'string' },
                    duration: { type: 'integer' },
                    error: { type: 'string' },
                    rollbackPerformed: { type: 'boolean' },
                    rollbackDetails: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Result processed',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized',
            },
            404: {
              description: 'Update not found',
            },
            500: {
              description: 'Server error',
            },
          },
        },
      },
      '/api/admin/version-check': {
        get: {
          operationId: 'getVersionCheckStatus',
          summary: 'Get version check status',
          description:
            'Retrieve current app version, last check time, and any pending updates',
          tags: ['Admin'],
          responses: {
            200: {
              description: 'Version check status',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      currentVersion: { type: 'string' },
                      lastCheck: {
                        type: 'string',
                        format: 'date-time',
                        nullable: true,
                      },
                      pendingUpdate: {
                        nullable: true,
                        allOf: [{ $ref: '#/components/schemas/Update' }],
                      },
                    },
                  },
                },
              },
            },
            500: {
              description: 'Server error',
            },
          },
        },
        post: {
          operationId: 'checkForUpdates',
          summary: 'Check for updates',
          description:
            'Trigger a manual check for new application versions on GitHub Container Registry',
          tags: ['Admin'],
          responses: {
            200: {
              description: 'Check completed',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      updateAvailable: { type: 'boolean' },
                      current: { type: 'string' },
                      nextVersion: { type: 'string', nullable: true },
                      pendingUpdateId: { type: 'string', nullable: true },
                      message: { type: 'string', nullable: true },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized (Scheduler auth required)',
            },
            500: {
              description: 'Server error',
            },
          },
        },
      },
      '/api/admin/scheduled-backup': {
        post: {
          operationId: 'triggerScheduledBackup',
          summary: 'Trigger scheduled backup',
          description:
            'Trigger a database backup. Used by scheduler for nightly backups.',
          tags: ['Admin'],
          responses: {
            200: {
              description: 'Backup completed',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      filename: { type: 'string' },
                      sqlSize: { type: 'integer' },
                      zipSize: { type: 'integer' },
                      duration: { type: 'integer' },
                      downloadUrl: { type: 'string' },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized (Scheduler auth required)',
            },
            500: {
              description: 'Server error',
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
        Customer: {
          type: 'object',
          description: 'Complete customer record with optional animals list',
          required: ['id', 'surname'],
          properties: {
            id: {
              type: 'integer',
              description: 'Customer ID',
            },
            surname: {
              type: 'string',
              maxLength: 20,
              description: 'Customer surname/last name',
            },
            firstname: {
              type: 'string',
              maxLength: 20,
              nullable: true,
              description: 'Customer first name',
            },
            address: {
              type: 'string',
              maxLength: 50,
              nullable: true,
              description: 'Street address',
            },
            suburb: {
              type: 'string',
              maxLength: 20,
              nullable: true,
              description: 'Suburb/city',
            },
            postcode: {
              type: 'integer',
              minimum: 0,
              maximum: 9999,
              nullable: true,
              description: 'Postal code (0-9999)',
            },
            phone1: {
              type: 'string',
              maxLength: 10,
              nullable: true,
              description: 'Primary phone number (digits only)',
            },
            phone2: {
              type: 'string',
              maxLength: 10,
              nullable: true,
              description: 'Secondary phone number (digits only)',
            },
            phone3: {
              type: 'string',
              maxLength: 10,
              nullable: true,
              description: 'Tertiary phone number (digits only)',
            },
            email: {
              type: 'string',
              format: 'email',
              maxLength: 200,
              nullable: true,
              description: 'Email address',
            },
            animals: {
              type: 'array',
              items: { $ref: '#/components/schemas/Animal' },
              description: 'List of animals owned by this customer',
            },
            totalNotesCount: {
              type: 'integer',
              description:
                'Total number of service notes across all animals (only in detail response)',
            },
            earliestNoteDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description:
                'Date of earliest service note (only in detail response)',
            },
            latestNoteDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description:
                'Date of most recent service note (only in detail response)',
            },
          },
        },
        CreateCustomer: {
          type: 'object',
          description: 'Data required to create a new customer',
          required: ['surname'],
          properties: {
            surname: {
              type: 'string',
              minLength: 1,
              maxLength: 20,
              description: 'Customer surname/last name (required)',
            },
            firstname: {
              type: 'string',
              maxLength: 20,
              description: 'Customer first name',
            },
            address: {
              type: 'string',
              maxLength: 50,
              description: 'Street address',
            },
            suburb: {
              type: 'string',
              maxLength: 20,
              description: 'Suburb/city',
            },
            postcode: {
              oneOf: [{ type: 'string' }, { type: 'integer' }],
              description: 'Postal code (0-9999, can be string or number)',
            },
            phone1: {
              type: 'string',
              maxLength: 10,
              description: 'Primary phone number',
            },
            phone2: {
              type: 'string',
              maxLength: 10,
              description: 'Secondary phone number',
            },
            phone3: {
              type: 'string',
              maxLength: 10,
              description: 'Tertiary phone number',
            },
            email: {
              type: 'string',
              format: 'email',
              maxLength: 200,
              description: 'Email address',
            },
          },
        },
        UpdateCustomer: {
          type: 'object',
          description:
            'Partial customer data for updates. All fields optional.',
          properties: {
            surname: {
              type: 'string',
              minLength: 1,
              maxLength: 20,
              description: 'Customer surname/last name',
            },
            firstname: {
              type: 'string',
              maxLength: 20,
              description: 'Customer first name',
            },
            address: {
              type: 'string',
              maxLength: 50,
              description: 'Street address',
            },
            suburb: {
              type: 'string',
              maxLength: 20,
              description: 'Suburb/city',
            },
            postcode: {
              oneOf: [{ type: 'string' }, { type: 'integer' }],
              description: 'Postal code',
            },
            phone1: {
              type: 'string',
              maxLength: 10,
              description: 'Primary phone number',
            },
            phone2: {
              type: 'string',
              maxLength: 10,
              description: 'Secondary phone number',
            },
            phone3: {
              type: 'string',
              maxLength: 10,
              description: 'Tertiary phone number',
            },
            email: {
              type: 'string',
              format: 'email',
              maxLength: 200,
              description: 'Email address',
            },
          },
        },
        Breed: {
          type: 'object',
          description: 'Animal breed with optional average time and cost',
          required: ['id', 'name'],
          properties: {
            id: {
              type: 'integer',
              description: 'Breed ID',
            },
            name: {
              type: 'string',
              maxLength: 100,
              description: 'Breed name',
            },
            avgtime: {
              type: 'string',
              nullable: true,
              description:
                'Average grooming time (can be HH:MM:SS format or minutes as string)',
              example: '01:30:00',
            },
            avgcost: {
              type: 'number',
              nullable: true,
              description: 'Average grooming cost',
              example: 50,
            },
          },
        },
        CreateBreed: {
          type: 'object',
          description: 'Data required to create a new breed',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'Breed name (required)',
            },
            avgtime: {
              type: 'string',
              maxLength: 50,
              nullable: true,
              description: 'Average grooming time (HH:MM:SS format or minutes)',
              example: '45',
            },
            avgcost: {
              oneOf: [{ type: 'number' }, { type: 'string' }],
              nullable: true,
              description:
                'Average grooming cost (can be number or numeric string)',
              example: 50,
            },
          },
        },
        UpdateBreed: {
          type: 'object',
          description: 'Partial breed data for updates. All fields optional.',
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'Breed name',
            },
            avgtime: {
              type: 'string',
              maxLength: 50,
              nullable: true,
              description: 'Average grooming time',
            },
            avgcost: {
              oneOf: [{ type: 'number' }, { type: 'string' }],
              nullable: true,
              description: 'Average grooming cost',
            },
          },
        },
        Note: {
          type: 'object',
          description: 'Service note for an animal grooming visit',
          required: ['noteID', 'animalID', 'notes', 'date'],
          properties: {
            noteID: {
              type: 'integer',
              description: 'Note ID',
            },
            animalID: {
              type: 'integer',
              description: 'ID of the animal this note belongs to',
            },
            notes: {
              type: 'string',
              description: 'Service note content',
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Date of the service (ISO 8601 format)',
            },
          },
        },
        UpdateNote: {
          type: 'object',
          description:
            'Partial note data for updates. At least one field required.',
          properties: {
            notes: {
              type: 'string',
              description: 'Service note content',
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Date of the service (ISO 8601 format)',
            },
          },
        },
        HealthStatus: {
          type: 'object',
          description: 'Application health diagnostic result',
          properties: {
            status: {
              type: 'string',
              enum: ['healthy', 'unhealthy', 'needs_setup'],
              description: 'Overall health status',
            },
            checks: {
              type: 'object',
              properties: {
                envConfig: {
                  type: 'object',
                  properties: {
                    passed: { type: 'boolean' },
                    message: { type: 'string' },
                  },
                },
                dbConnection: {
                  type: 'object',
                  properties: {
                    passed: { type: 'boolean' },
                    message: { type: 'string' },
                  },
                },
                tablesExist: {
                  type: 'object',
                  properties: {
                    passed: { type: 'boolean' },
                    message: { type: 'string' },
                  },
                },
                schemaValid: {
                  type: 'object',
                  properties: {
                    passed: { type: 'boolean' },
                    message: { type: 'string' },
                  },
                },
                dataPresent: {
                  type: 'object',
                  properties: {
                    passed: { type: 'boolean' },
                    message: { type: 'string' },
                  },
                },
              },
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp of the health check',
            },
            error: {
              type: 'string',
              nullable: true,
              description: 'Error message if check failed',
            },
          },
        },
        Notification: {
          type: 'object',
          description: 'System notification',
          required: ['id', 'type', 'message', 'createdAt', 'read'],
          properties: {
            id: { type: 'string', description: 'Notification ID' },
            type: {
              type: 'string',
              enum: ['info', 'success', 'warning', 'error'],
              description: 'Notification type',
            },
            title: {
              type: 'string',
              nullable: true,
              description: 'Notification title',
            },
            message: { type: 'string', description: 'Notification content' },
            timestamp: { type: 'integer', description: 'Creation timestamp' },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation date',
            },
            read: { type: 'boolean', description: 'Read status' },
            archived: { type: 'boolean', description: 'Archived status' },
            source: {
              type: 'string',
              nullable: true,
              description: 'Source of notification',
            },
            metadata: {
              type: 'object',
              additionalProperties: true,
              description: 'Additional metadata',
            },
          },
        },
        Update: {
          type: 'object',
          description: 'System update information',
          required: [
            'id',
            'currentVersion',
            'newVersion',
            'status',
            'detectedAt',
          ],
          properties: {
            id: { type: 'string', description: 'Update ID' },
            currentVersion: {
              type: 'string',
              description: 'Current system version',
            },
            newVersion: {
              type: 'string',
              description: 'New available version',
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'APPROVED', 'EXECUTED', 'FAILED'],
              description: 'Update status',
            },
            releaseNotes: {
              type: 'string',
              nullable: true,
              description: 'Release notes in markdown',
            },
            releaseTitle: {
              type: 'string',
              nullable: true,
              description: 'Release title',
            },
            releaseUrl: {
              type: 'string',
              nullable: true,
              description: 'GitHub release URL',
            },
            detectedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date update was detected',
            },
            approvedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Date update was approved',
            },
            approvedBy: {
              type: 'string',
              nullable: true,
              description: 'User who approved the update',
            },
            executedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Date update was executed',
            },
            executionDuration: {
              type: 'integer',
              nullable: true,
              description: 'Execution time in ms',
            },
            errorMessage: {
              type: 'string',
              nullable: true,
              description: 'Error message if failed',
            },
            rollbackPerformed: {
              type: 'boolean',
              nullable: true,
              description: 'Whether rollback was performed',
            },
          },
        },
      },
    },
  }

  return NextResponse.json(spec)
}
