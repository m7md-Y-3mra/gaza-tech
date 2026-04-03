---
name: review-fix
description: Fix ALL unchecked issues from a review file, marking each [x] as it is completed. Processes issues in Fix Plan order.
argument-hint: '<review-number-or-filename> (e.g. 001 or 001review.md). If omitted, uses latest review in current spec.'
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

You are a coding agent that applies ALL fixes described in a review file.
You MUST process EVERY unchecked issue (`- [ ] FIXED`) until none remain.

INPUT:

- REVIEW_ID = $0 (optional)
- You MUST infer SPEC_NAME from current branch using the same rule as /spec-review:
  SPEC_NAME = last segment of `git rev-parse --abbrev-ref HEAD`, then map to specs/<SPEC_NAME>/.

REVIEW FILE LOCATION:

- specs/<SPEC_NAME>/review/

RESOLVING WHICH REVIEW FILE TO USE:

1. If REVIEW_ID is empty:
   - pick the latest numbered file in specs/<SPEC_NAME>/review/ matching ^[0-9]{3}review\.md$ (max number).
2. If REVIEW_ID is "001" (3 digits):
   - use specs/<SPEC_NAME>/review/001review.md
3. If REVIEW_ID ends with "review.md":
   - use that exact file name under the review folder.

MAIN LOOP — repeat until all issues are checked off:

STEP 1: READ the review file (re-read every iteration to see current state).

STEP 2: DETERMINE FIX ORDER. - If the review contains a "## Fix Plan (Ordered)" section, follow that order. - Otherwise, process issues top-to-bottom by severity: BLOCKER > HIGH > MED > LOW.

STEP 3: FIND the next unchecked issue. - Scan the "## Issues List" section for the first `- [ ] FIXED` entry
that matches the next item in the fix order. - If NO unchecked issues remain → go to FINISH.

STEP 4: FIX the issue.
a) Read the issue's "Proposed solution" steps carefully.
b) Use Grep/Glob to locate the exact files and lines before editing.
c) Apply the fix with minimal, safe changes.
d) If the issue has a "Test plan" section, run those test commands. - If no test plan, run `pytest -q` as a regression check.
e) If tests pass: - Edit the review file: change `- [ ] FIXED` to `- [x] FIXED` for THIS issue. - Append a "- Fix notes:" line under the issue summarizing what changed
(file paths, what was done — keep it short, no large code blocks).
f) If tests FAIL: - Investigate the failure. If it's caused by your change, fix it. - If the failure is unrelated to this issue, note it and continue. - If you cannot fix the issue safely, do NOT mark [x].
Instead append "- Blocked: <reason>" under the issue.

STEP 5: LOOP — go back to STEP 1.

FINISH:

- Re-read the review file one final time.
- Run the full test suite: `pytest -q`
- Run lint if available: `ruff check basket_reco/` (or the repo's lint command).
- Print a summary:
  - Total issues: N
  - Fixed: X
  - Blocked: Y (list which ones and why)
  - Test results: pass/fail count

HARD RULES:

- Do NOT stop after one issue. You MUST continue the loop until all issues are [x] or blocked.
- Always re-read the review file at the START of each iteration (it may have changed).
- Follow the Fix Plan order — earlier fixes often unblock later ones.
- If an issue depends on a previous fix that is still [ ], skip it and come back after fixing the dependency.
- Make minimal changes per issue. Do not refactor or improve code beyond what the issue specifies.
- If you encounter a new bug not in the review, note it but do NOT fix it — stay focused on review issues.
