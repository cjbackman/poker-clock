# Juldagspokern Clock

- [Poker Clock](https://cjbackman.github.io/poker-clock)

## Usage

The timer supports keyboard shortcuts:

- **Spacebar**: Play/pause the timer

Tournament organizers can manage:

- Buy-in amounts, rebuys, and rent
- Blind structures (predefined or custom)
- Prize pool distribution
- Starting chip stack

## Repository Navigation

This application is built with Vite, React, TypeScript, and Tailwind CSS. Here's a guide to the most important directories and files:

### Core Components

- `src/App.tsx` - Application providers and layout wrapper
- `src/pages/Index.tsx` - Main page layout and structure
- `src/components/Timer.tsx` - Tournament timer with blind level display
- `src/components/PrizePool.tsx` - Shows prize distribution
- `src/components/EntriesPanel.tsx` - Manages buy-ins and rebuys
- `src/components/StartStack.tsx` - Displays starting chip stack breakdown
- `src/components/TournamentTitle.tsx` - Editable tournament title
- `src/components/OrganizerPanel.tsx` - Settings panel for tournament organizers

### State Management

- `src/hooks/useTournament.tsx` - Main tournament state and functions
- `src/hooks/useTimer.tsx` - Timer logic and controls
- `src/hooks/useKeyboardControls.tsx` - Keyboard shortcut handling

### Utilities

- `src/lib/blindStructures.ts` - Predefined blind structures
- `src/lib/chips.ts` - Chip denominations and starting stack total
- `src/lib/audio.ts` - Audio effects for timer events
- `src/lib/timerUtils.ts` - Utility functions for timer-related operations
- `src/lib/storage.ts` - localStorage persistence for tournament state

## Install

```sh
npm i
```

## Test

This project uses Vitest and React Testing Library for unit and integration testing.

### Running Tests

```sh
# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Generate test coverage report
npm run test:coverage
```

### Test Files

Test files are co-located with the source files they test, using the `.test.tsx` or `.test.ts` extension.

## Run

```sh
npm run dev
```

## Deploy

The app is hosted on [GitHub Pages](https://cjbackman.github.io/poker-clock) as a fully client-side application.

To deploy:

```sh
npm run deploy
```

This runs `vite build` (with production base path `/poker-clock/`) and pushes the `dist/` folder to the `gh-pages` branch via the `gh-pages` package.
