---
status: complete
priority: p3
issue_id: "015"
tags: [code-review, security, robustness]
dependencies: []
---

# Add schema validation to loadTournamentState (localStorage deserialization)

## Problem Statement

`loadTournamentState` does `JSON.parse` and immediately trusts the result as `TournamentState` with no runtime validation. If localStorage contains a stale or corrupted value (from a previous app version, a browser extension, or manual tampering), the app receives a malformed state object that can cause silent incorrect behavior or runtime errors.

## Findings

- **File:** `src/lib/storage.ts` line ~29
```ts
return JSON.parse(serializedState); // trusted blindly as TournamentState
```
- `JSON.parse` returns `any` — TypeScript provides no protection here (especially with strictNullChecks off)
- Stale state shapes from older app versions are the most realistic trigger
- Zod is already listed in `package.json` dependencies — no new dep needed
- Flagged by architecture and security reviewers (security assessed current risk as negligible)

## Proposed Solutions

### Option A (Recommended): Add minimal Zod validation
```ts
import { z } from 'zod';

const TournamentStateSchema = z.object({
  currentLevelId: z.number(),
  buyIns: z.number(),
  reBuys: z.number(),
  // ... key fields only, use .passthrough() for nested objects
}).passthrough();

export const loadTournamentState = (): TournamentState | null => {
  try {
    const serializedState = localStorage.getItem(STATE_KEY);
    if (!serializedState) return null;
    const parsed = JSON.parse(serializedState);
    const result = TournamentStateSchema.safeParse(parsed);
    if (!result.success) {
      console.error('Invalid stored tournament state, clearing:', result.error);
      clearTournamentState();
      return null;
    }
    return result.data as TournamentState;
  } catch {
    return null;
  }
};
```

- **Pros:** Catches stale state shapes gracefully, auto-recovers by clearing
- **Effort:** Medium (write schema, integrate)
- **Risk:** Low

### Option B: Accept as-is
Current risk is negligible for a single-user, single-machine app. If the state shape ever makes a breaking change, handle it at that point with a migration.

- **Effort:** None
- **Risk:** Accepted

## Recommended Action

Option B for now — low priority given single-user context. Bump to P2 before any breaking state shape change is shipped.

## Acceptance Criteria

**If implementing:**
- [ ] Zod schema covers top-level fields
- [ ] Invalid state clears localStorage and returns null (falls back to defaults)
- [ ] `npm test` passes

## Work Log

- 2026-02-21: Identified by architecture and security reviewers; deferred (Option B for now)
