import {
  useState,
  useCallback,
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useRef,
} from 'react';
import { BlindLevel, BlindStructure, blindStructures, getNextLevel } from '@/lib/blindStructures';
import { useTimer } from './useTimer';
import { playBlindCountdownSound, playBlindRaiseSound } from '@/lib/audio';
import { useToast } from '@/components/ui/use-toast';
import {
  saveTournamentState,
  loadTournamentState,
  clearTournamentState,
  saveTimerRemaining,
  loadTimerRemaining,
} from '@/lib/storage';

// Define types
export type PrizeDistributionType = 'percentage' | 'fixed';

export interface PrizeDistribution {
  type: PrizeDistributionType;
  first: number;
  second: number;
  third: number;
}

export interface TournamentSettings {
  title: string;
  buyInAmount: number;
  reBuyAmount: number;
  rent: number;
  blindStructure: BlindStructure;
  prizeDistribution: PrizeDistribution;
}

export interface TournamentState {
  settings: TournamentSettings;
  buyIns: number;
  reBuys: number;
  currentLevelId: number;
  isBlindChangeAlert: boolean;
  isPanelOpen: boolean;
}

export interface TournamentContextValue {
  // State
  tournament: TournamentState;
  timer: ReturnType<typeof useTimer>;

  // Current info
  currentLevel: BlindLevel;
  nextLevel: BlindLevel | null;
  prizePool: number;
  prizes: { first: number; second: number; third: number };

  // Actions
  updateSettings: (settings: Partial<TournamentSettings>) => void;
  updateBlindStructure: (structureKey: string) => void;
  addBuyIn: () => void;
  removeBuyIn: () => void;
  addReBuy: () => void;
  removeReBuy: () => void;
  resetCounts: () => void;
  advanceToNextLevel: () => void;
  resetLevels: () => void;
  resetTimer: () => void;
  resetTournament: () => void;
  toggleSettingsPanel: () => void;
  dismissAlert: () => void;

  // Prize distribution
  updatePrizeDistribution: (distribution: Partial<PrizeDistribution>) => void;

  // Custom blind structure management
  updateCustomBlindStructure: (levels: BlindLevel[]) => void;
  addBlindLevel: (level: BlindLevel) => void;
  removeBlindLevel: (levelId: number) => void;
  updateBlindLevel: (levelId: number, field: keyof BlindLevel, value: number) => void;
}

// Default settings
const defaultSettings: TournamentSettings = {
  title: `♣♦ Juldagspokern ${new Date().getFullYear()} ♥♠`,
  buyInAmount: 400,
  reBuyAmount: 400,
  rent: 1500,
  blindStructure: blindStructures.regular,
  prizeDistribution: {
    type: 'percentage',
    first: 60,
    second: 25,
    third: 15,
  },
};

// Create context with a default value
const TournamentContext = createContext<TournamentContextValue | undefined>(undefined);

// Custom hook to use the tournament context
export const useTournament = (): TournamentContextValue => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
};

// Provider component
export const TournamentProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();

  // Initialize tournament state, checking local storage first
  const [tournament, setTournament] = useState<TournamentState>(() => {
    const savedState = loadTournamentState();
    if (savedState) {
      return savedState;
    }
    return {
      settings: defaultSettings,
      buyIns: 0,
      reBuys: 0,
      currentLevelId: 1,
      isBlindChangeAlert: false,
      isPanelOpen: false,
    };
  });

  // Get the current blind level
  const currentLevel =
    tournament.settings.blindStructure.levels.find(
      (level) => level.id === tournament.currentLevelId,
    ) || tournament.settings.blindStructure.levels[0];

  // Get the next blind level (if any)
  const nextLevel = getNextLevel(tournament.settings.blindStructure, tournament.currentLevelId);

  // Compute initial timer value once at mount (restore from localStorage if available)
  const [initialTimeRemaining] = useState(() => {
    return loadTimerRemaining() ?? currentLevel.duration;
  });

  // Track initial mount to skip the duration-reset effect on first render
  const isInitialMount = useRef(true);

  // Track whether the countdown sound has been played for the current level
  const countdownPlayed = useRef(false);

  // Timer setup with callbacks
  const timer = useTimer({
    initialTime: initialTimeRemaining,
    onTick: (remaining) => {
      saveTimerRemaining(remaining);

      // Play countdown sound 4 seconds before blind change
      if (remaining <= 4 && remaining > 0 && !countdownPlayed.current) {
        playBlindCountdownSound();
        countdownPlayed.current = true;
      }
    },
    onTimeChange: (newTime) => {
      saveTimerRemaining(newTime);
    },
    onComplete: () => {
      // When the timer completes, show the blind change alert and play a sound
      setTournament((prev) => ({ ...prev, isBlindChangeAlert: true }));
      playBlindRaiseSound();

      // Show a toast notification
      toast({
        title: 'Blind Level Complete',
        description: nextLevel
          ? `New blinds: ${nextLevel.smallBlind}/${nextLevel.bigBlind}`
          : 'This is the final level',
        variant: 'default',
      });

      // Auto-advance to the next level
      if (nextLevel) {
        advanceToNextLevel();
      }
    },
  });

  // Save tournament state to local storage whenever it changes
  useEffect(() => {
    saveTournamentState(tournament);
  }, [tournament]);

  // Calculate prize pool
  const prizePool = Math.max(
    0,
    tournament.buyIns * tournament.settings.buyInAmount +
      tournament.reBuys * tournament.settings.reBuyAmount -
      tournament.settings.rent,
  );

  // Calculate prizes based on distribution type
  const calculatePrizes = useCallback(() => {
    const { type, first, second, third } = tournament.settings.prizeDistribution;

    if (type === 'percentage') {
      return {
        first: (prizePool * first) / 100,
        second: (prizePool * second) / 100,
        third: (prizePool * third) / 100,
      };
    } else {
      return { first, second, third };
    }
  }, [prizePool, tournament.settings.prizeDistribution]);

  const prizes = calculatePrizes();

  // Update tournament settings
  const updateSettings = useCallback((settings: Partial<TournamentSettings>) => {
    setTournament((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...settings },
    }));
  }, []);

  // Update the blind structure
  const updateBlindStructure = useCallback(
    (structureKey: string) => {
      if (blindStructures[structureKey]) {
        setTournament((prev) => ({
          ...prev,
          settings: {
            ...prev.settings,
            blindStructure: blindStructures[structureKey],
          },
          currentLevelId: 1,
        }));

        // Reset the timer to the new first level's duration
        timer.reset(blindStructures[structureKey].levels[0].duration);
      }
    },
    [timer],
  );

  // Custom blind structure management
  const updateCustomBlindStructure = useCallback((levels: BlindLevel[]) => {
    setTournament((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        blindStructure: {
          ...prev.settings.blindStructure,
          levels,
        },
      },
    }));
  }, []);

  // Add a new blind level
  const addBlindLevel = useCallback((level: BlindLevel) => {
    setTournament((prev) => {
      const updatedLevels = [...prev.settings.blindStructure.levels, level];
      // Sort levels by ID to ensure they appear in order
      updatedLevels.sort((a, b) => a.id - b.id);

      return {
        ...prev,
        settings: {
          ...prev.settings,
          blindStructure: {
            ...prev.settings.blindStructure,
            levels: updatedLevels,
          },
        },
      };
    });
  }, []);

  // Remove a blind level
  const removeBlindLevel = useCallback((levelId: number) => {
    setTournament((prev) => {
      // Don't remove if it's the only level or if it's the current level
      if (prev.settings.blindStructure.levels.length <= 1 || levelId === prev.currentLevelId) {
        return prev;
      }

      const updatedLevels = prev.settings.blindStructure.levels.filter(
        (level) => level.id !== levelId,
      );

      return {
        ...prev,
        settings: {
          ...prev.settings,
          blindStructure: {
            ...prev.settings.blindStructure,
            levels: updatedLevels,
          },
        },
      };
    });
  }, []);

  // Update a specific blind level field
  const updateBlindLevel = useCallback(
    (levelId: number, field: keyof BlindLevel, value: number) => {
      setTournament((prev) => {
        const updatedLevels = prev.settings.blindStructure.levels.map((level) => {
          if (level.id === levelId) {
            return {
              ...level,
              [field]: value,
            };
          }
          return level;
        });

        return {
          ...prev,
          settings: {
            ...prev.settings,
            blindStructure: {
              ...prev.settings.blindStructure,
              levels: updatedLevels,
            },
          },
        };
      });
    },
    [],
  );

  // Add a buy-in
  const addBuyIn = useCallback(() => {
    setTournament((prev) => ({ ...prev, buyIns: prev.buyIns + 1 }));
  }, []);

  // Remove a buy-in
  const removeBuyIn = useCallback(() => {
    setTournament((prev) => ({
      ...prev,
      buyIns: Math.max(0, prev.buyIns - 1),
    }));
  }, []);

  // Add a re-buy
  const addReBuy = useCallback(() => {
    setTournament((prev) => ({ ...prev, reBuys: prev.reBuys + 1 }));
  }, []);

  // Remove a re-buy
  const removeReBuy = useCallback(() => {
    setTournament((prev) => ({
      ...prev,
      reBuys: Math.max(0, prev.reBuys - 1),
    }));
  }, []);

  // Reset buy-in and re-buy counts to zero
  const resetCounts = useCallback(() => {
    setTournament((prev) => ({ ...prev, buyIns: 0, reBuys: 0 }));
  }, []);

  // Reset levels back to level 1
  const resetLevels = useCallback(() => {
    countdownPlayed.current = false;
    setTournament((prev) => ({
      ...prev,
      currentLevelId: 1,
      isBlindChangeAlert: false,
    }));
    timer.reset(tournament.settings.blindStructure.levels[0].duration);
    toast({ title: 'Levels Reset', description: 'Reset to the first level' });
  }, [timer, toast, tournament.settings.blindStructure.levels]);

  // Reset timer to current level's full duration
  const resetCurrentTimer = useCallback(() => {
    countdownPlayed.current = false;
    timer.reset(currentLevel.duration);
    toast({ title: 'Timer Reset', description: 'Timer reset to current level duration' });
  }, [timer, toast, currentLevel.duration]);

  // Advance to the next blind level
  const advanceToNextLevel = useCallback(() => {
    console.log('Advancing to next level');
    if (nextLevel) {
      setTournament((prev) => ({
        ...prev,
        currentLevelId: nextLevel.id,
        isBlindChangeAlert: false,
      }));

      // Reset the countdown sound flag for the new level
      countdownPlayed.current = false;

      // Reset the timer to the new level's duration
      console.log('Resetting timer with duration:', nextLevel.duration);
      timer.reset(nextLevel.duration);

      // Important: We need to ensure the timer starts AFTER the reset is processed
      // Using setTimeout with 0 delay to ensure this runs after the current execution context
      setTimeout(() => {
        console.log('Starting timer after level change');
        timer.start();
      }, 0);

      // Show a toast notification
      toast({
        title: 'New Blind Level',
        description: `Level ${nextLevel.id}: ${nextLevel.smallBlind}/${nextLevel.bigBlind}`,
        variant: 'default',
      });
    }
  }, [nextLevel, timer, toast]);

  // Reset the tournament completely
  const resetTournament = useCallback(() => {
    countdownPlayed.current = false;
    clearTournamentState();

    setTournament({
      settings: defaultSettings,
      buyIns: 0,
      reBuys: 0,
      currentLevelId: 1,
      isBlindChangeAlert: false,
      isPanelOpen: false,
    });

    timer.reset(defaultSettings.blindStructure.levels[0].duration);

    toast({
      title: 'Tournament Completely Reset',
      description: 'All settings restored to defaults',
    });
  }, [timer, toast]);

  // Toggle the settings panel
  const toggleSettingsPanel = useCallback(() => {
    setTournament((prev) => ({ ...prev, isPanelOpen: !prev.isPanelOpen }));
  }, []);

  // Dismiss the blind change alert
  const dismissAlert = useCallback(() => {
    setTournament((prev) => ({ ...prev, isBlindChangeAlert: false }));
  }, []);

  // Update prize distribution
  const updatePrizeDistribution = useCallback((distribution: Partial<PrizeDistribution>) => {
    setTournament((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        prizeDistribution: {
          ...prev.settings.prizeDistribution,
          ...distribution,
        },
      },
    }));
  }, []);

  // Reset timer when current level changes (skip on initial mount to preserve saved time)
  const { reset: timerReset } = timer;
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    timerReset(currentLevel.duration);
  }, [currentLevel.duration, timerReset]);

  // Create the context value
  const contextValue: TournamentContextValue = {
    tournament,
    timer,
    currentLevel,
    nextLevel,
    prizePool,
    prizes,
    updateSettings,
    updateBlindStructure,
    addBuyIn,
    removeBuyIn,
    addReBuy,
    removeReBuy,
    resetCounts,
    resetLevels,
    resetTimer: resetCurrentTimer,
    advanceToNextLevel,
    resetTournament,
    toggleSettingsPanel,
    dismissAlert,
    updatePrizeDistribution,
    updateCustomBlindStructure,
    addBlindLevel,
    removeBlindLevel,
    updateBlindLevel,
  };

  return <TournamentContext.Provider value={contextValue}>{children}</TournamentContext.Provider>;
};
