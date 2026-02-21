---
status: pending
priority: p2
issue_id: "001"
tags: [code-review, quality, typescript]
dependencies: []
---

# Remove `_actionTypes` runtime object in use-toast.ts

## Problem Statement

`_actionTypes` is a runtime const object that exists only to derive the `ActionType` type via `typeof`. The runtime value is never read — the reducer switch cases already use raw string literals directly. The `_` prefix rename is a lint suppression hack that leaves a confusing dead object in the code.

## Findings

- **File:** `src/hooks/use-toast.ts` lines 15-29
- The `_actionTypes` object is only used for `type ActionType = typeof _actionTypes`
- `ActionType` is used in the `Action` union at lines 31-47 as `ActionType['ADD_TOAST']` etc, which resolves to plain string literals
- The reducer switch cases (lines 73, 79, 85, 110) use raw strings: `case 'ADD_TOAST'`, not `actionTypes.ADD_TOAST`
- Three independent reviewers (TypeScript, simplicity, pattern) flagged this as the top code quality issue

## Proposed Solutions

### Option A (Recommended): Delete object and ActionType alias, inline string literals
Remove `_actionTypes`, remove `type ActionType`, rewrite the `Action` union with inline string literals:

```ts
type Action =
  | { type: 'ADD_TOAST';     toast: ToasterToast }
  | { type: 'UPDATE_TOAST';  toast: Partial<ToasterToast> }
  | { type: 'DISMISS_TOAST'; toastId?: ToasterToast['id'] }
  | { type: 'REMOVE_TOAST';  toastId?: ToasterToast['id'] };
```

- **Pros:** Removes dead code entirely, standard discriminated union pattern, ~12 lines gone
- **Cons:** None
- **Effort:** Small
- **Risk:** Low (pure type change, no runtime behavior change)

### Option B: Write ActionType as a pure type (no runtime object)
```ts
type ActionType = {
  ADD_TOAST: 'ADD_TOAST';
  UPDATE_TOAST: 'UPDATE_TOAST';
  DISMISS_TOAST: 'DISMISS_TOAST';
  REMOVE_TOAST: 'REMOVE_TOAST';
};
```
- **Pros:** Preserves the `ActionType['...']` indirection if preferred
- **Cons:** String literal appears twice (key and value), no real benefit over Option A
- **Effort:** Small
- **Risk:** Low

## Recommended Action

Option A — delete everything and inline the string literals directly in the `Action` union.

## Technical Details

- **Affected files:** `src/hooks/use-toast.ts`
- **No runtime behavior change** — this is purely a type/code structure change

## Acceptance Criteria

- [ ] `_actionTypes` object deleted
- [ ] `ActionType` type alias deleted
- [ ] `Action` union uses string literals directly
- [ ] `npm run lint` passes with no new warnings
- [ ] `npm test` passes

## Work Log

- 2026-02-21: Identified by TypeScript, simplicity, and pattern reviewers in code review
