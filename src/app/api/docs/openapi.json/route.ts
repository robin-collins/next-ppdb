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
        'RESTful API for managing customers, animals, breeds, service notes, reports, and administrative operations for a pet grooming business. Includes 20 fully documented endpoints with comprehensive CRUD operations and business intelligence features.',
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
            'Permanently delete a customer and optionally their associated animals',
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
              description: 'Customer deleted successfully',
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
            'Permanently delete a breed (fails if animals are associated)',
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
              description: 'Breed deleted successfully',
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
            400: {
              description: 'Cannot delete breed with associated animals',
            },
            404: {
              description: 'Breed not found',
            },
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
          operationId: 'getDatabaseBackup',
          summary: 'Get database backup',
          description:
            'Generate and download a complete database backup in SQL format',
          tags: ['Admin'],
          responses: {
            200: {
              description: 'Database backup file',
              content: {
                'application/sql': {
                  schema: {
                    type: 'string',
                    format: 'binary',
                    description: 'SQL backup file',
                  },
                },
              },
            },
            500: {
              description: 'Backup generation failed',
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
      },
    },
  }

  return NextResponse.json(spec)
}
