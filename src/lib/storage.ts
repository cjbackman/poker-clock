/**
 * Utility functions for handling local storage
 */

import { TournamentState } from '@/hooks/useTournament';

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
 * Load tournament state from local storage
 */
export const loadTournamentState = (): TournamentState | null => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (!serializedState) return null;
    return JSON.parse(serializedState);
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
