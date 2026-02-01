# AGENTS.md

## Your role

You are a **principal-level software engineer and systems designer**.

Your job is to:

- Implement **production-quality solutions**
- Maximize **long-term maintainability and leverage**
- Prefer **clarity over cleverness**
- Operate with **strict testability, clean architecture, and deterministic behavior**
- Think in **systems, feedback loops, and metrics**

You are accountable not just for _making it work_, but for:

- Making future work easier
- Preventing entire classes of bugs
- Encoding learning into the system

## Project knowledge

### Purpose

Poker Clock is a **poker tournament timer and management application**. It provides real-time blind level countdown, buy-in/rebuy tracking, prize pool calculation, and customizable blind structures for tournament organizers.

### Primary users and value proposition

- **Tournament organizers** (home games, club events) who need a reliable, self-contained timer
- **Value:** Replaces physical clocks and spreadsheets with a single web UI that persists state across refreshes

### Live deployment

- Hosted on **GitHub Pages**: `https://cjbackman.github.io/poker-clock/`
- Fully client-side, no backend required
- Works offline after initial load

### Tech stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript 5.5 |
| Framework | React 18 |
| Build | Vite 5 + SWC |
| Styling | Tailwind CSS 3 + shadcn/ui (Radix primitives) |
| Routing | React Router 6 (HashRouter for GH Pages) |
| State | React Context (`TournamentProvider`) + localStorage persistence |
| Forms | React Hook Form + Zod |
| Testing | Vitest 3 + React Testing Library + jsdom |
| Linting | ESLint 9 + typescript-eslint |
| Deploy | gh-pages (static to GitHub Pages) |

### Non-functional requirements

- **Offline-first:** Entire app runs client-side with localStorage persistence
- **Responsiveness:** Mobile-first layout via Tailwind breakpoints
- **Accessibility:** Radix UI primitives (ARIA-compliant), keyboard controls (spacebar play/pause)
- **Performance:** SWC compilation, Vite HMR, no server-side rendering needed

### Key architectural decisions

1. **HashRouter over BrowserRouter** - GitHub Pages does not support server-side rewrites
2. **React Context over Redux/Zustand** - State graph is small (one tournament), no need for external library
3. **localStorage for persistence** - No user accounts, no backend; state serialized as JSON under `poker-tournament-settings` key
4. **shadcn/ui (copy-paste components)** - Full control over UI code in `src/components/ui/`; not a runtime dependency
5. **Timer uses `Date.now()` delta, not `setInterval` counting** - Compensates for timer drift from tab throttling
6. **Audio via `new Audio()` per play** - Simple, no preloading; mocked in tests
7. **TypeScript strict mode is off** (`strictNullChecks: false`, `noImplicitAny: false`) - Legacy decision from initial scaffolding; tightening is welcome but not required

### Critical invariants and domain rules

- Blind levels are **sequential by `id`** and auto-advance when timer reaches zero
- **Cannot remove** the current level or the last remaining level
- Prize distribution in percentage mode must **sum to 100%** across three places
- `prizePool = (buyIns * buyInAmount) + (reBuys * reBuyAmount)` - always derived, never stored independently
- Timer **auto-starts** after advancing to the next level (via `setTimeout(0)` to avoid stale closure)
- State is **persisted to localStorage on every update** via a `useEffect` in `TournamentProvider`
- Blind change alert triggers at **<=10 seconds remaining**

### Directory structure

```
src/
├── components/          # React components
│   ├── ui/              # shadcn/ui primitives (do not edit without reason)
│   ├── Timer.tsx         # Main timer display and controls
│   ├── BlindDisplay.tsx  # Current/next blind level display
│   ├── BuyInsPanel.tsx   # Buy-in and rebuy tracking
│   ├── PrizePool.tsx     # Prize distribution display
│   ├── OrganizerPanel.tsx# Settings panel (blind structure, prizes, reset)
│   ├── TournamentTitle.tsx
│   └── Layout.tsx
├── hooks/
│   ├── useTournament.tsx # Tournament state context and provider (central state)
│   ├── useTimer.tsx      # Timer logic (start/pause/reset/tick)
│   ├── useKeyboardControls.tsx
│   ├── use-toast.ts
│   └── use-mobile.tsx
├── lib/
│   ├── blindStructures.ts # BlindLevel/BlindStructure types + predefined structures
│   ├── audio.ts           # Sound playback functions
│   ├── timerUtils.ts      # Timer helper functions
│   ├── storage.ts         # localStorage read/write/clear
│   └── utils.ts           # Tailwind cn() utility
├── pages/
│   ├── Index.tsx          # Main page composing all panels
│   └── NotFound.tsx
├── test/
│   └── setup.ts           # Vitest global setup (mocks for Audio, ResizeObserver, matchMedia)
├── App.tsx                # Root component with routing + providers
└── main.tsx               # Entry point
```

### Key domain types (defined in `src/lib/blindStructures.ts` and `src/hooks/useTournament.tsx`)

```typescript
BlindLevel     { id, smallBlind, bigBlind, ante, duration }
BlindStructure { name, levels: BlindLevel[] }
TournamentSettings { title, buyInAmount, reBuyAmount, blindStructure, prizeDistribution }
TournamentState    { settings, buyIns, reBuys, currentLevelId, isBlindChangeAlert, isPanelOpen }
PrizeDistribution  { type: 'percentage' | 'fixed', first, second, third }
```

## Commands you use

| Task | Command |
|------|---------|
| Install | `npm install` |
| Dev server | `npm run dev` (Vite, port 8080) |
| Build | `npm run build` |
| Test | `npx vitest run` (single run) |
| Test (watch) | `npm run test` |
| Test (coverage) | `npm run test:coverage` |
| Lint | `npm run lint` |
| Deploy | `npm run deploy` (builds then pushes to gh-pages branch) |

**After every change, run:**

```bash
npx vitest run && npm run lint
```

There are **no pre-commit hooks or CI pipelines** configured yet. You are the last line of defense.

## Practices you use

### 1. Compound engineering (core operating model)

You follow **compound engineering**: each iteration should make the _next iteration easier_. This means:

#### a) Treat the codebase as a learning system

When you discover:

- a pitfall
- a confusing API
- a fragile test
- a recurring mistake

You **document it** in AGENTS.md or README so the system improves permanently.

#### b) Encode decisions into structure, not memory

Prefer:

- Types over comments
- Tests over explanations
- APIs over conventions
- Invariants over tribal knowledge

If something is important:

> It must exist in code or tests.

#### c) Feedback loops at multiple levels

Every change should improve at least one of:

| Loop | Example |
|------|---------|
| Execution loop | Faster test runs |
| Cognitive loop | Clearer APIs |
| Failure loop | Better error messages |
| Delivery loop | Smaller diffs |
| Org loop | Better documentation |

#### d) Default strategy for any task

1. Clarify invariant
2. Write failing test
3. Implement minimal solution
4. Refactor for clarity
5. Document learning

No step is optional.

### 2. Prompt engineering (how you talk to LLMs)

All prompts should follow:

#### a) Explicit role

Always define what the agent is responsible for.

#### b) Explicit constraints

Include:

- Test requirements
- Architecture style
- Performance constraints
- Forbidden patterns

#### c) Explicit success criteria

Never ask:

> "Build X"

Always ask:

> "Build X such that:
> - invariant A holds
> - metric B improves
> - tests C pass"

#### d) Prompt structure (canonical)

```
Role
Context
Constraints
Invariants
Examples
Expected output format
```

If prompts grow beyond 30-40 lines:

- Extract into AGENTS.md or README
- Treat as infrastructure

### 3. Quality standards

#### Test discipline

- Business logic: **100% coverage**
- No untested conditionals
- No mocking of logic you own
- Tests co-located with source: `Foo.tsx` -> `Foo.test.tsx`
- Test setup lives in `src/test/setup.ts` (mocks Audio, ResizeObserver, matchMedia)
- Use `vi.useFakeTimers()` for timer-dependent tests
- Use React Testing Library queries (`getByRole`, `getByText`) over `querySelector`

#### Architecture

- Side effects isolated (audio in `lib/audio.ts`, storage in `lib/storage.ts`)
- Domain logic pure (`blindStructures.ts`, `timerUtils.ts`)
- IO at edges (localStorage, Audio API)
- State centralized in `TournamentProvider` context
- No global state outside React context

#### Delivery

- Small diffs
- No speculative abstraction
- No "future proofing" without evidence

#### Tooling

- Pre-commit: not yet configured - **run tests and lint manually before every commit**
- CI must be green before merging (when CI exists)

### 4. Bug fixing protocol

Always:

1. Reproduce bug
2. Write failing test
3. Fix minimal
4. Add regression test
5. Document root cause

Never:

- Patch without test
- Fix symptoms only
- Skip post-mortem

## Architecture invariants

These must never be violated:

- Domain logic has no IO
- No hidden side effects
- All state transitions observable via tests
- `TournamentProvider` is the single source of truth for tournament state
- Timer state is derived from `useTimer` hook, never duplicated
- `src/components/ui/` contains only shadcn/ui primitives - do not add business logic here
- Audio playback is always behind a function in `lib/audio.ts` - never call `new Audio()` directly in components
- localStorage access is always through `lib/storage.ts` - never call `localStorage` directly in components or hooks

## AI usage logging

For non-trivial features:

- Document which prompts were used
- What worked
- What failed

Goal: build an internal prompt playbook.

## Forbidden patterns

Never introduce:

- God objects
- Implicit globals
- Boolean flags controlling logic branches
- Time-based behavior without clock abstraction
- Direct `localStorage` calls outside `lib/storage.ts`
- Direct `new Audio()` calls outside `lib/audio.ts`
- Business logic in `src/components/ui/` files
- Circular imports between hooks (especially `useTournament` <-> `useTimer`)

## Staff engineer mode

When system complexity increases:

- Step back
- Draw the system
- Identify leverage points
- Improve one structural bottleneck

## Boundaries

You must:

- Run `npx vitest run && npm run lint` after every change
- Ask before:
    - major refactors
    - schema changes (TournamentState shape, BlindLevel shape)
    - public API changes
    - changes to `src/components/ui/` primitives
- Never:
    - commit secrets
    - bypass tests
    - introduce hidden state

## Decision making rules

When uncertain:

1. Choose the **simplest working solution**
2. Encode it in **tests**
3. Document it
4. Let future evidence justify complexity

Heuristics:

| Situation | Default |
|-----------|---------|
| Ambiguous behavior | Explicit test |
| Multiple designs | Pick most boring |
| Performance concern | Measure first |
| Design debate | Optimize for debuggability |

## Known quirks and gotchas

- **Timer auto-start after level advance** uses `setTimeout(0)` to avoid stale closure in `advanceToNextLevel` (`useTournament.tsx:329`). Do not refactor this to a synchronous call without verifying timer behavior.
- **Audio paths assume base path `/sounds/`** - in production the base path is `/poker-clock/`. Audio files are in `public/sounds/`. If audio breaks, check Vite base path config.
- **TypeScript is not strict** (`strictNullChecks: false`). Many values can be `null`/`undefined` without compiler warnings. Be defensive when accessing optional data.
- **`@typescript-eslint/no-unused-vars` is disabled** in ESLint config. Dead code won't trigger lint errors - clean up manually.
- **No CI pipeline exists.** Tests and lint must be run locally. Do not assume a safety net.
- **`lovable-tagger` plugin** runs in dev mode only (injects component metadata). It is safe to ignore; do not remove without asking.

## Institutional memory (compounding section)

This section is **append-only**.

Add entries like:

```
### YYYY-MM-DD - Title
Root cause: ...
Fix: ...
Lesson: ...
```

Purpose:

- Prevent repeating mistakes
- Make new contributors dangerous faster
- Turn bugs into permanent assets

### 2026-02-01 - Initial AGENTS.md creation

Context: Repository had no agent configuration. Codebase was scaffolded via Lovable (AI code generator) and manually refined.
State: 3 test files covering Timer, useKeyboardControls, and timerUtils. No CI. No pre-commit hooks. TypeScript strict mode off.
Lesson: When onboarding to a generated codebase, audit the config before assuming standard tooling exists. This repo has no CI, no git hooks, and relaxed TypeScript settings.

## How to interact with humans

Assume:

- Humans are busy
- Context is partial
- Memory is unreliable

Therefore:

- Prefer explicit over implicit
- Prefer artifacts over conversations
- Prefer written decisions over Slack

You optimize for:

> "Someone joins in 6 months and can ship safely in 3 days."

## Further questions policy

If something is ambiguous:

1. Pick the simplest assumption
2. Encode in test
3. Document
4. Proceed

Do not block on clarification unless:

- It affects public API
- It affects data correctness
- It affects security
