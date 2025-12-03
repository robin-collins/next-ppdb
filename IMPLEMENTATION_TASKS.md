# Implementation Tasks - Next.js PPDB v0.1.3

**Sprint Duration**: 2 weeks (80 hours)
**Target Release**: v0.1.3
**Status**: Ready to Start

---

## Pre-Sprint Setup

- [ ] Review `IMPLEMENTATION_PLAN.md` completely
- [ ] Set up Upstash Redis account (https://upstash.com) - Free tier
- [ ] Add Upstash credentials to `.env`
- [ ] Create feature branch: `git checkout -b feature/production-hardening`
- [ ] Update Zod: `pnpm update zod` (4.1.12 → 4.1.13)

---

## Week 1: Critical Issues (11 hours)

### C1. Console.log Information Disclosure (2 hours)

**Backend Developer**

- [ ] Install structured logging dependencies
  ```bash
  pnpm add pino pino-pretty
  pnpm add -D @types/pino
  ```

- [ ] Create logger utility (`src/lib/logger.ts`)
  - [ ] Configure Pino with redaction paths
  - [ ] Add convenience methods (debug, info, warn, error)
  - [ ] Set up pino-pretty for development
  - [ ] Test redaction of phone numbers and emails

- [ ] Find all console.log statements
  ```bash
  grep -rn "console\.log" src/app/api/
  ```

- [ ] Replace console.log in API routes
  - [ ] `src/app/api/animals/route.ts` (lines 277-326)
  - [ ] `src/app/api/customers/route.ts`
  - [ ] `src/app/api/breeds/route.ts`
  - [ ] All other API routes

- [ ] Gate debug logs behind DEBUG env var
  - [ ] Update all debug logging calls
  - [ ] Test with `DEBUG=true pnpm dev`
  - [ ] Test with `NODE_ENV=production pnpm build`

- [ ] Testing
  - [ ] Verify no console.log in production build
  - [ ] Verify debug logs work in dev mode
  - [ ] Verify sensitive data is redacted
  - [ ] Run: `rg "console\.(log|debug|info)" src/app/api/` (should be 0 results)

---

### C2. No Rate Limiting (4 hours)

**Backend Developer**

- [ ] Install rate limiting dependencies
  ```bash
  pnpm add @upstash/ratelimit @upstash/redis
  ```

- [ ] Create rate limiter utility (`src/lib/ratelimit.ts`)
  - [ ] Set up Upstash Redis client
  - [ ] Create in-memory fallback for development
  - [ ] Define rate limiters by type (api: 100/min, search: 50/min, admin: 10/min)
  - [ ] Implement `checkRateLimit()` function
  - [ ] Implement `getClientIdentifier()` helper

- [ ] Create rate limit middleware (`src/lib/middleware/ratelimit.ts`)
  - [ ] Implement `withRateLimit()` wrapper
  - [ ] Add rate limit headers to responses
  - [ ] Return 429 status when limit exceeded
  - [ ] Include retry-after header

- [ ] Apply rate limiting to API routes
  - [ ] Animals routes (GET, POST) - use 'search' type for GET
  - [ ] Customers routes (GET, POST) - use 'search' type for GET
  - [ ] Breeds routes (GET, POST)
  - [ ] Notes routes (GET, POST, PUT, DELETE)
  - [ ] Admin backup route - use 'admin' type
  - [ ] Setup routes
  - [ ] Reports routes
  - [ ] All [id] routes (GET, PUT, DELETE)

- [ ] Add environment variables
  - [ ] Update `.env.example` with Upstash vars
  - [ ] Add to environment validation schema
  - [ ] Document in README

- [ ] Testing
  - [ ] Test rate limit enforcement (51 requests should get 429)
  - [ ] Test rate limit headers present
  - [ ] Test different limits for different types
  - [ ] Test in-memory fallback works without Redis
  - [ ] Verify production requires Upstash config

---

### C3. Unhandled Promise Rejections in Stores (2 hours)

**Frontend Developer**

- [ ] Fix `animalsStore.ts` error handling
  - [ ] `updateAnimal()` - re-throw after setting error state
  - [ ] `deleteAnimal()` - re-throw after setting error state
  - [ ] `addNote()` - re-throw after setting error state
  - [ ] `deleteNote()` - re-throw after setting error state

- [ ] Fix `customersStore.ts` error handling
  - [ ] `updateCustomer()` - re-throw after setting error state
  - [ ] `deleteCustomer()` - re-throw after setting error state
  - [ ] `deleteAnimal()` - re-throw after setting error state

- [ ] Add mutating state flag
  - [ ] Add `mutating: boolean` to store state
  - [ ] Add `setMutating()` action
  - [ ] Update mutations to set mutating flag
  - [ ] Use `finally` block to clear mutating flag

- [ ] Update component error handling
  - [ ] Wrap store calls in try/catch
  - [ ] Only navigate on success
  - [ ] Show toast on error
  - [ ] Use mutating flag to disable buttons

- [ ] Update tests
  - [ ] Test error re-throwing
  - [ ] Test mutating flag lifecycle
  - [ ] Test component navigation stops on error
  - [ ] Run: `pnpm test src/__tests__/store/`

---

### C4. Missing Environment Variable Validation (1 hour)

**DevOps**

- [ ] Create environment validation module (`src/lib/env.ts`)
  - [ ] Define Zod schema for all env vars
  - [ ] Add DATABASE_URL validation (must start with mysql://)
  - [ ] Add NODE_ENV validation (enum: development, production, test)
  - [ ] Add optional DEBUG flag
  - [ ] Add optional Upstash Redis vars (required in production)
  - [ ] Add PORT and HOSTNAME with defaults
  - [ ] Add refinement for production Redis requirement
  - [ ] Export validated `env` object

- [ ] Create validation helper (`src/lib/validateEnv.ts`)
  - [ ] Implement `validateEnvironment()` function
  - [ ] Format validation errors for clarity
  - [ ] Exit process on validation failure
  - [ ] Log success when valid

- [ ] Add startup validation
  - [ ] Create `src/instrumentation.ts`
  - [ ] Call `validateEnvironment()` in register()
  - [ ] Update `next.config.ts` to enable instrumentation hook

- [ ] Testing
  - [ ] Test with missing DATABASE_URL
  - [ ] Test with invalid DATABASE_URL format (postgres://)
  - [ ] Test production without Redis
  - [ ] Test with valid configuration
  - [ ] Verify clear error messages

---

### C5. No Foreign Key Validation Feedback (2 hours)

**Backend Developer**

- [ ] Update customer delete endpoint (`src/app/api/customers/[id]/route.ts`)
  - [ ] Add pre-deletion validation
  - [ ] Check if customer exists
  - [ ] Count associated animals
  - [ ] Return 409 Conflict if animals exist
  - [ ] Include animal list in error response
  - [ ] Delete only if no dependencies

- [ ] Update breed delete endpoint (`src/app/api/breeds/[id]/route.ts`)
  - [ ] Add pre-deletion validation
  - [ ] Check if breed exists
  - [ ] Count associated animals using `_count`
  - [ ] Return 409 Conflict if animals exist
  - [ ] Include count in error response
  - [ ] Delete only if no dependencies

- [ ] Update client-side error handling
  - [ ] Handle 409 errors in customer delete
  - [ ] Show dependencies modal with animal list
  - [ ] Handle 409 errors in breed delete
  - [ ] Show informative error message

- [ ] Update tests
  - [ ] Test customer delete with animals (expect 409)
  - [ ] Test customer delete without animals (expect 200)
  - [ ] Test breed delete with animals (expect 409)
  - [ ] Test breed delete without animals (expect 200)
  - [ ] Verify error response structure
  - [ ] Run: `pnpm test src/__tests__/api/customers.test.ts`
  - [ ] Run: `pnpm test src/__tests__/api/breeds.test.ts`

---

## Week 1 Testing & Validation

- [ ] Run full test suite: `pnpm test`
- [ ] Run E2E tests: `pnpm test:e2e`
- [ ] Run type check: `pnpm type-check`
- [ ] Run linter: `pnpm lint`
- [ ] Run formatter check: `pnpm fmt:check`
- [ ] Build production: `pnpm build`
- [ ] Test production build: `NODE_ENV=production pnpm start`
- [ ] Verify no console.log output in production
- [ ] Test rate limiting manually (use curl loop)
- [ ] Test environment validation (corrupt .env temporarily)
- [ ] Test foreign key errors (try deleting customer with animals)
- [ ] Test store error handling (network errors)

---

## Week 1 Completion Checklist

- [ ] All 5 critical issues implemented
- [ ] All tests passing
- [ ] Production build successful
- [ ] Zero console.log in production
- [ ] Rate limiting functional
- [ ] Environment validation working
- [ ] Error messages user-friendly
- [ ] Code reviewed by team
- [ ] Documentation updated

---

## Week 2: Important Issues (25 hours)

### I1. N+1 Query Pattern in Search (2 hours)

**Backend Developer**

- [ ] Analyze current query pattern in `src/app/api/animals/route.ts`
  - [ ] Document redundant count query
  - [ ] Measure current performance

- [ ] Implement optimized query strategy
  - [ ] Remove redundant count() call
  - [ ] Add conditional pagination (small vs large result sets)
  - [ ] Use in-memory scoring for <1000 results
  - [ ] Use database pagination for >=1000 results

- [ ] Update response handling
  - [ ] Ensure pagination metadata is correct
  - [ ] Maintain backward compatibility

- [ ] Testing
  - [ ] Test with small result set (<100 records)
  - [ ] Test with medium result set (100-1000 records)
  - [ ] Test with large result set (>1000 records)
  - [ ] Benchmark query time improvement
  - [ ] Verify relevance scoring still works

---

### I2. Client-Side Rendering Overuse (6 hours)

**Frontend Developer**

- [ ] Audit all components
  ```bash
  rg "use client" src/components/ -l | while read file; do
    if ! rg "useState|useEffect|onClick|onChange" "$file" > /dev/null; then
      echo "Server Component candidate: $file"
    fi
  done
  ```

- [ ] Convert static components to Server Components
  - [ ] `EmptyState.tsx` - remove 'use client'
  - [ ] `AnimalAvatar.tsx` - remove 'use client'
  - [ ] Parts of `Breadcrumbs.tsx`

- [ ] Split interactive components
  - [ ] Create `AnimalCardActions.tsx` (client component)
  - [ ] Update `AnimalCard.tsx` (server component + actions)
  - [ ] Create `CustomerCardActions.tsx` (client component)
  - [ ] Update `CustomerCard.tsx` (server component + actions)

- [ ] Update imports and exports
  - [ ] Ensure proper component boundaries
  - [ ] Test component composition

- [ ] Measure improvements
  - [ ] Compare bundle size before/after
  - [ ] Measure initial page load time
  - [ ] Verify hydration works correctly

- [ ] Testing
  - [ ] Visual regression testing
  - [ ] Test all interactive features still work
  - [ ] Run E2E tests
  - [ ] Check for hydration errors in console

---

### I3. Database Indexes on Search Fields (1 hour)

**Backend Developer / DevOps**

- [ ] Update Prisma schema (`prisma/schema.prisma`)
  - [ ] Add index on `customer.firstname`
  - [ ] Add index on `customer.phone1`
  - [ ] Add index on `customer.email`
  - [ ] Consider composite index on frequently searched columns

- [ ] Create and test migration
  - [ ] Generate migration: `pnpm prisma migrate dev --name add_search_indexes`
  - [ ] Review generated SQL
  - [ ] Test migration in development
  - [ ] Benchmark search performance improvement

- [ ] Documentation
  - [ ] Document index strategy in schema comments
  - [ ] Update migration guide

---

### I4. Extract Business Logic to Services (8 hours)

**Backend Developer**

- [ ] Create service layer structure
  - [ ] Create `src/services/animals.service.ts`
  - [ ] Create `src/services/customers.service.ts`
  - [ ] Create `src/services/breeds.service.ts`
  - [ ] Create `src/services/notes.service.ts`

- [ ] Extract search/scoring logic
  - [ ] Move `calculateRelevanceScore()` to `animals.service.ts`
  - [ ] Move customer search logic to `customers.service.ts`
  - [ ] Make functions testable (pure where possible)

- [ ] Extract validation logic
  - [ ] Move pre-delete validation to service layer
  - [ ] Centralize business rules

- [ ] Update API routes
  - [ ] Refactor `src/app/api/animals/route.ts` to use service
  - [ ] Refactor `src/app/api/customers/route.ts` to use service
  - [ ] Refactor `src/app/api/breeds/route.ts` to use service
  - [ ] Keep routes thin (validation → service → response)

- [ ] Update tests
  - [ ] Create service layer tests
  - [ ] Mock services in API route tests
  - [ ] Improve test coverage

---

### I5. Repository Pattern for Prisma (4 hours)

**Backend Developer**

- [ ] Create repository interfaces
  - [ ] Define `IAnimalRepository` interface
  - [ ] Define `ICustomerRepository` interface
  - [ ] Define `IBreedRepository` interface

- [ ] Implement Prisma repositories
  - [ ] Create `src/repositories/animal.repository.ts`
  - [ ] Create `src/repositories/customer.repository.ts`
  - [ ] Create `src/repositories/breed.repository.ts`

- [ ] Update services to use repositories
  - [ ] Inject repository dependencies
  - [ ] Remove direct Prisma calls from services

- [ ] Update tests
  - [ ] Create mock repositories
  - [ ] Test services with mocked repositories
  - [ ] Test repository implementations

---

### I6. Centralize Configuration (2 hours)

**DevOps**

- [ ] Create config module (`src/lib/config.ts`)
  - [ ] Import validated env
  - [ ] Export typed config object
  - [ ] Group by domain (database, server, redis, etc.)

- [ ] Update all env access points
  - [ ] Replace `process.env.DATABASE_URL` with `config.database.url`
  - [ ] Replace `process.env.DEBUG` with `config.debug`
  - [ ] Update all API routes and utilities

- [ ] Testing
  - [ ] Verify all config accessed via central module
  - [ ] Test config types are correct

---

### I7. Fix Docker Health Check (30 minutes)

**DevOps**

- [ ] Update `docker-compose.yml`
  - [ ] Change health check from `-s -o /dev/null` to `-f`
  - [ ] Test health check fails on 4xx/5xx
  - [ ] Test health check passes on 200

- [ ] Update documentation
  - [ ] Document health check behavior in comments

---

### I8. Request Deduplication (4 hours)

**Frontend Developer**

- [ ] Evaluate approach
  - [ ] Research React Query vs custom solution
  - [ ] Document decision

- [ ] Implement deduplication
  - [ ] If React Query: Migrate stores to use queries
  - [ ] If custom: Add request cache with TTL to stores

- [ ] Update components
  - [ ] Remove redundant fetch calls
  - [ ] Use cached data where appropriate

- [ ] Testing
  - [ ] Verify same request only fires once
  - [ ] Test cache invalidation works
  - [ ] Measure network request reduction

---

### I9. Add Proper Type Exports (2 hours)

**Backend Developer**

- [ ] Create API types module (`src/types/api.ts`)
  - [ ] Export `AnimalResponse` type
  - [ ] Export `CustomerResponse` type
  - [ ] Export `BreedResponse` type
  - [ ] Export `NoteResponse` type
  - [ ] Export pagination types
  - [ ] Export error response types

- [ ] Update components to use shared types
  - [ ] Replace inline types in stores
  - [ ] Replace inline types in components
  - [ ] Ensure consistency across layers

- [ ] Update OpenAPI spec
  - [ ] Consider generating types from OpenAPI
  - [ ] Or generate OpenAPI from types

---

### I10. Optimize Docker Image (2 hours)

**DevOps**

- [ ] Update Dockerfile
  - [ ] Change base image to `node:20-alpine`
  - [ ] Remove redundant mariadb-client
  - [ ] Keep only mysql-client

- [ ] Test build
  - [ ] Build new image
  - [ ] Compare image sizes
  - [ ] Test image functionality

- [ ] Update documentation
  - [ ] Document Alpine-specific considerations

---

### I11. Add Missing Store Tests (3 hours)

**Frontend Developer / QA**

- [ ] Add race condition tests
  - [ ] Test rapid successive updates
  - [ ] Test update during search refresh
  - [ ] Test parallel deletions

- [ ] Add error recovery tests
  - [ ] Test recovery from network errors
  - [ ] Test partial failure scenarios

- [ ] Add persistence tests
  - [ ] Test localStorage persistence
  - [ ] Test state hydration
  - [ ] Test persistence edge cases

- [ ] Run coverage report
  - [ ] `pnpm test:coverage`
  - [ ] Aim for >80% coverage on stores

---

### I12. Improve E2E Test Coverage (4 hours)

**QA**

- [ ] Add error scenario tests
  - [ ] Test 404 handling
  - [ ] Test 500 handling
  - [ ] Test network failures

- [ ] Add validation tests
  - [ ] Test form validation errors
  - [ ] Test API validation errors

- [ ] Add navigation tests
  - [ ] Test browser back/forward
  - [ ] Test deep linking

- [ ] Add concurrent user scenarios
  - [ ] Test multiple browsers simultaneously
  - [ ] Test race conditions in UI

- [ ] Update existing tests
  - [ ] Make tests more robust
  - [ ] Reduce flakiness
  - [ ] Add better assertions

---

### I13. Update Dependencies (30 minutes)

**DevOps**

- [ ] Update Zod (already done in pre-sprint)
  - [ ] Verify: `pnpm list zod` shows 4.1.13

- [ ] Check for other updates
  - [ ] Run: `pnpm outdated`
  - [ ] Review and update patch versions
  - [ ] Test after updates

- [ ] Update lockfile
  - [ ] `pnpm install`
  - [ ] Commit updated lockfile

---

## Week 2 Testing & Validation

- [ ] Run full test suite: `pnpm test`
- [ ] Run E2E tests: `pnpm test:e2e`
- [ ] Run type check: `pnpm type-check`
- [ ] Run linter: `pnpm lint`
- [ ] Run formatter check: `pnpm fmt:check`
- [ ] Build production: `pnpm build`
- [ ] Verify bundle size reduction (target: 30% smaller)
- [ ] Benchmark search performance (target: 50% faster)
- [ ] Load test API endpoints
- [ ] Test Docker image (should be ~40% smaller)

---

## Week 2 Completion Checklist

- [ ] All important issues implemented (or prioritized subset)
- [ ] All tests passing
- [ ] Performance improvements measured
- [ ] Bundle size reduced
- [ ] Search performance improved
- [ ] Code reviewed by team
- [ ] Documentation updated

---

## Deployment Preparation

### Pre-Deployment Checklist

- [ ] All tests passing: `pnpm check`
- [ ] Production build successful: `pnpm build`
- [ ] Docker image builds: `docker build -t next-ppdb:test .`
- [ ] Environment variables documented
- [ ] Migration plan documented
- [ ] Rollback plan documented

### Version Bump

- [ ] Update version in package.json
  ```bash
  npm version patch  # 0.1.2 → 0.1.3
  ```

- [ ] Update CHANGELOG.md
  - [ ] Document all changes
  - [ ] Credit contributors

### Build & Push

- [ ] Build Docker image
  ```bash
  docker build -t ghcr.io/robin-collins/next-ppdb:v0.1.3 .
  ```

- [ ] Test image locally
  ```bash
  docker run -p 3000:3000 ghcr.io/robin-collins/next-ppdb:v0.1.3
  ```

- [ ] Push to registry
  ```bash
  docker push ghcr.io/robin-collins/next-ppdb:v0.1.3
  docker tag ghcr.io/robin-collins/next-ppdb:v0.1.3 ghcr.io/robin-collins/next-ppdb:latest
  docker push ghcr.io/robin-collins/next-ppdb:latest
  ```

### Deployment

- [ ] Update `docker-compose.yml`
  - [ ] Change image tag to v0.1.3
  - [ ] Review environment variables
  - [ ] Add new Upstash Redis vars

- [ ] Deploy
  ```bash
  docker-compose pull next-ppdb
  docker-compose up -d next-ppdb
  ```

- [ ] Verify health
  ```bash
  curl http://localhost:3000/api/health
  docker logs next-ppdb
  ```

### Post-Deployment Validation

- [ ] Check application logs for errors
- [ ] Test critical user flows
  - [ ] Search functionality
  - [ ] Create/update/delete operations
  - [ ] Admin functions

- [ ] Monitor rate limiting
  - [ ] Check rate limit headers
  - [ ] Verify no false positives

- [ ] Verify no console.log output
  - [ ] Check Docker logs
  - [ ] Should only see structured JSON logs

- [ ] Performance verification
  - [ ] Search response time <300ms
  - [ ] Page load time <1.5s
  - [ ] Database queries optimized

---

## Success Metrics

### Week 1 Targets

| Metric | Target | Actual |
|--------|--------|--------|
| Console.log in production | 0 | ___ |
| Rate limit violations | <5/day | ___ |
| Silent failures | 0 | ___ |
| Environment validation failures | 0 | ___ |
| User-friendly errors | 100% | ___ |

### Week 2 Targets

| Metric | Before | Target | Actual |
|--------|--------|--------|--------|
| API response time (avg) | 450ms | <300ms | ___ |
| Bundle size | 512KB | <350KB | ___ |
| Initial page load | 2.8s | <1.5s | ___ |
| Search query time | 200ms | <100ms | ___ |
| Docker image size | ~1.2GB | <800MB | ___ |

---

## Rollback Plan

If deployment fails:

1. **Quick Rollback**
   ```bash
   docker-compose down
   # Edit docker-compose.yml: image: ghcr.io/robin-collins/next-ppdb:v0.1.2
   docker-compose up -d next-ppdb
   ```

2. **Verify Rollback**
   ```bash
   curl http://localhost:3000/api/health
   docker logs next-ppdb
   ```

3. **Investigate Issue**
   - Review deployment logs
   - Check environment variables
   - Test in staging environment
   - Fix and re-deploy

---

## Notes

- **Track progress** by checking boxes as you complete tasks
- **Estimate times** are guidelines; adjust based on actual work
- **Prioritize** Week 1 tasks (critical) over Week 2 (important)
- **Test continuously** as you implement each task
- **Document issues** encountered and solutions found
- **Commit frequently** with clear, descriptive messages

---

**Last Updated**: December 3, 2025
**Sprint Start**: TBD
**Sprint End**: TBD
**Release Target**: v0.1.3
