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

**References**:

- 📚 [Next OpenAPI Route Handler](https://github.com/omermecitoglu/next-openapi-route-handler) - Source: `/omermecitoglu/next-openapi-route-handler`
- 📚 [Swagger UI React](https://github.com/swagger-api/swagger-ui) - Source: `/swagger-api/swagger-ui`

### Current Installed Versions

```json
{
  "@omer-x/next-openapi-json-generator": "^2.0.2",
  "@omer-x/next-openapi-route-handler": "^2.0.0",
  "swagger-ui-react": "^5.30.2",
  "@types/swagger-ui-react": "^5.18.0",
  "zod": "^4.0.17",
  "next": "15.4.5"
}
```

### Installation (Completed Already.)

<!-- ```bash
pnpm add @omer-x/next-openapi-route-handler @omer-x/next-openapi-json-generator
pnpm add -D swagger-ui-react @types/swagger-ui-react
``` -->

## Implementation To-Do List

**Status Tracking**: Mark items as you complete them

- ⬜ Not started
- 🔄 In progress
- ✅ Complete
- ⚠️ Blocked/Issue

### Phase 0: Pre-Implementation Checklist

- ⬜ Review this entire document and all Context7 references
- ⬜ Ensure development server runs without errors: `pnpm dev`
- ⬜ Verify all packages are installed (versions listed above)
- ⬜ Run baseline tests to ensure nothing is broken: `pnpm test`
- ⬜ Create a feature branch: `git checkout -b feature/openapi-implementation`
- ⬜ Back up current API routes (optional safety measure)

### Phase 1: Infrastructure Setup

- ⬜ Create directory structure: `src/lib/openapi/models/`
- ⬜ Create base type file: `src/lib/openapi/models/index.ts` (for shared types)
- ⬜ Verify TypeScript can resolve `@/lib/openapi/*` paths
- ⬜ Test that Swagger UI CSS import works in Next.js 15

### Phase 2: Create Animal DTOs

- ⬜ Create `src/lib/openapi/models/animal.ts`
- ⬜ Define `AnimalDTO` with all fields (id, name, breed, sex, colour, cost, lastVisit, thisVisit, comments)
- ⬜ Add nested `customer` object (id, firstname, surname, email)
- ⬜ Add nested `serviceNotes` array
- ⬜ Create `CreateAnimalDTO` (without id, with customerId)
- ⬜ Create `UpdateAnimalDTO` using `.partial()`
- ⬜ Create `AnimalSearchQuery` (q: optional string)
- ⬜ Add `.describe()` to all fields for OpenAPI documentation
- ⬜ Verify datetime format: use `z.string().datetime()` or `z.iso.datetime()` based on data format
- ⬜ Export all DTOs

### Phase 3: Convert Animals API Routes

#### GET /api/animals (List/Search)

- ⬜ Open `src/app/api/animals/route.ts`
- ⬜ Import `defineRoute` from `@omer-x/next-openapi-route-handler`
- ⬜ Import `AnimalDTO` and `AnimalSearchQuery`
- ⬜ Convert `GET` function to `defineRoute` format
- ⬜ Add `operationId: 'searchAnimals'`
- ⬜ Add `summary` and `description`
- ⬜ Add `tags: ['Animals']`
- ⬜ Add `queryParams: AnimalSearchQuery`
- ⬜ Add `responses` object with 200 status
- ⬜ Update handler to use `request.queryParams` instead of manual extraction
- ⬜ Keep existing search logic unchanged
- ⬜ Test in browser: search should still work
- ⬜ Verify TypeScript types are correct (no `any`)

#### POST /api/animals (Create)

- ⬜ In same file, convert `POST` function to `defineRoute`
- ⬜ Add `operationId: 'createAnimal'`
- ⬜ Add `requestBody` with `CreateAnimalDTO`
- ⬜ Add responses: 201 (success), 400 (validation error), 404 (customer not found)
- ⬜ Update handler to use `request.body` (already validated!)
- ⬜ Keep existing creation logic
- ⬜ Test creating an animal via UI or curl
- ⬜ Test with invalid data to verify 400 response

#### GET /api/animals/[id] (Get Single)

- ⬜ Open `src/app/api/animals/[id]/route.ts`
- ⬜ Convert `GET` function to `defineRoute`
- ⬜ Add `pathParams: z.object({ id: z.string() })`
- ⬜ Add `operationId: 'getAnimal'`
- ⬜ Add responses: 200, 404
- ⬜ Update handler to use `request.pathParams.id`
- ⬜ Test fetching a single animal
- ⬜ Test with invalid ID to verify 404

#### PUT /api/animals/[id] (Update)

- ⬜ In same file, convert `PUT` function to `defineRoute`
- ⬜ Add `operationId: 'updateAnimal'`
- ⬜ Add `pathParams` and `requestBody: UpdateAnimalDTO`
- ⬜ Add responses: 200, 400, 404
- ⬜ Update handler to use validated params
- ⬜ Test updating an animal
- ⬜ Test partial updates (only some fields)

#### DELETE /api/animals/[id] (Delete)

- ⬜ In same file, convert `DELETE` function
- ⬜ Add `operationId: 'deleteAnimal'`
- ⬜ Add responses: 204, 404
- ⬜ Test deleting an animal
- ⬜ Verify cascade behavior with notes

#### Animals API Testing

- ⬜ Run all animal Hurl tests: `pnpm test:hurl`
- ⬜ Verify all tests still pass
- ⬜ Check that validation errors return proper 400 responses
- ⬜ Commit progress: `git commit -m "Convert Animals API to OpenAPI"`

### Phase 4: Create Customer DTOs

- ⬜ Create `src/lib/openapi/models/customer.ts`
- ⬜ Define `CustomerDTO` (id, firstname, surname, phone1, phone2, phone3, address, postcode, email)
- ⬜ Create `CreateCustomerDTO`
- ⬜ Create `UpdateCustomerDTO`
- ⬜ Create `CustomerSearchQuery`
- ⬜ Handle postcode as number (even though displayed as string)
- ⬜ Make all phone fields optional
- ⬜ Export all DTOs

### Phase 5: Convert Customers API Routes

- ⬜ Convert `GET /api/customers` (search/list)
- ⬜ Convert `POST /api/customers` (create)
- ⬜ Convert `GET /api/customers/[id]` (get single)
- ⬜ Convert `PUT /api/customers/[id]` (update)
- ⬜ Convert `DELETE /api/customers/[id]` (delete)
- ⬜ Run customer Hurl tests
- ⬜ Commit: `git commit -m "Convert Customers API to OpenAPI"`

### Phase 6: Create Breed DTOs

- ⬜ Create `src/lib/openapi/models/breed.ts`
- ⬜ Define `BreedDTO` (id, breed)
- ⬜ Create `CreateBreedDTO`
- ⬜ Create `UpdateBreedDTO`
- ⬜ Export all DTOs

### Phase 7: Convert Breeds API Routes

- ⬜ Convert `GET /api/breeds` (list all)
- ⬜ Convert `POST /api/breeds` (create)
- ⬜ Convert `GET /api/breeds/[id]` (get single)
- ⬜ Convert `PUT /api/breeds/[id]` (update)
- ⬜ Convert `DELETE /api/breeds/[id]` (delete)
- ⬜ Run breed Hurl tests
- ⬜ Commit: `git commit -m "Convert Breeds API to OpenAPI"`

### Phase 8: Create Note DTOs

- ⬜ Create `src/lib/openapi/models/note.ts`
- ⬜ Define `NoteDTO` (noteID, animalID, notes, date)
- ⬜ Create `CreateNoteDTO`
- ⬜ Create `UpdateNoteDTO`
- ⬜ Handle date field properly (datetime validation)
- ⬜ Export all DTOs

### Phase 9: Convert Notes API Routes

- ⬜ Convert `POST /api/animals/[id]/notes` (create note)
- ⬜ Convert `GET /api/notes/[noteId]` (get single note)
- ⬜ Convert `PUT /api/notes/[noteId]` (update note)
- ⬜ Convert `DELETE /api/notes/[noteId]` (delete note)
- ⬜ Run notes Hurl tests
- ⬜ Commit: `git commit -m "Convert Notes API to OpenAPI"`

### Phase 10: Create OpenAPI Documentation Page

- ⬜ Create `src/app/api/docs/page.tsx`
- ⬜ Import `generateOpenApiSpec` from `@omer-x/next-openapi-json-generator`
- ⬜ Import `dynamic` from `next/dynamic`
- ⬜ Import all DTOs (Animals, Customers, Breeds, Notes)
- ⬜ Add dynamic import for Swagger UI with `ssr: false`
- ⬜ Import `swagger-ui-react/swagger-ui.css`
- ⬜ Generate spec with all DTOs
- ⬜ Configure `include: ['/api/']` and `exclude: ['/api/docs']`
- ⬜ Add `spec.info` metadata (title, version, description, contact)
- ⬜ Add `spec.servers` (localhost:3000, production URL)
- ⬜ Return SwaggerUI component with spec
- ⬜ Test: Visit `http://localhost:3000/api/docs`
- ⬜ Verify all endpoints appear in Swagger UI
- ⬜ Verify schemas are documented correctly
- ⬜ Test "Try it out" functionality for a few endpoints

### Phase 11: Create OpenAPI JSON Endpoint

- ⬜ Create `src/app/api/docs/openapi.json/route.ts`
- ⬜ Import `generateOpenApiSpec`
- ⬜ Import all DTOs
- ⬜ Create `GET` handler (can use plain async function, not defineRoute)
- ⬜ Generate spec with same configuration as docs page
- ⬜ Add metadata
- ⬜ Return `NextResponse.json(spec)`
- ⬜ Test: Visit `http://localhost:3000/api/docs/openapi.json`
- ⬜ Verify JSON is valid OpenAPI 3.1.0 spec
- ⬜ Save JSON locally for reference

### Phase 12: Testing & Validation

- ⬜ Run full test suite: `pnpm test`
- ⬜ Run E2E tests: `pnpm test:e2e`
- ⬜ Run all Hurl tests: `pnpm test:hurl`
- ⬜ Verify 100% pass rate
- ⬜ Test each endpoint in Swagger UI manually
- ⬜ Test validation errors (submit invalid data)
- ⬜ Test 404 responses (use invalid IDs)
- ⬜ Check TypeScript compilation: `pnpm type-check`
- ⬜ Check linting: `pnpm lint`
- ⬜ Check formatting: `pnpm fmt:check`

### Phase 13: Documentation Updates

- ⬜ Update `CLAUDE.md` with OpenAPI documentation location
- ⬜ Update `README.md` to mention API docs at `/api/docs`
- ⬜ Add script to `package.json`: `"docs": "open http://localhost:3000/api/docs"`
- ⬜ Document any deviations from the plan in FAILURELOG.md
- ⬜ Update CHANGELOG.md with implementation completion

### Phase 14: Optional Enhancements

- ⬜ Add authentication/authorization to Swagger UI (if needed)
- ⬜ Create Hurl test generator script (optional)
- ⬜ Add OpenAPI spec validation in CI/CD
- ⬜ Configure CORS for production
- ⬜ Add rate limiting documentation
- ⬜ Create client SDK generator workflow

### Phase 15: Review & Merge

- ⬜ Run complete check: `pnpm check`
- ⬜ Self-review all changes
- ⬜ Test on clean install: `rm -rf node_modules && pnpm install`
- ⬜ Create pull request with detailed description
- ⬜ Address any review feedback
- ⬜ Merge to main branch
- ⬜ Verify main branch builds: `pnpm build`
- ⬜ Deploy documentation to production
- ⬜ Share `/api/docs` URL with team

## Implementation Steps

### Step 1: Create OpenAPI Models

Create DTOs (Data Transfer Objects) with Zod schemas:

**📚 Context7 References**:

- Zod v4 Object Schemas: `/colinhacks/zod/v4.0.1`
- Zod `.describe()` adds descriptions that appear in OpenAPI documentation
- Zod `.optional()` marks fields as optional in OpenAPI spec
- Zod `.enum()` creates validated string enums
- Zod `z.iso.datetime()` validates ISO 8601 datetime strings (recommended for API dates)

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

**⚠️ Important Notes**:

- `z.string().datetime()` in Zod v4 validates ISO 8601 format (e.g., `2020-01-01T06:15:00Z`)
- By default, timezone offsets are NOT allowed. Use `z.iso.datetime({ offset: true })` to allow them
- Use `z.iso.datetime({ local: true })` to allow timezone-less times
- `.partial()` creates an update DTO where all fields become optional
- Reference: Zod ISO Datetime Validation (`/colinhacks/zod/v4.0.1`)

### Step 2: Convert Route Handlers

**📚 Context7 References**:

- `defineRoute()` API: `/omermecitoglu/next-openapi-route-handler`
- Next.js Route Handlers: `/websites/nextjs_app`
- `NextRequest` and `NextResponse` are standard Next.js 15 APIs

**Key `defineRoute` Parameters**:

- `operationId`: Unique identifier for the operation (used in OpenAPI spec)
- `summary`: Short description (appears in Swagger UI)
- `tags`: Categorization for grouping endpoints
- `queryParams`: Zod schema for query string validation
- `requestBody`: Zod schema for POST/PUT/PATCH body validation
- `responses`: Object defining status codes and response schemas
- `action`: Handler function receiving validated `pathParams`, `queryParams`, and `body`

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

**⚠️ Important Notes**:

- Automatic validation: `defineRoute` validates request data against Zod schemas before calling your handler
- Type safety: TypeScript infers types from Zod schemas - `request.body` and `request.queryParams` are fully typed
- Error handling: Validation errors automatically return 400 Bad Request with Zod error details
- Custom error handler: Use optional `handleErrors` parameter to customize error responses
- Reference: Define Next.js API Route Handler (`/omermecitoglu/next-openapi-route-handler`)

### Step 3: Create OpenAPI Docs Page

**📚 Context7 References**:

- Dynamic imports in Next.js: `/websites/nextjs_app`
- Swagger UI React: `/swagger-api/swagger-ui`
- `generateOpenApiSpec()` from `@omer-x/next-openapi-json-generator`

**Key Configuration**:

- `ssr: false`: Swagger UI must be client-side only (uses browser-specific APIs)
- `include`: Filter which routes to document (e.g., `['/api/']`)
- `exclude`: Exclude specific routes (e.g., `['/api/docs']` to avoid self-documenting)
- `spec.info`: OpenAPI metadata (title, version, description, contact)
- `spec.servers`: API server URLs for different environments

**⚠️ Critical**: Always use `dynamic(() => import('swagger-ui-react'), { ssr: false })` to prevent SSR errors

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

## Known Challenges, Limitations & Resolutions

### 1. Swagger UI SSR Errors

**Problem**: Swagger UI uses browser-specific APIs and fails during server-side rendering
**Symptom**: `ReferenceError: window is not defined` or similar SSR errors
**Solution**: Always use dynamic import with `ssr: false`

```typescript
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })
```

**Reference**: Dynamic Import with Next.js (`/websites/nextjs_app`)

### 2. Swagger UI Props Are Immutable After Mount

**Problem**: Many SwaggerUI props are only applied once on mount and don't update on prop changes
**Affected Props**: `layout`, `docExpansion`, `defaultModelExpandDepth`, `defaultModelRendering`, `displayOperationId`, `plugins`, `presets`, `tryItOutEnabled`, etc.
**Impact**: You cannot dynamically change these configurations after initial render
**Workaround**: Force component remount by changing its `key` prop if dynamic updates are needed

**Reference**: SwaggerUI Component Props (`/swagger-api/swagger-ui`)

### 3. Datetime Format Validation

**Problem**: Default `z.string().datetime()` in Zod v4 does NOT allow timezone offsets
**Symptom**: Valid ISO strings like `"2020-01-01T06:15:00+02:00"` fail validation
**Solution**: Use appropriate options:

- `z.iso.datetime({ offset: true })` - Allow timezone offsets
- `z.iso.datetime({ local: true })` - Allow timezone-less times
- `z.iso.datetime({ precision: 3 })` - Enforce millisecond precision

**Reference**: Zod ISO Datetime Validation (`/colinhacks/zod/v4.0.1`)

### 4. CORS Configuration for Swagger UI Testing

**Problem**: Browser-based testing in Swagger UI may fail due to CORS
**Required Headers**:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, DELETE, PUT, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, api_key, Authorization
```

**Solution**: Configure CORS in Next.js middleware or route handlers for development

**Reference**: CORS Headers Configuration (`/swagger-api/swagger-ui`)

### 5. Type Safety with defineRoute

**Problem**: TypeScript type inference can be complex with deeply nested schemas
**Best Practice**: Extract and name your Zod schemas separately (don't inline)
**Good**:

```typescript
const AnimalDTO = z.object({ ... });
export const GET = defineRoute({ responses: { 200: { schema: AnimalDTO } } }, ...)
```

**Bad**:

```typescript
export const GET = defineRoute({ responses: { 200: { schema: z.object({ ... }) } } }, ...)
```

### 6. Route Handler Caching in Next.js 15

**Problem**: GET route handlers are not cached by default in Next.js 15
**Impact**: May affect performance for documentation endpoints
**Solution**: Opt into caching if needed:

```typescript
export const dynamic = 'force-static'
export async function GET() { ... }
```

**Reference**: Next.js Route Handler Caching (`/websites/nextjs_app`)

### 7. OpenAPI Spec Size

**Problem**: Large DTOs with many nested objects can create very large OpenAPI specs
**Impact**: Slow Swagger UI loading, large JSON payloads
**Mitigation**:

- Use pagination for large responses
- Split large specs into multiple documentation pages
- Consider excluding internal-only endpoints

### 8. Error Response Documentation

**Problem**: `defineRoute` automatically handles validation errors but doesn't document them well
**Solution**: Explicitly document error responses:

```typescript
responses: {
  400: { description: 'Validation error - check request format' },
  404: { description: 'Resource not found' },
  500: { description: 'Internal server error' }
}
```

### 9. File Upload Handling

**Problem**: OpenAPI route handler requires special configuration for `FormData`
**Solution**: Use `hasFormData: true` parameter in `defineRoute`:

```typescript
export const POST = defineRoute({
  hasFormData: true,
  requestBody: { schema: z.object({ file: z.instanceof(File) }) },
  ...
}, async (request) => { ... })
```

**Reference**: defineRoute Function Parameters (`/omermecitoglu/next-openapi-route-handler`)

## Resources

- [Next OpenAPI Route Handler Docs](https://github.com/omermecitoglu/next-openapi-route-handler) - Context7: `/omermecitoglu/next-openapi-route-handler`
- [Next OpenAPI JSON Generator Docs](https://github.com/omermecitoglu/next-openapi-json-generator)
- [OpenAPI 3.1 Specification](https://spec.openapis.org/oas/v3.1.0)
- [Swagger UI](https://swagger.io/tools/swagger-ui/) - Context7: `/swagger-api/swagger-ui`
- [Zod Documentation](https://zod.dev) - Context7: `/colinhacks/zod/v4.0.1`
- [Next.js App Router](https://nextjs.org/docs/app) - Context7: `/websites/nextjs_app`

---

**Ready to implement? This will solve your testing problems and give you world-class API documentation.**
