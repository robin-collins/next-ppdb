# OpenAPI Documentation Implementation Plan

**Status**: READY TO IMPLEMENT  
**Created**: 2025-11-16  
**Priority**: HIGH

## Why OpenAPI?

### Current Problems

1. ❌ API behavior unclear without reading code
2. ❌ Manual test writing is error-prone
3. ❌ No single source of truth for API contracts
4. ❌ Frontend/backend sync issues
5. ❌ New developers struggle to understand APIs

### Benefits After Implementation

1. ✅ Auto-generated API documentation at `/api/docs`
2. ✅ Swagger UI for interactive testing
3. ✅ Auto-generate Hurl tests from OpenAPI spec
4. ✅ Type-safe request/response validation
5. ✅ Single source of truth (Zod schemas → OpenAPI)
6. ✅ OpenAPI JSON/YAML export for tools

## Recommended Solution

**Package**: `@omer-x/next-openapi-route-handler` + `@omer-x/next-openapi-json-generator`

### Installation (Completed Already.)

<!-- ```bash
pnpm add @omer-x/next-openapi-route-handler @omer-x/next-openapi-json-generator
pnpm add -D swagger-ui-react @types/swagger-ui-react
``` -->

## Implementation Steps

### Step 1: Create OpenAPI Models

Create DTOs (Data Transfer Objects) with Zod schemas:

```typescript
// src/lib/openapi/models/animal.ts
import { z } from 'zod'

export const AnimalDTO = z.object({
  id: z.number().describe('Animal ID'),
  name: z.string().max(12).describe('Animal name'),
  breed: z.string().describe('Breed name'),
  sex: z.enum(['Male', 'Female']).describe('Animal sex'),
  colour: z.string().describe('Animal colour'),
  cost: z.number().optional().describe('Service cost'),
  lastVisit: z.string().datetime().describe('Last visit date'),
  thisVisit: z.string().datetime().describe('Current visit date'),
  comments: z.string().optional().describe('Additional comments'),
  customer: z
    .object({
      id: z.number(),
      firstname: z.string(),
      surname: z.string(),
      email: z.string().email().optional(),
    })
    .describe('Customer information'),
  serviceNotes: z
    .array(
      z.object({
        id: z.number(),
        notes: z.string(),
        date: z.string().datetime(),
      })
    )
    .describe('Service history'),
})

export const CreateAnimalDTO = z.object({
  name: z.string().max(12).describe('Animal name'),
  breed: z.string().describe('Breed name'),
  sex: z.enum(['Male', 'Female']).describe('Animal sex'),
  customerId: z.number().describe('Customer ID'),
  colour: z.string().optional().describe('Animal colour'),
  cost: z.number().optional().describe('Service cost'),
  lastVisit: z.string().datetime().describe('Last visit date'),
  thisVisit: z.string().datetime().describe('Current visit date'),
  comments: z.string().optional().describe('Additional comments'),
})

export const UpdateAnimalDTO = CreateAnimalDTO.partial()

export const AnimalSearchQuery = z.object({
  q: z.string().optional().describe('Search query (name, breed, customer)'),
})
```

### Step 2: Convert Route Handlers

**Before (Current):**

```typescript
// src/app/api/animals/route.ts
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const q = searchParams.get('q')
  // ... handler code
  return NextResponse.json(results)
}
```

**After (With OpenAPI):**

```typescript
// src/app/api/animals/route.ts
import { defineRoute } from '@omer-x/next-openapi-route-handler'
import { AnimalDTO, AnimalSearchQuery } from '@/lib/openapi/models/animal'

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
          'application/json': {
            schema: z.array(AnimalDTO),
          },
        },
      },
    },
  },
  async request => {
    const { q } = request.queryParams // Type-safe!
    // ... existing handler code
    return NextResponse.json(results)
  }
)

export const POST = defineRoute(
  {
    operationId: 'createAnimal',
    summary: 'Create a new animal',
    description: 'Register a new animal for a customer',
    tags: ['Animals'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: CreateAnimalDTO,
        },
      },
    },
    responses: {
      201: {
        description: 'Animal created successfully',
        content: {
          'application/json': {
            schema: AnimalDTO,
          },
        },
      },
      400: {
        description: 'Invalid request data',
      },
    },
  },
  async request => {
    const data = request.body // Type-safe and validated!
    // ... existing handler code
    return NextResponse.json(result, { status: 201 })
  }
)
```

### Step 3: Create OpenAPI Docs Page

```typescript
// src/app/api/docs/page.tsx
import generateOpenApiSpec from '@omer-x/next-openapi-json-generator';
import dynamic from 'next/dynamic';
import {
  AnimalDTO,
  CreateAnimalDTO,
  UpdateAnimalDTO,
  AnimalSearchQuery
} from '@/lib/openapi/models/animal';
import {
  CustomerDTO,
  CreateCustomerDTO,
  UpdateCustomerDTO,
  CustomerSearchQuery
} from '@/lib/openapi/models/customer';
import {
  BreedDTO,
  CreateBreedDTO,
  UpdateBreedDTO
} from '@/lib/openapi/models/breed';
import {
  NoteDTO,
  CreateNoteDTO,
  UpdateNoteDTO
} from '@/lib/openapi/models/note';

// Dynamically import Swagger UI (client-side only)
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });
import 'swagger-ui-react/swagger-ui.css';

export default async function ApiDocsPage() {
  const spec = await generateOpenApiSpec({
    // All your DTOs
    AnimalDTO,
    CreateAnimalDTO,
    UpdateAnimalDTO,
    AnimalSearchQuery,
    CustomerDTO,
    CreateCustomerDTO,
    UpdateCustomerDTO,
    CustomerSearchQuery,
    BreedDTO,
    CreateBreedDTO,
    UpdateBreedDTO,
    NoteDTO,
    CreateNoteDTO,
    UpdateNoteDTO,
  }, {
    // Options
    include: ['/api/'], // Only include /api/ routes
    exclude: ['/api/docs'], // Exclude this docs endpoint
  });

  // Add metadata
  spec.info = {
    title: 'Pampered Pooch Pet Grooming API',
    version: '1.0.0',
    description: 'RESTful API for managing customers, animals, breeds, and service notes',
    contact: {
      name: 'Tech Team',
      email: 'tech@pamperedpooch.com'
    }
  };

  spec.servers = [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    },
    {
      url: 'https://api.pamperedpooch.com',
      description: 'Production server'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SwaggerUI spec={spec} />
    </div>
  );
}
```

### Step 4: Create OpenAPI JSON Endpoint

```typescript
// src/app/api/docs/openapi.json/route.ts
import { NextResponse } from 'next/server'
import generateOpenApiSpec from '@omer-x/next-openapi-json-generator'
import {
  AnimalDTO,
  CreateAnimalDTO,
  UpdateAnimalDTO,
} from '@/lib/openapi/models/animal'
// ... import all other DTOs

export async function GET() {
  const spec = await generateOpenApiSpec(
    {
      AnimalDTO,
      CreateAnimalDTO,
      UpdateAnimalDTO,
      // ... all other DTOs
    },
    {
      include: ['/api/'],
      exclude: ['/api/docs'],
    }
  )

  spec.info = {
    title: 'Pampered Pooch API',
    version: '1.0.0',
    description: 'Pet grooming database API',
  }

  return NextResponse.json(spec)
}
```

### Step 5: Auto-Generate Hurl Tests from OpenAPI

Create a script to convert OpenAPI → Hurl:

```bash
#!/bin/bash
# scripts/generate-hurl-from-openapi.sh

echo "Generating Hurl tests from OpenAPI spec..."

# Fetch OpenAPI spec
curl -s http://localhost:3000/api/docs/openapi.json > openapi.json

# Use openapi-to-hurl (Rust tool) or custom generator
# For now, we'll create a simple Node.js script

node scripts/openapi-to-hurl.js

echo "Hurl tests generated in hurl/ directory"
```

```javascript
// scripts/openapi-to-hurl.js
const fs = require('fs')
const spec = JSON.parse(fs.readFileSync('openapi.json', 'utf8'))

// Generate Hurl files for each endpoint
Object.entries(spec.paths).forEach(([path, methods]) => {
  Object.entries(methods).forEach(([method, operation]) => {
    const hurlContent = generateHurlTest(path, method.toUpperCase(), operation)
    // Write to appropriate file
  })
})

function generateHurlTest(path, method, operation) {
  return `# ${operation.summary}
${method} {{base_url}}${path}

HTTP 200
[Asserts]
jsonpath "$.id" exists
`
}
```

## Migration Strategy

### Phase 1: Infrastructure (Day 1)

1. ✅ Install packages
2. ✅ Create models directory structure
3. ✅ Create OpenAPI docs page
4. ✅ Create OpenAPI JSON endpoint

### Phase 2: Convert Animals API (Day 1-2)

1. ✅ Create Animal DTOs
2. ✅ Convert `GET /api/animals`
3. ✅ Convert `POST /api/animals`
4. ✅ Convert `GET /api/animals/[id]`
5. ✅ Convert `PUT /api/animals/[id]`
6. ✅ Convert `DELETE /api/animals/[id]`
7. ✅ Test in Swagger UI

### Phase 3: Convert Customers API (Day 2)

1. ✅ Create Customer DTOs
2. ✅ Convert all customer endpoints
3. ✅ Test in Swagger UI

### Phase 4: Convert Breeds & Notes APIs (Day 3)

1. ✅ Create remaining DTOs
2. ✅ Convert all endpoints
3. ✅ Test in Swagger UI

### Phase 5: Auto-Generate Tests (Day 3-4)

1. ✅ Create OpenAPI → Hurl converter
2. ✅ Generate all Hurl tests
3. ✅ Run and validate tests

## Benefits After Implementation

### 1. Living Documentation

- Visit `http://localhost:3000/api/docs` for interactive API docs
- Always up-to-date (generated from code)
- Try endpoints directly in browser

### 2. Auto-Generated Tests

- OpenAPI spec → Hurl tests automatically
- No manual test writing
- Always correct payloads

### 3. Type Safety

- Request/response types enforced
- Validation automatic
- Compile-time checks

### 4. Developer Experience

- New developers understand API immediately
- Frontend developers know exact request/response shapes
- Less "how do I call this?" questions

### 5. Tools Integration

- Postman can import OpenAPI spec
- Insomnia can import OpenAPI spec
- Code generators for clients
- API gateways can use spec

## Example: Before vs After

### Before (Manual Testing)

```bash
# Have to guess the payload format
curl -X POST http://localhost:3000/api/animals \
  -H "Content-Type: application/json" \
  -d '{"name":"Buddy","breed":"Labrador",... ?}'
# ❌ Not sure what fields are required
# ❌ Not sure what format dates need
# ❌ Not sure what the response looks like
```

### After (OpenAPI Documentation)

```bash
# 1. Visit http://localhost:3000/api/docs
# 2. See exact request/response shapes
# 3. Try it directly in Swagger UI
# 4. Or auto-generate Hurl tests:
pnpm generate:hurl-tests
# ✅ All tests generated with correct payloads
# ✅ All validations match your Zod schemas
# ✅ All responses documented
```

## Cost/Benefit Analysis

### Time Investment

- Initial setup: 2-4 hours
- Converting existing routes: 1-2 days
- Creating test generator: 4-6 hours
- **Total**: ~3 days

### Time Savings (Ongoing)

- No manual test writing: 4-8 hours/week saved
- Faster onboarding: 2-3 days saved per developer
- Fewer API bugs: Countless hours saved
- **ROI**: Positive within first month

## Next Steps

1. **Decision**: Approve this approach
2. **Install**: Add packages to `package.json`
3. **Start**: Begin with Animals API (highest value)
4. **Iterate**: Convert one endpoint at a time
5. **Validate**: Test as you go
6. **Document**: Update CHANGELOG.md

## Resources

- [Next OpenAPI Route Handler Docs](https://github.com/omermecitoglu/next-openapi-route-handler)
- [Next OpenAPI JSON Generator Docs](https://github.com/omermecitoglu/next-openapi-json-generator)
- [OpenAPI 3.1 Specification](https://spec.openapis.org/oas/v3.1.0)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)

---

**Ready to implement? This will solve your testing problems and give you world-class API documentation.**
