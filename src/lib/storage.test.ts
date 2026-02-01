import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  saveTournamentState,
  loadTournamentState,
  clearTournamentState,
  saveTimerRemaining,
  loadTimerRemaining,
  clearTimerRemaining,
} from './storage';
import { TournamentState } from '@/hooks/useTournament';

const makeTournamentState = (overrides?: Partial<TournamentState>): TournamentState => ({
  settings: {
    title: 'Test Tournament',
    buyInAmount: 400,
    reBuyAmount: 400,
    blindStructure: {
      name: 'Test',
      levels: [{ id: 1, smallBlind: 10, bigBlind: 20, ante: 0, duration: 1200 }],
    },
    prizeDistribution: { type: 'percentage', first: 50, second: 35, third: 15 },
  },
  buyIns: 5,
  reBuys: 2,
  currentLevelId: 1,
  isBlindChangeAlert: false,
  isPanelOpen: false,
  ...overrides,
});

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('saveTournamentState', () => {
    it('serializes and stores state under the correct key', () => {
      const state = makeTournamentState();
      saveTournamentState(state);

      const raw = localStorage.getItem('poker-tournament-settings');
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw!)).toEqual(state);
    });

    it('overwrites previously saved state', () => {
      saveTournamentState(makeTournamentState({ buyIns: 3 }));
      saveTournamentState(makeTournamentState({ buyIns: 7 }));

      const loaded = JSON.parse(localStorage.getItem('poker-tournament-settings')!);
      expect(loaded.buyIns).toBe(7);
    });

    it('handles localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceeded');
      });

      saveTournamentState(makeTournamentState());

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save state to localStorage:',
        expect.any(Error),
      );
    });
  });

  describe('loadTournamentState', () => {
    it('returns the saved state when present', () => {
      const state = makeTournamentState({ buyIns: 10 });
      localStorage.setItem('poker-tournament-settings', JSON.stringify(state));

      expect(loadTournamentState()).toEqual(state);
    });

    it('returns null when nothing is saved', () => {
      expect(loadTournamentState()).toBeNull();
    });

    it('returns null when stored JSON is invalid', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      localStorage.setItem('poker-tournament-settings', '{invalid json');

      expect(loadTournamentState()).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('clearTournamentState', () => {
    it('removes the saved state', () => {
      localStorage.setItem('poker-tournament-settings', '{}');
      clearTournamentState();

      expect(localStorage.getItem('poker-tournament-settings')).toBeNull();
    });

    it('does not throw when key does not exist', () => {
      expect(() => clearTournamentState()).not.toThrow();
    });

    it('handles localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('SecurityError');
      });

      clearTournamentState();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to clear state from localStorage:',
        expect.any(Error),
      );
    });

    it('also clears timer remaining', () => {
      localStorage.setItem('poker-timer-remaining', '42');
      clearTournamentState();

      expect(localStorage.getItem('poker-timer-remaining')).toBeNull();
    });
  });

  describe('saveTimerRemaining', () => {
    it('stores the time under the correct key', () => {
      saveTimerRemaining(300);

      expect(localStorage.getItem('poker-timer-remaining')).toBe('300');
    });

    it('overwrites previously saved value', () => {
      saveTimerRemaining(300);
      saveTimerRemaining(150);

      expect(localStorage.getItem('poker-timer-remaining')).toBe('150');
    });

    it('handles localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceeded');
      });

      saveTimerRemaining(300);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save timer remaining to localStorage:',
        expect.any(Error),
      );
    });
  });

  describe('loadTimerRemaining', () => {
    it('returns the saved value when present', () => {
      localStorage.setItem('poker-timer-remaining', '42');

      expect(loadTimerRemaining()).toBe(42);
    });

    it('returns null when nothing is saved', () => {
      expect(loadTimerRemaining()).toBeNull();
    });

    it('returns null for non-numeric values', () => {
      localStorage.setItem('poker-timer-remaining', 'abc');

      expect(loadTimerRemaining()).toBeNull();
    });

    it('returns null for negative values', () => {
      localStorage.setItem('poker-timer-remaining', '-5');

      expect(loadTimerRemaining()).toBeNull();
    });
  });

  describe('clearTimerRemaining', () => {
    it('removes the saved timer remaining', () => {
      localStorage.setItem('poker-timer-remaining', '42');
      clearTimerRemaining();

      expect(localStorage.getItem('poker-timer-remaining')).toBeNull();
    });

    it('does not throw when key does not exist', () => {
      expect(() => clearTimerRemaining()).not.toThrow();
    });

    it('handles localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('SecurityError');
      });

      clearTimerRemaining();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to clear timer remaining from localStorage:',
        expect.any(Error),
      );
    });
  });
});
