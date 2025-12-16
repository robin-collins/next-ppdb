# SETUP_REDIRECT.md

## Objective

Document how to keep the automatic redirect to `/setup` when the database is empty while **removing** `export const dynamic = 'force-dynamic'` from `src/app/layout.tsx`, preserving Next.js performance defaults and best practices.

## Current Startup/Redirect Flow

- `RootLayout` wraps the app in `SetupGuard` and forces dynamic rendering globally via `export const dynamic = 'force-dynamic'`. 【F:src/app/layout.tsx†L1-L25】
- `SetupGuard` is a server component that:
  - Reads the pathname via `headers()` to know what route is being processed. 【F:src/components/SetupGuard.tsx†L40-L55】
  - Runs `runDiagnostics()` (cached health checks) and redirects to `/setup` on `needs_setup` or `unhealthy` results. 【F:src/components/SetupGuard.tsx†L58-L105】
  - Bypasses `/setup`, `/api`, `_next`, `favicon`, and `/docs` paths. 【F:src/components/SetupGuard.tsx†L13-L55】
- Diagnostics explicitly test for empty tables (`checkDataPresent`) and mark the status as `needs_setup` when any required table has zero rows. 【F:src/lib/diagnostics/index.ts†L83-L109】【F:src/lib/diagnostics/checks.ts†L233-L286】
- Middleware injects an `x-pathname` header to make the current path available to `SetupGuard`, but defers database logic to the guard itself. 【F:src/middleware.ts†L47-L84】
- Architecture docs describe the guard as running on each request with bypass paths and cached health results. 【F:ARCHITECTURE.md†L1001-L1032】

## Problem Statement

Forcing `dynamic = 'force-dynamic'` at the root layout removes opportunities for static optimization and incremental static regeneration across the entire app. We need a redirect solution that still evaluates database state per request when necessary but allows Next.js to keep its default dynamic/static heuristics elsewhere.

## Constraints & Best-Practice Considerations

- **Dynamic rendering without `force-dynamic`:** Accessing request headers or cookies in a Server Component automatically opts the route into dynamic rendering at request time. 【External:https://nextjs.org/docs/app/api-reference/functions/headers】
- **Bypassing Next.js data cache:** Calling `noStore()` (or `unstable_noStore` in older releases) disables the fetch cache for the current request scope, ensuring database checks always re-evaluate when invoked. 【External:https://nextjs.org/docs/app/building-your-application/data-fetching/fetching#opting-out-of-data-caching】
- **Middleware limitations:** Middleware runs on the Edge runtime and should avoid direct database access; heavy logic belongs in Route Handlers or server components. 【External:https://nextjs.org/docs/app/building-your-application/routing/middleware#supported-environments】

## Recommended Approach (Remove `force-dynamic`, Keep Redirect)

1. **Rely on request-bound APIs to trigger dynamic rendering:** `SetupGuard` already calls `headers()`, which is sufficient for dynamic rendering of any tree wrapped by the guard without global `force-dynamic`. Keep the guard in `RootLayout` (or a protected sub-layout) so the redirect still executes during server rendering. 【F:src/components/SetupGuard.tsx†L40-L57】【F:src/app/layout.tsx†L14-L25】
2. **Make the guard’s work explicitly uncached:** Import `noStore` from `next/cache` and invoke it at the top of `SetupGuard` (before diagnostics) to prevent the request from entering the fetch cache and to guarantee fresh health evaluation when the guard runs. 【External:https://nextjs.org/docs/app/building-your-application/data-fetching/fetching#opting-out-of-data-caching】
3. **Keep diagnostics fast via existing TTL:** Preserve the current health-result cache (60s healthy, 10s unhealthy/needs_setup) so per-request `SetupGuard` execution does not overload the database while still reacting quickly to empty-table states. 【F:src/lib/diagnostics/index.ts†L13-L90】
4. **Avoid bypass loopholes:** Remove the referer-based bypass in `SetupGuard` to ensure the guard runs when navigating away from `/setup`; architecture docs already call out this risk. 【F:src/components/SetupGuard.tsx†L48-L55】【F:ARCHITECTURE.md†L1054-L1064】
5. **Redirect with existing flow:** Continue using `redirect('/setup')` on `needs_setup`/`unhealthy` statuses; the `checkDataPresent` step guarantees empty tables trigger `needs_setup`. 【F:src/components/SetupGuard.tsx†L58-L105】【F:src/lib/diagnostics/checks.ts†L233-L286】

## Proposed Implementation Steps

1. Remove `export const dynamic = 'force-dynamic'` from `src/app/layout.tsx`.
2. In `src/components/SetupGuard.tsx`, add `import { noStore } from 'next/cache'` and call `noStore()` before reading headers/diagnostics.
3. Drop the referer-based bypass check so only pathname-driven bypass rules apply.
4. Confirm middleware still sets `x-pathname` for the guard and leave diagnostics caching intact.
5. Manually verify: start with an empty database, load any non-setup page, observe redirect to `/setup`, complete setup/import, then revisit a protected route to confirm normal rendering after data exists (cache should refresh within 10s on unhealthy/needs_setup and 60s on healthy results).

## Rationale

This approach keeps the redirect logic in a server component (aligned with Next.js guidance for request-time data and redirects), avoids global `force-dynamic` so other segments can remain static or ISR-capable, and uses `noStore()` plus existing TTL-based caching to balance correctness with performance. Middleware remains lightweight and edge-compatible, while the guard retains authority over database-aware routing.
