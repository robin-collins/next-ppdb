---
inclusion: always
---

# Documentation and Change Management

## Mandatory Documentation Updates

### CHANGELOG.md

- **Always update** CHANGELOG.md for any code changes, feature additions, or bug fixes
- Follow [Keep a Changelog](https://keepachangelog.com/) format with semantic versioning
- Use categories: Added, Changed, Deprecated, Removed, Fixed, Security
- Include date stamps and version numbers for releases
- Reference GitHub issues/PRs when applicable

### FILETREE.md

- **Always update** FILETREE.md when adding, removing, or restructuring files/directories
- Maintain accurate project structure representation
- Include brief descriptions for new directories or significant files

### FAILURELOG.md

- **Document all failed attempts** when initial solutions don't work
- Include: what was tried, error messages, root cause analysis, resolution approach
- Helps prevent repeating the same debugging cycles
- Essential for complex ASR model integration issues

## Changelog Entry Format

```markdown
## [Version] - YYYY-MM-DD

### Added

- New transcription endpoint with speaker diarization support
- Queue-based processing for batch audio files
- GPU acceleration configuration options

### Changed

- Updated Canary model to version 2.5B for improved accuracy
- Refactored database schema for better performance

### Fixed

- Resolved memory leak in audio file processing
- Fixed timestamp alignment issues in multi-speaker scenarios

### Security

- Added input validation for audio file uploads
- Implemented rate limiting for API endpoints
```

## Version Management

- Use semantic versioning (MAJOR.MINOR.PATCH)
- MAJOR: Breaking API changes
- MINOR: New features, backward compatible
- PATCH: Bug fixes, backward compatible
- Tag releases in git with version numbers

## Project-Specific Considerations

### ASR Model Changes

- Document model version updates and performance impacts
- Note any breaking changes in transcription output format
- Include migration notes for existing users

### API Changes

- Document all endpoint modifications
- Include request/response schema changes
- Note deprecation timelines for removed features

### Database Schema Updates

- Document migration scripts and procedures
- Note any data transformation requirements
- Include rollback procedures for critical changes

### Performance Improvements

- Document optimization changes with before/after metrics
- Include configuration changes that affect performance
- Note any new hardware or dependency requirements

---
