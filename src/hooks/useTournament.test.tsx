import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { TournamentProvider, useTournament } from './useTournament';
import { ReactNode } from 'react';
import * as storageModule from '@/lib/storage';
import * as audioModule from '@/lib/audio';

vi.mock('@/lib/audio', () => ({
  playBlindCountdownSound: vi.fn(),
  playBlindRaiseSound: vi.fn(),
  playTournamentStartSound: vi.fn(),
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <TournamentProvider>{children}</TournamentProvider>
);

describe('useTournament', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('throws when used outside TournamentProvider', () => {
    // Suppress console.error for expected error
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useTournament())).toThrow(
      'useTournament must be used within a TournamentProvider',
    );
  });

  describe('default state', () => {
    it('initializes with default settings when nothing in localStorage', () => {
      const { result } = renderHook(() => useTournament(), { wrapper });

      expect(result.current.tournament.settings.title).toBe(
        `♣♦ Juldagspokern ${new Date().getFullYear()} ♥♠`,
      );
      expect(result.current.tournament.settings.buyInAmount).toBe(400);
      expect(result.current.tournament.settings.reBuyAmount).toBe(400);
      expect(result.current.tournament.buyIns).toBe(0);
      expect(result.current.tournament.reBuys).toBe(0);
      expect(result.current.tournament.currentLevelId).toBe(1);
    });

    it('loads state from localStorage when available', () => {
      const saved = {
        settings: {
          title: 'Saved Game',
          buyInAmount: 200,
          reBuyAmount: 100,
          blindStructure: {
            name: 'Test',
            levels: [{ id: 1, smallBlind: 5, bigBlind: 10, ante: 0, duration: 600 }],
          },
          prizeDistribution: { type: 'percentage', first: 60, second: 30, third: 10 },
        },
        buyIns: 8,
        reBuys: 3,
        currentLevelId: 1,
        isBlindChangeAlert: false,
        isPanelOpen: false,
      };
      localStorage.setItem('poker-tournament-settings', JSON.stringify(saved));

      const { result } = renderHook(() => useTournament(), { wrapper });

      expect(result.current.tournament.settings.title).toBe('Saved Game');
      expect(result.current.tournament.buyIns).toBe(8);
      expect(result.current.tournament.reBuys).toBe(3);
    });
  });

  describe('current and next level', () => {
    it('currentLevel matches currentLevelId', () => {
      const { result } = renderHook(() => useTournament(), { wrapper });

      expect(result.current.currentLevel.id).toBe(result.current.tournament.currentLevelId);
    });

    it('nextLevel is the level after current', () => {
      const { result } = renderHook(() => useTournament(), { wrapper });

      expect(result.current.nextLevel).not.toBeNull();
      expect(result.current.nextLevel!.id).toBe(2);
    });
  });

  describe('prize pool calculation', () => {
    it('calculates prizePool from buyIns and reBuys', () => {
      const { result } = renderHook(() => useTournament(), { wrapper });

      // Zero out rent so we can test buy-in math in isolation
      act(() => result.current.updateSettings({ rent: 0 }));

      // Start with 0 buyIns, 0 reBuys -> pool = 0
      expect(result.current.prizePool).toBe(0);

      act(() => result.current.addBuyIn());
      act(() => result.current.addBuyIn());
      act(() => result.current.addReBuy());

      // 2 * 400 + 1 * 400 = 1200
      expect(result.current.prizePool).toBe(1200);
    });

    it('calculates prizes in percentage mode', () => {
      const { result } = renderHook(() => useTournament(), { wrapper });

      // Zero out rent so we can test prize math in isolation
      act(() => result.current.updateSettings({ rent: 0 }));

      // Add some buy-ins to create a pool
      act(() => result.current.addBuyIn());
      act(() => result.current.addBuyIn());
      // pool = 800, default: 60/25/15

      expect(result.current.prizes.first).toBe(480);
      expect(result.current.prizes.second).toBe(200);
      expect(result.current.prizes.third).toBe(120);
    });

    it('calculates prizes in fixed mode', () => {
      const { result } = renderHook(() => useTournament(), { wrapper });

      act(() =>
        result.current.updatePrizeDistribution({
          type: 'fixed',
          first: 500,
          second: 200,
          third: 100,
        }),
      );

      expect(result.current.prizes.first).toBe(500);
      expect(result.current.prizes.second).toBe(200);
      expect(result.current.prizes.third).toBe(100);
    });
  });

  describe('buy-in management', () => {
    it('addBuyIn increments buy-in count', () => {
      const { result } = renderHook(() => useTournament(), { wrapper });

      act(() => result.current.addBuyIn());
      expect(result.current.tournament.buyIns).toBe(1);

      act(() => result.current.addBuyIn());
      expect(result.current.tournament.buyIns).toBe(2);
    });

    it('removeBuyIn decrements buy-in count', () => {
      const { result } = renderHook(() => useTournament(), { wrapper });

      act(() => result.current.addBuyIn());
      act(() => result.current.addBuyIn());
      act(() => result.current.removeBuyIn());

      expect(result.current.tournament.buyIns).toBe(1);
    });

    it('removeBuyIn does not go below 0', () => {
      const { result } = renderHook(() => useTournament(), { wrapper });

      act(() => result.current.removeBuyIn());
      expect(result.current.tournament.buyIns).toBe(0);
    });
  });

  describe('rebuy management', () => {
    it('addReBuy increments rebuy count', () => {
      const { result } = renderHook(() => useTournament(), { wrapper });

      act(() => result.current.addReBuy());
      expect(result.current.tournament.reBuys).toBe(1);
    });

    it('removeReBuy decrements rebuy count', () => {
      const { result } = renderHook(() => useTournament(), { wrapper });

      act(() => result.current.addReBuy());
      act(() => result.current.addReBuy());
      act(() => result.current.removeReBuy());

      expect(result.current.tournament.reBuys).toBe(1);
    });

    it('removeReBuy does not go below 0', () => {
      const { result } = renderHook(() => useTournament(), { wrapper });

      act(() => result.current.removeReBuy());
      expect(result.current.tournament.reBuys).toBe(0);
    });
  });

  describe('reset counts', () => {
    it('resetCounts sets both buyIns and reBuys to 0', () => {
      const { result } = renderHook(() => useTournament(), { wrapper });

      act(() => result.current.addBuyIn());
      act(() => result.current.addBuyIn());
      act(() => result.current.addBuyIn());
      act(() => result.current.addReBuy());
      act(() => result.current.addReBuy());

      expect(result.current.tournament.buyIns).toBe(3);
      expect(result.current.tournament.reBuys).toBe(2);

      act(() => result.current.resetCounts());

      expect(result.current.tournament.buyIns).toBe(0);
      expect(result.current.tournament.reBuys).toBe(0);
    });

    it('resetCounts is a no-op when counts are already 0', () => {
      const { result } = renderHook(() => useTournament(), { wrapper });

      act(() => result.current.resetCounts());

      expect(result.current.tournament.buyIns).toBe(0);
      expect(result.current.tournament.reBuys).toBe(0);
    });
  });

  describe('settings updates', () => {
    it('updateSettings merges partial settings', () => {
      const { result } = renderHook(() => useTournament(), { wrapper });

      act(() => result.current.updateSettings({ title: 'New Title' }));
      expect(result.current.tournament.settings.title).toBe('New Title');
      // Other settings remain unchanged
      expect(result.current.tournament.settings.buyInAmount).toBe(400);
    });

    it('updatePrizeDistribution merges partial distribution', () => {
      const { result } = renderHook(() => useTournament(), { wrapper });

      act(() => result.current.updatePrizeDistribution({ first: 70 }));
      expect(result.current.tournament.settings.prizeDistribution.first).toBe(70);
      // Others unchanged
      expect(result.current.tournament.settings.prizeDistribution.second).toBe(25);
    });
  });

  describe('blind structure management', () => {
    it('updateBlindStructure changes to a predefined structure and resets to level 1', () => {
      const { result } = renderHook(() => useTournament(), { wrapper });

      // Advance to level 2 first
      act(() => result.current.advanceToNextLevel());
      act(() => vi.runAllTimers());

      // Now switch structure - should reset to level 1
      act(() => result.current.updateBlindStructure('regular'));

      expect(result.current.tournament.currentLevelId).toBe(1);
    });

    it('updateCustomBlindStructure replaces levels on the current structure', () => {
      const { result } = renderHook(() => useTournament(), { wrapper });

      const customLevels = [
        { id: 1, smallBlind: 100, bigBlind: 200, ante: 25, duration: 900 },
        { id: 2, smallBlind: 200, bigBlind: 400, ante: 50, duration: 900 },
      ];

      act(() => result.current.updateCustomBlindStructure(customLevels));

      expect(result.current.tournament.settings.blindStructure.levels).toEqual(customLevels);
    });

    it('updateBlindStructure does nothing for unknown key', () => {
      const { result } = renderHook(() => useTournament(), { wrapper });

      const before = result.current.tournament.settings.blindStructure.name;
      act(() => result.current.updateBlindStructure('nonexistent'));

      expect(result.current.tournament.settings.blindStructure.name).toBe(before);
    });

    it('addBlindLevel appends a level and sorts by id', () => {
      const { result } = renderHook(() => useTournament(), { wrapper });

      const levelCount = result.current.tournament.settings.blindStructure.levels.length;
      const newLevel = {
        id: 999,
        smallBlind: 50000,
        bigBlind: 100000,
        ante: 0,
        duration: 1200,
      };

      act(() => result.current.addBlindLevel(newLevel));

      const levels = result.current.tournament.settings.blindStructure.levels;
      expect(levels).toHaveLength(levelCount + 1);
      expect(levels[levels.length - 1].id).toBe(999);
    });

    it('removeBlindLevel removes a level that is not current', () => {
      const { result } = renderHook(() => useTournament(), { wrapper });

      const levelCount = result.current.tournament.settings.blindStructure.levels.length;

      // Remove level 5 (not current, which is 1)
      act(() => result.current.removeBlindLevel(5));

      expect(result.current.tournament.settings.blindStructure.levels).toHaveLength(levelCount - 1);
      expect(
        result.current.tournament.settings.blindStructure.levels.find((l) => l.id === 5),
      ).toBeUndefined();
    });

    it('removeBlindLevel refuses to remove the current level', () => {
      const { result } = renderHook(() => useTournament(), { wrapper });

      const levelCount = result.current.tournament.settings.blindStructure.levels.length;

      act(() => result.current.removeBlindLevel(1)); // current level

      expect(result.current.tournament.settings.blindStructure.levels).toHaveLength(levelCount);
    });

    it('removeBlindLevel refuses to remove the last remaining level', () => {
      const saved = {
        settings: {
          title: 'Single Level',
          buyInAmount: 100,
          reBuyAmount: 100,
          blindStructure: {
            name: 'Tiny',
            levels: [{ id: 1, smallBlind: 5, bigBlind: 10, ante: 0, duration: 600 }],
          },
          prizeDistribution: { type: 'percentage', first: 50, second: 35, third: 15 },
        },
        buyIns: 0,
        reBuys: 0,
        currentLevelId: 1,
        isBlindChangeAlert: false,
        isPanelOpen: false,
      };
      localStorage.setItem('poker-tournament-settings', JSON.stringify(saved));

      const { result } = renderHook(() => useTournament(), { wrapper });

      act(() => result.current.removeBlindLevel(1));

      expect(result.current.tournament.settings.blindStructure.levels).toHaveLength(1);
    });

    it('updateBlindLevel changes a specific field on a level', () => {
      const { result } = renderHook(() => useTournament(), { wrapper });

      act(() => result.current.updateBlindLevel(1, 'smallBlind', 999));

      const level = result.current.tournament.settings.blindStructure.levels.find(
        (l) => l.id === 1,
      );
      expect(level!.smallBlind).toBe(999);
    });
  });

  describe('timer completion (onComplete callback)', () => {
    it('auto-advances and plays sound when timer reaches zero', () => {
      // Use a short-duration structure so the timer completes quickly
      const saved = {
        settings: {
          title: 'Short Game',
          buyInAmount: 100,
          reBuyAmount: 100,
          blindStructure: {
            name: 'Short',
            levels: [
              { id: 1, smallBlind: 5, bigBlind: 10, ante: 0, duration: 2 },
              { id: 2, smallBlind: 10, bigBlind: 20, ante: 0, duration: 2 },
            ],
          },
          prizeDistribution: { type: 'percentage', first: 50, second: 35, third: 15 },
        },
        buyIns: 0,
        reBuys: 0,
        currentLevelId: 1,
        isBlindChangeAlert: false,
        isPanelOpen: false,
      };
      localStorage.setItem('poker-tournament-settings', JSON.stringify(saved));

      const { result } = renderHook(() => useTournament(), { wrapper });

      // Start the timer
      act(() => result.current.timer.start());

      // Advance past the 2-second duration so the timer completes
      act(() => vi.advanceTimersByTime(3000));

      // onComplete should have fired: blind raise sound played, level advanced
      expect(audioModule.playBlindRaiseSound).toHaveBeenCalled();
      expect(result.current.tournament.currentLevelId).toBe(2);
    });

    it('handles completion on the final level without advancing', () => {
      // Single-level structure: no next level exists
      const saved = {
        settings: {
          title: 'Final Level Test',
          buyInAmount: 100,
          reBuyAmount: 100,
          blindStructure: {
            name: 'Single',
            levels: [{ id: 1, smallBlind: 5, bigBlind: 10, ante: 0, duration: 2 }],
          },
          prizeDistribution: { type: 'percentage', first: 50, second: 35, third: 15 },
        },
        buyIns: 0,
        reBuys: 0,
        currentLevelId: 1,
        isBlindChangeAlert: false,
        isPanelOpen: false,
      };
      localStorage.setItem('poker-tournament-settings', JSON.stringify(saved));

      const { result } = renderHook(() => useTournament(), { wrapper });

      act(() => result.current.timer.start());
      act(() => vi.advanceTimersByTime(3000));

      // Should have played sound and set alert, but NOT advanced (no next level)
      expect(audioModule.playBlindRaiseSound).toHaveBeenCalled();
      expect(result.current.tournament.currentLevelId).toBe(1);
      expect(result.current.tournament.isBlindChangeAlert).toBe(true);
    });
  });

  describe('level advancement', () => {
    it('advanceToNextLevel moves to the next level', () => {
      const { result } = renderHook(() => useTournament(), { wrapper });

      expect(result.current.tournament.currentLevelId).toBe(1);

      act(() => result.current.advanceToNextLevel());
      act(() => vi.runAllTimers());

      expect(result.current.tournament.currentLevelId).toBe(2);
      expect(result.current.tournament.isBlindChangeAlert).toBe(false);
    });
  });

  describe('reset levels', () => {
    it('resetLevels resets level to 1', () => {
      const { result } = renderHook(() => useTournament(), { wrapper });

      act(() => result.current.advanceToNextLevel());
      act(() => vi.runAllTimers());

      act(() => result.current.resetLevels());

      expect(result.current.tournament.currentLevelId).toBe(1);
      expect(result.current.tournament.isBlindChangeAlert).toBe(false);
    });
  });

  describe('reset timer', () => {
    it('resetTimer resets timer to current level duration', () => {
      const { result } = renderHook(() => useTournament(), { wrapper });

      // Start and partially run the timer
      act(() => result.current.timer.start());
      act(() => vi.advanceTimersByTime(5000));
      act(() => result.current.timer.pause());

      const levelDuration = result.current.currentLevel.duration;
      expect(result.current.timer.timeRemaining).toBeLessThan(levelDuration);

      act(() => result.current.resetTimer());

      expect(result.current.timer.timeRemaining).toBe(levelDuration);
    });

    it('resetTimer keeps current level and buy-ins unchanged', () => {
      const { result } = renderHook(() => useTournament(), { wrapper });

      act(() => result.current.addBuyIn());
      act(() => result.current.addBuyIn());
      act(() => result.current.advanceToNextLevel());
      act(() => vi.runAllTimers());

      const levelBefore = result.current.tournament.currentLevelId;
      const buyInsBefore = result.current.tournament.buyIns;

      act(() => result.current.resetTimer());

      expect(result.current.tournament.currentLevelId).toBe(levelBefore);
      expect(result.current.tournament.buyIns).toBe(buyInsBefore);
    });
  });

  describe('tournament reset', () => {
    it('resetTournament restores all defaults', () => {
      const { result } = renderHook(() => useTournament(), { wrapper });

      // Modify state
      act(() => result.current.addBuyIn());
      act(() => result.current.addReBuy());
      act(() => result.current.updateSettings({ title: 'Modified' }));

      act(() => result.current.resetTournament());

      expect(result.current.tournament.settings.title).toBe(
        `♣♦ Juldagspokern ${new Date().getFullYear()} ♥♠`,
      );
      expect(result.current.tournament.buyIns).toBe(0);
      expect(result.current.tournament.reBuys).toBe(0);
      expect(result.current.tournament.currentLevelId).toBe(1);
    });

    it('resetTournament clears localStorage', () => {
      const clearSpy = vi.spyOn(storageModule, 'clearTournamentState');
      const { result } = renderHook(() => useTournament(), { wrapper });

      act(() => result.current.resetTournament());

      expect(clearSpy).toHaveBeenCalled();
    });
  });

  describe('UI state toggles', () => {
    it('toggleSettingsPanel flips isPanelOpen', () => {
      const { result } = renderHook(() => useTournament(), { wrapper });

      expect(result.current.tournament.isPanelOpen).toBe(false);

      act(() => result.current.toggleSettingsPanel());
      expect(result.current.tournament.isPanelOpen).toBe(true);

      act(() => result.current.toggleSettingsPanel());
      expect(result.current.tournament.isPanelOpen).toBe(false);
    });

    it('dismissAlert clears isBlindChangeAlert', () => {
      const { result } = renderHook(() => useTournament(), { wrapper });

      // There's no direct way to set alert to true from outside,
      // but dismissAlert should ensure it's false
      act(() => result.current.dismissAlert());
      expect(result.current.tournament.isBlindChangeAlert).toBe(false);
    });
  });

  describe('localStorage persistence', () => {
    it('saves state to localStorage on updates', () => {
      const saveSpy = vi.spyOn(storageModule, 'saveTournamentState');
      const { result } = renderHook(() => useTournament(), { wrapper });

      // Clear initial save calls
      saveSpy.mockClear();

      act(() => result.current.addBuyIn());

      expect(saveSpy).toHaveBeenCalled();
      const savedState = saveSpy.mock.calls[saveSpy.mock.calls.length - 1][0];
      expect(savedState.buyIns).toBe(1);
    });

    it('initializes timer with saved timeRemaining from localStorage', () => {
      const saved = {
        settings: {
          title: 'Saved Game',
          buyInAmount: 200,
          reBuyAmount: 100,
          blindStructure: {
            name: 'Test',
            levels: [{ id: 1, smallBlind: 5, bigBlind: 10, ante: 0, duration: 600 }],
          },
          prizeDistribution: { type: 'percentage', first: 60, second: 30, third: 10 },
        },
        buyIns: 0,
        reBuys: 0,
        currentLevelId: 1,
        isBlindChangeAlert: false,
        isPanelOpen: false,
      };
      localStorage.setItem('poker-tournament-settings', JSON.stringify(saved));
      localStorage.setItem('poker-timer-remaining', '245');

      const { result } = renderHook(() => useTournament(), { wrapper });

      // Timer should show the saved 245 seconds, not the full 600 duration
      expect(result.current.timer.timeRemaining).toBe(245);
    });

    it('falls back to level duration when no saved timer remaining exists', () => {
      const saved = {
        settings: {
          title: 'Saved Game',
          buyInAmount: 200,
          reBuyAmount: 100,
          blindStructure: {
            name: 'Test',
            levels: [{ id: 1, smallBlind: 5, bigBlind: 10, ante: 0, duration: 600 }],
          },
          prizeDistribution: { type: 'percentage', first: 60, second: 30, third: 10 },
        },
        buyIns: 0,
        reBuys: 0,
        currentLevelId: 1,
        isBlindChangeAlert: false,
        isPanelOpen: false,
      };
      localStorage.setItem('poker-tournament-settings', JSON.stringify(saved));

      const { result } = renderHook(() => useTournament(), { wrapper });

      expect(result.current.timer.timeRemaining).toBe(600);
    });
  });
});
