---
status: pending
priority: p3
issue_id: "013"
tags: [code-review, architecture, design-decision]
dependencies: []
---

# Decide: chips.ts hardcoded config silently coupled to PrizePool display

## Problem Statement

`STARTING_STACK_TOTAL` from `src/lib/chips.ts` is used in `PrizePool.tsx` to calculate "total chips in play". If someone runs a tournament with different chip denominations or counts, the display will silently show the wrong number. The blind structure is configurable at runtime; the chip configuration is not.

## Findings

- **File:** `src/components/PrizePool.tsx` line ~48
```ts
{((tournament.buyIns + tournament.reBuys) * STARTING_STACK_TOTAL).toLocaleString()}
```
- `STARTING_STACK_TOTAL` = 2450 (hardcoded: 8×25 + 8×50 + 5×100 + 3×500)
- Silent coupling: display accuracy depends on actual chips matching the constant
- The blind structure is configurable; chip setup is not — internal inconsistency
- Flagged by architecture reviewer as the most significant architectural concern in the changes

## Proposed Solutions

### Option A: Accept and document (appropriate for fixed home game)
Add a comment to `chips.ts` and `PrizePool.tsx` making the coupling explicit. Accept that this is a fixed tournament setup.

```ts
// src/lib/chips.ts
// Fixed chip configuration for Juldagspokern. If chip setup changes,
// update this file AND verify PrizePool totals display correctly.
```

- **Pros:** No code change, honest documentation
- **Effort:** Tiny
- **Risk:** None

### Option B: Move chip config into tournament state
Add `chips` array to `TournamentSettings`, persist it in localStorage, make it editable in `OrganizerPanel`. Compute `startingStackTotal` as a derived value in `useTournament` (like `prizePool`).

- **Pros:** Architecturally correct for a reusable configurable clock
- **Cons:** Significant scope — UI, state, persistence all change
- **Effort:** Large
- **Risk:** Medium

## Recommended Action

Decide based on intent:
- **Home game with fixed setup** → Option A (document the coupling)
- **Reusable configurable tournament clock** → Option B

## Acceptance Criteria

**If Option A:**
- [ ] Comments added to `chips.ts` and `PrizePool.tsx` making coupling explicit

**If Option B:**
- [ ] `chips` in `TournamentSettings`
- [ ] `startingStackTotal` derived in `useTournament`
- [ ] `OrganizerPanel` has chip configuration UI
- [ ] `chips.ts` becomes a default/preset only

## Work Log

- 2026-02-21: Identified by architecture reviewer; needs design decision before implementation
