---
trigger: always_on
---

# Package Management with PNPM

## Core Rules

**ALWAYS use pnpm commands** - Never use npm or yarn in this project.

**Lock file integrity** - Never commit changes without updating `pnpm-lock.yaml`.

**Dependency management** - Add dependencies through pnpm to maintain consistency.

## Essential Commands

```bash
# Install all dependencies
pnpm install

# Add production dependency
pnpm add <package>

# Add development dependency
pnpm add -D <package>

# Run package scripts
pnpm run dev
pnpm run build
pnpm run test
pnpm run lint

# Execute binaries
pnpm exec tsc
pnpm exec jest
```

## Project-Specific Guidelines

### TypeScript Dependencies

When adding TypeScript-related packages:

- Use `pnpm add -D @types/<package>` for type definitions
- Prefer packages with built-in TypeScript support
- Always verify type compatibility before adding new dependencies

### Testing Dependencies

- Add test utilities with `pnpm add -D <package>`
- Keep test dependencies separate from production code
- Use exact versions for testing frameworks to ensure consistency

### Production Dependencies

- Minimize production dependencies for smaller Docker images
- Prefer well-maintained packages with active communities
- Always review security advisories before adding new packages

## Troubleshooting

### Common Issues

- **Cache problems**: Run `pnpm store prune` to clean cache
- **Lock file conflicts**: Delete `node_modules` and run `pnpm install`
- **Phantom dependencies**: Use `pnpm audit` to identify issues

### Performance Optimization

- Use `.npmrc` with `auto-install-peers=true` for automatic peer dependency installation
- Enable `prefer-frozen-lockfile=true` in CI environments
- Use `pnpm prune` to remove unused dependencies
