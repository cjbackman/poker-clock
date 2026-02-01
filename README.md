# Poker Tournament Timer

A professional poker tournament timer and management application.

- [Demo](https://cjbackman.github.io/poker-clock)

## Usage

The timer supports keyboard shortcuts:

- **Spacebar**: Play/pause the timer

Tournament organizers can manage:

- Buy-in amounts and rebuys
- Blind structures (predefined or custom)
- Prize pool distribution

## Repository Navigation

This application is built with Vite, React, TypeScript, and Tailwind CSS. Here's a guide to the most important directories and files:

### Core Components

- `src/App.tsx` - Main application component
- `src/components/Layout.tsx` - Page layout and structure
- `src/components/Timer.tsx` - Tournament timer logic and display
- `src/components/BlindDisplay.tsx` - Displays current and next blind levels
- `src/components/PrizePool.tsx` - Shows prize distribution
- `src/components/BuyInsPanel.tsx` - Manages tournament buy-ins
- `src/components/OrganizerPanel.tsx` - Settings panel for tournament organizers

### State Management

- `src/hooks/useTournament.tsx` - Main tournament state and functions
- `src/hooks/useTimer.tsx` - Timer logic and controls

### Utilities

- `src/lib/blindStructures.ts` - Predefined blind structures
- `src/lib/audio.ts` - Audio effects for timer events
- `src/lib/timerUtils.ts` - Utility functions for timer-related operations

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
