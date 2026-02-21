---
status: pending
priority: p3
issue_id: "007"
tags: [code-review, quality, simplification]
dependencies: []
---

# Remove passthrough handler wrappers in OrganizerPanel

## Problem Statement

`OrganizerPanel.tsx` has several single-line handler functions that do nothing but call a hook function with the same arguments. These add noise without benefit.

## Findings

- **File:** `src/components/OrganizerPanel.tsx` lines ~162-176
```ts
const handleResetTimer = () => { resetTimer(); };
const handleResetLevels = () => { resetLevels(); };
const handleResetCounts = () => { resetCounts(); };
const handleResetTournament = () => { resetTournament(); };
```
- Also: `handleRemoveBlindLevel` is a one-line passthrough
- JSX can reference the hook functions directly: `onClick={resetTimer}`
- Flagged by TypeScript and simplicity reviewers

## Proposed Solutions

### Option A (Recommended): Inline at call sites
Replace `onClick={handleResetTimer}` with `onClick={resetTimer}` etc. Remove the wrapper functions.

- **Effort:** Small
- **Risk:** Very low

### Option B: Keep wrappers
Acceptable if event handler signatures differ (e.g., `(e: MouseEvent) => void` vs `() => void`). Check call sites before removing.

## Recommended Action

Option A — verify call sites accept the hook function signatures, then inline.

## Acceptance Criteria

- [ ] Passthrough wrappers removed
- [ ] Reset buttons still work correctly

## Work Log

- 2026-02-21: Identified by TypeScript and simplicity reviewers
