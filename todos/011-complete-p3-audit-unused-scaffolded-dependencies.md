---
status: pending
priority: p3
issue_id: "011"
tags: [code-review, dependencies, simplification]
dependencies: []
---

# Audit and remove unused scaffolded shadcn/ui dependencies

## Problem Statement

The project was bootstrapped with a full shadcn/ui starter that installed many Radix UI packages and utilities that are never used in the actual application. These inflate the bundle, npm audit surface, and create confusion about actual dependencies.

## Findings

- **File:** `package.json`
- Suspected unused packages (from architecture reviewer):
  - `recharts` — no chart components in the app (chart.tsx exists in ui/ but isn't used)
  - `react-resizable-panels` — no resizable panels used
  - `embla-carousel-react` — no carousel used
  - `date-fns` — no date formatting in the app
  - `react-hook-form` — no forms using react-hook-form
  - `vaul` — drawer component, likely unused
  - `next-themes` — theme provider not in use
  - Many `@radix-ui/*` packages: `react-aspect-ratio`, `react-avatar`, `react-context-menu`, `react-hover-card`, `react-menubar`, `react-navigation-menu`, etc.
- Flagged by architecture and security reviewers

## Proposed Solutions

### Option A (Recommended): Systematic audit and removal
1. Run `npx depcheck` or manually grep for import usage
2. Remove confirmed-unused packages: `npm uninstall pkg1 pkg2 ...`
3. Verify build still succeeds

- **Effort:** Medium (audit takes time; removals are low-risk)
- **Risk:** Low (verify each removal with a build check)

### Option B: Keep as-is
Vite tree-shakes unused imports, so bundle impact is minimal. Maintenance cost is low.

## Recommended Action

Option A — do a proper depcheck pass. Continuing to remove dead deps (as was done with @tanstack/react-query) is a good pattern.

## Acceptance Criteria

- [ ] `depcheck` or manual audit completed
- [ ] Unused packages removed from package.json
- [ ] `npm run build` succeeds
- [ ] `npm test` passes

## Work Log

- 2026-02-21: Identified by architecture and security reviewers
