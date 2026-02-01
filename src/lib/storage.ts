/**
 * Utility functions for handling local storage
 */

import { TournamentState } from '@/hooks/useTournament';

const STORAGE_KEY = 'poker-tournament-settings';

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
  } catch (error) {
    console.error('Failed to clear state from localStorage:', error);
  }
};
