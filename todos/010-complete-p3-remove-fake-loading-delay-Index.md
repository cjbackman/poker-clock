---
status: pending
priority: p3
issue_id: "010"
tags: [code-review, performance, simplification]
dependencies: []
---

# Remove artificial 800ms loading delay in Index.tsx

## Problem Statement

`Index.tsx` has a `useEffect` that sets `loading = false` after 800ms, simulating a loading state. There is no actual async work to await. This adds 800ms of unnecessary delay to every page load.

## Findings

- **File:** `src/pages/Index.tsx` lines ~15-21
```ts
useEffect(() => {
  const timer = setTimeout(() => {
    setLoading(false);
  }, 800);
  return () => clearTimeout(timer);
}, []);
```
- Comment says "Simulate initial loading" — confirms this is artificial
- The app loads tournament state synchronously from localStorage
- 800ms delay degrades first contentful paint with no benefit
- Flagged by pattern recognition reviewer

## Proposed Solutions

### Option A (Recommended): Remove the delay entirely
Initialize `loading` to `false` (or remove the `loading` state if it's only used for this).

- **Pros:** Instant load, simpler code
- **Cons:** None (if there's no real async work)
- **Effort:** Small
- **Risk:** Low (verify the loading spinner doesn't mask a flash of unstyled content)

### Option B: Keep if there's a real purpose
If the delay intentionally masks localStorage hydration flicker, reduce to ~100ms or tie it to actual data availability.

## Recommended Action

Option A — investigate what `loading` gates, and remove the delay if it's purely cosmetic.

## Acceptance Criteria

- [ ] No artificial setTimeout delay on page load
- [ ] App appears correctly without a loading spinner flash
- [ ] Tournament state loads immediately from localStorage

## Work Log

- 2026-02-21: Identified by pattern recognition reviewer
