---
status: pending
priority: p2
issue_id: "005"
tags: [code-review, security, dependencies]
dependencies: []
---

# Move test-only packages from dependencies to devDependencies

## Problem Statement

`jsdom` and several testing packages are listed under `dependencies` instead of `devDependencies`. This means they're included in production bundle analysis and npm audit surface, even though they're never used in production code.

## Findings

- **File:** `package.json`
- Packages incorrectly in `dependencies`:
  - `jsdom` (test environment library)
  - `@testing-library/jest-dom`
  - `@testing-library/react`
  - `@testing-library/user-event`
  - `@vitest/coverage-v8`
  - `vitest`
- Flagged by security reviewer (INFO-04)

## Proposed Solutions

### Option A (Recommended): Move to devDependencies
```json
"devDependencies": {
  "jsdom": "...",
  "@testing-library/jest-dom": "...",
  "@testing-library/react": "...",
  "@testing-library/user-event": "...",
  "@vitest/coverage-v8": "...",
  "vitest": "..."
}
```

Run `npm install` after editing to regenerate lock file.

- **Pros:** Correct classification, cleaner npm audit, smaller conceptual production surface
- **Effort:** Small
- **Risk:** Very low (Vite tree-shakes them anyway if not imported in prod code)

## Recommended Action

Option A. Move all test-only packages to `devDependencies`.

## Acceptance Criteria

- [ ] All 6 test packages moved to `devDependencies` in `package.json`
- [ ] `npm install` runs cleanly
- [ ] `npm test` still passes

## Work Log

- 2026-02-21: Identified by security reviewer in code review
