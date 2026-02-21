---
status: pending
priority: p2
issue_id: "002"
tags: [code-review, quality, react, hooks]
dependencies: []
---

# Fix useEffect dependency array bug in use-toast.ts

## Problem Statement

`useToast` subscribes to a global listener array using a `useEffect` with `[state]` as the dependency array. This causes the component to unsubscribe and re-subscribe every time any toast state changes, which is incorrect.

## Findings

- **File:** `src/hooks/use-toast.ts` line ~177
- `setState` is stable (React guarantees dispatch/setState stability)
- `listeners` is a module-level array, not component state
- With `[state]` as the dep array: every toast update causes unsubscribe + re-subscribe
- This is harmless in practice with `TOAST_LIMIT = 1` but is conceptually wrong
- Flagged by TypeScript reviewer

```ts
React.useEffect(() => {
  listeners.push(setState);
  return () => {
    const index = listeners.indexOf(setState);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}, [state]); // ← should be []
```

## Proposed Solutions

### Option A (Recommended): Change to empty dependency array
```ts
}, []);
```
- **Pros:** Correct semantics, subscribe once on mount, unsubscribe on unmount
- **Cons:** None
- **Effort:** Tiny (1 character change)
- **Risk:** Very low

## Recommended Action

Option A — change `[state]` to `[]`.

## Technical Details

- **Affected files:** `src/hooks/use-toast.ts`
- While editing this file, also apply fix from todo 001 (`_actionTypes`)

## Acceptance Criteria

- [ ] `useEffect` dependency array is `[]`
- [ ] `npm run lint` passes
- [ ] Toast functionality still works (show/dismiss toasts)

## Work Log

- 2026-02-21: Identified by TypeScript reviewer in code review
