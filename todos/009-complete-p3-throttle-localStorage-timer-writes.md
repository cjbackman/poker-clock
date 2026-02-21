---
status: complete
priority: p3
issue_id: "009"
tags: [code-review, performance, storage]
dependencies: []
---

# Throttle localStorage timer writes (currently 1 write/second)

## Problem Statement

`saveTimerRemaining` is called on every timer tick via `onTick`. This means `localStorage.setItem` runs synchronously on the main thread once per second. On lower-end Android devices, localStorage I/O can take 10-50ms, risking dropped frames.

## Findings

- **File:** `src/hooks/useTournament.tsx` lines ~156-163
```ts
onTick: (remaining) => {
  saveTimerRemaining(remaining);  // localStorage.setItem every second
  ...
},
```
- On desktop: typically <1ms, imperceptible
- On mobile under storage pressure: potentially 10-50ms, could drop frames
- Flagged by performance reviewer

## Proposed Solutions

### Option A (Recommended): Throttle to every 5 seconds + flush on unload
```ts
let pendingTimerRemaining: number | null = null;

onTick: (remaining) => {
  pendingTimerRemaining = remaining;
  // write is done by throttled function below
},
```
Use a ref + write every 5 seconds, plus `beforeunload` event to flush the latest value.

- **Pros:** Reduces I/O by 80%, still recovers accurately on reload
- **Cons:** 5s of recovery imprecision on hard crash (acceptable for poker timer)
- **Effort:** Medium
- **Risk:** Low

### Option B: Keep as-is (accept the risk)
For a hobby/home poker app, this is unlikely to manifest. If this ever runs on old Android hardware, revisit.

- **Effort:** None
- **Risk:** Accepted low risk

## Recommended Action

Option B for now — accept the risk. Revisit if mobile performance complaints arise.

## Technical Details

If implementing Option A, use a `useRef` to track the pending value and a separate `useEffect` with a 5-second interval. Add `window.addEventListener('beforeunload', flush)` cleanup.

## Acceptance Criteria

- [ ] localStorage writes reduced to max 1 per 5 seconds
- [ ] Timer state still restores correctly on page reload
- [ ] `beforeunload` flushes the latest remaining time

## Work Log

- 2026-02-21: Identified by performance reviewer; deferred (Option B chosen for now)
