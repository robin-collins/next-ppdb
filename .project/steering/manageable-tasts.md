---
inclusion: always
---

# Atomic Task Decomposition Guidelines

## Core Principles

Break complex work into atomic, independent tasks that follow these principles:

### Single Responsibility Principle

- **One Clear Objective**: Each task should accomplish exactly one specific thing
- **Focused Scope**: Avoid tasks that try to implement multiple features or components
- **Clear Boundaries**: Task should have well-defined start and end points

### Atomic Independence

- **Self-Contained**: Task can be completed without depending on other incomplete tasks
- **Minimal Dependencies**: If dependencies exist, they should be on completed tasks only
- **Isolated Impact**: Changes made in one task don't break other completed tasks

### Testable Outcomes

- **Verifiable Success**: Clear criteria for when the task is complete
- **Measurable Results**: Concrete deliverables that can be validated
- **Quality Gates**: Each task should include its own validation/testing step

### Time-Boxed Execution

- **Single Session**: Completable in one focused work session (typically 30-90 minutes)
- **No Rabbit Holes**: Scope prevents getting lost in implementation details
- **Progress Checkpoints**: Regular validation that you're on track

## Task Decomposition Strategies

### Vertical Slicing

Break features into thin vertical slices that deliver end-to-end value:

- **Bad**: "Implement user authentication" (too broad)
- **Good**: "Create user registration endpoint with email validation"

### Dependency Ordering

Sequence tasks based on their interdependencies:

- **Foundation First**: Core interfaces and data structures
- **Layer by Layer**: Build from bottom up (data → logic → API → UI)
- **Integration Last**: Connect components after individual pieces work

### Incremental Complexity

Start simple and add complexity gradually:

- **Happy Path First**: Implement basic functionality before edge cases
- **Core Features**: Essential functionality before nice-to-have features
- **Error Handling**: Add robust error handling after basic flow works

## Task Writing Best Practices

### Task Description Format

Each task should include:

- **Action Verb**: Start with what you're doing (Create, Implement, Add, Fix)
- **Specific Component**: What exactly you're working on
- **Clear Outcome**: What the result should be

### Good Task Examples

- "Create User model with email and password fields"
- "Implement password hashing utility function"
- "Add user registration endpoint to API router"
- "Write unit tests for User model validation"

### Bad Task Examples (Too Large)

- "Build user authentication system"
- "Implement complete API"
- "Add all error handling"

### Task Details

Include supporting information:

- **Requirements Reference**: Which requirements this task addresses
- **Acceptance Criteria**: How to know when it's done
- **Technical Notes**: Key implementation considerations

## Common Anti-Patterns to Avoid

### The Monolith Task

- **Problem**: Tasks that try to implement entire features
- **Solution**: Break into component-level tasks

### The Dependency Chain

- **Problem**: Tasks that can't be completed without other incomplete tasks
- **Solution**: Reorder or merge dependent tasks

### The Rabbit Hole

- **Problem**: Tasks with unclear scope that lead to endless implementation
- **Solution**: Define specific, measurable outcomes

### The Integration Nightmare

- **Problem**: Leaving integration as one massive final task
- **Solution**: Integrate incrementally as components are built

## Validation Checklist

Before finalizing a task list, verify each task:

- [ ] Can be completed in a single focused session
- [ ] Has a clear, specific objective
- [ ] Includes its own validation/testing step
- [ ] Doesn't depend on incomplete tasks
- [ ] References specific requirements
- [ ] Has measurable success criteria
