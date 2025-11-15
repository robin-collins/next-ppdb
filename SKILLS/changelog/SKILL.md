---
name: changelog-management
description: Maintain project documentation including CHANGELOG.md, FILETREE.md, and FAILURELOG.md. Use this skill when making code changes, adding features, fixing bugs, restructuring files/directories, or when initial solutions fail. This skill ensures consistent documentation of all changes using Keep a Changelog format with semantic versioning.
---

# Changelog and Documentation Management

## Purpose

This skill provides systematic guidance for maintaining three mandatory project documentation files: CHANGELOG.md, FILETREE.md, and FAILURELOG.md. It ensures consistent tracking of all code changes, structural modifications, and debugging attempts using industry-standard formats.

## When to Use This Skill

Trigger this skill when:

- Making any code changes, feature additions, or bug fixes
- Adding, removing, or restructuring files or directories
- Initial solutions fail and debugging is required
- Completing any development task that affects the project state

## Documentation Requirements

### CHANGELOG.md - Change Tracking

**Update CHANGELOG.md for every code modification.**

Follow [Keep a Changelog](https://keepachangelog.com/) format with semantic versioning:

- Use standard categories: Added, Changed, Deprecated, Removed, Fixed, Security
- Include date stamps (YYYY-MM-DD) and version numbers for releases
- Reference GitHub issues/PRs when applicable
- Write clear, concise descriptions of changes
- Group related changes under appropriate category headings

### FILETREE.md - Structure Documentation

**Update FILETREE.md for any structural changes.**

Maintain accurate project structure representation:

- Add entries when creating new files or directories
- Remove entries when deleting files or directories
- Update paths when restructuring
- Include brief descriptions for new directories or significant files
- Keep the tree structure accurate and readable

### FAILURELOG.md - Debugging History

**Document all failed attempts when initial solutions don't work.**

Include comprehensive debugging information:

- What was tried (approach, code, commands)
- Error messages encountered (full stack traces when relevant)
- Root cause analysis (why it failed)
- Resolution approach (what finally worked)
- Lessons learned to prevent repeating the same debugging cycles

This is essential for complex integration issues and helps maintain institutional knowledge.

## Changelog Entry Format

Use this structure for all CHANGELOG.md entries:

```markdown
## [Version] - YYYY-MM-DD

### Added

- New features or functionality
- New files, endpoints, or capabilities
- New dependencies or tools

### Changed

- Modifications to existing features
- Refactoring or improvements
- Updated dependencies or configurations

### Deprecated

- Features marked for future removal
- Old APIs or endpoints being phased out

### Removed

- Deleted features, files, or functionality
- Removed dependencies

### Fixed

- Bug fixes and error corrections
- Performance issue resolutions
- Corrected behavior

### Security

- Security patches and improvements
- Vulnerability fixes
- New security features or validations
```

### Example Entry

```markdown
## [1.2.0] - 2025-11-15

### Added

- Customer search endpoint with fuzzy matching (#123)
- Export functionality for animal records to CSV format
- Automated backup system with daily scheduling

### Changed

- Updated Prisma client to v5.7.0 for performance improvements
- Refactored authentication middleware for better error handling

### Fixed

- Resolved memory leak in file upload handler (#145)
- Fixed date formatting issues in customer reports
- Corrected phone number validation regex

### Security

- Added rate limiting to prevent API abuse
- Implemented input sanitization for search queries
```

## Version Management

Apply semantic versioning (MAJOR.MINOR.PATCH) consistently:

- **MAJOR**: Breaking API changes, incompatible updates
- **MINOR**: New features that are backward compatible
- **PATCH**: Bug fixes that are backward compatible
- Tag releases in git with version numbers (e.g., `v1.2.0`)

### Version Increment Guidelines

Increment version numbers based on change significance:

- Breaking changes → increment MAJOR (1.2.3 → 2.0.0)
- New features → increment MINOR (1.2.3 → 1.3.0)
- Bug fixes → increment PATCH (1.2.3 → 1.2.4)

## Project-Specific Considerations

### API Changes

When modifying APIs:

- Document all endpoint modifications in Changed or Added
- Include request/response schema changes
- Note deprecation timelines for removed features
- Provide migration examples for breaking changes

### Database Schema Updates

When updating database schemas:

- Document migration scripts and procedures
- Note data transformation requirements
- Include rollback procedures for critical changes
- Specify Prisma version compatibility

### Performance Improvements

When optimizing performance:

- Document changes with before/after metrics when available
- Include configuration changes that affect performance
- Note any new hardware or dependency requirements
- Quantify improvements (e.g., "Reduced load time by 40%")

### Security Updates

When addressing security:

- Use the Security category in CHANGELOG.md
- Reference CVE numbers if applicable
- Describe the vulnerability and fix without exposing exploits
- Include upgrade instructions if dependencies are updated

## Workflow Integration

### Standard Development Workflow

1. Make code changes or add features
2. Update CHANGELOG.md with appropriate category entries
3. Update FILETREE.md if files/directories were added or removed
4. Commit changes with descriptive commit message
5. Reference the changelog entry in PR description

### Debugging Workflow

1. Attempt solution and encounter failure
2. Document attempt in FAILURELOG.md immediately:
   - Timestamp the entry
   - Describe what was tried
   - Include error messages
   - Note hypothesis about cause
3. Try alternative solution
4. Update FAILURELOG.md with resolution
5. Update CHANGELOG.md with the fix

### Release Workflow

1. Review all [Unreleased] entries in CHANGELOG.md
2. Determine appropriate version number using semantic versioning
3. Replace [Unreleased] with [Version] - YYYY-MM-DD
4. Create git tag with version number
5. Update any version references in package.json or similar files

## Best Practices

- **Be specific**: Avoid vague descriptions like "Fixed bugs" or "Updated code"
- **Group related changes**: Combine related modifications under a single bullet point
- **Use present tense**: Write "Add feature" not "Added feature"
- **Include context**: Mention the affected component or file when helpful
- **Link issues**: Reference GitHub issues/PRs for traceability
- **Update immediately**: Don't batch documentation updates; maintain them with code changes
- **Review before commit**: Ensure documentation accurately reflects all changes made

## Common Pitfalls to Avoid

- Forgetting to update CHANGELOG.md for "small" changes
- Using inconsistent category names (stick to the six standard categories)
- Placing entries in wrong categories (e.g., bug fix in Added instead of Fixed)
- Missing FILETREE.md updates when adding new directories
- Skipping FAILURELOG.md documentation during difficult debugging sessions
- Using incorrect date format (must be YYYY-MM-DD)
- Incrementing version numbers incorrectly
