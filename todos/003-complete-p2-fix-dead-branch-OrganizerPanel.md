---
status: pending
priority: p2
issue_id: "003"
tags: [code-review, quality, dead-code]
dependencies: []
---

# Remove dead if/else branch in handleUpdateBlindLevel (OrganizerPanel)

## Problem Statement

`handleUpdateBlindLevel` in `OrganizerPanel.tsx` has an if/else where both branches call the same function with the same arguments. This is dead conditional logic that misleads future readers.

## Findings

- **File:** `src/components/OrganizerPanel.tsx` lines ~106-116
- Both branches are identical:

```ts
const handleUpdateBlindLevel = (
  levelId: number,
  field: 'smallBlind' | 'bigBlind' | 'ante' | 'duration',
  value: number,
) => {
  if (field === 'duration') {
    updateBlindLevel(levelId, field, value);  // ← same call
  } else {
    updateBlindLevel(levelId, field, value);  // ← same call
  }
};
```

- Likely a leftover from when `duration` was handled differently (parse/transform)
- That logic moved to `handleDurationBlur` and this was never cleaned up
- Flagged by TypeScript, architecture, simplicity, and performance reviewers

## Proposed Solutions

### Option A (Recommended): Collapse to single call
```ts
const handleUpdateBlindLevel = (
  levelId: number,
  field: 'smallBlind' | 'bigBlind' | 'ante' | 'duration',
  value: number,
) => {
  updateBlindLevel(levelId, field, value);
};
```

### Option B: Inline at call sites (since it's now a passthrough)
Since the function now has no logic, it could be removed and `updateBlindLevel` called directly in JSX. However, the signature adaptation (parsing input values) happens at the call sites, so the wrapper still has some value for type narrowing.

- **Effort:** Small
- **Risk:** Very low

## Recommended Action

Option A — collapse branches. Leave the wrapper in place for now since it provides a named handler.

## Acceptance Criteria

- [ ] `handleUpdateBlindLevel` body is a single `updateBlindLevel(levelId, field, value)` call
- [ ] No dead if/else branch
- [ ] Blind level editing still works correctly

## Work Log

- 2026-02-21: Identified by 4 separate reviewers in code review
