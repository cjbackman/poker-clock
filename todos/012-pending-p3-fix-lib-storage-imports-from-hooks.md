---
status: pending
priority: p3
issue_id: "012"
tags: [code-review, architecture, typescript]
dependencies: []
---

# Fix layering violation: lib/storage.ts imports TournamentState from hooks/

## Problem Statement

`src/lib/storage.ts` imports `TournamentState` from `src/hooks/useTournament.tsx`. This inverts the intended dependency direction: `lib/` is supposed to be the bottom of the stack (no React, no app-specific dependencies), but here it depends on a hook file.

## Findings

- **File:** `src/lib/storage.ts` line 5
```ts
import { TournamentState } from '@/hooks/useTournament';
```
- `lib/` should have no dependencies on `hooks/` or `components/`
- Currently: `storage.ts` → `useTournament.tsx` creates a lib→hooks edge
- Not a circular dependency today, but it makes `lib/` no longer a clean foundation
- Flagged by architecture reviewer

## Proposed Solutions

### Option A (Recommended): Extract shared types to `src/lib/types.ts`
Create `src/lib/types.ts` with `TournamentState`, `TournamentSettings`, `PrizeDistribution`, `PrizeDistributionType`, and any other shared types. Both `useTournament.tsx` and `storage.ts` import from there.

```ts
// src/lib/types.ts (new file)
export type TournamentState = { ... };
export type TournamentSettings = { ... };
// etc.

// src/hooks/useTournament.tsx
import { TournamentState } from '@/lib/types';

// src/lib/storage.ts
import { TournamentState } from '@/lib/types';
```

- **Pros:** Restores correct layer separation, single source of truth for types
- **Effort:** Medium (touch multiple files, but pure refactor)
- **Risk:** Low (type-only change, no runtime behavior)

## Acceptance Criteria

- [ ] `src/lib/types.ts` created with shared types
- [ ] `storage.ts` imports from `lib/types` not `hooks/`
- [ ] `useTournament.tsx` imports from `lib/types`
- [ ] `npm run build` and `npm test` pass with no errors

## Work Log

- 2026-02-21: Identified by architecture reviewer in code review
