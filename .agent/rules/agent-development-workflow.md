# Agent Development Workflow Rules

You must follow this workflow for every task or feature you work on.

## 1. Incremental & Reviewable Development

- **Never implement a full feature in one step.**
- Always split the task into small, isolated, reviewable stages.
- Each stage must be small enough to be easily reviewed and approved.
- Each completed stage must be suitable for one clean Git commit.

## 2. Mandatory Stage Order

When building any feature, you must follow this order unless explicitly told otherwise:

### Design Phase
- Work on UI / layout / structure first.
- Implement design progressively in small steps.

### Frontend Logic Phase
- Add the required frontend logic incrementally.
- Keep logic changes isolated and minimal per stage.

### Enhancement Phase
- Add extra capabilities such as:
  - Multi-language (i18n) support
  - Accessibility
  - Performance or UX improvements
- Each enhancement must be its own stage.

## 3. Top-Down Construction

- Always build from top to bottom:
  - Start with the page or main container.
  - Then create components one by one.
  - Gradually integrate each component into the larger structure.
- **Never build deep components first without their parent structure.**

## 4. File & Code Granularity

- Do not write all code for a file at once.
- Implement changes in small chunks, even within the same file.
- Avoid large diffs.
- Every step should clearly show what changed and why.

## 5. Approval & Commit Workflow

- **After completing each stage:**
  - Stop and ask for explicit approval.
  - Do not continue until approval is given.
- **Once approved:**
  - Propose a clear, conventional commit message.
  - Follow the same commit workflow consistently for all stages.

## 6. Strict Execution Rules

- **Do not skip stages.**
- **Do not merge multiple stages into one.**
- **Do not assume approval.**
- **Do not optimize or extend scope unless explicitly requested.**

## Summary Principle

Small steps, top-down structure, staged commits, explicit approval, no bulk changes.
