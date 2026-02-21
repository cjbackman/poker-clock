---
status: pending
priority: p3
issue_id: "008"
tags: [code-review, performance, react, hooks]
dependencies: []
---

# Wrap handlePlayPause in useCallback to stabilize keyboard listener

## Problem Statement

`handlePlayPause` in `Timer.tsx` is a plain inline function that gets a new reference every render. Since `Timer` re-renders every second (timer tick), this causes `useKeyboardControls` to remove and re-add the `keydown` event listener once per second.

## Findings

- **File:** `src/components/Timer.tsx` lines 15-30
- **File:** `src/hooks/useKeyboardControls.tsx` lines 8-26
- `handlePlayPause` → new reference every render → `useKeyboardControls` effect sees changed dep → removeEventListener + addEventListener
- This is 1 listener swap per second — browser-native, O(1), not user-visible
- But architecturally sloppy and easy to fix
- Flagged by performance reviewer

## Proposed Solutions

### Option A (Recommended): useCallback
```ts
const handlePlayPause = useCallback(() => {
  unlockAudio();
  if (timer.isRunning) {
    timer.pause();
  } else {
    if (currentLevel.id === 1 && timer.timeRemaining === currentLevel.duration) {
      playTournamentStartSound();
    }
    if (timer.isPaused) {
      timer.resume();
    } else {
      timer.start();
    }
  }
}, [timer, currentLevel]);
```
- **Pros:** Stable reference, listener registered once
- **Effort:** Small
- **Risk:** Low

## Recommended Action

Option A.

## Acceptance Criteria

- [ ] `handlePlayPause` wrapped in `useCallback`
- [ ] Space bar play/pause still works correctly

## Work Log

- 2026-02-21: Identified by performance reviewer
