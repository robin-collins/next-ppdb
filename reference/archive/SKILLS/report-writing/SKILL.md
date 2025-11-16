---
name: report-writing
description: Generate structured task completion reports in two synchronized formats - a concise chat summary and a detailed documentation file. Use this skill when completing tasks that require formal documentation, audit trails, or reproducible records of work performed. Particularly useful for specification-driven development, API implementation, or any workflow requiring both user-facing summaries and comprehensive technical documentation.
---

# Report Writing Skill

This skill provides a standardized protocol for generating task completion reports that serve dual purposes: immediate user communication and long-term documentation.

## When to Use This Skill

Invoke this skill upon successful completion of any tasks

## Core Workflow

### Two Synchronized Outputs

Generate both outputs synchronously upon task completion:

#### 1. Chat Interface Report

Deliver a concise, user-friendly summary directly to the chat interface:

- **Format**: Brief, accessible language
- **Content**: Task status, key outcomes, next steps (if applicable)
- **Timing**: Immediate upon completion
- **Audience**: End user or stakeholder

#### 2. Detailed Documentation File

Create a comprehensive Markdown file with full implementation details:

- **Location**: `reports/{specifications_document_name}/task_{task_number}_completed.md`
- **Naming Example**: `reports/ast-transcription-api/task_10_1_completed.md`
- **Structure**: See template in `references/report-template.md`

### Required Sections in Documentation File

Structure the detailed documentation file with these sections in order:

1. **Chat Interface Output**
   - Reproduce the complete chat summary verbatim at the top
   - Ensures consistency between both deliverables
   - Provides context for readers reviewing only the file

2. **Task Overview**
   - Brief description of the task
   - Stated objectives and success criteria
   - Reference to parent specification or project context

3. **Execution Timeline**
   - Chronological sequence of actions taken
   - Timestamp each major step
   - Include decision points and reasoning

4. **Inputs/Outputs**
   - All data processed (files read, APIs called, databases queried)
   - All artifacts generated (files created, API responses, database modifications)
   - Configuration changes or environment setup

5. **Error Handling**
   - Any warnings encountered during execution
   - Errors that occurred and how they were resolved
   - Validation failures and remediation steps
   - Edge cases discovered

6. **Final Status**
   - Success confirmation with criteria met
   - Summary of all deliverables produced
   - Known limitations or follow-up items
   - Links to related documentation or resources

## Quality Assurance Checklist

Before finalizing reports, verify:

- **Consistency**: Chat summary and file documentation align perfectly
- **Accuracy**: All timestamps are correct and chronologically ordered
- **Completeness**: All required sections are present with substantive content
- **Reproducibility**: Sufficient detail exists to recreate the task execution
- **Clarity**: Technical terms are defined, acronyms explained on first use
- **Traceability**: Links to specifications, commits, or related tasks are included

## Implementation Guidelines

### File Organization

Create the `reports/` directory structure as needed:

```
reports/
├── {specification-name-1}/
│   ├── task_1_completed.md
│   ├── task_2_completed.md
│   └── task_3_completed.md
└── {specification-name-2}/
    └── task_1_completed.md
```

### Naming Conventions

Follow these patterns strictly:

- **Directory**: Lowercase, hyphen-separated (e.g., `ast-transcription-api`)
- **File**: `task_{number}_completed.md` or `task_{number}_{subnumber}_completed.md`
- **Examples**: `task_1_completed.md`, `task_10_1_completed.md`

### Writing Style

- Use active voice in timeline descriptions
- Be specific about tools, commands, and file paths
- Include exact error messages in error handling section
- Use code blocks for commands, file contents, or outputs
- Add headings to improve scanability

## Example Usage Scenarios

### Scenario 1: API Implementation

After implementing a REST API endpoint:

1. **Chat**: "Successfully implemented the /api/users endpoint with GET and POST methods. Returns user list with pagination, creates new users with validation. All tests passing."

2. **File**: `reports/user-management-api/task_3_completed.md` containing:
   - The above chat output
   - Task overview (implement user CRUD endpoints)
   - Timeline (created route files, added validation, wrote tests, deployed)
   - Inputs/outputs (schema files, test data, API responses)
   - Error handling (validation edge cases, database connection retry logic)
   - Final status (endpoints live, 100% test coverage, documentation updated)

### Scenario 2: Database Migration

After completing a database schema update:

1. **Chat**: "Database migration completed successfully. Added 'preferences' table with foreign key to users. Backfilled data for 1,247 existing users. No downtime required."

2. **File**: `reports/user-preferences-feature/task_2_1_completed.md` containing:
   - The above chat output
   - Full migration details, SQL scripts used, rollback plan tested
   - Verification queries run and their results
   - Performance impact analysis

## References

For detailed template structure with placeholders, see `references/report-template.md`.
