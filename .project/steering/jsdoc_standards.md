# OpenAPI Documentation Standards

**Versions**: `@omer-x/next-openapi-route-handler@^2.0.0`, `@omer-x/next-openapi-json-generator@^2.0.2`, `zod@^4.0.17`, `next@15.4.5`

All API routes must use programmatic OpenAPI with `defineRoute()` and Zod schemas for automatic validation, type safety, and documentation generation.

## 1. Basic Structure and Format

Every route uses `defineRoute()` from `@omer-x/next-openapi-route-handler`. DTOs are defined in `src/lib/openapi/models/`.

```typescript
import { defineRoute } from '@omer-x/next-openapi-route-handler'
import { NextResponse } from 'next/server'
import { ResourceDTO } from '@/lib/openapi/models/resource'

export const GET = defineRoute(
  {
    operationId: 'getResource',
    summary: 'Brief description',
    tags: ['Resources'],
  },
  async request => {
    return NextResponse.json(data)
  }
)
```

## 2. Creating DTOs with Zod

DTOs must be created in `src/lib/openapi/models/` using Zod schemas. These serve as both validation and documentation.

```typescript
// src/lib/openapi/models/animal.ts
import { z } from 'zod'

export const AnimalDTO = z.object({
  id: z.number().describe('Unique animal identifier'),
  name: z.string().max(12).describe('Animal name'),
  sex: z.enum(['Male', 'Female']).describe('Animal sex'),
  breed: z.string().describe('Breed name'),
  lastVisit: z.string().datetime().describe('Last visit date (ISO 8601)'),
})

export const CreateAnimalDTO = AnimalDTO.omit({ id: true }).extend({
  customerId: z.number().describe('Customer ID'),
})

export const UpdateAnimalDTO = CreateAnimalDTO.partial()

export const AnimalSearchQuery = z.object({
  q: z.string().optional().describe('Search query'),
})
```

**Key Guidelines**:

- Use `.describe()` on every field for OpenAPI documentation
- Use `.datetime()` for ISO 8601 dates
- Create separate DTOs for create/update operations
- Use `.partial()` for update DTOs
- Export all DTOs for use in `generateOpenApiSpec()`

## 3. defineRoute Configuration

### 3.1 Required Fields

Every `defineRoute()` call must include:

```typescript
export const GET = defineRoute({
  operationId: 'uniqueOperationName',  // Unique across all routes
  summary: 'Brief single-line description',
  description: 'Detailed explanation of functionality, behaviors, and side effects',
  tags: ['CategoryName'],
}, async (request) => { ... })
```

### 3.2 Tags for Categorization

Each endpoint must be assigned at least one tag. Use multiple tags when appropriate:

- `Animals` - Animal management endpoints
- `Customers` - Customer management endpoints
- `Breeds` - Breed management endpoints
- `Notes` - Service notes endpoints
- `Authentication` - Auth endpoints (if implemented)
- `System` - Health checks, configuration

**Example**:

```typescript
tags: ['Animals'],  // Single tag
tags: ['Animals', 'API'],  // Multiple tags
```

## 4. Parameters Documentation

### 4.1 Query Parameters

Use `queryParams` with a Zod schema:

```typescript
export const GET = defineRoute({
  operationId: 'searchAnimals',
  queryParams: AnimalSearchQuery,  // z.object({ q: z.string().optional() })
  ...
}, async (request) => {
  const { q } = request.queryParams  // Type-safe!
})
```

### 4.2 Path Parameters

Use `pathParams` with a Zod schema:

```typescript
export const GET = defineRoute({
  operationId: 'getAnimal',
  pathParams: z.object({
    id: z.string().describe('Animal ID')
  }),
  ...
}, async (request) => {
  const { id } = request.pathParams  // Type-safe!
})
```

### 4.3 Request Body

Use `requestBody` with a Zod schema:

```typescript
export const POST = defineRoute(
  {
    operationId: 'createAnimal',
    requestBody: {
      required: true,
      content: {
        'application/json': { schema: CreateAnimalDTO },
      },
    },
  },
  async request => {
    const data = request.body // Validated & type-safe!
  }
)
```

## 5. Response Documentation

### 5.1 Defining Responses

Document all possible status codes:

```typescript
export const GET = defineRoute({
  operationId: 'getAnimal',
  responses: {
    200: {
      description: 'Animal found',
      content: {
        'application/json': { schema: AnimalDTO }
      }
    },
    404: {
      description: 'Animal not found'
    },
    500: {
      description: 'Server error'
    }
  },
}, async (request) => { ... })
```

### 5.2 Common Status Codes

- `200` - Successful GET/PUT
- `201` - Successful POST (resource created)
- `204` - Successful DELETE (no content)
- `400` - Validation error
- `404` - Resource not found
- `500` - Server error

## 6. Generating OpenAPI Documentation

### 6.1 Create Documentation Page

Create `src/app/api/docs/page.tsx`:

```typescript
import generateOpenApiSpec from '@omer-x/next-openapi-json-generator'
import dynamic from 'next/dynamic'
import { AnimalDTO, CreateAnimalDTO, UpdateAnimalDTO } from '@/lib/openapi/models/animal'
// Import all DTOs...

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })
import 'swagger-ui-react/swagger-ui.css'

export default async function ApiDocsPage() {
  const spec = await generateOpenApiSpec({
    AnimalDTO, CreateAnimalDTO, UpdateAnimalDTO,
    // All DTOs...
  }, {
    include: ['/api/'],
    exclude: ['/api/docs']
  })

  spec.info = {
    title: 'Pampered Pooch API',
    version: '1.0.0',
    description: 'Pet grooming database API'
  }

  return <SwaggerUI spec={spec} />
}
```

### 6.2 Create JSON Endpoint

Create `src/app/api/docs/openapi.json/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import generateOpenApiSpec from '@omer-x/next-openapi-json-generator'
// Import all DTOs...

export async function GET() {
  const spec = await generateOpenApiSpec(
    {
      /* DTOs */
    },
    {
      /* options */
    }
  )
  spec.info = { title: 'Pampered Pooch API', version: '1.0.0' }
  return NextResponse.json(spec)
}
```

## 7. Complete Route Example

```typescript
// src/app/api/animals/route.ts
import { defineRoute } from '@omer-x/next-openapi-route-handler'
import { NextResponse } from 'next/server'
import {
  AnimalDTO,
  CreateAnimalDTO,
  AnimalSearchQuery,
} from '@/lib/openapi/models/animal'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const GET = defineRoute(
  {
    operationId: 'searchAnimals',
    summary: 'Search and list animals',
    description: 'Search animals by name, breed, or customer information',
    tags: ['Animals'],
    queryParams: AnimalSearchQuery,
    responses: {
      200: {
        description: 'List of matching animals',
        content: {
          'application/json': { schema: z.array(AnimalDTO) },
        },
      },
    },
  },
  async request => {
    const { q } = request.queryParams
    // Implementation...
    return NextResponse.json(results)
  }
)

export const POST = defineRoute(
  {
    operationId: 'createAnimal',
    summary: 'Create a new animal',
    tags: ['Animals'],
    requestBody: {
      required: true,
      content: {
        'application/json': { schema: CreateAnimalDTO },
      },
    },
    responses: {
      201: {
        description: 'Animal created',
        content: {
          'application/json': { schema: AnimalDTO },
        },
      },
      400: { description: 'Validation error' },
    },
  },
  async request => {
    const data = request.body
    // Implementation...
    return NextResponse.json(result, { status: 201 })
  }
)
```

## 8. Best Practices

### 8.1 Naming Conventions

- **operationId**: camelCase, unique across all routes (e.g., `searchAnimals`, `getAnimal`, `createAnimal`)
- **DTO files**: kebab-case (e.g., `animal.ts`, `service-note.ts`)
- **DTO exports**: PascalCase (e.g., `AnimalDTO`, `CreateAnimalDTO`)
- **Properties**: camelCase (e.g., `firstName`, `lastVisit`)

### 8.2 Validation

- Always use `.describe()` on Zod fields
- Use appropriate Zod validators (`.email()`, `.datetime()`, `.max()`, etc.)
- Use `.optional()` for optional fields
- Use `.enum()` for restricted values

### 8.3 Type Safety

- Never use `any` types
- Import types from generated DTOs
- Let TypeScript infer types from Zod schemas
- Use `z.infer<typeof YourDTO>` only when needed

## 9. Common Patterns

### 9.1 List/Search Endpoints

```typescript
export const GET = defineRoute({
  operationId: 'listResources',
  summary: 'List or search resources',
  queryParams: SearchQuery,  // Optional search params
  responses: {
    200: {
      content: {
        'application/json': { schema: z.array(ResourceDTO) }
      }
    }
  }
}, async (request) => { ... })
```

### 9.2 Single Resource Endpoints

```typescript
export const GET = defineRoute({
  operationId: 'getResource',
  pathParams: z.object({ id: z.string() }),
  responses: {
    200: { content: { 'application/json': { schema: ResourceDTO } } },
    404: { description: 'Not found' }
  }
}, async (request) => { ... })
```

### 9.3 Create Endpoints

```typescript
export const POST = defineRoute({
  operationId: 'createResource',
  requestBody: {
    required: true,
    content: { 'application/json': { schema: CreateResourceDTO } }
  },
  responses: {
    201: { content: { 'application/json': { schema: ResourceDTO } } },
    400: { description: 'Validation error' }
  }
}, async (request) => { ... })
```

## 10. Quality Standards

### 10.1 Completeness

- Every route must have `operationId`, `summary`, `tags`
- All parameters must have descriptions
- All response codes must be documented
- All DTOs must be exported and included in `generateOpenApiSpec()`

### 10.2 Accuracy

- Documentation matches implementation
- Response schemas match actual returned data
- Validation rules in Zod match business logic

### 10.3 Consistency

- Similar endpoints follow same patterns
- Naming conventions are uniform
- Error responses are documented identically

## 11. Benefits

### 11.1 Automatic Validation

`defineRoute()` validates requests before your handler runs. Invalid requests return 400 automatically.

### 11.2 Type Safety

TypeScript knows the exact shape of `request.body`, `request.queryParams`, and `request.pathParams`.

### 11.3 Living Documentation

Visit `/api/docs` for interactive Swagger UI. Documentation is always up-to-date because it's generated from code.

### 11.4 Testing

Export OpenAPI spec at `/api/docs/openapi.json` for use with API testing tools (Hurl, Postman, Insomnia).

## 12. Troubleshooting

### 12.1 SSR Errors with Swagger UI

Always use `dynamic(() => import('swagger-ui-react'), { ssr: false })`.

### 12.2 Datetime Validation Fails

Use `z.string().datetime()` or `z.iso.datetime({ offset: true })` for ISO 8601 dates.

### 12.3 DTO Not Appearing in Swagger

Ensure DTO is exported from model file AND passed to `generateOpenApiSpec()`.

### 12.4 Type Errors in Request Handler

Check that Zod schema matches expected data shape. Use TypeScript's intellisense to see inferred types.
