import { useState, useEffect } from 'react';
import { useTournament } from '@/hooks/useTournament';

const BlindDisplay = () => {
  const { tournament, currentLevel, nextLevel } = useTournament();
  const { isBlindChangeAlert } = tournament;

  // Animation states
  const [animate, setAnimate] = useState(false);

  // Set up blind change alert animation
  useEffect(() => {
    if (isBlindChangeAlert) {
      const interval = setInterval(() => {
        setAnimate((prev) => !prev);
      }, 500);

      return () => clearInterval(interval);
    } else {
      setAnimate(false);
    }
  }, [isBlindChangeAlert]);

  return (
    <div className="flex flex-col space-y-6 items-center h-full justify-center">
      {/* Current Blinds */}
      <div
        className={`glass p-6 rounded-2xl transition-all duration-300 transform w-full
          ${isBlindChangeAlert ? 'animate-pulse-alert scale-105 bg-poker-red/10 border-poker-red/30' : ''}
        `}
      >
        <div className="text-sm uppercase tracking-wide text-muted-foreground mb-2">
          Current Blinds
        </div>
        <div className="text-5xl md:text-6xl font-semibold text-poker-gold">
          {currentLevel.smallBlind} / {currentLevel.bigBlind}
        </div>
        {currentLevel.ante > 0 && (
          <div className="text-sm mt-2 text-muted-foreground">Ante: {currentLevel.ante}</div>
        )}
      </div>

      {/* Next Blinds */}
      {nextLevel && (
        <div className="glass p-4 rounded-xl transition-all duration-300 w-full">
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
            Next Level
          </div>
          <div className="text-xl md:text-2xl font-medium">
            {nextLevel.smallBlind} / {nextLevel.bigBlind}
          </div>
          {nextLevel.ante > 0 && (
            <div className="text-xs mt-1 text-muted-foreground">Ante: {nextLevel.ante}</div>
          )}
        </div>
      )}

      {/* Level Indicator */}
      <div className="flex items-center justify-center space-x-1">
        <div className="px-3 py-1 bg-secondary rounded-full text-sm font-medium">
          Level {currentLevel.id}
        </div>
        {nextLevel && (
          <>
            <span className="text-muted-foreground">•</span>
            <div className="text-muted-foreground text-sm">Next: Level {nextLevel.id}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default BlindDisplay;
