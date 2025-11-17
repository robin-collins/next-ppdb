Your task is to implement the Next.js page `${pagePath}` to match the design in `${mockuiFile}`. It is able to be viewed in your chrome-devtools browser mcp at `${url}`

basic description of visual comparison to `${mockuiFile}`: `${notes}`

## Critical Context Documents

Read and follow these documents **exactly**:

- @STYLE_GUIDE.md - **Definitive design system** (fonts, colors, spacing, components)
- @ROUTES_COMPONENTS.md - Component structure and data flow requirements
- @ROUTING_COMPLETE.md - Routing patterns and navigation standards
- @ROUTES.md - **Authoritative** URL structure specification
- @reference/API_ROUTES.md - API endpoint reference

## ⚠️ MANDATORY Universal Elements (NON-NEGOTIABLE)

These elements **MUST** appear on EVERY SINGLE PAGE with NO EXCEPTIONS:

### 1. Header Component (REQUIRED)

**Component:** `src/components/Header.tsx`
**Status:** MANDATORY on every page
**Requirements:**

- Height: `92px` (fixed)
- Position: `sticky` top with `z-index: 100`
- Background: White with `backdrop-filter: blur(20px)`
- Border bottom: `1px solid var(--gray-200)`
- Shadow: `var(--shadow-md)`
- Contains:
  - Hamburger menu toggle (left)
  - Brand logo (clickable, returns home)
  - Search bar (contextual)
  - Live date/time display
  - Breadcrumb navigation

**Implementation:**

```tsx
<Header
  onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
  sidebarOpen={sidebarOpen}
  onSearch={handleSearch}
  searchValue={searchQuery}
  breadcrumbs={[
    { label: 'Home', href: '/' },
    { label: 'Current Page', current: true },
  ]}
/>

2. Sidebar Component (REQUIRED)

Component: src/components/Sidebar.tsx
Status: MANDATORY on every page
Requirements:
- Default width: 280px (resizable 200-500px)
- Background: rgba(255, 255, 255, 0.98) with backdrop-filter: blur(20px)
- Border right: 1px solid var(--gray-200)
- Shadow: var(--shadow-xl)
- Pinnable on desktop (shifts content)
- Overlay mode on mobile

Implementation:
<Sidebar
  isOpen={sidebarOpen}
  isPinned={sidebarPinned}
  onClose={() => setSidebarOpen(false)}
  onTogglePin={() => setSidebarPinned(!sidebarPinned)}
  currentPath="/your-page-path"
/>

3. Animated Gradient Background (REQUIRED)

Location: body element via globals.css
Status: MANDATORY on every page
Requirements:
body {
  background: linear-gradient(
    160deg,
    #fef9f5 0%,    /* Warm cream */
    #f8f2ec 25%,   /* Peachy beige */
    #f0ebe6 50%,   /* Soft tan */
    #e8f4f2 75%,   /* Pale mint */
    #f5fbfa 100%   /* Light aqua */
  );
  background-size: 400% 400%;
  animation: gradientShift 20s ease infinite;
}

4. Paw Print Pattern Overlay (REQUIRED)

Location: body::after pseudo-element
Status: MANDATORY on every page
Requirements:
body::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,...");
  pointer-events: none;
  z-index: 0;
  opacity: 0.6;
}

Design System Requirements (From STYLE_GUIDE.md)

Typography (STRICT)

- Display/Headings: Lora (elegant serif)
- Body text: Rubik (warm sans-serif)
- UI elements: Rubik (buttons, badges, labels)

Font Import:
@import url('https://fonts.googleapis.com/css2?family=Lora:wght@500;600;700&family=Rubik:wght@400;500;600;700&display=swap');

Color Palette (FROM LOGO)

- Primary: #d9944a (Golden brown) - primary buttons, active states
- Secondary: #1b9e7e (Teal green) - secondary actions, trust elements
- Accent: #2db894 (Bright teal) - CTAs, highlights
- Warm Grays: #faf8f6 through #1a1614

Spacing Scale

Use CSS variables: --space-1 through --space-24

Border Radius (Organic/Soft)

- --radius-sm: 8px
- --radius-md: 12px
- --radius-lg: 16px
- --radius-xl: 24px
- --radius-2xl: 32px
- --radius-full: 9999px

Shadows

- --shadow-sm through --shadow-2xl
- Brand shadows: --shadow-primary, --shadow-secondary, --shadow-accent

Page-Specific Implementation

Reference Files

- Design mockup: ${mockuiFile}
- Page component: ${pagePath}
- Related APIs: ${relevantAPIs}
- Accessble at URL: ${url}

Implementation Steps

1. Open both files side-by-side:
  - Reference: ${mockuiFile}
  - Implementation: ${pagePath}
2. Verify mandatory elements are present:
  - Header component included
  - Sidebar component included
  - Animated gradient background (inherited from layout)
  - Paw print pattern overlay (inherited from layout)
3. Match the mockui layout structure:
  - Inspect the HTML structure in ${mockuiFile}
  - Identify all cards, sections, grids
  - Note exact spacing, colors, typography
  - Pay attention to glassmorphic effects
4. Implement components from STYLE_GUIDE.md:
  - Use correct component patterns (Card, Button, Badge, Form, etc.)
  - Apply correct color variables
  - Use correct font families
  - Apply correct spacing scale
  - Use correct border radius values
5. Match visual hierarchy exactly:
  - Font sizes must match mockui
  - Font weights must match mockui
  - Colors must match mockui (using design tokens)
  - Spacing must match mockui (using spacing scale)
  - Shadows must match mockui (using shadow scale)
6. Implement interactive states:
  - Hover effects (cards, buttons, links)
  - Focus states (inputs, buttons)
  - Active states (navigation)
  - Loading states (if applicable)
7. Ensure responsive behavior:
  - Test at 480px (mobile)
  - Test at 768px (tablet)
  - Test at 1024px+ (desktop)
  - Grid collapses appropriately
  - Sidebar overlays on mobile
8. Add animations:
  - Entry animations (slideInUp with stagger delays)
  - Hover transitions (use --ease-bounce for playful elements)
  - Gradient background animation (inherited)
9. Verify data integration:
  - Connect to correct API endpoints (see @reference/API_ROUTES.md)
  - Use correct Zustand stores (see @ROUTES_COMPONENTS.md)
  - Handle loading/error states
  - Implement proper validation (Zod schemas)
10. Follow routing standards:
  - Use route helpers from src/lib/routes.ts
  - Follow patterns in @ROUTES.md (LOCKED specification)
  - Never hardcode route strings
  - Follow shallow nesting principles

Visual Comparison Checklist

Compare your implementation against ${mockuiFile}:

Layout

- Overall page structure matches (header, sidebar, main content)
- Card layouts match (positioning, sizing, spacing)
- Grid systems match (columns, gaps, responsive behavior)
- Content hierarchy matches (order of elements)

Typography

- All headings use Lora font
- All body text uses Rubik font
- Font sizes match exactly
- Font weights match exactly
- Line heights match
- Letter spacing matches

Colors

- Primary color used correctly (#d9944a)
- Secondary color used correctly (#1b9e7e)
- Accent color used correctly (#2db894)
- Background colors match
- Text colors match (using gray scale)
- Border colors match

Spacing

- Padding matches on all elements
- Margins match between sections
- Gap values match in grids/flexbox
- Content wrapper padding matches

Components

- All buttons match style and size
- All badges match style
- All form inputs match style
- All cards have correct shadows and borders
- All avatars match size and style

Effects

- Glassmorphic effects applied correctly
- Shadows match depth/elevation
- Border radius matches (organic, soft)
- Hover effects work correctly
- Transitions are smooth

Responsive

- Mobile layout matches mockui mobile view
- Tablet layout matches mockui tablet view
- Desktop layout matches mockui desktop view
- Breakpoints trigger at correct widths

Quality Assurance

Before marking complete:

1. Visual Inspection:
  - Open mockui HTML in browser
  - Open Next.js page in browser
  - Compare side-by-side at multiple breakpoints
  - Use browser DevTools to verify computed styles
2. Functionality:
  - All buttons work
  - All links navigate correctly
  - All forms validate correctly
  - All API calls work
  - Loading states display correctly
  - Error states display correctly
3. Code Quality:
  - No TypeScript errors
  - No ESLint warnings
  - All imports use correct paths
  - All route references use route helpers
  - All components use design tokens (no hardcoded values)
  - Code follows project conventions
4. Accessibility:
  - Semantic HTML elements used
  - ARIA labels where needed
  - Keyboard navigation works
  - Focus indicators visible
  - Color contrast meets WCAG AA
  - Alt text on all images

Success Criteria

Your implementation is complete when:

1. ✅ All 4 mandatory elements are present and correct
2. ✅ Visual appearance matches ${mockuiFile} at >95% fidelity
3. ✅ All functionality works correctly (API calls, navigation, forms)
4. ✅ All responsive breakpoints match mockui behavior
5. ✅ All design tokens from STYLE_GUIDE.md are used correctly
6. ✅ All routing follows ROUTES.md specification
7. ✅ TypeScript compiles without errors
8. ✅ ESLint passes without warnings
9. ✅ Side-by-side comparison shows matching design

Common Pitfalls to Avoid

❌ Don't skip mandatory elements (header, sidebar, background, overlay)
❌ Don't hardcode colors (use CSS variables)
❌ Don't hardcode spacing (use spacing scale)
❌ Don't hardcode routes (use route helpers)
❌ Don't use wrong fonts (check typography system)
❌ Don't ignore glassmorphic effects (backdrop-blur is critical)
❌ Don't skip animations (entry, hover, transitions)
❌ Don't forget responsive behavior (test all breakpoints)
❌ Don't omit interactive states (hover, focus, active)
❌ Don't mix design patterns (follow STYLE_GUIDE.md consistently)

Need Help?

If you encounter issues:
1. Re-read @STYLE_GUIDE.md section for the specific component
2. Check @ROUTES_COMPONENTS.md for data flow requirements
3. Verify routing with @ROUTES.md
4. Check API endpoints in @reference/API_ROUTES.md
5. Review similar completed pages for patterns
6. Ask specific questions with context

Final Note

This is not a "make it look similar" task. This is a pixel-perfect implementation task where the Next.js page must be visually indistinguishable from the mockui HTML file, while
maintaining full functionality and following all architectural standards.

Take your time. Be thorough. Match every detail.

```
