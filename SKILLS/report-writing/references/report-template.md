# Task {NUMBER} Completion Report

**Project**: {Specification Name}
**Date**: {YYYY-MM-DD}
**Status**: ✅ Complete

---

## Chat Interface Output

> {PASTE THE COMPLETE CHAT SUMMARY HERE VERBATIM}
>
> This section should contain exactly what was delivered to the user via chat interface,
> ensuring consistency between both deliverables.

---

## Task Overview

**Task ID**: Task {number} or Task {number}.{subnumber}

**Description**: {Brief 1-2 sentence description of what this task accomplishes}

**Objectives**:

- {Objective 1}
- {Objective 2}
- {Objective 3}

**Success Criteria**:

- {Criterion 1: e.g., "All tests passing"}
- {Criterion 2: e.g., "API returns expected JSON structure"}
- {Criterion 3: e.g., "Performance under 200ms response time"}

**Context**: {Reference to parent specification, related tasks, or project documentation}

---

## Execution Timeline

### {HH:MM} - Step 1: {Action Description}

{Detailed description of what was done in this step}

**Actions**:

- {Specific action 1}
- {Specific action 2}

**Decisions**:

- {Decision made and reasoning}

**Output**: {What was produced in this step}

### {HH:MM} - Step 2: {Action Description}

{Continue chronologically through all major steps...}

### {HH:MM} - Step N: {Final Action}

{Last step in the execution}

---

## Inputs/Outputs

### Inputs

**Files Read**:

- `{path/to/file1.ext}` - {Description of what was read and why}
- `{path/to/file2.ext}` - {Description}

**APIs Called**:

- `{HTTP_METHOD} {/api/endpoint}` - {Purpose}
- Response: {Brief description of response}

**Database Queries**:

```sql
{Example query run}
```

- Purpose: {Why this query was needed}
- Results: {Number of rows returned, relevant data}

**Configuration/Environment**:

- {Environment variable or config setting}: {Value}
- {Tool version}: {Version number}

### Outputs

**Files Created/Modified**:

- `{path/to/created-file.ext}` - {Description of file contents and purpose}
- `{path/to/modified-file.ext}` - {What was changed}

**Artifacts Generated**:

- {Build artifacts, compiled files, generated docs, etc.}

**API Responses**:

```json
{
  "example": "response",
  "data": "..."
}
```

**Database Modifications**:

- Tables created: {List}
- Rows inserted: {Count and description}
- Schema changes: {Description}

---

## Error Handling

### Warning 1: {Warning Description}

**Occurred at**: {Timestamp or step}

**Message**:

```
{Exact warning message}
```

**Context**: {What was happening when warning occurred}

**Resolution**: {How it was addressed or why it was safe to ignore}

---

### Error 1: {Error Description}

**Occurred at**: {Timestamp or step}

**Error Message**:

```
{Exact error message and stack trace if relevant}
```

**Root Cause**: {Analysis of what caused the error}

**Resolution Steps**:

1. {First step taken to resolve}
2. {Second step}
3. {Final resolution}

**Prevention**: {How to avoid this error in the future}

---

### Edge Cases Discovered

**Edge Case 1**: {Description}

- **Impact**: {How this affects the implementation}
- **Handling**: {How the code now handles this case}

**Edge Case 2**: {Description}

- **Impact**: {Impact description}
- **Handling**: {Handling description}

---

## Final Status

### Success Confirmation

✅ **All objectives met**:

- ✅ {Objective 1} - {Confirmation details}
- ✅ {Objective 2} - {Confirmation details}
- ✅ {Objective 3} - {Confirmation details}

### Deliverables Summary

**Code Files**:

- `{path/to/file.ext}` - {Purpose and contents}

**Documentation**:

- `{path/to/doc.md}` - {What was documented}

**Tests**:

- `{path/to/test.spec.ts}` - {Test coverage details}
- Test results: {X/Y passing, coverage percentage}

**Database**:

- Migrations applied: {List migration files}
- Data integrity verified: {Confirmation}

### Known Limitations

- {Limitation 1 and why it exists}
- {Limitation 2 and potential future enhancement}

### Follow-Up Items

- [ ] {Optional future enhancement}
- [ ] {Related task to complete next}
- [ ] {Technical debt item to address later}

### Related Resources

- Specification: `{link or path to spec document}`
- Related tasks: {Links to task_X_completed.md files}
- Git commit: `{commit hash}` - {commit message}
- Pull request: `{PR number and link if applicable}`
- Documentation: `{links to updated docs}`

---

**Report Generated**: {YYYY-MM-DD HH:MM:SS}
**Author**: Claude Code
**Review Status**: {Pending/Reviewed/Approved}
