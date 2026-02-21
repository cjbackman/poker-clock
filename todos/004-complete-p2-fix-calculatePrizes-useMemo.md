---
status: pending
priority: p2
issue_id: "004"
tags: [code-review, performance, react, hooks]
dependencies: []
---

# Replace useCallback+call with useMemo for calculatePrizes

## Problem Statement

`calculatePrizes` in `useTournament.tsx` is wrapped in `useCallback` but is immediately invoked on the next line. This pattern provides no memoization. Worse, it returns a new object reference on every render — including every timer tick (1/sec) — causing `PrizePool` to re-render once per second even when prize values haven't changed.

## Findings

- **File:** `src/hooks/useTournament.tsx`, around lines 203-220
- Pattern:
```ts
const calculatePrizes = useCallback(() => {
  const { type, first, second, third } = tournament.settings.prizeDistribution;
  if (type === 'percentage') {
    return { first: (prizePool * first) / 100, ... };
  } else {
    return { first, second, third };
  }
}, [prizePool, tournament.settings.prizeDistribution]);

const prizes = calculatePrizes();  // ← immediately called, new object every render
```
- `prizes` is passed into context; its new object identity propagates to all `prizes` consumers on every timer tick
- Flagged by performance reviewer

## Proposed Solutions

### Option A (Recommended): useMemo
```ts
const prizes = useMemo(() => {
  const { type, first, second, third } = tournament.settings.prizeDistribution;
  if (type === 'percentage') {
    return {
      first: (prizePool * first) / 100,
      second: (prizePool * second) / 100,
      third: (prizePool * third) / 100,
    };
  }
  return { first, second, third };
}, [prizePool, tournament.settings.prizeDistribution]);
```
- **Pros:** Correct semantics, stable object reference between timer ticks, eliminates spurious PrizePool re-renders
- **Effort:** Small
- **Risk:** Very low

## Recommended Action

Option A.

## Technical Details

- **Affected files:** `src/hooks/useTournament.tsx`
- `prizes` is consumed by `PrizePool.tsx` via context
- After fix: PrizePool only re-renders when buy-ins change or prize distribution changes, not on every tick

## Acceptance Criteria

- [ ] `calculatePrizes` `useCallback` + immediate call replaced with `useMemo`
- [ ] `prizes` object reference is stable between timer ticks
- [ ] Prize pool display still calculates correctly
- [ ] `npm test` passes

## Work Log

- 2026-02-21: Identified by performance reviewer in code review
