# Unified Logging System

**Status**: ✅ **ACTIVE**  
**Created**: 2025-11-16

## Overview

The Pampered Pooch Database application includes a comprehensive unified logging system that provides consistent, colorized, formatted output for:

- **API Requests** - HTTP method, path, query parameters, request body
- **API Responses** - Status code, duration
- **SQL Queries** - Raw SQL, parameters, execution time (via Prisma)
- **Errors** - Error messages, stack traces
- **Warnings** - Non-fatal issues
- **Info** - General application events

## Enable Logging

### Development Mode (Automatic)

Logging is automatically enabled when `NODE_ENV=development`:

```bash
pnpm dev  # Logging enabled by default
```

### Production Mode (Manual)

To enable logging in production, set the `DEBUG` environment variable:

```bash
DEBUG=true pnpm start
```

Or in `.env`:

```env
DEBUG=true
```

### Disable Logging

```bash
DEBUG=false pnpm dev
```

Or remove/comment out `DEBUG` in `.env`.

## Log Output Format

### API Requests

```
[2025-11-16 14:30:45] GET    /api/animals?q=buddy
[2025-11-16 14:30:45] POST   /api/customers Body: {"firstname":"John","surname":"Doe"}
[2025-11-16 14:30:45] PUT    /api/animals/123
[2025-11-16 14:30:45] DELETE /api/customers/456
```

**Format:**

```
[TIMESTAMP] METHOD PATH?QUERY Body: {...}
```

**Colors:**

- `GET` - Green
- `POST` - Yellow
- `PUT` - Blue
- `DELETE` - Red
- `PATCH` - Magenta

### SQL Queries

```
[2025-11-16 14:30:45] SQL    SELECT `ppdb-app`.`animal`.`animalID`, ...
   Params: [123]
   (5ms)
```

**Format:**

```
[TIMESTAMP] SQL    <query>
   Params: [...]
   (duration)
```

**Color:** Cyan

### API Responses

```
[2025-11-16 14:30:45] GET    /api/animals 200 (45ms)
[2025-11-16 14:30:46] POST   /api/customers 201 (123ms)
[2025-11-16 14:30:47] PUT    /api/animals/123 400 (15ms)
[2025-11-16 14:30:48] DELETE /api/customers/456 500 (234ms)
```

**Format:**

```
[TIMESTAMP] METHOD PATH STATUS (duration)
```

**Status Colors:**

- `2xx` - Green (success)
- `3xx` - Cyan (redirect)
- `4xx` - Yellow (client error)
- `5xx` - Red (server error)

### Errors

```
[2025-11-16 14:30:45] ERROR  Failed to create customer
   Customer with email already exists
   at POST (/src/app/api/customers/route.ts:45:12)
```

**Format:**

```
[TIMESTAMP] ERROR  <message>
   <error details>
   <stack trace>
```

**Color:** Red

### Warnings

```
[2025-11-16 14:30:45] WARN   Database connection pool is running low
```

**Format:**

```
[TIMESTAMP] WARN   <message>
```

**Color:** Yellow

### Info

```
[2025-11-16 14:30:45] INFO   Server started on port 3000
```

**Format:**

```
[TIMESTAMP] INFO   <message>
```

**Color:** White

## Complete Request Example

Here's what a complete API request looks like with unified logging:

```
[2025-11-16 14:30:45] POST   /api/animals Body: {"name":"Buddy","breed":"Labrador",...}
[2025-11-16 14:30:45] SQL    SELECT `ppdb-app`.`breed`.`breedID` FROM `ppdb-app`.`breed` WHERE `ppdb-app`.`breed`.`breedname` = ?
   Params: ["Labrador"]
   (3ms)
[2025-11-16 14:30:45] SQL    INSERT INTO `ppdb-app`.`animal` (`animalname`,`breedID`,`SEX`,`customerID`,`colour`,`cost`,`lastvisit`,`thisvisit`,`comments`) VALUES (?,?,?,?,?,?,?,?,?)
   Params: ["Buddy",1,"Male",7742,"Brown",50,"2025-11-16T00:00:00.000Z","2025-11-16T00:00:00.000Z",null]
   (12ms)
[2025-11-16 14:30:45] SQL    SELECT `ppdb-app`.`animal`.`animalID`, ... FROM `ppdb-app`.`animal` WHERE `ppdb-app`.`animal`.`animalID` = ?
   Params: [8543]
   (2ms)
[2025-11-16 14:30:45] POST   /api/animals 201 (45ms)
```

## Implementation Details

### Logger Utility (`src/lib/logger.ts`)

The core logging utility provides functions for different log types:

```typescript
import { logApiRequest, logApiResponse, logSql, logError, logWarn, logInfo } from '@/lib/logger'

// API request logging
logApiRequest({ method: 'POST', path: '/api/animals', body: {...} })

// API response logging
logApiResponse({ method: 'POST', path: '/api/animals', status: 201, duration: 45 })

// SQL query logging
logSql('SELECT * FROM animal WHERE id = ?', [123], 5)

// Error logging
logError('Failed to create customer', error)

// Warning logging
logWarn('Database pool running low')

// Info logging
logInfo('Server started')
```

### Prisma Integration (`src/lib/prisma.ts`)

SQL queries are automatically logged via Prisma's event system:

```typescript
// Prisma is configured to emit query events
prisma.$on('query', e => {
  logSql(e.query, JSON.parse(e.params), e.duration)
})
```

**What's Logged:**

- Raw SQL query
- Parameter values
- Execution time in milliseconds

**Respects DEBUG setting** - Only logs when `DEBUG=true` or `NODE_ENV=development`

### Next.js Middleware (`src/middleware.ts`)

All API requests are automatically logged by Next.js middleware:

```typescript
// Middleware intercepts all /api/* requests
export const config = {
  matcher: '/api/:path*',
}
```

**What's Logged:**

- HTTP method (GET, POST, PUT, DELETE, PATCH)
- Request path
- Query parameters

**No code changes needed** - All API routes are logged automatically!

### API Route Wrapper (Optional)

For more detailed logging including response status, you can optionally wrap route handlers:

```typescript
import { withApiLogger } from '@/lib/logger'

async function handler(request: NextRequest) {
  // Your route logic
  return NextResponse.json({ success: true })
}

export const GET = withApiLogger(handler)
export const POST = withApiLogger(handler)
```

This provides:

- Request logging (method, path, query, body)
- Response logging (status, duration)
- Automatic error logging

## Performance Impact

### Development Mode

- **Minimal** - Logging adds ~1-2ms per request
- Queries are logged asynchronously
- No noticeable performance degradation

### Production Mode (DEBUG=false)

- **Zero** - All logging is disabled via early return checks
- No performance overhead
- Logs are only produced if explicitly enabled via `DEBUG=true`

## Log Filtering

### View Only SQL Queries

```bash
pnpm dev | grep "SQL"
```

### View Only API Requests

```bash
pnpm dev | grep -E "(GET|POST|PUT|DELETE|PATCH)"
```

### View Only Errors

```bash
pnpm dev | grep "ERROR"
```

### View Specific Endpoint

```bash
pnpm dev | grep "/api/animals"
```

## Troubleshooting

### Logs Not Appearing

1. **Check DEBUG setting:**

   ```bash
   echo $DEBUG
   # Should be "true" or undefined (defaults to true in development)
   ```

2. **Check NODE_ENV:**

   ```bash
   echo $NODE_ENV
   # Should be "development" for auto-enable
   ```

3. **Restart dev server:**
   ```bash
   pnpm dev
   ```

### Too Many Logs

Disable specific log types by modifying `src/lib/logger.ts`:

```typescript
// Disable SQL logging
export function logSql() {
  return // Early return
}

// Disable API request logging
export function logApiRequest() {
  return
}
```

### SQL Queries Not Logged

Ensure Prisma event subscription is active in `src/lib/prisma.ts`:

```typescript
if (isDebugEnabled) {
  prisma.$on('query', e => {
    logSql(e.query, JSON.parse(e.params), e.duration)
  })
}
```

## Example Session Output

Here's a typical development session with unified logging:

```
[2025-11-16 14:30:42] INFO   Starting dev server on http://localhost:3000
[2025-11-16 14:30:45] GET    /api/customers?q=smith
[2025-11-16 14:30:45] SQL    SELECT `ppdb-app`.`customer`.* FROM `ppdb-app`.`customer` WHERE ...
   Params: ["%smith%"]
   (8ms)
[2025-11-16 14:30:45] GET    /api/customers 200 (15ms)
[2025-11-16 14:30:48] GET    /api/customer/7742
[2025-11-16 14:30:48] SQL    SELECT `ppdb-app`.`customer`.* FROM `ppdb-app`.`customer` WHERE `customerID` = ?
   Params: [7742]
   (3ms)
[2025-11-16 14:30:48] SQL    SELECT `ppdb-app`.`animal`.* FROM `ppdb-app`.`animal` WHERE `customerID` = ?
   Params: [7742]
   (5ms)
[2025-11-16 14:30:48] GET    /api/customer/7742 200 (12ms)
[2025-11-16 14:30:52] POST   /api/animals Body: {"name":"Max","breed":"Poodle",...}
[2025-11-16 14:30:52] SQL    SELECT `breedID` FROM `breed` WHERE `breedname` = ?
   Params: ["Poodle"]
   (2ms)
[2025-11-16 14:30:52] SQL    INSERT INTO `animal` (...) VALUES (?,?,?,?,?,?,?,?,?)
   Params: ["Max",3,"Male",7742,"White",60,"2025-11-16T00:00:00.000Z","2025-11-16T00:00:00.000Z",null]
   (15ms)
[2025-11-16 14:30:52] POST   /api/animals 201 (35ms)
```

## Benefits

✅ **Unified Format** - All logs follow the same structure  
✅ **Color-Coded** - Easy to scan visually  
✅ **Timestamped** - Track request sequences  
✅ **Performance Metrics** - See SQL and API timing  
✅ **Complete Context** - See full request lifecycle  
✅ **Zero Config** - Works out of the box in development  
✅ **Production Safe** - Disabled by default in production  
✅ **Easy Filtering** - Use grep/awk for specific logs

## Related Files

- `src/lib/logger.ts` - Core logging utility
- `src/lib/prisma.ts` - Prisma client with SQL logging
- `src/middleware.ts` - Next.js middleware for API logging
- `LOGGING.md` - This documentation

---

**Last Updated**: 2025-11-16  
**Author**: Development Team  
**Status**: Active & Production-Ready
