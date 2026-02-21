---
status: pending
priority: p2
issue_id: "006"
tags: [code-review, quality, naming]
dependencies: []
---

# Fix stale "Buy-ins & Rebuys" references after Entries rename

## Problem Statement

The rename from "BuyInsPanel" to "EntriesPanel" with "Entries" as the UI term is incomplete. Two references still use the old terminology — one is user-visible.

## Findings

- **User-visible reference:** `src/components/OrganizerPanel.tsx` ~line 658
  ```tsx
  <Button onClick={handleResetCounts}>
    <RefreshCcw className="h-4 w-4" />
    Reset Buy-ins & Rebuys  {/* ← user sees this */}
  </Button>
  ```
- **Developer-visible reference:** `src/pages/Index.tsx` ~line 65
  ```tsx
  {/* Buy-ins and Rebuys - Right */}  {/* ← stale comment */}
  <EntriesPanel />
  ```
- Flagged by pattern recognition reviewer

## Proposed Solutions

### Option A (Recommended): Update both references
1. Change button text: "Reset Buy-ins & Rebuys" → "Reset Entries"
2. Update code comment: "Buy-ins and Rebuys - Right" → "Entries - Right"

- **Effort:** Tiny
- **Risk:** None

## Recommended Action

Option A.

## Acceptance Criteria

- [ ] OrganizerPanel button reads "Reset Entries"
- [ ] Index.tsx comment updated to match current terminology

## Work Log

- 2026-02-21: Identified by pattern recognition reviewer in code review
