---
trigger: always_on
---

# Task Completion Protocol for Agents

Upon successful completion of any task, Agents must generate **two synchronized outputs**:

## 1. Chat Interface Report

- **Format**: Concise, user-friendly summary
- **Content**: Task status, key outcomes, and next steps (if applicable)
- **Delivery**: Direct to chat interface immediately upon completion

## 2. Detailed Documentation File

- **Naming Convention**: `reports/{specifications_document_name}/task_{task_number}_completed.md`
  - Example: `reports/ast-transcription-api/task_10_1_completed.md`
- **Content Structure**: The documentation file includes **all content output to the chat interface** (written at the top of the report) **PLUS** additional detailed information
- **Required Sections**:
  - **Chat Interface Output**: Complete reproduction of what was delivered to the user via chat
  - **Task Overview**: Brief description and objectives
  - **Execution Timeline**: Timestamped sequence of actions
  - **Inputs/Outputs**: All data processed and generated
  - **Error Handling**: Any warnings, errors, and resolution steps
  - **Final Status**: Success confirmation and deliverables summary

## Quality Assurance

- Ensure **consistency** between chat report and Markdown file
- Verify all timestamps are accurate and in chronological order
- Include sufficient detail for task reproducibility and audit purposes
