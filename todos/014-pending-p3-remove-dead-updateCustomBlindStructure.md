---
status: pending
priority: p3
issue_id: "014"
tags: [code-review, dead-code, architecture]
dependencies: []
---

# Remove or use `updateCustomBlindStructure` dead context API

## Problem Statement

`updateCustomBlindStructure` is exported from `TournamentContextValue` and implemented in the provider, but no component currently calls it. The current reviewed changes removed the last consumer (`OrganizerPanel`). It is misleading dead surface area on the public context API.

## Findings

- **File:** `src/hooks/useTournament.tsx` — exported in context value but unused
- All blind level mutations go through `addBlindLevel`, `removeBlindLevel`, `updateBlindLevel`
- `updateCustomBlindStructure` was intended as an atomic "replace entire structure" operation, but individual operations cover all actual use cases
- Flagged by architecture and TypeScript reviewers

## Proposed Solutions

### Option A (Recommended): Delete from context
Remove from `TournamentContextValue` interface and from the provider's value object. Keep the implementation function in the provider only if it's used internally (check first).

- **Pros:** Honest API surface, less confusion for future contributors
- **Effort:** Small
- **Risk:** Low (no consumers — confirm with a grep)

### Option B: Keep as internal utility
Remove from `TournamentContextValue` (public API) but keep the implementation inside the provider if it's used internally.

## Recommended Action

Option A — grep for usages first, then remove.

## Acceptance Criteria

- [ ] Grep confirms zero call sites for `updateCustomBlindStructure` outside the provider
- [ ] Removed from `TournamentContextValue` interface
- [ ] Removed from provider's context value object
- [ ] `npm run build` passes (TypeScript will catch any missed references)

## Work Log

- 2026-02-21: Identified by architecture and TypeScript reviewers
