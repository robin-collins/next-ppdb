# Repository Guidelines

## Project Structure & Module Organization

@.project\steering\CHANGELOG.md
@.project\steering\manageable-tasts.md
@.project\steering\pnpm.md
@.project\steering\report-writing.md

Core Next.js routes and layouts live in `src/app`, with API handlers nested under `src/app/api`. Reusable UI components sit in `src/components`, domain utilities in `src/lib`, and Zustand stores in `src/store`. Model changes start in `prisma/schema.prisma`; the generated client mirrors them in `src/generated/prisma`. Keep static assets in `public` and long-form notes or data drops in `reference` and `reports` so runtime code stays focused.

## Build, Test, and Development Commands

Run `pnpm dev` for the Turbopack dev server on port 3000. Produce optimized bundles with `pnpm build`, then serve them via `pnpm start`. `pnpm type-check`, `pnpm lint`, and `pnpm fmt:check` cover types, ESLint, and Prettier; `pnpm check` chains the trio for pre-PR validation. Use `pnpm lint:fix` or `pnpm fmt` to apply automated fixes before committing.

## Coding Style & Naming Conventions

Prettier owns formatting (`tabWidth: 2`, `singleQuote: true`, `semi: false`) and sorts Tailwind classes through the included plugin. ESLint extends the Next.js configuration; fix warnings instead of suppressing them. Name React components and stores with PascalCase filenames (e.g., `UserTable.tsx`), keep helpers in camelCase modules, and prefer named exports unless a file exposes a single entry point.

### Button Styling Standards

- **Colored Pill Buttons**: All primary/action buttons (colored backgrounds) must use the following interactive states:
  - **Base**: `rounded-lg border-2 border-transparent transition-all duration-200`
  - **Hover**: `hover:scale-110 hover:shadow-md`
  - **Border on Hover**: A darker shade of the background color for the border (e.g., `hover:border-[#8a3c35]` for red buttons).
  - **Background on Hover**: A slightly lighter/different shade (e.g., `hover:bg-[#c86158]`).

## Testing Guidelines

There is not yet a committed test runner, so reviewers rely on `pnpm type-check`, linting, and manual verification. New automated coverage should be colocated with its feature using a `.test.ts` or `.test.tsx` suffix and should exercise user-visible behavior. Flag any new tooling (React Testing Library, Playwright, etc.) in the PR and wire its command into `package.json` so it can join future CI scripts.

## Commit & Pull Request Guidelines

Recent history uses short, sentence-case subjects (e.g., "Add admin filters"). Write present-tense summaries under 72 characters and expand with context in the body when necessary. Husky runs `pnpm lint-staged` on commit; resolve failures locally before retrying. PRs should explain the change, list validation steps, attach UI screenshots when relevant, and link back to the driving issue or spec.

## Database & Environment Notes

Keep secrets in `.env` and document any new keys for teammates. After editing `prisma/schema.prisma`, regenerate clients with `pnpm prisma generate` and review the resulting diff in `src/generated/prisma`. Apply pending migrations locally before requesting review and describe impactful schema changes in the PR summary.

## UI/UX Standards

- **Notifications**: Use animated, temporary Toast notifications (info, warning, error, success) instead of browser alerts.
  - Duration: 3s for standard messages, 15s for important info/success confirmations.
  - Positioning: Top-center, unobtrusive, floating over content but below header.
  - Animation: Smooth fade-in/fade-out.
  - Layout: Must not shift page layout.
