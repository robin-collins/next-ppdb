# Routing Enforcement Policy

**Status**: 🔒 **ENFORCED** - All deviations will be rejected

**Created**: 2025-11-16

## Authority

`ROUTES.md` is the **single source of truth** for all routing decisions in this application.

## Enforcement Rules

### 1. No Manual Route Construction

**❌ FORBIDDEN:**

```typescript
router.push(`/customers/${id}`) // Typo risk, inconsistent
router.push('/animals/new?customerId=' + id) // Wrong pattern
```

**✅ REQUIRED:**

```typescript
import { routes } from '@/lib/routes'

router.push(routes.customers.detail(id))
router.push(routes.customers.newAnimal(id))
```

### 2. Route Helper Usage Mandatory

All navigation MUST use the route helpers from `src/lib/routes.ts`:

- `router.push()` calls
- `<Link href="">` components
- API fetch URLs
- Redirect logic
- Breadcrumb generation

### 3. Route Pattern Validation

Before merging any PR that adds/modifies routes:

**Checklist:**

- [ ] Route follows "nest for context, flatten for identity" pattern
- [ ] No URLs exceed 2 levels of nesting
- [ ] No query parameters for resource identification
- [ ] Route helper exists in `src/lib/routes.ts`
- [ ] All navigation uses route helper (no hardcoded strings)
- [ ] `ROUTES.md` updated if new routes added
- [ ] Tests updated to use route helpers
- [ ] No `/customers/` (plural) for detail pages - use `/customer/` (singular)

### 4. Code Review Requirements

Reviewers must reject PRs that:

1. Hardcode route strings instead of using helpers
2. Use incorrect nesting patterns
3. Use query params for resource creation (`?customerId=X`)
4. Create routes deeper than 2 levels
5. Don't update `ROUTES.md` when adding new routes

### 5. Automated Checks

Add linting rule to catch hardcoded routes:

```typescript
// .eslintrc.js
rules: {
  'no-restricted-syntax': [
    'error',
    {
      selector: "TemplateLiteral[expressions.length>0] > *[value=/^\\/(?:customer|animal|breed|note)s?\\/$/]",
      message: 'Use route helpers from @/lib/routes instead of hardcoded route strings'
    }
  ]
}
```

## Migration Path

### Existing Code

Gradually refactor existing navigation to use route helpers:

1. **Phase 1**: Fix all incorrect patterns (COMPLETE)
2. **Phase 2**: Replace hardcoded routes with helpers (NEXT)
3. **Phase 3**: Add linting rule to prevent regressions

### New Code

All new code MUST use route helpers from day one.

## Examples

### ✅ Correct Usage

```typescript
import { routes } from '@/lib/routes'

// Customer navigation
<Link href={routes.customers.detail(customer.id)}>View Customer</Link>
router.push(routes.customers.newAnimal(customerId))

// Animal navigation
<Link href={routes.animals.detail(animal.id)}>View Animal</Link>
router.push(routes.animals.newNote(animalId))

// Note navigation
<Link href={routes.notes.detail(note.id)}>View Note</Link>
router.push(routes.notes.edit(noteId))

// API calls
const res = await fetch(routes.api.customers.byId(id))
```

### ❌ Incorrect Usage

```typescript
// Hardcoded strings
<Link href={`/customer/${id}`}>View</Link>  ❌
router.push(`/animals/${id}`)  ❌

// Wrong pattern (plural for detail)
router.push(`/customers/${id}`)  ❌

// Query params for creation
router.push(`/animals/new?customerId=${id}`)  ❌

// Too deep
router.push(`/customer/${cid}/animal/${aid}/note/${nid}`)  ❌
```

## Benefits

1. **Type Safety**: TypeScript catches route errors at compile time
2. **Consistency**: All routes follow the same pattern
3. **Refactoring**: Change route structure in one place
4. **Documentation**: Route helpers serve as documentation
5. **Maintainability**: No hunting for hardcoded strings

## Exceptions

None. All navigation must use route helpers.

If a route helper doesn't exist for your use case:

1. Add it to `src/lib/routes.ts`
2. Update `ROUTES.md` with the new route
3. Use the new helper

## Accountability

- **Developers**: Use route helpers in all new code
- **Reviewers**: Reject PRs with hardcoded routes
- **Tech Lead**: Maintain `ROUTES.md` and enforce this policy

## Resources

- `ROUTES.md` - Routing specification
- `src/lib/routes.ts` - Route helper utilities
- `CHANGELOG.md` - Route change history

---

**Last Updated**: 2025-11-16
**Policy Owner**: Development Team
**Status**: Active & Enforced
