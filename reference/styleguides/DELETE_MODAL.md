# Delete Confirmation Modal Specification

**Purpose**: Standardized delete confirmation pattern for preventing accidental deletions, handling orphaned records, and providing clear visual feedback.

**Reference Implementation**: `src/components/breeds/BreedTable.tsx`

---

## Goals

1. **Prevent Accidental Deletion**: Require explicit confirmation by typing the exact name
2. **Handle Orphaned Records**: When deleting a parent record, migrate dependent records to another parent
3. **Visual Clarity**: Large, prominent modal with warning colors so users know they're performing a destructive action

---

## User Flow

### Step 1: Initiate Delete

- User clicks delete button/icon next to a record
- System captures the button's position for modal placement
- Modal appears with loading state

### Step 2: Check Dependencies

- API call to check for dependent/orphaned records (e.g., animals using a breed)
- Display loading spinner: "Checking for associated [dependents]..."

### Step 3: Display Confirmation Modal

Modal shows one of two states:

**A) No Dependencies**

- Warning message about permanent deletion
- Type-to-confirm input field
- Delete button (disabled until name matches)

**B) Has Dependencies**

- Warning message with dependency count (e.g., "5 animal(s) use this breed")
- Migration dropdown listing all OTHER records of the same type
- Type-to-confirm input field
- Delete button (disabled until name matches AND migration target selected)

### Step 4: Confirm Deletion

- User types exact name of record
- If dependencies exist, user selects migration target
- User clicks "Delete" button
- System migrates orphans (if applicable), then deletes record
- Success toast notification appears

---

## Visual Design

### Modal Container

```
Position: Fixed, centered horizontally
Vertical: Positioned near the clicked button (not center of screen)
Z-index: 400+ (above all other content)
Width: max-width 512px (max-w-lg)
Background: White with red border (2px solid #ef4444)
Border-radius: 12px (rounded-xl)
Shadow: Large drop shadow (shadow-2xl)
Animation: slideInUp 0.2s ease-out
```

### Backdrop

```
Position: Fixed, covers entire viewport
Background: Black at 40% opacity (bg-black/40)
Click action: Closes modal (cancel)
```

### Header Section

```
Layout: Flex row with icon, title, close button
Icon: Red warning icon in light red circle (bg-red-100)
Title: Large bold red text "Delete [Name]?"
Subtitle: "This action cannot be undone."
Close button: X icon in top-right corner
```

### Dependency Warning (when applicable)

```
Background: Amber/yellow gradient (bg-amber-50)
Border: Amber border (border-amber-200)
Icon: Warning triangle
Text: Bold count + "use this [entity]"
Dropdown: Full-width select with all OTHER records
Placeholder: "-- Select a [entity] --"
```

### Type-to-Confirm Section

```
Label: "To confirm, type [name] below:"
Name display: Monospace code block with red text
Input: Full-width, red border, placeholder showing expected text
Validation: Real-time comparison, exact match required
```

### Action Buttons

```
Layout: Flex row, delete button takes more space (flex-1)
Delete button (enabled): Red background, white text
Delete button (disabled): Gray background, gray text, cursor-not-allowed
Cancel button: Outline style, gray border
```

---

## State Management

### Delete Confirmation State Interface

```typescript
interface DeleteConfirmState {
  id: number // ID of record being deleted
  name: string // Display name (for confirmation)
  typedName: string // User's typed confirmation
  dependentCount: number | null // null = loading, 0+ = count
  loading: boolean // True while fetching dependency count
  migrateToId: number | null // Selected migration target ID
  rowRect: DOMRect | null // Position of clicked button
}
```

### Delete Can Proceed When

```typescript
const canDelete =
  typedName === name && // Name matches exactly
  (!hasDependents || migrateToId !== null) // No orphans OR migration selected
```

---

## API Requirements

### 1. Dependency Count Endpoint (GET)

```
GET /api/[entity]/[id]/[dependents]/count

Response: { count: number }

Example:
GET /api/breeds/123/animals/count
GET /api/customers/456/animals/count
```

### 2. Delete Endpoint (DELETE)

```
DELETE /api/[entity]/[id]

Request Body (optional):
{
  "migrateToId": number  // Only when migrating dependents
}

Response (success):
{
  "success": true,
  "migratedRecords": number  // Count of migrated dependents
}

Response (error - has dependents, no migration):
{
  "error": "Cannot delete [entity] with associated [dependents]",
  "details": "There are X [dependent](s) using this [entity].",
  "dependentCount": number
}
```

---

## Entity-Specific Configuration

| Entity   | Dependent Entity | Dependency Field | Migration Message                       |
| -------- | ---------------- | ---------------- | --------------------------------------- |
| Breed    | Animal           | `breedID`        | "X animal(s) use this breed"            |
| Customer | Animal           | `customerID`     | "X animal(s) belong to this customer"   |
| Animal   | Notes            | `animalID`       | "X note(s) are attached to this animal" |

---

## Implementation Checklist

### For Each Entity Type:

- [ ] **API: Count endpoint** - `GET /api/[entity]/[id]/[dependents]/count`
- [ ] **API: Update DELETE** - Accept `migrateToId`, perform migration before delete
- [ ] **Component: Delete state** - Add `DeleteConfirmState` to component
- [ ] **Component: initiateDelete** - Function to open modal and fetch count
- [ ] **Component: Modal JSX** - Floating modal with all sections
- [ ] **Component: Migration dropdown** - List of OTHER records (exclude current)
- [ ] **Component: Validation** - Enable delete only when conditions met
- [ ] **Page: Update onDelete** - Pass `migrateToId` to API
- [ ] **Page: Toast feedback** - Show success/error toast with migration count

---

## Keyboard & Accessibility

- **Escape key**: Closes modal (cancel)
- **Backdrop click**: Closes modal (cancel)
- **Auto-focus**: Confirmation input field receives focus when modal opens
- **ARIA labels**: All interactive elements properly labeled
- **Role**: Modal has `role="dialog"` (implicit via structure)

---

## Error Handling

| Scenario                 | Behavior                                      |
| ------------------------ | --------------------------------------------- |
| Count API fails          | Assume 0 dependents, show confirmation anyway |
| Delete API fails         | Show error toast, keep modal open             |
| Migration target invalid | API returns 400, show error toast             |
| Network error            | Show error toast with generic message         |

---

## Code Reference

### Key Files (Breed Implementation)

- `src/components/breeds/BreedTable.tsx` - Modal component and state
- `src/app/api/breeds/[id]/route.ts` - DELETE with migration support
- `src/app/api/breeds/[id]/animals/count/route.ts` - Dependency count
- `src/app/breeds/page.tsx` - onDelete handler with migration param

### Reusable Patterns

The modal content could be extracted to a shared component:

```typescript
// Potential shared component
<DeleteConfirmModal
  entityType="breed"
  entityName={name}
  dependentType="animal"
  dependentCount={count}
  migrationOptions={otherBreeds}
  onConfirm={(migrateToId) => handleDelete(id, migrateToId)}
  onCancel={() => setDeleteConfirm(null)}
/>
```

_Last Updated: 2025-12-01_
