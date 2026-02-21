/**
 * Utility functions for handling local storage
 */

import { z } from 'zod';
import { TournamentState } from '@/lib/types';

// Validates the top-level shape of persisted tournament state.
// Uses passthrough() on deep nested objects (blindStructure) to avoid
// mirroring the full type hierarchy. On failure the caller clears storage
// and falls back to defaults, preventing stale shapes from crashing the app.
const TournamentStateSchema = z.object({
  settings: z.object({
    title: z.string(),
    buyInAmount: z.number(),
    reBuyAmount: z.number(),
    rent: z.number().optional(),
    blindStructure: z.object({}).passthrough(),
    prizeDistribution: z.object({
      type: z.enum(['percentage', 'fixed']),
      first: z.number(),
      second: z.number(),
      third: z.number(),
    }),
  }),
  buyIns: z.number(),
  reBuys: z.number(),
  currentLevelId: z.number(),
  isBlindChangeAlert: z.boolean(),
  isPanelOpen: z.boolean(),
});

const STORAGE_KEY = 'poker-tournament-settings';
const TIMER_REMAINING_KEY = 'poker-timer-remaining';

/**
 * Save tournament state to local storage
 */
export const saveTournamentState = (state: TournamentState): void => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
};

/**
 * Load tournament state from local storage.
 * Validates the persisted shape against TournamentStateSchema — if validation
 * fails (e.g. stale state from an older app version), storage is cleared and
 * null is returned so the app falls back to defaults.
 */
export const loadTournamentState = (): TournamentState | null => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (!serializedState) return null;
    const parsed = JSON.parse(serializedState);
    const result = TournamentStateSchema.safeParse(parsed);
    if (!result.success) {
      console.error(
        'Stored tournament state has unexpected shape, resetting:',
        result.error.message,
      );
      clearTournamentState();
      return null;
    }
    return result.data as TournamentState;
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
    return null;
  }
};

/**
 * Clear tournament state from local storage
 */
export const clearTournamentState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TIMER_REMAINING_KEY);
  } catch (error) {
    console.error('Failed to clear state from localStorage:', error);
  }
};

/**
 * Save timer remaining seconds to local storage
 */
export const saveTimerRemaining = (time: number): void => {
  try {
    localStorage.setItem(TIMER_REMAINING_KEY, String(time));
  } catch (error) {
    console.error('Failed to save timer remaining to localStorage:', error);
  }
};

/**
 * Load timer remaining seconds from local storage
 */
export const loadTimerRemaining = (): number | null => {
  try {
    const value = localStorage.getItem(TIMER_REMAINING_KEY);
    if (value === null) return null;
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 0) return null;
    return parsed;
  } catch (error) {
    console.error('Failed to load timer remaining from localStorage:', error);
    return null;
  }
};

/**
 * Clear timer remaining from local storage
 */
export const clearTimerRemaining = (): void => {
  try {
    localStorage.removeItem(TIMER_REMAINING_KEY);
  } catch (error) {
    console.error('Failed to clear timer remaining from localStorage:', error);
  }
};
