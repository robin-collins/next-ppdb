# Search Result Cards - Visual Enhancement Analysis

**Date:** 2025-12-01
**Purpose:** Improve search result card design to prioritize essential information for staff efficiency

---

## Current State Analysis

### Screenshot Review

The current card layout displays information in this structure:

```
┌─────────────────────────────────────────────────────────┐
│ ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ │  ← Gradient accent bar
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Avatar] Taffy        │ Andrews                     │ │
│ │          German Shep  │ Unknown (phone)             │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────┐ ┌─────────────────────────────┐ │
│ │ COLOR               │ │ LAST VISIT                  │ │
│ │ Black and tan       │ │ Jul 28, 12                  │ │
│ └─────────────────────┘ └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Current Issues Identified

1. **Equal Visual Weight to Unimportant Data**
   - COLOR section occupies 50% of bottom area but is stated as "not important"
   - Takes up valuable screen real estate

2. **Inconsistent Contact Display**
   - "Unknown" shown when no phone - provides no value
   - Phone numbers exist but not prominently displayed
   - Email is NOT displayed at all (missing entirely)

3. **Customer Name De-emphasized**
   - Same font size as other text
   - Not immediately scannable

4. **Location Information Styled as Badges**
   - Suburb and postcode shown as small pill badges
   - Can be missed at a glance

5. **Animal Name Could Be Larger**
   - Currently 18px (text-lg) - adequate but could be more prominent

6. **Missing Email Display**
   - Email is listed as important but not shown on cards at all

---

## Information Priority Hierarchy

Based on user requirements:

| Priority | Information                  | Current State   | Target State          |
| -------- | ---------------------------- | --------------- | --------------------- |
| **1**    | Animal Name                  | Medium emphasis | **LARGEST, BOLD**     |
| **2**    | Breed                        | Small, gray     | Prominent, under name |
| **3**    | Customer Name                | Small, cramped  | **LARGE, BOLD**       |
| **4**    | Phone                        | Teal, small     | **LARGE, prominent**  |
| **5**    | Location (Suburb + Postcode) | Tiny badges     | Clear, readable text  |
| **6**    | Email                        | **MISSING**     | Add if available      |
| **7**    | Last Visit                   | Small box       | Smaller, subtle       |
| **8**    | Color                        | 50% of bottom   | **REMOVE entirely**   |
| **9**    | Cost                         | Not shown       | Keep hidden (correct) |

---

## Proposed Card Redesign

### New Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ │
│                                                             │
│  [AVATAR]   TAFFY                          Last: Jul 28     │
│             German Shepherd                                 │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ANDREWS, Christine                                         │
│  Windsor Gardens  5087                                      │
│                                                             │
│  📞 0432 870 511                                            │
│  ✉️  christine@email.com                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Detailed Specifications

#### 1. Animal Section (Top)

| Element         | Current                     | Proposed                                     |
| --------------- | --------------------------- | -------------------------------------------- |
| **Animal Name** | `text-lg` (18px), font-bold | `text-2xl` (24px), font-bold, `--gray-900`   |
| **Breed**       | `text-sm` (14px), gray-600  | `text-base` (16px), `--primary`, font-medium |
| **Avatar**      | 48x48px                     | Keep same, ensure spacing                    |

```css
/* Proposed styles */
.animal-name {
  font-size: 1.5rem; /* 24px - up from 18px */
  font-weight: 700;
  color: var(--gray-900);
  line-height: 1.2;
}

.animal-breed {
  font-size: 1rem; /* 16px - up from 14px */
  font-weight: 500;
  color: var(--primary); /* Brand brown instead of gray */
}
```

#### 2. Customer Section (Middle)

| Element           | Current          | Proposed                        |
| ----------------- | ---------------- | ------------------------------- |
| **Customer Name** | `text-sm` (14px) | `text-lg` (18px), font-bold     |
| **Location**      | Tiny badge pills | `text-base` (16px), inline text |
| **Address**       | `text-xs` (12px) | Remove (not priority)           |

```css
/* Proposed styles */
.customer-name {
  font-size: 1.125rem; /* 18px - up from 14px */
  font-weight: 700;
  color: var(--gray-800);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.customer-location {
  font-size: 1rem;
  font-weight: 500;
  color: var(--secondary); /* Teal for location */
}
```

#### 3. Contact Section (Bottom)

| Element   | Current         | Proposed                              |
| --------- | --------------- | ------------------------------------- |
| **Phone** | `text-xs`, teal | `text-lg` (18px), bold, `--secondary` |
| **Email** | NOT DISPLAYED   | Add: `text-sm` (14px), `--gray-600`   |

```css
/* Proposed styles */
.contact-phone {
  font-size: 1.125rem; /* 18px */
  font-weight: 600;
  color: var(--secondary);
  font-family: 'Courier New', monospace; /* Easy to read numbers */
}

.contact-email {
  font-size: 0.875rem;
  color: var(--gray-600);
  word-break: break-all;
}
```

#### 4. Last Visit (Secondary Info)

| Element      | Current               | Proposed                 |
| ------------ | --------------------- | ------------------------ |
| **Position** | Bottom box, 50% width | Top-right corner, subtle |
| **Style**    | Box with label        | Small text, no box       |

```css
/* Proposed styles */
.last-visit {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 0.75rem;
  color: var(--gray-500);
  font-weight: 500;
}
```

#### 5. Removed Elements

- **COLOR field**: Remove entirely (not important to staff)
- **"Unknown" text**: Hide when no data instead of showing placeholder

---

## Visual Comparison

### Before (Current)

```
┌────────────────────────────────────────┐
│ [Av] Taffy          │ Andrews          │  ← Name buried in layout
│      German Shep    │ Unknown          │  ← "Unknown" adds no value
│                     │ [Windsor] [5087] │  ← Badges too small
├────────────────────┬───────────────────┤
│ COLOR              │ LAST VISIT        │  ← COLOR wastes space
│ Black and tan      │ Jul 28, 12        │
└────────────────────┴───────────────────┘
```

### After (Proposed)

```
┌────────────────────────────────────────┐
│                            Jul 28, 12  │  ← Last visit subtle
│ [Avatar]  TAFFY                        │  ← Animal name LARGE
│           German Shepherd              │  ← Breed prominent
│ ────────────────────────────────────── │
│ ANDREWS, Christine                     │  ← Customer name BOLD
│ Windsor Gardens  5087                  │  ← Location clear
│                                        │
│ 📞 0432 870 511                        │  ← Phone PROMINENT
│ ✉️  anna@example.com                    │  ← Email added
└────────────────────────────────────────┘
```

---

## Implementation Recommendations

### Phase 1: Quick Wins (Immediate)

1. **Remove COLOR section** - Delete the entire grid item showing color
2. **Increase animal name size** - Change from `text-lg` to `text-2xl`
3. **Increase customer name size** - Change from `text-sm` to `text-lg`
4. **Increase phone size** - Change from `text-xs` to `text-base` or `text-lg`

### Phase 2: Layout Restructure

1. **Move last visit** to top-right corner as subtle badge
2. **Remove location badges** - Display as plain text inline
3. **Add email display** - Include customer email if available
4. **Hide "Unknown"** - Show nothing instead of placeholder text

### Phase 3: Polish

1. **Add phone number formatting** - Display as `0432 870 511` with spaces
2. **Add click-to-call** - Make phone number a `tel:` link
3. **Add click-to-email** - Make email a `mailto:` link
4. **Consistent vertical spacing** - Clear visual sections

---

## Data Model Consideration

The `AnimalCard` component receives customer data including:

```typescript
customer: {
  id: number
  surname: string
  firstname?: string | null
  address?: string | null
  suburb?: string | null
  postcode?: number | null
  phone1?: string | null
  phone2?: string | null
  phone3?: string | null
  // NOTE: email is NOT in the interface!
}
```

**Action Required:** The API/store needs to also return `customer.email` for it to be displayed.

---

## Summary of Changes

| Change                        | Impact                         | Effort |
| ----------------------------- | ------------------------------ | ------ |
| Remove COLOR section          | High - cleans up card          | Low    |
| Increase animal name size     | High - instant recognition     | Low    |
| Increase customer name size   | High - faster lookup           | Low    |
| Increase phone size           | High - primary contact info    | Low    |
| Move last visit to corner     | Medium - cleaner layout        | Medium |
| Add email to cards            | Medium - complete contact info | Medium |
| Remove "Unknown" placeholders | Low - less noise               | Low    |
| Add phone formatting          | Low - readability              | Low    |

---

## Accessibility Notes

- Ensure sufficient color contrast (4.5:1 minimum)
- Phone numbers should be links with `tel:` protocol
- Email should be link with `mailto:` protocol
- All text must remain readable at 200% zoom
- Maintain focus indicators for keyboard navigation

---

## Conclusion

The proposed changes prioritize **scanability** - allowing staff to quickly identify:

1. Which animal (large name at top)
2. Which customer (bold name below)
3. How to contact them (prominent phone/email)
4. Where they're located (clear suburb + postcode)

Secondary information (last visit) is available but doesn't compete for attention. Unnecessary information (color, cost) is removed entirely.

**Estimated implementation time:** 1-2 hours for Phase 1, additional 2-3 hours for full redesign.
