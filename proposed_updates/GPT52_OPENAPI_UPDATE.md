# Automated OpenAPI Generation Proposal

## Goals

- Eliminate manual drift in `/api/docs` and `/api/docs/openapi.json` by generating OpenAPI (JSON/YAML) directly from runtime validation.
- Reuse the existing Zod schemas for both request/response validation and documentation.
- Keep generation deterministic and integrated into the Next.js v15 build/CI workflow.

## Recommended Libraries

- **`@asteasolutions/zod-to-openapi`** — bridges Zod schemas to OpenAPI 3.x. [npm](https://www.npmjs.org/package/@asteasolutions/zod-to-openapi) • [GitHub](https://github.com/asteasolutions/zod-to-openapi)
- **`yaml`** — emit a YAML copy alongside JSON for downstream tooling. [npm](https://www.npmjs.org/package/yaml) • [GitHub](https://github.com/eemeli/yaml)
- Optional (for description-only gaps): **`openapi-comment-parser`**. [npm](https://www.npmjs.org/package/openapi-comment-parser) • [GitHub](https://github.com/ajaishankar/openapi-comment-parser)

## File & Module Layout

- **`src/lib/schemas/**/\*`**: Export all Zod schemas used by route handlers (requests, params, and responses). Use `z.infer` types in handlers to keep TS aligned.
- **`scripts/openapi.ts`**: Standalone generator that registers schemas and paths, produces `public/openapi.json` and `public/openapi.yaml`.
- **`src/app/api/docs/openapi.json/route.ts`**: Replace the hard-coded object with a lightweight responder that serves the generated file (static import or `fs` read).
- **`src/app/api/docs/page.tsx` (optional)**: Render Swagger UI/ReDoc using the generated JSON.

## Generator Outline (TypeScript)

```ts
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import YAML from 'yaml'
import packageJson from '../package.json'
import {
  animalSchema,
  searchAnimalsQuerySchema,
  animalsResponseSchema,
} from '../src/lib/schemas/animals'

const registry = new OpenAPIRegistry()
const Animal = registry.register('Animal', animalSchema)

registry.registerPath({
  method: 'get',
  path: '/api/animals',
  tags: ['Animals'],
  request: { query: searchAnimalsQuerySchema },
  responses: {
    200: {
      description: 'List animals',
      content: { 'application/json': { schema: animalsResponseSchema } },
    },
  },
})

const generator = new OpenApiGeneratorV3(registry.definitions)
const doc = generator.generateDocument({
  openapi: '3.0.3',
  info: {
    title: 'Pampered Pooch Pet Grooming API',
    version: packageJson.version,
  },
  servers: [
    { url: 'https://api.pamperedpooch.com', description: 'Production server' },
    { url: 'http://localhost:3000', description: 'Development server' },
  ],
})

const outJson = join(process.cwd(), 'public', 'openapi.json')
const outYaml = join(process.cwd(), 'public', 'openapi.yaml')
writeFileSync(outJson, JSON.stringify(doc, null, 2))
writeFileSync(outYaml, YAML.stringify(doc))
```

## Next.js v15 Integration

- **Pre-generate** during CI/build to avoid cold-start overhead. Keep the route handler simple (read from `public/openapi.json` and `NextResponse.json`).
- **Type safety**: Use `z.infer` types in handlers; Zod schemas become the single source of truth.
- **Security**: Register shared security schemes (e.g., bearer auth) in the generator so clients stay in sync with middleware/auth.

## Scripts & Workflow

Add to `package.json`:

```json
{
  "scripts": {
    "generate:openapi": "tsx scripts/openapi.ts",
    "prebuild": "pnpm generate:openapi"
  }
}
```

CI/CD:

- Run `pnpm generate:openapi` before `pnpm build` so the spec matches the deployed code.
- Optionally commit the generated artifacts for static hosting; otherwise generate in the pipeline and publish alongside the build output.

Local dev:

- Regenerate on schema changes (`pnpm generate:openapi`), or add a watcher (`nodemon --watch src/lib/schemas --exec "pnpm generate:openapi"`).

## Optional Comment-Based Enrichment

- For routes not yet covered by Zod, annotate handlers with JSDoc/TSDoc and parse via `openapi-comment-parser`; merge into the generated doc to supply summaries/descriptions while schemas remain Zod-driven.

## Deliverables

- `scripts/openapi.ts` generator.
- Updated `src/app/api/docs/openapi.json/route.ts` to serve generated files.
- `public/openapi.json` (and `.yaml`) produced during build/CI.
- Optional `/api/docs` UI (Swagger UI or ReDoc) consuming the generated spec.
